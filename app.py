# Load .env file first
from dotenv import load_dotenv
if not load_dotenv():
    raise Exception("Failed to load .env file")
#------------------------------------ .env file loaded------------------------------------
from flask import Flask, render_template, request, redirect, make_response, Blueprint, g
from flask_executor import Executor
from api import *
from settings import *

#------------------------------------ App ------------------------------------
class TukTukBot(Flask):
    executor = None
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.executor = Executor(self)
        Server.init()

app = TukTukBot(__name__)


#------------------------------------Config------------------------------------
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['EXECUTOR_PROPAGATE_EXCEPTIONS'] = True
app.config['EXECUTOR_MAX_WORKERS'] = 2
app.config['EXECUTOR_TYPE'] = 'thread'
app.config['EXECUTOR_MAX_TASKS'] = 2
app.config['EXECUTOR_THREAD_NAME_PREFIX'] = 'TukTukBot'
app.config['EXECUTOR_LOGGING_LEVEL'] = logging.INFO



#------------------------------------ Web ------------------------------------
@app.route('/')
def index():
    # Check if user is logged in
    user = User.logged_in_user(request.cookies)
    stats = None
    if user:
        stats = Server.get_stats()
    return render_template('index.html', user=user, stats=stats)

#------------------------------------ Tool Interface ------------------------------------
@app.route("/interface")
def interface():
    if not User.logged_in_user(request.cookies):
        return redirect(User.generate_login_url( '/interface'))
    return render_template('interface.html', countries=AVAILABLE_COUNTRY, wikis=AVAILABLE_WIKI, topics=AVAILABLE_TOPICS)

#------------------------------------ OAuth2 Callback ------------------------------------
@app.route("/user/callback")
def login():
    cookie_name, cookie_value, redirect_uri = User.generate_access_token(request.args)
    response = make_response(redirect(redirect_uri))
    response.set_cookie(cookie_name, cookie_value)
    return response

#------------------------------------ Logout ------------------------------------
@app.post("/user/logout")
def logout():
    cookie_name, cookie_value, redirect_uri = User.logout()
    response = make_response(redirect(redirect_uri))
    response.set_cookie(cookie_name, '', expires=0)
    return response



#------------------------------------ API ------------------------------------
api = Blueprint('api', __name__, url_prefix='/api')


#------------------------------------ Check if user is logged in ------------------------------------
@api.before_request
def before_request():
    g.user = User.logged_in_user(request.cookies)
    if not g.user:
        return NOT_LOGGED_IN_MESSAGE
    

#------------------------------------ Fetch Subcategories ------------------------------------
@api.get("/subcat/<string:cat>")
def subcat(cat):
    cats = fetch_subcats(cat)
    return {
        "status": "success",
        "data": cats
    }
#------------------------------------ Fetch Subcategories ------------------------------------




#------------------------------------ Create Topic ------------------------------------
@api.route('/topic')
def create_topic():
    if User.has_access(g.user['rights'], User.RIGHTS['topic']) == False:
        return NOT_AUTHORIZED_MESSAGE
    with Server.get_parmanent_db() as conn:
        topic_id = Topic.create(conn, title=request.args.get('title', ''), country='BD')
    return {
        "status": "success",
        "data": {
            'id' : topic_id
        }
    }
#------------------------------------ Create Topic ------------------------------------



#------------------------------------ Fetch Topic ------------------------------------
@api.get("/topic/<string:topic>/<string:country>")
def topic(topic, country):
    if User.has_access(g.user['rights'], User.RIGHTS['topic']) == False:
        return NOT_AUTHORIZED_MESSAGE
    topic_title = f"{topic}/{country}"
    cats = []
    with Server.get_parmanent_db() as conn:
        cats = Category.get_by_topic_title(conn, topic_title)
    return {
        "status": "success",
        "data": [dict(cat) for cat in cats]
    }
#------------------------------------ Fetch Topic ------------------------------------



#------------------------------------ Create Task ------------------------------------
@api.post("/task")
def create_task():
    if User.has_access(g.user['rights'], User.RIGHTS['task']) == False:
        return NOT_AUTHORIZED_MESSAGE
    data : dict = request.json
    homewiki = data.get('homewiki', 'en')
    country = data.get('country', 'IN')
    topic = data.get('topic', 'folklore')
    topic_title = f"{topic}/{country}"
    cats = data['categories']
    user = g.user
    task_id = 0
    with Server.get_parmanent_db() as conn:
        task_id = Task.create(
            conn,
            topic_title=topic_title,
            task_data="|".join(cats),
            home_wiki=homewiki,
            target_wiki=homewiki,
            country=country,
            category_count=len(cats),
            submitted_by=user['id'],
        )
    app.executor.submit(execute_task, task_id, cats)
    return {
        "status": "success",
        "data": {
            'id' : task_id,
            'status' : 'done'
        }
    }
#------------------------------------ Fetch Task ------------------------------------
@api.get("/task/<int:task_id>")
def get_task(task_id):
    if User.has_access(g.user['rights'], User.RIGHTS['task']) == False:
        return NOT_AUTHORIZED_MESSAGE
    with Server.get_parmanent_db() as db:
        task = Task.get_by_id(db, task_id)
    return {
        "status": "success",
        "data": task and dict(task)
    }
#------------------------------------ Fetch Task ------------------------------------



# ------------------------------------ Fetch Public Stats ------------------------------------
@api.get('/stats')
def get_stats():
    if User.has_access(g.user['rights'], User.RIGHTS['stats']) == False:
        # Give public stats
        stats = Server.get_stats()
    else:
        # Give private stats
        stats = Server.get_stats()
    return {
        "status": "success",
        "data": stats
    }
# ------------------------------------ Fetch Public Stats ------------------------------------



#------------------------------------ Export Task Result  ------------------------------------
@api.get("/task/<int:task_id>/export/<string:format>")
def export_task(task_id, format):
    if User.has_access(g.user['rights'], User.RIGHTS['task']) == False:
        return NOT_AUTHORIZED_MESSAGE
    assert format in ['json', 'csv', 'wikitext']
    if format == 'json':
        return {
            "status": "success",
            "data": get_task_result(task_id, 'json')
        }
    elif format == 'csv':
        return {
            "status": "success",
            "data": get_task_result(task_id, 'csv')
        }
    elif format == 'wikitext':
        return {
            "status": "success",
            "data": get_task_result(task_id, 'wikitext')
        }
#------------------------------------ Export Task Result  ------------------------------------

app.register_blueprint(api)
if __name__ == '__main__':
    app.run(port=5000)
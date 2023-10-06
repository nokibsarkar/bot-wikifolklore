# Load .env file first
from dotenv import load_dotenv
if not load_dotenv():
    raise Exception("Failed to load .env file")
#------------------------------------ .env file loaded------------------------------------
from flask import Flask, render_template, request, redirect, make_response, Blueprint, g
from flask_executor import Executor
from api import api, Server, User, logging, os
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

app.register_blueprint(api)


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
        return redirect(User.generate_login_url( '/tuktukbot'))
    return render_template('interface.html',
                           countries=AVAILABLE_COUNTRY,
                           wikis=AVAILABLE_WIKI,
                           topics=AVAILABLE_TOPICS
                    )
@app.route("/tuktukbot")
def tuktukbot():
    if not User.logged_in_user(request.cookies):
        return redirect(User.generate_login_url( '/tuktukbot'))
    return render_template('interface.html',
                           countries=AVAILABLE_COUNTRY,
                           wikis=AVAILABLE_WIKI,
                           topics=AVAILABLE_TOPICS
                    )
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




if __name__ == '__main__':
    app.run(port=5000)
from flask import Flask, render_template, request
from flask_executor import Executor
from api2 import fetch_subcats, submit_task, get_task_result, get_task as fetch_task, init_db, get_topic_cats
from settings import AVAILABLE_COUNTRY, AVAILABLE_WIKI, AVAILABLE_TOPICS

class TukTukBot(Flask):
    executor = None
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.executor = Executor(self)
        # Stop logging
        # self.logger.disabled = True
        init_db()
    def run(self, *args, **kwargs):
        super().run(*args, **kwargs)


        
app = TukTukBot(__name__)
@app.route('/')
def index():
    return render_template('index.html')
@app.route("/interface")
def interface():
    return render_template('interface.html', countries=AVAILABLE_COUNTRY, wikis=AVAILABLE_WIKI, topics=AVAILABLE_TOPICS)
@app.get("/api/subcat/<string:cat>")
def subcat(cat):
    cats = fetch_subcats(cat)
    return {
        "status": "success",
        "data": cats
    }

@app.get("/api/topic/<string:topic>/<string:country>")
def topic(topic, country):
    topic_title = f"{topic}/{country}"
    cats = get_topic_cats(topic_title)
    return {
        "status": "success",
        "data": [dict(cat) for cat in cats]
    }
@app.post("/api/task")
def create_task():
    data : dict = request.json
    homewiki = data.get('homewiki', 'en')
    country = data.get('country', 'IN')
    topic = data.get('topic', 'folklore')
    topic_title = f"{topic}/{country}"
    cats = data['categories']
    task_id = submit_task(
        topic_title=topic_title,
        cats=cats,
        home_wiki=homewiki,
        country=country,
        target_wiki=homewiki,
        executor=app.executor
    )
    return {
        "status": "success",
        "data": {
            'id' : task_id,
            'status' : 'done'
        }
    }
@app.get("/api/task/<int:task_id>")
def get_task(task_id):
    task = fetch_task(task_id)
    return {
        "status": "success",
        "data": dict(task)
    }



@app.get("/api/task/<int:task_id>/export/<string:format>")
def export_task(task_id, format):
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
if __name__ == '__main__':
    app.run(port=5000)
from fastapi import Body, APIRouter
from typing import Union
from schema import *
api = APIRouter()
#------------------------------------ Fetch Subcategories ------------------------------------
@api.get("/subcat/{parent_category}", tags=["subcategory"], response_model=ResponseMultiple[Category])
def subcategories(parent_category : str):
    """
    Fetch All the subcategories of a certain category.
    """
    cats = fetch_subcats(parent_category)
    return {
        "status": "success",
        "data": cats
    }
#------------------------------------ Fetch Subcategories ------------------------------------




#------------------------------------ Create Topic ------------------------------------
@api.post('/topic', response_model=ResponseSingle[Topic])
def create_topic(topic : TopicCreate = Body(...)):
    """
    Create a topic with categories and country
    """
    try:
        # if User.has_access(g.user['rights'], User.RIGHTS['topic']) == False:
        #     return NOT_AUTHORIZED_MESSAGE
        data = request.json
        raw_title = data.get('title', None) or request.args.get('title', None)
        assert raw_title is not None, "Title is required"
        assert type(raw_title) == str, "Title must be a string"
        assert len(raw_title) > 0, "Title must not be empty"
        assert "/" in raw_title, "Title must contain '/'"
        country = raw_title.split("/")[1]
        categories = data.get('categories', None) or ["Category:Hello"]
        assert categories is not None, "Categories is required"
        assert type(categories) == list, "Categories must be a list"
        assert len(categories) > 0, "Categories must not be empty"
        assert all([type(cat) == dict for cat in categories]), "All categories must be dictionary or Object of Category i.e have title and id"
        
        with Server.get_parmanent_db() as conn:
            topic_id = Topic.create(conn, title=raw_title, country=country)
            Topic.add_categories(conn, topic_id=topic_id, categories=categories)
            conn.commit()
            categories = Category.get_by_topic_id(conn, topic_id)
        return {
            "status": "success",
            "data": {
                'id' : topic_id,
                'title' : raw_title,
                'categories' : [dict(cat) for cat in categories]
            }
        }
    except Exception as e:
        logging.exception(e)
        return {
            "status": "error",
            "message": str(e)
        }
#------------------------------------ Create Topic ------------------------------------

#------------------------------------ Update Topic ------------------------------------
@api.post('/topic/{topic_id}', response_model=ResponseSingle[Topic])
def update_topic(topic_id : int, topic : TopicUpdate = Body(...) ):
    try:
        # if User.has_access(g.user['rights'], User.RIGHTS['topic']) == False:
        #     return NOT_AUTHORIZED_MESSAGE
        data : dict = request.json
        title = data.get('title', None) or request.args.get('title', None)
        categories = data.get('categories', None)
        if title:
            assert type(title) == str, "Title must be a string"
            assert len(title) > 0, "Title must not be empty"
            assert "/" in title, "Title must contain '/'"
        if categories:
            assert categories is not None, "Categories is required"
            assert type(categories) == list, "Categories must be a list"
            assert len(categories) > 0, "Categories must not be empty"
        with Server.get_parmanent_db() as conn:
            # if title:
            #     Topic.update_title(conn, topic_id=topic_id, title=title)
            if categories:
                added, removed = Topic.update_categories(conn, topic_id=topic_id, categories=categories)
            conn.commit()
            topic = Topic.get_by_id(conn, topic_id)
            updated_categories = Category.get_by_topic_id(conn, topic_id)
        return {
            "status": "success",
            "data": {
                'id' : topic_id,
                'title' : topic['title'],
                'categories' : [dict(cat) for cat in updated_categories],
                'added' : added,
                'removed' : removed
            }
        }
    except Exception as e:
        logging.exception(e)
        return {
            "status": "error",
            "message": str(e)
        }
#------------------------------------ Update Topic ------------------------------------
#------------------------------------ Fetch Available Countries ------------------------------------
@api.get("/topic/{topic_prefix}", response_model=ResponseMultiple[Country])
def get_countries(topic_prefix : str):
    try:
        assert type(topic_prefix) == str, "Topic prefix must be a string"
        assert len(topic_prefix) > 0, "Topic prefix must not be empty"
        assert "/" not in topic_prefix, "Topic prefix must not contain '/'"
        if User.has_access(g.user['rights'], User.RIGHTS['task']) == False:
            return NOT_AUTHORIZED_MESSAGE
        countries = []
        with Server.get_parmanent_db() as conn:
            countries = Topic.get_countries(conn, topic_prefix)
        return {
            "status": "success",
            "data": {
                'countries' : countries,
                "prefix" : topic_prefix
            }
        }
    except Exception as e:
        logging.exception(e)
        return {
            "status": "error",
            "message": str(e)
        }


#------------------------------------ Fetch Topic Categories ------------------------------------
@api.get("/topic/{topic}/{country}", response_model=ResponseMultiple[Category])
def topic_categories(topic : str, country : Country):
    if User.has_access(g.user['rights'], User.RIGHTS['task']) == False:
        return NOT_AUTHORIZED_MESSAGE
    topic_title = f"{topic}/{country}"
    cats = []
    with Server.get_parmanent_db() as conn:
        cats = Category.get_by_topic_title(conn, topic_title)
    return {
        "status": "success",
        "data": [dict(cat) for cat in cats]
    }
#------------------------------------ Fetch Topic Categories ------------------------------------



#------------------------------------ Create Task ------------------------------------
@api.post("/task", response_model=ResponseSingle[Task])
def create_task(task : TaskCreate = Body(...)):
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
    current_app.executor.submit(execute_task, task_id, cats)
    return {
        "status": "success",
        "data": {
            'id' : task_id,
            'status' : 'done'
        }
    }
#------------------------------------ Fetch Task ------------------------------------
@api.get("/task/{task_id}", response_model=ResponseSingle[Task])
def get_task(task_id : int):
    if User.has_access(g.user['rights'], User.RIGHTS['task']) == False:
        return NOT_AUTHORIZED_MESSAGE
    with Server.get_parmanent_db() as db:
        task = Task.get_by_id(db, task_id)
    return {
        "status": "success",
        "data": task and dict(task)
    }
#------------------------------------ Fetch Task ------------------------------------





#------------------------------------ Export Task Result  ------------------------------------
@api.get("/task/{task_id}/export/{format}", response_model=ResponseSingle[Union[str, List[Article]]])
def export_task(task_id : int, format : TaskResultFormat = TaskResultFormat.json):
    if User.has_access(g.user['rights'], User.RIGHTS['task']) == False:
        return NOT_AUTHORIZED_MESSAGE
    if format == TaskResultFormat.json:
        return {
            "status": "success",
            "data": get_task_result(task_id, 'json')
        }
    elif format == TaskResultFormat.csv:
        return {
            "status": "success",
            "data": get_task_result(task_id, 'csv')
        }
    elif format == TaskResultFormat.wikitext:
        return {
            "status": "success",
            "data": get_task_result(task_id, 'wikitext')
        }
#------------------------------------ Export Task Result  ------------------------------------

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


__all__ = api
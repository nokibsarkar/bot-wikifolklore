from fastapi import Body, APIRouter, Depends, Request, status, HTTPException

from authentication import authenticate
import logging
from _api import *
from schema import *
from models import *
api = APIRouter(dependencies=[Depends(authenticate)])
#------------------------------------ Fetch Subcategories ------------------------------------
@api.get("/subcat/{parent_category}", tags=["subcategory"], response_model=ResponseMultiple[CategoryScheme])
def subcategories(parent_category : str):
    """
    Fetch All the subcategories of a certain category.
    """
    cats = fetch_subcats(parent_category)
    return ResponseMultiple[CategoryScheme](
        success=True,
        data=[CategoryScheme(**cat) for cat in cats]
    )
#------------------------------------ Fetch Subcategories ------------------------------------




#------------------------------------ Create Topic ------------------------------------
@api.post('/topic', response_model=ResponseSingle[TopicScheme])
def create_topic(topic : TopicCreate = Body(...)):
    """
    Create a topic with categories and country
    """
    try:
        # if User.has_access(req.state.user['rights'], User.RIGHTS['topic']) == False:
        #     return NOT_AUTHORIZED_MESSAGE
        raw_title = topic.title
        country = topic.country
        categories = topic.categories
        
        with Server.get_parmanent_db() as conn:
            cur = conn.cursor()
            topic_id = Topic.create(cur, title=raw_title, country=country)
            Topic.add_categories(cur, topic_id=topic_id, categories=categories)
            conn.commit()
            categories = Category.get_by_topic_id(cur, topic_id)
            new_topic = Topic.get_by_id(cur, topic_id)
        response = ResponseSingle[TopicScheme](
            success=True,
            data=TopicScheme(
                id = new_topic['id'],
                title=new_topic['title'],
                country=new_topic['country']
            )
        )
        return response
    except Exception as e:
        logging.exception(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
#------------------------------------ Create Topic ------------------------------------

#------------------------------------ Update Topic ------------------------------------
@api.post('/topic/{topic_id}', response_model=ResponseSingle[TopicScheme])
def update_topic(topic_id : int, topic : TopicUpdate = Body(...) ):
    try:
        # if User.has_access(req.state.user['rights'], User.RIGHTS['topic']) == False:
        #     return NOT_AUTHORIZED_MESSAGE
        categories = topic.categories
        with Server.get_parmanent_db() as conn:
            cur = conn.cursor()
            # if title:
            #     Topic.update_title(conn, topic_id=topic_id, title=title)
            if categories:
                added, removed = Topic.update_categories(cur, topic_id=topic_id, categories=categories)
            conn.commit()
            updated_topic = Topic.get_by_id(cur, topic_id)
            # updated_categories = Category.get_by_topic_id(cur, topic_id)
        return ResponseSingle[TopicScheme](
            success=True,
            data=TopicScheme(
                id = updated_topic['id'],
                title=updated_topic['title'],
                country=updated_topic['country']
            )
        )
    except Exception as e:
        logging.exception(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
#------------------------------------ Update Topic ------------------------------------
#------------------------------------ Fetch Available Countries ------------------------------------
@api.get("/topic/{topic_prefix}", response_model=ResponseMultiple[Country])
def get_countries(topic_prefix : str, req: Request):
    try:
        assert "/" not in topic_prefix, "Topic prefix must not contain '/'"
        if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        countries = []
        with Server.get_parmanent_db() as conn:
            cur = conn.cursor()
            countries = Topic.get_countries(cur, topic_prefix)
        return ResponseMultiple[Country](
            success=True,
            data=countries
        )
    except Exception as e:
        logging.exception(e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


#------------------------------------ Fetch Topic Categories ------------------------------------
@api.get("/topic/{topic}/{country}", response_model=ResponseMultiple[CategoryScheme])
def topic_categories(topic : str, country : Country, req : Request):
    if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    topic_title = Topic.normalize_title(topic, country)
    cats = []
    with Server.get_parmanent_db() as conn:
        cur = conn.cursor()
        cats = Category.get_by_topic_title(cur, topic_title)
    return ResponseMultiple[CategoryScheme](
        success=True,
        data=[CategoryScheme(**cat) for cat in cats]
    )
#------------------------------------ Fetch Topic Categories ------------------------------------



#------------------------------------ Create Task ------------------------------------
@api.post("/task", response_model=ResponseSingle[TaskScheme])
def create_task(req : Request, task : TaskCreate = Body(...), ):
    if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    homewiki = task.home_wiki
    country = task.country
    topic_id = task.topic_id
    topic_title = f"{topic_id}/{country}"
    cats = task.task_data
    user = req.state.user
    task_id : int = 0
    with Server.get_parmanent_db() as conn:
        cur = conn.cursor()
        cat_titles = [cat.title for cat in cats]
        task_id = Task.create(
            cur,
            topic_id=topic_id,
            task_data="|".join(cat_titles),
            home_wiki=homewiki,
            target_wiki=homewiki,
            country=country,
            category_count=len(cat_titles),
            submitted_by=user['id'],
        )
    # current_app.executor.submit(execute_task, task_id, cat_titles)
    return ResponseSingle[TaskScheme](
        success=True,
        data=TaskScheme(
            id=task_id,
            status=TaskStatus.pending,
            category_count=len(cat_titles),
            category_done=0,
            last_category=None,
            article_count=0,
            submitted_by=user['id'],
            topic_id=topic_id,
            home_wiki=homewiki,
            target_wiki=homewiki,
            country=country,
            created_at=datetime.now(),
            task_data=cats
        )
    )
#------------------------------------ Fetch Task ------------------------------------
@api.get("/task/{task_id}", response_model=ResponseSingle[TaskScheme])
def get_task(task_id : int, req : Request):
    if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    with Server.get_parmanent_db() as db:
        cur = db.cursor()
        task = Task.get_by_id(cur, task_id)
    return ResponseSingle[TaskScheme](
        success=True,
        data=TaskScheme(**task)
    )
#------------------------------------ Fetch Task ------------------------------------





#------------------------------------ Export Task Result  ------------------------------------
@api.get("/task/{task_id}/export/{format}", response_model=ResponseSingle[TaskResult])
def export_task(req : Request, task_id : int, format : TaskResultFormat = TaskResultFormat.json, ):
    if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return ResponseSingle[TaskResult](
        success=True,
        data=get_task_result(task_id, format)
    )
    
#------------------------------------ Export Task Result  ------------------------------------

# ------------------------------------ Fetch Public Stats ------------------------------------
@api.get('/stats', response_model=ResponseSingle[Statistics])
def get_stats(req : Request):
    if User.has_access(req.state.user['rights'], User.RIGHTS['stats']) == False:
        # Give public stats
        stats = Server.get_stats()
    else:
        # Give private stats
        stats = Server.get_stats()
    return ResponseSingle[Statistics](
        success=True,
        data=Statistics(**stats)
    )
# ------------------------------------ Fetch Public Stats ------------------------------------


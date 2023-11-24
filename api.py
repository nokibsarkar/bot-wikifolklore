from fastapi import Body, APIRouter, Depends, Request, status, HTTPException, BackgroundTasks

from authentication import authenticate
import logging
from _api import *
from schema import *
from models import *
from tools.Kitkat.__init__ import kitkat_router
api = APIRouter(prefix="/api", dependencies=[Depends(authenticate)], tags=['api'])

user_router = APIRouter(prefix="/user", tags=['user'])
topic_router = APIRouter(prefix="/topic", tags=['topic'])
FORBIDDEN_EXCEPTION = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="ISorry, you do not have permission to perform this action",
    headers={"WWW-Authenticate": "Bearer"},
)
BAD_REQUEST_EXCEPTION = lambda a : HTTPException(
    status_code=status.HTTP_400_BAD_REQUEST,
    detail=str(a),
)

#------------------------------------ User ------------------------------------
@user_router.get('/', response_model=ResponseMultiple[UserScheme])
def get_users(req : Request):
    if User.has_access(req.state.user['rights'], User.RIGHTS['grant']) == False:
        raise FORBIDDEN_EXCEPTION
    with Server.get_parmanent_db() as conn:
        cur = conn.cursor()
        users = User.get_all(cur)
    return ResponseMultiple[UserScheme](
        success=True,
        data=[UserScheme(**user) for user in users]
    )
#------------------------------------ GET User ------------------------------------
@user_router.get('/me', response_model=ResponseSingle[UserScheme])
def get_me(req : Request):
    user_id = req.state.user['id']
    with Server.get_parmanent_db() as conn:
        cur = conn.cursor()
        user = User.get_by_id(cur, user_id)
        if user is None:
            raise BAD_REQUEST_EXCEPTION("User not found")
    return ResponseSingle[UserScheme](
        success=True,
        data=UserScheme(**user)
    )
@user_router.post('/me', response_model=ResponseSingle[UserScheme])
def update_me(req : Request, user : UserUpdate = Body(...)):
    user_id = req.state.user['id']
    with Server.get_parmanent_db() as conn:
        cur = conn.cursor()
        if user.username:
            user.username = "USERNAME HIDDEN"
            User.update_username(cur, user_id, user.username)
        conn.commit()
        user = User.get_by_id(cur, user_id)
    return ResponseSingle[UserScheme](
        success=True,
        data=UserScheme(**user)
    )

@user_router.get('/{user_id}', response_model=ResponseSingle[UserScheme])
def get_user(user_id : int, req : Request):
    if User.has_access(req.state.user['rights'], User.RIGHTS['grant']) == False:
        raise FORBIDDEN_EXCEPTION
    with Server.get_parmanent_db() as conn:
        cur = conn.cursor()
        user = User.get_by_id(cur, user_id)
    if user is None:
        raise BAD_REQUEST_EXCEPTION("User not found")
    return ResponseSingle[UserScheme](
        success=True,
        data=UserScheme(**user)
    )
@user_router.post('/{user_id}', response_model=ResponseSingle[UserScheme])
def update_user(user_id : int, req : Request, user : UserUpdate = Body(...)):
    if User.has_access(req.state.user['rights'], User.RIGHTS['grant']) == False:
        raise FORBIDDEN_EXCEPTION
    if user.rights is not None:
        bit_length = max(user.rights.bit_length(), req.state.user['rights'].bit_length())
        my_perms = bin(req.state.user['rights'])[2:].rjust(bit_length, '0')
        target_perms = bin(user.rights)[2:].rjust(bit_length, '0')
        for i in range(bit_length):
            if my_perms[i] == '0' and target_perms[i] == '1':
                raise FORBIDDEN_EXCEPTION
        with Server.get_parmanent_db() as conn:
            cur = conn.cursor()
            User.update_rights(cur, user_id, user.rights)
            conn.commit()
            user = User.get_by_id(cur, user_id)
    return ResponseSingle[UserScheme](
        success=True,
        data=UserScheme(**user)
    )

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
@topic_router.post('/', response_model=ResponseSingle[TopicScheme])
def create_topic(req : Request, topic : TopicCreate = Body(...)):
    """
    Create a topic with categories and country
    """
    try:
        # if User.has_access(req.state.user['rights'], User.RIGHTS['topic']) == False:
        #     raise FORBIDDEN_EXCEPTION
        raw_title = topic.title
        country = topic.country
        categories = topic.categories
        
        with Server.get_parmanent_db() as conn:
            cur = conn.cursor()
            topic_id = Topic.normalize_id(raw_title, country)
            Topic.create(cur, topic_name=raw_title, country=country)
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
        raise BAD_REQUEST_EXCEPTION(e)
#------------------------------------ Create Topic ------------------------------------


#------------------------------------ Fetch Available Countries ------------------------------------
@topic_router.get("/{topic_prefix}/country", response_model=ResponseMultiple[Country])
def get_countries(topic_prefix : str, req: Request):
    try:
        assert "/" not in topic_prefix, "Topic prefix must not contain '/'"
        if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
            raise FORBIDDEN_EXCEPTION
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
        raise BAD_REQUEST_EXCEPTION(e)

#------------------------------------ Update Topic ------------------------------------
@topic_router.post('/{topic_name}/{country}', response_model=ResponseSingle[TopicScheme])
def update_topic(topic_name : str, country: Country, req : Request, topic : TopicUpdate = Body(...) ):
    topic_id = Topic.normalize_id(topic_name, country)
    try:
        # if User.has_access(req.state.user['rights'], User.RIGHTS['topic']) == False:
        #     raise FORBIDDEN_EXCEPTION
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
        raise BAD_REQUEST_EXCEPTION(e)
@topic_router.delete('/{topic_name}/{country}', response_model=ResponseSingle[TopicScheme])
def delete_topic(topic_name : str, country: Country, req : Request):
    topic_id = Topic.normalize_id(topic_name, country)
    try:
        # if User.has_access(req.state.user['rights'], User.RIGHTS['topic']) == False:
        #     raise FORBIDDEN_EXCEPTION
        with Server.get_parmanent_db() as conn:
            cur = conn.cursor()
            Topic.delete(cur, topic_id=topic_id)
            conn.commit()
        return ResponseSingle[TopicScheme](
            success=True,
            data=TopicScheme(
                id = topic_id,
                title=topic_name,
                country=country
            )
        )
    except Exception as e:
        logging.exception(e)
        raise BAD_REQUEST_EXCEPTION(e)
#------------------------------------ Update Topic ------------------------------------
@topic_router.get("/{topic_name}/{country}", response_model=ResponseSingle[TopicScheme])
def get_topic(topic_name : str, country : Country, req : Request):
    if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
        raise FORBIDDEN_EXCEPTION
    topic_id = Topic.normalize_id(topic_name, country)
    with Server.get_parmanent_db() as conn:
        cur = conn.cursor()
        topic = Topic.get_by_id(cur, topic_id)
        categories = Category.get_by_topic_id(cur, topic_id)
    return ResponseSingle[TopicScheme](
        success=True,
        data=TopicScheme(
            id=topic['id'],
            title=topic['title'],
            country=topic['country'],
            categories=[CategoryScheme(**cat) for cat in categories]
        )
    )

#------------------------------------ Fetch Topic Categories ------------------------------------
@topic_router.get("/{topic_name}/{country}/categories", response_model=ResponseMultiple[CategoryScheme])
def topic_categories(topic_name : str, country : Country, req : Request):
    if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
        raise FORBIDDEN_EXCEPTION
    topic_id = Topic.normalize_id(topic_name, country)
    cats = []
    with Server.get_parmanent_db() as conn:
        cur = conn.cursor()
        cats = Category.get_by_topic_id(cur, topic_id)
    return ResponseMultiple[CategoryScheme](
        success=True,
        data=[CategoryScheme(**cat) for cat in cats]
    )
#------------------------------------ Fetch Topic Categories ------------------------------------

#------------------------------------ Fetch Tasks ------------------------------------
@api.get("/task", response_model=ResponseMultiple[TaskScheme])
def get_tasks(req : Request, status : TaskStatus = Optional, ):
    user_id = req.state.user['id']
    tasks = []
    with Server.get_parmanent_db() as conn:
        cur = conn.cursor()
        tasks = Task.get_task_by_user_id(cur, user_id, status=status)
    return ResponseMultiple[TaskScheme](
        success=True,
        data=[TaskScheme(**task) for task in tasks]
    )

#------------------------------------ Create Task ------------------------------------
@api.post("/task", response_model=ResponseSingle[TaskScheme])
def create_task(req : Request, backgroundTasks : BackgroundTasks, task : TaskCreate = Body(...), ):
    if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
        raise 
    
    target_wiki = task.target_wiki
    country = task.country
    topic_id = task.topic_id
    # topic_title = f"{topic_id}/{country}"
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
            target_wiki=target_wiki,
            country=country,
            category_count=len(cat_titles),
            submitted_by=user['id'],
        )
    backgroundTasks.add_task(execute_task, task_id, cat_titles, target_wiki)
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
            target_wiki=target_wiki,
            country=country,
            created_at=datetime.now(),
            task_data=cats
        )
    )
#------------------------------------ Fetch Task ------------------------------------
@api.get("/task/{task_id}", response_model=ResponseSingle[TaskScheme])
def get_task(task_id : int, req : Request):
    if User.has_access(req.state.user['rights'], User.RIGHTS['task']) == False:
        raise FORBIDDEN_EXCEPTION
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
        raise FORBIDDEN_EXCEPTION
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


api.include_router(kitkat_router)
api.include_router(user_router)
api.include_router(topic_router)
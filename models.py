from sql import *
from schema import *
import sqlite3, time, os, jwt, requests
#---------------------------- LOAD the constants ----------------------------
VERIFIER_OAUTH_CLIENT_ID        =   os.environ['VERIFIER_OAUTH_CLIENT_ID']
VERIFIER_OAUTH_CLIENT_SECRET    =   os.environ['VERIFIER_OAUTH_CLIENT_SECRET']
JWT_SECRET_KEY                  =   os.environ['JWT_SECRET_KEY']
HOSTNAME                        =   os.getenv('HOSTNAME', 'http://localhost:5000')
#---------------------------- LOADED the constants ----------------------------
class Server:
    PERMANENT_DB = 'data.db'
    TEMPORARY_DB = 'articles.db'
    META_OAUTH_AUTHORIZE_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/authorize'
    META_OAUTH_ACCESS_TOKEN_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/access_token'
    META_PROFILE_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile'
    @staticmethod
    def get_mediawiki_credentials():
        return VERIFIER_OAUTH_CLIENT_ID, VERIFIER_OAUTH_CLIENT_SECRET
    @staticmethod
    def get_parmanent_db():
        conn = sqlite3.connect(Server.PERMANENT_DB)
        conn.row_factory = sqlite3.Row
        return conn
    @staticmethod
    def get_temporary_db():
        conn = sqlite3.connect(Server.TEMPORARY_DB)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def init():
        with Server.get_parmanent_db() as conn:
            conn.executescript(SQL1_INIT)
        with Server.get_temporary_db() as conn:
            conn.executescript(SQL2_INIT)
    @staticmethod
    def get_stats() -> "dict[str, int]":
        stats = {
            'registered_user_count' : 0,
            'total_tasks' : 0,
            'total_articles_served' : 0,
            'total_categories' : 0
        }
        with Server.get_parmanent_db() as conn:
            user_stats = conn.execute(SQL1_GET_STATISTICS_FROM_USER).fetchone()
            stats['registered_user_count'] = user_stats['registered_user_count']
            stats['total_articles_served'] = user_stats['total_articles']
            stats['total_categories'] = user_stats['total_categories']
            stats['total_tasks'] = user_stats['total_tasks']
        return stats
    

class User:
    RIGHTS = {
        'task': 0,
        'stats': 1,
        'category': 2,
        'topic': 3,
        'grant': 4,
        'revoke': 5
    }
    @staticmethod
    def generate_login_url(redirect_uri='/'):
        endpoint = Server.META_OAUTH_AUTHORIZE_URL
        params = {
            'response_type' : 'code',
            'client_id' : VERIFIER_OAUTH_CLIENT_ID,
            'state' : redirect_uri,
            'redirect_uri' : f'{HOSTNAME}/user/callback',
        }
        return endpoint + '?' + '&'.join([f"{k}={v}" for k, v in params.items()])
    @staticmethod
    def generate_access_token(code, state) -> (str, str, str):
        COOKIE_NAME = 'auth'
        redirect_uri = state
        endpoint = Server.META_OAUTH_ACCESS_TOKEN_URL
        params = {
            'grant_type' : 'authorization_code',
            'code' : code,
            'client_id' : VERIFIER_OAUTH_CLIENT_ID,
            'client_secret' : VERIFIER_OAUTH_CLIENT_SECRET,
            'redirect_uri' : f'{HOSTNAME}/user/callback',
        }
        res = requests.post(endpoint, data=params).json()
        if 'error' in res:
            return COOKIE_NAME, '', '/error?code=' + res['error']
        access_token = res['access_token']
        endpoint = Server.META_PROFILE_URL
        profile = requests.get(endpoint, headers={'Authorization': f"Bearer {access_token}"}).json()
        if 'error' in profile:
            return COOKIE_NAME, '', '/error?code=' + profile['error']
        user_id = profile['sub']
        username = profile['username']
        with Server.get_parmanent_db() as conn:
            user = User.get_by_id(conn.cursor(), user_id)
            if user is None:
                # Create new user
                User.create(conn, user_id, username, {
                    'task': True,
                })
                conn.commit()
        jwt_token = jwt.encode({
            'id': user_id,
            'username': username,
            'exp' : time.time() + 60 * 60 * 24 * 7, # 7 days
            'rights': User.get_by_id(Server.get_parmanent_db().cursor(), user_id)['rights']
        }, JWT_SECRET_KEY, algorithm='HS256')
        return COOKIE_NAME, jwt_token, redirect_uri
    @staticmethod
    def logout() -> str:
        return 'auth', '', '/'
    @staticmethod
    def logged_in_user(cookies):
        auth_cookie = cookies.get('auth', None)
        if auth_cookie is None:
            return None
        try:
            auth = jwt.decode(auth_cookie, JWT_SECRET_KEY, algorithms=['HS256'])
            return auth
        except Exception as e:
            print(e)
            return None
    @staticmethod
    def rights_to_int(rights):
        right = 0
        for r in User.RIGHTS:
            if rights.get(r, False):
                right |= (1 << User.RIGHTS[r])
        return right
    @staticmethod
    def int_to_rights(right):
        rights = {r: bool(right & (1 << User.RIGHTS[r])) for r in User.RIGHTS}
        return rights
    @staticmethod
    def grant_rights(grantor_rights : dict, grantee_rights : dict, new_rights : dict) -> int:
        if type(grantor_rights) == int:
            grantor_rights = User.int_to_rights(grantor_rights)
        if type(grantee_rights) == int:
            grantee_rights = User.int_to_rights(grantee_rights)
        if type(new_rights) == int:
            new_rights = User.int_to_rights(new_rights)
        prev_right_int = User.rights_to_int(grantee_rights)
        if not grantor_rights['grant']:
            return prev_right_int
        # If the grantor has granting right
        
        for right in new_rights:
            if grantor_rights[right]:
                grantee_rights[right] = True
            else:
                return prev_right_int
        else:
            return User.rights_to_int(grantee_rights)
    @staticmethod
    def get_summary(conn : sqlite3.Cursor, user_id):
        return conn.execute(SQL1_GET_USER_SUMMARY, {'user_id': user_id}).fetchone()

    @staticmethod
    def revoke_rights(revoker_rights : dict, revokee_rights : dict, revoked_rights : dict) -> int:
        if type(revoker_rights) == int:
            revoker_rights = User.int_to_rights(revoker_rights)
        if type(revokee_rights) == int:
            revokee_rights = User.int_to_rights(revokee_rights)
        if type(revoked_rights) == int:
            revoked_rights = User.int_to_rights(revoked_rights)
        prev_right_int = User.rights_to_int(revokee_rights)
        if not revoker_rights['revoke']:
            return prev_right_int
        # If the grantor has granting right
        
        for right in revoked_rights:
            if revoker_rights[right]:
                revokee_rights[right] = False
            else:
                return prev_right_int
        else:
            return User.rights_to_int(revokee_rights)
    @staticmethod
    def has_access(rights : int, right : int):
        return bool(rights & (1 << right))

    @staticmethod
    def create(conn : sqlite3.Cursor, user_id, username, rights : int):
        if type(rights) == dict:
            rights = User.rights_to_int(rights)
        conn.execute(SQL1_INSERT_USER, {
            'username': username,
            'rights': rights,
            'id': user_id
        })
        conn.commit()
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id):
        conn.execute("SELECT * FROM `user` WHERE `id` = ? LIMIT 1", (id,))
        return conn.fetchone()
    @staticmethod
    def get_by_username(conn : sqlite3.Cursor, username):
        conn.execute("SELECT * FROM `user` WHERE `username` = ?", (username,))
        return conn.fetchone()
    @staticmethod
    def update_rights(conn : sqlite3.Cursor, id, rights : int):
        conn.execute("UPDATE `user` SET `rights` = ? WHERE `id` = ?", (rights, id))
    @staticmethod
    def update_username(conn : sqlite3.Cursor, id, username):
        return conn.execute("UPDATE `user` SET `username` = ? WHERE `id` = ?", (username, id))
    @staticmethod
    def update_stats(cur : sqlite3.Cursor, task_id):
        task = Task.get_by_id(cur, task_id)
        user_id = task['submitted_by']
        category_added = task['category_done']
        article_added = task['article_count']
        task_added = 1
        added = {
            'category_added': category_added,
            'topic_added': 0,
            'task_added': task_added,
            'article_added': article_added,
            'id': user_id
        }
        cur = cur.execute("UPDATE `user` SET `category_count` = `category_count` + :category_added, `task_count` = `task_count` + :task_added, `article_count` = `article_count` + :article_added WHERE `id` = :id;", added)
    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_USER_SUMMARY).fetchall()
class Task:
    STATUS = {
        'pending': 'pending',
        'running': 'running',
        'done': 'done',
        'error': 'error',
        'failed' : 'failed'
    }
    @staticmethod
    def create(conn : sqlite3.Cursor, *, submitted_by : int, topic_id : str, task_data : str, target_wiki : Language, country : Country, category_count : int) -> int:
        Article.cleanup(7) # Cleanup articles older than 7 days
        cur = conn.execute(SQL1_CREATE_TASK, {
            'status': TaskStatus.pending.value,
            'topic_id': topic_id,
            'task_data': task_data,
            # 'home_wiki': target_wiki,
            'target_wiki': target_wiki.value,
            'country': country.value,
            'category_count': category_count,
            'submitted_by': submitted_by
        })
        return cur.lastrowid or 0
    
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id) -> dict:
        res = conn.execute(SQL1_GET_TASK, {'task_id': id})
        k = res.fetchone()
        k = k and dict(k)
        res.close()
        return k
    

    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_TASKS).fetchall()
    
    @staticmethod
    def get_by_status(conn : sqlite3.Cursor, status : TaskStatus):
        return conn.execute(SQL1_GET_TASKS_BY_STATUS, {'status': status.value}).fetchall()
    @staticmethod
    def get_tasks_by_created_at(conn : sqlite3.Cursor, before):
        return conn.execute("SELECT * FROM `task` WHERE `created_at` < ?", (before,)).fetchall()
    @staticmethod
    def get_task_by_user_id(conn : sqlite3.Cursor, user_id, *, status : TaskStatus = None):
        filters = []
        filter_values = {
            'user_id': user_id,
            "limit" : 50
        }
        if status and status is not Optional :
            filters.append("`status` = :status")
            filter_values['status'] = status.value
        sql = "SELECT * FROM `task` WHERE `submitted_by` = :user_id"
        if len(filters) > 0:
            sql += " AND " + " AND ".join(filters)
        sql += " ORDER BY `id` DESC"
        sql += " LIMIT :limit"
        return conn.execute(sql, filter_values).fetchall()
    @staticmethod
    def update_status(conn : sqlite3.Cursor, id, status : TaskStatus):
        conn.execute("UPDATE `task` SET `status` = ? WHERE `id` = ?", (status.value, id))
    @staticmethod
    def update_article_count(conn : sqlite3.Cursor, id, new_added : int, category_done : int, last_category : str):
        conn.execute(SQL1_TASK_UPDATE_ARTICLE_COUNT, {
            'task_id': id,
            'new_added': new_added,
            'category_done': category_done,
            'last_category': last_category
        })

class Article:
    @staticmethod
    def cleanup( timeframe : int = 7):
        # tasks = Task.get_tasks_by_created_at(conn, time.time() - timeframe)
        # task_ids = map(lambda x : x['id'], filter(lambda x: x['status'] == Task.STATUS['done'], tasks))
        # sql = "DELETE FROM `articles` WHERE `task_id` IN ({})".format(','.join('?' * len(task_ids)))
        # conn2.execute(sql, task_ids)
        # conn2.commit()
        date = datetime.now() - timedelta(days=timeframe)
        print(date)
        with Server.get_temporary_db() as conn2:
            conn2.execute(SQL2_DELETE_UNUSED_ARTICLES, (date.isoformat(), ))
            conn2.commit()


    @staticmethod
    def create(conn : sqlite3.Cursor, articles) -> int:
        cur = conn.executemany(SQL1_INSERT_ARTICLE, articles)
        return cur.rowcount
    @staticmethod
    def get_all_by_task_id(conn : sqlite3.Cursor, task_id):
        return conn.execute(SQL1_GET_ARTICLES_BY_TASK_ID, {'task_id': task_id}).fetchall()
    
class Category:
    @staticmethod
    def create(conn : sqlite3.Cursor, *, categories):
        if type(categories) == dict:
            cur = conn.execute(SQL1_INSERT_CATEGORY, categories)
            return cur.lastrowid
        else:
            conn.executemany(SQL1_INSERT_CATEGORY, categories)
    @staticmethod
    def get_by_topic_title(conn : sqlite3.Cursor, topic_title):
        return conn.execute(SQL1_GET_CATEGORIES_BY_TOPIC_ID, {'topic_title': topic_title}).fetchall()
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id):
        return conn.execute("SELECT * FROM `category` WHERE `id` = ?", (id,)).fetchone()
    @staticmethod
    def get_by_ids(conn : sqlite3.Cursor, ids):
        return conn.execute("SELECT * FROM `category` WHERE `id` IN ({})".format(','.join('?' * len(ids))), ids).fetchall()
    @staticmethod
    def get_by_title(conn : sqlite3.Cursor, title):
        return conn.execute("SELECT * FROM `category` WHERE `title` = ?", (title,)).fetchone()
    @staticmethod
    def get_by_topic_id(conn : sqlite3.Cursor, topic_id : str):
        return conn.execute(SQL1_GET_CATEGORY_BY_TOPIC_ID, {'topic_id': topic_id}).fetchall()
    @staticmethod
    def get_rel_by_topic_id(conn : sqlite3.Cursor, topic_id : str):
        return conn.execute(SQL1_GET_CATEGORY_REL_BY_TOPIC_ID, {'topic_id': topic_id}).fetchall()
    @staticmethod
    def normalize_name(cat : str) -> str:
        if cat.startswith("Category:") or cat.startswith("category:") or cat.startswith("CATEGORY:"):
            cat = cat[9:]
        return "Category:" + cat
class Topic:
    @staticmethod
    def normalize_id(name, country : Country):
        name = name.lower()
        return f"{name}/{country.value}"
    @staticmethod
    def create(conn : sqlite3.Cursor, *, topic_name : str, country : Country):
        topic_id = Topic.normalize_id(topic_name, country)
        topic_title = f"{topic_name} ({country.name.replace('_', ' ')})"
        cur = conn.execute(SQL1_INSERT_TOPIC, {
            'id' : topic_id, 
            'title': topic_title,
            'country': country.value
        })
        return cur.lastrowid
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id : str) -> dict:
        return conn.execute(SQL1_GET_TOPIC_BY_ID, {'id': id}).fetchone()
    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_TOPICS).fetchall()
    
    @staticmethod
    def add_categories(conn : sqlite3.Cursor, topic_id : str, categories : list[CategoryScheme]):
        category_added = conn.executemany(SQL1_INSERT_CATEGORY, map(lambda cat: (cat.id, cat.title), categories)).rowcount
        cur = conn.executemany(
            SQL1_INSERT_TOPIC_CATEGORY,
            map(lambda x: {'topic_id': topic_id, 'category_id': x.id}, categories)
        )
        return category_added
    @staticmethod
    def remove_categories(conn : sqlite3.Cursor, topic_id : str, categories: list[CategoryScheme]):
        cur = conn.executemany(
            SQL1_DELETE_TOPIC_CATEGORY,
            map(lambda x: {'topic_id': topic_id, 'category_id': x['id']}, categories)
        )
        return cur.rowcount
    @staticmethod
    def delete(conn : sqlite3.Cursor, topic_id : str):
        categories = Category.get_rel_by_topic_id(conn, topic_id)
        cat_ids = set(map(lambda x: str(x['id']), categories))
        primary_ids = ",".join(cat_ids)
        SQL1_GET_DUAL_CAT = f"SELECT * FROM `topic_category` WHERE `category_id` IN ({primary_ids}) AND NOT `topic_id` = :topic_id "
        shared = conn.execute(SQL1_GET_DUAL_CAT, {'cat_ids': primary_ids, 'topic_id': topic_id}).fetchall()
        shared = set(map(lambda x: str(x['category_id']), shared))
        removable = cat_ids - shared
        removable = ",".join(removable)
        conn.execute("BEGIN TRANSACTION;")
        conn.execute(f"DELETE FROM `topic_category` WHERE `topic_id` = :topic_id;", {'topic_id': topic_id})
        conn.execute(f"DELETE FROM `category` WHERE `id` IN ({removable});")
        conn.execute("DELETE FROM `topic` WHERE `id` = :topic_id;", {'topic_id': topic_id})
        conn.execute("COMMIT;")
    

    @staticmethod
    def update_categories(conn : sqlite3.Cursor, topic_id : str, categories : list[CategoryScheme]):
        previous_categories = Category.get_by_topic_id(conn, topic_id)
        
        updated_cat_titles = {Category.normalize_name(cat.title) for cat in categories}
        previous_categories_title = { Category.normalize_name(x['title']) for x in previous_categories}

        removable_categories = []
        added_categories = []
        for cat in categories:
            if cat.title not in previous_categories_title:
                added_categories.append(cat)
        for cat in previous_categories:
            if cat['title'] not in updated_cat_titles:
                removable_categories.append(cat)
        if len(removable_categories) > 0:
            Topic.remove_categories(conn, topic_id, removable_categories)
        if len(added_categories) > 0:
            Topic.add_categories(conn, topic_id, added_categories)
        return len(removable_categories), len(added_categories)
    @staticmethod
    def get_countries(conn : sqlite3.Cursor, topic_prefix : str):
        countries = conn.execute(SQL1_GET_COUNTRIES, [f"{topic_prefix}/%"]).fetchall()
        return list(map(dict, countries))
    # @staticmethod
    # def update_title(conn : sqlite3.Cursor, topic_id, new_title):
    #     conn.execute(SQL1_UPDATE_TOPIC_TITLE, {'topic_id': topic_id, 'title': new_title})
    #     conn.commit()


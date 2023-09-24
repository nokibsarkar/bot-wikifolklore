from sql import *
import sqlite3, time, os, jwt, requests
#---------------------------- LOAD the constants ----------------------------
VERIFIER_OAUTH_CLIENT_ID        =   os.environ['VERIFIER_OAUTH_CLIENT_ID']
VERIFIER_OAUTH_CLIENT_SECRET    =   os.environ['VERIFIER_OAUTH_CLIENT_SECRET']
JWT_SECRET_KEY                  =   os.environ['JWT_SECRET_KEY']
#---------------------------- LOADED the constants ----------------------------
class Server:
    PERMANENT_DB = 'data.db'
    TEMPORARY_DB = 'articles.db'
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
    def get_stats():
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
        endpoint = "https://meta.wikimedia.org/w/rest.php/oauth2/authorize"
        params = {
            'response_type' : 'code',
            'client_id' : VERIFIER_OAUTH_CLIENT_ID,
            'state' : redirect_uri,
            'redirect_uri' : 'http://localhost:5000/user/login',
        }
        return endpoint + '?' + '&'.join([f"{k}={v}" for k, v in params.items()])
    @staticmethod
    def generate_access_token(args) -> (str, str, str):
        COOKIE_NAME = 'auth'
        code = args.get('code', None)
        redirect_uri = args.get('state', None)
        endpoint = "https://meta.wikimedia.org/w/rest.php/oauth2/access_token"
        params = {
            'grant_type' : 'authorization_code',
            'code' : code,
            'client_id' : VERIFIER_OAUTH_CLIENT_ID,
            'client_secret' : VERIFIER_OAUTH_CLIENT_SECRET,
            'redirect_uri' : 'http://localhost:5000/user/login',
        }
        res = requests.post(endpoint, data=params).json()
        if 'error' in res:
            return COOKIE_NAME, '', '/error?code=' + res['error']
        access_token = res['access_token']
        endpoint = "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile"
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
        except:
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
        conn.execute("SELECT * FROM `user` WHERE `id` = ?", (id,))
        return conn.fetchone()
    @staticmethod
    def get_by_username(conn : sqlite3.Cursor, username):
        conn.execute("SELECT * FROM `user` WHERE `username` = ?", (username,))
        return conn.fetchone()
    @staticmethod
    def update_rights(conn : sqlite3.Cursor, id, rights : int):
        conn.execute("UPDATE `user` SET `rights` = ? WHERE `id` = ?", (rights, id))
        conn.commit()
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
        
class Task:
    STATUS = {
        'pending': 'pending',
        'running': 'running',
        'done': 'done',
        'error': 'error'
    }
    @staticmethod
    def create(conn : sqlite3.Cursor, *, submitted_by : int, topic_title : str, task_data : str, home_wiki : str, target_wiki : str, country : str, category_count : int) -> int:
        cur = conn.execute(SQL1_CREATE_TASK, {
            'status': Task.STATUS['pending'],
            'topic_title': topic_title,
            'task_data': task_data,
            'home_wiki': target_wiki,
            'target_wiki': target_wiki,
            'country': country,
            'category_count': category_count,
            'submitted_by': submitted_by
        })
        conn.commit()
        return cur.lastrowid
    
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id):
        res = conn.execute(SQL1_GET_TASK, {'task_id': id})
        k = res.fetchone()
        k = k and dict(k)
        res.close()
        return k
    

    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_TASKS).fetchall()
    
    @staticmethod
    def get_by_status(conn : sqlite3.Cursor, status : str):
        return conn.execute(SQL1_GET_TASKS_BY_STATUS, {'status': Task.STATUS[status]}).fetchall()
    @staticmethod
    def get_tasks_by_created_at(conn : sqlite3.Cursor, before):
        return conn.execute("SELECT * FROM `task` WHERE `created_at` < ?", (before,)).fetchall()
    @staticmethod
    def update_status(conn : sqlite3.Cursor, id, status : str):
        conn.execute("UPDATE `task` SET `status` = ? WHERE `id` = ?", (Task.STATUS[status], id))
        conn.commit()
    @staticmethod
    def update_article_count(conn : sqlite3.Cursor, id, new_added : int, category_done : int, last_category : str):
        conn.execute(SQL1_TASK_UPDATE_ARTICLE_COUNT, {
            'task_id': id,
            'new_added': new_added,
            'category_done': category_done,
            'last_category': last_category
        })
        conn.commit()

class Article:
    @staticmethod
    def cleanup(conn : sqlite3.Cursor, conn2, timeframe : int):
        tasks = Task.get_tasks_by_created_at(conn, time.time() - timeframe)
        task_ids = map(lambda x : x['id'], filter(lambda x: x['status'] == Task.STATUS['done'], tasks))
        sql = "DELETE FROM `articles` WHERE `task_id` IN ({})".format(','.join('?' * len(task_ids)))
        conn2.execute(sql, task_ids)
        conn2.commit()

    @staticmethod
    def create(conn : sqlite3.Cursor, articles) -> int:
        cur = conn.executemany(SQL1_INSERT_ARTICLE, articles)
        conn.commit()
        return cur.rowcount
    @staticmethod
    def get_all_by_task_id(conn : sqlite3.Cursor, task_id):
        return conn.execute(SQL1_GET_ARTICLES_BY_TASK_ID, {'task_id': task_id}).fetchall()
    
class Category:
    @staticmethod
    def create(conn : sqlite3.Cursor, *, categories):
        if type(categories) == dict:
            cur = conn.execute(SQL1_INSERT_CATEGORY, categories)
            conn.commit()
            return cur.lastrowid
        else:
            conn.executemany(SQL1_INSERT_CATEGORY, categories)
        conn.commit()
    @staticmethod
    def get_by_topic_title(conn : sqlite3.Cursor, topic_title):
        return conn.execute(SQL1_GET_CATEGORIES_BY_TOPIC_TITLE, {'topic_title': topic_title}).fetchall()
    @staticmethod
    def get_by_pageid(conn : sqlite3.Cursor, pageid):
        return conn.execute("SELECT * FROM `category` WHERE `pageid` = ?", (pageid,)).fetchone()
    @staticmethod
    def get_by_pageids(conn : sqlite3.Cursor, pageids):
        return conn.execute("SELECT * FROM `category` WHERE `pageid` IN ({})".format(','.join('?' * len(pageids))), pageids).fetchall()
    @staticmethod
    def get_by_title(conn : sqlite3.Cursor, title):
        return conn.execute("SELECT * FROM `category` WHERE `title` = ?", (title,)).fetchone()
    @staticmethod
    def get_by_topic_id(conn : sqlite3.Cursor, topic_id):
        return conn.execute(SQL1_GET_CATEGORY_BY_TOPIC_ID, {'topic_id': topic_id}).fetchall()

class Topic:
    @staticmethod
    def normalize_title(name, country):
        name = name.lower()
        return f"{name}/{country}"
    @staticmethod
    def create(conn : sqlite3.Cursor, *, title : str, country : str):
        cur = conn.execute(SQL1_INSERT_TOPIC, {
            'title': title,
            'country': country
        })
        conn.commit()
        return cur.lastrowid
    @staticmethod
    def get_by_title(conn : sqlite3.Cursor, title : str):
        return conn.execute(SQL1_GET_TOPIC_BY_TITLE, {'title': title}).fetchone()
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id):
        return conn.execute(SQL1_GET_TOPIC_BY_ID, {'id': id}).fetchone()
    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_TOPICS).fetchall()
    
    @staticmethod
    def add_categories(conn : sqlite3.Cursor, topic_id, categories):
        category_added = conn.executemany(SQL1_INSERT_CATEGORY, categories).rowcount
        conn.commit()
        cur = conn.executemany(
            SQL1_INSERT_TOPIC_CATEGORY,
            map(lambda x: {'topic_id': topic_id, 'category_id': x['id']}, categories)
        )
        Topic.update_category_count(conn, topic_id, cur.rowcount)
        conn.commit()
        return category_added
   


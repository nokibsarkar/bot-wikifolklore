from enum import Enum
from dataclasses import dataclass
import jwt, os, requests, time, sqlite3
from ._sql import *
#---------------------------- LOAD the constants ----------------------------
VERIFIER_OAUTH_CLIENT_ID        =   os.environ['VERIFIER_OAUTH_CLIENT_ID']
VERIFIER_OAUTH_CLIENT_SECRET    =   os.environ['VERIFIER_OAUTH_CLIENT_SECRET']
JWT_SECRET_KEY                  =   os.environ['JWT_SECRET_KEY']
BOT_AUTH_TOKEN = os.getenv("BOT_AUTH_TOKEN") # The credentails to request to the API
HOSTNAME                        =   os.getenv('HOSTNAME', 'http://localhost:5000')
META_OAUTH_AUTHORIZE_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/authorize'
META_OAUTH_ACCESS_TOKEN_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/access_token'
META_PROFILE_URL = 'https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile'
URL = "https://en.wikipedia.org/w/api.php"
TG_BOT_AUTH_TOKEN = os.environ.get('TG_BOT_TOKEN')
TG_GROUP_CHAT_ID = -4006740813
WIKIPEDIA_ENDPOINT_FORMAT = "https://{lang}.wikipedia.org/w/api.php"
#---------------------------- LOADED the constants ----------------------------
VERSION = "1.0.0"
try:
    with open("VERSION", "r") as f:
        VERSION = f.read().strip()
        print(f"Version {VERSION}")
except:
    print("VERSION file not found")
    pass
sess = requests.Session()
sess.headers = {
    "User-Agent": f"TukTukBot/{VERSION} ({HOSTNAME}) (python-requests) " ,
    "Authorization" : f"Bearer {BOT_AUTH_TOKEN}"
}



#-
class Permission(Enum):
    TASK =  1 << 0
    STATS = 1 << 1
    CATEGORY = 1 << 2
    TOPIC = 1 << 3
    GRANT = 1 << 4
    CAMPAIGN = 1 << 5
    @staticmethod
    def has_access(rights : int, right : int):
        return bool(rights & right)
    @staticmethod
    def rights_to_int(rights : dict) -> int:
        right_int = 0
        for r in rights:
            if rights[r]:
                right_int |= (1 << Permission._member_map_[r].value)
        return right_int
    @staticmethod
    def int_to_rights(right):
        rights = {}
        for r in Permission._member_map_:
            if right & (1 << Permission._member_map_[r].value):
                rights[r] = True
        return rights
    @staticmethod
    def grant_rights(grantor_rights : dict, grantee_rights : dict, new_rights : dict) -> int:
        if type(grantor_rights) == int:
            grantor_rights = Permission.int_to_rights(grantor_rights)
        if type(grantee_rights) == int:
            grantee_rights = Permission.int_to_rights(grantee_rights)
        if type(new_rights) == int:
            new_rights = Permission.int_to_rights(new_rights)
        prev_right_int = Permission.rights_to_int(grantee_rights)
        if not grantor_rights['grant']:
            return prev_right_int
        # If the grantor has granting right
        
        for right in new_rights:
            if grantor_rights[right]:
                grantee_rights[right] = True
            else:
                return prev_right_int
        else:
            return Permission.rights_to_int(grantee_rights)
@dataclass
class BaseUserScheme:
    id : int
    username : str
    rights : int = 0
    article_count : int = 0
    category_count : int = 0
    task_count : int = 0
    created_at : str = None

class BaseServer:
    PERMANENT_DB = 'data.db'
    TEMPORARY_DB = 'articles.db'
    @staticmethod
    def get_parmanent_db():
        conn = sqlite3.connect(BaseServer.PERMANENT_DB)
        conn.row_factory = sqlite3.Row
        return conn
    @staticmethod
    def get_temporary_db():
        conn = sqlite3.connect(BaseServer.TEMPORARY_DB)
        conn.row_factory = sqlite3.Row
        return conn

    @staticmethod
    def init():
        with BaseServer.get_parmanent_db() as conn:
            conn.executescript(SQL1_INIT)
        with BaseServer.get_temporary_db() as conn:
            conn.executescript(SQL2_INIT)
    @staticmethod
    def get_stats() -> "dict[str, int]":
        stats = {
            'registered_user_count' : 0,
            'total_tasks' : 0,
            'total_articles_served' : 0,
            'total_categories' : 0
        }
        with BaseServer.get_parmanent_db() as conn:
            user_stats = conn.execute(SQL1_GET_STATISTICS_FROM_USER).fetchone()
            stats['registered_user_count'] = user_stats['registered_user_count']
            stats['total_articles_served'] = user_stats['total_articles']
            stats['total_categories'] = user_stats['total_categories']
            stats['total_tasks'] = user_stats['total_tasks']
        return stats
    @staticmethod
    def get(*lw, lang='en', **kw) -> dict:
        url = WIKIPEDIA_ENDPOINT_FORMAT.format(lang=lang)
        return sess.get(url, *lw, **kw).json()
    @staticmethod
    def post(*lw, lang='en', **kw) -> dict:
        url = WIKIPEDIA_ENDPOINT_FORMAT.format(lang=lang)
        return sess.post(url, *lw, **kw).json()
class BaseUser:
    @staticmethod
    def generate_login_url(redirect_uri='/'):
        endpoint = META_OAUTH_AUTHORIZE_URL
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
        endpoint = META_OAUTH_ACCESS_TOKEN_URL
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
        endpoint = META_PROFILE_URL
        profile = requests.get(endpoint, headers={'Authorization': f"Bearer {access_token}"}).json()
        if 'error' in profile:
            return COOKIE_NAME, '', '/error?code=' + profile['error']
        user_id = profile['sub']
        username = profile['username']
        with BaseServer.get_parmanent_db() as conn:
            user = BaseUser.get_by_id(conn.cursor(), user_id)
            if user is None:
                # Create new user
                BaseUser.create(conn, user_id, username, {
                    'task': True,
                })
                conn.commit()
        jwt_token = jwt.encode({
            'id': user_id,
            'username': username,
            'exp' : time.time() + 60 * 60 * 24 * 7, # 7 days
            'rights': BaseUser.get_by_id(BaseServer.get_parmanent_db().cursor(), user_id)['rights']
        }, JWT_SECRET_KEY, algorithm='HS256')
        return COOKIE_NAME, jwt_token, redirect_uri
    @staticmethod
    def logout() -> str:
        return 'auth', '', '/'
    @staticmethod
    def logged_in_user(cookies : dict):
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
        return Permission.rights_to_int(rights)
    @staticmethod
    def int_to_rights(right):
        return Permission.int_to_rights(right)
    @staticmethod
    def grant_rights(grantor_rights : dict, grantee_rights : dict, new_rights : dict) -> int:
        return Permission.grant_rights(grantor_rights, grantee_rights, new_rights)
    @staticmethod
    def get_summary(conn : sqlite3.Cursor, user_id):
        return conn.execute(SQL1_GET_USER_SUMMARY, {'user_id': user_id}).fetchone()

    @staticmethod
    def revoke_rights(revoker_rights : dict, revokee_rights : dict, revoked_rights : dict) -> int:
        if type(revoker_rights) == int:
            revoker_rights = BaseUser.int_to_rights(revoker_rights)
        if type(revokee_rights) == int:
            revokee_rights = BaseUser.int_to_rights(revokee_rights)
        if type(revoked_rights) == int:
            revoked_rights = BaseUser.int_to_rights(revoked_rights)
        prev_right_int = BaseUser.rights_to_int(revokee_rights)
        if not revoker_rights['revoke']:
            return prev_right_int
        # If the grantor has granting right
        
        for right in revoked_rights:
            if revoker_rights[right]:
                revokee_rights[right] = False
            else:
                return prev_right_int
        else:
            return BaseUser.rights_to_int(revokee_rights)
    @staticmethod
    def has_access(rights : int, right : int):
        return Permission.has_access(rights, right)

    @staticmethod
    def create(conn : sqlite3.Cursor, user_id, username, rights : int):
        if type(rights) == dict:
            rights = BaseUser.rights_to_int(rights)
        conn.execute(SQL1_INSERT_USER, {
            'username': username,
            'rights': rights,
            'id': user_id
        })
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
        return conn.execute("UPDATE `user` SET `rights` = ? WHERE `id` = ? RETURNING *", (rights, id)).fetchone()
    @staticmethod
    def update_username(conn : sqlite3.Cursor, id, username):
        return conn.execute("UPDATE `user` SET `username` = ? WHERE `id` = ? RETURNING *", (username, id)).fetchone()


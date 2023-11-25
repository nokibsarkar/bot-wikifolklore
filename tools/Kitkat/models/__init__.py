from ._sql import *
from ._schema import *
from ..._shared._model import *

class Server(BaseServer):
    pass

class User(BaseUser):
    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_USER_SUMMARY).fetchall()
class Campaign:
    pass
class Submission:
    @staticmethod
    def fetch_stats(lang :str, title : str, submitter : str, start_date : str, end_date : str) -> dict:
        pass
    @staticmethod
    def create(conn : sqlite3.Cursor, articles) -> int:
        cur = conn.executemany(SQL2_INSERT_ARTICLE, articles)
        return cur.rowcount
    @staticmethod
    def get_all_by_campaign_id(conn : sqlite3.Cursor, campaign_id, judgable : bool=None, judged : bool=None):
        
        return conn.execute(SQL1_SELECT_SUBMISSIONS, {'campaign_id': campaign_id}).fetchall()
    

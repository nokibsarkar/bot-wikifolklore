from ._sql import *
from ._schema import *
from ..._shared._model import *
import json
class Server(BaseServer):
    pass

class User(BaseUser):
    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_USER_SUMMARY).fetchall()
class Campaign:
    @staticmethod
    def create(conn : sqlite3.Cursor, campaign : CampaignCreate) -> int:
        blacklist = campaign.blacklist and json.dumps(campaign.blacklist)
        jury = campaign.jury or []
        # jury = map(str, jury)
        params = {
            # 'id' : campaign.id,
            'title' : campaign.title,
            'language' : campaign.language.value,
            'start_at' : campaign.start_at,
            'end_at' : campaign.end_at,
            'status' : CampaignStatus.pending.value,
            'description' : campaign.description,
            'rules' : campaign.rules,
            'blacklist' : blacklist,
            'image' : campaign.image,
            'creator_id' : 1,
            # 'approved_by' : campaign.approved_by,
            # 'approved_at' : campaign.approved_at,
        }
        cur = conn.execute(SQL1_CREATE_CAMPAIGN, params)
        last_campaign_id = cur.lastrowid
        Campaign.add_jury(conn, last_campaign_id, jury)
        return last_campaign_id
    @staticmethod
    def add_jury(conn : sqlite3.Cursor, campaign_id : str, jury : list[str]):
        sql = SQL1_GET_USERS_BY_USERNAME_PREFIX + (
            "(" + ",".join(["?"] * len(jury)) + ")"
        )
        users = conn.execute(sql, jury)
        users = list(map(lambda x: x['id'], users))
        conn.executemany(SQL1_ADD_JURY_TO_CAMPAIGN, zip(users, [campaign_id] * len(jury)))
    @staticmethod
    def remove_jury(conn : sqlite3.Cursor, campaign_id : str, jury : list[str]):
        sql = SQL1_GET_USERS_BY_USERNAME_PREFIX + (
            "(" + ",".join(["?"] * len(jury)) + ")"
        )
        users = conn.execute(sql, jury)
        users = list(map(lambda x: x['id'], users))
        conn.executemany(SQL1_REMOVE_JURY_FROM_CAMPAIGN, zip(users, [campaign_id] * len(jury)))
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id : str) -> CampaignScheme:
        return conn.execute(SQL1_GET_CAMPAIGN_BY_ID, {'id': id}).fetchone()
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
    

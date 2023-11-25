from ._sql import *
from ._schema import *
from ..._shared._model import *
import json
import dateparser as dp
class Server(BaseServer):
    pass

class User(BaseUser):
    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_USER_SUMMARY).fetchall()
    @staticmethod
    def get_username_map(conn : sqlite3.Cursor, usernames : list[str]) -> dict[str, UserScheme]:
        sql = SQL1_GET_USERS_BY_USERNAME_PREFIX + (
            "(" + ",".join(["?"] * len(usernames)) + ")"
        )
        users = conn.execute(sql, usernames)
        return dict(map(lambda x: (x['username'], x), users))
class Campaign:
    @staticmethod
    def create(conn: sqlite3.Cursor, campaign: CampaignCreate) -> int:
        blacklist = ','.join(campaign.blacklist or [])
        print(blacklist)
        rules = '\n'.join(campaign.rules or [])
        jury = campaign.jury or []
        # jury = map(str, jury)
        params = {
            'name': campaign.name,
            'language': campaign.language.value,
            'start_at': campaign.start_at,
            'end_at': campaign.end_at,
            'status': CampaignStatus.pending.value,
            'description': campaign.description,
            'rules': rules,
            'blacklist': blacklist,
            'image': campaign.image,
            'creator_id': 1,
            'maximumSubmissionOfSameArticle': campaign.maximumSubmissionOfSameArticle,
            'allowExpansions': campaign.allowExpansions,
            'minimumTotalBytes': campaign.minimumTotalBytes,
            'minimumTotalWords': campaign.minimumTotalWords,
            'minimumAddedBytes': campaign.minimumAddedBytes,
            'minimumAddedWords': campaign.minimumAddedWords,
            'secretBallot': campaign.secretBallot,
            'allowJuryToParticipate': campaign.allowJuryToParticipate,
            'allowMultipleJudgement': campaign.allowMultipleJudgement,
        }
        cur = conn.execute(SQL1_CREATE_CAMPAIGN, params)
        lastCampaignId = cur.lastrowid
        Campaign.add_jury(conn, lastCampaignId, jury)
        return lastCampaignId
    @staticmethod
    def add_jury(conn : sqlite3.Cursor, campaign_id : str, jury : list[str]):
        users = User.get_username_map(conn, jury)
        users = map(lambda v: (v['id'], v['username'], campaign_id), users.values())
        conn.executemany(SQL1_ADD_JURY_TO_CAMPAIGN, users)
    @staticmethod
    def remove_jury(conn : sqlite3.Cursor, campaign_id : str, jury : list[str]):
        users = User.get_username_map(conn, jury)
        users = map(lambda v: (v['id'], campaign_id), users.values())
        conn.executemany(SQL1_REMOVE_JURY_FROM_CAMPAIGN, users)
    @staticmethod
    def get_jury(conn : sqlite3.Cursor, campaign_id : str):
        return conn.execute(SQL1_GET_JURY_BY_ALLOWED, {'campaign_id': campaign_id, 'allowed' : True}).fetchall()
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id : str) -> CampaignScheme:
        return conn.execute(SQL1_GET_CAMPAIGN_BY_ID, {'id': id}).fetchone()
class Submission:
    @staticmethod
    def fetch_stats(lang :str, title : str, submitter : str, start_at : str, end_at : str) -> dict:
        pass
    @staticmethod
    def create(conn : sqlite3.Cursor, articles) -> int:
        cur = conn.executemany(SQL2_INSERT_ARTICLE, articles)
        return cur.rowcount
    @staticmethod
    def get_all_by_campaign_id(conn : sqlite3.Cursor, campaign_id, judgable : bool=None, judged : bool=None):

        return conn.execute(SQL1_SELECT_SUBMISSIONS, {'campaign_id': campaign_id}).fetchall()
    

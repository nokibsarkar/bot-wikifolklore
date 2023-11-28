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
    def _get_username_map(conn : sqlite3.Cursor, usernames : list[str]) -> dict[str, UserScheme]:
        sql = SQL1_GET_USERS_BY_USERNAME_PREFIX + (
            "(" + ",".join(["?"] * len(usernames)) + ")"
        )
        users = conn.execute(sql, usernames)
        return dict(map(lambda x: (x['username'], x), users))
    @staticmethod
    def auto_create_users(conn : sqlite3.Cursor, usernames : set[str], lang : str = 'en') -> dict[str, UserScheme]:
        params = {
            'action': 'query',
            'list': 'users',
            'ususers': '|'.join(usernames),
            'format': 'json',
            'usprop': 'centralids',
            'uslimit' : 'max'
        }
        res = Server.get(lang=lang, params=params)
        users_dict = res['query']['users']
        users = []
        for user in users_dict:
            users.append({
                'id': user['centralids']['CentralAuth'],
                'username': user['name'],
                'rights': Permission.TASK.value
            })
        conn.executemany(SQL1_CREATE_USER_IF_NOT_EXISTS, users)
        user_map = User._get_username_map(conn, list(usernames))
        return user_map
    @staticmethod
    def get_username_map_guaranteed(conn : sqlite3.Cursor, usernames : list[str], lang : str = 'en') -> dict[str, UserScheme]:
        user_map = User._get_username_map(conn, usernames)
        if len(user_map) != len(usernames):
            included = set(user_map.keys())
            excluded = set(usernames) - included
            new_map = User.auto_create_users(conn, excluded, lang=lang)
            user_map = {**user_map, **new_map}
        return user_map
    
class Campaign:
    @staticmethod
    def create(conn: sqlite3.Cursor, campaign: CampaignCreate) -> int:
        blacklist = ','.join(campaign.blacklist or [])
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
        Campaign.add_jury(conn, lastCampaignId, jury, lang=campaign.language.value)
        return lastCampaignId
    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_ALL_CAMPAIGN).fetchall()
    @staticmethod
    def add_jury(conn : sqlite3.Cursor, campaign_id : str, jury : list[str], lang : str='en'):
        users = User.get_username_map_guaranteed(conn, jury, lang=lang)
        users = map(lambda v: (v['id'], v['username'], campaign_id), users.values())
        conn.executemany(SQL1_ADD_JURY_TO_CAMPAIGN, users)
    @staticmethod
    def remove_jury(conn : sqlite3.Cursor, campaign_id : str, jury : list[str]):
        users = User._get_username_map(conn, jury)
        users = map(lambda v: (v['id'], campaign_id), users.values())
        conn.executemany(SQL1_REMOVE_JURY_FROM_CAMPAIGN, users)
    @staticmethod
    def get_jury(conn : sqlite3.Cursor, campaign_id : str, allowed : bool=True):
        result = []
        if allowed is None:
            result = conn.execute(SQL1_GET_JURY_BY_CAMPAIGN_ID, {'campaign_id': campaign_id}).fetchall()
        else:
            result = conn.execute(SQL1_GET_JURY_BY_ALLOWED, {'campaign_id': campaign_id, 'allowed' : allowed}).fetchall()
        return result
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
    

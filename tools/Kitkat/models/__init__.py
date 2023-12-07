from ._sql import *
from ._schema import *
from ..._shared._model import *
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
            'created_by_id': 1,
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
    def update(conn: sqlite3.Cursor, campaign: CampaignUpdate) -> int:
        blacklist = ','.join(campaign.blacklist or [])
        rules = '\n'.join(campaign.rules or [])
        jury = campaign.jury or []
        # jury = map(str, jury)
        params = {
            # 'name': campaign.name,
            # 'start_at': campaign.start_at,
            # 'end_at': campaign.end_at,
            'status': campaign.status.value,
            # 'description': campaign.description,
            # 'rules': rules,
            # 'blacklist': blacklist,
            # 'image': campaign.image,
            # 'maximumSubmissionOfSameArticle': campaign.maximumSubmissionOfSameArticle,
            # 'allowExpansions': campaign.allowExpansions,
            # 'minimumTotalBytes': campaign.minimumTotalBytes,
            # 'minimumTotalWords': campaign.minimumTotalWords,
            # 'minimumAddedBytes': campaign.minimumAddedBytes,
            # 'minimumAddedWords': campaign.minimumAddedWords,
            # 'secretBallot': campaign.secretBallot,
            # 'allowJuryToParticipate': campaign.allowJuryToParticipate,
            # 'allowMultipleJudgement': campaign.allowMultipleJudgement,
        }
        if False:
            Campaign.remove_jury(conn, campaign.id, jury)
            Campaign.add_jury(conn, campaign.id, jury, lang=campaign.language.value)
        sql = SQL1_UPDATE_CAMPAIGN_FORMAT.format(updates=", ".join([f"{k} = :{k}" for k in params.keys()]), id=campaign.id)
        print(sql)
        up = conn.execute(sql, params)
        
        updated_campaign = up.fetchone()
        return updated_campaign
    @staticmethod
    def get_all(conn : sqlite3.Cursor, language : Language=None, status : list[CampaignStatus]=None, limit : int=50, offset : int= 0):
        params = {
            'limit': limit,
            'offset': offset,
            'language': language and language.value,
        }
        sql = SQL1_GET_ALL_CAMPAIGN
        if status:
            status_placeholder = ','.join(map(lambda x: f"'{x.value}'", status))
            if language is not None:
                sql = SQL1_GET_ALL_CAMPAIGN_BY_STATUS_AND_LANGUAGE_FORMAT
            else:
                sql = SQL1_GET_ALL_CAMPAIGN_BY_STATUS_FORMAT
            sql = sql.format(status_placeholder=status_placeholder)
        elif language is not None:
            sql = SQL1_GET_ALL_CAMPAIGN_BY_LANGUAGE
        return conn.execute(sql, params).fetchall()
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
    def _fetch_first_revision(lang : str, pageid : int) -> dict[str, str]:
        params = {
            "action": "query",
            "format": "json",
            "prop": "revisions",
            "pageids": pageid,
            "rvprop": "timestamp|user|size|ids|userid",
            "rvlimit": "1",
            "rvdir": "newer",
        }
        info = Server.get(lang=lang, params=params)
        assert 'query' in info, "query not found"
        assert 'pages' in info['query'], 'No pages found'
    
        assert len(info['query']['pages']) == 1, "Must be a single "
        assert pageid in info['query']['pages'], "Page does not match"
        page = info['query']['pages'][pageid]
        assert 'revisions' in page, "No revision found"
        revision = page['revisions'][0]
        return {
            'oldid' : revision['revid'],
            'title' : page['title'],
            'user_id' : revision['userid'],
            'username' : revision['user'],
            'timestamp' : revision['timestamp'],
            'size' : revision['size'],
        }
    @staticmethod
    def _fetch_current_info(lang : str, title : str) -> dict[str, str]:
        """
        Fetch current information of the article from the API
        """
        params = {
            "action": "query",
            "format": "json",
            "prop": "revisions",
            "titles": title,
            "rvprop": "timestamp|tags|user|size|ids|content|userid",
            "rvlimit": "1",
            "indexpageids" : 1
        }
        info = Server.get(lang=lang, params=params)
        assert 'query' in info, "query not found"
        assert 'pages' in info['query'], 'No pages found'
    
        assert len(info['query']['pages']) == 1 and len(info['query']['pageids']) == 1, "Must be a single "
        pageid = info['query']['pageids'][0]
        page = info['query']['pages'][pageid]
        assert 'revisions' in page, "No revision found"
        revision = page['revisions'][0]
        assert '*' in revision, 'No content'
        stat = {
            'pageid' : pageid,
            'ns' : page['ns'],
            'title' : page['title'],
            'content' : revision['*'],
            'bytes' : revision['size'],
            'words' : 0,
            'oldid' : revision['revid'],
        }
        return stat
    @staticmethod
    def fetch_stats(lang :str, title : str, submitted_by_username : str, start_at : str, end_at : str) -> dict:
        current_info = Submission._fetch_current_info(lang, title)
        pageid = current_info['pageid']
        first_revision_info = Submission._fetch_first_revision(lang, pageid)
        errors = []
        stats = {
            'title' : title,
            'pageid' : pageid,
            'oldid' : current_info['oldid'],
            'words' : current_info['words'],
            'bytes' : current_info['bytes'],
            'added_words' : 100,
            'added_bytes' : 100,
            'created_at' : first_revision_info['timestamp'],
            'created_by_username' : first_revision_info['username'],
            'created_by_id' : first_revision_info['user_id'],
            'submitted_by_username' : submitted_by_username,
            'submitted_by_id' : 100,
        }
        return errors, stats
    @staticmethod
    def create(conn : sqlite3.Cursor, submission: SubmissionScheme) -> SubmissionScheme:
        params = {
            'campaign_id': submission.campaign_id,
            'pageid': submission.pageid,
            'oldid': submission.oldid,
            'title': submission.title,
            'created_at': submission.created_at,
            'created_by_id': submission.created_by_id,
            'created_by_username': submission.created_by_username,
            'submitted_by_id': submission.submitted_by_id,
            'submitted_by_username': submission.submitted_by_username,
            'total_words': submission.total_words,
            'total_bytes': submission.total_bytes,
            'added_words': submission.added_words,
            'added_bytes': submission.added_bytes,
            'target_wiki': submission.target_wiki
        }
        cur = conn.execute(SQL1_CREATE_SUBMISSION, params)
        new_submission = cur.fetchone()
        return SubmissionScheme(**new_submission)
    @staticmethod
    def get_all_by_campaign_id(conn : sqlite3.Cursor, campaign_id, judgable : bool=None, judged : bool=None):

        return conn.execute(SQL1_SELECT_SUBMISSIONS, {'campaign_id': campaign_id}).fetchall()
    

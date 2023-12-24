from ._sql import *
from ._schema import *
from ..._shared._model import *
import dateparser as dp
from ._draft import *
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
        users = conn.execute(sql, list(usernames))
        return dict(map(lambda x: (x['username'], x), users))
    @staticmethod
    def is_admin(rights : int):
        return User.has_access(rights, Permission.CAMPAIGN.value)
    @staticmethod
    def get_central_ids(usernames : list[str], lang : str = 'en') -> dict[str, int]:
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
        users = {}
        for user in users_dict:
            users[user['name']] = user['centralids']['CentralAuth']
        return users
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
        new_campaign = conn.execute(SQL1_CREATE_CAMPAIGN, params).fetchone()
        lastCampaignId = new_campaign['id']
        Campaign.add_jury(conn, lastCampaignId, jury, lang=campaign.language.value)
        return new_campaign
    @staticmethod
    def update(conn: sqlite3.Cursor, campaign: CampaignUpdate, existing_campaign : CampaignScheme) -> int:
        
        blacklist = ','.join(campaign.blacklist or [])
        rules = '\n'.join(campaign.rules or [])
        params = {
            'id' : campaign.id,
            'name': campaign.name,
            'start_at': campaign.start_at,
            'end_at': campaign.end_at,
            'status': campaign.status.value,
            'description': campaign.description,
            'rules': rules,
            'blacklist': blacklist,
            'image': campaign.image,
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
        jury = campaign.jury or []
        updated_jury = set(map(str, jury))
        existing_jury = Campaign.get_jury(conn, campaign.id, allowed=True)
        existing_jury_usernames = {u['username'] for u in existing_jury}
        removed_jury = existing_jury_usernames - updated_jury
        new_jury = updated_jury - existing_jury_usernames
        if removed_jury:
            Campaign.remove_jury(conn, campaign.id, removed_jury)
        if new_jury:
            Campaign.add_jury(conn, campaign.id, new_jury, lang=existing_campaign['language'])
            
        sql = SQL1_UPDATE_CAMPAIGN_FORMAT.format(updates=", ".join([f"{k} = :{k}" for k in params.keys()]), id=campaign.id)
        up = conn.execute(sql, params)
        updated_campaign = up.fetchone()
        Campaign.update_status(conn, campaign.id)
        return updated_campaign
    @staticmethod
    def _update_status(conn : sqlite3.Cursor, campaign_id : str, status : CampaignStatus):
        params = {
            'id': campaign_id,
            'status': status.value,
        }
        cur = conn.execute(SQL1_UPDATE_CAMPAIGN_STATUS, params)
        updated_campaign = cur.fetchone()
        return updated_campaign
    @staticmethod
    def get_results(conn : sqlite3.Cursor, campaign_id : str):
        results = conn.execute(SQL1_GET_RESULTS_BY_CAMPAIGN_ID, {'campaign_id': campaign_id}).fetchall()
        return [CampaignResultScheme(**r) for r in results]
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
    def _get_by_id(conn : sqlite3.Cursor, id : str):
        return conn.execute(SQL1_GET_CAMPAIGN_BY_ID, {'id': id}).fetchone()
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id : str):
        return Campaign.update_status(conn, id)
    
    @staticmethod
    def update_status(conn : sqlite3.Cursor, id : str, check_all_judged = False) -> CampaignScheme:
        campaign = Campaign._get_by_id(conn, id)
        now = datetime.utcnow()
        status = campaign['status']
        start_date = dp.parse(campaign['start_at'])
        end_date = dp.parse(campaign['end_at'])
        if status == CampaignStatus.scheduled.value and now >= start_date:
            print("Scheduled to running")
            status = CampaignStatus.running.value
        if now >= end_date:
            if status == CampaignStatus.running.value: 
                print("Running to evaluating")
                status = CampaignStatus.evaluating.value
            elif status == CampaignStatus.evaluating.value:
                all_judged = conn.execute(SQL1_UPDATE_CAMPAIGN_STATUS_TO_ENDED, {'campaign_id': id}).fetchone()
                if all_judged['unjudged_submissions'] == 0:
                    print("Evaluating to ended")
                    status = CampaignStatus.ended.value
        return conn.execute(SQL1_UPDATE_CAMPAIGN_STATUS, {'id': id, 'status': status}).fetchone()
    


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
            "indexpageids" : 1,
            'redirects' : 1
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
            'words' : calculate_word(revision['*']),
            'oldid' : revision['revid'],
        }
        return stat
    @staticmethod
    def fetch_stats(lang :str, title : str) -> tuple[list[str], dict[str, str | int]]:
        errors = []
        current_info = Submission._fetch_current_info(lang, title)
        pageid = current_info['pageid']
        title = current_info['title']
        first_revision_info = Submission._fetch_first_revision(lang, pageid)
        user_ids = User.get_central_ids([ first_revision_info['username']], lang=lang)
        created_by_id = user_ids[first_revision_info['username']]
        errors = []
        stats = {
            'title' : title,
            'pageid' : pageid,
            'oldid' : current_info['oldid'],
            'words' : current_info['words'],
            'bytes' : current_info['bytes'],
            'created_at' : first_revision_info['timestamp'],
            'created_by_username' : first_revision_info['username'],
            'created_by_id' : created_by_id,
            'added_words' : 0,
            'added_bytes' : 0,
        }
        return errors, stats
    @staticmethod
    def submit(conn : sqlite3.Cursor, draft : DraftSubmissionScheme) -> SubmissionScheme:
        params = {
            'campaign_id': draft['campaign_id'],
            'pageid': draft['pageid'],
            'oldid': draft['oldid'],
            'title': draft['title'],
            'created_at': draft['created_at'],
            'created_by_id': draft['created_by_id'],
            'created_by_username': draft['created_by_username'],
            'submitted_by_id': draft['submitted_by_id'],
            'submitted_by_username': draft['submitted_by_username'],
            'total_words': draft['total_words'],
            'total_bytes': draft['total_bytes'],
            'added_words': draft['added_words'],
            'added_bytes': draft['added_bytes'],
            'target_wiki': draft['target_wiki']
        }
        cur = conn.execute(SQL1_CREATE_SUBMISSION, params)
        new_submission = cur.fetchone()
        return SubmissionScheme(**new_submission)
    @staticmethod
    def create_draft(conn : sqlite3.Cursor, draft : DraftSubmissionScheme) -> DraftSubmissionScheme:
        params = {
            'campaign_id': draft.campaign_id,
            'pageid': draft.pageid,
            'oldid': draft.oldid,
            'title': draft.title,
            'created_at': draft.created_at,
            'created_by_id': draft.created_by_id,
            'created_by_username': draft.created_by_username,
            'submitted_by_id': draft.submitted_by_id,
            'submitted_by_username': draft.submitted_by_username,
            'total_words': draft.total_words,
            'total_bytes': draft.total_bytes,
            'added_words': draft.added_words,
            'added_bytes': draft.added_bytes,
            'target_wiki': draft.target_wiki
        }
        cur = conn.execute(SQL1_CREATE_DRAFT, params)
        new_draft = cur.fetchone()
        return DraftSubmissionScheme(**new_draft)
    @staticmethod
    def get_draft_by_id(conn : sqlite3.Cursor, id : int) -> DraftSubmissionScheme:
        return conn.execute(SQL1_GET_DRAFT_BY_ID, {'id': id}).fetchone()
    @staticmethod
    def update_draft_flags(conn : sqlite3.Cursor, draft_id, calculated : bool, passed : bool, submitted : bool) -> DraftSubmissionScheme:
        params = {
            'id': draft_id,
            'calculated': calculated,
            'passed': passed,
            'submitted': submitted,
        }
        cur = conn.execute(SQL1_UPDATE_DRAFT, params)
        updated_draft = cur.fetchone()
        return DraftSubmissionScheme(**updated_draft)
    @staticmethod
    def async_calculate_addition(draft_id : int, lang: str, pageid : int , start_date : str, end_date : str, username : str) -> tuple[int, int]:
        """
        Calculate the addition of the article
        """
        print("Calculating addition")
        with Server.get_parmanent_db() as conn:
            draft = Submission.get_draft_by_id(conn, draft_id)
            campaign = Campaign.get_by_id(conn, draft['campaign_id'])
            campaign_allow_expansion = campaign['allowExpansions']
            params = {
                'id': draft_id,
                'added_words': 0,
                'added_bytes': 0,
                'passed': True,
                'calculated': True,
            }
            if campaign_allow_expansion:
                campaign_minimum_added_bytes = campaign['minimumAddedBytes']
                campaign_minimum_added_words = campaign['minimumAddedWords']
                added_word, added_bytes = calculate_addition(lang, pageid, start_date, end_date, username)
                if added_word < campaign_minimum_added_words or added_bytes < campaign_minimum_added_bytes:
                    params['passed'] = False
            else:
                added_word, added_bytes = 0, 0
                minimum_total_words = campaign['minimumTotalWords']
                minimum_total_bytes = campaign['minimumTotalBytes']
                if draft['total_words'] < minimum_total_words or draft['total_bytes'] < minimum_total_bytes:
                    params['passed'] = False
            params['added_words'] = added_word
            params['added_bytes'] = added_bytes
            conn.execute(SQL1_UPDATE_DRAFT_CALCULATION, params)
            

    @staticmethod
    def get_all_by_campaign_id(conn : sqlite3.Cursor, campaign_id, judgable : bool=None, exclude_judged_user_id : int = None, only_judged_by : int = None):
        params = {'campaign_id': campaign_id}
        sql = SQL1_SELECT_SUBMISSIONS
        if only_judged_by is not None:
            sql = SQL1_SELECT_SUBMISSIONS_JUDGED_BY_USER_ID
            params['jury_id'] = only_judged_by
        if exclude_judged_user_id is not None:
            params['exclude_judged_user_id'] = exclude_judged_user_id 
            sql = SQL1_SELECT_SUBMISSIONS_EXCLUDING_USER_ID
        results = conn.execute(sql, params).fetchall()
        print(sql, params)
        print(results)
        return results
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id : str) -> SubmissionScheme:
        return conn.execute(SQL1_GET_SUBMISSION_BY_ID, {'id': id}).fetchone()
class Judgement:
    @staticmethod
    def add(conn : sqlite3.Cursor, submission_id : int, jury_id : int, vote : int, campaign_id : int):
        params = {
            'submission_id': submission_id,
            'jury_id': jury_id,
            'vote': vote,
            'campaign_id' : campaign_id
        }
        cur = conn.execute(SQL1_ADD_JUDGEMENT, params)
        new_judgement = cur.fetchone()
        return new_judgement
    @staticmethod
    def _get_judgements(conn  : sqlite3.Cursor, submission_id : int) -> list[JudgementScheme]:
        return conn.execute(SQL1_GET_JUDGEMENTS_BY_SUBMISSION_ID, {'submission_id': submission_id}).fetchall()
    @staticmethod
    def _get_all_jury(conn : sqlite3.Cursor, submission_id : int) -> list[UserScheme]:
        return conn.execute(SQL1_GET_JURY_BY_SUBMISSION_ID, {'submission_id': submission_id}).fetchall()
    @staticmethod
    def calculate_points(conn : sqlite3.Cursor, submission_id : int):
        """
        Calculate and update the votes of a submission
        """
        all_judgements = Judgement._get_judgements(conn, submission_id)
        all_jury = Judgement._get_all_jury(conn, submission_id)
        print(all_jury)
        total_votes = 0
        negative_votes = 0
        positive_votes = 0
        points = 0
        for judgement in all_judgements:
            if judgement['vote'] == 0:
                negative_votes += 1
            elif judgement['vote'] == 1:
                positive_votes += 1
            total_votes += judgement['vote']
        if total_votes > 0:
            if negative_votes == 0 and positive_votes == total_votes:
                points = 10
            elif positive_votes == 0 and negative_votes == total_votes:
                points = 0
            else:
                points = 5

        params = {
            'id': submission_id,
            'total_votes': total_votes,
            'negative_votes': negative_votes,
            'positive_votes': positive_votes,
            'points' : points,
        }
        cur = conn.execute(SQL1_UPDATE_SUBMISSION_POINTS, params)
        updated_submission = cur.fetchone()
        return SubmissionScheme(**updated_submission)
    @staticmethod
    def verify_judge(conn: sqlite3.Cursor, campaign_id : str, user_id : int):
        return conn.execute(SQL1_VERIFY_JUDGE, {'campaign_id': campaign_id, 'user_id': user_id}).fetchone()
    
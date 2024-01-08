from dataclasses import dataclass
from typing import Generic, TypeVar, List, Type, Union, Optional, Annotated
from enum import Enum
from datetime import datetime, date
from ..._shared._countries import Country
from ..._shared._wiki import Language
from ..._shared._model import BaseUserScheme
class TaskResultFormat(Enum):
    json : str = "json"
    wikitext : str = "wikitext"
    csv : str = "csv"
    pagepile : str = "pagepile"
class UpdatableStatus(Enum):
    scheduled = "scheduled"
    rejected = "rejected"
    cancelled = "cancelled"
    ended = "ended"
class CampaignStatus( Enum):
    pending = "pending"
    running = "running"
    evaluating = "evaluating"
    scheduled = UpdatableStatus.scheduled.value
    rejected = UpdatableStatus.rejected.value
    cancelled = UpdatableStatus.cancelled.value
    ended = UpdatableStatus.ended.value
@dataclass
class CampaignStatusUpdate:
    status : UpdatableStatus
@dataclass
class SubmissionBase:
    id : int = None # Submission ID
    pageid : int = None # Page ID of the article
    campaign_id : str = None # Campaign ID of the article
    title : str = None
    oldid : int = None # Revision ID of the article
    target_wiki : Language = None # Target wiki of the article, this must be as same as the campaign's target wiki
    # Statistics
    submitted_at : datetime | date = None # When was the article submitted
    submitted_by_id : int = None # User ID of the user who submitted the article
    submitted_by_username : str = None # Username of the user who submitted the article
    created_at : datetime | date = None # When was the article created
    created_by_id : int = None # User ID of the user who created the article
    created_by_username : str = None # Username of the user who created the article
    # Article statistics
    total_bytes : int = 0 # Total bytes of the article
    total_words : int = 0 # Total words of the article
    added_bytes : int = 0 # Added bytes of the article
    added_words : int = 0 # Added words of the article   
@dataclass
class DraftSubmissionScheme(SubmissionBase):
    """
    A class to store pre-submitted submissions and check their validity
    """
    passed : bool = False # Is the article passed the pre-submission check?
    submitted : bool = False # Is the article submitted?
    calculated : bool = False # Is the article statistics calculated?
    newly_created : bool = False # Is the article newly created? 
@dataclass
class DraftCreateScheme:
    """
    A class to store pre-submitted submissions and check their validity
    """
    campaign_id : str
    title : str
    submitted_by_username : str = None # Username of the user who submitted the article
    

@dataclass
class SubmissionScheme(SubmissionBase):
    """
    A class to store the article that was gathered
    """
    
    points : int = 0 # Points of the article as of now
    positive_votes : int = 0 # Positive votes of the article as of now
    negative_votes : int = 0 # Negative votes of the article as of now
    total_votes : int = 0 # Total votes of the article as of now
    # Is the article judgable?
    # If multiple judgements are allowed, 
    # this will be True all the time before the campaign ends
    judgable : bool = True 
    judged_by_me : bool | None = None

    newly_created : bool = False # Is the article newly created? 
@dataclass
class SubmissionCreateScheme:
    """
    A class to store the article that was gathered
    """
    draft_id : int = None # Draft ID of the submission that has passed = True
@dataclass
class JudgementScheme:
    """
    A class to store the judgement of the article
    """
    submission_id : int
    vote : int = 0 # 1 for positive, -1 for negative
    judge_username : str = None # Username of the judge
@dataclass
class CategoryScheme(SubmissionScheme):
    pass
@dataclass
class UserScheme(BaseUserScheme):
    pass
@dataclass
class UserUpdate:
    username : str | None = None
    rights : int | None = None
@dataclass
class TaskCreate:
    topic_id : str
    task_data : list[CategoryScheme]
    target_wiki : Language
    country : Country
    pass
class TaskStatus(Enum):
    pending = "pending"
    running = "running"
    done = "done"
    failed = "failed"
@dataclass
class TaskScheme:
    id : int
    status : TaskStatus
    category_count : int
    category_done : int
    last_category : str | None
    article_count : int
    submitter : int
    topic_id : str
    target_wiki : Language
    country : Country
    created_at : str
    task_data : list[CategoryScheme] | str | None
    pagepile_id : int | None = None
    pass
@dataclass
class _Campaign:
    name : str
    language : Language
    start_at : datetime | date
    end_at : datetime | date
    description : str | None
    rules : str | list[str]
    blacklist : list[str] | str | None
    image : str | None
    maximumSubmissionOfSameArticle : int 
    allowExpansions : bool 
    minimumTotalBytes : int 
    minimumTotalWords : int
    minimumAddedBytes : int 
    minimumAddedWords : int 
    secretBallot : bool 
    allowJuryToParticipate : bool 
    allowMultipleJudgement : bool 
    
@dataclass
class CampaignCreate(_Campaign):
    jury : list[str] | None = None
    
@dataclass
class CampaignUpdate:
    id : int
    name : Optional[str] = None
    start_at : Optional[datetime | date] = None
    end_at : Optional[datetime | date] = None
    description : Optional[str | None] = None
    rules : Optional[str | list[str]] = None
    blacklist : Optional[list[str] | str] = None
    image : Optional[str] = None
    maximumSubmissionOfSameArticle : Optional[int] = None
    allowExpansions : Optional[bool] = None
    minimumTotalBytes : Optional[int] = None
    minimumTotalWords : Optional[int] = None
    minimumAddedBytes : Optional[int] = None
    minimumAddedWords : Optional[int] = None
    secretBallot : Optional[bool] = None
    allowJuryToParticipate : Optional[bool] = None
    allowMultipleJudgement : Optional[bool] = None
    approved_by : Optional[int] = None
    approved_at : Optional[datetime | date] = None
    status : Optional[CampaignStatus] = None
    jury : list[str] | None = None
    
@dataclass
class CampaignScheme(_Campaign):
    id : int
    approved_by : int
    approved_at : datetime | date
    created_by_id : int
    created_at : datetime | date
    status : CampaignStatus = CampaignStatus.pending
    am_i_judge : bool = False

    @staticmethod
    def from_dict(data : dict):
        return CampaignScheme(
            id=data['id'],
            name=data['name'],
            language=data['language'],
            start_at=data['start_at'],
            end_at=data['end_at'],
            status=CampaignStatus(data['status']),
            description=data['description'],
            rules=data['rules'] and data['rules'].split('\n'),
            blacklist=data['blacklist'] and data['blacklist'].split(','),
            image=data['image'],
            created_by_id=data['created_by_id'],
            approved_by=data['approved_by'],
            approved_at=data['approved_at'],
            created_at=data['created_at'],
            maximumSubmissionOfSameArticle=data['maximumSubmissionOfSameArticle'],
            allowExpansions=data['allowExpansions'],
            minimumTotalBytes=data['minimumTotalBytes'],
            minimumTotalWords=data['minimumTotalWords'],
            minimumAddedBytes=data['minimumAddedBytes'],
            minimumAddedWords=data['minimumAddedWords'],
            secretBallot=data['secretBallot'],
            allowJuryToParticipate=data['allowJuryToParticipate'],
            allowMultipleJudgement=data['allowMultipleJudgement'],
        )
    pass
@dataclass
class CampaignResultScheme:
    user_id : int
    username : str
    total_points : int
    total_submissions : int
    total_newly_created : int
    total_expanded : int
    def __init__(self, user_id : int, username : str, total_points : int, total_submissions : int, total_newly_created : int):
        self.user_id = user_id
        self.username = username
        self.total_points = total_points
        self.total_submissions = total_submissions
        self.total_newly_created = total_newly_created
        self.total_expanded = total_submissions - total_newly_created
@dataclass
class CampaignStatistics:
    id : int | str
    submissions : list[CampaignResultScheme]
    total_points : int = 0
    total_submissions : int = 0
    total_newly_created : int = 0
    total_expanded : int = 0
    def __init__(self, id : int | str, submissions : list[CampaignResultScheme]):
        self.id = id
        self.submissions = submissions
        for submission in submissions:
            self.total_points += submission.total_points
            self.total_submissions += submission.total_submissions
            self.total_newly_created += submission.total_newly_created
            self.total_expanded += submission.total_expanded
@dataclass
class Statistics:
    """
    "registered_user_count": 1,
    "total_tasks": 0,
    "total_articles_served": 0,
    "total_categories": 0
    """
    registered_user_count : int
    total_tasks : int
    total_articles_served : int
    total_categories : int
@dataclass
class JudgeScheme:
    user_id : int
    username : str
    campaign_id : str
    created_at : datetime | date
    allowed : bool = True
    judged_count : int = 0 # How many articles did this jury judged? (less or equal to submission count)
    positive_votes : int = 0 # How many articles did this jury voted positive?
    negative_votes : int = 0 # How many articles did this jury voted negative?
    total_votes : int = 0 # How many articles did this jury voted?
    @staticmethod
    def from_dict(data : dict):
        return JudgeScheme(
            username=data['username'],
            user_id=data['user_id'],
            campaign_id=data['campaign_id'],
            created_at=data['created_at'],
            allowed=data['allowed'],
            judged_count=data['judged_count'],
            positive_votes=data['positive_votes'],
            negative_votes=data['negative_votes'],
            total_votes=data['total_votes'],
        )
TaskResult = Union[str, List[SubmissionScheme]]
T = TypeVar('T', str, TaskScheme, UserScheme, SubmissionScheme, CategoryScheme, Country, CampaignScheme, TaskResult, Statistics)
@dataclass
class ResponseMultiple(Generic[T]):
    success : bool
    data : List[T]

@dataclass
class ResponseSingle(Generic[T]):
    success : bool
    data : T | None


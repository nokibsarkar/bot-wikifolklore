from dataclasses import dataclass
from typing import Generic, TypeVar, List, Type, Union, Optional
from enum import Enum
from datetime import datetime
from ..._shared._countries import Country
from ..._shared._wiki import Language
from ..._shared._model import BaseUserScheme
class TaskResultFormat(Enum):
    json : str = "json"
    wikitext : str = "wikitext"
    csv : str = "csv"
    pagepile : str = "pagepile"
class CampaignStatus(Enum):
    pending = "pending"
    scheduled = "scheduled"
    rejected = "rejected"
    cancelled = "cancelled"
    running = "running"
    ended = "ended"
@dataclass
class SubmissionScheme:
    """
    A class to store the article that was gathered
    """
    id : int = None # Submission ID
    page_id : int = None # Page ID of the article
    campaign_id : str = None # Campaign ID of the article
    title : str = None
    old_id : int = None # Revision ID of the article
    target_wiki : Language = None # Target wiki of the article, this must be as same as the campaign's target wiki
    # Statistics
    submitted_at : datetime = None # When was the article submitted
    submitter_id : int = None # User ID of the user who submitted the article
    submitter_username : str = None # Username of the user who submitted the article
    created_at : datetime = None # When was the article created
    creator_id : int = None # User ID of the user who created the article
    creator_username : str = None # Username of the user who created the article
    # Article statistics
    total_bytes : int = 0 # Total bytes of the article
    total_words : int = 0 # Total words of the article
    added_bytes : int = 0 # Added bytes of the article
    added_words : int = 0 # Added words of the article
    points : int = 0 # Points of the article as of now
    positive_votes : int = 0 # Positive votes of the article as of now
    negative_votes : int = 0 # Negative votes of the article as of now
    total_votes : int = 0 # Total votes of the article as of now
    # Is the article judgable?
    # If multiple judgements are allowed, 
    # this will be True all the time before the campaign ends
    judgable : bool = True 
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
    title : str
    language : Language
    start_at : datetime
    end_at : datetime
    approved_by : int
    approved_at : datetime
    description : str
    rules : str | list[str]
    blacklist : list[str] | None
    image : str | None
@dataclass
class CampaignCreate(_Campaign):
    jury : list[str] | None = None
    
@dataclass
class CampaignUpdate(CampaignCreate):
    id : str | None = None
    status : CampaignStatus | None = None
@dataclass
class CampaignScheme(_Campaign):
    id : str
    status : CampaignStatus = CampaignStatus.pending
    pass
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
    campaign_id : str
    created_at : datetime
    allowed : bool = True
    judged_count : int = 0 # How many articles did this jury judged? (less or equal to submission count)
    positive_votes : int = 0 # How many articles did this jury voted positive?
    negative_votes : int = 0 # How many articles did this jury voted negative?
    total_votes : int = 0 # How many articles did this jury voted?
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


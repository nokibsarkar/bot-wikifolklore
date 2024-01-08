from dataclasses import dataclass
from typing import Generic, TypeVar, List, Type, Union, Optional
from enum import Enum
from datetime import datetime, timedelta
from ..._shared._countries import Country
from ..._shared._wiki import Language
class TaskResultFormat(Enum):
    json : str = "json"
    wikitext : str = "wikitext"
    csv : str = "csv"
    pagepile : str = "pagepile"

@dataclass
class ArticleSceme:
    """
    A class to store the article that was gathered
    """
    id : int = None
    title : str = None
@dataclass
class CategoryScheme(ArticleSceme):
    pass
@dataclass
class UserScheme:
    """
     `id` INTEGER PRIMARY KEY,
    `username` TEXT NOT NULL,
    `rights` INTEGER DEFAULT '0b100000', -- task-stats-category-topic-grant-revoke,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `article_count` INTEGER DEFAULT 0,
    `category_count` INTEGER DEFAULT 0,
    `task_count` INTEGER DEFAULT 0
    """
    id : int
    username : str
    rights : int = 0
    article_count : int = 0
    category_count : int = 0
    task_count : int = 0
    created_at : str = None
@dataclass
class UserUpdate:
    username : str | None = None
    rights : int | None = None
@dataclass
class TaskCreate:
    """
    `id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE,
    `submitted_by` INTEGER NOT NULL,
    `status`	TEXT NOT NULL,
    `created_at`	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `topic_id`	INTEGER NOT NULL,
    `task_data`	TEXT NOT NULL,
    `category_count`    INTEGER NOT NULL DEFAULT 0,
    `category_done`    INTEGER NOT NULL DEFAULT 0,
    `last_category`    TEXT NULL DEFAULT NULL,
    `home_wiki`    TEXT NOT NULL,
    `target_wiki`    TEXT NOT NULL,
    `article_count`    INTEGER NOT NULL DEFAULT 0,
    `country`    TEXT NOT NULL,
    """
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
    submitted_by : int
    topic_id : str
    target_wiki : Language
    country : Country
    created_at : str
    task_data : list[CategoryScheme] | str | None
    pagepile_id : int | None = None
    pass
@dataclass
class TopicCreate:
    country : Country
    title : str 
    categories : List[CategoryScheme] | None
    id : str | None = None
    
@dataclass
class TopicUpdate:
    categories : List[CategoryScheme]
@dataclass
class TopicScheme:
    title : str
    country : Country
    id : str
    categories : List[CategoryScheme] | None = None
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
TaskResult = Union[str, List[ArticleSceme]]
T = TypeVar('T', str, TaskScheme, UserScheme, ArticleSceme, CategoryScheme, Country, TopicScheme, TaskResult, Statistics)
@dataclass
class ResponseMultiple(Generic[T]):
    success : bool
    data : List[T]

@dataclass
class ResponseSingle(Generic[T]):
    success : bool
    data : T | None


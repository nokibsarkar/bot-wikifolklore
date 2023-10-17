from dataclasses import dataclass
from typing import Generic, TypeVar, List,NewType
from datetime import datetime
from enum import Enum
class TaskResultFormat(Enum):
    json : str = "json"
    wikitext : str = "wikitext"
    csv : str = "csv"
class Country(Enum):
    Bangladesh = "BD"
    India = "IN"
@dataclass
class Article:
    """
    A class to store the article that was gathered
    """
    id : int = None
    title : str = None
@dataclass
class Category(Article):
    pass
@dataclass
class User:
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
    submitted_by : int
    topic_id : int
    task_data : list[Category]
    home_wiki : str
    target_wiki : str
    country : Country
    pass
class TaskStatus(Enum):
    pending = "pending"
    running = "running"
    done = "done"
    failed = "failed"
@dataclass
class Task:
    id : int
    status : TaskStatus
    category_count : int
    category_done : int
    last_category : str
    article_count : int
    submitted_by : int
    topic_id : int
    home_wiki : str
    target_wiki : str
    country : Country
    created_at : datetime
    
    pass
@dataclass
class TopicCreate:
    country : Country
    title : str 
    categories : List[Category] = None
@dataclass
class TopicUpdate:
    categories : List[Category]
@dataclass
class Topic:
    title : str
    country : Country
    pass
T = TypeVar('T', str, Task, User, Article, Category, Country)
@dataclass
class ResponseMultiple(Generic[T]):
    success : bool
    data : List[T]

@dataclass
class ResponseSingle(Generic[T]):
    success : bool
    data : T = None
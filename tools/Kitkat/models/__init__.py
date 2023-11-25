from ._sql import *
from ._schema import *
from ..._shared._model import *

class Server(BaseServer):
    pass

class User(BaseUser):
    @staticmethod
    def update_stats(cur : sqlite3.Cursor, task_id):
        task = Task.get_by_id(cur, task_id)
        user_id = task['submitted_by']
        category_added = task['category_done']
        article_added = task['article_count']
        task_added = 1
        added = {
            'category_added': category_added,
            'topic_added': 0,
            'task_added': task_added,
            'article_added': article_added,
            'id': user_id
        }
        cur = cur.execute("UPDATE `user` SET `category_count` = `category_count` + :category_added, `task_count` = `task_count` + :task_added, `article_count` = `article_count` + :article_added WHERE `id` = :id;", added)
    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_USER_SUMMARY).fetchall()
class Task:
    STATUS = {
        'pending': 'pending',
        'running': 'running',
        'done': 'done',
        'error': 'error',
        'failed' : 'failed'
    }
    @staticmethod
    def create(conn : sqlite3.Cursor, *, submitted_by : int, topic_id : str, task_data : str, target_wiki : Language, country : Country, category_count : int) -> int:
        Submission.cleanup(7) # Cleanup articles older than 7 days
        cur = conn.execute(SQL1_CREATE_TASK, {
            'status': TaskStatus.pending.value,
            'topic_id': topic_id,
            'task_data': task_data,
            # 'home_wiki': target_wiki,
            'target_wiki': target_wiki.value,
            'country': country.value,
            'category_count': category_count,
            'submitted_by': submitted_by
        })
        return cur.lastrowid or 0
    
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id) -> dict:
        res = conn.execute(SQL1_GET_TASK, {'task_id': id})
        k = res.fetchone()
        k = k and dict(k)
        res.close()
        return k
    

    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_TASKS).fetchall()
    
    @staticmethod
    def get_by_status(conn : sqlite3.Cursor, status : TaskStatus):
        return conn.execute(SQL1_GET_TASKS_BY_STATUS, {'status': status.value}).fetchall()
    @staticmethod
    def get_tasks_by_created_at(conn : sqlite3.Cursor, before):
        return conn.execute("SELECT * FROM `task` WHERE `created_at` < ?", (before,)).fetchall()
    @staticmethod
    def get_task_by_user_id(conn : sqlite3.Cursor, user_id, *, status : TaskStatus = None):
        filters = []
        filter_values = {
            'user_id': user_id,
            "limit" : 50
        }
        if status and status is not Optional :
            filters.append("`status` = :status")
            filter_values['status'] = status.value
        sql = "SELECT * FROM `task` WHERE `submitted_by` = :user_id"
        if len(filters) > 0:
            sql += " AND " + " AND ".join(filters)
        sql += " ORDER BY `id` DESC"
        sql += " LIMIT :limit"
        return conn.execute(sql, filter_values).fetchall()
    @staticmethod
    def update_status(conn : sqlite3.Cursor, id, status : TaskStatus):
        conn.execute("UPDATE `task` SET `status` = ? WHERE `id` = ?", (status.value, id))
    @staticmethod
    def add_pagepile_id(conn : sqlite3.Cursor, id, pagepile_id):
        conn.execute("UPDATE `task` SET `pagepile_id` = ? WHERE `id` = ?", (pagepile_id, id))
    @staticmethod
    def update_article_count(conn : sqlite3.Cursor, id, new_added : int, category_done : int, last_category : str):
        conn.execute(SQL1_TASK_UPDATE_ARTICLE_COUNT, {
            'task_id': id,
            'new_added': new_added,
            'category_done': category_done,
            'last_category': last_category
        })

class Submission:
    @staticmethod
    def create(conn : sqlite3.Cursor, articles) -> int:
        cur = conn.executemany(SQL2_INSERT_ARTICLE, articles)
        return cur.rowcount
    @staticmethod
    def get_all_by_task_id(conn : sqlite3.Cursor, task_id):
        return conn.execute(SQL2_GET_ARTICLES_BY_TASK_ID, {'task_id': task_id}).fetchall()
    
class Campaign:
    @staticmethod
    def normalize_id(name, country : Country):
        name = name.lower()
        return f"{name}/{country.value}"
    @staticmethod
    def create(conn : sqlite3.Cursor, *, topic_name : str, country : Country):
        topic_id = Campaign.normalize_id(topic_name, country)
        topic_title = f"{topic_name} ({country.name.replace('_', ' ')})"
        cur = conn.execute(SQL1_INSERT_TOPIC, {
            'id' : topic_id, 
            'title': topic_title,
            'country': country.value
        })
        return cur.lastrowid
    @staticmethod
    def get_by_id(conn : sqlite3.Cursor, id : str) -> dict:
        return conn.execute(SQL1_GET_TOPIC_BY_ID, {'id': id}).fetchone()
    @staticmethod
    def get_all(conn : sqlite3.Cursor):
        return conn.execute(SQL1_GET_TOPICS).fetchall()
    
    
    
    # @staticmethod
    # def update_title(conn : sqlite3.Cursor, topic_id, new_title):
    #     conn.execute(SQL1_UPDATE_TOPIC_TITLE, {'topic_id': topic_id, 'title': new_title})
    #     conn.commit()


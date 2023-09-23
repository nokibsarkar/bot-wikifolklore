import os
from requests import Session
import time
import sqlite3
from settings import *
from sql import *
import logging
logging.basicConfig(filename="benchmark.log",
                    filemode='a',
                    format='[%(asctime)s] %(msecs)d %(name)s %(levelname)s %(message)s',
                    # datefmt='%H:%M:%S',
                    level=logging.DEBUG)
logger = logging.getLogger("page.extraction.module")
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.FileHandler("benchmark.log"))
logger.propagate = False
# change the formate to include the time
formatter = logging.Formatter('[%(asctime)s] - %(name)s - %(levelname)s - %(message)s - %(filename)s:%(lineno)d')
logger.handlers[0].setFormatter(formatter)

logger.info("Logging Started")
sess = Session()
sess.headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Authorization" : f"Bearer {AUTH_TOKEN}"
}

# sqlite3 row factory
# sqlite3.Connection.row_factory = sqlite3.Row

URL = "https://en.wikipedia.org/w/api.php"

def _get_db() -> sqlite3.Connection:
    """
    A function to get the database connection
    Usually used as a context manager
    """
    conn = sqlite3.connect(DATABASE_NAME)
    # conn.set_trace_callback(print)
    conn.row_factory = sqlite3.Row
    return conn



def init_db():
    """
    A function to initialize the database.
    """
    with _get_db() as conn:
        conn.executescript(SQL_INIT)
        conn.commit()
    


def _export_to_wikitext(res):
    """
    Export the result set to wikitext
    """
    serial = 1
    content = """
{| class="wikitable sortable"
|-
! Serial No. !! English Title !! Wikidata !! Hindi Title !! Category 
|-
"""
    for row in res:
        content += f"\n|{serial} || [[:en:{row['title']}|]] || [[:wd:{row['wikidata']}|]] || [[:hi:{row['target']}|]] || [[:en:{row['category']}|]]\n|-"
        serial += 1
    content += "\n|}"
    return content



def export_to_csv(res):
    serial = 1
    result = ["serial,pageid,english_title,target,wikidata,category"]
    for pageid, task_id, title, target, wikidata, category, created_at in res:
        result.append(f"{serial},{pageid},{title},{target},{wikidata},{category}")
        serial += 1
        
    return "\n".join(result)

def get_task(task_id):
    with _get_db() as conn:
        res = conn.execute(SQL_GET_TASK, {
            "task_id": task_id
        }).fetchone()
        return res
def get_task_result(task_id, format='json'):
    res = None
    with _get_db() as conn:
        res = conn.execute(SQL_GET_ARTICLES_BY_TASK_ID,{
            "task_id": task_id
        })
    if format == 'json':
        result = []
        for pageid, task_id, title, target, wikidata, category, created_at in res:
            result.append({
                "pageid": pageid,
                "task_id": task_id,
                "title": title,
                "target": target,
                "wikidata": wikidata,
                "category": category,
                "created_at": created_at
            })
        return result
    elif format == 'csv':
        return export_to_csv(res)
    elif format == 'wikitext':
        return _export_to_wikitext(res)


#---------------------------- Task Related Functions ----------------------------


def _extract_page(task_id, category, pages, added):
    logger.debug("Extracting Pages")
    for page in pages:
        if page['pageid'] in added:
            continue
        added.add(page['pageid'])
        if "langlinks" not in page:
            wbentity = None
            if "wbentityusage" in page:
                for entity in page["wbentityusage"]:
                    if 'S' in page['wbentityusage'][entity]['aspects']:
                        wbentity = entity
                        break
            logger.debug(f"Page {page['title']} is ready to be inserted")
            yield {
                    "task_id": task_id,
                    "pageid": page['pageid'],
                    "title": page['title'],
                    "target": "",
                    "wikidata": wbentity,
                    "category": category
            }
    logger.debug("Pages Extracted")

def _execute_task(task_id, cats):
    os.system(f'echo "Executing task {task_id}" | write nokibsarkar')
    logger.debug(f"Executing Task {task_id}")
    if type(cats) == str:
        cats = cats.split("|")
    added = set()
    cats = [_normalize_category_name(cat.strip()) for cat in cats]
    cats = [*set(cats)]
    logger.debug("Category Names parsed")
    data = {
        "action": "query",
        "format": "json",
        "prop": "langlinks|wbentityusage",
        "wbeuaspect" : "S",
        "wbeulimit" : "max",
        "generator": "categorymembers",
        "formatversion": "2",
        "llprop": "langname",
        "lllang": "hi",
        "llinlanguagecode": "en",
        "lllimit": "max",
        "gcmprop": "title",
        "gcmnamespace": "0",
        "gcmtype": "page",
        "gcmlimit": "max"
    }
    for category in cats:
        logger.debug(f"Processing {category}")
        data['gcmtitle'] = _normalize_category_name(category)
        has_continue = True
        while has_continue:
            try:
                logger.debug(f"Sending Request for {category}")
                res = sess.get(URL, params=data)
                res = res.json()
                logger.debug(f"Request Received for {category}")
                logger.debug(f"Fetched {category}")
                if "query"  in res:
                   logger.debug("Query Found")
                   with _get_db() as conn:
                        logger.debug(f"Inserting {category}")
                        
                        cur = conn.executemany(SQL_INSERT_ARTICLE, _extract_page(task_id, category, res["query"].get('pages', []), added))
                        # sql = (
                        #     "INSERT INTO `article` (pageid, task_id, title, target, wikidata, category) VALUES " +
                        #      ", ".join(map(lambda row: f"({row['pageid']}, {task_id}, '{row['target']}', '{row['title']}', '{row['wikidata']}', '{row['category']}')",  _extract_page(task_id, category, res["query"].get('pages', []), added)))
                        # )
                        # cur = conn.execute(sql)
                        cur.execute(SQL_TASK_UPDATE_ARTICLE_COUNT, {
                            "task_id": task_id,
                            "new_added" : cur.rowcount,
                            "category_done" : 1,
                            "last_category" : category
                        })
                        cur.close()
                        conn.commit()
                        logger.debug(f"Inserted {category}")
                has_continue = "continue" in res
                if has_continue:
                    logger.debug("Continue Found")
                    data.update(res['continue'])
                    logger.debug(f"{data.get('continue', 'None')} {data.get('gcmcontinue', None)} {data.get('wbeucontinue', None)}")
                    time.sleep(1)
            except Exception as e:
                logging.exception(e)
                with _get_db() as conn:
                    conn.execute("UPDATE `task` SET `status` = 'error' WHERE `id` = :task_id", {
                        "task_id": task_id
                    })
                    conn.commit()
                return
    logger.debug(f"Task Done  {task_id}")
    with _get_db() as conn:
        conn.execute("UPDATE `task` SET `status` = 'done' WHERE `id` = :task_id", {
            "task_id": task_id
        })
        conn.commit()


def submit_task(topic_title, cats, home_wiki, country, target_wiki, executor):
    task_id = 0
    with _get_db() as conn:
        task = conn.execute(SQL_CREATE_TASK, {
            "status": "created",
            "topic_title": topic_title,
            "task_data": "|".join(cats),
            "home_wiki": home_wiki,
            "target_wiki": target_wiki,
            "country": country,
            "category_count": len(cats)
        })
        conn.commit()
        task_id = task.lastrowid
        task.close()
    executor.submit(_execute_task, task_id, cats)
    return task_id



def get_topic_cats(topic_title):
    with _get_db() as conn:
        res = conn.execute(SQL_GET_CATEGORIES_BY_TOPIC_TITLE, {
            "topic_title": topic_title
        })
        return res.fetchall()
    





def _normalize_category_name(cat : str) -> str:
    if cat.startswith("Category:") or cat.startswith("category:") or cat.startswith("CATEGORY:"):
        cat = cat[9:]
    return "Category:" + cat





def fetch_subcats(cat : str) -> list:
    cat = _normalize_category_name(cat)
    data = {
        "action": "query",
        "format": "json",
        "list": "categorymembers",
        "formatversion": "2",
        "cmtitle": cat,
        "cmprop": "ids|title",
        "cmtype": "subcat",
        "cmlimit": "max"
    }
    has_continue = True
    result = []
    while has_continue:
        res = sess.get(URL, params=data)
        res = res.json()
        has_continue = "continue" in res
        if has_continue:
            data["cmcontinue"] = res["continue"]["cmcontinue"]
            data['continue'] = res["continue"]["continue"]
        else:
            data.pop("cmcontinue", None)
            data.pop("continue", None)
        for category in res["query"]["categorymembers"]:
            result.append({
                "pageid": category['pageid'],
                "title": category['title'],
                'subcat' : True
            })
        if has_continue:
            print("Sleeping")
            time.sleep(1)
    return result



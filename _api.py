from requests import Session
import time, csv, io, os, logging
from models import *
#---------------------------- Load the constants ----------------------------
# Assuming .env is loaded already
BOT_AUTH_TOKEN = os.getenv("BOT_AUTH_TOKEN") # The credentails to request to the API

#---------------------------- Logging ----------------------------
logger = logging.getLogger("page.extraction.module")
logger.setLevel(logging.INFO)
logger.addHandler(logging.FileHandler("benchmark.log"))
# change the formate to include the time
formatter = logging.Formatter('[%(asctime)s] - %(name)s - %(levelname)s - %(message)s - %(filename)s:%(lineno)d')
logger.handlers[0].setFormatter(formatter)
#---------------------------- Logging ----------------------------

#---------------------------- API Session ----------------------------
sess = Session()
sess.headers = {
    "User-Agent": "TukTukBot/1.0 (Linux x86_64)",
    "Authorization" : f"Bearer {BOT_AUTH_TOKEN}"
}
URL = "https://en.wikipedia.org/w/api.php"
#---------------------------- API Session ----------------------------


    
#---------------------------- Result Exporting Functions ----------------------------

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
    """
    Export the result set to csv
    """
    serial = 1
    headers = "serial", "pageid", "english_title", "target", "wikidata", "category"
    result = io.StringIO()
    writer = csv.writer(result, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(headers)
    for pageid, task_id, title, target, wikidata, category, created_at in res:
        writer.writerow([serial, pageid, title, target, wikidata, category])
        serial += 1
    result.seek(0)
    result = result.read()
    return result

#---------------------------- Task Related Functions ----------------------------
def get_task_result(task_id, format='json'):
    res = None
    with Server.get_temporary_db() as conn:
        res = Article.get_all_by_task_id(conn, task_id)
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
    logger.debug("Extracting Pages from the result set")
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
                    "category": category,
                    
            }
    logger.debug("Pages Extracted")

def execute_task(task_id, cats):
    try:
        logger.info(f"Executing Task {task_id}")
        if type(cats) == str:
            cats = cats.split("|")
        added = set()
        cats = [_normalize_category_name(cat.strip()) for cat in cats]
        # cats = [*set(cats)]

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
                        # result_list.extend()
                        with Server.get_parmanent_db() as conn, Server.get_temporary_db() as conn2:
                            new_added = Article.create(conn2, 
                                _extract_page(task_id, category, res["query"].get('pages', []), added)
                            )
                            Task.update_article_count(
                                conn,
                                id=task_id,
                                new_added=new_added,
                                category_done=1,
                                last_category=category
                            )
                        
                    has_continue = "continue" in res
                    if has_continue:
                        logger.debug("Continue Found")
                        data.update(res['continue'])
                        logger.debug(f"{data.get('continue', 'None')} {data.get('gcmcontinue', None)} {data.get('wbeucontinue', None)}")
                        time.sleep(1)
                except Exception as e:
                    logging.exception(e)
                    with Server.get_parmanent_db() as conn:
                        Task.update_status(conn, id=task_id, status="failed")
                    return
        logger.info(f"Task Done  {task_id}")
        with Server.get_parmanent_db() as conn:
            # Article
            Task.update_status(conn, id=task_id, status="done")
            User.update_stats(conn, task_id)
            conn.commit()
    except Exception as e:
        logging.error(f"Task Failed {task_id}")
        logging.exception(e)
        with Server.get_parmanent_db() as conn:
            Task.update_status(conn, id=task_id, status="failed")
            logging.info("Task Failed saved to DB")


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



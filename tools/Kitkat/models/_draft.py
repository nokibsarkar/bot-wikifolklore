from ..._shared._model import *
from requests import Session
import wikitextparser as wtp
import re
import dateparser as dp
from difflib import Differ
sess = Session()
d = Differ()
sess.headers.update({
    'User-Agent': 'Kitkat/1.0',
})



REFERENCE = re.compile("<ref.*?(?:>.*?</ref>|/>)")
MULTIPLE_NEWLINE = re.compile("\n+", re.MULTILINE)
WHITESPACE = re.compile("[\t –]+")
UNIFIED_HEADER = re.compile("@@ -(\d+),(\d+) \+(\d+),(\d+) @@", re.MULTILINE)
def _remove_reference(content: str) -> str:
    """
    This will remove the reference from the content
    """
    return REFERENCE.sub(" ", content)
def _remove_whitespace(content: str) -> str:
    """
    This will remove the whitespace from the content
    """
    content = content.strip()
    content = WHITESPACE.sub(" ", content)
    content = MULTIPLE_NEWLINE.sub("\n", content)
    return content
def _preprocess(content: str) -> str:
    """
    This will:
    1. Remove the references like <ref>...</ref>, <ref name="..."/>
    2. Replace the multiple whitespace with single whitespace
    3. Remove the markup and templates
    """
    content = _remove_reference(content)
    content = _remove_whitespace(content)
    content = wtp.remove_markup(content)
    content = _remove_whitespace(content)

    return content
def _split_into_lines(content: str) -> list[str]:
    """
    This will split the content into lines
    """
    content = _preprocess(content)
    return content.splitlines(True)

def _calculate_added_words(lines : list[str]) -> int:
    """
    This will calculate the added words
    """
    word_added = 0
    for line in lines:
        if line.startswith('+'):
            
            word_count = calculate_word(line[1:])
            word_added += word_count
        elif line.startswith('-'):
            word_count = calculate_word(line[1:])
            word_added -= word_count
    return word_added
def _calculate_difference(content1: str, content2: str) -> int:
    content1 = _split_into_lines(content1)
    content2 = _split_into_lines(content2)
    lines = d.compare(content1, content2)
    return _calculate_added_words(lines)
    
def _calculate_initial_difference(lang : str, revision_id : int) -> tuple[int, int]:
    params = {
        "action": "compare",
        "format": "json",
        "formatversion" : "2",
        "fromrev": revision_id,
        "torelative": "prev",
        "prop": "ids|title|rel|diffsize|diff|size",
        "difftype": "unified",
    }
    res = BaseServer.get(lang=lang, params=params)
    assert 'compare' in res, "Compare not found"
    assert 'diffsize' in res['compare'], "Diffsize not found"
    added_bytes = res['compare']['diffsize']
    difference = res['compare']['body']
    difference = UNIFIED_HEADER.sub("", difference)
    lines = _split_into_lines(difference)
    added_words = _calculate_added_words(lines)
    print("From initial", added_words, added_bytes)
    return added_words, added_bytes
    
   
def calculate_addition(lang: str, pageid : int , start_date : str, end_date : str, username : str) -> tuple[int, int]:
    """
    Calculate the addition of the article
    """
    start_date = dp.parse(start_date).isoformat()
    end_date = dp.parse(end_date).isoformat()
    params = {
        "action": "query",
        "format": "json",
        "prop": "revisions",
        "pageids": pageid,
        "formatversion" : "2",
        "rvprop": "tags|ids|size|content",
        "rvslots": "main",
        "rvlimit": "20",
        "rvstart": start_date,
        "rvend": end_date,
        "rvdir": "newer",
        "rvuser": username,
    }
    res = BaseServer.get(lang=lang, params=params)
    assert 'query' in res, res
    assert 'pages' in res['query'], "Pages not found"
    assert len(res['query']['pages']) == 1, "More than one page found"
    page = res['query']['pages'][0]
    if not 'revisions' in page:
        return 0, 0
    revisions = page['revisions']
    assert len(revisions) > 0, "No revisions found"
    initial_revision = revisions[0]
    added_words, added_bytes = _calculate_initial_difference(lang, initial_revision['revid'])
    previous_content = initial_revision['slots']['main']['content']
    for revision in revisions[1:]:
        content = revision['slots']['main']['content']
        added_words += _calculate_difference(previous_content, content, )
        previous_content = content
        added_bytes += revision['size']
    return (added_words, added_bytes)
def calculate_word(content : str) -> int:
    """
    Calculate the word count of the content
    """
    content = _preprocess(content)
    return len(content.split())


from requests import Session
sess = Session()
COOKIE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTAwODAwMzQsInVzZXJuYW1lIjoiTm9raWIgU2Fya2FyIiwiZXhwIjoxNjk3MTk5NDMyLjg3NjIxODYsInJpZ2h0cyI6M30.LAAGrp5FtZVsP4-nGsbqIdR1WljOCnRZT-kIGTJTRis'
BASE_URL = "http://localhost:5000/api"
sess.cookies.set('auth', COOKIE)
sess.headers = {
    "User-Agent": "TukTukBot/1.0 (Linux x86_64)",
}
test_topic = {
    "title": "folklore/IN",
    "prefix" : "folklore",
    "id": 1,
    "categories": [{
        "pageid": 1,
        "title": "Category Hello"
    }],
    "added_categories" : [
        {
            "pageid": 11,
            "title": "Category Hello2"
        },
        {
            "pageid": 22,
            "title": "Category Hello1"
        }
    ],
    "removed_categories" : [
        {
            "pageid": 1,
            "title": "Category Hello"
        },
        {
            "pageid": 22,
            "title": "Category Hello"
        }
    ]
}
def test_topic_create():
    url = f"{BASE_URL}/topic"
    topic = {
        "title":test_topic['title'],
        "categories": test_topic['categories'],
    }
    res = sess.post(url, json=topic)
    print(res.text)
def test_topic_get_countries():
    url = f"{BASE_URL}/topic/" + test_topic['prefix']
    res = sess.get(url)
    print(res.text)
def test_topic_get_categories():
    url = f"{BASE_URL}/topic/" + test_topic['title']
    res = sess.get(url)
    print(res.text)

def test_topic_update():
    url = f"{BASE_URL}/topic/{test_topic['id']}"
    data = {
        "title":test_topic['title'],
        "categories": test_topic['added_categories'],
    }
    res = sess.post(url, json=data)
    print(res.text)
if __name__ == "__main__":
    test_topic_create()
    test_topic_get_countries()
    test_topic_get_categories()
    test_topic_update()
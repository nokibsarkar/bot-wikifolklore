from requests import Session
from tools._shared._wiki import Language
import time
sess = Session()
username = input('Username: ')
password = input('Password: ')
def login(language):
    print(language)
    api_url = f'https://{language}.wikipedia.org/w/api.php'
    token_params = {
        "action": "query",
        "format": "json",
        "meta": "tokens",
        "formatversion": "2",
        "type": "login"
    }
    try:
        tkr = sess.get(api_url, params=token_params)
        tkr = tkr.json()
        assert 'logintoken' in tkr['query']['tokens'], 'Login token not found'
        token = tkr['query']['tokens']['logintoken']
        params = {
            "action": "login",
            "format": "json",
            "lgname": username,
            "lgpassword": password,
            "lgtoken": token,
            "formatversion": "2"
        }
        lgr = sess.post(api_url, data=params)
        
        lgr = lgr.json()
        assert 'login' in lgr, 'No login'
        print('\t' + lgr['login']['result'])
    except Exception as e:
        raise e
        print('\tFailed : ' + str(e))

exclusions = set()
languages = list(sorted(filter(lambda a : a not in exclusions, Language.get().keys())))
print(languages)
for language in languages:
    login(language)
from requests import Session, get as request_get, post as request_post
import uuid, os
from dotenv import load_dotenv
if not load_dotenv():
    raise Exception("Failed to load .env file")
AZURE_QUOTA_CHAR = 1000000
AZURE_QUOTA_ELEMENT = 1000
AZURE_ENDPOINT = "https://api-apc.cognitive.microsofttranslator.com"
AZURE_REGION = "japanwest"
AZURE_KEY=  os.environ['AZURE_KEY']

GOOGLE_QUOTA_CHAR = 1000000
GOOGLE_QUOTA_ELEMENT = 1000
GOOGLE_PROJECT_ID = os.environ['GOOGLE_PROJECT_ID']
GOOGLE_SERVICE_ACCOUNT = os.environ['GOOGLE_SERVICE_ACCOUNT_JSON']

GOOGLE_ENDPOINT = f"https://translation.googleapis.com/v3beta1/projects/{GOOGLE_PROJECT_ID}:translateText"
def _google_auth_token():
    """
    This function would return a valid google auth token.
    """
    import json, jwt, time
    def load_json_credentials(filename):
        ''' Load the Google Service Account Credentials from Json file '''
        with open(filename, 'r') as f:
            data = f.read()
    
        return json.loads(data)
    
    def load_private_key(json_cred):
        ''' Return the private key from the json credentials '''
    
        return json_cred['private_key']
    
    def create_signed_jwt(pkey, pkey_id, email, scope):
        '''
        Create a Signed JWT from a service account Json credentials file
        This Signed JWT will later be exchanged for an Access Token
        '''
        # Google Endpoint for creating OAuth 2.0 Access Tokens from Signed-JWT
        auth_url = "https://www.googleapis.com/oauth2/v4/token"
        issued = int(time.time()) 
        expires = issued + 60 * 60 	# expires_in is in seconds
        # Note: this token expires and cannot be refreshed. The token must be recreated
        # JWT Headers
        additional_headers = {
                'kid': pkey_id,
                "alg": "RS256", # Google uses SHA256withRSA
                "typ": "JWT"
        }
        # JWT Payload
        payload = {
            "iss": email,		# Issuer claim
            "sub": email,		# Issuer claim
            "aud": auth_url,	# Audience claim
            "iat": issued,		# Issued At claim
            "exp": expires,		# Expire time
            "scope": scope		# Permissions
        }
        # Encode the headers and payload and sign creating a Signed JWT (JWS)
        sig = jwt.encode(payload, pkey, algorithm="RS256", headers=additional_headers)
        return sig
    def exchangeJwtForAccessToken(signed_jwt):
        '''
        This function takes a Signed JWT and exchanges it for a Google OAuth Access Token
        '''
    
        auth_url = "https://www.googleapis.com/oauth2/v4/token"
    
        params = {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": signed_jwt
        }
    
        r = request_post(auth_url, data=params)
    
        if r.ok:
            res = r.json()
            return(res['access_token'], '')
        return None, r.text
    scopes = 'https://www.googleapis.com/auth/cloud-translation'
    cred = load_json_credentials(GOOGLE_SERVICE_ACCOUNT)
    private_key = load_private_key(cred)
    s_jwt = create_signed_jwt(
            private_key,
            cred['private_key_id'],
            cred['client_email'],
            scopes)
 
    token, err = exchangeJwtForAccessToken(s_jwt)
    if err:
        raise Exception(err)
    return token

def _translate_azure(texts, target):
    """
    This function would take a list of texts and translate them to target language.
    It would return a list of translated texts and the remaining texts that could not be translated.
    """
    with Session() as sess:
        sess.params = {
            'api-version': '3.0',
            'from': 'en',
            'to': target
        }
        sess.headers = {
            'Ocp-Apim-Subscription-Key': AZURE_KEY,
            'Ocp-Apim-Subscription-Region': AZURE_REGION,
            'Content-type': 'application/json',
            'X-ClientTraceId': str(uuid.uuid4())
        }
        results = []
        done = []
        while len(texts):
            data = []
            char_count = 0
            element_count = 0
            for text in texts:
                if char_count + len(text) > AZURE_QUOTA_CHAR:
                    break
                if element_count + 1 > AZURE_QUOTA_ELEMENT:
                    break
                element_count += 1
                char_count += len(text)
                data.append({'Text': text})
            res = sess.post(f"{AZURE_ENDPOINT}/translate", json=data)
            
            if res.status_code != 200:
                print(res.status_code, res.text)
                return {}, texts
            
            print("Cost", res.headers['X-metered-usage'])
            res = res.json()
            results.extend([x['translations'][0]['text'] for x in res])
            done.extend(texts[:element_count])
            texts = texts[element_count:]
        return dict(zip(done, results)), texts
GOOGLE_KEY = "" # _google_auth_token()
RETRY = 5
def _translate_google(texts, target):
    """
    This function would take a list of texts and translate them to target language.
    It would return a list of translated texts and the remaining texts that could not be translated.
    """
    global RETRY, GOOGLE_KEY
    with Session() as sess:
        sess.headers = {
            'Content-Type': 'application/json',
            
            'X-Goog-User-Project' : GOOGLE_PROJECT_ID,
            'Accept' : 'application/json'
        }
        results = []
        done = []
        while len(texts):
            sess.headers.update({
                'Authorization' : f'Bearer {GOOGLE_KEY}',
            })
            data = {
                'sourceLanguageCode': 'en',
                'targetLanguageCode': target,
                'contents': texts[:GOOGLE_QUOTA_ELEMENT],
            }
            res = sess.post(GOOGLE_ENDPOINT, json=data)
            if res.status_code != 200:
                resp_json = res.json()
                if res.status_code == 401:
                    if any(x['reason'] == 'ACCESS_TOKEN_EXPIRED' for x in resp_json['error']['details']):
                        if RETRY > 0:
                            print("Google auth token expired, retrying")
                            RETRY -= 1
                            GOOGLE_KEY = _google_auth_token()
                            continue
                        else:
                            raise Exception("Google auth token expired with all the retrying failed")
                print(res.status_code, resp_json)
                return {}, texts
            elif RETRY < 5:
                RETRY = 5
            res = res.json()
            results.extend([x['translatedText'] for x in res['translations']])
            done.extend(texts[:GOOGLE_QUOTA_ELEMENT])
            texts = texts[GOOGLE_QUOTA_ELEMENT:]
        return dict(zip(done, results)), texts

def _translate_yandex(texts, target):
    """
    This function would take a list of texts and translate them to target language.
    It would return a list of translated texts and the remaining texts that could not be translated.
    """
def _translate_aws(texts, target):
    """
    This function would take a list of texts and translate them to target language.
    It would return a list of translated texts and the remaining texts that could not be translated.
    """
    pass
def translate(texts, target):
    """
    This function would take a list of texts and translate them to target language.
    It would return a list of translated texts and the remaining texts that could not be translated.
    """
    # return _translate_google(texts, target)
    return _translate_google(texts, target)

if __name__ == "__main__":
    pass
    # token = _google_auth_token()
    # print(token)
    print(translate(["I would really like to drive your car around the block a few times!", "weight"], "mr"))
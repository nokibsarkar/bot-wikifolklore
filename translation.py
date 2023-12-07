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
    return "ya29.c.c0AY_VpZjMzK-gRPy97t9tmakPbP3IYa-l3UZLuh_KSTcZUX2rypVRMYrosTqDS7SnDqtcGpmNlUodYWAJ6QN_Uf-VTEWAxjB4LOoJGrPECJnMaIVio5uRRSuAjIG-_iZqVIm1f3W_p8x2qRFAgY5C0tVrDHZ21rSH28qu8sxi3CPmGRLvB7RrK17yqsfqhlbyCKK2mcgSvqM93qlxdJJrJmTpWYVTlit7plCu7U8y6oCTxg0P0WmdIA7ml-xpkd46pSjs534tjChOH8PYe03KBZsGndpz--FQeiSMrAi4NMFIM9SGiI4iX8BuLY9tD2JCBjwypVFo9IcCugC7ocD5UA5TqPRv2Y7xqlbXWWgEw4vb6CpsqBPZLYfKE385Aor9xz7S7o-W-gJ6tZopJqRfV7It9Fvhvo-lWu7Qb2r09ry9wd-Sf-wRgssyq22v7nehzlJhuy2Sqnd3mp500n4RF_12zBcw-FY8ecqwX6Mj1I9-OJ8nSwo4_klMuJ2JiJ5jR5y6gweYnx1VmVSzRW4ovaOowQ2aIJnyU3OYvUBWoB0jnOZhZQpoYY4pnUV_5JY5aRr2I6_jZmUy45UOR2_2Urj_l7ln54Wfmr4jvYXM9B2W740upbMtkfuX3p-1SWoBva5wwxou9nhcQywJ8Xi3tdFtOg3Ze1vyhIpk-v2qSWkz9lzuz5d1yjQnolr08SYzh5Uo2tyS2fX7JMbQQc5pVkbhr1XQb_MvSJ3BuXrWd_Osymfvdbbn1wxo9wfdavu4pS9-nnzcR4O6ir0mytc7kkF72W94yJ9gytR7s5XJiBji5WUX1vJbWov7jfcFpcz90-SjamieYd28W6an7pmfmcq0utxRSbfd9XO4h-Zd49dg30wkaB6y4-04gscO_jpfvIk36W_RrU1pU0ir2kjZwSfs1OfxyYoVx8ZQ5ZUWSISvql04BaZjvnIcXB77XQdwV5UsWVInuF2Ia5fXX1r4j-2dBQ7u8f2sxJOWO08y7idexInfBMi8iMk"
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
        expires = issued + 1	# expires_in is in seconds
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
GOOGLE_KEY =  _google_auth_token()
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

def _translate_google(texts, target):
    """
    This function would take a list of texts and translate them to target language.
    It would return a list of translated texts and the remaining texts that could not be translated.
    """
    with Session() as sess:
        sess.headers = {
            'Content-Type': 'application/json',
            'Authorization' : f'Bearer {GOOGLE_KEY}',
            'X-Goog-User-Project' : GOOGLE_PROJECT_ID,
            'Accept' : 'application/json'
        }
        results = []
        done = []
        while len(texts):
            data = {
                'sourceLanguageCode': 'en',
                'targetLanguageCode': target,
                'contents': texts[:GOOGLE_QUOTA_ELEMENT],
            }
            res = sess.post(GOOGLE_ENDPOINT, json=data)
            if res.status_code != 200:
                resp_json = res.json()
                print(res.status_code, resp_json)
                return {}, texts
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
    print(GOOGLE_KEY)
    print(translate(["I would really like to drive your car around the block a few times!", "weight"], "mr"))
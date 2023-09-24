from requests import Session
import uuid
AZURE_QUOTA_CHAR = 1000000
AZURE_QUOTA_ELEMENT = 1000
AZURE_ENDPOINT = "https://api-apc.cognitive.microsofttranslator.com"
AZURE_REGION = "japanwest"
AZURE_KEY="81cdd5ee33aa4147881ff1fa1ed375fd"


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
            if res.status_code != 403:
                return [], texts
            res = res.json()
            results.extend([x['translations'][0]['text'] for x in res])
            texts = texts[element_count:]
            

        return results, texts

def _translate_google(texts, target):
    """
    This function would take a list of texts and translate them to target language.
    It would return a list of translated texts and the remaining texts that could not be translated.
    """

def _translate_yandex(texts, target):
    """
    This function would take a list of texts and translate them to target language.
    It would return a list of translated texts and the remaining texts that could not be translated.
    """
def translate(texts, target):
    """
    This function would take a list of texts and translate them to target language.
    It would return a list of translated texts and the remaining texts that could not be translated.
    """
    return _translate_azure(texts, target)

if __name__ == "__main__":
    print(translate(["Hello World", "weight"], "bn"))
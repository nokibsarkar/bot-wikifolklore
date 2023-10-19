from enum import Enum
class Language(Enum):
    @staticmethod
    def get():
        result = {}
        for c in Language:
            result[c.value] = c.name
        return result
    Bangla_Wikipedia = "bn"
    Hindi_Wikipedia = "hi"
    Urdu_Wikipedia = "ur"
    Tamil_Wikipedia = "ta"
    Telugu_Wikipedia = "te"
    Marathi_Wikipedia = "mr"
    Malayalam_Wikipedia = "ml"
    Gujarati_Wikipedia = "gu"
    Kannada_Wikipedia = "kn"
    Punjabi_Wikipedia = "pa"
    Nepali_Wikipedia = "ne"
    Assamese_Wikipedia = "as"
    Odia_Wikipedia = "or"
    Sanskrit_Wikipedia = "sa"
    Konkani_Wikipedia = "kok"
    Arabic_Wikipedia = "ar"
    Persian_Wikipedia = "fa"
    French_Wikipedia = "fr"
    German_Wikipedia = "de"
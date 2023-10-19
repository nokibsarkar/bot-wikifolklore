from enum import Enum
class Country(Enum):
    @staticmethod
    def get():
        result = {}
        for c in Country:
            result[c.value] = c.name
        return result
    Bangladesh = "BD"
    India = "IN"
    USnited_States = "US"
    Pakistan = "PAK"
    United_Kingdom = "UK"
    Canada = "CA"
    Australia = "AU"
    New_Zealand = "NZ"
    South_Africa = "ZA"
    Ireland = "IE"
    Nepal = "NP"
    Sri_Lanka = "LK"
    Philippines = "PH"
    Singapore = "SG"
    Malaysia = "MY"
    Hong_Kong = "HK"
    Macau = "MO"
    Brunei = "BN"
    Maldives = "MV"
    Fiji = "FJ"
    Mauritius = "MU"
    Seychelles = "SC"
    Trinidad_and_Tobago = "TT"
    Jamaica = "JM"
    Saudi_Arabia = "SA"
    Kuwait = "KW"
    Qatar = "QA"
    Bahrain = "BH"
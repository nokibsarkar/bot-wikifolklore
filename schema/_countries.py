

from enum import Enum
class Country(Enum):
    @staticmethod
    def get():
        result = {}
        for c in Country:
            result[c.value] = c.name
        return result
    
    Afghanistan   =   "AF"
    Albania   =   "AL"
    Algeria   =   "DZ"
    American_Samoa   =   "AS"
    Andorra   =   "AD"
    Angola   =   "AO"
    Anguilla   =   "AI"
    Antarctica   =   "AQ"
    Antigua_and_Barbuda   =   "AG"
    Argentina   =   "AR"
    Armenia   =   "AM"
    Aruba   =   "AW"
    Australia   =   "AU"
    Austria   =   "AT"
    Azerbaijan   =   "AZ"
    Bahamas  =   "BS"
    Bahrain   =   "BH"
    Bangladesh   =   "BD"
    Barbados   =   "BB"
    Belarus   =   "BY"
    Belgium   =   "BE"
    Belize   =   "BZ"
    Benin   =   "BJ"
    Bermuda   =   "BM"
    Bhutan   =   "BT"
    Bolivia_Plurinational   =   "BO"
    Bonaire_Sint_Eustatius_and_Saba   =   "BQ"
    Bosnia_and_Herzegovina   =   "BA"
    Botswana   =   "BW"
    Bouvet_Island   =   "BV"
    Brazil   =   "BR"
    British_Indian_Ocean_Territory   =   "IO"
    Brunei_Darussalam   =   "BN"
    Bulgaria   =   "BG"
    Burkina_Faso   =   "BF"
    Burundi   =   "BI"
    Cabo_Verde   =   "CV"
    Cambodia   =   "KH"
    Cameroon   =   "CM"
    Canada   =   "CA"
    Cayman_Islands  =   "KY"
    Republic_Central_African   =   "CF"
    Chad   =   "TD"
    Chile   =   "CL"
    China   =   "CN"
    Christmas_Island   =   "CX"
    Cocos_Keeling_Islands   =   "CC"
    Colombia   =   "CO"
    Comoros  =   "KM"
    Republic_of_Congo_Democratic   =   "CD"
    Congo  =   "CG"
    Cook_Islands   =   "CK"
    Costa_Rica   =   "CR"
    Croatia   =   "HR"
    Cuba   =   "CU"
    Cura_ao   =   "CW"
    Cyprus   =   "CY"
    Czechia   =   "CZ"
    C_te_d_Ivoire   =   "CI"
    Denmark   =   "DK"
    Djibouti   =   "DJ"
    Dominica   =   "DM"
    Dominican_Republic  =   "DO"
    Ecuador   =   "EC"
    Egypt   =   "EG"
    El_Salvador   =   "SV"
    Equatorial_Guinea   =   "GQ"
    Eritrea   =   "ER"
    Estonia   =   "EE"
    Eswatini   =   "SZ"
    Ethiopia   =   "ET"
    Falkland_Islands_Malvinas   =   "FK"
    Faroe_Islands  =   "FO"
    Fiji   =   "FJ"
    Finland   =   "FI"
    France   =   "FR"
    French_Guiana   =   "GF"
    French_Polynesia   =   "PF"
    French_Southern_Territories  =   "TF"
    Gabon   =   "GA"
    Gambia  =   "GM"
    Georgia   =   "GE"
    Germany   =   "DE"
    Ghana   =   "GH"
    Gibraltar   =   "GI"
    Greece   =   "GR"
    Greenland   =   "GL"
    Grenada   =   "GD"
    Guadeloupe   =   "GP"
    Guam   =   "GU"
    Guatemala   =   "GT"
    Guernsey   =   "GG"
    Guinea   =   "GN"
    Guinea_Bissau   =   "GW"
    Guyana   =   "GY"
    Haiti   =   "HT"
    Heard_Island_and_McDonald_Islands   =   "HM"
    Holy_See  =   "VA"
    Honduras   =   "HN"
    Hong_Kong   =   "HK"
    Hungary   =   "HU"
    Iceland   =   "IS"
    India   =   "IN"
    Indonesia   =   "ID"
    Iran   =   "IR"
    Iraq   =   "IQ"
    Ireland   =   "IE"
    Isle_of_Man   =   "IM"
    Israel   =   "IL"
    Italy   =   "IT"
    Jamaica   =   "JM"
    Japan   =   "JP"
    Jersey   =   "JE"
    Jordan   =   "JO"
    Kazakhstan   =   "KZ"
    Kenya   =   "KE"
    Kiribati   =   "KI"
    North_Korea   =   "KP"
    South_Korea   =   "KR"
    Kuwait   =   "KW"
    Kyrgyzstan   =   "KG"
    Lao   =   "LA"
    Latvia   =   "LV"
    Lebanon   =   "LB"
    Lesotho   =   "LS"
    Liberia   =   "LR"
    Libya   =   "LY"
    Liechtenstein   =   "LI"
    Lithuania   =   "LT"
    Luxembourg   =   "LU"
    Macao   =   "MO"
    Madagascar   =   "MG"
    Malawi   =   "MW"
    Malaysia   =   "MY"
    Maldives   =   "MV"
    Mali   =   "ML"
    Malta   =   "MT"
    Marshall_Islands  =   "MH"
    Martinique   =   "MQ"
    Mauritania   =   "MR"
    Mauritius   =   "MU"
    Mayotte   =   "YT"
    Mexico   =   "MX"
    Micronesia   =   "FM"
    Moldova   =   "MD"
    Monaco   =   "MC"
    Mongolia   =   "MN"
    Montenegro   =   "ME"
    Montserrat   =   "MS"
    Morocco   =   "MA"
    Mozambique   =   "MZ"
    Myanmar   =   "MM"
    Namibia   =   "NA"
    Nauru   =   "NR"
    Nepal   =   "NP"
    Netherlands   =   "NL"
    New_Caledonia   =   "NC"
    New_Zealand   =   "NZ"
    Nicaragua   =   "NI"
    Niger   =   "NE"
    Nigeria   =   "NG"
    Niue   =   "NU"
    Norfolk_Island   =   "NF"
    North_Macedonia   =   "MK"
    Northern_Mariana_Islands   =   "MP"
    Norway   =   "NO"
    Oman   =   "OM"
    Pakistan   =   "PK"
    Palau   =   "PW"
    Palestine   =   "PS"
    Panama   =   "PA"
    Papua_New_Guinea   =   "PG"
    Paraguay   =   "PY"
    Peru   =   "PE"
    Philippines  =   "PH"
    Pitcairn   =   "PN"
    Poland   =   "PL"
    Portugal   =   "PT"
    Puerto_Rico   =   "PR"
    Qatar   =   "QA"
    Romania   =   "RO"
    Russia   =   "RU"
    Rwanda   =   "RW"
    R_union   =   "RE"
    Saint_Barth_lemy   =   "BL"
    Saint_Helena_Ascension_and_Tristan_da_Cunha   =   "SH"
    Saint_Kitts_and_Nevis   =   "KN"
    Saint_Lucia   =   "LC"
    Saint_Martin_French_part  =   "MF"
    Saint_Pierre_and_Miquelon   =   "PM"
    Saint_Vincent_and_Grenadines   =   "VC"
    Samoa   =   "WS"
    San_Marino   =   "SM"
    Sao_Tome_and_Principe   =   "ST"
    Saudi_Arabia   =   "SA"
    Senegal   =   "SN"
    Serbia   =   "RS"
    Seychelles   =   "SC"
    Sierra_Leone   =   "SL"
    Singapore   =   "SG"
    Sint_Maarten_Dutch_part  =   "SX"
    Slovakia   =   "SK"
    Slovenia   =   "SI"
    Solomon_Islands   =   "SB"
    Somalia   =   "SO"
    South_Africa   =   "ZA"
    South_Georgia_and_South_Sandwich_Islands   =   "GS"
    South_Sudan   =   "SS"
    Spain   =   "ES"
    Sri_Lanka   =   "LK"
    Sudan  =   "SD"
    Suriname   =   "SR"
    Svalbard_and_Jan_Mayen   =   "SJ"
    Sweden   =   "SE"
    Switzerland   =   "CH"
    Syria   =   "SY"
    Taiwan   =   "TW"
    Tajikistan   =   "TJ"
    Tanzania   =   "TZ"
    Thailand   =   "TH"
    Timor_Leste   =   "TL"
    Togo   =   "TG"
    Tokelau   =   "TK"
    Tonga   =   "TO"
    Trinidad_and_Tobago   =   "TT"
    Tunisia   =   "TN"
    Turkmenistan   =   "TM"
    Turks_and_Caicos_Islands   =   "TC"
    Tuvalu   =   "TV"
    Turkiye   =   "TR"
    Uganda   =   "UG"
    Ukraine   =   "UA"
    United_Arab_Emirates   =   "AE"
    United_Kingdom   =   "UK"
    United_States_Minor_Outlying_Islands   =   "UM"
    United_States_of_America   =   "US"
    Uruguay   =   "UY"
    Uzbekistan   =   "UZ"
    Vanuatu   =   "VU"
    Venezuela_Bolivarian   =   "VE"
    Vietnam   =   "VN"
    Virgin_Islands_British   =   "VG"
    Virgin_Islands_US   =   "VI"
    Wallis_and_Futuna   =   "WF"
    Western_Sahara  =   "EH"
    Yemen   =   "YE"
    Zambia   =   "ZM"
    Zimbabwe   =   "ZW"
    land_Islands   =   "AX"
from enum import Enum
class Language(Enum):
    @staticmethod
    def get():
        result = {}
        for c in Language:
            result[c.value.replace("_", "-")] = c.name
        return result
    German_Wikipedia = "de"
    French_Wikipedia = "fr"
    English_Wikipedia = "en"
    Spanish_Wikipedia = "es"
    Japanese_Wikipedia = "ja"
    Russian_Wikipedia = "ru"
    Portuguese_Wikipedia = "pt"
    Chinese_Wikipedia = "zh"
    Italian_Wikipedia = "it"
    Arabic_Wikipedia = "ar"
    Persian_Wikipedia = "fa"
    Polish_Wikipedia = "pl"
    Dutch_Wikipedia = "nl"
    Ukrainian_Wikipedia = "uk"
    Indonesian_Wikipedia = "id"
    Hebrew_Wikipedia = "he"
    Turkish_Wikipedia = "tr"
    Czech_Wikipedia = "cs"
    Swedish_Wikipedia = "sv"
    Korean_Wikipedia = "ko"
    Vietnamese_Wikipedia = "vi"
    Finnish_Wikipedia = "fi"
    Hungarian_Wikipedia = "hu"
    Catalan_Wikipedia = "ca"
    Thai_Wikipedia = "th"
    Hindi_Wikipedia = "hi"
    Norwegian_Wikipedia = "no"
    Bengali_Wikipedia = "bn"
    Greek_Wikipedia = "el"
    Romanian_Wikipedia = "ro"
    Uzbek_Wikipedia = "uz"
    Serbian_Wikipedia = "sr"
    Danish_Wikipedia = "da"
    Bulgarian_Wikipedia = "bg"
    Azerbaijani_Wikipedia = "az"
    Malay_Wikipedia = "ms"
    Slovak_Wikipedia = "sk"
    Estonian_Wikipedia = "et"
    Basque_Wikipedia = "eu"
    Armenian_Wikipedia = "hy"
    Croatian_Wikipedia = "hr"
    Lithuanian_Wikipedia = "lt"
    Slovene_Wikipedia = "sl"
    Tamil_Wikipedia = "ta"
    Kannada_Wikipedia = "kn"
    Kazakh_Wikipedia = "kk"
    Esperanto_Wikipedia = "eo"
    Latvian_Wikipedia = "lv"
    Cantonese_Wikipedia = "zh_yue"
    Urdu_Wikipedia = "ur"
    Belarusian_Wikipedia = "be"
    Malayalam_Wikipedia = "ml"
    Galician_Wikipedia = "gl"
    Macedonian_Wikipedia = "mk"
    Georgian_Wikipedia = "ka"
    Albanian_Wikipedia = "sq"
    Afrikaans_Wikipedia = "af"
    Hausa_Wikipedia = "ha"
    Marathi_Wikipedia = "mr"
    Egyptian_Arabic_Wikipedia = "arz"
    Telugu_Wikipedia = "te"
    Serbo_Croatian_Wikipedia = "sh"
    Tagalog_Wikipedia = "tl"
    Cebuano_Wikipedia = "ceb"
    Icelandic_Wikipedia = "is"
    Bosnian_Wikipedia = "bs"
    Latin_Wikipedia = "la"
    Burmese_Wikipedia = "my"
    Sorani_Kurdish_Wikipedia = "ckb"
    Norwegian_Nynorsk_Wikipedia = "nn"
    Javanese_Wikipedia = "jv"
    Belarusian_Wikipedia_Classical = "be-tarask"
    Nepali_Wikipedia = "ne"
    Asturian_Wikipedia = "ast"
    Punjabi_Wikipedia = "pa"
    Swahili_Wikipedia = "sw"
    Mongolian_Wikipedia = "mn"
    Assamese_Wikipedia = "as"
    Welsh_Wikipedia = "cy"
    South_Azerbaijani_Wikipedia = "azb"
    Kurdish_Wikipedia = "ku"
    Igbo_Wikipedia = "ig"
    Occitan_Wikipedia = "oc"
    Tatar_Wikipedia = "tt"
    Breton_Wikipedia = "br"
    Sinhala_Wikipedia = "si"
    Alemannic_Wikipedia = "als"
    Irish_Wikipedia = "ga"
    Scots_Wikipedia = "sco"
    Southern_Min_Wikipedia = "zh-min-nan"
    Minangkabau_Wikipedia = "min"
    Luxembourgish_Wikipedia = "lb"
    Bashkir_Wikipedia = "ba"
    Kyrgyz_Wikipedia = "ky"
    Aragonese_Wikipedia = "an"
    Gujarati_Wikipedia = "gu"
    Somali_Wikipedia = "so"
    Haitian_Creole_Wikipedia = "ht"
    Khmer_Wikipedia = "km"
    Tajik_Wikipedia = "tg"
    West_Frisian_Wikipedia = "fy"
    Yoruba_Wikipedia = "yo"
    Tswana_Wikipedia = "tn"
    Western_Punjabi_Wikipedia = "pnb"
    Sanskrit_Wikipedia = "sa"
    Waray_Wikipedia = "war"
    Amharic_Wikipedia = "am"
    Bavarian_Wikipedia = "bar"
    Classical_Chinese_Wikipedia = "zh-classical"
    Sundanese_Wikipedia = "su"
    Maithili_Wikipedia = "mai"
    Odia_Wikipedia = "or"
    Ido_Wikipedia = "io"
    Quechua_Wikipedia = "qu"
    Sicilian_Wikipedia = "scn"
    Twi_Wikipedia = "tw"
    Bhojpuri_Wikipedia = "bh"
    Chuvash_Wikipedia = "cv"
    Yakut_Wikipedia = "sah"
    Chechen_Wikipedia = "ce"
    Pashto_Wikipedia = "ps"
    Piedmontese_Wikipedia = "pms"
    Santali_Wikipedia = "sat"
    Wu_Wikipedia = "wuu"
    Malagasy_Wikipedia = "mg"
    Tyap_Wikipedia = "kcg"
    Venetian_Wikipedia = "vec"
    Balinese_Wikipedia = "ban"
    Lombard_Wikipedia = "lmo"
    Madurese_Wikipedia = "mad"
    Central_Bikol_Wikipedia = "bcl"
    Crimean_Tatar_Wikipedia = "crh"
    Zulu_Wikipedia = "zu"
    Western_Armenian_Wikipedia = "hyw"
    Sindhi_Wikipedia = "sd"
    Mazanderani_Wikipedia = "mzn"
    Moroccan_Arabic_Wikipedia = "ary"
    Abkhaz_Wikipedia = "ab"
    Karakalpak_Wikipedia = "kaa"
    Silesian_Wikipedia = "szl"
    Interlingua_Wikipedia = "ia"
    Faroese_Wikipedia = "fo"
    Rusyn_Wikipedia = "rue"
    Scottish_Gaelic_Wikipedia = "gd"
    Yiddish_Wikipedia = "yi"
    Fiji_Hindi_Wikipedia = "hif"
    Lao_Wikipedia = "lo"
    Low_German_Wikipedia = "nds"
    Mirandese_Wikipedia = "mwl"
    Dagbani_Wikipedia = "dag"
    Maltese_Wikipedia = "mt"
    Acehnese_Wikipedia = "ace"
    Kinyarwanda_Wikipedia = "rw"
    Turkmen_Wikipedia = "tk"
    Doteli_Wikipedia = "dty"
    Neapolitan_Wikipedia = "nap"
    Oromo_Wikipedia = "om"
    Sardinian_Wikipedia = "sc"
    Walloon_Wikipedia = "wa"
    Ligurian_Wikipedia = "lij"
    Zazaki_Wikipedia = "diq"
    Interlingue_Wikipedia = "ie"
    Guarani_Wikipedia = "gn"
    Talysh_Wikipedia = "tly"
    Kashmiri_Wikipedia = "ks"
    Volapük_Wikipedia = "vo"
    Banjarese_Wikipedia = "bjn"
    Hawaiian_Wikipedia = "haw"
    Shona_Wikipedia = "sn"
    Corsican_Wikipedia = "co"
    Fon_Wikipedia = "fon"
    Friulian_Wikipedia = "fur"
    Limburgish_Wikipedia = "li"
    Upper_Sorbian_Wikipedia = "hsb"
    Emilian_Romagnol_Wikipedia = "eml"
    Mingrelian_Wikipedia = "xmf"
    Picard_Wikipedia = "pcd"
    Udmurt_Wikipedia = "udm"
    Zeelandic_Wikipedia = "zea"
    Ladin_Wikipedia = "lld"
    Aymara_Wikipedia = "ay"
    Ilocano_Wikipedia = "ilo"
    Uyghur_Wikipedia = "ug"
    Ossetian_Wikipedia = "os"
    Avar_Wikipedia = "av"
    Cornish_Wikipedia = "kw"
    Franco_Provençal_Wikipedia = "frp"
    Inari_Sámi_Wikipedia = "smn"
    Kapampangan_Wikipedia = "pam"
    Tibetan_Wikipedia = "bo"
    Tumbuka_Wikipedia = "tum"
    West_Flemish_Wikipedia = "vls"
    Wolof_Wikipedia = "wo"
    Hakka_Wikipedia = "hak"
    Maldivian_Wikipedia = "dv"
    Newar_Wikipedia = "new"
    Pennsylvania_Dutch_Wikipedia = "pdc"
    Tuvan_Wikipedia = "tyv"
    Dutch_Low_Saxon_Wikipedia = "nds-nl"
    Judaeo_Spanish_Wikipedia = "lad"
    Dzongkha_Wikipedia = "dz"
    Eastern_Min_Wikipedia = "cdo"
    Fula_Wikipedia = "ff"
    Gan_Wikipedia = "gan"
    Ghanaian_Pidgin_Wikipedia = "gpe"
    Livvi_Karelian_Wikipedia = "olo"
    Lower_Sorbian_Wikipedia = "dsb"
    Nias_Wikipedia = "nia"
    Old_Church_Slavonic_Wikipedia = "cu"
    Sakizaya_Wikipedia = "szy"
    Veps_Wikipedia = "vep"
    Samogitian_Wikipedia = "bat-smg"
    Bislama_Wikipedia = "bi"
    Kotava_Wikipedia = "avk"
    Lingua_Franca_Nova_Wikipedia = "lfn"
    Moksha_Wikipedia = "mdf"
    Mon_Wikipedia = "mnw"
    Northern_Sámi_Wikipedia = "se"
    Zhuang_Wikipedia = "za"
    Banyumasan_Wikipedia = "map_bms"
    Kabyle_Wikipedia = "kab"
    Kashubian_Wikipedia = "csb"
    Nahuatl_Wikipedia = "nah"
    North_Frisian_Wikipedia = "frr"
    Papiamento_Wikipedia = "pap"
    Romansh_Wikipedia = "rm"
    Buryat_Wikipedia = "bxr"
    Ewe_Wikipedia = "ee"
    Jamaican_Patois_Wikipedia = "jam"
    Māori_Wikipedia = "mi"
    Romani_Wikipedia = "rmy"
    Shan_Wikipedia = "shn"
    Sotho_Wikipedia = "st"
    Võro_Wikipedia = "fiu_vro"
    Aramaic_Wikipedia = "arc"
    Awadhi_Wikipedia = "awa"
    Bishnupriya_Manipuri_Wikipedia = "bpy"
    Cherokee_Wikipedia = "chr"
    Gilaki_Wikipedia = "glk"
    Gun_Wikipedia = "guw"
    Nigerian_Pidgin_Wikipedia = "pcm"
    Tarantino_Wikipedia = "roa-tara"
    Tsonga_Wikipedia = "ts"
    Wayuu_Wikipedia = "guc"
    Extremaduran_Wikipedia = "ext"
    Tulu_Wikipedia = "tcy"
    Amis_Wikipedia = "ami"
    Angika_Wikipedia = "anp"
    Aromanian_Wikipedia = "roa-rup"
    Cheyenne_Wikipedia = "chy"
    Erzya_Wikipedia = "myv"
    Gothic_Wikipedia = "got"
    Greenlandic_Wikipedia = "kl"
    Kabiye_Wikipedia = "kbp"
    Lojban_Wikipedia = "jbo"
    Manx_Wikipedia = "gv"
    Meitei_Wikipedia = "mni"
    Saraiki_Wikipedia = "skr"
    Saterland_Frisian_Wikipedia = "stq"
    Konkani_Wikipedia = "gom"
    Ripuarian_Wikipedia = "ksh"
    Atayal_Wikipedia = "tay"
    Buginese_Wikipedia = "bug"
    Chavacano_Wikipedia = "cbk-zam"
    Gagauz_Wikipedia = "gag"
    Kalmyk_Wikipedia = "xal"
    Meadow_Mari_Wikipedia = "mhr"
    Novial_Wikipedia = "nov"
    Adyghe_Wikipedia = "ady"
    Gorontalo_Wikipedia = "gor"
    Gurene_Wikipedia = "gur"
    Ingush_Wikipedia = "inh"
    Inuktitut_Wikipedia = "iu"
    Kirundi_Wikipedia = "rn"
    Komi_Wikipedia = "kv"
    Lezgian_Wikipedia = "lez"
    Tongan_Wikipedia = "to"
    Cree_Wikipedia = "cr"
    Hill_Mari_Wikipedia = "mrj"
    Kabardian_Wikipedia = "kbd"
    Karachay_Balkar_Wikipedia = "krc"
    Luganda_Wikipedia = "lg"
    Navajo_Wikipedia = "nv"
    Norman_Wikipedia = "nrm"
    Shilha_Wikipedia = "shi"
    Southern_Altai_Wikipedia = "alt"
    Tigrinya_Wikipedia = "ti"
    Tok_Pisin_Wikipedia = "tpi"
    Xhosa_Wikipedia = "xh"
    Chamorro_Wikipedia = "ch"
    Kikuyu_Wikipedia = "ki"
    Lingala_Wikipedia = "ln"
    Northern_Sotho_Wikipedia = "nso"
    Venda_Wikipedia = "ve"
    Dinka_Wikipedia = "din"
    Pa_O_Wikipedia = "blk"
    Palatine_German_Wikipedia = "pfl"
    Pontic_Wikipedia = "pnt"
    Samoan_Wikipedia = "sm"
    Swazi_Wikipedia = "ss"
    Tahitian_Wikipedia = "ty"
    Tetum_Wikipedia = "tet"
    Bambara_Wikipedia = "bm"
    Atikamekw_Wikipedia = "atj"
    Chewa_Wikipedia = "ny"
    Latgalian_Wikipedia = "ltg"
    Paiwan_Wikipedia = "pwn"
    Pangasinan_Wikipedia = "pag"
    Seediq_Wikipedia = "trv"
    Fante_Wikipedia = "fat"
    Iñupiaq_Wikipedia = "ik"
    Kongo_Wikipedia = "kg"
    Lak_Wikipedia = "lbe"
    N_Ko_Wikipedia = "nqo"
    Norfuk_Wikipedia = "pih"
    Sranan_Tongo_Wikipedia = "srn"
    Fijian_Wikipedia = "fj"
    Guianan_Creole_Wikipedia = "gcr"
    Komi_Permyak_Wikipedia = "koi"
    Pali_Wikipedia = "pi"
    Sango_Wikipedia = "sg"
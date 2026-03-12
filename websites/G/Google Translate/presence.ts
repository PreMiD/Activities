const presence = new Presence({
  clientId: '705033229719175179',
})

function languageCode(language: string): string {
  switch (language) {
    case 'auto':
      return 'Auto Detect'
    case 'ace':
      return 'Achinese'
    case 'ady':
      return 'Adyghe'
    case 'aa':
      return 'Afar'
    case 'af':
      return 'Afrikaans'
    case 'ahr':
      return 'Ahirani'
    case 'sq':
      return 'Albanian'
    case 'am':
      return 'Amharic'
    case 'ar':
      return 'Arabic'
    case 'an':
      return 'Aragonese'
    case 'hy':
      return 'Armenian'
    case 'as':
      return 'Assamese'
    case 'av':
      return 'Avaric'
    case 'ay':
      return 'Aymara'
    case 'az':
      return 'Azerbaijani'
    case 'bfy':
      return 'Bagheli'
    case 'bal':
      return 'Baluchi'
    case 'bm':
      return 'Bambara'
    case 'bxg':
      return 'Bangala'
    case 'bci':
      return 'Baoulé'
    case 'ba':
      return 'Bashkir'
    case 'eu':
      return 'Basque'
    case 'bbc':
      return 'Batak Toba'
    case 'be':
      return 'Belarussian'
    case 'bn':
      return 'Bengali'
    case 'bew':
      return 'Betawi'
    case 'bho':
      return 'Bhojpuri'
    case 'brx':
      return 'Bodo'
    case 'bs':
      return 'Bosnian'
    case 'br':
      return 'Breton'
    case 'bg':
      return 'Bulgarian'
    case 'yue':
      return 'Cantonese'
    case 'ca':
      return 'Catalan'
    case 'ceb':
      return 'Cebuano'
    case 'ce':
      return 'Chechen'
    case 'chr':
      return 'Cherokee'
    case 'hne':
      return 'Chhattisgarhi'
    case 'ny':
      return 'Chichewa'
    case 'zh-CH':
      return 'Chinese (Simplified)'
    case 'zh-TW':
      return 'Chinese (Traditional)'
    case 'zh':
      return 'Chinese'
    case 'toi':
      return 'Chitonga'
    case 'ctg':
      return 'Chittagonian'
    case 'cv':
      return 'Chuvash'
    case 'co':
      return 'Corsican'
    case 'hr':
      return 'Croatin'
    case 'cs':
      return 'Czech'
    case 'da':
      return 'Danish'
    case 'dcc':
      return 'Deccani'
    case 'luo':
      return 'Dholuo'
    case 'dv':
      return 'Divehi'
    case 'doi':
      return 'Dorgi'
    case 'nl':
      return 'Dutch'
    case 'dyu':
      return 'Dyula'
    case 'dz':
      return 'Dzongkha'
    case 'bin':
      return 'Edo'
    case 'efi':
      return 'Efik'
    case 'en':
      return 'English'
    case 'ish':
      return 'Esan'
    case 'eo':
      return 'Esperanto'
    case 'et':
      return 'Estonian'
    case 'ee':
      return 'Ewe'
    case 'tl':
      return 'Filipino'
    case 'fi':
      return 'Finnish'
    case 'fon':
      return 'Fon'
    case 'fr':
      return 'French'
    case 'fy':
      return 'Frisian'
    case 'ff':
      return 'Fulah'
    case 'gag':
      return 'Gagauz'
    case 'gl':
      return 'Galician'
    case 'gbm':
      return 'Garhwali'
    case 'ka':
      return 'Georgian'
    case 'de':
      return 'German'
    case 'el':
      return 'Greek'
    case 'gn':
      return 'Guarani'
    case 'gu':
      return 'Gujarati'
    case 'ht':
      return 'Haitian Creole'
    case 'bgc':
      return 'Haryanvi'
    case 'ha':
      return 'Hausa'
    case 'haw':
      return 'Hawaiian'
    case 'iw':
      return 'Hebrew'
    case 'hil':
      return 'Hiligaynon'
    case 'hi':
      return 'Hindi'
    case 'hmn':
      return 'Hmong'
    case 'hu':
      return 'Hungarian'
    case 'is':
      return 'Icelandic'
    case 'ig':
      return 'Igbo'
    case 'ilo':
      return 'Iloko'
    case 'id':
      return 'Indonesian'
    case 'iu':
      return 'Inuktitut'
    case 'ga':
      return 'Irish'
    case 'iso':
      return 'Isoko'
    case 'it':
      return 'Italian'
    case 'jp':
      return 'Japanese'
    case 'jw':
      return 'Javanese'
    case 'kl':
      return 'Kalaallisut'
    case 'kam':
      return 'Kamba'
    case 'kn':
      return 'Kannada'
    case 'kr':
      return 'Kanuri'
    case 'kaa':
      return 'Kara-Kalpak'
    case 'krc':
      return 'Karachay-Balkar'
    case 'ks':
      return 'Kashmiri'
    case 'kk':
      return 'Kazakh'
    case 'meo':
      return 'Kedah Malay'
    case 'kjh':
      return 'Khakas'
    case 'km':
      return 'Khmer'
    case 'kmz':
      return 'Khorasani Turkic'
    case 'ki':
      return 'Kikuyu'
    case 'rw':
      return 'Kinyarwanda'
    case 'trp':
      return 'Kokborok'
    case 'ko':
      return 'Korean'
    case 'kri':
      return 'Krio'
    case 'kum':
      return 'Kumyk'
    case 'ku':
      return 'Kurdish (Kurmanji)'
    case 'ckb':
      return 'Kurdish (Sorani)'
    case 'ky':
      return 'Kyrgyz'
    case 'quc':
      return 'Kʼicheʼ'
    case 'lkt':
      return 'Lakota'
    case 'lo':
      return 'Lao'
    case 'la':
      return 'Latin'
    case 'lv':
      return 'Latvian'
    case 'ln':
      return 'Lingala'
    case 'lt':
      return 'Lithuanian'
    case 'lu':
      return 'Luba'
    case 'lg':
      return 'Luganda'
    case 'lb':
      return 'Luxembourgish'
    case 'mk':
      return 'Macedonian'
    case 'mad':
      return 'Madurese'
    case 'mag':
      return 'Magahi'
    case 'mai':
      return 'Maithili'
    case 'mg':
      return 'Malagasy'
    case 'ms':
      return 'Malay'
    case 'ml':
      return 'Malayalam'
    case 'mt':
      return 'Maltese'
    case 'mi':
      return 'Maori'
    case 'mr':
      return 'Marathi'
    case 'rwr':
      return 'Marwari'
    case 'mzn':
      return 'Mazanderani'
    case 'min':
      return 'Minangkabau'
    case 'lus':
      return 'Mizo'
    case 'mn':
      return 'Mongolian'
    case 'sr-ME':
      return 'Montenegrin'
    case 'mos':
      return 'Mossi'
    case 'my':
      return 'Myanmar (Burmese)'
    case 'nv':
      return 'Navajo'
    case 'new':
      return 'Nepalbhasa'
    case 'ne':
      return 'Nepali'
    case 'pcm':
      return 'Nigerian Pidgin'
    case 'se':
      return 'Northern Sami'
    case 'nso':
      return 'Northern Sotho'
    case 'no':
      return 'Norwegian'
    case 'oc':
      return 'Occitan'
    case 'or':
      return 'Odia (Oriya)'
    case 'om':
      return 'Oromo'
    case 'pam':
      return 'Pampanga'
    case 'ps':
      return 'Pashto'
    case 'mfa':
      return 'Pattani Malay'
    case 'fa':
      return 'Persian'
    case 'pl':
      return 'Polish'
    case 'pt':
      return 'Portuguese'
    case 'pa':
      return 'Punjabi'
    case 'qxq':
      return 'Qashqai'
    case 'qu':
      return 'Quechua'
    case 'raj':
      return 'Rajasthani'
    case 'rkt':
      return 'Rangpuri'
    case 'rhg':
      return 'Rohigya'
    case 'ro':
      return 'Romanian'
    case 'rm':
      return 'Romansh'
    case 'ru':
      return 'Russian'
    case 'sck':
      return 'Sadri'
    case 'slr':
      return 'Salar'
    case 'sm':
      return 'Samoan'
    case 'sgs':
      return 'Samogitian'
    case 'sg':
      return 'Sango'
    case 'sa':
      return 'Sanskrit'
    case 'sat':
      return 'Santali'
    case 'skr':
      return 'Saraiki'
    case 'gd':
      return 'Scots Gaelic'
    case 'sr':
      return 'Serbian'
    case 'ser':
      return 'Serrano'
    case 'st':
      return 'Sesotho'
    case 'tn':
      return 'Setswana'
    case 'sn':
      return 'Shona'
    case 'cjs':
      return 'Shor'
    case 'sty':
      return 'Siberian Tatar'
    case 'scn':
      return 'Sicilian'
    case 'sd':
      return 'Sindhi'
    case 'si':
      return 'Sinhala'
    case 'sk':
      return 'Slovak'
    case 'sl':
      return 'Slovenian'
    case 'so':
      return 'Somali'
    case 'alt':
      return 'Southern Altai'
    case 'nr':
      return 'Southern Ndebele'
    case 'es':
      return 'Spanish'
    case 'su':
      return 'Sundanese'
    case 'sjp':
      return 'Surjapuri'
    case 'sw':
      return 'Swahili'
    case 'swc':
      return 'Swahili Congo'
    case 'sv':
      return 'Swedish'
    case 'syl':
      return 'Sylheti'
    case 'tg':
      return 'Tajik'
    case 'ber':
      return 'Tamazight'
    case 'ta':
      return 'Tamil'
    case 'tt':
      return 'Tatar'
    case 'te':
      return 'Telugu'
    case 'th':
      return 'Thai'
    case 'bo':
      return 'Tibetan'
    case 'ti':
      return 'Tigrinya'
    case 'tiv':
      return 'Tiv'
    case 'tpi':
      return 'Tok Pisin'
    case 'lua':
      return 'Tshiluba'
    case 've':
      return 'Tshivenda'
    case 'tsc':
      return 'Tswa'
    case 'tr':
      return 'Turkish'
    case 'tk':
      return 'Turkmen'
    case 'tyv':
      return 'Tuvinian'
    case 'ak':
      return 'Twi'
    case 'uk':
      return 'Ukrainian'
    case 'ur':
      return 'Urdu'
    case 'urh':
      return 'Urhobo'
    case 'uum':
      return 'Urum'
    case 'ug':
      return 'Uyghur'
    case 'uz':
      return 'Uzbek'
    case 'vah':
      return 'Varhadi-Nagpuri'
    case 'vi':
      return 'Vietnamese'
    case 'cy':
      return 'Welsh'
    case 'wo':
      return 'Wolof'
    case 'xh':
      return 'Xhosa'
    case 'ts':
      return 'Xitsonga'
    case 'sah':
      return 'Yakut'
    case 'yi':
      return 'Yiddish'
    case 'yo':
      return 'Yoruba'
    case 'yua':
      return 'Yucateco'
    case 'zza':
      return 'Zaza'
    case 'za':
      return 'Zhuang'
    case 'zu':
      return 'Zulu'
    default:
      return 'Unknown'
  }
}

const browsingTimestamp: number = Math.floor(Date.now() / 1000)
let from: string, to: string

presence.on('UpdateData', async () => {
  const showTime = await presence.getSetting<boolean>('stamp')
  const tDetail = await presence.getSetting<string>('tDetail')
  const tState = await presence.getSetting<string>('tState')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Translate/assets/logo.png',
  }

  if (document.location.href.includes('about')) {
    presenceData.details = 'About Google Translate'
    if (document.location.href.includes('languages'))
      presenceData.state = 'Languages'
    if (document.location.href.includes('contribute'))
      presenceData.state = 'Contribute'
    if (document.location.href.includes('forbusiness'))
      presenceData.state = 'Tools'
  }
  else if (document.location.href.includes('contribute')) {
    const contr = document.querySelector('div.Xxlgbc > span[role=img]')
    presenceData.details = 'Contribute'
    if (contr) {
      const langs = document
        .querySelector('c-wiz[jsrenderer=TxVJMc]')
        ?.getAttribute('data-p')
        ?.split(',')

      presenceData.details = 'Contributing'
      presenceData.state = `${languageCode(
        langs?.[1]?.replaceAll('"', '') ?? '',
      )} → ${languageCode(langs?.[2]?.replaceAll('"', '') ?? '')}: ${contr?.textContent ?? ''}`
    }
  }
  else {
    from = document
      .querySelectorAll('span.VfPpkd-AznF2e-LUERP-bN97Pc')[0]
      ?.querySelector('button[aria-selected=true]')
      ?.getAttribute('data-language-code')
      ?.replaceAll('"', '') ?? ''
    to = document
      .querySelectorAll('span.VfPpkd-AznF2e-LUERP-bN97Pc')[1]
      ?.querySelector('button[aria-selected=true]')
      ?.getAttribute('data-language-code')
      ?.replaceAll('"', '') ?? ''
  }

  presenceData.startTimestamp = showTime ? browsingTimestamp : null
  if (presenceData.startTimestamp === null)
    delete presenceData.startTimestamp

  if (
    !document.location.href.includes('about')
    && !document.location.href.includes('contribute')
  ) {
    presenceData.details = tDetail
      .replace('%from%', languageCode(from))
      .replace('%to%', languageCode(to))
    presenceData.state = tState
      .replace('%from%', languageCode(from))
      .replace('%to%', languageCode(to))
    if (tState.includes('{0}'))
      delete presenceData.state
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

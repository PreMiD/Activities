import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1377799920760918096',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://www.bibliaonline.com.br/favicon-512.png',
}

const { pathname, href } = document.location

const bookList = {
  books: [
    { name: 'Gênesis', abbreviation: 'gn' },
    { name: 'Êxodo', abbreviation: 'ex' },
    { name: 'Levítico', abbreviation: 'lv' },
    { name: 'Números', abbreviation: 'nm' },
    { name: 'Deuteronômio', abbreviation: 'dt' },
    { name: 'Josué', abbreviation: 'js' },
    { name: 'Juízes', abbreviation: 'jz' },
    { name: 'Rute', abbreviation: 'rt' },
    { name: '1 Samuel', abbreviation: '1sm' },
    { name: '2 Samuel', abbreviation: '2sm' },
    { name: '1 Reis', abbreviation: '1rs' },
    { name: '2 Reis', abbreviation: '2rs' },
    { name: '1 Crônicas', abbreviation: '1cr' },
    { name: '2 Crônicas', abbreviation: '2cr' },
    { name: 'Esdras', abbreviation: 'ed' },
    { name: 'Neemias', abbreviation: 'ne' },
    { name: 'Ester', abbreviation: 'et' },
    { name: 'Jó', abbreviation: 'jó' },
    { name: 'Salmos', abbreviation: 'sl' },
    { name: 'Provérbios', abbreviation: 'pv' },
    { name: 'Eclesiastes', abbreviation: 'ec' },
    { name: 'Cânticos', abbreviation: 'ct' },
    { name: 'Isaías', abbreviation: 'is' },
    { name: 'Jeremias', abbreviation: 'jr' },
    { name: 'Lamentações', abbreviation: 'lm' },
    { name: 'Ezequiel', abbreviation: 'ez' },
    { name: 'Daniel', abbreviation: 'dn' },
    { name: 'Oséias', abbreviation: 'os' },
    { name: 'Joel', abbreviation: 'jl' },
    { name: 'Amós', abbreviation: 'am' },
    { name: 'Obadias', abbreviation: 'ob' },
    { name: 'Jonas', abbreviation: 'jn' },
    { name: 'Miquéias', abbreviation: 'mq' },
    { name: 'Naum', abbreviation: 'na' },
    { name: 'Habacuque', abbreviation: 'hc' },
    { name: 'Sofonias', abbreviation: 'sf' },
    { name: 'Ageu', abbreviation: 'ag' },
    { name: 'Zacarias', abbreviation: 'zc' },
    { name: 'Malaquias', abbreviation: 'ml' },

    { name: 'Mateus', abbreviation: 'mt' },
    { name: 'Marcos', abbreviation: 'mc' },
    { name: 'Lucas', abbreviation: 'lc' },
    { name: 'João', abbreviation: 'jo' },
    { name: 'Atos', abbreviation: 'atos' },
    { name: 'Romanos', abbreviation: 'rm' },
    { name: '1 Coríntios', abbreviation: '1co' },
    { name: '2 Coríntios', abbreviation: '2co' },
    { name: 'Gálatas', abbreviation: 'gl' },
    { name: 'Efésios', abbreviation: 'ef' },
    { name: 'Filipenses', abbreviation: 'fp' },
    { name: 'Colossenses', abbreviation: 'cl' },
    { name: '1 Tessalonicenses', abbreviation: '1ts' },
    { name: '2 Tessalonicenses', abbreviation: '2ts' },
    { name: '1 Timóteo', abbreviation: '1tm' },
    { name: '2 Timóteo', abbreviation: '2tm' },
    { name: 'Tito', abbreviation: 'tt' },
    { name: 'Filemom', abbreviation: 'fm' },
    { name: 'Hebreus', abbreviation: 'hb' },
    { name: 'Tiago', abbreviation: 'tg' },
    { name: '1 Pedro', abbreviation: '1pe' },
    { name: '2 Pedro', abbreviation: '2pe' },
    { name: '1 João', abbreviation: '1jo' },
    { name: '2 João', abbreviation: '2jo' },
    { name: '3 João', abbreviation: '3jo' },
    { name: 'Judas', abbreviation: 'jd' },
    { name: 'Apocalipse', abbreviation: 'ap' },
  ],
}

const tlList = {
  'português': [
    { abbreviation: 'ACF', name: 'Almeida Corrigida Fiel' },
    { abbreviation: 'AA', name: 'Almeida Revisada Imprensa Bíblica' },
    { abbreviation: 'ARA', name: 'Almeida Revista e Atualizada' },
    { abbreviation: 'ARC', name: 'Almeida Revista e Corrigida' },
    { abbreviation: 'RC69', name: 'Almeida Revista e Corrigida 1969' },
    { abbreviation: 'BKJ', name: 'Bíblia King James' },
    { abbreviation: 'NAA', name: 'Nova Almeida Atualizada' },
    { abbreviation: 'NTLH', name: 'Nova Tradução na Linguagem de Hoje' },
    { abbreviation: 'NVI', name: 'Nova Versão Internacional' },
    { abbreviation: 'NVT', name: 'Nova Versão Transformadora' },
    { abbreviation: 'OL', name: 'O Livro' },
    { abbreviation: 'TB', name: 'Sociedade Bíblica Britânica' },
    { abbreviation: 'VC', name: 'Versão Católica' },
  ],
  'inglês': [
    { abbreviation: 'ACV', name: 'A Conservative Version' },
    { abbreviation: 'AKJV', name: 'American King James Version' },
    {
      abbreviation: 'ASV',
      name: 'American Standard Version of the Holy Bible',
    },
    { abbreviation: 'BBE', name: 'Bible in Basic English' },
    { abbreviation: 'BWE', name: 'Bible in Worldwide English NT' },
    { abbreviation: 'DARBY', name: 'Darby Bible' },
    { abbreviation: 'DIAGLOT', name: 'Diaglot NT - 1865' },
    { abbreviation: 'DOUR', name: 'Douay Rheims' },
    { abbreviation: 'JUBL2000', name: 'English Jubilee 2000 Bible' },
    { abbreviation: 'EMTV', name: 'English Majority Text Version' },
    { abbreviation: 'GNV', name: 'Geneva Bible' },
    { abbreviation: 'ISV', name: 'ISV NT' },
    { abbreviation: 'JPS', name: 'Jewish Publication Society AT' },
    { abbreviation: 'WYCLIFFE', name: 'John Wycliffe Bible' },
    { abbreviation: 'KJ2000', name: 'King James 2000' },
    { abbreviation: 'KJV', name: 'King James Version' },
    { abbreviation: 'LEESER', name: 'Leeser Old Testament' },
    { abbreviation: 'LONT', name: 'Living Oracles NT' },
    { abbreviation: 'MKJV1962', name: 'Modern KJV 1963' },
    { abbreviation: 'MONT', name: 'Montgomery New Testament' },
    { abbreviation: 'NHEB', name: 'New Heart English Bible' },
    { abbreviation: 'NIV', name: 'New International Version' },
    { abbreviation: 'NSB', name: 'New Simplified Bible' },
    { abbreviation: 'RWEBSTER', name: 'Revised 1833 Webster Version' },
    { abbreviation: 'RSV', name: 'Revised Standard Version' },
    { abbreviation: 'ENGRV', name: 'Revised Version 1885' },
    { abbreviation: 'RYLT', name: 'Revised Young\'s Literal Translation NT' },
    { abbreviation: 'ROTH', name: 'Rotherham Version' },
    { abbreviation: 'BOM', name: 'The Book of Mormon' },
    { abbreviation: 'TCE', name: 'The Common Edition: New Testament' },
    { abbreviation: 'LEB', name: 'The Lexham English Bible' },
    { abbreviation: 'ETHERIDGE', name: 'The Peschito Syriac New Testament' },
    { abbreviation: 'RNT', name: 'The Riverside New Testament' },
    { abbreviation: 'UPDV', name: 'Updated Bible Version' },
    { abbreviation: 'UKJV', name: 'Updated King James Version' },
    { abbreviation: 'XXX', name: 'VW-Edition 2006' },
    { abbreviation: 'WBS', name: 'Webster' },
    { abbreviation: 'WESLEY', name: 'Wesley\'s NT' },
    { abbreviation: 'WMTH', name: 'Weymouth NT' },
    { abbreviation: 'TYNDALE', name: 'Willam Tyndale Bible' },
    { abbreviation: 'WEB', name: 'World English Bible' },
    { abbreviation: 'WEBBE', name: 'World English Bible British Edition' },
    { abbreviation: 'WMB', name: 'World Messianic Bible' },
    { abbreviation: 'WMBBE', name: 'World Messianic Bible British Edition' },
    { abbreviation: 'YLT', name: 'YLT' },
  ],
  'espanhol': [
    { abbreviation: 'SEV', name: 'Las Sagradas Escrituras' },
    { abbreviation: 'RV', name: 'Reina Valera' },
  ],
  'francês': [
    { abbreviation: 'BGNT1669', name: 'Bible de Genève de 1669' },
    { abbreviation: 'BM1844', name: 'Bible Martin 1844' },
    { abbreviation: 'FREPGR', name: 'Bible Perret-Gentil et Rilliet' },
    { abbreviation: 'BDC', name: 'Bible Pirot-Clamer' },
    { abbreviation: 'FREBBB', name: 'French Bible Bovet Bonnet (1900)' },
    { abbreviation: 'FRDARB', name: 'French Darby' },
    { abbreviation: 'FREN', name: 'French Louis Segond' },
    { abbreviation: 'KJF', name: 'King James Française' },
    { abbreviation: 'CRAMP23', name: 'La Bible Augustin Crampon 1923' },
    { abbreviation: 'APEE', name: 'La Bible de l\'Épée' },
    { abbreviation: 'SACC', name: 'La Bible de Saci 1759' },
    { abbreviation: 'BZKH', name: 'La Bible de Zadoc Khan' },
    { abbreviation: 'FILL', name: 'La Bible Fillion de Louis Claude Fillion' },
    { abbreviation: 'OSTV1996', name: 'La Bible J.F. Ostervald 1996' },
    { abbreviation: 'LSG', name: 'Louis Segond' },
    { abbreviation: 'MARTIN', name: 'Martin' },
    { abbreviation: 'OSTERVALD', name: 'Ostervald' },
  ],
  'alemão': [
    { abbreviation: 'AMNT', name: 'Abraham Meister NT' },
    { abbreviation: 'ALBRECHT1926', name: 'Albrecht Bibel 1926' },
    { abbreviation: 'ALMNT', name: 'Alemannische Bibel NT' },
    { abbreviation: 'GERBEN', name: 'Bengel NT' },
    { abbreviation: 'ELB1871', name: 'Elberfelder 1871' },
    { abbreviation: 'ELB1871NT', name: 'Elberfelder 1871 NT Original' },
    { abbreviation: 'ELB1905', name: 'Elberfelder 1905' },
    { abbreviation: 'FB2004', name: 'FreeBible2004' },
    { abbreviation: 'ILGRDE', name: 'Interlinearübersetzung' },
    { abbreviation: 'GREB', name: 'Johannes Greber 1936 NT' },
    { abbreviation: 'KNT', name: 'Konkordantes NT' },
    { abbreviation: 'VANESS', name: 'Leander van Ess, rev.2' },
    { abbreviation: 'LUTH1545', name: 'Luther 1545' },
    { abbreviation: 'LUT-1545-LH', name: 'Luther 1545 (Letzte Hand)' },
    { abbreviation: 'LUTH1912', name: 'Luther 1912' },
    { abbreviation: 'LUTH1912AP', name: 'Luther 1912 - mit Apokryphen' },
    { abbreviation: 'MENG39', name: 'Menge-Bibel' },
    { abbreviation: 'GERNEUE', name: 'Neue Evangelistische Übersetzung' },
    { abbreviation: 'PAT80', name: 'Pattloch Bibel' },
    { abbreviation: 'REI10EV', name: 'Reinhardt 1910 Evangelien' },
    { abbreviation: 'SCH1951', name: 'Schlachter 1951' },
    { abbreviation: 'TAF', name: 'Tafelbibel' },
    { abbreviation: 'TEXTBIBEL', name: 'Textbibel' },
    { abbreviation: 'TEXTBIBELAT', name: 'Textbibel' },
    { abbreviation: 'VLX3', name: 'Volxbibel 3.0' },
  ],
  'hebraico': [
    { abbreviation: 'ALEP', name: 'Aleppo Codex' },
    { abbreviation: 'BHS', name: 'Biblia hebraica' },
    { abbreviation: 'HEBM', name: 'Modern Hebrew Bible' },
    {
      abbreviation: 'OSMHB',
      name: 'Open Scriptures Morphological Hebrew Bible',
    },
    { abbreviation: 'WLC', name: 'Westminster Leningrad Codex' },
  ],
  'grego': [
    { abbreviation: 'GREEK', name: 'Modern Greek' },
    { abbreviation: 'RECEPTUS', name: 'Textus Receptus' },
  ],
  'lituano': [{ abbreviation: 'LT', name: 'Lithuanian' }],
  'africâner': [{ abbreviation: 'AFR3353', name: '1933/1953 Afrikaans Bybel' }],
  'árabe': [{ abbreviation: 'ARASVD', name: 'Smith Van Dyke Arabic Bible' }],
  'búlgaro': [
    { abbreviation: 'BULCARIGRADNT', name: 'Tsarigrad Edition' },
    { abbreviation: 'BULVEREN', name: 'Veren\'s Contemporary Bible' },
  ],
  'chamorro': [
    { abbreviation: 'CHAMORRO', name: 'Chamorro: Y Santa Biblia (1908)' },
  ],
  'tcheco': [
    { abbreviation: 'CZBKR', name: 'Bible Kralicka' },
    { abbreviation: 'BZECEP', name: 'Ekumenicky Cesky Preklad' },
  ],
  'esperanto': [{ abbreviation: 'ESPERANTO', name: 'Esperanto' }],
  'estoniano': [{ abbreviation: 'ESTONIAN', name: 'Estonian' }],
  'basco': [{ abbreviation: 'BASQ1571', name: 'Basque(Navarro-Labourdin)NT' }],
  'finlandês': [
    { abbreviation: 'PR-1938', name: 'Pyhä Raamattu' },
    { abbreviation: 'PR', name: 'Pyhä Raamattu' },
  ],
  'gaélico escocês': [
    { abbreviation: 'GLA2', name: 'Gaelic Scripture (Manx Gaelic)' },
  ],
  'haitiano': [{ abbreviation: 'HAT', name: 'Haitian Creole Version' }],
  'húngaro': [
    { abbreviation: 'HUN', name: 'Hungarian Version' },
    { abbreviation: 'KAROLI', name: 'Károli' },
    { abbreviation: 'HUNUJ', name: 'Magyar Újfordítású' },
  ],
  'italiano': [
    { abbreviation: 'ITADIO', name: 'Giovanni Diodati Bibbia' },
    { abbreviation: 'ITALIAN1', name: 'Italian Version' },
    { abbreviation: 'LND-1991', name: 'La Nuova Diodati 1991' },
    { abbreviation: 'IRV', name: 'Riveduta' },
  ],
  'coreano': [{ abbreviation: 'KOR', name: 'Korean Version' }],
  'latim': [
    { abbreviation: 'VULGATA', name: 'Biblia Sacra Vulgata' },
    { abbreviation: 'CLVUL', name: 'Clementine Vulgate' },
    { abbreviation: 'NVLA', name: 'Nova Vulgata' },
  ],
  'letão': [{ abbreviation: 'LATV', name: 'Lativian Version' }],
  'maori': [{ abbreviation: 'MAO', name: 'Maori Version' }],
  'birmanês': [{ abbreviation: 'JUDSON', name: 'Judson - Myanmar/Burmse' }],
  'holandês': [{ abbreviation: 'DUTCH', name: 'Dutch' }],
  'norueguês': [
    { abbreviation: 'DNB', name: 'Det Norsk Bibelselskap' },
    { abbreviation: 'NOR', name: 'Norwegian Version' },
    { abbreviation: 'NORSMB', name: 'Studentmållagsbibelen frå 1921' },
  ],
  'polonês': [{ abbreviation: 'POLAND', name: 'Polska Biblia' }],
  'romeno': [
    { abbreviation: 'CORNILESCU', name: 'Cornilescu' },
    { abbreviation: 'RU', name: 'Rumanian Version' },
  ],
  'russo': [
    { abbreviation: 'RUSVZH', name: 'Russian New Testament Strongs' },
    { abbreviation: 'RUSSUB', name: 'Russian Version' },
    { abbreviation: 'UKRUB', name: 'Ukrainian Version' },
    { abbreviation: 'SYNODAL', name: 'Синодальный перевод (Synodal)' },
  ],
  'albanês': [{ abbreviation: 'ALB1', name: 'Albanian Version' }],
  'sueco': [
    { abbreviation: 'SWEFOLK1998', name: 'Svenska Folkbibeln (1998)' },
    { abbreviation: 'SVD', name: 'Swedish 1917 Version' },
  ],
  'suaíli': [{ abbreviation: 'SWA', name: 'Swahili NT' }],
  'tailandês': [{ abbreviation: 'KJVTHAI', name: 'KJV-Thai' }],
  'filipino': [{ abbreviation: 'TLGANGBIBLIA', name: 'Ang Dating Biblia' }],
  'turco': [{ abbreviation: 'BB31', name: 'Türkçe' }],
  'vietnamita': [
    { abbreviation: 'VIETNBR', name: 'New Vietnamese Bible' },
    { abbreviation: 'VIE', name: 'Tiếng Việt' },
  ],
  'chinês': [
    { abbreviation: 'CUV', name: 'Chinese Union Version' },
    { abbreviation: 'CUV-S', name: 'Chinese Union Version Simplified' },
    { abbreviation: 'CVS', name: 'New Chinese Version Simplified' },
  ],
}

function searchBook(abbreviation: string) {
  const livroEncontrado = bookList.books.find(
    livro => livro.abbreviation.toLowerCase() === abbreviation,
  )

  return livroEncontrado ? livroEncontrado.name : undefined
}

function searchTl(abreviacao: string) {
  const upperAbbrev = abreviacao.toUpperCase()

  for (const [language, tlName] of Object.entries(tlList)) {
    const foundTl = tlName.find(t => t.abbreviation === upperAbbrev)

    if (foundTl) {
      return {
        language,
        abbreviation: foundTl.abbreviation,
        name: foundTl.name,
      }
    }
  }

  return null
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Reading,
    smallImageText: 'VIVA CRISTO REI',
  }

  if (
    document.querySelector('[class*="card_container"]')
    && document.querySelector('[class*="card_container"]')!.firstChild!
      .textContent === 'Receba mais de Deus hoje:'
  ) {
    presenceData.details = 'Página Inicial'
    const resultTl = searchTl(String(href.split('/')[3]))
    if (resultTl) {
      presenceData.state = `Tradução: ${resultTl!.abbreviation} | ${resultTl!.name} (${resultTl!.language.charAt(0).toUpperCase()}${resultTl!.language.slice(1)})`
    }
    else {
      presenceData.state = `Tradução: ${document.title.split('-')[1]} | ${document.title.split('-')[2]}`
    }
  }
  else if (document.title === 'Devocional Diário') {
    presenceData.details = 'Devocional Diário'
    presenceData.state = document.getElementsByClassName('subtitle')[0]
    presenceData.smallImageKey = Assets.Reading
    const result = searchTl(
      document.location.href.split('?')[1]!.split('=')[1]!.toUpperCase(),
    )
    presenceData.smallImageText = `Tradução: ${result!.abbreviation} | ${result!.name} (${result!.language.charAt(0).toUpperCase()}${result!.language.slice(1)})`
  }
  else if (document.title === 'Recursos Bíblicos - Bíblia Online') {
    presenceData.details = 'Artigos'
    presenceData.state
    = document.querySelectorAll('.category__title')[0]!.textContent
    presenceData.smallImageKey = Assets.Search
  }
  else if (document.title === 'Explicações - Artigos - Bíblia Online') {
    presenceData.details = 'Explicações'
    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.title === 'Histórias da Bíblia - Artigos - Bíblia Online'
  ) {
    presenceData.details = 'Histórias da Bíblia'
    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.title === 'Versículos por Temas - Artigos - Bíblia Online'
  ) {
    presenceData.details = 'Versículos por Temas'
    presenceData.smallImageKey = Assets.Search
  }
  else if (document.title === 'Liderança Cristã - Artigos - Bíblia Online') {
    presenceData.details = 'Liderança Cristã'
    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.title === 'Recursos para Compartilhar - Artigos - Bíblia Online'
  ) {
    presenceData.details = 'Recursos para Compartilhar'
    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.title === 'Ensinamentos de Jesus - Artigos - Bíblia Online'
  ) {
    presenceData.details = 'Ensinamentos de Jesus'
    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.title === 'Amor e Relacionamento - Artigos - Bíblia Online'
  ) {
    presenceData.details = 'Amor e Relacionamento'
    presenceData.smallImageKey = Assets.Search
  }
  else if (document.title === 'Oração e Fé - Artigos - Bíblia Online') {
    presenceData.details = 'Oração e Fé'
    presenceData.smallImageKey = Assets.Search
  }
  else if (document.title === 'Bíblia Online - Lista de Traduções Bíblicas') {
    presenceData.details = 'Lista de Traduções Bíblicas'
    presenceData.smallImageKey = Assets.Search
  }
  else if (document.title === 'Anuncie no Bíblia Online') {
    presenceData.details = 'Anuncie no Bíblia Online'
    presenceData.smallImageKey = Assets.Live
  }
  else if (document.title === 'Bíblia Online - Termos de Uso e Privacidade') {
    presenceData.details = 'Termos de Uso e Privacidade'
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (
    document.querySelector('[class*="navbar-subheader_title"]')!.firstChild!
      .textContent === 'Versículos por Tema'
      && document.querySelector('[class*="page_letter"]')
      && document.querySelector('[class*="page_letter"]')!.firstChild!.textContent
      === 'A'
  ) {
    presenceData.details = 'Lista de Versículos por Tema'
    presenceData.smallImageKey = Assets.Search
  }
  else if (
    document.querySelector('[class*="navbar-subheader_title"]')!.firstChild!
      .textContent === 'Livros'
  ) {
    presenceData.details = 'Lista de Livros'
    const result = searchTl(String(href.split('/')[3]))
    presenceData.state = `Tradução: ${result!.abbreviation} | ${result!.name} (${result!.language.charAt(0).toUpperCase()}${result!.language.slice(1)})`
    presenceData.smallImageKey = Assets.Viewing
  }
  else if (
    document.querySelector('[class*="navbar-subheader_title"]')!.firstChild!
      .textContent === 'Versículos por Tema'
      && !document.querySelector('[class*="page_letter"]')
  ) {
    presenceData.details = `Lendo Versículos sobre ${document.querySelector('[class*="hero_hero"]')!.textContent}`
    const result = searchTl(document.title.split('-')[2]!.trim())
    presenceData.state = `Tradução: ${result!.abbreviation} | ${result!.name} (${result!.language.charAt(0).toUpperCase()}${result!.language.slice(1)})`
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/a/')) {
    presenceData.details = 'Estudo Bíblico'
    presenceData.state = document.querySelector(
      '.m_f678d540.mantine-Breadcrumbs-breadcrumb.active',
    )!.textContent
    presenceData.smallImageKey = Assets.Reading
    const result = searchTl(
      document.location.href.split('?')[1]!.split('=')[1]!.toUpperCase(),
    )
    presenceData.smallImageText = `Tradução: ${result!.abbreviation} | ${result!.name} (${result!.language.charAt(0).toUpperCase()}${result!.language.slice(1)})`
  }

  if (href.includes('busca?q=')) {
    presenceData.details = `Buscando por '${href.split('=')[1]}'`

    const resultTl = searchTl(String(href.split('/')[3]))
    presenceData.state = `Tradução: ${resultTl!.abbreviation} | ${resultTl!.name} (${resultTl!.language.charAt(0).toUpperCase()}${resultTl!.language.slice(1)})`

    presenceData.smallImageKey = Assets.Search
  }

  const resultBk = searchBook(String(href.split('/')[4]))
  const chap = href.split('/')[5]
  const verse = href.split('/')[6]

  if (href.split('/').length === 6 && resultBk) {
    presenceData.details = `Lendo ${resultBk} ${chap}`
    const resultTl = searchTl(document.title.split('-')[2]!.trim())
    presenceData.state = `Tradução: ${resultTl!.abbreviation} | ${resultTl!.name} (${resultTl!.language.charAt(0).toUpperCase()}${resultTl!.language.slice(1)})`
    presenceData.smallImageKey = Assets.Reading
  }
  else if (href.split('/').length === 7 && resultBk) {
    presenceData.details = `Lendo ${resultBk} ${chap}:${verse}`
    const resultTl = searchTl(document.title.split('-')[2]!.trim())
    presenceData.state = `Tradução: ${resultTl!.abbreviation} | ${resultTl!.name} (${resultTl!.language.charAt(0).toUpperCase()}${resultTl!.language.slice(1)})`
    presenceData.smallImageKey = Assets.Reading
  }
  else if (resultBk) {
    const resultTl = searchTl(document.title.split('-')[2]!.trim())
    presenceData.details = `Vendo Capítulos de ${resultBk}`
    presenceData.state = `Tradução: ${resultTl!.abbreviation} | ${resultTl!.name} (${resultTl!.language.charAt(0).toUpperCase()}${resultTl!.language.slice(1)})`
    presenceData.smallImageKey = Assets.Viewing
  }

  presence.setActivity(presenceData)
})

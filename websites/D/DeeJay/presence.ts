const presence = new Presence({
  clientId: '1434608019207098408',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/D/DeeJay/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { pathname, hostname } = document.location
  const showTimestamps = await presence.getSetting<boolean>('timestamps').catch(() => true)

  const strings = await presence.getStrings({
    viewingHomepage: 'deejay.viewingHomepage',
    viewingOnAir: 'deejay.viewingOnAir',
    viewingSchedule: 'deejay.viewingSchedule',
    viewingPrograms: 'deejay.viewingPrograms',
    viewingProgram: 'deejay.viewingProgram',
    hostedBy: 'deejay.hostedBy',
    viewingHighlights: 'deejay.viewingHighlights',
    viewingEpisodes: 'deejay.viewingEpisodes',
    viewingHosts: 'deejay.viewingHosts',
    viewingHost: 'deejay.viewingHost',
    viewingFrequencies: 'deejay.viewingFrequencies',
    viewingFrequenciesIn: 'deejay.viewingFrequenciesIn',
    viewingNewsletter: 'deejay.viewingNewsletter',
    viewingApp: 'deejay.viewingApp',
    viewingContact: 'deejay.viewingContact',
    viewingWebradios: 'deejay.viewingWebradios',
    viewingWebradio: 'deejay.viewingWebradio',
    viewingRankings: 'deejay.viewingRankings',
    viewingTop30: 'deejay.viewingTop30',
    viewingDeejayParade: 'deejay.viewingDeejayParade',
    viewingPodcasts: 'deejay.viewingPodcasts',
    viewingPodcast: 'deejay.viewingPodcast',
    viewingTopics: 'deejay.viewingTopics',
    viewingTopic: 'deejay.viewingTopic',
    viewingTag: 'deejay.viewingTag',
    watchingTV: 'deejay.watchingTV',
    liveFrom: 'deejay.liveFrom',
    viewingStore: 'deejay.viewingStore',
    shoppingFor: 'deejay.shoppingFor',
    viewingLegalNotes: 'deejay.viewingLegalNotes',
    viewingRegulations: 'deejay.viewingRegulations',
    viewingTDM: 'deejay.viewingTDM',
    readingCookiePolicy: 'deejay.readingCookiePolicy',
    readingPrivacyPolicy: 'deejay.readingPrivacyPolicy',
    readingAccessibility: 'deejay.readingAccessibility',
    viewingProfile: 'deejay.viewingProfile',
  })

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: '',
    startTimestamp: showTimestamps ? browsingTimestamp : undefined,
  }

  if (pathname === '/') {
    presenceData.details = 'DEEJAY'
    presenceData.state = strings.viewingHomepage
  }
  else if (pathname.includes('/on-air')) {
    presenceData.details = strings.viewingOnAir
  }
  else if (pathname.includes('/alexa')) {
    presenceData.details = strings.viewingApp
  }
  else if (pathname.includes('/palinsesto')) {
    presenceData.details = strings.viewingSchedule
  }
  else if (pathname.includes('/programmi')) {
    presenceData.details = strings.viewingPrograms
    presenceData.state = 'deejay.it/programmi'

    const programs = [
      { path: '/deejay-chiama-italia', name: 'Deejay Chiama Italia', hosts: 'Linus e Nicola Savino' },
      { path: '/chiamate-roma-triuno-triuno/', name: 'Chiamate Roma Triuno Triuno', hosts: 'Trio Medusa' },
      { path: '/il-volo-del-mattino', name: 'Il Volo Del Mattino', hosts: 'Fabio Volo' },
      { path: '/pinocchio', name: 'Pinocchio', hosts: 'Diego Passoni, La Pina, Valentina Ricci' },
      { path: '/catteland', name: 'Catteland', hosts: 'Alessandro Cattelan' },
      { path: '/summer-camp', name: 'Summer Camp', hosts: 'Aladyn, Federico Russo, Francesco Quarna, Nikki' },
      { path: '/say-waaad', name: 'Say Waaad?', hosts: 'Wad' },
      { path: '/gianluca-gazzoli', name: 'Gazzology', hosts: 'Gianluca Gazzoli' },
      { path: '/pecchia-damiani', name: 'Pecchia e Damiani', hosts: 'Davide Damiani e Federico Pecchia' },
      { path: '/006', name: '006', hosts: 'Umberto e Damiano' },
      { path: '/andrea-e-michele', name: 'Andy e Mike', hosts: 'Andrea Marchesi e Michele Mainardi' },
      { path: '/diego-passoni', name: 'Diego Passoni', hosts: 'Diego Passoni' },
      { path: '/vic-e-marisa', name: 'Vic e Marisa', hosts: 'Marisa Passera e Vic' },
      { path: '/ciao-belli', name: 'Ciao Belli', hosts: 'Dj Angelo e Roberto Ferrari' },
      { path: '/chiacchiericcio', name: 'Chiacchiericcio', hosts: 'Chiara Galeazzi e Francesco Lancia' },
      { path: '/dee-notte', name: 'Dee Notte', hosts: 'Gianluca Vitiello e Nicola Vitiello' },
      { path: '/radar', name: 'Radar', hosts: 'Carlotta Multari e Francesco Quarna' },
      { path: '/deejay-training-center', name: 'Deejay Training Center', hosts: '' },
      { path: '/florencia', name: '¡Hola Deejay!', hosts: 'Florencia' },
      { path: '/legend', name: 'Legend', hosts: 'Aladyn e Alex Farolfi' },
      { path: '/rudy-e-laura', name: 'Rudy e Laura', hosts: 'Laura Antonini e Rudy Zerbi' },
      { path: '/la-bomba', name: 'La Bomba', hosts: 'Luciana Littizzetto e Vic' },
      { path: '/gibi-show', name: 'GiBi Show', hosts: 'Guido Bagatta' },
      { path: '/animal-house', name: 'Animal House', hosts: 'Dunia Rahwan e Paolo Menegatti' },
      { path: '/deejay-football-club', name: 'Deejay Football Club', hosts: 'Fabio Caressa e Ivan Zazzaroni' },
      { path: '/deejay-on-the-road', name: 'Deejay On The Road', hosts: 'Frank' },
      { path: '/deejay-time-stories', name: 'Deejay Time Stories', hosts: 'Albertino' },
      { path: '/deejay-parade', name: 'Deejay Parade', hosts: 'Albertino' },
      { path: '/deejay-time', name: 'Deejay Time', hosts: '' },
      { path: '/il-boss-del-weekend', name: 'Il Boss Del Weekend', hosts: 'Daniele Bossari' },
      { path: '/no-spoiler', name: 'No Spoiler', hosts: 'Antonio Visca' },
      { path: '/sunday-morning', name: 'Sunday Morning', hosts: '' },
    ]

    for (const program of programs) {
      if (pathname.includes(program.path)) {
        presenceData.details = `${strings.viewingProgram}: ${program.name}`
        if (program.hosts) {
          presenceData.state = `${strings.hostedBy}: ${program.hosts}`
        }
        break
      }
    }
  }
  else if (pathname.includes('/highlights')) {
    presenceData.details = strings.viewingHighlights
  }
  else if (pathname.includes('/puntate')) {
    presenceData.details = strings.viewingEpisodes
  }
  else if (pathname.includes('/conduttori')) {
    presenceData.details = strings.viewingHosts

    const hosts = [
      { path: '/linus', name: 'Linus', desc: '30 ottobre 1957, Foligno (PG). È la data di nascita "anagrafica" di Pasquale Di Molfetta, in arte Linus. 18 aprile 1976, Milano. È la data di nascita "radiofonica", il debutto, assolutamente...' },
      { path: '/albertino', name: 'Albertino', desc: 'Alberto Di Molfetta è nato a Paderno Dugnano (MI) il 7 Agosto 1962. Il suo debutto radiofonico avviene nel 1978 a Radio Music, una piccola emittente dell\'hinterland milanese che qualche tem...' },
      { path: '/alessandro-cattelan', name: 'Alessandro Cattelan', desc: 'Alessandro Cattelan nasce a Tortona l\' 11 Maggio 1980. Poi non fa niente di particolarmente interessante ( a parte giocare a calcio ) fino al 2001, anno in cui inizia a condurre il suo prim...' },
      { path: '/alessandro-prisco', name: 'Alessandro Prisco', desc: 'La prima a capire che la pigrizia non sarebbe stata tra le sue "qualità " fu sua madre, costretta al parto in un afoso pomeriggio di fine agosto con oltre due settimane di anticipo. "Esci!",...' },
      { path: '/andrea', name: 'Andrea Marchesi', desc: 'Andrea Marchesi (Cremona, 30 novembre 1973) fa il suo esordio radiofonico nel 1993 in una radio locale di Cremona, Studioradio, dove conduce il programma dance del pomeriggio "House-Party"...' },
      { path: '/antonio-visca', name: 'Antonio Visca', desc: 'Antonio Visca (Alessandria, 19 Gennaio 1975) si divide da sempre tra le sue grandi passioni: radio e tv. E ultimamente anche podcast! Dopo la Laurea in Economia Aziendale ha lavorato a Disne...' },
      { path: '/chiara-galeazzi', name: 'Chiara Galeazzi', desc: 'Chiara Galeazzi è nata a Milano nel 3 dicembre 1986. Nel 2010 ha iniziato a lavorare da VICE Italia dove è rimasta cinque anni come magazine editor, host di reportage e presentatrice del pro...' },
      { path: '/claudio-lauretta', name: 'Claudio Lauretta', desc: 'Imitatore, attore e comico visto a Striscia la Notizia, Markette, Zelig, Chiambretti Night, Glob, Quelli che il calcio, Italia\'s Got Talent, Le Iene e Colorado. Camaleontico e trasformista,...' },
      { path: '/daniele-bossari', name: 'Daniele Bossari', desc: '2018 Conduce Chi ha paura del buio? (Italia1) 2017 Vincitore del GF VIP (Canale5) 2016 - 2009 conduce il programma di prima serata Mistero (Italia1) 2016 - 2013 presenta i Radio Italia Live...' },
      { path: '/davide-damiani', name: 'Davide Damiani', desc: 'Davide Damiani nasce a Pistoia il 5 febbraio 1988. Dopo diversi anni da animatore nei villaggi turistici, decide di fermarsi per studiare teatro a Milano. La radio arriva nel 2017 con la par...' },
      { path: '/diego', name: 'Diego Passoni', desc: 'Sono nato a Monza il 21 Settembre del 1976. Conquisto un glorioso e inaccessibile diploma in ragioneria, dopo il quale, spinto da un viscerale istinto filantropo, mi iscrivo a Scienze dell\'...' },
      { path: '/dj-angelo', name: 'Dj Angelo', desc: 'Comincia la sua attività presso i banchi dell\'Istituto Tecnico Martino Bassi di Seregno ma, subito dopo (all\'età di 6 anni), si accorge che di Ragioneria non ne capisce niente. Dalla "matu...' },
      { path: '/dunia-rahwan', name: 'Dunia Rahwan', desc: 'Su Instagram: @dunia_animalara Nata e cresciuta a Milano, classe 1978, fin da piccolissima manifesta un amore incondizionato per gli animali e, di conseguenza, per la natura. Cresciuta con...' },
      { path: '/fabio-caressa', name: 'Fabio Caressa', desc: 'Fabio Caressa (Roma, 18 aprile 1967) è un giornalista, conduttore televisivo e telecronista sportivo italiano. Inizia a lavorare in televisione nel 1986 presso Canale 66, emittente locale ro...' },
      { path: '/fabio-volo', name: 'Fabio Volo', desc: 'Fabio Bonetti, in arte Fabio Volo, nasce il 23 giugno 1972. 1996 Claudio Cecchetto gli propone di lavorare come speaker a Radio Capital. 1997 Match Music gli propone un contratto per il prog...' },
      { path: '/federico-russo', name: 'Federico Russo', desc: 'Federico Russo nasce a Firenze alle quattro e venti del pomeriggio del 22 dicembre 1980. Frequenta il liceo classico e la spunta liscio liscio con un fiero 60/100 alla maturità . Negli anni d...' },
      { path: '/federico-pecchia', name: 'Federico Pecchia', desc: 'Federico Pecchia nasce a Piombino (LI) il 4 marzo 1991. Fin da piccolo coltiva quella che è la sua più grande passione: stare su un palco, così studia recitazione e improvvisazione teatrale...' },
      { path: '/florencia', name: 'Florencia', desc: 'Florencia Di Stefano-Abichain, argentina d\'origine, veronese d\'adozione, gira l\'Europa prima di approdare a Milano. Ora vive a Milano e lavora come speaker radiofonica, conduttrice, autri...' },
      { path: '/francesco-quarna', name: 'Francesco Quarna', desc: 'Francesco Quarna, DJ e vignaiolo, è in diretta a Summer Camp, con Nikki e Federico Russo da lunedì a venerdì alle 15 su Radio DEEJAY. Nato il 30 ottobre 1980 a Varallo (VC), all\'ombra del M...' },
      { path: '/francesco-lancia', name: 'Francesco Lancia', desc: 'Francesco Lancia nasce a Terni nel 1981. Abbandona l\'idea di mettere a frutto la sudata laurea con lode in informatica poco dopo averla presa per dedicarsi al mondo della scrittura comica,...' },
      { path: '/frank', name: 'Frank', desc: 'Francesco "Frank" Lotta nasce a Grottaglie il 26 agosto 1978. Ha passato tutta la sua adolescenza in Puglia. Collabora con Radio Lattemiele Taranto fino al 2002, in qualità di programmatore...' },
      { path: '/gianluca-gazzoli', name: 'Gianluca Gazzoli', desc: 'Gianluca Gazzoli nasce il 18/08/1988, è un conduttore radiofonico e televisivo, un videomaker e narratore di storie. Tra i nuovi volti del mondo dello spettacolo e di una nuova generazione d...' },
      { path: '/gianluca-vitiello', name: 'Gianluca Vitiello', desc: 'Gianluca Vitiello nasce a C. Mare di Stabia in provincia di Napoli nel luglio del 1976. Cancro ascendente Cancro. Si interessa di tutti i fenomeni legati alle culture urbane e metropolitane...' },
      { path: '/guido-bagatta', name: 'Guido Bagatta', desc: 'Guido Bagatta (Milano, 24 maggio 1960) è un giornalista, conduttore televisivo e conduttore radiofonico italiano. Dopo aver studiato inglese e lettere negli Stati Uniti d\'America presso l\'...' },
      { path: '/ivan-zazzaroni', name: 'Ivan Zazzaroni', desc: 'Claudio Cerasa, il Foglio: "Baggio, Pantani, Zazza e riga al centro. Ivan Zazzaroni è riuscito a diventare uno dei giornalisti sportivi più famosi d\'Italia senza aver avuto il bisogno di in...' },
      { path: '/la-pina', name: 'La Pina', desc: 'Nasce a Firenze il 20 giugno del 1970, nel 1973 si trasferisce con i genitori a Milano. Qui dopo la scuola dell\'obbligo si iscrive all\'ITSOS (Istituto Tecnico Statale a Ordinamento Special...' },
      { path: '/laura-antonini', name: 'Laura Antonini', desc: 'Sono nata a Bologna ma cresciuta a Roma dove vivo attualmente, dopo una parentesi milanese durata otto anni, per amore della mia radio preferita. Pensavo di fare la traduttrice nella vita, m...' },
      { path: '/luciana-littizzetto', name: 'Luciana Littizzetto', desc: 'Attrice e autrice, Luciana Littizzetto è nata a Torino, la città in cui vive. Diplomata al Conservatorio in pianoforte nel 1984, si è laureata in Lettere alla facoltà di Magistero nel 1990,...' },
      { path: '/marisa-passera', name: 'Marisa Passera', desc: 'Una mattina presto, nella vecchia casa della Pina, la sede di Varese, quella con il telefono in corridoio e la tappezzeria marrone psichedelica, è arrivata una telefonata che diceva: ma tu l...' },
      { path: '/michele', name: 'Michele Mainardi', desc: 'Andrea Marchesi (30 novembre 1973) e Michele Mainardi (17 maggio 1973) si sono conosciuti all\'età di 14 anni sui banchi di scuola del Liceo Scientifico G.Aselli di Cremona , città dove entr...' },
      { path: '/matteo-curti', name: 'Matteo Curti', desc: 'Matteo Curti è un autore radiofonico, televisivo, videomaker e fotografo nato a Roma nel 1975. Dopo una lunga gavetta nelle radio locali e una serie di incarichi che spaziavano dalla riparaz...' },
      { path: '/mauro-miclini', name: 'Mauro Miclini', desc: 'Mauro Miclini nasce a Darfo Boario Terme (BS) . All\' inizio degli anni \'80 comincia le prime esperienze radiofoniche a Radio Adamello, dove si occupa della regia e della selezione musicale...' },
      { path: '/nicola-savino', name: 'Nicola Savino', desc: 'Nicola Savino nasce a Lucca il 14 novembre 1967. Inizia a lavorare nel 1984 nella piccola emittente locale: Radio sandonato. Nei 5 anni successivi, in cui si divide tra radio e discoteche, c...' },
      { path: '/nicola-vitiello', name: 'Nicola Vitiello', desc: '300 Premi Fedeltà vinti!!! Sarà stato questo a fare letteralmente innamorare Nicola di Radio Deejay? E\' iniziata proprio in questo modo, a 15 anni, la sua avventura radiofonica: da ascoltat...' },
      { path: '/nikki', name: 'Nikki', desc: 'Fabrizio Lavoro in arte Nikki, nasce a Foggia il 7/7/1971. Nikki, che significa diario in giapponese (è stato anche un movimento letterario nipponico), nasce artisticamente come chitarrista-...' },
      { path: '/paolo-menegatti', name: 'Paolo Menegatti', desc: 'Nato a Milano il 23/03/73, monzese d\'adozione. Il fatto che metà del suo cognome sia formato dalla parola "gatti" potrebbe sembrare un segno del destino. Sono proprio i gatti le prime "best...' },
      { path: '/roberto-ferrari', name: 'Roberto Ferrari', desc: 'Roberto Ferrari è nato a Milano il 13 Giugno 1965 e fin da giovanissimo ha una grandissima passione per la radio. Frequenta la scuola di perito elettronico e proprio durante gli studi, utili...' },
      { path: '/rudy-zerbi', name: 'Rudy Zerbi', desc: 'Nasce il 3 febbraio 1969 a Lodi e si trasferisce a Santa Margherita Ligure. Decide di seguire la propria passione per la musica, diventando innanzitutto disc jockey alla discoteca Covo di No...' },
      { path: '/trio-medusa', name: 'Trio Medusa', desc: 'La loro storia, raccontata in prima persona plurale nel libro "Culattoni e raccomandati", ha inizio quando in giovane età frequentano tutti e tre la stessa località di mare per le vacanze es...' },
      { path: '/umberto-e-damiano', name: 'Umberto e Damiano', desc: 'Umberto Muscetta e Damiano Paolacci crescono a Fiumicino a pochi passi dal celebre aeroporto romano. Amici già dai tempi di Schule, all\'età di 16 anni formano il duo comico "Umberto e Damia...' },
      { path: '/valentina-ricci', name: 'Valentina Ricci', desc: 'Valentina nasce e vive alla periferia ovest di Milano. Studentessa modello, fino alle medie, colleziona una serie di insuccessi scolastici che passando dal raggiungimento della maturità clas...' },
      { path: '/vic', name: 'Vic', desc: 'Nato a Monza (MI) il 29 dicembre 1972, inizia da piccole radio locali, riuscendo a finire ragioneria, iscrivendosi poi a legge. Nel 2000 Canale 5 presenta la prima edizione del Grande Fratel...' },
      { path: '/wad', name: 'Wad', desc: 'Radio personality, giornalista e scrittore. È considerato una delle figure più influenti nel settore "urban" italiano. Conduce Say Waaad!?! su Radio DEEJAY, suonando e raccontando il "nuovo"...' },
    ]

    for (const host of hosts) {
      if (pathname.includes(host.path)) {
        presenceData.details = `${strings.viewingHost}: ${host.name}`
        presenceData.state = host.desc
        break
      }
    }
  }
  else if (pathname.includes('/frequenze')) {
    presenceData.details = strings.viewingFrequencies

    const regions = [
      'abruzzo',
      'basilicata',
      'calabria',
      'campania',
      'emilia-romagna',
      'friuli-venezia-giulia',
      'lazio',
      'liguria',
      'lombardia',
      'marche',
      'molise',
      'piemonte',
      'puglia',
      'sardegna',
      'sicilia',
      'toscana',
      'trentino-alto-adige',
      'umbria',
      'valle-daosta',
      'veneto',
    ]

    for (const region of regions) {
      if (pathname.includes(region)) {
        presenceData.details = `${strings.viewingFrequenciesIn}: ${region.charAt(0).toUpperCase() + region.slice(1).replace(/-/g, ' ')}`
        break
      }
    }
  }
  else if (pathname.includes('/clp/accounts/sites/deejay/www/newsletter.php')) {
    presenceData.details = strings.viewingNewsletter
  }
  else if (pathname.includes('/app-ios-e-android')) {
    presenceData.details = strings.viewingApp
  }
  else if (pathname.includes('/contatti')) {
    presenceData.details = strings.viewingContact
  }
  else if (pathname.includes('/webradio')) {
    presenceData.details = strings.viewingWebradios

    const webradios = [
      { path: '/01', name: 'Deejay 80' },
      { path: '/02', name: 'Deejay Time' },
      { path: '/03', name: 'Deejay Tropical Pizza' },
      { path: '/04', name: 'Deejay One Two One Two' },
      { path: '/05', name: 'Radio Linetti' },
      { path: '/06', name: 'Deejay 30 Songs' },
      { path: '/07', name: 'Deejay Suona Italia' },
      { path: '/08', name: 'Deejay Gasolina' },
      { path: '/09', name: 'Deejay On The Road' },
      { path: '/10', name: 'Deejay One Love' },
    ]

    for (const webradio of webradios) {
      if (pathname.includes(webradio.path)) {
        presenceData.details = `${strings.viewingWebradio}: ${webradio.name}`
        break
      }
    }
  }
  else if (pathname.includes('/classifiche')) {
    presenceData.details = strings.viewingRankings

    if (pathname.includes('/30-songs')) {
      presenceData.details = strings.viewingTop30
    }
    else if (pathname.includes('/deejay-parade')) {
      presenceData.details = strings.viewingDeejayParade
    }
  }
  else if (pathname.includes('/podcast')) {
    presenceData.details = strings.viewingPodcasts
  }
  else if (pathname.includes('/podcast')) {
    presenceData.details = strings.viewingPodcast
  }
  else if (pathname.includes('/argomenti')) {
    presenceData.details = strings.viewingTopics

    if (pathname.includes('/news')) {
      presenceData.details = `${strings.viewingTopic}: News`
    }
    else if (pathname.includes('/deejay-consiglia')) {
      presenceData.details = `${strings.viewingTopic}: Deejay Consiglia`
    }
    else if (pathname.includes('/argomenti/regolamenti')) {
      presenceData.details = strings.viewingRegulations
    }
  }
  else if (pathname.includes('/tag')) {
    const tags = [
      { path: '/radio', name: 'Radio' },
      { path: '/musica', name: 'Musica' },
      { path: '/sport', name: 'Sport' },
      { path: '/personaggi', name: 'Personaggi' },
      { path: '/cinema', name: 'Cinema' },
      { path: '/lifestyle', name: 'Lifestyle' },
    ]

    for (const tag of tags) {
      if (pathname.includes(tag.path)) {
        presenceData.details = `${strings.viewingTag}: ${tag.name}`
        break
      }
    }
  }
  else if (pathname.includes('/tv')) {
    presenceData.details = strings.watchingTV
    presenceData.state = `${strings.liveFrom} deejay.it/tv`
  }
  else if (hostname.includes('store.deejay.it')) {
    presenceData.details = strings.viewingStore
    presenceData.state = strings.shoppingFor
  }
  else if (pathname.includes('/note-legali')) {
    presenceData.details = strings.viewingLegalNotes
  }
  else if (pathname.includes('/corporate/tdm/elemedia/')) {
    presenceData.details = strings.viewingTDM
  }
  else if (pathname.includes('/corporate/privacy/deejay/cookie-policy.html')) {
    presenceData.details = strings.readingCookiePolicy
  }
  else if (pathname.includes('/corporate/privacy/privacy.html')) {
    presenceData.details = strings.readingPrivacyPolicy
  }
  else if (pathname.includes('/corporate/dichiarazione-accessibilita/deejay/')) {
    presenceData.details = strings.readingAccessibility
  }
  else if (pathname.includes('/clp/accounts/sites/deejay/www/profile.php')) {
    presenceData.details = strings.viewingProfile
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})

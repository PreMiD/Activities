const presence = new Presence({
  clientId: '919817726195814431',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const assets = {
  'ai': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/0.png',
  'askubuntu': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/1.png',
  'alcohol': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/2.png',
  'apple': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/3.png',
  'astronomy': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/4.png',
  'avp': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/5.png',
  'anime': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/6.png',
  'biology': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/7.png',
  'br': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/8.png',
  'boardgames': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/9.png',
  'blender': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/10.png',
  'buddhism': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/11.png',
  'chess': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/12.png',
  'chinese': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/13.png',
  'civicrm': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/14.png',
  'chemistry': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/15.png',
  'christianity': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/16.png',
  'craftcms': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/17.png',
  'codegolf': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/18.png',
  'coffee': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/19.png',
  'communitybuilding': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/20.png',
  'computergraphics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/21.png',
  'codereview': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/22.png',
  'cooking': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/23.png',
  'cs': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/24.png',
  'crafts': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/25.png',
  'cstheory': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/26.png',
  'dba': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/27.png',
  'cseducators': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/28.png',
  'conlang': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/29.png',
  'datascience': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/30.png',
  'diy': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/31.png',
  'dsp': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/32.png',
  'devops': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/33.png',
  'economics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/34.png',
  'drones': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/35.png',
  'drupal': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/36.png',
  'earthscience': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/37.png',
  'russian': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/38.png',
  'ru': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/39.png',
  'rus': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/40.png',
  'scicomp': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/41.png',
  'salesforce': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/42.png',
  'sitecore': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/43.png',
  'sports': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/44.png',
  'space': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/45.png',
  'scifi': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/46.png',
  'serverfault': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/47.png',
  'superuser': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/48.png',
  'sharepoint': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/49.png',
  'tor': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/50.png',
  'vi': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/51.png',
  'softwareengineering': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/52.png',
  'stackoverflow': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/53.png',
  'skeptics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/54.png',
  'ukrainian': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/55.png',
  'stellar': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/56.png',
  'softwarerecs': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/57.png',
  'security': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/58.png',
  'sound': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/59.png',
  'sqa': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/60.png',
  'spanish': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/61.png',
  'stackapps': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/62.png',
  'tex': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/63.png',
  'stats': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/64.png',
  'tridion': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/65.png',
  'ux': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/66.png',
  'sustainability': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/67.png',
  'travel': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/68.png',
  'webapps': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/69.png',
  'tezos': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/70.png',
  'vegetarianism': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/71.png',
  'unix': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/72.png',
  'windowsphone': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/73.png',
  'woodworking': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/74.png',
  'webmasters': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/75.png',
  'wordpress': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/76.png',
  'writing': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/77.png',
  'workplace': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/78.png',
  'worldbuilding': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/79.png',
  'judaism': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/80.png',
  'elementaryos': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/81.png',
  'electronics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/82.png',
  'engineering': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/83.png',
  'gamedev': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/84.png',
  'emacs': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/85.png',
  'fitness': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/86.png',
  'ell': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/87.png',
  'english': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/88.png',
  'ethereum': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/89.png',
  'gardening': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/90.png',
  'genealogy': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/91.png',
  'italian': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/92.png',
  'expressionengine': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/93.png',
  'gaming': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/94.png',
  'german': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/95.png',
  'languagelearning': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/96.png',
  'graphicdesign': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/97.png',
  'ham': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/98.png',
  'eosio': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/99.png',
  'law': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/100.png',
  'hermeneutics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/101.png',
  'iota': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/102.png',
  'hinduism': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/103.png',
  'hsm': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/104.png',
  'hardwarerecs': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/105.png',
  'interpersonal': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/106.png',
  'islam': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/107.png',
  'iot': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/108.png',
  'homebrew': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/109.png',
  'ja': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/110.png',
  'gis': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/111.png',
  'history': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/112.png',
  'joomla': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/113.png',
  'japanese': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/114.png',
  'lifehacks': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/115.png',
  'latin': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/116.png',
  'linguistics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/117.png',
  'math': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/118.png',
  'matheducators': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/119.png',
  'magento': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/120.png',
  'stackexchange': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/121.png',
  '3dprinting': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/122.png',
  'academia': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/123.png',
  'aviation': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/124.png',
  'arduino': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/125.png',
  'bitcoin': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/126.png',
  'bicycles': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/127.png',
  'bricks': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/128.png',
  'android': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/129.png',
  'medicalsciences': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/130.png',
  'bioinformatics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/131.png',
  'cardano': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/132.png',
  'literature': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/133.png',
  'korean': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/134.png',
  'expatriates': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/135.png',
  'crypto': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/136.png',
  'musicfans': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/137.png',
  'french': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/138.png',
  'meta': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/139.png',
  'martialarts': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/140.png',
  'monero': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/141.png',
  'esperanto': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/142.png',
  'mechanics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/143.png',
  'parenting': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/144.png',
  'es': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/145.png',
  'ebooks': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/146.png',
  'opensource': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/147.png',
  'mythology': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/148.png',
  'opendata': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/149.png',
  'or': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/150.png',
  'outdoors': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/151.png',
  'freelancing': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/152.png',
  'mattermodeling': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/153.png',
  'music': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/154.png',
  'mathoverflow': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/155.png',
  'mathematica': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/156.png',
  'money': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/157.png',
  'movies': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/158.png',
  'networkengineering': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/159.png',
  'philosophy': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/160.png',
  'pm': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/161.png',
  'politics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/162.png',
  'poker': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/163.png',
  'photo': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/164.png',
  'pets': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/165.png',
  'portuguese': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/166.png',
  'patents': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/167.png',
  'psychology': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/168.png',
  'physics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/169.png',
  'retrocomputing': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/170.png',
  'rpg': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/171.png',
  'robotics': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/172.png',
  'puzzling': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/173.png',
  'reverseengineering': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/174.png',
  'quant': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/175.png',
  'raspberrypi': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/176.png',
  'quantumcomputing': 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/177.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Exchange/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, href } = window.location
  const showButtons = await presence.getSetting<boolean>('buttons')

  switch (hostname) {
    case 'stackexchange.com': {
      presenceData.details = 'Browsing'
      break
    }
    case 'serverfault.com': {
      presenceData.largeImageKey = assets.serverfault
      presenceData.details = 'Server Fault'
      break
    }
    case 'meta.serverfault.com': {
      presenceData.largeImageKey = assets.serverfault
      presenceData.details = 'Server Fault Meta'
      break
    }
    case 'superuser.com': {
      presenceData.largeImageKey = assets.superuser
      presenceData.details = 'Super User'
      break
    }
    case 'meta.superuser.com': {
      presenceData.largeImageKey = assets.superuser
      presenceData.details = 'Super User Meta'
      break
    }
    default: {
      const imageKey = hostname.replace('.stackexchange.com', '')
      if (imageKey === 'meta') {
        presenceData.smallImageKey = assets[imageKey]
      }
      else {
        presenceData.smallImageKey = assets[imageKey.replace('.meta', '') as keyof typeof assets]
      }

      presenceData.smallImageText = document
        .querySelector('meta[property=\'og:site_name\']')
        ?.getAttribute('content')
        ?.replace('Stack Exchange', '')
      if (pathname.includes('/questions')) {
        presenceData.details = 'Reading a question'
        presenceData.buttons = [
          {
            label: 'View Question',
            url: href,
          },
        ]
      }
    }
  }

  if (pathname === '/') {
    if (
      [
        'serverfault.com',
        'meta.serverfault.com',
        'superuser.com',
        'meta.superuser.com',
      ].includes(hostname)
    ) {
      presenceData.state = 'Main Page'
    }
    else {
      presenceData.details = 'Main Page'
    }
  }
  else if (pathname.includes('/questions')) {
    presenceData.state = document.querySelector(
      '.question-hyperlink',
    )?.textContent
  }
  else if (
    [
      'serverfault.com',
      'meta.serverfault.com',
      'superuser.com',
      'meta.superuser.com',
    ].includes(hostname)
  ) {
    presenceData.state = 'Browsing'
  }
  else {
    presenceData.details = 'Browsing'
  }

  if (!showButtons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

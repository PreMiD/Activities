const presence = new Presence({
  clientId: '1215004822676312174',
})

function cleanAndCapitalize(string: string): string {
  return string
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.substring(1))
    .join(' ')
}

const browsingTimestamp = Math.floor(Date.now() / 1000)
const characterList = [
  'amber',
  'barbara',
  'beidou',
  'bennett',
  'chongyun',
  'diluc',
  'diona',
  'eula',
  'fischl',
  'ganyu',
  'hu_tao',
  'jean',
  'kaeya',
  'kaedehara_kazuha',
  'keqing',
  'klee',
  'lisa',
  'mona',
  'ningguang',
  'noelle',
  'qiqi',
  'razor',
  'rosaria',
  'sucrose',
  'tartaglia',
  'anemo-traveler',
  'geo-traveler',
  'venti',
  'xiangling',
  'xiao',
  'xingqiu',
  'xinyan',
  'yanfei',
  'zhongli',
  'albedo',
  'kujou_sara',
  'raiden_shogun',
  'kamisato_ayaka',
  'yoimiya',
  'electro-traveler',
  'sangonomiya_kokomi',
  'sayu',
  'aloy',
  'thoma',
  'itto',
  'gorou',
  'yunjin',
  'shenhe',
  'yae',
  'ayato',
  'shinobu',
  'dendro-traveler',
  'heizou',
  'tighnari',
  'collei',
  'dori',
  'candace',
  'cyno',
  'nilou',
  'nahida',
  'layla',
  'faruzan',
  'wanderer',
  'alhaitham',
  'yaoyao',
  'dehya',
  'mika',
  'baizhu',
  'kaveh',
  'kirara',
  'hydro-traveler',
  'lyney',
  'lynette',
  'freminet',
  'neuvillette',
  'wriothesley',
  'furina',
  'charlotte',
  'navia',
  'chevreuse',
  'xianyun',
  'gaming',
]

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/KQM/assets/0.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, host } = document.location

  if (pathname === '/')
    presenceData.details = 'Browsing KQM'

  const matchedCharacter = characterList.find((character) => {
    return new RegExp(
      `^/(${character}|q/${character.toLowerCase()}[^/]*-quickguide)/$`,
    ).test(pathname)
  })

  if (matchedCharacter) {
    presenceData.details = `Reading a ${
      pathname.includes('-quickguide') ? 'Quick Guide' : 'Guide'
    }`
    presenceData.state = document.title
      .replace(' - KQM', '')
      .replace(' Quick Guide', '')
  }
  else if (pathname.includes('/misc')) {
    presenceData.details = 'Reading a Miscellaneous Guide'
    presenceData.state = document.title.replace(' - KQM', '')
  }
  else if (host === 'library.keqingmains.com') {
    presenceData.details = 'Browsing TCL'
    presenceData.state = cleanAndCapitalize(document.title.replace(' | KQM TCL', '')) || null
  }
  else if (host === 'compendium.keqingmains.com') {
    presenceData.details = 'Browsing The Compendium'
    presenceData.state = cleanAndCapitalize(pathname.substring(1)) || null
  }

  presence.setActivity(presenceData)
})

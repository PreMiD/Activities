import { Assets } from 'premid'

const presence = new Presence({
  clientId: '859781231351693312',
})
const timer = Math.floor(Date.now() / 1000)
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
  'traveler_anemo',
  'traveler_geo',
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
  'traveler_electro',
  'sangonomiya_kokomi',
  'sayu',
  'aloy',
]
const validCharacter = characterList.includes(document.URL.match(/\w+/g)?.pop() ?? '')

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/paimon.moe/assets/logo.png',
    startTimestamp: timer,
  }
  // {hostname} = document.location,
  const { pathname } = window.location

  let stateText: string

  if (pathname === '/')
    presenceData.details = 'Viewing homepage'

  if (pathname.includes('/characters') || pathname.includes('/characters/')) {
    presenceData.details = 'Viewing the character list/details'
    if (validCharacter) {
      const original = document.URL.match(/(\/\w+)/g)
        ?.pop()
        ?.substr(1)
      switch (original) {
        case 'traveler_anemo': {
          stateText = 'Anemo Traveler'
          break
        }
        case 'traveler_geo': {
          stateText = 'Geo Traveler'
          break
        }
        case 'kaedehara_kazuha': {
          stateText = 'Kaedehara Kazuha'
          break
        }
        case 'hu_tao': {
          stateText = 'Hu Tao'
          break
        }
        case 'raiden_shogun': {
          stateText = 'Raiden Shogun (Baal)'
          break
        }
        case 'kujou_sara': {
          stateText = 'Kujou Sara'
          break
        }
        case 'traveler_electro': {
          stateText = 'Electro Traveler'
          break
        }
        case 'kamisato_ayaka': {
          stateText = 'Kamisato Ayaka'
          break
        }
        case 'sangonomiya_kokomi': {
          stateText = 'Sangonomiya Kokomi'
          break
        }
        default:
          stateText = `${original?.charAt(0).toUpperCase()}${original?.slice(1)}`
      }

      presenceData.details = 'Viewing the character details:'
      presenceData.state = stateText
    }
  }
  if (
    pathname.includes('/wish/character-event')
    || pathname.includes('/wish/character-event/')
  ) {
    presenceData.details = 'Viewing at the Wish Counter'
    presenceData.state = 'Wish Counter: Character Event'
  }
  else if (
    pathname.includes('/wish/weapon-event')
    || pathname.includes('/wish/weapon-event/')
  ) {
    presenceData.details = 'Viewing at the Wish Counter'
    presenceData.state = 'Wish Counter: Weapon Event'
  }
  else if (
    pathname.includes('/wish/standard')
    || pathname.includes('/wish/standar/')
  ) {
    presenceData.details = 'Viewing at the Wish Counter'
    presenceData.state = 'Wish Counter: Standard Banner'
  }
  else if (
    pathname.includes('/wish/beginners')
    || pathname.includes('/wish/beginners/')
  ) {
    presenceData.details = 'Viewing at the Wish Counter'
    presenceData.state = 'Wish Counter: Beginners\' Wish'
  }
  else if (
    pathname.includes('/wish/tally')
    || pathname.includes('/wish/tally/')
  ) {
    presenceData.details = '🌏 Global Wish Tally'
  }
  else if (pathname.startsWith('/wish') || pathname.startsWith('/wish/')) {
    const number = document
      .querySelector(
        '#sapper > main > div > div.flex.flex-col.xl\\:flex-row > div.grid.gap-4.grid-cols-1.md\\:grid-cols-2.xl\\:grid-cols-3.max-w-screen-xl > div:nth-child(6) > div.bg-item.rounded-xl.p-4.flex.items-center.w-full.text-white',
      )
      ?.textContent
      ?.split(' ')[3]

    presenceData.details = 'Viewing at the Wish Counter'
    presenceData.state = `Wishes Worth: ✧ ${number}`
  }
  else if (
    pathname.includes('/calculator')
    || pathname.includes('/calculator/')
  ) {
    presenceData.details = 'Using the calculator'
  }
  else if (pathname.includes('/todo') || pathname.includes('/todo/')) {
    presenceData.details = 'Viewing at Todo list'
  }
  else if (pathname.includes('/items') || pathname.includes('/items/')) {
    presenceData.details = 'Viewing at the Database'
    presenceData.state = 'Items'
  }
  else if (
    pathname.includes('/achievement')
    || pathname.includes('/achievement/')
  ) {
    presenceData.details = 'Viewing at the Database'
    presenceData.state = 'Achievements'
  }
  else if (
    pathname.includes('/reminder')
    || pathname.includes('/reminder/')
  ) {
    presenceData.details = 'Viewing at the Database'
    presenceData.state = 'Reminder'
  }
  else if (
    pathname.includes('/furnishing')
    || pathname.includes('/furnishing/')
  ) {
    presenceData.details = 'Viewing at the Database'
    presenceData.state = 'Furnishing'
    if (
      pathname.includes('/furnishing/inventory')
      || pathname.includes('/furnishing/inventory/')
    ) {
      presenceData.details = 'Viewing at the Database'
      presenceData.state = 'Looking at Furnishing Inventory'
    }
    else if (
      pathname.includes('/furnishing/list')
      || pathname.includes('/furnishing/list/')
    ) {
      presenceData.details = 'Viewing at the Database'
      presenceData.state = 'Looking at the Furnishing List'
    }
  }
  else if (pathname.includes('/weapons') || pathname.includes('/weapons/')) {
    presenceData.details = 'Viewing at the Database'
    presenceData.state = 'Weapons'
  }
  else if (
    pathname.includes('/artifacts')
    || pathname.includes('/artifacts/')
  ) {
    presenceData.details = 'Viewing at the Database'
    presenceData.state = 'Artifacts'
  }
  else if (
    pathname.includes('/timeline')
    || pathname.includes('/timeline/')
  ) {
    presenceData.details = 'Viewing at the Timeline'
    presenceData.state = `Time of ${document
      .querySelector(
        '#sapper > main > div > div.flex.svelte-15n1215 > div.svelte-15n1215 > div > label',
      )
      ?.textContent
      ?.match(/(\w(\s+)?)+/g)
      ?.pop()}`
  }
  else if (pathname.includes('/settings') || pathname.includes('/settings/')) {
    presenceData.details = 'Settings'
  }
  else if (
    pathname.includes('/privacy-policy')
    || pathname.includes('/privacy-policy/')
  ) {
    presenceData.details = 'Reading the Privacy Policy'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Reading'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

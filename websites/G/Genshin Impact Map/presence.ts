import { Assets } from 'premid'

const presence = new Presence({
  clientId: '973729201104511007',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  EmblemMondstadt = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/1.png',
  EmblemLiyue = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/2.png',
  EmblemInazuma = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/3.png',
  EmblemUnknown = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/4.png',
  EnkanomiyaMap = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/5.png',
  TeyvatMap = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/6.png',
  TheChasmUndergroundMinesMap = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/7.png',
  EmblemEnkanomiya = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/8.png',
  EmblemThechasm = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/9.png',
  PreviewMondstadt = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/10.png',
  PreviewLiyue = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/11.png',
  PreviewTenshukaku = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/12.png',
  PreviewTheChasmUndergroundMines = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/13.png',
  PreviewGoldenAppleArchipelago28 = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/14.png',
  GoldenAppleArchipelagoMap28 = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/15.png',
  PreviewEnkanomiya = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/16.png',
  EmblemIsles = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/17.png',
  EmblemSumeru = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/18.png',
  PreviewSumeru = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/19.png',
  PreviewSumeru2 = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/0.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Genshin%20Impact%20Map/assets/logo.png',
}

interface Maps extends Image {
  id: number
  map: string
  key?: string[]
  city?: boolean
  starting?: number
  ending?: number
}

interface City extends Image {
  position: number
  map: string
}

interface Image {
  image: {
    small: string
    default: string
    preview?: string | string[]
  }
}

const map: Maps[] = [
  {
    id: 2,
    map: 'Teyvat',
    city: true,
    image: {
      small: ActivityAssets.EmblemUnknown,
      default: ActivityAssets.TeyvatMap,
      preview: ActivityAssets.TeyvatMap,
    },
  },
  {
    id: 7,
    map: 'Enkanomiya',
    image: {
      small: ActivityAssets.EmblemEnkanomiya,
      default: ActivityAssets.EnkanomiyaMap,
      preview: ActivityAssets.PreviewEnkanomiya,
    },
  },
  {
    id: 9,
    map: 'The Chasm: Underground Mines',
    key: ['chasm', 'the-chasm-underground'],
    image: {
      small: ActivityAssets.EmblemThechasm,
      default: ActivityAssets.TheChasmUndergroundMinesMap,
      preview: ActivityAssets.PreviewTheChasmUndergroundMines,
    },
  },
  {
    // Event map 2.8
    // https://www.hoyolab.com/article/5958494/
    id: 12,
    map: 'Golden Apple Archipelago',
    key: ['isles', 'golden-apple-archipelago-2-8'],
    image: {
      small: ActivityAssets.EmblemIsles,
      default: ActivityAssets.GoldenAppleArchipelagoMap28,
      preview: ActivityAssets.PreviewGoldenAppleArchipelago28,
    },
    starting: 1657854000, // Fri, 15 Jul 2022 03:00 GMT
    ending: 1661295600, // Wed, 24 Aug 2022 23:00 GMT
  },
  {
    id: 0,
    map: 'Unknown',
    image: {
      small: ActivityAssets.EmblemUnknown,
      default: ActivityAssets.EmblemUnknown,
    },
  },
]
const city: City[] = [
  {
    position: 1200,
    map: 'Mondstadt',
    image: {
      small: ActivityAssets.EmblemMondstadt,
      default: ActivityAssets.PreviewMondstadt,
      preview: ActivityAssets.PreviewMondstadt,
    },
  },
  {
    position: 2500,
    map: 'Liyue',
    image: {
      small: ActivityAssets.EmblemLiyue,
      default: ActivityAssets.PreviewLiyue,
      preview: ActivityAssets.PreviewLiyue,
    },
  },
  {
    position: 5000,
    map: 'Sumeru',
    image: {
      small: ActivityAssets.EmblemSumeru,
      default: ActivityAssets.PreviewSumeru,
      preview: [ActivityAssets.PreviewSumeru, ActivityAssets.PreviewSumeru2],
    },
  },
  {
    position: 9000,
    map: 'Inazuma',
    image: {
      small: ActivityAssets.EmblemInazuma,
      default: ActivityAssets.PreviewTenshukaku,
      preview: ActivityAssets.PreviewTenshukaku,
    },
  },
]

let oldMap: string
let current: Maps
let currentCity: City | null = null
let getPosition: number
let randomNumber: number

presence.on('UpdateData', async () => {
  const [timestamps, showPreview, randomPreview] = await Promise.all([
    presence.getSetting<boolean>('timestamps'),
    presence.getSetting<boolean>('showPreview'),
    presence.getSetting<boolean>('randomPreview'),
  ])
  const presenceData: PresenceData = {
    details: 'Genshin Impact Map',
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Search,
    startTimestamp: browsingTimestamp,
  }
  const { hash, host, hostname, pathname, search } = document.location
  const searchParams = new URLSearchParams(search)

  if (hostname === 'mapgenie.io' && !pathname.includes('genshin-impact'))
    return
  switch (hostname) {
    case 'genshin-impact-map.appsample.com':
      current = map.find(
        i =>
          i.key?.includes(searchParams.get('map')?.toLowerCase() ?? '')
          ?? i.map
            .toLowerCase()
            .includes(searchParams.get('map')?.toLowerCase() || 'teyvat'),
      )!
      break
    case 'mapgenie.io':
      current = map.find(
        i =>
          i.key?.includes(pathname?.split('/maps/')[1]?.toLowerCase() ?? '')
          ?? i.map
            .toLowerCase()
            .includes(pathname?.split('/maps/')[1]?.toLowerCase() || 'teyvat'),
      )!
      break
    default: // Official Site
      if (pathname.includes('signin-sea'))
        return
      current = map.find(
        i => i.id === (Number.parseInt(hash?.split('/map/')[1]?.split('?')[0] ?? '') || 2),
      )!
      getPosition = Number.parseInt(new URLSearchParams(hash).get('center') ?? '')
      if (current?.city)
        currentCity = city.find(i => i.position >= getPosition)!
      else currentCity = null
      break
  }
  if (!current)
    return
  if (oldMap !== (currentCity?.map ?? current.map)) {
    oldMap = currentCity?.map ?? current.map
    randomNumber = Math.random()
  }
  if (
    current.starting
    && current.ending
    && !(
      current.starting < Date.now() / 1000 && current.ending > Date.now() / 1000
    )
  ) {
    current = map[0]!
  }
  else if (
    (current.starting && current.ending)
    && !(
      current.starting < Date.now() / 1000 || current.ending > Date.now() / 1000
    )
  ) {
    current = map[0]!
  }
  presenceData.details = current.map
  presenceData.state = current.city && currentCity ? currentCity.map : null
  presenceData.largeImageKey = getImage(
    showPreview ? 'preview' : 'default',
    randomPreview,
  )
  presenceData.smallImageKey = current.city && currentCity ? currentCity.image.small : current.image.small
  presenceData.smallImageText = host.replace('.com', '')
  if (!timestamps) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

function getImage(type: 'default' | 'preview', random?: boolean) {
  const currentImage = currentCity?.image ?? current.image
  return (
    Array.isArray(currentImage[type]) && type === 'preview'
      ? currentImage[type][
        random ? Math.floor(randomNumber * currentImage[type].length) : 0
      ]
      : currentImage[type] || current.image.default
  ) as string
}

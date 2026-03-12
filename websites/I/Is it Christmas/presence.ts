import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1188891443817889822',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/I/Is%20it%20Christmas/assets/logo.png',
}

interface MyChristmasData {
  christmas: boolean
  country: string
}

const christmasData: { me: MyChristmasData, others: Record<string, unknown> } = {
  me: {
    christmas: false,
    country: 'US',
  },
  others: {},
}

const interval = setInterval(getChristmasData, 3000)
getChristmasData()

async function getChristmasData() {
  const { me, others } = await presence.getPageVariable<{
    me: MyChristmasData
    others: Record<string, unknown>
  }>('me', 'others')
  if (!me.christmas && interval)
    clearInterval(interval)

  christmasData.me = me
  christmasData.others = others
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  presenceData.details = document.querySelector<HTMLAnchorElement>('#answer')

  if (christmasData.me.christmas) {
    presenceData.state = `${
      Object.keys(christmasData.others).length + 1
    } people celebrating Christmas`
    presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.flag.me img')?.src
      ?? Assets.Question
    presenceData.smallImageText = christmasData.me.country
  }

  presence.setActivity(presenceData)
})

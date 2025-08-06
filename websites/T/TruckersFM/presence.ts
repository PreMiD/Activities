import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '640914619082211338',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

function getElementByXPath(xpath: string): Element | null {
  const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
  return result.singleNodeValue as Element | null
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: (getElementByXPath('/html/body/div[1]/div/div[1]/div[3]/div[1]/div/div[1]/div/div[1]/img') as HTMLImageElement)?.src || 'https://cdn.rcd.gg/PreMiD/websites/T/TruckersFM/assets/logo.png',
    startTimestamp: browsingTimestamp,
    type: ActivityType.Listening,
  }

  const artistElement = getElementByXPath('/html/body/div[1]/div/div[1]/div[3]/div[1]/div/div[1]/div/div[2]/div[1]/div[2]')
  const titleElement = getElementByXPath('/html/body/div[1]/div/div[1]/div[3]/div[1]/div/div[1]/div/div[2]/div[1]/div[1]')
  const presenterElement = getElementByXPath('/html/body/div[1]/div/div[1]/div[3]/div[1]/div/div[2]/div/div[2]/div/div[1]/div[2]/div[1]')

  presenceData.details = `${
    artistElement?.textContent
  } - ${titleElement?.textContent}`
  presenceData.state = presenterElement?.textContent ?? 'AutoDJ'
  presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/T/TruckersFM/assets/logo.png'
  presenceData.smallImageText = 'TruckersFM'

  presence.setActivity(presenceData)
})

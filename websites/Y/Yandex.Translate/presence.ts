const presence = new Presence({
  clientId: '799583813582848041',
})
const browsingTimestamp: number = Math.floor(Date.now() / 1000)

let from: string | null | undefined, to: string | null | undefined, typet: string | null | undefined

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Y/Yandex.Translate/assets/logo.png',
  }

  switch (document.location.pathname) {
    case '/': {
      typet = 'Text'
      from = document.querySelector('#srcLangButton')?.textContent
      to = document.querySelector('#dstLangButton')?.textContent

      break
    }
    case '/translate':
    case '/doc': {
      typet = document.location.pathname === '/translate' ? 'Website' : 'Document'
      from = document.querySelector(
        '#srcLangButton > #sourceLangText',
      )?.textContent
      to = document.querySelector(
        '#dstLangButton > #targetLangText',
      )?.textContent

      break
    }
    case '/ocr': {
      typet = 'Image'
      from = document.querySelector('#sourceLangButton')?.textContent
      to = document.querySelector('#targetLangButton')?.textContent

      break
    }
    default: {
      typet = 'Text'
      from = 'Choosing...'
      to = 'Choosing...'
    }
  }

  const showTime = await presence.getSetting<boolean>('stamp')
  const showType = await presence.getSetting<boolean>('type')

  presenceData.startTimestamp = showTime ? browsingTimestamp : null
  if (presenceData.startTimestamp === null)
    delete presenceData.startTimestamp

  if (showType) {
    presenceData.details = `Translating: ${typet}`
    presenceData.state = `From: ${from} - To: ${to}`
  }
  else {
    presenceData.details = `Translating from: ${from}`
    presenceData.state = `To: ${to}`
  }

  presence.setActivity(presenceData)
})

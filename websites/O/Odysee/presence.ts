import { Assets } from 'premid'

const presence = new Presence({ clientId: '837270687638224906' })

presence.on('UpdateData', async () => {
  const buttons = await presence.getSetting<boolean>('buttons')
  const floatingViewer = document.querySelector(
    '.content__viewer--floating',
  )
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/Odysee/assets/logo.png',
  }
  if (document.location.pathname === '/' && !floatingViewer) {
    presenceData.details = 'Browsing homepage'
  }
  else if (document.location.pathname.startsWith('/$/')) {
    const path = document.location.pathname
    if (path.includes('/$/following'))
      presenceData.details = 'Browsing followed content'
    else if (path.includes('/$/uploads'))
      presenceData.details = 'Browsing own uploads'
    else if (path.includes('/$/channels'))
      presenceData.details = 'Browsing own channels'
    else if (path.includes('/$/settings'))
      presenceData.details = 'Browsing settings'
    else if (path.includes('/$/wallet'))
      presenceData.details = 'Looking inside wallet'
    else if (path.includes('/$/dashboard'))
      presenceData.details = 'Reading dashboard'
    else if (path.includes('/$/rewards'))
      presenceData.details = 'Browsing own rewards'
    else if (path.includes('/$/notifications'))
      presenceData.details = 'Reading notifications'
    else if (path.includes('/$/upload'))
      presenceData.details = 'Planning to upload some content'
    else presenceData.details = 'Browsing subpage'
  }
  else if (floatingViewer || document.location.pathname.includes('/@')) {
    const userName = document.querySelector<HTMLVideoElement>('h1.channel__title')
    if (userName) {
      presenceData.details = `Viewing ${userName.textContent} page`
      presenceData.state = document.querySelector('span.channel-name')?.textContent
    }
    else {
      const title = floatingViewer
        ? document.querySelector(
            '.content__viewer--floating div.claim-preview__title span.button__label',
          )
        : document.querySelector('h1.card__title')
      const uploaderName = floatingViewer
        ? document.querySelector(
            '.content__viewer--floating span.channel-name',
          )
        : document.querySelector(
            'div.card__main-actions div.claim-preview__title > span.truncated-text',
          )
      const video = floatingViewer
        ? document.querySelector<HTMLVideoElement>('.content__viewer--floating .vjs-tech')
        : document.querySelector<HTMLVideoElement>('.vjs-tech')
      const uploaderUrlElement = floatingViewer
        ? document.querySelector<HTMLLinkElement>('div.draggable.content__info > a')
        : document.querySelector<HTMLLinkElement>(
            'div.media__subtitle > a.button--uri-indicator',
          )
      if (title && uploaderName) {
        presenceData.details = title.textContent
        presenceData.state = `${uploaderName.textContent}${document.querySelector(
          'div.card__main-actions div.media__subtitle  span.channel-name',
        )?.textContent}`
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'

        if (uploaderUrlElement && buttons) {
          presenceData.buttons = [
            {
              label: 'Watch Video',
              url: document.URL,
            },
            {
              label: 'View Channel',
              url: uploaderUrlElement.href,
            },
          ]
        }
        if (video) {
          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
          presenceData.smallImageKey = video.paused
            ? Assets.Pause
            : Assets.Play
          presenceData.smallImageText = video.paused ? 'Paused' : 'Watching'
          if (video.paused)
            delete presenceData.endTimestamp
        }
      }
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

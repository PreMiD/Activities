import { Assets } from 'premid'

const presence = new Presence({
  clientId: '630542731701387276',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Di.FM/assets/logo.png',
  }
  if (
    document.querySelector('#webplayer-region')?.getAttribute('data-state')
    === 'playing'
  ) {
    presenceData.details = document
      .querySelectorAll('.artist-name')[0]
      ?.textContent
      ?.replace('-', '')
    presenceData.state = document.querySelectorAll('.track-name')[0]?.textContent
    presenceData.smallImageKey = Assets.Play
    presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
      'div > section.track-region.col > div > div.artwork > div > img',
    )?.src
  }
  else {
    presenceData.state = 'Browsing...'
    presenceData.smallImageKey = Assets.Pause
  }
  presence.setActivity(presenceData)
})

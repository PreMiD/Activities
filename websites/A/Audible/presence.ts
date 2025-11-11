import { Assets, getTimestamps, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '991933219719086080',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Audible/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (document.location.pathname.includes('/account')) {
    presenceData.details = 'Viewing account'
  }
  else if (document.location.pathname.includes('/wl')) {
    presenceData.details = 'Viewing wishlist'
  }
  else if (document.location.pathname.includes('/library')) {
    presenceData.details = 'Viewing library'
  }
  else if (document.location.pathname.includes('plus')) {
    presenceData.details = 'Viewing plus catalog'
  }
  else if (document.location.pathname.includes('gift')) {
    presenceData.details = 'Viewing gift center'
  }
  else if (document.location.pathname.includes('/pd')) {
    presenceData.details = `Viewing ${
      document.querySelector(
        'h1.bc-heading.bc-color-base.bc-pub-break-word.bc-text-bold',
      )?.textContent
    } by ${
      document.querySelector(
        'li.bc-list-item.authorLabel > a.bc-link.bc-color-link',
      )?.textContent
    }`
    presenceData.largeImageKey = document
      .querySelector('img.bc-pub-block.bc-image-inset-border.js-only-element')
      ?.getAttribute('src')
  }
  else if (document.location.pathname.includes('/webplayer')) {
    presenceData.details = `Listening to ${document
      .querySelector('#adbl-cloud-player-container-data')
      ?.getAttribute('data-title')}`
    presenceData.state = document.querySelector('#cp-Top-chapter-display')?.textContent

    const chapterRemaining = getTimestamps(
      timestampFromFormat(
        document.querySelector('#adblMediaBarTimeSpent')?.textContent ?? '',
      ),
      timestampFromFormat(
        document
          .querySelector('#adblMediaBarTimeLeft')
          ?.textContent
          ?.replace('– ', '') ?? '',
      )
      + timestampFromFormat(
        document.querySelector('#adblMediaBarTimeSpent')?.textContent ?? '',
      ),
    );
    [presenceData.startTimestamp, presenceData.endTimestamp] = chapterRemaining
    presenceData.largeImageKey = document
      .querySelector('#adbl-cloudBook')
      ?.getAttribute('src')
    if (
      document.querySelector('.adblPlayButton')?.classList.contains('bc-hidden')
    )
      presenceData.smallImageKey = Assets.Pause
    else presenceData.smallImageKey = Assets.Play
  }
  else {
    presenceData.details = 'Browsing'
    delete presenceData.state
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }
  presence.setActivity(presenceData)
})

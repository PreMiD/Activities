import { Assets } from 'premid'

const presence = new Presence({
  clientId: '839924185278840853',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const elapsed = await presence.getSetting<boolean>('elapsed')
  const timeleft = await presence.getSetting<boolean>('timeleft')
  const privacy = await presence.getSetting<boolean>('privacy')
  const buttons = await presence.getSetting<boolean>('buttons')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/R/Rabbit\'s%20BS%20Viewer/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname.includes('/bs-viewer/')) {
    if (document.querySelector('#songname')?.textContent === '') {
      presenceData.details = 'Selecting Beatmap'
    }
    else {
      presenceData.details = `${
        document.querySelector('#songname')?.textContent
      } ${document.querySelector('#songsubname')?.textContent}`
      presenceData.state = `${
        document.querySelector<HTMLSelectElement>('#difficultyselect')
          ?.value
          .replace('Plus', '+')} (${
        document.querySelector<HTMLSelectElement>('#difficultyselect')
          ?.selectedOptions
          ?.item(0)
          ?.textContent
      })`
      presenceData.buttons = [
        {
          label: 'View Page',
          url: document.location.href,
        },
      ]
      if (document.location.href === 'https://skystudioapps.com/bs-viewer/')
        delete presenceData.buttons
    }
    switch (document.querySelector('#play-button')?.getAttribute('class')) {
      case 'fas fa-pause':
        presenceData.smallImageKey = Assets.Play
        presenceData.endTimestamp = Date.now()
          + (Number.parseInt(
            document
              .querySelector('#stats')
              ?.firstChild
              ?.textContent
              ?.split(':')[1] ?? '',
          )
          * 60
          + Number.parseInt(
            document
              .querySelector('#stats')
              ?.firstChild
              ?.textContent
              ?.split(':')[2] ?? '',
          ))
          * 1000
          - (Number.parseInt(document.querySelector('#time')?.textContent?.split(':')[0] ?? '')
            * 60
            + Number.parseInt(
              document.querySelector('#time')?.textContent?.split(':')[1] ?? '',
            ))
            * 1000
        presenceData.smallImageText = 'Playing'
        break
      case 'fas fa-play':
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
        break
    }
  }
  else if (document.location.pathname.includes('/mapping-tools/')) {
    presenceData.details = 'Mapping Tool'
    presenceData.state = document.querySelector('.selected-tab')?.textContent
    if (
      (
        document.querySelector(
          'input#file-input.file-input',
        ) as HTMLInputElement
      ).value !== ''
      && !privacy
    ) {
      presenceData.state = `${
        document.querySelector('.selected-tab')?.textContent
      } (${(
        document.querySelector(
          'input#file-input.file-input',
        ) as HTMLInputElement
      ).value.replace('C:\\fakepath\\', '')})`
    }
  }
  else if (document.location.pathname.includes('/')) {
    presenceData.details = 'Viewing Homepage'
  }

  if (!elapsed)
    delete presenceData.startTimestamp

  if (!timeleft && presenceData.endTimestamp)
    delete presenceData.endTimestamp

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons

  presence.setActivity(presenceData)
})

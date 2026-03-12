import { Assets } from 'premid'

const presence = new Presence({
  clientId: '640561280800915456',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let min: number,
  sec: number,
  time: number,
  min2: number,
  sec2: number,
  time2: number

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Bandcamp/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const cover = await presence.getSetting<boolean>('cover')

  if (document.location.hostname === 'bandcamp.com') {
    if (
      document.querySelector(
        '#discover > div:nth-child(9) > div:nth-child(2) > div > div.detail-player > div > table > tbody > tr:nth-child(1) > td.play_cell > a > div',
      ) === null
    ) {
      presenceData.details = 'Viewing:'

      if (document.location.pathname.endsWith('wishlist')) {
        presenceData.state = `${
          document.querySelector(
            '#fan-bio-vm > div.fan-bio.owner.no-photo > div.fan-bio-inner > div.name > h1 > span',
          )?.textContent
        }'s wishlist`
      }
      else if (document.location.pathname.endsWith('genres')) {
        presenceData.state = `${
          document.querySelector(
            '#fan-bio-vm > div.fan-bio.owner.no-photo > div.fan-bio-inner > div.name > h1 > span',
          )?.textContent
        }'s following genres`
      }
      else {
        presenceData.state = `${
          document.querySelector(
            '#fan-bio-vm > div.fan-bio.owner.no-photo > div.fan-bio-inner > div.name > h1 > span',
          )?.textContent
        }'s profile`
      }
    }
    else if (
      document.querySelector(
        '#discover > div:nth-child(9) > div:nth-child(2) > div > div.detail-player > div > table > tbody > tr:nth-child(1) > td.play_cell > a > div',
      )?.className === 'playbutton playing'
    ) {
      min = Number.parseInt(
        document
          .querySelector(
            '#discover > div:nth-child(9) > div:nth-child(2) > div > div.detail-player > div > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_elapsed',
          )
          ?.textContent
          ?.split(':')[0] ?? '0',
      )
      sec = Number.parseInt(
        document
          .querySelector(
            '#discover > div:nth-child(9) > div:nth-child(2) > div > div.detail-player > div > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_elapsed',
          )
          ?.textContent
          ?.split(':')[1] ?? '0',
      )
      min = min * 60
      time = min + sec

      min2 = Number.parseInt(
        document
          .querySelector(
            '#discover > div:nth-child(9) > div:nth-child(2) > div > div.detail-player > div > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_total',
          )
          ?.textContent
          ?.split(':')[0] ?? '0',
      )
      sec2 = Number.parseInt(
        document
          .querySelector(
            '#discover > div:nth-child(9) > div:nth-child(2) > div > div.detail-player > div > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_total',
          )
          ?.textContent
          ?.split(':')[1] ?? '0',
      )
      min2 = min2 * 60
      time2 = min2 + sec2

      const [startTimestamp, endTimestamp] = presence.getTimestamps(
        time,
        time2,
      );
      [presenceData.startTimestamp, presenceData.endTimestamp] = [
        startTimestamp,
        endTimestamp,
      ]
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'

      if (cover) {
        presenceData.largeImageKey = document
          .querySelector('[class="popupImage"]')
          ?.firstElementChild
          ?.getAttribute('src') ?? 'bc'
      }
      presenceData.details = document.querySelector(
        '#discover > div:nth-child(9) > div:nth-child(2) > div > div.detail-player > div > table > tbody > tr:nth-child(1) > td.track_cell > div > span.title-section > span',
      )?.textContent
      presenceData.state = `Album: ${
        document.querySelector(
          '#discover > div:nth-child(9) > div:nth-child(2) > div > div.detail-body > div:nth-child(2) > span.detail-album > a',
        )?.textContent
      } by: ${
        document.querySelector(
          '#discover > div:nth-child(9) > div:nth-child(2) > div > div.detail-body > p.detail-artist > a',
        )?.textContent
      }`
    }
    else {
      presenceData.details = 'Viewing:'
      presenceData.state = document.querySelector('head > title')?.textContent
    }
  }
  else if (document.location.hostname === 'daily.bandcamp.com') {
    if (
      document.querySelector('#content > div:nth-child(2) > h2') !== null
      && document.location.pathname !== '/'
    ) {
      presenceData.details = 'Reading article:'
      presenceData.state = document.querySelector(
        '#content > div:nth-child(2) > h2',
      )?.textContent
      presenceData.smallImageKey = Assets.Reading
    }
    else {
      presenceData.details = 'Bandcamp Daily'
      presenceData.state = 'Browsing...'
    }
  }
  else if (
    document.querySelector(
      '#trackInfoInner > div.inline_player > table > tbody > tr:nth-child(1) > td.play_cell > a > div',
    ) !== null
    && document.querySelector(
      '#trackInfoInner > div.inline_player > table > tbody > tr:nth-child(1) > td.play_cell > a > div',
    )?.className === 'playbutton playing'
    && document.location.pathname.includes('/album/')
  ) {
    min = Number.parseInt(
      document
        .querySelector(
          '#trackInfoInner > div.inline_player > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_elapsed',
        )
        ?.textContent
        ?.split(':')[0] ?? '0',
    )
    sec = Number.parseInt(
      document
        .querySelector(
          '#trackInfoInner > div.inline_player > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_elapsed',
        )
        ?.textContent
        ?.split(':')[1] ?? '0',
    )
    min = min * 60
    time = min + sec

    min2 = Number.parseInt(
      document
        .querySelector(
          '#trackInfoInner > div.inline_player > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_total',
        )
        ?.textContent
        ?.split(':')[0] ?? '0',
    )
    sec2 = Number.parseInt(
      document
        .querySelector(
          '#trackInfoInner > div.inline_player > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_total',
        )
        ?.textContent
        ?.split(':')[1] ?? '0',
    )
    min2 = min2 * 60
    time2 = min2 + sec2;

    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(Math.floor(time), Math.floor(time2))
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'
    if (cover) {
      presenceData.largeImageKey = document
        .querySelector('[class="popupImage"]')
        ?.firstElementChild
        ?.getAttribute('src') ?? 'bc'
    }
    presenceData.details = document.querySelector(
      '#trackInfoInner > div.inline_player > table > tbody > tr:nth-child(1) > td.track_cell > div > span.title-section > a > span',
    )?.textContent
    presenceData.state = `Album: ${document
      .querySelector('#name-section > h2')
      ?.textContent
      ?.trim()} by: ${
      document.querySelector('#name-section > h3 > span > a')
        ?.textContent
    }`
  }
  else if (document.location.pathname.includes('/album/')) {
    presenceData.details = 'Viewing album:'
    presenceData.state = `${document
      .querySelector('#name-section > h2')
      ?.textContent
      ?.trim()} by: ${
      document.querySelector('#name-section > h3 > span > a')
        ?.textContent
    }`
  }
  else if (
    document.querySelector(
      '#trackInfoInner > div.inline_player.one-track > table > tbody > tr:nth-child(1) > td.play_cell > a > div',
    ) !== null
    && document.querySelector(
      '#trackInfoInner > div.inline_player.one-track > table > tbody > tr:nth-child(1) > td.play_cell > a > div',
    )?.className === 'playbutton playing'
    && document.location.pathname.includes('/track/')
  ) {
    min = Number.parseInt(
      document
        .querySelector(
          '#trackInfoInner > div.inline_player.one-track > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_elapsed',
        )
        ?.textContent
        ?.split(':')[0] ?? '0',
    )
    sec = Number.parseInt(
      document
        .querySelector(
          '#trackInfoInner > div.inline_player.one-track > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_elapsed',
        )
        ?.textContent
        ?.split(':')[1] ?? '0',
    )
    min = min * 60
    time = min + sec

    min2 = Number.parseInt(
      document
        .querySelector(
          '#trackInfoInner > div.inline_player.one-track > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_total',
        )
        ?.textContent
        ?.split(':')[0] ?? '0',
    )
    sec2 = Number.parseInt(
      document
        .querySelector(
          '#trackInfoInner > div.inline_player.one-track > table > tbody > tr:nth-child(1) > td.track_cell > div > span.time.secondaryText > span.time_total',
        )
        ?.textContent
        ?.split(':')[1] ?? '0',
    )
    min2 = min2 * 60
    time2 = min2 + sec2;

    [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(Math.floor(time), Math.floor(time2))
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Playing'
    if (cover) {
      presenceData.largeImageKey = document
        .querySelector('[class="popupImage"]')
        ?.firstElementChild
        ?.getAttribute('src') ?? 'bc'
    }
    presenceData.details = document
      .querySelector('#name-section > h2')
      ?.textContent
      ?.trim()
    presenceData.state = `By: ${
      document.querySelector('#name-section > h3 > span > a')
        ?.textContent
    }`
  }
  else if (document.location.pathname.includes('/track/')) {
    presenceData.details = 'Viewing track:'
    presenceData.state = `${document
      .querySelector('#name-section > h2')
      ?.textContent
      ?.trim()} by: ${
      document.querySelector('#name-section > h3 > span > a')
        ?.textContent
    }`
  }
  else {
    presenceData.details = 'Viewing:'
    presenceData.state = document.querySelector('head > title')?.textContent
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

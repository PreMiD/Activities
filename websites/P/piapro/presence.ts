import { Assets } from 'premid'

const presence = new Presence({
  clientId: '641416608790609942',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let min: number,
  sec: number,
  time: number,
  min2: number,
  sec2: number,
  time2: number,
  paused: boolean,
  timestamps: number[]

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/piapro/assets/logo.png',
  }

  if (document.location.hostname === 'piapro.jp') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing home page'
    }
    else if (document.location.pathname.includes('/html5_player_popup/')) {
      min = Number.parseInt(
        document
          .querySelector(
            '#jp_container_1 > div > div.jp-gui > div.jp-interface > div.jp-current-time',
          )
          ?.textContent
          ?.split(':')[0] ?? '',
      )
      sec = Number.parseInt(
        document
          .querySelector(
            '#jp_container_1 > div > div.jp-gui > div.jp-interface > div.jp-current-time',
          )
          ?.textContent
          ?.split(':')[1] ?? '',
      )
      min = min * 60
      time = min + sec

      min2 = Number.parseInt(
        document
          .querySelector(
            '#jp_container_1 > div > div.jp-gui > div.jp-interface > div.jp-duration',
          )
          ?.textContent
          ?.split(':')[0] ?? '',
      )
      sec2 = Number.parseInt(
        document
          .querySelector(
            '#jp_container_1 > div > div.jp-gui > div.jp-interface > div.jp-duration',
          )
          ?.textContent
          ?.split(':')[1] ?? '',
      )
      min2 = min2 * 60
      time2 = min2 + sec2
      if (
        !document
          .querySelector('#jp_container_1')
          ?.className
          .includes('jp-state-playing')
      ) {
        paused = true
      }
      else {
        paused = false
      }

      timestamps = presence.getTimestamps(time, time2);
      [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'

      presenceData.details = document.querySelector('body > header > h1')?.textContent
      presenceData.state = document.querySelector(
        'body > header > div > p.artist',
      )?.textContent

      if (paused) {
        delete presenceData.startTimestamp
        delete presenceData.endTimestamp
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
      }
    }
    else if (document.location.pathname.includes('/t/')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = `Viewing ${
        document
          .querySelector('head > title')
          ?.textContent
          ?.split('|')[1]
          ?.split('「')[0]
      }:`
      presenceData.state = document.querySelector(
        '#main > div.cd_works-whole.illust > div.cd_works-mainclm > h1',
      )?.textContent
    }
    else if (document.location.pathname.includes('/music')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Browsing the'
      presenceData.state = 'music category'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/illust')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Browsing the'
      presenceData.state = 'illustrations category'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/text')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Browsing the'
      presenceData.state = 'text category'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/search/')) {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Searching for:'
      const search = document.querySelector('#keyword')
      presenceData.state = search?.textContent
      presenceData.smallImageKey = Assets.Search
    }
    else if (document.querySelector('#user_prof > p:nth-child(2)')) {
      presenceData.details = 'Viewing user:'
      presenceData.state = document.querySelector(
        '#user_prof > p:nth-child(2)',
      )?.textContent
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/collabo/')) {
      presenceData.details = 'Viewing collab:'
      presenceData.state = document.querySelector('#main_name > h2')?.textContent
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/collabo_list/')) {
      presenceData.details = 'Viewing collab list'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (
      document.location.pathname.includes('/pages/official_collabo/')
    ) {
      presenceData.details = 'Viewing official collab:'
      presenceData.state = document.querySelector(
        '#main > div.static_path > span',
      )?.textContent
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (document.location.pathname.includes('/official_collabo/')) {
      presenceData.details = 'Viewing official collab list'
      presenceData.startTimestamp = browsingTimestamp
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

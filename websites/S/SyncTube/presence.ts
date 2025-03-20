const presence = new Presence({
  clientId: '827892428266274857',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let video = {
  currentTime: 0,
  duration: 0,
  paused: true,
  title: 'Unknown',
  channel: 'Unknown',
  url: null as unknown as string,
}

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/SyncTube/assets/0.png',
  Logo2 = 'https://cdn.rcd.gg/PreMiD/websites/S/SyncTube/assets/1.png',
}

presence.on('UpdateData', async () => {
  const [timeElapsed, moreDetails, showButtons, privacy, logo] = await Promise.all([
    presence.getSetting<boolean>('timeElapsed'),
    presence.getSetting<boolean>('moreDetails'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<number>('logo'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: logo === 0 ? ActivityAssets.Logo : ActivityAssets.Logo2,
  }
  const urlpath = window.location.pathname.split('/')

  if (timeElapsed)
    presenceData.startTimestamp = browsingTimestamp

  if (!urlpath[1]) {
    presenceData.details = 'Home'
  }
  else if (urlpath[1] === 'rooms') {
    if (urlpath[2]) {
      presenceData.details = privacy
        ? 'In Room'
        : document.querySelector('div.roomName.noselect')?.textContent
      if (!privacy) {
        if (moreDetails && video) {
          presenceData.details = video.title
          presenceData.state = video.channel;

          [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(video.currentTime, video.duration)
        }
        else {
          presenceData.state = document.querySelector(
            'div.userCount.noselect',
          )?.textContent
        }
      }

      if (showButtons) {
        presenceData.buttons = [
          {
            label: 'Join Room',
            url: window.location.href,
          },
        ]

        if (!privacy && video.url) {
          presenceData.buttons.push({
            label: 'Watch Video',
            url: video.url,
          })
        }
      }
    }
    else {
      presenceData.details = 'Browsing Rooms'
    }
  }
  else {
    presenceData.details = 'Other'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

presence.on(
  'iFrameData',
  (data: unknown) => {
    video = data as typeof video
  },
)

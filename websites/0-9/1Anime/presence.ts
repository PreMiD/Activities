import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '1314062632419852309',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/1Anime/assets/logo.png',
}

// state
let playing = false

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Watching,
  }

  switch (document.location.hostname) {
    case '1anime.one': {
      if (document.location.pathname === '/') {
        presenceData.details = 'Checking out 1anime\'s homepage!'
        presenceData.startTimestamp = browsingTimestamp
      }
      else if (document.location.pathname.includes('/anime/watch/')) {
        // player state ig
        const player = document.querySelector('video')!
        const timestamps = presence.getTimestampsfromMedia(player)
        playing = !player.paused
        // anime info ig
        const title = document.querySelector(
          'div#details h3.font-Archivo',
        )!.textContent!
        const splitIndex = title.lastIndexOf(' - ') // title is in "Anime Title - Episode x" format

        // setting up presence
        presenceData.details = `${
          title.slice(0, splitIndex).trim() || 'something..'
        }`
        presenceData.state = `Currently on ${
          title.slice(splitIndex + 3).trim() || 'an episode..'
        }`
        presenceData.smallImageKey = playing ? Assets.Play : Assets.Pause
        presenceData.smallImageText = playing
          ? (await strings).play
          : (await strings).pause
        if (playing) {
          presenceData.startTimestamp = timestamps[0]
          presenceData.endTimestamp = timestamps[1]
        }
        else {
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
        }
        // buttons-actions
        presenceData.buttons = [
          {
            label: 'Watch Now',
            url: `https://1ani.me/a/${
              document.location.pathname.split('/')[3]
            }`,
          },
        ]
      }
      break
    }
  }
  presence.setActivity(presenceData)
})

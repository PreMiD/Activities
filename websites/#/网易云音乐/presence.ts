import { Assets } from 'premid'

const presence = new Presence({ clientId: '1035124482735607838' })
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  listen: 'general.buttonListenAlong',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/%23/%E7%BD%91%E6%98%93%E4%BA%91%E9%9F%B3%E4%B9%90/assets/logo.png',
}

presence.on('UpdateData', async () => {
  if (document.querySelector('#g_player')) {
    const playerButton = document.querySelector(
      '#g_player > div.btns > a.ply.j-flag',
    )
    const paused = playerButton?.classList.contains('pas') === false
    const audioTimeLeft = document.querySelector(
      '#g_player > div.play > div.m-pbar > span',
    )!.textContent
    const title = document.querySelector(
      '#g_player > div.play > div.j-flag.words > a',
    )?.textContent
    const songPath = document.querySelector('#g_player > div.play > div.j-flag.words > a')?.getAttribute('href')
    const author = document.querySelector('#g_player > div.play > div.j-flag.words > span > span')?.textContent
    const audioTime = presence.timestampFromFormat(document.querySelector('#g_player > div.play > div.m-pbar > span > em')!.textContent!)
    const audioDuration = presence.timestampFromFormat(audioTimeLeft!.replace(/(.*)(?=\/)/, '').replace('/ ', ''))

    const [startTimestamp, endTimestamp] = presence.getTimestamps(audioTime, audioDuration)
    const presenceData: PresenceData = {
      details: title,
      state: author,
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: paused ? Assets.Pause : Assets.Play,
      smallImageText: paused ? (await strings).pause : (await strings).play,
      startTimestamp,
      endTimestamp,
      buttons: [
        {
          label: (await strings).listen,
          url: `https://music.163.com/#${songPath}`,
        },
      ],
    }

    if (paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    if (title && author)
      presence.setActivity(presenceData, !paused)
  }
  else {
    presence.clearActivity()
  }
})

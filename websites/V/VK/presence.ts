import { Assets } from 'premid'

const presence = new Presence({
  clientId: '514771696134389760',
})
const localeStrings: { [stringPath: string]: Record<string, string> } = {
  en: {
    Chatting: 'Browsing PM\'s...',
    Watching: 'Watching',
    Browsing: 'Browsing',
    BrowsingFeed: 'Browsing feed...',
  },
  ru: {
    Chatting: 'Смотрит сообщения...',
    Watching: 'Смотрит',
    Browsing: 'Просматривает',
    BrowsingFeed: 'Смотрит ленту...',
  },
}
let isPlaying: boolean, timestamps

function getLocale(): string {
  return window.navigator.language.replace('-', '_').toLowerCase()
}

function getLocalizedString(stringPath: string): string {
  if (localeStrings[getLocale()] && localeStrings[getLocale()]![stringPath]) {
    return localeStrings[getLocale()]![stringPath]!
  }
  else {
    presence.info(`Language for [${stringPath}] was not found!`)
    return localeStrings.en![stringPath]!
  }
}

function getVKTrackTimePassed(duration: number) {
  const playerDuration = document.querySelector(
    '.audio_page_player_duration',
  )?.textContent

  let timePassed

  if (playerDuration && !playerDuration?.startsWith('-')) {
    timePassed = presence.timestampFromFormat(playerDuration)
  }
  else if (playerDuration) {
    timePassed = duration - presence.timestampFromFormat(playerDuration.slice(1))
  }

  return timePassed
}

function getAudioPlayer() {
  return new Promise<[{ duration: number }]>((resolve) => {
    const script = document.createElement('script')
    const _listener = (data: Event) => {
      script.remove()
      resolve(JSON.parse((data as CustomEvent).detail))

      window.removeEventListener('PreMiD_Pageletiable', _listener, true)
    }

    window.addEventListener('PreMiD_Pageletiable', _listener)

    script.id = 'PreMiD_Pageletiables'
    script.appendChild(
      document.createTextNode(`
        var pmdPL = new CustomEvent("PreMiD_Pageletiable", {detail: JSON.stringify(window["getAudioPlayer"]()._currentAudio)});
        window.dispatchEvent(pmdPL);
      `),
    );

    (document.body || document.head || document.documentElement).appendChild(
      script,
    )
  })
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let audioPlayer: [{ duration: number }]

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/VK/assets/logo.png',
  }
  const gstrings = await presence.getStrings({
    play: 'general.playing',
    pause: 'general.paused',
  })

  if (
    document.location.pathname.startsWith('/audios')
    || document.querySelector('.audio_layer_container')
  ) {
    audioPlayer ??= await getAudioPlayer()

    if (document.querySelector('.audio_playing') === null)
      isPlaying = true
    else isPlaying = false

    const { duration } = audioPlayer.find(x => x.duration)!

    timestamps = presence.getTimestamps(
      getVKTrackTimePassed(duration)!,
      duration,
    )

    presenceData.details = document.querySelector<HTMLElement>(
      '.audio_page_player_title_song',
    )?.textContent
    presenceData.state = document.querySelector<HTMLElement>(
      '.audio_page_player_title_performer a',
    )?.textContent
    if (isPlaying) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = gstrings.pause
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = gstrings.play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
    }

    presence.setActivity(presenceData, true)
  }
  else if (window.location.href.match(/https:\/\/vk.com\/.*?z=video.*/)) {
    isPlaying = document.querySelector('.videoplayer_ui')?.getAttribute('data-state')
      === 'paused'

    const videoCurrentTime = document
      .querySelector<HTMLElement>('._time_current')!
      .textContent!
      .split(':')
    const videoDuration = document
      .querySelector<HTMLElement>('._time_duration')!
      .textContent!
      .split(':')

    timestamps = presence.getTimestamps(
      Math.floor(
        Number(videoCurrentTime[0]) * 60 + Number(videoCurrentTime[1]),
      ),
      Math.floor(Number(videoDuration[0]) * 60 + Number(videoDuration[1])),
    )

    presenceData.details = `${getLocalizedString('Watching')} ${
      document.querySelector<HTMLElement>('.mv_title')?.textContent
    }`
    presenceData.state = document.querySelector<HTMLElement>('.mv_author_name a')?.textContent
    if (isPlaying) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = gstrings.pause
    }
    else {
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = gstrings.play;
      [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
    }
    presence.setActivity(presenceData, true)
  }
  else if (document.querySelector('.page_name')) {
    presenceData.details = document.querySelector<HTMLElement>('.page_name')?.textContent
    presenceData.startTimestamp = browsingTimestamp

    presence.setActivity(presenceData, true)
  }
  else if (document.location.pathname.startsWith('/feed')) {
    presenceData.details = getLocalizedString('BrowsingFeed')
    presenceData.startTimestamp = browsingTimestamp

    presence.setActivity(presenceData, true)
  }
  else if (document.location.pathname.startsWith('/im')) {
    presenceData.details = getLocalizedString('Chatting')
    presenceData.startTimestamp = browsingTimestamp

    presence.setActivity(presenceData, true)
  }
  else {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    presence.clearActivity()
  }
})

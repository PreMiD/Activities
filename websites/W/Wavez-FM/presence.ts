import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1500686150845595730',
})

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/1fybXxK.png',
}

presence.on('UpdateData', async () => {
  const rawLang = await presence.getSetting<string>('lang') || 'en'
  const lang = rawLang.toLowerCase().split('-')[0] || 'en'
  const strings: Record<string, any> = {
    en: {
      'wavezfm.listening': {
        description: 'Listening',
        message: 'Listening',
      },
      'wavezfm.joinRoom': {
        description: 'Join room',
        message: 'Join Room',
      },
      'wavezfm.playingTo': {
        description: 'playing to',
        message: 'playing to',
      },
      'wavezfm.noMusic': {
        description: 'No music playing',
        message: 'No music playing',
      },
      'wavezfm.peoples': {
        description: 'Peoples',
        message: 'peoples',
      },
    },
    pt: {
      'wavezfm.listening': {
        description: 'Referencia a ação do ouvinte',
        message: 'Ouvindo',
      },
      'wavezfm.joinRoom': {
        description: 'Referencia ao botão para entrar na sala',
        message: 'Entrar na sala',
      },
      'wavezfm.playingTo': {
        description: 'Referencia a ação do DJ',
        message: 'tocando para',
      },
      'wavezfm.noMusic': {
        description: 'Referencia a nenhuma musica encontrada',
        message: 'Nenhuma música tocando',
      },
      'wavezfm.peoples': {
        description: 'Referencia a pessoas na sala',
        message: 'pessoas',
      },
    },
  }
  const currentStrings = strings[lang] || strings.en

  const wavezFMUrl = window.location.href
  const presenceData: PresenceData = {
    details: currentStrings['wavezfm.noMusic'].message,
  }
  const songElement = document.querySelector('[class="w-full truncate leading-normal font-black text-white text-[12px]"]')?.textContent || 'Musica indisponivel'
  const djElement = document.querySelector('[class="truncate text-sky-100/54 min-w-0 flex-1 text-[10px] leading-normal"]')?.textContent || 'DJ Indisponivel'
  const peopleElement = document.querySelector('[class="inline-flex min-w-[1.2rem] items-center justify-center rounded-md border px-1 text-[10px] font-black whitespace-nowrap tabular-nums border-(--theme-border) bg-(--theme-button-neutral-bg) text-[color-mix(in_srgb,var(--theme-text-secondary)_76%,transparent)]"]')?.textContent || '0'
  const timeElement = document.querySelector('[class="shrink-0 leading-none font-semibold text-sky-100/38 tabular-nums text-[9px]"]') as HTMLElement
  const times = timeElement?.textContent.split('/').map(t => t.trim()) || ['0:00', '0:00']

  if (!songElement || !djElement || !timeElement || !peopleElement) {
    presence.setActivity()
    return
  }
  if (times.length === 2) {
    const currentTimeStr = times[0]
    const totalTimeStr = times[1]
    const parseTime = (timeStr: any) => {
      const parts = timeStr.split(':')
      return Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1])
    }
    const currentSeconds = parseTime(currentTimeStr)
    const totalSeconds = parseTime(totalTimeStr)
    const now = Date.now()
    if (songElement && djElement && timeElement) {
      presenceData.largeImageKey = ActivityAssets.Logo
      presenceData.startTimestamp = now - (currentSeconds * 1000)
      presenceData.endTimestamp = presenceData.startTimestamp + (totalSeconds * 1000)
      presenceData.smallImageKey = Assets.Play
      presenceData.details = `${currentStrings['wavezfm.listening'].message}: ${songElement}`
      presenceData.state = `${djElement} ${currentStrings['wavezfm.playingTo'].message} ${peopleElement} ${currentStrings['wavezfm.peoples'].message}!`
      presenceData.buttons = [{
        label: `${currentStrings['wavezfm.joinRoom'].message}`,
        url: `${wavezFMUrl}`,
      }]
      presence.setActivity(presenceData)
    }
  }
  presence.setActivity(presenceData)
})

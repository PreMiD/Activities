import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1449507812395847692',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/HyzMYTv.png',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const settings = {
    privacyMode: await presence.getSetting<boolean>('privacy'),
    browsingActivity: await presence.getSetting<boolean>('browsingActivity'),
    showCover: await presence.getSetting<boolean>('cover'),
    hideWhenPaused: await presence.getSetting<boolean>('hideWhenPaused'),
    showTitleAsPresence: await presence.getSetting<boolean>('titleAsPresence'),
  }

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Navegando no Anim',
    type: ActivityType.Watching,
    name: 'Anim',
    startTimestamp: browsingTimestamp,
  }

  const video = document.querySelector('video') as HTMLVideoElement
  if (video) {
    const pageDetails = {
      paused: video.paused,
      currentTime: video.currentTime ?? 0,
      duration: video.duration ?? 0,
      anime_name: document.querySelector('title')?.textContent.split(' - ')[2] ?? 'Nome do Anime',
      ep: document.querySelector('title')?.textContent.split(' - ')[0] ?? 'Número do EP',
      ep_name: document.querySelector('title')?.textContent.split(' - ')[1] ?? 'Nome do EP',
      ep_preview: document.querySelector('img')?.src ?? ActivityAssets.Logo,
    }
    const { paused, anime_name, ep, ep_name, ep_preview } = pageDetails

    if (paused && settings.hideWhenPaused) return presence.clearActivity()

    // Informações
    presenceData.name = settings.showTitleAsPresence ? anime_name : 'Anim'
    presenceData.details = settings.showTitleAsPresence ? ep_name : anime_name
    presenceData.state = settings.showTitleAsPresence ? ep : `${ep} - ${ep_name}`;
    [presenceData.startTimestamp, presenceData.endTimestamp] = paused ? [0, 0] : getTimestampsFromMedia(video)

    // Imagens
    presenceData.largeImageKey = settings.showCover ? ep_preview ?? ActivityAssets.Logo : ActivityAssets.Logo
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? 'Pausado' : 'Reproduzindo'
  }
  else {
    if (!settings.browsingActivity) return presence.clearActivity()

    const pathnameArray = pathname.split('/')
    const staticPages: Record<string, PresenceData> = {
      '': { details: 'Navegando', state: 'Procurando o que assistir...', largeImageKey: ActivityAssets.Logo },
      'apoiar': { details: 'Apoiando', state: 'Na página de apoiar' },
      'sobre': { details: 'Sobre', state: 'Vendo sobre o Anim' },
      'login': { details: 'Logando', state: 'Realizando login' },
      'register': { details: 'Cadastrando-se', state: 'Realizando o cadastro' },
      'watch': { details: document.querySelector('title')?.textContent.split(' - ')[2], state: `${document.querySelector('title')?.textContent.split(' - ')[0]} - Aguardando o player carregar...`, largeImageKey: document.querySelector('img')?.src },
      'config': { details: `Configurações - ${document.querySelector('button[class*=blue] span')?.textContent ?? '...'}` },
      'profile': { details: 'Visualizando Perfil', state: pathnameArray[2], largeImageKey: document.querySelector('img')?.src },
      'anime': { details: 'Visualizando Anime', state: document.querySelector('section div[class^=text-3xl]')?.textContent, largeImageKey: document.querySelector('img')?.src },
    }

    presenceData.details = staticPages[pathnameArray[1] as string]?.details
    presenceData.state = staticPages[pathnameArray[1] as string]?.state
    presenceData.largeImageKey = settings.showCover ? staticPages[pathnameArray[1] as string]?.largeImageKey ?? ActivityAssets.Logo : ActivityAssets.Logo
  }

  if (settings.privacyMode) {
    presenceData.details = 'Navegando no Anim'
    presenceData.state = 'No modo privado'
    presenceData.smallImageKey = Assets.Question
    presenceData.largeImageKey = ActivityAssets.Logo
    presenceData.smallImageText = 'Modo Privado '
    if (video) {
      presenceData.name = 'Anim';
      [presenceData.startTimestamp, presenceData.endTimestamp] = [0, 0]
    }
  }

  presence.setActivity(presenceData)
})

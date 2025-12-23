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
    showCover: await presence.getSetting<boolean>('cover'),
    showTitleAsPresence: await presence.getSetting<boolean>('titleAsPresence')
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
      currentTime: video.currentTime,
      duration: video.duration,
      anime_name: document.querySelector('title')?.textContent.split(' - ')[2],
      ep: document.querySelector('title')?.textContent.split(' - ')[0],
      ep_name: document.querySelector('title')?.textContent.split(' - ')[1],
      ep_preview: document.querySelector('img')?.src,
    }
    const { paused, anime_name, ep, ep_name, ep_preview } = pageDetails
    //TODO TERMINAR O PRIVACY MODE E O COVER
    // Informações
    presenceData.name = settings.showTitleAsPresence ? anime_name : 'Anim'
    presenceData.details = settings.showTitleAsPresence ? ep_name : anime_name
    presenceData.state = settings.showTitleAsPresence ? ep : `${ep} - ${ep_name}`;
    [presenceData.startTimestamp, presenceData.endTimestamp] = paused ? [0, 0] : getTimestampsFromMedia(video)

    // Imagens
    presenceData.largeImageKey = settings.showCover ? ep_preview ?? ActivityAssets.Logo : ActivityAssets.Logo
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? 'Pausado' : 'Reproduzindo';
  } else {
    const pathnameArray = pathname.split('/')
    const staticPages: Record<string, PresenceData> = {
      '': { details: 'Página Principal', largeImageKey: ActivityAssets.Logo },
      'apoiar': { details: 'Apoiar o Anim' },
      'sobre': { details: 'Sobre o Anim' },
      'login': { details: 'Logando no Anim' },
      'register': { details: 'Cadastrando-se no Anim' },
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

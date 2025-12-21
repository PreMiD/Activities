import { ActivityType, Assets, getTimestampsFromMedia } from 'premid'

const presence = new Presence({
  clientId: '1449507812395847692',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://i.imgur.com/HyzMYTv.png',
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Navegando no Anim',
    type: ActivityType.Watching,
    name: 'Anim',
    detailsUrl: 'https://anim.lol',
    startTimestamp: browsingTimestamp,
  }

  const pathnameArray = pathname.split('/')
  const staticPages: Record<string, PresenceData> = {
    '': { details: 'Página Principal', largeImageKey: ActivityAssets.Logo },
    'apoiar': { details: 'Apoiando o Anim!' },
    'sobre': { details: 'Sobre o Anim' },
    'login': { details: 'Logando no Anim' },
    'register': { details: 'Cadastrando-se no Anim' },
    'config': { details: `Configurações - ${document.querySelector('button[class*=blue] span')?.textContent ?? '...'}` },
    'profile': { details: 'Visualizando Perfil', state: pathnameArray[2], largeImageKey: document.querySelector('img')?.src },
    'anime': { details: 'Visualizando Anime', state: document.querySelector('section div[class^=text-3xl]')?.textContent, largeImageKey: document.querySelector('img')?.src },
  }

  presenceData.details = staticPages[pathnameArray[1] as string]?.details
  presenceData.detailsUrl = href
  presenceData.state = staticPages[pathnameArray[1] as string]?.state
  presenceData.largeImageKey = staticPages[pathnameArray[1] as string]?.largeImageKey ?? ActivityAssets.Logo

  const video = document.querySelector('video') as HTMLVideoElement
  if (video) {
    const url = document.querySelector('.flex.flex-col.items-start.mb-4 a') as HTMLAnchorElement

    const pageDetails = {
      paused: video.paused,
      currentTime: video.currentTime,
      duration: video.duration,
      anime_name: document.querySelector('title')?.textContent.split(' - ')[2],
      anime_url: url.href,
      ep: document.querySelector('title')?.textContent.split(' - ')[0],
      ep_name: document.querySelector('title')?.textContent.split(' - ')[1],
      ep_description: document.querySelector('.w-full.mt-4.mb-4.text-justify')?.textContent,
      ep_url: href,
      ep_preview: document.querySelector('img')?.src,
    }
    const { paused, anime_name, anime_url, ep, ep_name, ep_description, ep_url, ep_preview } = pageDetails

    // Informações
    presenceData.name = anime_name || 'Assistindo um vídeo'
    presenceData.details = ep_name || 'Nome do EP'
    presenceData.state = ep || 'Número do EP'
    presenceData.detailsUrl = anime_url || 'https://anim.lol'
    presenceData.stateUrl = ep_url || 'https://anim.lol'

    // Imagens
    presenceData.largeImageKey = ep_preview ?? ActivityAssets.Logo
    presenceData.largeImageText = ep_description || 'Descrição do EP'
    presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = paused ? 'Pausado' : 'Reproduzindo';

    // Timestamp
    [presenceData.startTimestamp, presenceData.endTimestamp] = paused ? [0, 0] : getTimestampsFromMedia(video)
  }

  presence.setActivity(presenceData)
})

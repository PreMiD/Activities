import type { ActivityType } from 'premid';
import { Assets } from 'premid';

interface Presence {
  constructor(options: { clientId: string });
  on(event: string, callback: (...args: unknown[]) => void): void;
  setActivity(data: PresenceData): void;
  getSetting<T>(setting: string): Promise<T>;
  getTimestamps(current: number, duration: number): [number, number];
}

interface PresenceData {
  type?: ActivityType;
  largeImageKey?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  details?: string;
  state?: string;
  buttons?: Array<{ label: string; url: string }>;
  smallImageKey?: string;
  smallImageText?: string;
}

const presence = new Presence({ clientId: '1395970198405644350' });
const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = 'https://i.ibb.co/hJwCZCTx/ico-menu-2.png',
  Home = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/home-icon-download-in-svg-png-gif-file-formats--house-casa-building-categories-pack-miscellaneous-icons-112182.png?f=webp&w=512',
  Calendar = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/calendar-icon-download-in-svg-png-gif-file-formats--schedule-planning-date-business-pack-icons-1650787.png?f=webp&w=512',
  Search = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/search-icon-download-in-svg-png-gif-file-formats--find-magnifier-glass-ios-11-ui-elements-vol-2-pack-user-interface-icons-475061.png?f=webp&w=512',
  Profile = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/user-rounded-icon-download-in-svg-png-gif-file-formats--person-people-avatar-profile-ui-8-pack-design-development-icons-11410209.png?f=webp&w=512',
  Films = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/film-reel-1381038-1160929.png?f=webp&w=512',
  Partyroll = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/people-5156504-4302647.png?f=webp&w=512',
  Notes = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/changelog-11796821-9633010.png?f=webp&w=512',
  VIP = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/vip-stars-4877729-4058729.png?f=webp&w=512',
  Requests = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/request-1890238-1600612.png?f=webp&w=512',
  ARPCoins = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/coin-11766103-9604340.png?f=webp&w=512',
  Account = 'https://cdn.iconscout.com/icon/free/png-512/free-account-icon-download-in-svg-png-gif-file-formats--circle-user-profile-avatar-action-vol-1-pack-interface-icons-1512648.png?f=webp&w=512',
}

const pageDetails: Record<string, { title: string; image?: string }> = {
  '': { title: 'Vendo a página inicial', image: ActivityAssets.Home },
  animes: { title: 'Procurando animes', image: ActivityAssets.Search },
  calendario: { title: 'Vendo o calendário de lançamentos', image: ActivityAssets.Calendar },
  ajuda: { title: 'Lendo a página de ajuda' },
  perfil: { title: 'Vendo seu perfil', image: ActivityAssets.Profile },
  filmes: { title: 'Explorando filmes', image: ActivityAssets.Films },
  party: { title: 'Usando Partyroll', image: ActivityAssets.Partyroll },
  notes: { title: 'Lendo notas de atualização', image: ActivityAssets.Notes },
  vip: { title: 'Visualizando área VIP', image: ActivityAssets.VIP },
  pedidos: { title: 'Fazendo pedidos de animes', image: ActivityAssets.Requests },
  arp: { title: 'Gerenciando ARPCoins', image: ActivityAssets.ARPCoins },
  categoria: { title: 'Explorando categoria' },
  lista: { title: 'Vendo lista de animes' },
  dublados: { title: 'Filtrando animes dublados' },
  legendados: { title: 'Filtrando animes legendados' },
  login: { title: 'Fazendo login' },
  registrar: { title: 'Criando conta' },
  recuperar: { title: 'Recuperando conta' },
  configuracoes: { title: 'Ajustando configurações' },
  notificacoes: { title: 'Verificando notificações' },
  favoritos: { title: 'Vendo favoritos' },
  historico: { title: 'Revisando histórico' },
};

interface VideoData {
  duration: number;
  currentTime: number;
  paused: boolean;
}

const initialVideoState: VideoData = {
  duration: 0,
  currentTime: 0,
  paused: true,
};

let video: VideoData = { ...initialVideoState };
const imageCache: Record<string, string> = {};

async function getCoverImage(): Promise<string> {
  try {
    const currentUrl = window.location.href;
    if (imageCache[currentUrl]) {
      return imageCache[currentUrl];
    }

    const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content;
    if (ogImage) {
      imageCache[currentUrl] = ogImage;
      return ogImage;
    }

    const coverElement = document.querySelector<HTMLImageElement>('#anime_title img');
    if (coverElement?.src) {
      imageCache[currentUrl] = coverElement.src;
      return coverElement.src;
    }

    const bgElement = document.querySelector<HTMLElement>('.sc-kpOvIu.ixIKbI');
    if (bgElement) {
      const bgStyle = window.getComputedStyle(bgElement);
      const bgImageMatch = bgStyle.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/i);
      if (bgImageMatch?.[1]) {
        imageCache[currentUrl] = bgImageMatch[1];
        return bgImageMatch[1];
      }
    }

    return ActivityAssets.Logo;
  } catch (error) {
    console.error('Erro ao obter imagem de capa:', error);
    return ActivityAssets.Logo;
  }
}

function getAnimeTitle(): string {
  const selectors = [
    'article.animedetails h2',
    'h1.anime-title',
    '.content h1',
    'title'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const textContent = element?.textContent?.trim();
    if (textContent) {
      if (selector === 'title') {
        return textContent.replace(/( - Assistir.*| - AnimesROLL)$/i, '');
      }
      return textContent;
    }
  }

  return 'Anime Desconhecido';
}

presence.on('iFrameData', (data: unknown) => {
  if (data && typeof data === 'object' && 'duration' in data && 'currentTime' in data && 'paused' in data) {
    video = data as VideoData;
  }
});

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  };

  try {
    const showButtons = await presence.getSetting<boolean>('buttons');
    const privacyMode = await presence.getSetting<boolean>('privacy');
    const showTimestamps = await presence.getSetting<boolean>('timestamps');
    const showCover = await presence.getSetting<boolean>('cover');

    const { pathname, href, hostname } = document.location;
    const pathArr = pathname.split('/').filter(Boolean);
    const [firstSegment = '', secondSegment = '', thirdSegment = ''] = pathArr;

    if (showCover) {
      presenceData.largeImageKey = await getCoverImage();
    }

    // Área de conta do usuário
    if (hostname === 'my.anroll.net') {
      const accountPages: Record<string, string> = {
        '': 'Minha Conta',
        '?p=config': 'Editando configurações',
        history: 'Visualizando histórico',
        '?p=gift': 'Visualizando presentes',
        favorites: 'Visualizando favoritos',
        subscription: 'Gerenciando assinatura VIP',
        login: 'Fazendo login',
        register: 'Criando conta',
        forgot: 'Recuperando senha',
        confirm: 'Confirmando conta',
      };

      presenceData.details = accountPages[firstSegment] || 'Gerenciando conta';
      presenceData.largeImageKey = ActivityAssets.Account;

      if (!privacyMode) {
        presenceData.state = 'Área de conta do usuário';
      }
    }
    // Páginas principais
    else if (Object.hasOwn(pageDetails, firstSegment)) {
      const pageInfo = pageDetails[firstSegment];
      presenceData.details = pageInfo.title;

      if ((privacyMode || !showCover) && pageInfo.image) {
        presenceData.largeImageKey = pageInfo.image;
      }

      if (secondSegment) {
        if (firstSegment === 'categoria') {
          presenceData.state = `Categoria: ${secondSegment.replace(/-/g, ' ')}`;
        } else if (firstSegment === 'filmes') {
          const filters: Record<string, string> = {
            lancamentos: 'Novos filmes',
            populares: 'Filmes populares',
            dublados: 'Filmes dublados',
            legendados: 'Filmes legendados'
          };
          presenceData.state = filters[secondSegment] || 'Explorando filmes';
        }
      }
    }
    // Subpáginas específicas
    else if (firstSegment === 'arpcoins' && secondSegment) {
      const subPages: Record<string, string> = {
        comprar: 'Comprando ARPCoins',
        historico: 'Vendo histórico de ARPCoins',
        resgatar: 'Resgatando códigos de ARPCoins',
        convidar: 'Convidando amigos'
      };
      presenceData.details = subPages[secondSegment] || 'Gerenciando ARPCoins';
      presenceData.largeImageKey = ActivityAssets.ARPCoins;
    }
    // Partyroll
    else if (firstSegment === 'party') {
      if (secondSegment === 'criar') {
        presenceData.details = 'Criando sessão Partyroll';
      } else if (secondSegment === 'sessao' && thirdSegment) {
        const sessionName = document.querySelector('.session-name')?.textContent || 'Sessão Partyroll';
        presenceData.details = `Assistindo em Partyroll: ${sessionName}`;
      } else {
        presenceData.details = 'Usando Partyroll';
      }
      presenceData.largeImageKey = ActivityAssets.Partyroll;
    }
    // Páginas de conteúdo
    else if (pathArr.length === 2 && firstSegment === 'a') {
      const animeTitle = getAnimeTitle();
      presenceData.details = 'Vendo detalhes do anime';
      presenceData.state = animeTitle;

      if (!privacyMode && showButtons) {
        presenceData.buttons = [{ label: 'Ver Anime', url: href }];
      }
    }
    // Assistindo episódio
    else if (pathArr.length === 2 && firstSegment === 'e') {
      const animeTitle = document.querySelector('#anime_title span')?.textContent?.trim() || 'Anime Desconhecido';
      const episode = document.querySelector('#current_ep strong')?.textContent?.trim() || 'Episódio Desconhecido';

      presenceData.details = `Assistindo ${animeTitle}`;
      presenceData.state = episode;

      if (showTimestamps && video.duration > 0) {
        const [startTimestamp, endTimestamp] = presence.getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration)
        );
        presenceData.startTimestamp = startTimestamp;
        presenceData.endTimestamp = endTimestamp;
      }

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
      presenceData.smallImageText = video.paused ? 'Pausado' : 'Assistindo';

      if (!privacyMode && showButtons) {
        presenceData.buttons = [{ label: 'Assistir Anime', url: href }];
      }

      if (video.paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }
    }
    // Assistindo filme
    else if (firstSegment === 'filmes' && secondSegment === 'assistir' && thirdSegment) {
      const movieTitle = document.querySelector('h1.title')?.textContent?.trim() || 'Filme Desconhecido';
      presenceData.details = `Assistindo filme: ${movieTitle}`;
      presenceData.largeImageKey = ActivityAssets.Films;

      if (showTimestamps && video.duration > 0) {
        const [startTimestamp, endTimestamp] = presence.getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration)
        );
        presenceData.startTimestamp = startTimestamp;
        presenceData.endTimestamp = endTimestamp;
      }

      presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
      presenceData.smallImageText = video.paused ? 'Pausado' : 'Assistindo';

      if (!privacyMode && showButtons) {
        presenceData.buttons = [{ label: 'Assistir Filme', url: href }];
      }

      if (video.paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }
    }
    // Página genérica
    else {
      const pageTitle = document.title.replace(/( - Anroll| - Assistir.*)/i, '');
      presenceData.details = privacyMode ? 'Navegando...' : `Explorando: ${pageTitle}`;
      
      if (firstSegment === 'genero' && secondSegment) {
        presenceData.details = 'Explorando gênero';
        presenceData.state = secondSegment.replace(/-/g, ' ');
      }
    }
  } catch (error) {
    console.error('Erro na Presence:', error);
    presenceData.details = 'Erro ao carregar';
  } finally {
    // Limpeza final dos dados
    if (!presenceData.buttons) delete presenceData.buttons;
    if (!presenceData.startTimestamp) delete presenceData.startTimestamp;
    if (!presenceData.endTimestamp) delete presenceData.endTimestamp;
    
    presence.setActivity(presenceData);
  }
});

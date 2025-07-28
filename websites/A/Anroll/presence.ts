import type { ActivityType } from 'premid';
import { Assets } from 'premid';

// --- Interfaces e Tipos ---
interface Presence {
  constructor(options: { clientId: string }): void;
  on(event: string, callback: (...args: unknown[]) => void): void;
  setActivity(data: PresenceData): void;
  clearActivity(): void;
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

interface VideoData {
  duration: number;
  currentTime: number;
  paused: boolean;
}

// --- Constantes e Estado Global ---
const presence = new Presence({ clientId: '1395970198405644350' });
const BrowseTimestamp = Math.floor(Date.now() / 1000);
let videoState: VideoData = { duration: 0, currentTime: 0, paused: true };
const imageCache = new Map<string, string>();

// --- Enum de Assets ---
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

// --- Dicionários de Dados ---
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

// --- Funções Auxiliares ---

/**
 * Obtém a imagem de capa da página atual, usando cache.
 */
async function getCoverImage(): Promise<string> {
  const currentUrl = window.location.href;
  if (imageCache.has(currentUrl)) {
    return imageCache.get(currentUrl)!;
  }

  try {
    const selectors = [
      () => document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content,
      () => document.querySelector<HTMLImageElement>('#anime_title img')?.src,
      () => {
        const bgElement = document.querySelector<HTMLElement>('.sc-kpOvIu.ixIKbI');
        if (!bgElement) return undefined;
        const bgStyle = getComputedStyle(bgElement);
        return bgStyle.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
      },
    ];

    for (const selector of selectors) {
      const imageUrl = selector();
      if (imageUrl) {
        imageCache.set(currentUrl, imageUrl);
        return imageUrl;
      }
    }
  } catch (error) {
    console.error('Erro ao obter imagem de capa:', error);
  }
  return ActivityAssets.Logo;
}

/**
 * Obtém o título do anime da página.
 */
function getAnimeTitle(): string {
  const selectors = ['article.animedetails h2', 'h1.anime-title', '.content h1', 'title'];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    let text = element?.textContent?.trim();
    if (text) {
      if (selector === 'title') {
        text = text.replace(/( - Assistir.*| - AnimesROLL)$/i, '');
      }
      return text;
    }
  }
  return 'Anime Desconhecido';
}

/**
 * Constrói os dados de Presence para páginas de vídeo (episódios/filmes).
 */
function buildVideoPresenceData(
  baseData: PresenceData,
  settings: { showTimestamps: boolean; hideWhenPaused: boolean }
): PresenceData {
  const data: PresenceData = { ...baseData };

  if (settings.hideWhenPaused && videoState.paused) {
    return { details: undefined };
  }

  data.smallImageKey = videoState.paused ? Assets.Pause : Assets.Play;
  data.smallImageText = videoState.paused ? 'Pausado' : 'Assistindo';

  if (settings.showTimestamps && !videoState.paused && videoState.duration > 0) {
    const [startTimestamp, endTimestamp] = presence.getTimestamps(
      Math.floor(videoState.currentTime),
      Math.floor(videoState.duration)
    );
    data.startTimestamp = startTimestamp;
    data.endTimestamp = endTimestamp;
  }

  return data;
}

// --- Lógica Principal de Atualização ---

presence.on('iFrameData', (data: unknown) => {
  if (data && typeof data === 'object' && 'duration' in data && 'currentTime' in data && 'paused' in data) {
    videoState = data as VideoData;
  }
});

presence.on('UpdateData', async () => {
  try {
    const [showButtons, privacyMode, showTimestamps, showCover, hideWhenPaused] = await Promise.all([
      presence.getSetting<boolean>('buttons'),
      presence.getSetting<boolean>('privacy'),
      presence.getSetting<boolean>('timestamps'),
      presence.getSetting<boolean>('cover'),
      presence.getSetting<boolean>('hideWhenPaused'),
    ]);

    const { pathname, href, hostname } = document.location;
    const pathArr = pathname.split('/').filter(Boolean);
    const [first = '', second = '', third = ''] = pathArr;

    const presenceData: PresenceData = {
      largeImageKey: showCover ? await getCoverImage() : ActivityAssets.Logo,
      startTimestamp: BrowseTimestamp,
    };

    if (privacyMode) {
      presenceData.details = 'Navegando...';
    } else {
      // Lógica de roteamento
      if (hostname === 'my.anroll.net') {
        const accountPages: Record<string, string> = {
          '': 'Minha Conta', '?p=config': 'Editando configurações', history: 'Visualizando histórico',
          '?p=gift': 'Visualizando presentes', favorites: 'Visualizando favoritos',
          subscription: 'Gerenciando assinatura VIP', login: 'Fazendo login',
          register: 'Criando conta', forgot: 'Recuperando senha', confirm: 'Confirmando conta',
        };
        presenceData.details = accountPages[first] || 'Gerenciando conta';
        presenceData.largeImageKey = ActivityAssets.Account;
        presenceData.state = 'Área de conta do usuário';
      } else if (pathArr.length === 2 && first === 'a') {
        presenceData.details = 'Vendo detalhes do anime';
        presenceData.state = getAnimeTitle();
        if (showButtons) presenceData.buttons = [{ label: 'Ver Anime', url: href }];
      } else if (pathArr.length === 2 && first === 'e') {
        const episodeData = buildVideoPresenceData({
          details: `Assistindo ${document.querySelector('#anime_title span')?.textContent?.trim() || 'Anime Desconhecido'}`,
          state: document.querySelector('#current_ep strong')?.textContent?.trim() || 'Episódio Desconhecido',
          buttons: showButtons ? [{ label: 'Assistir Episódio', url: href }] : undefined,
        }, { showTimestamps, hideWhenPaused });
        Object.assign(presenceData, episodeData);
      } else if (first === 'filmes' && second === 'assistir' && third) {
        const movieData = buildVideoPresenceData({
          details: `Assistindo filme: ${document.querySelector('h1.title')?.textContent?.trim() || 'Filme Desconhecido'}`,
          largeImageKey: ActivityAssets.Films,
          buttons: showButtons ? [{ label: 'Assistir Filme', url: href }] : undefined,
        }, { showTimestamps, hideWhenPaused });
        Object.assign(presenceData, movieData);
      } else if (pageDetails[first]) {
        const pageInfo = pageDetails[first];
        presenceData.details = pageInfo.title;
        if (pageInfo.image && (!showCover || privacyMode)) {
            presenceData.largeImageKey = pageInfo.image;
        }
      } else {
        const pageTitle = document.title.replace(/( - Anroll| - Assistir.*)/i, '');
        presenceData.details = `Explorando: ${pageTitle}`;
      }
    }

    // Limpeza final baseada nas configurações
    if (privacyMode) {
      delete presenceData.state;
      delete presenceData.buttons;
    }
    if (!showTimestamps) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
    }

    if (!presenceData.details) {
      presence.clearActivity();
    } else {
      presence.setActivity(presenceData);
    }
  } catch (error) {
    console.error('Erro na Presence:', error);
    presence.setActivity({ details: 'Erro ao carregar', largeImageKey: ActivityAssets.Logo });
  }
});

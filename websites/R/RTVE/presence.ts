import { Assets } from 'premid';

const presence = new Presence({
	clientId: '1457403769116561528',
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
	RTVE = 'https://i.imgur.com/0begwZJ.png',
	RTVE_PLAY = 'https://i.imgur.com/Ru8b2AX.png',
}

let _playback = false;
let _currentTime = 0;
let _duration = 0;
let _paused = true;

const presenceSettings = {
	buttons: true,
	showTimestamps: true,
	privacy: false,
	showCover: true,
	detailedInfo: true,
};

presence.on('iFrameData', (data: unknown) => {
	const iframeData = data as {
		iFrameVideoData?: {
			currTime: number;
			dur: number;
			paused: boolean;
		};
	};

	if (iframeData.iFrameVideoData) {
		_playback = true;
		_currentTime = iframeData.iFrameVideoData.currTime;
		_duration = iframeData.iFrameVideoData.dur;
		_paused = iframeData.iFrameVideoData.paused;
	}
});

function getPageTitle(): string {
	const path = document.location.pathname.toLowerCase();

	if (path.startsWith('/infantil/')) {
		const clanTitle = document.querySelector('h1')?.textContent?.trim();
		if (
			clanTitle &&
			!clanTitle.includes('Dibujos animados') &&
			clanTitle.length > 10
		) {
			return clanTitle;
		}
	}

	if (path.startsWith('/eltiempo/') || path === '/eltiempo') {
		const weatherTitle = document.querySelector('h3')?.textContent?.trim();
		if (weatherTitle && weatherTitle.length > 10) {
			return (
				weatherTitle.substring(0, 60) +
				(weatherTitle.length > 60 ? '...' : '')
			);
		}
	}

	if (
		path.includes('/receta-') ||
		path.includes('/cocina/') ||
		path.includes('/television/cocina/')
	) {
		const recipeTitle = document.querySelector('h1')?.textContent?.trim();
		if (recipeTitle && recipeTitle.length > 5) return recipeTitle;
	}

	if (path.includes('/play/audios/')) {
		const audioTitle = document
			.querySelector('[class*="title"]')
			?.textContent?.trim();
		if (audioTitle && audioTitle.length > 5) return audioTitle;
	}

	if (path.includes('/playz/') || path === '/playz') {
		const playzTitle = document.querySelector('h1')?.textContent?.trim();
		if (playzTitle && playzTitle !== 'Playz') return playzTitle;
	}

	const ogTitle = document
		.querySelector('meta[property="og:title"]')
		?.getAttribute('content');
	if (ogTitle) return ogTitle.replace('...', '').trim();

	const titleElement =
		document.querySelector('h1') || document.querySelector('.title');
	if (titleElement) {
		const titleText = titleElement.textContent?.trim() || '';
		if (titleText.length > 5) return titleText;
	}

	return document.title
		.replace(' - RTVE.es', '')
		.replace(' | RTVE', '')
		.replace(' - RTVE', '')
		.trim();
}

function getCategory(): string {
	const breadcrumb = document.querySelector(
		".breadcrumb, nav[aria-label='Ruta de navegación']"
	);
	if (breadcrumb) {
		const items = breadcrumb.querySelectorAll('li');
		return items[items.length - 1]?.textContent?.trim() || '';
	}
	return '';
}

function getProgramInfo(): {
	title: string;
	subtitle: string;
	description: string;
} {
	const title = document.querySelector('h1')?.textContent?.trim() || '';
	const subtitle =
		document.querySelector('h2, .subtitle, .program-info')?.textContent?.trim() ||
		'';
	const description =
		document
			.querySelector('meta[property="og:description"]')
			?.getAttribute('content') || '';

	return { title, subtitle, description };
}

function getSectionInfo(): {
	sectionName: string;
	defaultTitle: string;
} {
	const path = document.location.pathname.toLowerCase();

	if (path.startsWith('/infantil/')) {
		return {
			sectionName: 'Clan TV',
			defaultTitle: 'Series infantiles',
		};
	} else if (path.startsWith('/playz/') || path === '/playz') {
		return {
			sectionName: 'Playz',
			defaultTitle: 'Contenido joven',
		};
	} else if (path.startsWith('/eltiempo/') || path === '/eltiempo') {
		return {
			sectionName: 'El Tiempo',
			defaultTitle: 'Pronóstico meteorológico',
		};
	} else if (path.startsWith('/television/cocina/')) {
		return {
			sectionName: 'Cocina RTVE',
			defaultTitle: 'Recetas de cocina',
		};
	} else if (
		path.startsWith('/play/radio/') ||
		path.startsWith('/play/audios/')
	) {
		return {
			sectionName: 'RNE Audio',
			defaultTitle: 'Radio y podcasts',
		};
	} else if (path.startsWith('/play/')) {
		return {
			sectionName: 'RTVE Play',
			defaultTitle: 'Contenido en streaming',
		};
	} else {
		return {
			sectionName: 'RTVE.es',
			defaultTitle: 'Radiotelevisión Española',
		};
	}
}

function getLogoToUse(): ActivityAssets {
	const path = document.location.pathname.toLowerCase();

	if (
		path.startsWith('/play/') ||
		path === '/play' ||
		path.startsWith('/playz/') ||
		path === '/playz'
	) {
		return ActivityAssets.RTVE_PLAY;
	} else {
		return ActivityAssets.RTVE;
	}
}

async function getStrings() {
	return presence.getStrings({
		play: 'general.playing',
		pause: 'general.paused',
		browsing: 'general.browsing',
		watchingLive: 'general.watchingLive',
		watchingVideo: 'general.watchingVideo',
		listening: 'general.listeningMusic',
		searching: 'general.searchFor',
		watchVideo: 'general.buttonWatchVideo',
		watchLive: 'general.buttonWatchStream',
		viewSeries: 'general.buttonViewSeries',
		listen: 'general.buttonListen',
	});
}

presence.on('UpdateData', async () => {
	const [buttons, showTimestamps, privacy, showCover, detailedInfo] =
		await Promise.all([
			presence.getSetting<boolean>('buttons'),
			presence.getSetting<boolean>('time'),
			presence.getSetting<boolean>('privacy'),
			presence.getSetting<boolean>('cover'),
			presence.getSetting<boolean>('detailedInfo'),
		]);

	const presenceSettings = {
		buttons,
		showTimestamps,
		privacy,
		showCover,
		detailedInfo,
	};

	const strings = await getStrings();
	const { href, pathname } = document.location;
	const searchParams = new URLSearchParams(document.location.search);

	const sectionInfo = getSectionInfo();

	const presenceData: PresenceData = {
		largeImageKey: presenceSettings.showCover
			? getLogoToUse()
			: ActivityAssets.RTVE,
		startTimestamp: browsingTimestamp,
	};

	const video = document.querySelector('video');
	const audio = document.querySelector('audio');
	const isPlayingVideo = video && !Number.isNaN(video.duration);
	const isPlayingAudio = audio && !Number.isNaN(audio.duration);

	const pageTitle = getPageTitle();
	const category = getCategory();
	const programInfo = getProgramInfo();

	if (pathname.includes('/videos/directo/')) {
		if (privacy) {
			presenceData.details = strings.watchingLive;
		} else {
			presenceData.details = 'EN DIRECTO';
			presenceData.state = programInfo.title || pageTitle;
			if (programInfo.subtitle) {
				presenceData.state += ` - ${programInfo.subtitle}`;
			}
		}

		presenceData.smallImageKey = Assets.Live;
		presenceData.smallImageText = strings.watchingLive;
		presenceData.startTimestamp = browsingTimestamp;

		if (presenceSettings.buttons && !privacy) {
			presenceData.buttons = [
				{
					label: strings.watchLive,
					url: href,
				},
			];
		}
	} else if (isPlayingVideo && video) {
		if (privacy) {
			presenceData.details = strings.watchingVideo;
		} else {
			presenceData.details = sectionInfo.sectionName;
			presenceData.state =
				programInfo.title || pageTitle || sectionInfo.defaultTitle;

			if (programInfo.subtitle && presenceSettings.detailedInfo) {
				presenceData.state = `${presenceData.state} - ${programInfo.subtitle}`;
			}
		}

		presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
		presenceData.smallImageText = video.paused ? strings.pause : strings.play;

		if (presenceSettings.showTimestamps && !video.paused) {
			[presenceData.startTimestamp, presenceData.endTimestamp] =
				presence.getTimestamps(
					Math.floor(video.currentTime),
					Math.floor(video.duration)
				);
		}

		if (video.paused) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}

		if (presenceSettings.buttons && !privacy) {
			presenceData.buttons = [
				{
					label: video.paused ? strings.watchVideo : 'Reproduciendo',
					url: href,
				},
			];

			if (
				category.includes('Serie') ||
				programInfo.description.includes('serie')
			) {
				const seriesLink = document.querySelector(
					'a[href*="/series/"], a[href*="/programas/"]'
				);
				if (seriesLink) {
					presenceData.buttons.push({
						label: strings.viewSeries,
						url: seriesLink.getAttribute('href') || href,
					});
				}
			}
		}
	} else if (isPlayingAudio && audio) {
		if (privacy) {
			presenceData.details = strings.listening;
		} else {
			presenceData.details = sectionInfo.sectionName;
			presenceData.state =
				programInfo.title || pageTitle || sectionInfo.defaultTitle;
		}

		presenceData.smallImageKey = audio.paused ? Assets.Pause : Assets.Play;
		presenceData.smallImageText = audio.paused ? strings.pause : strings.play;

		if (presenceSettings.showTimestamps && !audio.paused) {
			[presenceData.startTimestamp, presenceData.endTimestamp] =
				presence.getTimestamps(
					Math.floor(audio.currentTime),
					Math.floor(audio.duration)
				);
		}

		if (audio.paused) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}

		if (presenceSettings.buttons && !privacy) {
			presenceData.buttons = [
				{
					label: audio.paused ? strings.listen : 'Escuchando',
					url: href,
				},
			];
		}
	} else if (pathname.includes('/buscar/')) {
		if (privacy) {
			presenceData.details = strings.searching;
		} else {
			presenceData.details = strings.searching;
			const searchTerm =
				searchParams.get('q') ||
				document.querySelector('input[type="search"]')?.getAttribute('value');
			presenceData.state = searchTerm || 'Contenido';
		}

		presenceData.smallImageKey = Assets.Search;
		presenceData.smallImageText = strings.searching;
		presenceData.startTimestamp = browsingTimestamp;
	} else {
		if (privacy) {
			presenceData.details = strings.browsing;
		} else {
			presenceData.details = sectionInfo.sectionName;

			if (pathname.includes('/series/') || pathname.includes('/programas/')) {
				presenceData.state = pageTitle || 'Catálogo';
				if (category && presenceSettings.detailedInfo) {
					presenceData.state += ` | ${category}`;
				}
			} else if (pathname.includes('/noticias/')) {
				presenceData.state = pageTitle || 'Noticias';
			} else if (pathname.includes('/infantil/juegos/')) {
				presenceData.state = 'Juegos para niños';
			} else if (pathname.includes('/infantil/series/')) {
				const seriesName =
					pathname.split('/').pop()?.replace(/-/g, ' ') || 'Series';
				presenceData.state =
					seriesName.charAt(0).toUpperCase() + seriesName.slice(1);
			} else {
				presenceData.state = pageTitle || sectionInfo.defaultTitle;
				if (
					category &&
					presenceSettings.detailedInfo &&
					category.length < 30
				) {
					presenceData.state += ` | ${category}`;
				}
			}

			if ((pathname.includes('/play/') || pathname === '/play') && !privacy) {
				const searchQuery = searchParams.get('q');
				if (searchQuery) {
					presenceData.details = `${strings.searching} en ${sectionInfo.sectionName}`;
					presenceData.state = searchQuery;
					presenceData.smallImageKey = Assets.Search;
				}
			}
		}

		if (!presenceData.smallImageKey) {
			presenceData.smallImageKey = Assets.Reading;
			presenceData.smallImageText = strings.browsing;
		}
		presenceData.startTimestamp = browsingTimestamp;

		if (presenceSettings.buttons && !privacy && pageTitle) {
			presenceData.buttons = [
				{
					label: `Visitar ${sectionInfo.sectionName}`,
					url: href,
				},
			];
		}
	}

	if (privacy) {
		delete presenceData.state;
		delete presenceData.buttons;
		delete presenceData.largeImageText;
	}

	if (!presenceSettings.showTimestamps) {
		delete presenceData.startTimestamp;
		delete presenceData.endTimestamp;
	}

	if (presenceData.details) {
		presence.setActivity(presenceData);
	} else {
		presence.setActivity();
	}
});
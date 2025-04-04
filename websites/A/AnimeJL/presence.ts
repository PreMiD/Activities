import { ActivityType, Assets } from 'premid';

const presence = new Presence({
    clientId: '634081860972052490',
});

let video = {
    duration: 0,
    currentTime: 0,
    paused: true,
};

let cachedGif: string | null = null; // Cache para evitar múltiples llamadas a Giphy

const ActivityAssets = {
    DefaultLogo: 'https://github.com/OscarHDYT/img/blob/main/favicon.png?raw=true',
    CatalogImageFallback: 'https://www.anime-jl.net/storage/animes_tumbl/default-cover.jpg',
};

// Función para obtener un GIF basado en el título del episodio
async function fetchGif(animeTitle: string): Promise<string> {
    const apiKey = 'Xku5Q4lnHQQ0KI0PJG679v2BzQahVn5W';
    const query = encodeURIComponent(animeTitle.split(' ').slice(0, 3).join(' '));
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Resultados de Giphy:', data);
        return data.data[0]?.images?.original?.url || ActivityAssets.DefaultLogo;
    } catch (error) {
        console.error('Error al buscar GIF:', error);
        return ActivityAssets.DefaultLogo;
    }
}

presence.on('iFrameData', (data: unknown) => {
    video = data as typeof video;
});

presence.on('UpdateData', async () => {
    const presenceData: PresenceData = {
        type: ActivityType.Watching,
    };

    const { pathname } = document.location;

    if (video && !Number.isNaN(video.duration) && pathname.includes('/anime/')) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
            Math.floor(video.currentTime),
            Math.floor(video.duration),
        );

        const episodeMatch = pathname.match(/\/anime\/(.+)-(\d+)$/);
        const isEpisodePage = episodeMatch !== null;
        const animeTitle = document.querySelector('h1.Title')?.textContent?.trim() || 'Anime desconocido';

        let imageUrl = ActivityAssets.DefaultLogo;
        let detailsText = animeTitle;
        let stateText = '';

        if (isEpisodePage) {
            const episodeNumber = episodeMatch[2];

            const episodeImgElement = document.querySelector<HTMLImageElement>('img[title*="Episodio"]');
            if (episodeImgElement) {
                imageUrl = episodeImgElement.getAttribute('src') || ActivityAssets.DefaultLogo;
            }

            if (!cachedGif) {
                cachedGif = await fetchGif(`${animeTitle} Episodio ${episodeNumber}`);
            }
            imageUrl = cachedGif || imageUrl;

            const titleParts = animeTitle.split(' ');
            detailsText = titleParts.slice(0, -2).join(' ') || animeTitle; // Quita "Episodio X"
            stateText = `Episodio ${episodeNumber}`;

            presenceData.buttons = [
                {
                    label: 'Ver capítulo',
                    url: window.location.href,
                },
                {
                    label: 'Ir a Anime-JL',
                    url: 'https://www.anime-jl.net/',
                },
            ];
        } else {
            const catalogImageElement = document.querySelector<HTMLImageElement>('img[itemprop="image"]');
            if (catalogImageElement) {
                imageUrl = catalogImageElement.getAttribute('src') ?? ActivityAssets.CatalogImageFallback;
            }

            presenceData.buttons = [
                {
                    label: 'Ir al catálogo',
                    url: window.location.href,
                },
                {
                    label: 'Ir a Anime-JL',
                    url: 'https://www.anime-jl.net/',
                },
            ];
        }

        console.log(`Imagen seleccionada: ${imageUrl}`);

        presenceData.largeImageKey = imageUrl;
        presenceData.details = detailsText;
        presenceData.state = stateText;
        presenceData.smallImageKey = video.paused ? Assets.Pause : Assets.Play;
        presenceData.smallImageText = video.paused ? 'En pausa' : 'Viendo';

        if (video.paused) {
            delete presenceData.startTimestamp;
            delete presenceData.endTimestamp;
        }

        presence.setActivity(presenceData, !video.paused);
    } else {
        presenceData.largeImageKey = ActivityAssets.DefaultLogo;
        presenceData.details = 'Explorando Anime-JL';
        presenceData.state = 'Navegando por la web';
        presenceData.smallImageKey = Assets.Search;
        presenceData.smallImageText = 'Explorando Anime-JL';
        presenceData.buttons = [
            {
                label: 'Ir a Anime-JL',
                url: 'https://www.anime-jl.net/',
            },
        ];

        presence.setActivity(presenceData);
    }
});
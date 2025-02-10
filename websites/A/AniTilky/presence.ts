/// <reference types="premid" />

export const presence = new Presence({
		clientId: "1124065204200820786",
	}),
	time = Math.floor(Date.now() / 1000),
	path = document.location.pathname,
	videoData = {
		current: 0,
		duration: 0,
		paused: true,
		isLive: false,
	},
	baseUrl = "https://anitilky.xyz",
	apiUrl = "https://backend.anitilky.xyz/api"; // API versiyonu eklendi

interface AnimeResponse {
	title: {
		romaji: string;
		english: string;
		native: string;
	};
	source: {
		name: string;
		id: string;
	};
	_id: string;
	description: string;
	coverImage: string;
	bannerImage: string;
	type: string;
	status: string;
	releaseDate: string;
	endDate: string;
	rating: number;
	genres: string[];
	seasons: Array<{
		seasonNumber: number;
		title: string;
		episodes: Array<{
			episodeNumber: number;
			title: string;
		}>;
	}>;
}

interface UserResponse {
	success: boolean;
	data: {
		username: string;
		avatar: string;
		bio: string;
	};
}

// Client API'den anime bilgilerini çekmek için fonksiyon
async function getAnimeInfo(animeId: string): Promise<AnimeResponse | null> {
	try {
		const response = await fetch(`${apiUrl}/anime/${animeId}`);
		if (!response.ok) throw new Error("Anime bilgisi alınamadı");
		const data: AnimeResponse = await response.json();
		if (!data) return null;
		return data;
	} catch (error) {
		console.error("Anime bilgisi alınamadı:", error);
		return null;
	}
}

// Kullanıcı bilgilerini çekmek için fonksiyon
async function getUserInfo(username: string): Promise<UserResponse["data"] | null> {
	try {
		const response = await fetch(`${apiUrl}/user/profile/${username}`);
		if (!response.ok) throw new Error("Kullanıcı bilgisi alınamadı");
		const data: UserResponse = await response.json();
		if (!data.success || !data.data) return null;
		return {
			...data.data,
			avatar: data.data.avatar || "logo",
		};
	} catch (error) {
		console.error("Kullanıcı bilgisi alınamadı:", error);
		return null;
	}
}

presence.on(
	"iFrameData",
	async (data: {
		current: number;
		duration: number;
		paused: boolean;
		isLive: boolean;
	}) => {
		if (!data) return;
		Object.assign(videoData, data);
	}
);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "logo",
	};

	// Ana sayfa kontrolü
	if (path === "/") {
		presenceData.details = "Ana sayfaya göz atıyor";
		presenceData.startTimestamp = time;
	} else if (path === "/profile") {
		// Kendi profil sayfası kontrolü
		const username = document.querySelector(".profile-username")?.textContent?.trim();
		if (username) {
			const userInfo = await getUserInfo(username);
			presenceData.details = "Kendi profiline bakıyor";
			presenceData.state = userInfo?.username || username;
			presenceData.largeImageKey = userInfo?.avatar;
		} else {
			presenceData.details = "Profiline bakıyor";
		}
		presenceData.startTimestamp = time;
	} else if (path.startsWith("/u/")) {
		// Başka kullanıcı profili kontrolü
		const username = path.split("/").pop() || "";
		const userInfo = await getUserInfo(username);

		presenceData.details = "Kullanıcı profiline bakıyor";
		presenceData.state = userInfo?.username || username;
		presenceData.largeImageKey = userInfo?.avatar;
		presenceData.startTimestamp = time;

		presenceData.buttons = [
			{
				label: "Profile Bak",
				url: `${baseUrl}/u/${username}`,
			},
		];
	} else if (/^\/anime\/([0-9a-f]{24})$/.test(path)) {
		// Anime detay sayfası kontrolü
		const animeId = path.split("/").pop();
		const animeInfo = await getAnimeInfo(animeId);

		presenceData.details = "Anime detayına bakıyor";
		presenceData.state = animeInfo?.title.romaji || animeInfo?.title.english || animeInfo?.title.native || "Yükleniyor...";
		presenceData.largeImageKey = animeInfo?.coverImage || "logo";
		if (animeInfo) {
			presenceData.smallImageText = `${animeInfo.type || "TV"} • ${animeInfo.status || "Devam Ediyor"}`;
		}
		presenceData.startTimestamp = time;

		presenceData.buttons = [
			{
				label: "Anime Sayfasına Git",
				url: `${baseUrl}${path}`,
			},
		];
	} else if (/^\/watch\/([0-9a-f]{24})$/.test(path)) {
		// Anime izleme sayfası kontrolü
		const animeId = path.split("/").pop();
		const urlParams = new URLSearchParams(window.location.search);
		const season = urlParams.get("season") || "1";
		const episode = urlParams.get("episode") || "1";
		const animeInfo = await getAnimeInfo(animeId);

		presenceData.details = animeInfo?.title.romaji || animeInfo?.title.english || animeInfo?.title.native || "Yükleniyor...";
		presenceData.state = `Sezon ${season} Bölüm ${episode}`;
		presenceData.largeImageKey = animeInfo?.coverImage || "logo";
		if (animeInfo) {
			presenceData.smallImageText = `${animeInfo.type || "TV"} • ${animeInfo.status || "Devam Ediyor"}`;
		}

		if (typeof videoData.paused === "boolean") {
			presenceData.smallImageKey = videoData.paused ? "pause" : "play";
			presenceData.smallImageText = videoData.paused
				? "Duraklatıldı"
				: "Oynatılıyor";

			if (!videoData.paused && videoData.duration > 0) {
				[presenceData.startTimestamp, presenceData.endTimestamp] =
					presence.getTimestamps(
						Math.floor(videoData.current),
						Math.floor(videoData.duration)
					);
			}
		}

		presenceData.buttons = [
			{
				label: "Anime Sayfasına Git",
				url: `${baseUrl}/anime/${animeId}`,
			},
			{
				label: "Bölüme Git",
				url: `${baseUrl}${path}?season=${season}&episode=${episode}`,
			},
		];
	} else if (path.includes("/anime")) {
		// Anime liste sayfası kontrolü
		presenceData.details = "Anime listesine göz atıyor";
		presenceData.startTimestamp = time;
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

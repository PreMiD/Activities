interface Assets {
	logo: string;
	play: string;
	pause: string;
	browse: string;
}

interface SetDataParams {
	data: PresenceData;
	assets: Assets;
	noStartTime?: boolean;
}

type DefaultToReplace = {
	input: "%episode%" | "%title%" | "%episodeTitle%";
	with: "episode" | "title" | "episodeTitle";
}[];

type StringEntry = "details" | "state";

interface Pages {
	[key: string]: {
		setPresenceData?: () => void;
		presenceData?: PresenceData;
		disabled?: boolean;
		presenceSettings?: {
			[key in keyof PresenceData]: {
				condition: {
					ifTrue?: boolean;
					setTo: string;
					replace?: {
						toReplace: DefaultToReplace;
					};
					ifNot?: {
						setTo: string;
						replace?: {
							toReplace: DefaultToReplace;
						};
					};
				};
			};
		};
	};
}

class Watcha extends Presence {
	defaultToReplace?: DefaultToReplace;
	startedAt: number;
	data?: PresenceData;
	meta?: Record<string, string>;

	constructor(options: PresenceOptions) {
		super(options);

		this.startedAt = Math.floor(Date.now() / 1000);

		this.meta = {};
		this.defaultToReplace = [
			{
				input: "%episode%",
				with: "episode",
			},
			{
				input: "%episodeTitle%",
				with: "episodeTitle",
			},
			{
				input: "%title%",
				with: "title",
			},
		];
	}

	async getAssets(): Promise<Assets> {
		const setting = await this.getSetting<number>("logo"),
			images: Record<string, string> = {
				"logo-0": "logo",
				"play-0": "play",
				"pause-0": "pause",
				"brwose-0": "browse",
				"logo-1": "logo-red",
				"play-1": "play-red",
				"pause-1": "pause-red",
				"brwose-1": "browse-red",
			};

		return {
			play: images[`play-${setting}`],
			pause: images[`pause-${setting}`],
			browse: images[`brwose-${setting}`],
			logo: images[`logo-${setting}`],
		};
	}

	async setData(params: SetDataParams) {
		params.data.largeImageKey ??= params.Assets.logo;
		params.data.smallImageKey ??= params.Assets.browse;

		if (!params.noStartTime) params.data.startTimestamp = this.startedAt;

		this.data = params.data;
	}

	async getShortURL(url: string) {
		if (!url || url.length < 256) return url;
		if (this.meta[url]) return this.meta[url];
		try {
			const pdURL = await (
				await fetch(`https://pd.premid.app/create/${url}`)
			).text();
			this.meta[url] = pdURL;
			return pdURL;
		} catch (err) {
			this.error(err);
			return url;
		}
	}
}

const app = new Watcha({
	clientId: "905720213004222504",
});

enum Assets {
	Play = "https://i.imgur.com/q57RJjs.png",
	Pause = "https://i.imgur.com/mcEXiZk.png",
	Stop = "https://i.imgur.com/aLYu3Af.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Question = "https://i.imgur.com/pIIJniP.png",
	Live = "https://i.imgur.com/0HVm46z.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Writing = "https://i.imgur.com/Pa00qZh.png",
	Call = "https://i.imgur.com/y4YKRZG.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/qkODaWg.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

app.on("UpdateData", async () => {
	app.data = {};

	const [cover, search, seriesDetail, movieDetail, seriesState, movieState] =
			await Promise.all([
				app.getSetting<boolean>("cover"),
				app.getSetting<boolean>("search"),
				app.getSetting<string>("seriesDetail"),
				app.getSetting<string>("movieDetail"),
				app.getSetting<string>("seriesState"),
				app.getSetting<string>("movieState"),
			]),
		assets = await app.getAssets(),
		pages: Pages = {
			"/home": {
				presenceData: {
					details: "브라우징...",
				},
			},
			"/(watchings|watched|ratings)": {
				presenceData: {
					details: "목록 보는 중",
				},
			},
			"/settings": {
				presenceData: {
					details: "설정 보는 중",
				},
			},
			"/wishes": {
				presenceData: {
					details: "위시리스트 보기",
				},
			},
			"/notices": {
				presenceData: {
					details: "알림 보는 중",
				},
			},
			"/manage_profile": {
				presenceData: {
					details: "프로필 관리",
				},
			},
			"/referer": {
				presenceData: {
					details: "참조 링크 가져오기",
				},
			},
			"/explore": {
				presenceData: {
					details: "검색 장르:",
					state: document.querySelector("div.css-bdaabp")?.textContent,
				},
			},
			"/evaluate": {
				presenceData: {
					details: "권장 사항 가져오기",
				},
			},
			"/arrivals/latest": {
				presenceData: {
					details: "최신 도착물 보는 중",
				},
			},
			"/staffmades/": {
				setPresenceData: () => {
					const title = document.querySelector("h3.css-ae1cor")?.textContent;

					if (title) {
						app.setData({
							data: {
								details: "보기:",
								state: title,
							},
							assets,
						});
					}
				},
			},
			"/people/": {
				setPresenceData: () => {
					const name = document.querySelector("h3.css-ae1cor")?.textContent;

					if (name) {
						app.setData({
							data: {
								details: `${name}의 작품 탐색`,
							},
							assets,
						});
					}
				},
			},
			"/search": {
				disabled: !search,
				presenceData: {
					details: "검색 중:",
					state: decodeURI(new URLSearchParams(location.search).get("q")),
				},
			},
			"/parties": {
				presenceData: {
					details: "왓챠파티 탐색",
				},
			},
			"/watch/": {
				setPresenceData: () => {
					const video = document.querySelector("video");

					if (video) {
						const episodeTitle = document.querySelector("h3")?.textContent;

						[app.meta.title, app.meta.episode] =
							document
								.querySelector("h1")
								?.textContent?.match(/(.*):(.*)/)
								?.slice(1) ?? [];

						app.meta.coverUrl = document.querySelector<HTMLMetaElement>(
							'[property="og:image"]'
						).content;

						if (episodeTitle) app.meta.episodeTitle = `"${episodeTitle}"`;
						else delete app.meta.episodeTitle;

						const data: PresenceData = {
							smallImageKey: video.paused ? Assets.pause : Assets.play,
							endTimestamp: app.getTimestampsfromMedia(video).pop(),
						};

						if (video.paused) delete data.endTimestamp;

						app.setData({
							data,
							assets,
							noStartTime: true,
						});
					}
				},
				presenceSettings: {
					largeImageKey: {
						condition: {
							ifTrue: !!app.meta.coverUrl && cover,
							setTo: app.meta.coverUrl,
						},
					},
					details: {
						condition: {
							ifTrue: !!app.meta.episode,
							setTo: seriesDetail,
							replace: {
								toReplace: app.defaultToReplace,
							},
							ifNot: {
								setTo: movieDetail,
								replace: {
									toReplace: [
										{
											input: "%title%",
											with: "title",
										},
									],
								},
							},
						},
					},
					state: {
						condition: {
							ifTrue: !!app.meta.episode,
							setTo: seriesState,
							replace: {
								toReplace: app.defaultToReplace,
							},
							ifNot: {
								setTo: movieState,
								replace: {
									toReplace: [
										{
											input: "%title%",
											with: "title",
										},
									],
								},
							},
						},
					},
				},
			},
		};

	for (const [path, data] of Object.entries(pages)) {
		if (document.location.pathname.match(path) && !data.disabled) {
			if (data.presenceData) app.setData({ data: data.presenceData, assets });
			else if (data.setPresenceData) data.setPresenceData();

			if (data.presenceSettings) {
				for (const [key, settings] of Object.entries(data.presenceSettings)) {
					for (const condition of Object.values(settings)) {
						if (condition.ifTrue) {
							app.data[key as StringEntry] = condition.setTo;

							if (condition.replace) {
								for (const replace of condition.replace.toReplace) {
									app.data[key as StringEntry] = app.data[key as StringEntry]
										.replace(replace.input, app.meta[replace.with] ?? "")
										.trim();
								}
							}
						} else if (condition.ifNot) {
							app.data[key as StringEntry] = condition.ifNot.setTo;

							if (condition.ifNot.replace) {
								for (const replace of condition.ifNot.replace.toReplace) {
									app.data[key as StringEntry] = app.data[key as StringEntry]
										.replace(replace.input, app.meta[replace.with] ?? "")
										.trim();
								}
							}
						}
					}
				}
			}
		}
	}

	if (app.data.largeImageKey?.startsWith("http"))
		app.data.largeImageKey = await app.getShortURL(app.data.largeImageKey);

	if (app.data.details) app.setActivity(app.data);
	else app.setActivity();
});

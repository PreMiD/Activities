import {
	clearMetadata,
	fetchMetadata,
	metadata,
} from "./functions/fetchMetadata";
import {
	clearLiveMetadata,
	fetchLiveMetadata,
	liveMetadata,
} from "./functions/fetchLiveMetadata";

const presence = new Presence({
		clientId: "1325519017527476316",
	}),
	getStrings = async () => {
		return presence.getStrings(
			{
				play: "general.playing",
				pause: "general.paused",
				browse: "general.browsing",
				watchingMovie: "general.watchingMovie",
				watchingSeries: "general.watchingSeries",
				watchingLive: "general.watchingLive",
				viewSeries: "general.buttonViewSeries",
				viewMovies: "general.buttonViewMovie",
				watchEpisode: "general.buttonViewEpisode",
				watchMovie: "general.buttonWatchMovie",
				watchStream: "general.buttonWatchStream",
				seriesDisplayFull: "u-next.seriesDisplay.full",
				seriesDisplayShort: "u-next.seriesDisplay.short",
				movieDisplay: "u-next.movieDisplay",
				liveDisplay: "u-next.liveDisplay",
			},
			await presence.getSetting<string>("lang").catch(() => "en")
		);
	};
let oldLang: string = null,
	strings: Awaited<ReturnType<typeof getStrings>>;

presence.on("UpdateData", async () => {
	const [
		lang,
		usePresenceName,
		showTimestamp,
		showBrowsingStatus,
		showCover,
		showSeries,
		showMovies,
		showSmallImages,
		privacyMode,
	] = await Promise.all([
		presence.getSetting<string>("lang").catch(() => "en"),
		presence.getSetting<boolean>("usePresenceName"),
		presence.getSetting<boolean>("timestamp"),
		presence.getSetting<boolean>("showBrowsingStatus"),
		presence.getSetting<boolean>("showCover"),
		presence.getSetting<boolean>("showSeries"),
		presence.getSetting<boolean>("showMovies"),
		presence.getSetting<boolean>("showSmallImages"),
		presence.getSetting<boolean>("privacy"),
	]);

	if (oldLang !== lang) {
		oldLang = lang;
		strings = await getStrings();
	}

	const path = document.location.href,
		//* Match /title/sid and get sid (When you load the page / reload while browsing)
		browsingMediaId =
			path.match(/\/title\/(\w+)/) ??
			//* ?td=td when normally browsing and clicking on smth
			path.match(/td=(\w+)/);

	if (browsingMediaId) {
		if (privacyMode) return presence.clearActivity();

		await fetchMetadata(browsingMediaId[1]);

		return await presence.setActivity({
			details: metadata.data.webfrontTitleStage.titleName,
			state: metadata.data.webfrontTitleStage.attractions.slice(0, 128),
			largeImageKey: !showCover
				? "https://i.imgur.com/tuSR9Ef.png"
				: `https://${metadata.data.webfrontTitleStage.thumbnail.standard}`,
			...(showSmallImages && {
				smallImageKey: Assets.Reading,
			}),
			smallImageText: strings.browse,
			buttons: [
				{
					label: metadata.data.webfrontTitleStage.keyEpisodes.current
						.existsRelatedEpisode
						? strings.viewMovies
						: strings.viewSeries,
					url: document.location.href,
				},
			],
		});
	}

	//* Match /play/sid/ed and get ed
	const watchingMediaId = path.match(/\/play\/(\w+)\/(\w+)/);
	if (watchingMediaId) {
		await fetchMetadata(watchingMediaId[1]);
		const video = document.querySelector("video");

		if (!video) return;

		const { paused } = video,
			[startTimestamp, endTimestamp] = presence.getTimestampsfromMedia(video);

		if (
			metadata.data.webfrontTitleStage.keyEpisodes.current
				.existsRelatedEpisode &&
			showSeries
		) {
			if (privacyMode) {
				return await presence.setActivity({
					type: ActivityType.Watching,
					details: strings.watchingSeries,
					largeImageKey: "https://i.imgur.com/tuSR9Ef.png",
				});
			}

			const episode = metadata.data.webfrontTitleTitleEpisodes.episodes.find(
				e => !e.completeFlag
			);

			return await presence.setActivity({
				type: ActivityType.Watching,
				details: metadata.data.webfrontTitleStage.titleName,
				state: strings.seriesDisplayShort
					.replace("{0}", episode.displayNo)
					.replace("{1}", episode.episodeName),
				largeImageKey: !showCover
					? "https://i.imgur.com/tuSR9Ef.png"
					: `https://${metadata.data.webfrontTitleStage.thumbnail.standard}`,
				...(showSmallImages && {
					smallImageKey: paused ? Assets.Pause : Assets.Play,
				}),
				smallImageText: paused ? strings.pause : strings.play,
				...(showTimestamp &&
					!paused && {
						startTimestamp,
						endTimestamp,
					}),
				...(usePresenceName && {
					name: metadata.data.webfrontTitleStage.titleName,
					details: episode.episodeName,
					state: strings.seriesDisplayFull.replace("{0}", episode.displayNo),
				}),
				buttons: [
					{
						label: strings.watchEpisode,
						url: document.location.href.split("?")[0],
					},
					{
						label: strings.viewSeries,
						url: `https://video.unext.jp/?td=${metadata.data.webfrontTitleStage.id}`,
					},
				],
			});
		}

		if (
			!metadata.data.webfrontTitleStage.keyEpisodes.current
				.existsRelatedEpisode &&
			showMovies
		) {
			if (privacyMode) {
				return await presence.setActivity({
					type: ActivityType.Watching,
					details: strings.watchingMovie,
					largeImageKey: "https://i.imgur.com/tuSR9Ef.png",
				});
			}

			return await presence.setActivity({
				type: ActivityType.Watching,
				details: metadata.data.webfrontTitleStage.titleName,
				state: strings.movieDisplay
					.replace("{0}", metadata.data.webfrontTitleStage.productionYear)
					.replace(
						"{1}",
						Math.floor(
							metadata.data.webfrontTitleStage.keyEpisodes.current.duration / 60
						).toString()
					),
				largeImageKey: !showCover
					? "https://i.imgur.com/tuSR9Ef.png"
					: `https://${metadata.data.webfrontTitleStage.thumbnail.standard}`,
				...(showSmallImages && {
					smallImageKey: paused ? Assets.Pause : Assets.Play,
				}),
				smallImageText: paused ? strings.pause : strings.play,
				...(showTimestamp &&
					!paused && {
						startTimestamp,
						endTimestamp,
					}),
				...(usePresenceName && {
					name: metadata.data.webfrontTitleStage.titleName,
				}),
				buttons: [
					{
						label: strings.watchMovie,
						url: document.location.href.split("?")[0],
					},
				],
			});
		}

		//* show Series & Movies disabled, clearactivity, nothing to show?
		return presence.clearActivity();
	}

	//* Reset because no data can be fetched
	clearMetadata();

	//* Match /livedetail/liv and get liv (When you load the page / reload while browsing)
	const browsingLiveId =
		path.match(/\/livedetail\/(\w+)/) ??
		//* ?lc=lc when normally browsing and clicking on smth
		path.match(/lc=(\w+)/);

	if (browsingLiveId) {
		if (privacyMode) return presence.clearActivity();

		await fetchLiveMetadata(browsingLiveId[1]);

		return await presence.setActivity({
			details: liveMetadata.data.webfrontGetLive.name,
			state: liveMetadata.data.webfrontGetLive.attractions.slice(0, 128),
			largeImageKey: !showCover
				? "https://i.imgur.com/tuSR9Ef.png"
				: `https://${liveMetadata.data.webfrontGetLive.notices[0].thumbnail.standard}`,
			...(showSmallImages && {
				smallImageKey: Assets.Reading,
			}),
			smallImageText: strings.browse,
			buttons: [
				{
					label: strings.watchStream,
					url: document.location.href,
				},
			],
		});
	}

	//* Match /live/liv and get liv
	const watchingLiveId = path.match(/\/live\/(\w+)/);
	if (watchingLiveId) {
		await fetchLiveMetadata(watchingLiveId[1]);
		const video = document.querySelector("video");

		if (!video) return;

		const { paused } = video,
			[startTimestamp, endTimestamp] = presence.getTimestampsfromMedia(video);

		if (privacyMode) {
			return await presence.setActivity({
				type: ActivityType.Watching,
				details: strings.watchingLive,
				largeImageKey: "https://i.imgur.com/tuSR9Ef.png",
			});
		}

		return await presence.setActivity({
			type: ActivityType.Watching,
			details: liveMetadata.data.webfrontGetLive.name,
			state: strings.liveDisplay
				.replace(
					"{0}",
					new Date(liveMetadata.data.webfrontGetLive.deliveryStartDateTime)
						.getFullYear()
						.toString()
				)
				.replace(
					"{1}",
					Math.floor(
						(new Date(
							liveMetadata.data.webfrontGetLive.deliveryEndDateTime
						).getTime() -
							new Date(
								liveMetadata.data.webfrontGetLive.deliveryStartDateTime
							).getTime()) /
							1000 /
							60
					).toString()
				),
			largeImageKey: !showCover
				? "https://i.imgur.com/tuSR9Ef.png"
				: `https://${liveMetadata.data.webfrontGetLive.notices[0].thumbnail.standard}`,
			...(showSmallImages && {
				smallImageKey: paused ? Assets.Pause : Assets.Play,
			}),
			smallImageText: paused ? strings.pause : strings.play,
			...(showTimestamp &&
				!paused && {
					startTimestamp,
					endTimestamp,
				}),
			...(usePresenceName && {
				name: liveMetadata.data.webfrontGetLive.name,
			}),
			buttons: [
				{
					label: strings.watchStream,
					url: document.location.href.split("?")[0],
				},
			],
		});
	}

	//* Reset because no data can be fetched
	clearLiveMetadata();

	if (showBrowsingStatus && !privacyMode) {
		return await presence.setActivity({
			details: strings.browse,
			largeImageKey: "https://i.imgur.com/tuSR9Ef.png",
			smallImageKey: Assets.Reading,
			smallImageText: strings.browse,
		});
	}
	return presence.clearActivity();
});

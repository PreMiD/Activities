import type { MovieDetails, TvDetails } from "./api.js";
import { ActivityType, Assets, getTimestampsFromMedia } from "premid";
import { CinebyApi } from "./api.js";

const presence = new Presence({
  clientId: "1325115346696273993"
});

const LOGO_URL =
  "https://cdn.rcd.gg/PreMiD/websites/C/Cineby/assets/logo.png";
const BASE_URL = "https://cineby.gd";
const TMDB_IMG = "https://image.tmdb.org/t/p/original";
const browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  const [
    showBrowsing,
    useActivityName,
    showCover,
    showPlaybackTimer,
    showEpisodeInfo,
    showWatchEpisodeButton,
    showWatchOnCinebyButton
  ] = await Promise.all([
    presence.getSetting<boolean>("showBrowsing"),
    presence.getSetting<boolean>("useActivityName"),
    presence.getSetting<boolean>("showCover"),
    presence.getSetting<boolean>("showPlaybackTimer"),
    presence.getSetting<boolean>("showEpisodeInfo"),
    presence.getSetting<boolean>("showWatchEpisodeButton"),
    presence.getSetting<boolean>("showWatchOnCinebyButton")
  ]);

  const { pathname } = document.location;
  const segments = pathname.split("/").filter(Boolean);
  const type = segments[0];
  const contentId = segments[1];
  const seasonNum = segments[2];
  const episodeNum = segments[3];

  const presenceData: PresenceData = {
    largeImageKey: LOGO_URL,
    details: "Browsing",
    type: ActivityType.Watching,
    startTimestamp: browsingTimestamp
  };

  if (type === "movie" && contentId) {
    try {
      const data = await CinebyApi.getCurrent<MovieDetails>(pathname);
      const title = data.title ?? "Movie";
      const posterPath = data.poster_path;
      const year = data.release_date?.split("-").shift();
      const runtime = data.runtime;

      if (useActivityName) {
        presenceData.name = title;
        presenceData.details = title;
      }
      const stateStr = [year, runtime != null ? `${runtime} min` : null]
        .filter(Boolean)
        .join(" • ");
      if (stateStr) presenceData.state = stateStr;
      if (showCover && posterPath) {
        presenceData.largeImageKey = `${TMDB_IMG}${posterPath}`;
      }
    } catch {
      presenceData.details = "Browsing";
    }
  } else if (type === "tv" && contentId) {
    try {
      const data = await CinebyApi.getCurrent<TvDetails>(pathname);
      const title = data.name ?? "TV Show";
      const seasonPoster = data.season_poster;
      const episodeTitle = data.episode_title;
      const seasonNumber = data.season_number;
      const episodeNumber = data.episode_number;

      if (useActivityName) {
        presenceData.name = title;
      }
      presenceData.details = useActivityName ? episodeTitle ?? title : title;
      if (showEpisodeInfo && seasonNumber != null && episodeNumber != null) {
        presenceData.state = `Season ${seasonNumber}, Episode ${episodeNumber}`;
        presenceData.largeImageText = `Season ${seasonNumber}, Episode ${episodeNumber}`;
      } else if (episodeTitle && !useActivityName && seasonNumber != null && episodeNumber != null) {
        presenceData.state = `S${seasonNumber}:E${episodeNumber} ${episodeTitle}`;
      }
      if (showCover && seasonPoster) {
        presenceData.largeImageKey = `${TMDB_IMG}${seasonPoster}`;
      }
    } catch {
      presenceData.details = "Browsing";
    }
  } else if (type === "anime" && contentId) {
    try {
      const { details } = await CinebyApi.getCurrentAnime(pathname);
      const { title, thumbnail, episodes } = details;
      const epNum =
        Number.parseInt(episodeNum ?? pathname.split("/").pop() ?? "0", 10) ||
        1;
      const current = episodes.find((e) => e.episode === epNum);
      const episodeTitle = current?.title?.replace(/E\d+:\s*/i, "").trim();

      if (useActivityName) {
        presenceData.name = title;
      }
      presenceData.details = useActivityName ? episodeTitle ?? title : title;
      presenceData.state = `Episode ${epNum}`;
      if (showCover && thumbnail) {
        presenceData.largeImageKey = thumbnail;
      }
    } catch {
      presenceData.details = "Browsing";
    }
  } else {
    if (!showBrowsing) {
      presence.clearActivity();
      return;
    }
  }

  const video = document.querySelector("video");
  if (video) {
    if (video.paused) {
      presenceData.smallImageKey = Assets.Pause;
      presenceData.smallImageText = "Paused";
      delete presenceData.startTimestamp;
      delete presenceData.endTimestamp;
    } else if (showPlaybackTimer) {
      const [start, end] = getTimestampsFromMedia(video);
      presenceData.startTimestamp = start;
      presenceData.endTimestamp = end;
    }
  }

  const buttons: { label: string; url: string }[] = [];
  if (showWatchEpisodeButton && type && contentId) {
    if (type === "movie") {
      buttons.push({ label: "Watch Movie", url: `${BASE_URL}/movie/${contentId}` });
    } else if (type === "tv") {
      const episodeUrl =
        seasonNum && episodeNum
          ? `${BASE_URL}/tv/${contentId}/${seasonNum}/${episodeNum}`
          : `${BASE_URL}/tv/${contentId}`;
      buttons.push({ label: "Watch Episode", url: episodeUrl });
    } else if (type === "anime") {
      buttons.push({ label: "Watch Episode", url: `${BASE_URL}${pathname}` });
    }
  }
  if (showWatchOnCinebyButton) {
    buttons.push({ label: "Watch on Cineby", url: BASE_URL });
  }
  if (buttons.length > 0) {
    presenceData.buttons = buttons.slice(0, 2) as NonNullable<
      PresenceData["buttons"]
    >;
  }

  presence.setActivity(presenceData);
});

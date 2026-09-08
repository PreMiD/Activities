import { ActivityType, Assets, getTimestamps } from "premid";

const presence = new Presence({
  clientId: "1546592847531217008"
});

const browsingTimestamp = Math.floor(Date.now() / 1000);
const GR_LOGO_URL = "https://i.imgur.com/D3eyWs8.png";
const GR_WS_URL = "wss://gensokyoradio.net/wss";
const REFRESH_INTERVAL_MS = 15000;

// wss://gensokyoradio.net/wss protocol:
//   -> {"message":"grInitialConnection"}   (send first, or server stays silent)
//   <- {"message":"welcome","id":123}
//   <- {"songid":1,"title":"...","artist":"...","album":"...","circle":"...",
//       "duration":244,"played":56,"remaining":188,"albumart":"https://...",
//       "albumid":1,"year":2011}
//   <- {"message":"ping"} -> reply {"message":"pong","id":123}
//   -> {"message":"grSongDataRequest"} to ask for a fresh songid frame

interface GRSongData {
  songid: number;
  title: string;
  artist: string;
  album: string;
  circle: string;
  duration: number;
  played: number;
  remaining: number;
  albumart: string;
  albumid: number;
  year: number;
}

interface GRSocketMessage {
  message?: "grInitialConnection" | "welcome" | "ping" | "pong" | "grSongDataRequest";
  id?: number;
  [key: string]: unknown;
}

let socket: WebSocket | null = null;
let welcomeId: number | null = null;
let nowPlaying: GRSongData | null = null;
let nowPlayingReceivedAt = 0;
let refreshInterval: ReturnType<typeof setInterval> | null = null;

function isSongData(data: GRSocketMessage): data is GRSocketMessage & GRSongData {
  return typeof data.songid === "number" && typeof data.title === "string";
}

function connectSocket() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  socket = new WebSocket(GR_WS_URL);

  socket.addEventListener("open", () => {
    socket?.send(JSON.stringify({ message: "grInitialConnection" }));

    if (refreshInterval !== null) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => {
      socket?.send(JSON.stringify({ message: "grSongDataRequest" }));
    }, REFRESH_INTERVAL_MS);
  });

  socket.addEventListener("message", (event) => {
    let data: GRSocketMessage;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    if (data.message === "welcome" && typeof data.id === "number") {
      welcomeId = data.id;
      return;
    }

    if (data.message === "ping") {
      socket?.send(JSON.stringify({ message: "pong", id: welcomeId ?? data.id }));
      return;
    }

    if (isSongData(data)) {
      nowPlaying = data;
      nowPlayingReceivedAt = Date.now();
    }
  });

  socket.addEventListener("close", () => {
    socket = null;
    if (refreshInterval !== null) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  });

  socket.addEventListener("error", () => {
    socket?.close();
  });
}

function detectPaused(): boolean {
  // Angular player: <ion-icon name="play"|"stop"> shows the action the button performs
  const stateIcon = document.querySelector<HTMLElement>(
    'ion-icon[name="stop"], ion-icon[name="play"]'
  );
  if (stateIcon) {
    return stateIcon.getAttribute("name") === "play";
  }

  // Classic /playing page: #playStopBtn polygon morphs between a play triangle and stop square
  const shape = document.querySelector<SVGPolygonElement>(
    "#playStopBtn polygon#shape, #playStopBtn polygon"
  );
  if (shape) {
    const points = shape.getAttribute("points") ?? "";
    const looksLikeStopSquare = points.includes("45,45") && points.includes("95,95");
    return !looksLikeStopSquare;
  }

  return false;
}

function readPageTimer(): { played: number; duration: number } | null {
  const el = document.querySelector<HTMLElement>("#playerCounter");
  const text = el?.textContent?.trim();
  if (!text) return null;

  const match = text.match(/^(\d+):(\d{2})\s*\/\s*(\d+):(\d{2})$/);
  if (!match) return null;

  const [, elapsedMin, elapsedSec, totalMin, totalSec] = match;
  return {
    played: Number(elapsedMin) * 60 + Number(elapsedSec),
    duration: Number(totalMin) * 60 + Number(totalSec)
  };
}

presence.on("UpdateData", async () => {
  const { pathname, href } = document.location;
  let presenceData: PresenceData = {
    largeImageKey: GR_LOGO_URL,
    startTimestamp: browsingTimestamp
  };

  const onPlayerPage =
    href.includes("app.gensokyoradio.net/player") ||
    pathname.includes("/playing") ||
    (location.hostname === "app.gensokyoradio.net" && document.querySelector("audio") !== null);
  const onStorePage = href.includes("gensokyo.store");
  const onForumPage = href.includes("forum.gensokyoradio.net");

  if (onPlayerPage) {
    connectSocket();

    if (nowPlaying) {
      const paused = detectPaused();
      const details = `\u25B6 ${nowPlaying.title}`;
      const state = nowPlaying.circle
        ? `${nowPlaying.artist} \u2014 ${nowPlaying.circle}`
        : nowPlaying.artist;
      const largeImageKey = nowPlaying.albumart || GR_LOGO_URL;
      const largeImageText = nowPlaying.album;

      if (paused) {
        presenceData = {
          type: ActivityType.Listening,
          details,
          state,
          largeImageKey,
          largeImageText,
          smallImageKey: Assets.Pause,
          smallImageText: "Paused"
        };
      } else {
        const pageTimer = readPageTimer();
        let playedSeconds: number;
        let durationSeconds: number;

        if (pageTimer) {
          playedSeconds = pageTimer.played;
          durationSeconds = pageTimer.duration;
        } else {
          const elapsedSinceMessage = (Date.now() - nowPlayingReceivedAt) / 1000;
          playedSeconds = Math.min(nowPlaying.played + elapsedSinceMessage, nowPlaying.duration);
          durationSeconds = nowPlaying.duration;
        }

        const [start, end] = getTimestamps(Math.floor(playedSeconds), durationSeconds);

        presenceData = {
          type: ActivityType.Listening,
          details,
          state,
          largeImageKey,
          largeImageText,
          smallImageKey: Assets.Play,
          smallImageText: "Playing",
          startTimestamp: start,
          endTimestamp: end
        };
      }
    } else {
      presenceData.details = "Connecting to Gensokyo Radio\u2026";
      presenceData.state = "100% fan-made Touhou Project music";
    }
  } else if (onStorePage) {
    presenceData.details = "Browsing the Gensokyo Store";
    presenceData.state = "Merch & music";
    presenceData.smallImageKey = Assets.Search;
  } else if (onForumPage) {
    // Discourse titles: "Topic - Category - Gensokyo Radio" or "Category - Gensokyo Radio"
    const suffix = " - Gensokyo Radio";

    if (document.title.endsWith(suffix)) {
      const withoutSuffix = document.title.slice(0, -suffix.length);
      const lastDashIndex = withoutSuffix.lastIndexOf(" - ");

      if (pathname.startsWith("/t/") && lastDashIndex !== -1) {
        const topicTitle = withoutSuffix.slice(0, lastDashIndex);
        const category = withoutSuffix.slice(lastDashIndex + 3);
        presenceData.details = "Reading a forum topic";
        presenceData.state = `"${topicTitle}" in ${category}`;
      } else if (pathname.startsWith("/c/")) {
        presenceData.details = `Browsing the ${withoutSuffix} forum`;
      } else {
        presenceData.details = "Browsing the Forums";
      }
    } else {
      presenceData.details = "Browsing the Forums";
    }
  } else {
    const articleMatch = document.title.match(
      /^(.+?)\s\((News|Reviews?)\)\s\|\s*Gensokyo Radio$/i
    );

    if (articleMatch) {
      const [, articleTitle, articleType] = articleMatch;
      presenceData.details =
        (articleType ?? "").toLowerCase() === "news" ? "Reading through news" : "Reading a review";
      presenceData.state = articleTitle;
    } else if (pathname.startsWith("/news")) {
      presenceData.details = "Browsing News";
    } else if (pathname.startsWith("/reviews")) {
      presenceData.details = "Browsing Reviews";
    } else {
      // URL-based labels — their title doesn't always update on client-side nav
      const pathLabels: Array<[RegExp, string]> = [
        [/^\/music\/circle\/[^/]+\/?$/, "Browsing a Circle"],
        [/^\/music\/circle\/?$/, "Browsing Circles"],
        [/^\/music\/artist\/[^/]+\/?$/, "Browsing an Artist"],
        [/^\/music\/artist\/?$/, "Browsing Artists"],
        [/^\/music\/album\/\d+\/?$/, "Browsing an Album"],
        [/^\/music\/?$/, "Browsing Music"],
        [/^\/shows\/?$/, "Browsing Podcasts"],
        [/^\/search\/?$/, "Searching Gensokyo Radio"],
        [/^\/faq\/?$/, "Reading the FAQ"],
        [/^\/about\/?$/, "Learning About Gensokyo Radio"],
        [/^\/account/, "Managing their Account"]
      ];
      const pathMatch = pathLabels.find(([re]) => re.test(pathname));

      if (pathMatch) {
        presenceData.details = pathMatch[1];
      } else {
        const genericMatch = document.title.match(/^(.+?)\s\|\s*Gensokyo Radio$/i);
        presenceData.details = genericMatch
          ? `Browsing ${genericMatch[1]}`
          : "Browsing Gensokyo Radio";
      }
    }
  }

  presence.setActivity(presenceData);
});

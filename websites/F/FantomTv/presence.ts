import { ActivityType } from "premid";

const presence = new Presence({
  clientId: "1381606555710918766",
});
enum Assets {
  Play = 'https://cdn.rcd.gg/PreMiD/resources/play.png',
  Pause = 'https://cdn.rcd.gg/PreMiD/resources/pause.png',
  Stop = 'https://cdn.rcd.gg/PreMiD/resources/stop.png',
  Search = 'https://cdn.rcd.gg/PreMiD/resources/search.png',
  Question = 'https://cdn.rcd.gg/PreMiD/resources/question.png',
  Live = 'https://cdn.rcd.gg/PreMiD/resources/live.png',
  Reading = 'https://cdn.rcd.gg/PreMiD/resources/reading.png',
  Writing = 'https://cdn.rcd.gg/PreMiD/resources/writing.png',
  Call = 'https://cdn.rcd.gg/PreMiD/resources/call.png',
  VideoCall = 'https://cdn.rcd.gg/PreMiD/resources/video-call.png',
  Downloading = 'https://cdn.rcd.gg/PreMiD/resources/downloading.png',
  Uploading = 'https://cdn.rcd.gg/PreMiD/resources/uploading.png',
  Repeat = 'https://cdn.rcd.gg/PreMiD/resources/repeat.png',
  RepeatOne = 'https://cdn.rcd.gg/PreMiD/resources/repeat-one.png',
  Premiere = 'https://cdn.rcd.gg/PreMiD/resources/premiere.png',
  PremiereLive = 'https://cdn.rcd.gg/PreMiD/resources/premiere-live.png',
  Viewing = 'https://cdn.rcd.gg/PreMiD/resources/viewing.png',

  // New additions:
    Info= 'https://img.icons8.com/ios-filled/512/info.png',
  TV= 'https://img.icons8.com/ios-filled/512/tv.png',
  Profile= 'https://img.icons8.com/ios-filled/512/user-male-circle.png',
  Star= 'https://img.icons8.com/ios-filled/512/star.png',
  Movie= 'https://img.icons8.com/ios-filled/512/clapperboard.png',
  Anime= 'https://img.icons8.com/ios-filled/512/anime.png',
  Heart=   'https://img.icons8.com/ios-filled/512/like.png',
  Trending='https://img.icons8.com/external-anggara-flat-anggara-putra/512/external-trending-basic-user-interface-anggara-flat-anggara-putra.png',
  Clock= 'https://img.icons8.com/ios-filled/512/clock.png',
}
const browsingTimestamp = Math.floor(Date.now() / 1000);
const defaultLogo = "https://raw.githubusercontent.com/Parthsadaria/Fantom-assets/refs/heads/main/fantom_512.png";

const API_KEY = 'f1e9f26e7db297085d5c15e7ea4f15db';
const API_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

async function fetchMovieDetails(id: string) {
  
  try {
    const res = await fetch(`${API_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
async function fetchTvDetails(id: string) {
  try {
    const res = await fetch(`${API_URL}/tv/${id}?api_key=${API_KEY}&language=en-US`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

presence.setActivity({
  type: ActivityType.Watching,
  details: "Browsing FantomTV 🎬",
  state: "Ready to stream movies, shows & anime 🍿",
  largeImageKey: defaultLogo,
  largeImageText: "FantomTV - Watch. Chill. Repeat.",
  smallImageKey: Assets.Play,
  startTimestamp: browsingTimestamp,
  buttons: [
    {
      label: "Visit FantomTV",
      url: "https://fantomtv.netlify.app/",
    },
  ],
}, true);

presence.on("UpdateData", async () => {
  let details = "Browsing FantomTV 🎬";
  let state = "Ready to stream movies, shows & anime 🍿";
  let largeImageKey = defaultLogo;
  let largeImageText = "FantomTV - Watch. Chill. Repeat.";
  let smallImageKey = Assets.Play;
  let smallImageText = "Browsing FantomTV";
  let startTimestamp = browsingTimestamp;
  let endTimestamp = undefined;
  let buttons: [ { label: string; url: string }, ( { label: string; url: string } | undefined )? ] = [
    {
      label: "Visit FantomTV",
      url: "https://fantomtv.netlify.app/",
    },
  ];

  // --- Movie Playing in Video Player ---
  const videoModal = document.getElementById("video-modal");
  const videoFrame = document.getElementById("video-frame") as HTMLIFrameElement | null;

  if (
    videoModal &&
    videoModal.style.display !== "none" &&
    !videoModal.classList.contains("hidden") &&
    videoFrame &&
    videoFrame.src
  ) {
    // Parse type and id from the src
    const url = new URL(videoFrame.src);
    const type = url.searchParams.get("type");
    const id = url.searchParams.get("id");

    if (type === "movie" && id) {
      const movie = await fetchMovieDetails(id);
      if (movie) {
        details = `Watching: ${movie.title || movie.original_title || "Unknown Movie"}`;
        state = movie.tagline
          ? movie.tagline
          : (movie.release_date ? `Released: ${movie.release_date}` : "Streaming now 🍿");
        largeImageKey = movie.backdrop_path
          ? `${IMAGE_BASE_URL}w780${movie.backdrop_path}`
          : (movie.poster_path ? `${IMAGE_BASE_URL}w500${movie.poster_path}` : defaultLogo);
        largeImageText = movie.title || "FantomTV";
        smallImageKey = Assets.Play;
        smallImageText = "Now Playing";
        buttons = [
          {
            label: "View on TMDB",
            url: `https://www.themoviedb.org/movie/${id}`,
          },
          {
            label: "Watch on FantomTV",
            url: document.location.href,
          },
        ];
      } else {
        details = "Watching: Unknown Movie";
        state = "Streaming now 🍿";
        smallImageKey = Assets.Play;
        smallImageText = "Now Playing";
      }
    } else if (type === "tv" && id) {
      const tv = await fetchTvDetails(id);
      if (tv) {
        details = `Watching: ${tv.name || "Unknown TV Show"}`;
        state = tv.tagline
          ? tv.tagline
          : (tv.first_air_date ? `First aired: ${tv.first_air_date}` : "Streaming now 📺");
        largeImageKey = tv.backdrop_path
          ? `${IMAGE_BASE_URL}w780${tv.backdrop_path}`
          : (tv.poster_path ? `${IMAGE_BASE_URL}w500${tv.poster_path}` : defaultLogo);
        largeImageText = tv.name || "FantomTV";
        smallImageKey = Assets.TV;
        smallImageText = "Now Playing";
        buttons = [
          {
            label: "View on TMDB",
            url: `https://www.themoviedb.org/tv/${id}`,
          },
          {
            label: "Watch on FantomTV",
            url: document.location.href,
          },
        ];
      } else {
        details = "Watching: Unknown TV Show";
        state = "Streaming now 📺";
        smallImageKey = Assets.TV;
        smallImageText = "Now Playing";
      }
    } else if (type === "anime" && id) {
      // --- Anime Playing ---
      const animeTitle = document.getElementById("anime-player-title")?.textContent?.trim() || "Unknown Anime";
      details = `Watching: ${animeTitle}`;
      state = "Streaming anime episode 🍥";
      const animeImg = document.querySelector("#anime-player-poster img") as HTMLImageElement | null;
      largeImageKey = animeImg && animeImg.src ? animeImg.src : defaultLogo;
      largeImageText = animeTitle;
      smallImageKey = Assets.Anime;
      smallImageText = "Now Playing";
      buttons = [
        {
          label: "Watch on FantomTV",
          url: document.location.href,
        },
      ];
    }
  }
  // --- Movie Details Modal ---
  else if (
    document.getElementById("details-modal") &&
    document.getElementById("details-modal")!.style.display !== "none" &&
    !document.getElementById("details-modal")!.classList.contains("hidden")
  ) {
    const movieTitle = document.getElementById("details-title")?.textContent?.trim() || "Unknown Movie";
    details = `Viewing details of ${movieTitle}`;
    state = "Checking out info, cast, and more!";
    const imgElement = document.getElementById("details-backdrop") as HTMLImageElement | null;
    if (imgElement && imgElement.src && !imgElement.src.includes("placehold.co")) {
      largeImageKey = imgElement.src;
      largeImageText = movieTitle;
    }
    smallImageKey = Assets.Info;
    smallImageText = "Viewing Details";
    buttons = [
      {
        label: "Watch Now",
        url: document.location.href,
      },
    ];
  }
  // --- Anime Page ---
  else if (
    document.getElementById("anime-page-container") &&
    !document.getElementById("anime-page-container")!.classList.contains("hidden")
  ) {
    details = "Browsing Anime 🍥";
    state = "Explore trending anime series!";
    const heroImg = document.querySelector("#anime-hero-slider img") as HTMLImageElement | null;
    if (heroImg && heroImg.src && !heroImg.src.includes("placehold.co")) {
      largeImageKey = heroImg.src;
      largeImageText = "Anime Spotlight";
    }
    smallImageKey = Assets.Anime;
    smallImageText = "Anime Section";
    buttons = [
      {
        label: "Browse Anime",
        url: document.location.href,
      },
    ];
  }
  // --- TV Shows Page ---
  else if (
    document.getElementById("tv-shows-page-container") &&
    !document.getElementById("tv-shows-page-container")!.classList.contains("hidden")
  ) {
    details = "Browsing TV Shows 📺";
    state = "Find your next binge!";
    const heroImg = document.querySelector("#tv-hero-slider img") as HTMLImageElement | null;
    if (heroImg && heroImg.src && !heroImg.src.includes("placehold.co")) {
      largeImageKey = heroImg.src;
      largeImageText = "TV Show Spotlight";
    }
    smallImageKey = Assets.TV;
    smallImageText = "TV Shows Section";
    buttons = [
      {
        label: "Browse TV Shows",
        url: document.location.href,
      },
    ];
  }
  // --- Profile Page ---
  else if (
    document.getElementById("profile-page-container") &&
    !document.getElementById("profile-page-container")!.classList.contains("hidden")
  ) {
    const username = document.getElementById("profile-username")?.textContent?.trim() || "Profile";
    details = `Viewing profile: ${username}`;
    state = "Checking out watch history & lists";
    const imgElement = document.getElementById("profile-avatar") as HTMLImageElement | null;
    if (imgElement && imgElement.src) {
      largeImageKey = imgElement.src;
      largeImageText = username;
    }
    smallImageKey = Assets.Profile;
    smallImageText = "Profile Section";
    buttons = [
      {
        label: "View Profile",
        url: document.location.href,
      },
    ];
  }
  // --- Wishlist Modal ---
  else if (
    document.getElementById("wishlist-modal") &&
    !document.getElementById("wishlist-modal")!.classList.contains("hidden")
  ) {
    details = "Viewing Wishlist ⭐";
    state = "Checking your favorite movies and shows";
    smallImageKey = Assets.Star;
    smallImageText = "Wishlist";
    buttons = [
      {
        label: "View Wishlist",
        url: document.location.href,
      },
    ];
  }

  presence.setActivity({
    type: ActivityType.Watching,
    details,
    state,
    largeImageKey,
    largeImageText,
    smallImageKey,
    smallImageText,
    startTimestamp,
    endTimestamp,
    buttons,
  }, true);
});

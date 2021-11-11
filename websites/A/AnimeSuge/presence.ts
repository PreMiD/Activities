const presence = new Presence({
    clientId: "863949633009090580"
  }),
  pages: { [k: string]: string } = {
    "/anime": "Watching an anime",
    "/genre": "Searching by genre",
    "/search": "Searching anime by name",
    "/faq": "Reading the FAQ",
    "/contact": "Reading the contacts",
    "/user/settings": "Changing the settings",
    "/user/watchlist": "Looking at their watchlist",
    "/user/import": "Importing their MAL list to Animesuge!"
  },
  pagesSearching: { [k: string]: string } = {
    "/": "At the homepage",
    "/newest": "Searching for the newest animes",
    "/updated": "Searching for recently updated animes",
    "/ongoing": "Searching for ongoing animes",
    "/added": "Searching recently added animes",
    "/tv": "Searching for TV animes",
    "/movie": "Searching movie animes",
    "/ova": "Searching for OVA animes",
    "/ona": "Searching for ONA animes",
    "/special": "Searching for special anime episodes",
    "/az-list": "Seaching all animes",
    "/most-watched": "Searching most watched animes",
    "/upcoming": "Searching upcoming animes"
  };

let timeEnd: number, currentTime: number, paused: boolean;

presence.on(
  "iFrameData",
  async (data: { currentTime: number; timeEnd: number; paused: boolean }) => {
    ({ currentTime, timeEnd, paused } = data);
  }
);

presence.on("UpdateData", async () => {
  const page = document.location.pathname,
    epNumber = page.slice(page.length - 5).replace(/^\D+/g, ""),
    presenceData: PresenceData = {
      largeImageKey: "animesuge",
      startTimestamp: Math.floor(Date.now() / 1000)
    },
    search: URLSearchParams = new URLSearchParams(
      document.location.search.substring(1)
    );
  if (page in pagesSearching) {
    presenceData.details = pages[page];
    presenceData.state = "Searching animes";
  } else if (page.includes("/anime")) {
    presenceData.details = `Watching ${
      (
        document.querySelector(
          "#body > div > div > div > div > section > div > h1"
        ) as HTMLElement
      ).textContent
    }`;

    if (epNumber === "") presenceData.state = "Full episode";
    else presenceData.state = `Episode ${epNumber}`;

    if (!paused) {
      presenceData.smallImageKey = "play";
      [presenceData.startTimestamp, presenceData.endTimestamp] =
        presence.getTimestamps(currentTime, timeEnd);
    } else {
      presenceData.smallImageKey = "pause";
      presenceData.smallImageText = "Paused";
      delete presenceData.startTimestamp;
      delete presenceData.endTimestamp;
    }
    presenceData.buttons = [
      {
        label: "Watch Episode",
        url: `http://animesuge.io${page}`
      }
    ];
  } else if (page.includes("/genre")) {
    const genre = page.slice("/genre/".length);
    presenceData.details = pages["/genre"];
    presenceData.state = `Searching for ${
      genre.charAt(0).toUpperCase() + genre.slice(1)
    } Animes`;
  } else if (page.includes("/search")) {
    presenceData.details = pages[page];
    presenceData.state = `Searching: "${search.get("keyword")}"`;
    presenceData.smallImageKey = "search";
    presenceData.smallImageText = "Searching";
  } else if (page === "/faq") {
    presenceData.details = pages[page];
    presenceData.state = "Reading";
  } else if (page === "/contact") {
    presenceData.details = pages[page];
    presenceData.state = "Reading";
  } else if (page === "/user/settings") {
    presenceData.details = pages[page];
    presenceData.state = "Changing";
  } else if (page === "/user/watchlist") {
    const list = search.get("folder");
    presenceData.details = pages[page];
    presenceData.state = `At folder: ${list}`;
    if (list) presenceData.state = "Looking at all animes in the watch list";
  } else if (page === "/user/import") {
    presenceData.details = pages[page];
    presenceData.state = "Importing!";
  } else {
    presenceData.details = "Looking at an unknown page";
    presenceData.state = "Unknown";
  }
  if (presenceData.details) presence.setActivity(presenceData);
});

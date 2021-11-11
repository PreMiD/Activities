const presence = new Presence({
    clientId: "684570342085099546"
  }),
  strings = presence.getStrings({
    browse: "presence.activity.browsing"
  }),
  getElement = (query: string): string => {
    const element = document.querySelector(query);
    if (element) return element.textContent.replace(/^\s+|\s+$/g, "");
    else return;
  };

function setObject(path: string) {
  switch (path) {
    case "/": {
      return {
        details: "Browsing"
      };
    }

    case "forgot_login": {
      return {
        details: "Forgot Login"
      };
    }

    case "register": {
      return {
        details: "Registering..."
      };
    }

    case "newgame": {
      return {
        details: "Creating",
        state: "New Game"
      };
    }

    case "joingame": {
      return {
        details: "Joining",
        state: "New Game"
      };
    }

    case "shop": {
      return {
        details: "Viewing",
        state: "Shop"
      };
    }

    case "donations": {
      return {
        details: "Viewing",
        state: "Donations"
      };
    }

    case "info": {
      return {
        details: "Viewing",
        state: "Game Info"
      };
    }

    case "recruit": {
      return {
        details: "Viewing",
        state: "Recruit a Friend"
      };
    }

    case "terms": {
      return {
        details: "Viewing",
        state: "Terms of Service"
      };
    }

    case "privacy": {
      return {
        details: "Viewing",
        state: "Privacy Policy"
      };
    }

    case "contact": {
      return {
        details: "Viewing",
        state: "Contact"
      };
    }

    case "/forum": {
      return {
        details: "Viewing Page",
        state: "Forums"
      };
    }
  }
}

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "boardgameonline"
    },
    { host } = location,
    path = location.pathname,
    query = location.search,
    detailsObj = setObject(path);

  if (host === "www.boardgame-online.com") {
    if (path || (query && query.split("page=")[1].split("&")[0])) {
      (presenceData.details = detailsObj.details),
        (presenceData.state = detailsObj.state);
    }

    const header = getElement(".page_wrapper.show > .page_content > h2");
    if (header) {
      presenceData.details = "Viewing";
      presenceData.state = header;
    }

    const profile = getElement(
      ".page_wrapper.show > .page_content > #profile_name_title > .userName"
    );
    if (profile) {
      presenceData.details = "Viewing Profile";
      presenceData.state = profile;
    }
  } else {
    const playerCount =
      document.querySelector(".rankingTable").childElementCount;

    presenceData.details = "Playing Game";
    presenceData.state = document.title;

    if (playerCount)
      presenceData.state = `${document.title} (${playerCount - 1} Players)`;
  }

  if (presenceData.details) {
    if (presenceData.details.match("(Browsing|Viewing)")) {
      presenceData.smallImageKey = "reading";
      presenceData.smallImageText = (await strings).browse;
    }
  } else presence.setActivity();
});

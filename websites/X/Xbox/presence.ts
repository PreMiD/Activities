const presence = new Presence({
  clientId: "860159948234817536",
}),
  timestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "app",
    startTimestamp: timestamp
  };

  //Game Pass
  if (document.location.href.includes("/game-pass")) {
    presenceData.largeImageKey = "gamepass";
    presenceData.details = "Reading about Xbox Game Pass";
    if (document.location.href.includes("games")) {
      presenceData.details = "Browsing Xbox Game Pass games";
    }
  }

  //Live Gold
  else if (document.location.href.includes("/live/gold")) {
    presenceData.details = "Reading about Xbox Live Gold";
    if (document.location.href.includes("withgold")) {
      presenceData.details = "Viewing Xbox Live Gold benefits";
    }
  }

  //Games
  else if (document.location.href.includes("/games")) {
    presenceData.details = "Browsing Xbox game catalog";
    if (document.location.href.includes("optimized")) {
      presenceData.details = "Reading about Series X|S optimized games";
    } else if (document.location.href.includes("backward-compatibility")) {
      presenceData.details = "Reading about backward compatible games";
    }
  }

  //Consoles
  else if (document.location.href.includes("/consoles")) {
    presenceData.details = "Viewing Xbox consoles";
    if (document.location.href.includes("consoles/all-consoles")) {
      presenceData.details = "Browsing all Xbox consoles";
    } else if (document.location.href.includes("consoles/help-me-choose")) {
      presenceData.details = "Determining their recommended Xbox console";
    } else if (document.location.href.includes("consoles/")) {
      presenceData.details = "Viewing an Xbox console";
      presenceData.state = document.title.split("|")[0];
    } else if (document.location.href.includes("backward-compatibility")) {
      presenceData.details = "Reading about backward compatible games";
    }
  }

  //Accessories
  else if (document.location.href.includes("/accessories")) {
    presenceData.details = "Browsing Xbox accessories";
    if (document.location.href.includes("consoles/all-consoles")) {
      presenceData.details = "Browsing all Xbox consoles";
    } else if (document.location.href.includes("consoles/help-me-choose")) {
      presenceData.details = "Determining their recommended Xbox console";
    } else if (document.location.href.includes("accessories/")) {
      presenceData.details = "Viewing an Xbox accessory";
      presenceData.state = document.title.split("|")[0];
    } else if (document.location.href.includes("backward-compatibility")) {
      presenceData.details = "Reading about backward compatible games";
    }
  }

  //Play
  else if (document.location.href.includes("/play")) {
    presenceData.largeImageKey = "gamepass";
    if (document.location.href.includes("play/games")) {
      presenceData.details = "Viewing an Xbox Cloud Gaming game";
      presenceData.state = document.title.split("|")[0];
    } else if (document.location.href.includes("play/launch")) {
      presenceData.details = "Playing an Xbox Cloud Gaming game";
      presenceData.state = document.title.split("|")[0];
      if (document.querySelector(`[class^="Provisioning"`)) presenceData.details += " (setting up)";
      else if (document.querySelector(`[class^="NotFocused"`)) presenceData.details += " (unfocused)";
    } else {
      presenceData.details = "Browsing Xbox Cloud Gaming games";
      if (document.location.href.includes("gallery/")) presenceData.state = "Category: " + document.title.split("|")[0];
    }
  }

  //Community
  else if (document.location.href.includes("/community")) {
    presenceData.details = "Viewing the Xbox Community"
    if (document.location.href.includes("esports")) {
      presenceData.details = "Reading about Xbox Esports";
    } else if (document.location.href.includes("play/launch")) {
      presenceData.details = "Playing an Xbox Cloud Gaming game";
      presenceData.state = document.title.split("|")[0];
      if (document.querySelector(`[class^="Provisioning"`)) presenceData.details += " (setting up)";
      else if (document.querySelector(`[class^="NotFocused"`)) presenceData.details += " (unfocused)";
    } else {
      presenceData.details = "Browsing Xbox Cloud Gaming games";
      if (document.location.href.includes("gallery/")) presenceData.state = "Category: " + document.title.split("|")[0];
    }
  }

  //My Xbox
  else if (document.location.hostname === "account.xbox.com") {
    presenceData.details = "Viewing their profile";
    if (document.location.href.includes("gamertag=")) presenceData.details = "Viewing profile: " + document.title.split("-")[0];
  }

  //Support
  else if (document.location.hostname === "support.xbox.com") {
    presenceData.details = "Viewing Xbox Support";
    if (document.location.href.includes("help")) presenceData.state = document.title.split("|")[0];
  }

  //Xbox Wire
  else if (document.location.hostname === "news.xbox.com") {
    presenceData.details = "Viewing news from Xbox Wire";
    if (document.title.includes("-")) presenceData.state = document.title.split("-")[0];
  }

  //Other
  else {
    presenceData.details = "Browsing the website"
    presenceData.state = "Page: " + document.title
    if (document.location.pathname.length < 8) presenceData.state = "Homepage"
  }

  if (presenceData.details == null) {
    presence.setTrayTitle();
    presence.setActivity();
  } else {
    presence.setActivity(presenceData);
  }
});

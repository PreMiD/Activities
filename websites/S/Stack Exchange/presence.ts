const presence = new Presence({
    clientId: "919817726195814431"
  }),
  startTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "stackexchange",
      startTimestamp
    },
    { pathname, hostname } = window.location;

  if (hostname === "stackexchange.com") presenceData.details = "Browsing";
  else if (hostname === "serverfault.com") {
    presenceData.largeImageKey = "serverfault";
    presenceData.details = "Server Fault";
  } else if (hostname === "meta.serverfault.com") {
    presenceData.largeImageKey = "serverfault";
    presenceData.details = "Server Fault Meta";
  } else if (hostname === "askubuntu.com") {
    presenceData.largeImageKey = "askubuntu";
    presenceData.details = "Ask Ubuntu";
  } else if (hostname === "meta.askubuntu.com") {
    presenceData.largeImageKey = "askubuntu";
    presenceData.details = "Ask Ubuntu Meta";
  } else if (hostname === "superuser.com") {
    presenceData.largeImageKey = "superuser";
    presenceData.details = "Super User";
  } else if (hostname === "meta.superuser.com") {
    presenceData.largeImageKey = "superuser";
    presenceData.details = "Super User Meta";
  } else {
    const subStack = document.querySelector("meta[property='og:site_name']"),
      imageKey = hostname.replace(".stackexchange.com", "");
    if (imageKey === "meta") presenceData.smallImageKey = imageKey;
    else presenceData.smallImageKey = imageKey.replace(".meta", "");

    presenceData.smallImageText = subStack
      .getAttribute("content")
      .replace("Stack Exchange", "");
    if (pathname.includes("/questions"))
      presenceData.details = "Reading a question";
  }

  if (pathname === "/") {
    if (
      [
        "serverfault.com",
        "meta.serverfault.com",
        "superuser.com",
        "meta.superuser.com",
        "askubuntu.com",
        "meta.askubuntu.com"
      ].includes(hostname)
    )
      presenceData.state = "Main Page";
    else presenceData.details = "Main Page";
  } else if (pathname.includes("/questions")) {
    const titleElem = document.querySelector(".question-hyperlink");
    presenceData.state = titleElem.textContent;
  } else if (
    [
      "serverfault.com",
      "meta.serverfault.com",
      "superuser.com",
      "meta.superuser.com",
      "askubuntu.com",
      "meta.askubuntu.com"
    ].includes(hostname)
  )
    presenceData.state = "Browsing";
  else presenceData.details = "Browsing";

  if (presenceData.details) presence.setActivity(presenceData);
  else presence.setActivity();
});

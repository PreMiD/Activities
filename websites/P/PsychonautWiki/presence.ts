const presence = new Presence({
  clientId: "1432152324163502130",
});

enum ActivityAssets {
  Logo = "logo",
}

presence.on("UpdateData", async () => {
  const { pathname } = document.location;

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: Math.floor(Date.now() / 1000),
    details: "Browsing PsychonautWiki",
    state: "",
  };

  if (pathname === "/wiki/Main_Page") {
    presenceData.state = "Browsing the Main Page";
  } else if (pathname.startsWith("/wiki/")) {
    const articleName = decodeURIComponent(
      pathname.replace("/wiki/", "").replace(/_/g, " ")
    );
    presenceData.state = `Browsing the article "${articleName}"`;
  } else {
    presenceData.state = "Browsing the Wiki";
  }

  presence.setActivity(presenceData);
});
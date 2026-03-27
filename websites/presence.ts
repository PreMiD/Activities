const presence = new Presence({ clientId: "1478224736298471566" });
const browsingTimestamp = Math.floor(Date.now() / 1000);

// Map URL paths / page titles to readable states
function getPageInfo(): { state: string; details: string; smallImageKey?: string; smallImageText?: string } {
  const path = document.location.pathname;
  const hash = document.location.hash;
  const search = new URLSearchParams(document.location.search);

  // Post embed redirect
  if (path.startsWith("/post/")) {
    return {
      details: "Viewing a post",
      state: "creamsodaboys.org",
      smallImageKey: "reading",
      smallImageText: "Reading"
    };
  }

  // User profile embed redirect
  if (path.startsWith("/u/")) {
    return {
      details: "Viewing a profile",
      state: "creamsodaboys.org",
      smallImageKey: "profile",
      smallImageText: "Profile"
    };
  }

  // SPA — detect active tab from the page
  const activeNav = document.querySelector(".nav-item.active span");
  const tabName = activeNav?.textContent?.trim().toLowerCase() ?? "";

  // Community tab sub-sections
  const activeFeedTab = document.querySelector(".feed-tab-btn.active")?.textContent?.trim().toLowerCase() ?? "";

  switch (tabName) {
    case "home":
      return { details: "On the home page", state: "creamsodaboys.org", smallImageKey: "home", smallImageText: "Home" };

    case "community":
      if (activeFeedTab === "users") {
        return { details: "Browsing users", state: "Community", smallImageKey: "users", smallImageText: "Users" };
      }
      if (activeFeedTab === "messages") {
        return { details: "Checking messages", state: "Community", smallImageKey: "messages", smallImageText: "Messages" };
      }
      // Check if viewing a profile
      const profileView = document.getElementById("memberProfileView");
      if (profileView && profileView.style.display !== "none") {
        const username = document.getElementById("mpUsername")?.textContent?.trim();
        return {
          details: "Viewing a profile",
          state: username ? `@${username}` : "Community",
          smallImageKey: "profile",
          smallImageText: "Profile"
        };
      }
      return { details: "Browsing the feed", state: "Community", smallImageKey: "feed", smallImageText: "Feed" };

    case "music":
      return { details: "Listening to music", state: "Cream Soda RADIO", smallImageKey: "music", smallImageText: "Music" };

    case "store":
      return { details: "Browsing the store", state: "creamsodaboys.org", smallImageKey: "store", smallImageText: "Store" };

    case "about":
      return { details: "Reading about CSB", state: "creamsodaboys.org", smallImageKey: "info", smallImageText: "About" };

    case "account":
      return { details: "On their profile", state: "creamsodaboys.org", smallImageKey: "profile", smallImageText: "Account" };

    case "info":
    case "contact":
      return { details: "Viewing contact info", state: "creamsodaboys.org" };

    default:
      return { details: "Hanging on CSB", state: "creamsodaboys.org" };
  }
}

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "logo",
    startTimestamp: browsingTimestamp
  };

  const showPage = await presence.getSetting<boolean>("showPage");
  const showTimestamp = await presence.getSetting<boolean>("showTimestamp");

  if (!showTimestamp) delete presenceData.startTimestamp;

  if (showPage) {
    const info = getPageInfo();
    presenceData.details = info.details;
    presenceData.state = info.state;
    if (info.smallImageKey) presenceData.smallImageKey = info.smallImageKey;
    if (info.smallImageText) presenceData.smallImageText = info.smallImageText;
  } else {
    presenceData.details = "creamsodaboys.org";
    presenceData.state = "CSB";
  }

  presence.setActivity(presenceData);
});

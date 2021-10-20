const presence = new Presence({
  clientId: "843711390539841577"
}), browsingStamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "dscgg",
    startTimestamp: browsingStamp,
    details: "Viewing 📰 page:",
    state: "🛑 Unsupported"
  };

  if (document.location.pathname === "/") {
    presenceData.state = "🏡 Home";
  } else if (document.location.pathname.includes("/search")) {
    const search = document.getElementById("searchBar")?.getAttribute("value");
    presenceData.details = "🔎 Searching for:";
    presenceData.state = `🔗 ${search || "Nothing"}`;
    presenceData.smallImageKey = "search";
    presenceData.buttons = [
      {
        label: "View Results",
        url: document.location.href
      }
    ];
  } else if (document.location.pathname === "/about") {
    presenceData.state = "📚 About";
    presenceData.buttons = [
      {
        label: "View Page",
        url: document.location.href
      }
    ];
  } else if (document.location.pathname.includes("/premium")) {
    presenceData.state = "💎 Premium";
    presenceData.buttons = [
      {
        label: "View Page",
        url: document.location.href
      }
    ];
  } else if (document.location.pathname === "/developers/about") {
    presenceData.state = "💻 Developer"
    presenceData.buttons = [
      {
        label: "View Page",
        url: document.location.href
      }
    ];
  } else if (document.location.pathname === "/developers/dashboard") {
    presenceData.details = "Viewing ⚙️ dashboard";
    presenceData.state = "🖥️ Developer"
  } else if (document.location.pathname === "/dashboard") {
    presenceData.details = "Viewing ⚙️ dashboard";
    presenceData.state = "🔗 Links";
  } else if (document.location.pathname.includes("/dashboard/l/")) {
    const [, link] = document.location.pathname.split("/dashboard/l/");
    presenceData.details = `Editing 🔗 ${link} link`;
    presenceData.state = `🏓 Tab: ${location.href.includes("#tab") ? location.href.replace(`https://dsc.gg/dashboard/l/${link}#tab=`, " ") : "basic"}`;
    presenceData.buttons = [
      {
        label: "Visit Link",
        url: `https://dsc.gg/${link}`
      }
    ];
  } else if (document.location.pathname === "/legal/privacy")
    presenceData.state = "📜 Privacy Policy";
  else if (document.location.pathname === "/legal/tos")
    presenceData.state = "📖 Terms of Service";

  if (!presenceData.details) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});
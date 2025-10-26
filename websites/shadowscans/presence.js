const presence = new Presence({ clientId: "1432138529235927040" });
let startTimestamp = Math.floor(Date.now() / 1000);

function detectType() {
  const text = document.body.innerText.toLowerCase();
  if (text.includes("manhwa")) return "Manhwa";
  if (text.includes("manhua")) return "Manhua";
  if (text.includes("manga")) return "Manga";
  if (text.includes("novel")) return "Novel";
  return "Series";
}

presence.on("UpdateData", () => {
  const href = location.href;
  const type = detectType();
  const presenceData = {
    largeImageKey: "logo",
    smallImageKey: "reading",
    startTimestamp,
    buttons: []
  };

  // Home
  if (href === "https://crimsonscans.site/" || href === "https://crimsonscans.site") {
    presenceData.details = "🏠 Browsing Home";
    presenceData.state = "Shadow Scans Main Page";
    presenceData.buttons.push({ label: "🌐 Visit Website", url: "https://crimsonscans.site/" });
  }

  // All Manga list
  else if (href === "https://crimsonscans.site/manga/" || href === "https://crimsonscans.site/manga") {
    presenceData.details = "📚 Browsing All Series";
    presenceData.state = "All Manga / Manhwa / Manhua";
    presenceData.buttons.push({ label: "📚 View All Series", url: "https://crimsonscans.site/manga/" });
  }

  // Specific series
  else if (href.includes("/manga/") && !href.match(/chapter/i) && !href.endsWith("/manga/")) {
    const title = document.querySelector("h1.entry-title")?.textContent?.trim() || document.title;
    presenceData.details = `📘 Viewing ${type}`;
    presenceData.state = title;
    presenceData.buttons.push(
      { label: "🔗 Open Series", url: href },
      { label: "🏠 Visit Website", url: "https://crimsonscans.site/" }
    );
  }

  // Chapter
  else if (href.match(/chapter/i) || href.match(/-chapter-/i)) {
    const chapTitle =
      document.querySelector("h1.entry-title")?.textContent?.trim() || document.title;
    const seriesTitle =
      document.querySelector(".entry-header a")?.textContent?.trim() ||
      document.querySelector(".series-title a")?.textContent?.trim();
    presenceData.details = `📖 Reading ${type}: ${seriesTitle || "Unknown"}`;
    presenceData.state = chapTitle || "Unknown Chapter";
    presenceData.buttons.push(
      { label: "🔗 View Chapter", url: href },
      { label: "📚 View Series", url: document.referrer || "https://crimsonscans.site/manga/" }
    );
  }

  // Other sections
  else {
    const title = document.title || "Exploring Shadow Scans";
    presenceData.details = "🌐 Browsing Section";
    presenceData.state = title;
    presenceData.buttons.push({ label: "🏠 Visit Website", url: "https://crimsonscans.site/" });
  }

  presence.setActivity(presenceData);
});

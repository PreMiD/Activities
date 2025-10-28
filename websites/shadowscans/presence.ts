const presence = new Presence({ clientId: "1432138529235927040" });
let startTimestamp = Math.floor(Date.now() / 1000);

function detectType(): "Manhwa" | "Manhua" | "Manga" | "Novel" | "Series" {
  const text = (document.body.innerText || "").toLowerCase();
  if (text.includes("manhwa")) return "Manhwa";
  if (text.includes("manhua")) return "Manhua";
  if (text.includes("manga"))  return "Manga";
  if (text.includes("novel"))  return "Novel";
  return "Series";
}

presence.on("UpdateData", async () => {
  const href  = document.location.href;
  const path  = document.location.pathname || "";
  const type  = detectType();

  const data = {
    largeImageKey: "logo",
    smallImageKey: "reading",
    startTimestamp,
    details: "",
    state: "",
    buttons: [] as { label: string; url: string }[]
  } as PresenceData;

  // Home
  if (href === "https://crimsonscans.site/" || href === "https://crimsonscans.site") {
    data.details = "Browsing Home";
    data.state   = "Shadow Scans";
    // القاعدة: أزرار الـRP ممنوع توجّه للـhomepage. نستخدم كتالوج السلاسل بدلًا منها.
    data.buttons.push({ label: "Browse All Series", url: "https://crimsonscans.site/manga/" });
  }
  // All-series catalog
  else if (href === "https://crimsonscans.site/manga/" || href === "https://crimsonscans.site/manga") {
    data.details = "Browsing Catalog";
    data.state   = "All Manga / Manhwa / Manhua";
    data.buttons.push({ label: "Open Catalog", url: href });
  }
  // Series page (no chapter)
  else if (path.startsWith("/manga/") && !/chapter/i.test(href) && !href.endsWith("/manga/")) {
    const title =
      document.querySelector<HTMLHeadingElement>("h1.entry-title")?.textContent?.trim() ||
      document.title;
    data.details = `Viewing ${type}`;
    data.state   = title || "Series";
    data.buttons.push({ label: "Open Series", url: href });
  }
  // Chapter page
  else if (/chapter/i.test(href) || /-chapter-/i.test(href)) {
    const chapTitle =
      document.querySelector<HTMLHeadingElement>("h1.entry-title")?.textContent?.trim() ||
      document.title;
    const seriesTitle =
      document.querySelector<HTMLElement>(".entry-header a")?.textContent?.trim() ||
      document.querySelector<HTMLElement>(".series-title a")?.textContent?.trim() ||
      "Unknown";
    data.details = `Reading ${type}: ${seriesTitle}`;
    data.state   = chapTitle || "Chapter";
    data.buttons.push(
      { label: "View Chapter", url: href },
      { label: "View Series",  url: document.referrer || "https://crimsonscans.site/manga/" }
    );
  }
  // Other sections
  else {
    data.details = "Browsing Section";
    data.state   = document.title || "Exploring";
    // زر سياقي للصفحة الحالية فقط (تجنّب homepage)
    data.buttons.push({ label: "Open Page", url: href });
  }

  presence.setActivity(data);
});

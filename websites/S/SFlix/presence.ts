import { Assets, ActivityType } from "premid";

// -------------------------
// Setup
// -------------------------
const presence = new Presence({
    clientId: "1421596228789080105", // use a different clientId if you want a new app
});
// -------------------------
// Helper: Grab media info
// -------------------------
function getMediaData() {
    // Title
    const title = document.querySelector("h1[itemprop='name']")?.textContent?.trim() || null;

    // Thumbnail (prefer meta tag)
    const thumbnail = (document.querySelector("img[itemprop='image']") as HTMLImageElement)?.src || null;
    return { title, thumbnail };
}

// -------------------------
// Main Presence Update
// -------------------------
presence.on("UpdateData", async () => {
    const { pathname } = document.location;

    const presenceData: any = {
        type: ActivityType.Watching,
        name: "",
        largeImageKey: "https://i.imgur.com/npnJUpz.png", // fallback
        smallImageKey: Assets.Play,
        smallImageText: "Playing",
    };

    if (pathname.startsWith("/watch/")) {
        const { title, thumbnail } = getMediaData();

        if (title) presenceData.name = title;
        if (thumbnail) presenceData.largeImageKey = thumbnail;
    } else {
        return presence.clearActivity();
    }

    presence.setActivity(presenceData);
});

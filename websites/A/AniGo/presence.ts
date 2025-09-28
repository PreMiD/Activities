import { Assets, ActivityType } from "premid";

// -------------------------
// Setup
// -------------------------
const presence = new Presence({
    clientId: "1421560940595384532", // Discord app ID
});
// -------------------------
// Helper: Grab anime info
// -------------------------
function getAnimeData() {
    const title = document.querySelector<HTMLLIElement>(
        "li.breadcrumb-item.active"
    )?.textContent?.trim();

    const thumbnail = document.querySelector<HTMLImageElement>(
        ".poster > div > img"
    )?.src;

    return { title, thumbnail };
}

// -------------------------
// Main Presence Update
// -------------------------
presence.on("UpdateData", async () => {
    const { pathname } = document.location;

    // Only show presence on watch pages
    if (!pathname.startsWith("/watch/")) {
        return presence.clearActivity();
    }

    const { title, thumbnail } = getAnimeData();
    if (!title) return presence.clearActivity();

    const presenceData: any = {
        type: ActivityType.Watching,
        name: title, // Activity heading = anime name
        largeImageKey: thumbnail || "https://i.imgur.com/txVvhfI.png",
        smallImageKey: Assets.Play,
        smallImageText: "Playing",
        details: null,
    };

    presence.setActivity(presenceData);
});

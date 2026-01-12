const presence = new Presence({
    clientId: "1358341885772562553"
});

const BOOSTEROID_LOGO = "https://i.imgur.com/5cztMTp.png";

const PLATFORM_ICONS: Record<string, string> = {
    steam: "https://i.imgur.com/eTyEzCI.png",
    xbox: "https://i.imgur.com/9z2OtB2.png",
    "rockstar-games": "https://i.imgur.com/j4YYY9x.png",
    "epic-games-store": "https://i.imgur.com/ghkvosN.png",
    wargamingnet: "https://i.imgur.com/CDLfEp3.png",
    battlenet: "https://i.imgur.com/DHysiDG.png",
    "battle-net": "https://i.imgur.com/DHysiDG.png",
    uplay: "https://i.imgur.com/e4jBfUK.png",
    "ubisoft-connect": "https://i.imgur.com/e4jBfUK.png",
    origin: "https://i.imgur.com/iWrTZS7.png",
    "ea-app": "https://i.imgur.com/iWrTZS7.png",
    fanatical: "https://i.imgur.com/iWrTZS7.png",
    default: BOOSTEROID_LOGO
};

function getTimestamp(gameId: string | number): number {
    const savedTime = sessionStorage.getItem("premid_timestamp");
    const savedGame = sessionStorage.getItem("premid_last_game");

    if (savedGame === String(gameId) && savedTime) {
        return Number(savedTime);
    }

    const now = Date.now();
    sessionStorage.setItem("premid_timestamp", String(now));
    sessionStorage.setItem("premid_last_game", String(gameId));
    return now;
}

presence.on("UpdateData", async () => {
    const { href, pathname } = window.location;
    const appId = localStorage.getItem("appId") ?? pathname.split("/").pop();

    /* ===== Dashboard ===== */
    if (href.includes("/dashboard")) {
        sessionStorage.removeItem("premid_timestamp");
        sessionStorage.removeItem("premid_last_game");

        presence.setActivity({
            details: "Main Page",
            state: "Browsing Games",
            largeImageKey: BOOSTEROID_LOGO,
            largeImageText: "Boosteroid"
        } as PresenceData);

        return;
    }

    /* ===== Streaming ===== */
    if (href.includes("/streaming/") && appId && appId !== "null") {
        try {
            const response = await fetch(
                `https://cloud.boosteroid.com/api/v1/boostore/applications/${appId}`
            );
            const result = await response.json();
            const game = result?.data;

            if (!game) return;

            const imagenFinal =
                typeof game.icon === "string"
                    ? game.icon.split("?")[0]
                    : BOOSTEROID_LOGO;

            const tiendas = game.stores
                ? Object.keys(game.stores)
                : [];

            const rawStore: string =
                tiendas.length > 0 && typeof tiendas[0] === "string"
                    ? tiendas[0]
                    : "default";

            let nombreTienda: string;
            switch (rawStore) {
                case "battlenet":
                case "battle-net":
                    nombreTienda = "Battle.net";
                    break;
                case "uplay":
                case "ubisoft-connect":
                    nombreTienda = "Ubisoft Connect";
                    break;
                case "wargamingnet":
                    nombreTienda = "Wargaming.net";
                    break;
                case "epic-games-store":
                    nombreTienda = "Epic Games Store";
                    break;
                case "origin":
                case "ea-app":
                case "fanatical":
                    nombreTienda = "EA App";
                    break;
                default:
                    nombreTienda = rawStore
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, l => l.toUpperCase());
            }

            const iconoPequeno =
                PLATFORM_ICONS[rawStore] ?? PLATFORM_ICONS.default;

            presence.setActivity({
                details: "Playing",
                state: game.name,
                largeImageKey: imagenFinal,
                largeImageText: game.name,
                smallImageKey: iconoPequeno,
                smallImageText: nombreTienda,
                startTimestamp: getTimestamp(appId)
            } as PresenceData);

        } catch {
            presence.clearActivity();
        }
    } else {
        presence.clearActivity();
    }
});

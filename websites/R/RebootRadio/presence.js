"use strict";
const presence = new Presence({
    clientId: "1274324682027434158"
});
const API = "https://rebootradio.uk/v3/api/stats";
presence.on("UpdateData", async () => {
    try {
        const data = await fetch(API).then(res => res.json());
        const title = data.song?.track || "Unknown Song";
        const artist = data.song?.artist || "Unknown Artist";
        presence.setActivity({
            type: 2,
            details: title,
            state: artist,
            largeImageKey: data.song?.art || "https://rebootradio.uk/favicon.ico",
            largeImageText: "Reboot Radio",
            buttons: [
                {
                    label: "Listen Live",
                    url: "https://rebootradio.uk"
                }
            ]
        });
    }
    catch (error) {
        console.error("Reboot Radio error:", error);
    }
});

const presence = new Presence({
    clientId: "1137362720254074972", // Client ID
});
const browsingTimestamp = Math.floor(Date.now() / 1000);

const animeicon = document.querySelector(".img-fluid.lozad");

presence.on("UpdateData", async () => {
    const presenceData: PresenceData = {
        startTimestamp: browsingTimestamp,
        largeImageKey: "https://i.imgur.com/xHce23t.png",
    };

    if (document.location.pathname === "/main2") {
        presenceData.details = "Viewing the home page";
    } else if (document.location.pathname.includes("/search/name/")) {
        presenceData.details = "Searching anime";
    } else if (document.location.pathname.includes("/chat")) {
        presenceData.details = "Writing in the chat";
    } else if (document.location.pathname.includes("/anime_list/")) {
        presenceData.details = "Browsing the anime list";
        const listlink = document.location.href;
        presenceData.buttons = [
            { label: "Anime List", url: listlink },
        ];
    } else if (document.location.pathname.includes("/anime")) {
        const anime = document.querySelector("#anime_name_id") as HTMLElement;
        if (anime) {
            presenceData.details = anime.innerText;
            presenceData.smallImageKey = "https://i.imgur.com/xHce23t.png";
            const animeLink = document.location.href;
            presenceData.buttons = [
                { label: "Watch Now", url: animeLink },
            ];

            const episodeNumber = parseInt(animeLink.split('/').pop() || "1");
            presenceData.state = `Episode ${episodeNumber}`;
        }

        if (animeicon) {
            presenceData.largeImageKey = animeicon
                .getAttribute("data-srcset")
                ?.split(" ")[0];
        }
    }
    
    // Set the activity
    presence.setActivity(presenceData);
});

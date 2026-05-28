const presence = new Presence({
    clientId: "1509466786779758674",
});

presence.on("UpdateData", async () => {
    const presenceData: PresenceData = {
        largeImageKey: "logo",
        startTimestamp: Math.floor(Date.now() / 1000),
        type: 3
    };

    // Megakino URL parsing and DOM scraping
    const path = document.location.pathname;
    
    if (path === "/" || path === "/index.php") {
        presenceData.details = "Browsing the catalog";
        presenceData.state = "Home";
    } else if (path.includes("/stream/")) {
        // Trying to extract title from og:title meta tag or document title
        const metaTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
        let title = metaTitle || document.title;
        
        // Clean up the title (e.g., removing " - Megakino" if it exists)
        title = title.replace(/ - Megakino.*$/i, "").trim();
        
        presenceData.details = "Watching";
        presenceData.state = title;
        
        // Try to get a poster image from the site
        const poster = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
        if (poster && poster.startsWith("http")) {
            // Using small image for the poster if available
            presenceData.smallImageKey = poster;
            presenceData.smallImageText = title;
        }
    } else if (path.includes("/search/")) {
        presenceData.details = "Searching for movies...";
    } else {
        presenceData.details = "Looking around";
    }

    if (presenceData.details) {
        presence.setActivity(presenceData);
    } else {
        presence.clearActivity();
    }
});

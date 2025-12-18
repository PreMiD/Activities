import Presence from "premid";

const presence = new Presence({
    clientId: "1017558325753303102"
});

// Salviamo il momento in cui l'utente ha aperto il sito
const browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
    // Recuperiamo il pathname (es: /dettagli.php, /player.php)
    const path = document.location.pathname;
    const href = document.location.href;

    // Dati di base (sempre presenti)
    let presencePayload: any = {
        largeImageKey: "logo_grande",
        startTimestamp: browsingTimestamp // Mostra "Trascorsi: XX min"
    };

    // 1. SE SIAMO NEL PLAYER (Guardando un episodio)
    const playerDiv = document.getElementById("premid-data");
    if (playerDiv && path.includes("player.php")) {
        presencePayload = {
            ...presencePayload,
            details: playerDiv.dataset.anime, // Titolo Anime
            state: `Episodio ${playerDiv.dataset.episode} | ${playerDiv.dataset.status}`, // Ep + Stato
            largeImageKey: "logo_grande", // O usa la copertina se carichi le url
            largeImageText: playerDiv.dataset.anime,
            smallImageKey: "play_icon", // Assicurati di caricare un'icona chiamata 'play_icon' su Discord o togli questa riga
            smallImageText: "In riproduzione",
            buttons: [
                { label: "Guarda Episodio", url: href },
                { label: "Scheda Anime", url: `https://animetvonline.org/dettagli.php?slug=${playerDiv.dataset.slug}` }
            ]
        };
    }

    // 2. SE SIAMO NELLA SCHEDA DETTAGLI (Stile AnimeWorld)
    else if (path.includes("dettagli.php")) {
        // Cerchiamo il titolo nella pagina dettagli (adatta il selettore se serve)
        const titleElement = document.querySelector("h1") || document.title;
        const title = (typeof titleElement === 'string') ? titleElement : titleElement.textContent;

        presencePayload = {
            ...presencePayload,
            details: "Sta guardando la scheda di:",
            state: title.replace("AnimeTvOnline - ", ""), // Puliamo il titolo
            smallImageKey: "info_icon", // Carica un'icona 'info_icon' o rimuovi
            smallImageText: "Info Anime",
            buttons: [
                { label: "Vedi Scheda", url: href }
            ]
        };
    }

    // 3. SE SIAMO NEL PROFILO UTENTE
    else if (path.includes("profilo.php")) {
        presencePayload = {
            ...presencePayload,
            details: "Visualizzando un profilo",
            state: "Profilo Utente",
            smallImageKey: "user_icon", // Carica 'user_icon' o rimuovi
            smallImageText: "Profilo"
        };
    }

    // 4. SE SIAMO NELLA HOME
    else if (path === "/" || path.includes("index.php")) {
        presencePayload = {
            ...presencePayload,
            details: "In Homepage",
            state: "Cercando un anime da guardare...",
            buttons: [
                { label: "Visita il sito", url: "https://animetvonline.org" }
            ]
        };
    }

    // 5. QUALSIASI ALTRA PAGINA
    else {
        presencePayload = {
            ...presencePayload,
            details: "Navigando su AnimeTvOnline",
            state: "Esplorando il sito..."
        };
    }

    return presencePayload;
});

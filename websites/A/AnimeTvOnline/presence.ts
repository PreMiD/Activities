// @ts-ignore
import { Presence } from "premid";

const presence = new Presence({
    clientId: "1017558325753303102"
});

// Salviamo l'orario di inizio per mostrare "Trascorsi: XX min"
const browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
    const dataDiv = document.getElementById("premid-data");
    const path = document.location.pathname;
    const href = document.location.href;

    // Impostazioni base (sempre presenti)
    const presencePayload: any = {
        largeImageKey: "logo_grande",
        startTimestamp: browsingTimestamp
    };

    // 1. SE SIAMO NEL PLAYER (L'utente è loggato e sta guardando)
    // Il div 'premid-data' esiste solo se il player.js lo ha creato
    if (dataDiv && (path.includes("player") || href.includes("episodio"))) {
        presencePayload.details = dataDiv.dataset.anime; // Titolo Anime
        presencePayload.state = `Episodio ${dataDiv.dataset.episode}`; // Numero Episodio
        presencePayload.largeImageText = dataDiv.dataset.anime;
        
        // Bottoni
        presencePayload.buttons = [
            {
                label: "Guarda Episodio",
                url: href
            },
            {
                label: "Scheda Anime",
                url: `https://animetvonline.org/dettagli.php?slug=${dataDiv.dataset.slug}`
            }
        ];

        return presencePayload;
    }

    // 2. SE SIAMO NELLA SCHEDA DETTAGLI
    if (path.includes("dettagli")) {
        // Cerchiamo il titolo nella pagina (fallback al document.title se h1 non c'è)
        const titleElement = document.querySelector("h1");
        const title = titleElement ? titleElement.textContent : document.title;
        
        presencePayload.details = "Sta guardando la scheda di:";
        presencePayload.state = title.replace("AnimeTvOnline - ", "").trim();
        presencePayload.buttons = [
            {
                label: "Vedi Scheda",
                url: href
            }
        ];

        return presencePayload;
    }

    // 3. SE SIAMO NEL PROFILO UTENTE
    if (path.includes("profilo")) {
        presencePayload.details = "Visualizzando un profilo";
        presencePayload.state = "Utente AnimeTvOnline";
        return presencePayload;
    }

    // 4. SE SIAMO NELLA HOMEPAGE (o Login)
    if (path === "/" || path.includes("index") || path === "" || path.includes("login")) {
        presencePayload.details = "In Homepage";
        presencePayload.state = "Cercando un anime da guardare...";
        presencePayload.buttons = [
            {
                label: "Visita il sito",
                url: "https://animetvonline.org"
            }
        ];
        return presencePayload;
    }

    // 5. DEFAULT (Tutte le altre pagine)
    presencePayload.details = "Navigando su AnimeTvOnline";
    presencePayload.state = "Streaming Anime ITA";
    
    return presencePayload;
});

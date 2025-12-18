import { Presence } from "premid";

const presence = new Presence({
    clientId: "1017558325753303102"
});

presence.on("UpdateData", async () => {
    const dataDiv = document.getElementById("premid-data");

    // 1. Se siamo nel Player (il div nascosto esiste)
    if (dataDiv) {
        const animeTitle = dataDiv.dataset.anime;
        const episodeNum = dataDiv.dataset.episode;
        const slug = dataDiv.dataset.slug;
        
        return {
            largeImageKey: "logo_grande", // Assicurati di aver chiamato l'immagine così su Discord Dev Portal
            largeImageText: animeTitle,
            details: animeTitle, // Prima riga: Titolo Anime
            state: `Guardando l'episodio ${episodeNum}`, // Seconda riga: Stato
            buttons: [
                {
                    label: "Guarda anche tu",
                    url: document.location.href // Link dell'episodio
                },
                {
                    label: "Scheda Anime",
                    url: `https://animetvonline.org/dettagli.php?slug=${slug}`
                }
            ]
        };
    }

    // 2. Se siamo nella Home o altre pagine
    if (document.location.pathname === "/" || document.location.pathname === "/index.php") {
        return {
            largeImageKey: "logo_grande",
            details: "Navigando nella Home",
            state: "Cercando un anime...",
            buttons: [
                {
                    label: "Visita il sito",
                    url: "https://animetvonline.org"
                }
            ]
        };
    }
});
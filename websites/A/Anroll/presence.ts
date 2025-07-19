const presence = new Presence({
    clientId: "1395970198405644350"
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
    const presenceData: PresenceData = {
        largeImageKey: "logo",
        startTimestamp: browsingTimestamp
    };

    // Página inicial
    if (document.location.pathname === "/") {
        presenceData.details = "Na página inicial";
    }
    
    // Navegação
    else if (document.location.pathname.includes("/animes")) {
        presenceData.details = "Procurando animes";
        presenceData.smallImageKey = "search";
    }
    else if (document.location.pathname.includes("/mangas")) {
        presenceData.details = "Procurando mangás";
        presenceData.smallImageKey = "search";
    }
    
    // Assistindo anime
    else if (document.location.pathname.includes("/anime/") && document.location.pathname.includes("/assistir")) {
        const animeTitle = document.querySelector("h1.title")?.textContent || "Anime desconhecido";
        const episodeInfo = document.querySelector("span.episode")?.textContent || "Episódio desconhecido";
        
        presenceData.details = `Assistindo: ${animeTitle}`;
        presenceData.state = episodeInfo;
        presenceData.smallImageKey = "play";
        presenceData.buttons = [
            {
                label: "Assistir Anime",
                url: document.location.href
            }
        ];
    }
    
    // Lendo mangá
    else if (document.location.pathname.includes("/manga/") && document.location.pathname.includes("/ler")) {
        const mangaTitle = document.querySelector("h1.title")?.textContent || "Mangá desconhecido";
        const chapterInfo = document.querySelector("span.chapter")?.textContent || "Capítulo desconhecido";
        
        presenceData.details = `Lendo: ${mangaTitle}`;
        presenceData.state = chapterInfo;
        presenceData.smallImageKey = "reading";
        presenceData.buttons = [
            {
                label: "Ler Mangá",
                url: document.location.href
            }
        ];
    }
    
    // Perfil
    else if (document.location.pathname.includes("/perfil")) {
        const username = document.querySelector("h2.username")?.textContent || "Usuário";
        presenceData.details = "Vendo perfil";
        presenceData.state = username;
    }

    // Se nenhum match
    if (!presenceData.details) {
        presenceData.details = "Navegando";
        presenceData.state = document.title.replace(" - Anroll", "");
    }

    presence.setActivity(presenceData);
});
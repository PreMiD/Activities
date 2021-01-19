const presence = new Presence({
    clientId: "801135853433913394"
})

/**
 * Get Timestamps
 * @param {Number} videoTime Current video time seconds
 * @param {Number} videoDuration Video duration seconds
 */



let lastPlaybackState = null,
    playback,
    browsingStamp = Math.floor(Date.now() / 1000);

if (lastPlaybackState != playback) {
  lastPlaybackState = playback;
  browsingStamp = Math.floor(Date.now() / 1000);
}
presence.on("UpdateData", async () => {

  const presenceData: PresenceData = {
    largeImageKey: "at_lg"
  },tempo = Math.floor(Date.now() / 1000),
    path = document.location.pathname,
    titulo = document.title

  
  if (titulo.includes("Resultados da pesquisa")) {
    let result = document.querySelector("body > div.pagAniTitulo > div > h1").textContent
    presenceData.details = "Página de Busca";
    presenceData.state = "Pesquisando: " + result.replace("Você pesquisou por:", "");
    presenceData.startTimestamp = tempo;
  }
  if (path == "/lista-de-animes-online/"){
    presenceData.details = "Animes Legendados";
    presenceData.startTimestamp = tempo;
  }
  if (path == "/lista-de-animes-dublados-online/"){
    presenceData.details = "Animes Dublados";
    presenceData.startTimestamp = tempo;
  }
  if (path == "/lista-de-generos-online/"){
    presenceData.details = "Gêneros";
    presenceData.startTimestamp = tempo;
  }
  if (path == "/calendario/"){
    presenceData.details = "Calendário de Animes";
    presenceData.startTimestamp = tempo;
  }
  if (titulo.includes("Todos os Epi")) {
    let nameAni = document.querySelector("body > div.pagAniTitulo > div > h1").textContent,
        genrAni = document.querySelector("#anime > div.animeFlexContainer > div.right > div > div:nth-child(2)").textContent
    presenceData.details = nameAni.replace(" – Todos os Episódios", "");
    presenceData.state = genrAni
    presenceData.startTimestamp = tempo;
  }
  if(titulo.includes(" – Episód")){
    const AniN = document.querySelector("body > div.pagEpiTitulo > div > h1").textContent.split(" ")
        .join(" ")
        .replace(" HD", "")
        .replace(" [SEM CENSURA]", "")
        .slice(0, -2)
        .replace(" – Episódio", "")
    const AniEp = document.querySelector("body > div.pagEpiTitulo > div > h1").textContent.replace(AniN, "")
    presenceData.details = AniN;
    presenceData.state = AniEp.replace(" – Episódio", "Episódio: ");
    presenceData.smallImageKey = "pause";
    presenceData.smallImageText = "Pausado";

    playback =
    (document.querySelector(".vjs-current-time-display") ||
      document.querySelector(".jw-text-elapsed")) !== null
      ? true
      : false;

  const video: HTMLVideoElement = document.querySelector(".jw-video");

    if (video !== null && !isNaN(video.duration)) {
      let videoTitle,
          seasonepisode;

      videoTitle = AniN;
      seasonepisode = AniEp.replace("– ", "").replace(" [SEM CENSURA]", "");

      let timestamps = presence.getTimestamps(
        Math.floor(video.currentTime),
        Math.floor(video.duration)
      );
      presenceData.smallImageKey = video.paused ? "pause" : "play";
      presenceData.smallImageText = video.paused
        ? "Pausado"
        : "Assistindo";
      presenceData.startTimestamp = timestamps[0];
      presenceData.endTimestamp = timestamps[1];

      presence.setTrayTitle(video.paused ? "" : videoTitle);

      presenceData.details = videoTitle;
      presenceData.state = seasonepisode;

      if (video.paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }
    }
  }
  if (presenceData.details == null) {
    presence.setTrayTitle();
    presence.setActivity();
  } else {
    presence.setActivity(presenceData);
  }
  //presence.setActivity(presenceData);
});

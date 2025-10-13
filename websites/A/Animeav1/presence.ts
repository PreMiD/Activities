import { getTimestamps } from "premid"

const presence = new Presence({
  clientId: "1427343657572503634" // Reemplaza con el Client ID real de Discord
})

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "logo",
    smallImageKey: "play",
    smallImageText: "Animeav1"
  }

  // Detectar si estamos en una página de anime
  const video = document.querySelector<HTMLVideoElement>("video") || 
                document.querySelector<HTMLVideoElement>("iframe video") ||
                document.querySelector<HTMLVideoElement>(".video-player video") ||
                document.querySelector<HTMLVideoElement>("#player video")
  
  if (video) {
    if (!video.paused && video.currentTime > 0) {
      presenceData.details = "Viendo anime"
      presenceData.state = document.title.replace(" - Animeav1", "").replace(" - AnimeAV1", "")
      presenceData.smallImageKey = "play"
      presenceData.smallImageText = "Reproduciendo"
      
      // Agregar timestamps si el video tiene duración
      if (!isNaN(video.duration) && video.duration > 0) {
        const timestamps = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration)
        )
        presenceData.startTimestamp = timestamps[0]
        presenceData.endTimestamp = timestamps[1]
      }
    } else if (video.paused && video.currentTime > 0) {
      presenceData.details = "Pausado"
      presenceData.state = document.title.replace(" - Animeav1", "").replace(" - AnimeAV1", "")
      presenceData.smallImageKey = "pause"
      presenceData.smallImageText = "Pausado"
    } else {
      presenceData.details = "Cargando video"
      presenceData.state = document.title.replace(" - Animeav1", "").replace(" - AnimeAV1", "")
      presenceData.smallImageKey = "play"
      presenceData.smallImageText = "Cargando"
    }
  } else {
    presenceData.details = "Navegando en Animeav1"
    presenceData.state = document.title.replace(" - Animeav1", "").replace(" - AnimeAV1", "")
  }

  presence.setActivity(presenceData)
})

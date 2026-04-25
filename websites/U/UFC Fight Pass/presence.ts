import { Assets } from "premid"

const presence = new Presence({
  clientId: "1492178685946499122",
})

const IMAGE_KEY = "fightpassufc"
const START_KEY = "ufc_start_time"
const VIDEO_KEY = "ufc_video_id"

function getMode(video: HTMLVideoElement, title: string) {
  if (video.duration === Infinity || title.includes("live")) return "LIVE"
  if (title.includes("highlight")) return "HIGHLIGHTS"
  return "REPLAY"
}

presence.on("UpdateData", async () => {
  const now = Math.floor(Date.now() / 1000)
  const video = document.querySelector("video") as HTMLVideoElement | null
  const title = document.title.trim()

  const presenceData: PresenceData = {
    largeImageKey: "https://i.imgur.com/hVg7eP2.jpg",
    smallImageKey: Assets.Play,
  }

  // 🏠 HOME
  if (!video) {
    sessionStorage.removeItem(START_KEY)
    sessionStorage.removeItem(VIDEO_KEY)

    presenceData.details = "Homepage"
    presenceData.state = "Browsing fights"

    presence.setActivity(presenceData)
    return
  }

  const videoId = video.currentSrc || location.href
  const savedVideoId = sessionStorage.getItem(VIDEO_KEY)

  let startTimestamp = Number(sessionStorage.getItem(START_KEY))

  if (
    savedVideoId !== videoId ||
    !Number.isFinite(startTimestamp) ||
    startTimestamp <= 0
  ) {
    startTimestamp = now
    sessionStorage.setItem(START_KEY, String(startTimestamp))
    sessionStorage.setItem(VIDEO_KEY, videoId)
  }

  const mode = getMode(video, title.toLowerCase())
  const isPaused = video.paused

  presenceData.details = isPaused ? `Paused (${mode})` : `Watching (${mode})`
  presenceData.state = title
  presenceData.smallImageKey = isPaused ? Assets.Pause : Assets.Play

  // ⏱ TIMER
  presenceData.startTimestamp = startTimestamp

  // 🔥 PROGRESS BAR (REPLAY ONLY)
  if (mode === "REPLAY" && isFinite(video.duration)) {
    presenceData.endTimestamp =
      startTimestamp + Math.floor(video.duration - video.currentTime)
  }

  presence.setActivity(presenceData)
})
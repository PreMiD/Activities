import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1037219986378338305',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
/// ok
enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://raw.githubusercontent.com/vintheweirdass/sekolahmu-premid-assets/refs/heads/main/images/logo-v2.png',
}
enum LocalAssets {
  Viewing = Assets.Viewing,
  WatchingLive = Assets.VideoCall,
  Working = Assets.Writing,
  Search = Assets.Search,
}
presence.on('UpdateData', () => {
  // sekolahmu is SSR'ed, so sometimes the previous data can showed up unexpectedly. 
  // we need to make a pause for some milliseconds to prevent that
  setTimeout(async () => {
    const presenceData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
      state: "Viewing LMS",
      smallImageKey: Assets.Search,
    }
    if (window.document.location.hostname === "www.sekolah.mu") {
      if (!window.document.location.pathname.startsWith("/aktivitas")) {
        if (window.document.location.pathname === "/") {
          presenceData.state = "Viewing the homepage"
        } else if (window.document.location.pathname.startsWith("/rapor")) {
          // presenceData.buttons= [
          //   {
          //     label: "Go to the report card",
          //     url: "https://sekolah.mu"+document.location.pathname
          //   },
          // ]
          presenceData.state = "Viewing the report card"
        } else if (window.document.location.pathname.startsWith("/kelasku")) {
          const params = new URLSearchParams(window.document.location.search)
          presenceData.state = (params.get("page")??"")==="aktivitas-tambahan"?"Viewing the add-on classes":"Viewing the classes"
        } else if (window.document.location.pathname.startsWith("/dashboard")) { 
          presenceData.state = "Viewing the dashboard"
          presenceData.smallImageKey = Assets.Viewing
        } else if (window.document.location.pathname.startsWith("/notifikasi")) {
          presenceData.state = "Viewing the notifications"
          presenceData.smallImageKey = Assets.Viewing
        }
        await presence.setActivity(presenceData)
        return
      }
      const baseApp = "div#base-app"
      const asesmenPanel = baseApp+" div.activity-v2-layout div.main div.outer-content"
      const asemenName = document.querySelector(asesmenPanel+" > div.activity-v2-content div.activity-v2-banner > h2")?.textContent ?? "<loading..>"
      const getNav = (name:string):boolean=>{
        return [...window.document.querySelectorAll(asesmenPanel+' > div.activity-v2-content div.inner-content > div.tabs > div.activity-v2-tab-menu > ul.nav.nav-tabs > li.nav-item > a')].some((e)=>{return e.innerHTML.includes(name)})
      }
      const programName = window.document.querySelector("div#base-app div.activity-v2-layout div.main > div#activity-navbar-wrapper-v2 nav#activity-navbar-v2 a#activity-name-desktop")?.textContent ?? "<loading..>"
      const asesmenTugasNotStarted = (!!window.document.querySelector(asesmenPanel+" div.quiz-intro-v2"))
      //const asesmenNotStarted = true
      presenceData.smallImageText = programName
      if (asesmenTugasNotStarted) {
        presenceData.details = "Viewing homework preview of:"
        presenceData.smallImageKey = Assets.Viewing
      } else if (getNav("Tugas")) {
        presenceData.details = "Working on homework:"
        presenceData.smallImageKey = Assets.Writing
      } else if (getNav("Pertemuan")) {
        presenceData.details = "Watching meeting of:"
        presenceData.smallImageKey = Assets.VideoCall
      } else {
        presenceData.details = "Viewing material:"
        presenceData.smallImageKey = Assets.Viewing
      }
      presenceData.state = asemenName
      // presenceData.buttons= [
      //   {
      //     label: "Go to assessment",
      //     url: "https://sekolah.mu"+window.document.location.pathname
      //   },
      // ]
    }

    await presence.setActivity(presenceData)
  }, 500)
})

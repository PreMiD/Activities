import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1037219986378338305',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/sekolahmu/assets/logo.png',
}
presence.on('UpdateData', () => {
  // sekolahmu is SSR'ed, so sometimes the previous data can showed up unexpectedly.
  // we need to make a pause for some milliseconds to prevent that
  setTimeout(async () => {
    const presenceData: PresenceData = {
      largeImageKey: ActivityAssets.Logo,
      startTimestamp: browsingTimestamp,
      state: 'Viewing LMS',
      smallImageKey: Assets.Search,
    }
    const { hostname, pathname, search } = document.location
    if (hostname === 'www.sekolah.mu') {
      if (!pathname.startsWith('/aktivitas')) {
        if (pathname === '/') {
          presenceData.state = 'Viewing the homepage'
        }
        else if (pathname.startsWith('/kelasku')) {
          const params = new URLSearchParams(search)
          presenceData.state = (params.get('page') ?? '') === 'aktivitas-tambahan' ? 'Viewing the add-on classes' : 'Viewing the classes'
        }
        else if (pathname.startsWith('/laporan-belajar')) {
          presenceData.state = 'Viewing the learning report'
          presenceData.smallImageKey = Assets.Viewing
        }
        else if (pathname.startsWith('/rapor')) {
          presenceData.state = 'Viewing the report card'
          presenceData.smallImageKey = Assets.Viewing
        }
        else if (pathname.startsWith('/dashboard')) {
          presenceData.state = 'Viewing the dashboard'
          presenceData.smallImageKey = Assets.Viewing
        }
        else if (pathname.startsWith('/notifikasi')) {
          presenceData.state = 'Viewing the notifications'
        }
        await presence.setActivity(presenceData)
        return
      }
      const baseApp = 'div#base-app'
      const asesmenPanel = `${baseApp} div.activity-v2-layout div.main div.outer-content`
      const asesmenName = document.querySelector(`${asesmenPanel} > div.activity-v2-content div.activity-v2-banner > h2`)?.textContent ?? '<loading..>'
      const getNav = (...name: [string, ...string[]]): boolean => {
        return [...document.querySelectorAll(`${asesmenPanel} > div.activity-v2-content div.inner-content > div.tabs > div.activity-v2-tab-menu > ul.nav.nav-tabs > li.nav-item > a`)].some((e) => {
          for (let i = 0; i < name.length; i++) {
            if (e.innerHTML.includes(name[i]!)) {
              return true
            }
          }
          return false
        })
      }
      const programName = document.querySelector('div#base-app div.activity-v2-layout div.main > div#activity-navbar-wrapper-v2 nav#activity-navbar-v2 a#activity-name-desktop')?.textContent ?? '<loading..>'
      const asesmenTugasNotStarted = (!!document.querySelector(`${asesmenPanel} div.quiz-intro-v2`))
      // const asesmenNotStarted = true
      presenceData.smallImageText = programName
      if (asesmenTugasNotStarted) {
        presenceData.details = 'Viewing homework preview of:'
        presenceData.smallImageKey = Assets.Viewing
      }
      else if (getNav('Tugas', 'Kuis')) {
        presenceData.details = 'Working on homework:'
        presenceData.smallImageKey = Assets.Writing
      }
      else if (getNav('Pertemuan')) {
        presenceData.details = 'Watching meeting of:'
        presenceData.smallImageKey = Assets.VideoCall
      }
      else {
        presenceData.details = 'Viewing material:'
        presenceData.smallImageKey = Assets.Viewing
      }
      presenceData.state = asesmenName
    }

    await presence.setActivity(presenceData)
  }, 500)
})

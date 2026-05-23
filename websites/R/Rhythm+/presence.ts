import { Assets } from 'premid'

const script = document.createElement('script')
script.textContent = `
setInterval(() => {
window.postMessage({ type: "pmd-receive-info", songInfo: document.querySelector(".game")?.__vue__?.currentSong, sheetInfo: document.querySelector(".game")?.__vue__?.currentSheet }, "*");
}, 100);
`
document.head.appendChild(script)

const presence = new Presence({
  clientId: '1331320284325740595',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let songInfo: SongInfo, sheetInfo: SheetInfo

window.addEventListener('message', (e) => {
  if (e.data.type === 'pmd-receive-info')
    ({ songInfo, sheetInfo } = e.data)
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/R/Rhythm%2B/assets/logo.png',
}

interface SheetInfo {
  difficulty: number
  length: number
  keys: number
  noteCount: number
}

interface SongInfo {
  title: string
  subtitle: string
  image: string
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (document.querySelector('.profile_card')) {
    presenceData.smallImageKey
      = document.querySelector<HTMLImageElement>('.profile_card img')?.src
        ?? Assets.Question
    presenceData.smallImageText
      = document
        .querySelector('.profile_card .detail')
        ?.firstChild
        ?.textContent
        ?.trim() ?? 'Unknown'
  }
  switch (document.location.pathname.split('/')[1]) {
    case '': {
      presenceData.details = 'Viewing homepage'
      break
    }
    case 'menu': {
      presenceData.details = 'Browsing songs'
      presenceData.state = document.querySelector('.cat_tab.active')
      if (!presenceData.state)
        return
      break
    }
    case 'tutorial': {
      presenceData.details = 'Playing the tutorial'
      break
    }
    case 'game': {
      if (!songInfo || !sheetInfo)
        return
      presenceData.details = `${songInfo?.title} ${
        songInfo?.subtitle ? ` (${songInfo?.subtitle})` : ''
      }`
      presenceData.state = `Diff ${sheetInfo?.difficulty} | ${
        Math.floor(sheetInfo?.length / 60).toString().length === 1 ? '0' : ''
      }${Math.floor(sheetInfo?.length / 60)}:${
        Math.floor(sheetInfo?.length % 60).toString().length === 1 ? '0' : ''
      }${Math.floor(sheetInfo?.length % 60)} | ${sheetInfo?.keys} Keys | ${
        sheetInfo?.noteCount
      } Notes`
      presenceData.largeImageKey = songInfo?.image ?? ActivityAssets.Logo
      presenceData.buttons = [
        {
          label: 'Play Song',
          url: document.location.href,
        },
      ]
      if (presenceData.details === 'Game')
        return
      break
    }
    case 'result': {
      presenceData.details = 'Viewing results'
      presenceData.state = `${
        document.querySelector('.score')?.textContent
      } | ${document.querySelector('.title')?.textContent}`
      presenceData.buttons = [
        {
          label: 'View Results',
          url: document.location.href,
        },
      ]
      if (!document.querySelector('.title'))
        return
      break
    }
    case 'game-over': {
      presenceData.details = 'Game Over'
      break
    }
    case 'studio': {
      presenceData.details = 'Viewing their studio'
      break
    }
    case 'editor': {
      presenceData.details = 'Editing a song'
      break
    }
    case 'account': {
      presenceData.details = 'Viewing settings'
      break
    }
    default: {
      presenceData.details = document.location.pathname
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
})

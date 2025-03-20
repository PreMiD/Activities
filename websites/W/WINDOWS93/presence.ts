import { Assets } from 'premid'

const presence = new Presence({
  clientId: '841014953439264841',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  LogoWhite = 'https://cdn.rcd.gg/PreMiD/websites/W/WINDOWS93/assets/logo.png',
  LogoBlack = 'https://cdn.rcd.gg/PreMiD/websites/W/WINDOWS93/assets/0.png',
}

let iFrameData = {
  minesweeper: {
    time: 0,
    bombs: 0,
    gameState: '',
  },
  bananamp: {
    title: '',
    playing: false,
  },
  defrag: {
    progress: '',
    playing: false,
    started: false,
  },
  solitude: {
    stack1: '',
    stack2: '',
    stack3: '',
    stack4: '',
  },
  maze: {
    distance: '',
  },
  wlc: {
    currentTime: 0,
    duration: 0,
    paused: false,
  },
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    iFrameData = data as typeof iFrameData
  },
)

presence.on('UpdateData', async () => {
  const [time, logo] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<number>('logo'),
  ])
  const presenceData: PresenceData = {
    largeImageKey: logo ? ActivityAssets.LogoBlack : ActivityAssets.LogoWhite,
    startTimestamp: browsingTimestamp,
  }
  const activeWindow = document.querySelector('.ui_window--active')

  presenceData.details = `Viewing ${
    activeWindow?.querySelector('.ui_window__head__title')?.textContent
    ?? 'Desktop'
  }`
  presenceData.smallImageKey = activeWindow?.querySelector<HTMLImageElement>(
    '.ui_window__head__icon',
  )

  switch (activeWindow?.querySelector('.ui_window__head__title')?.textContent) {
    case 'BrianSweeper': {
      presenceData.state = `Bombs:${iFrameData.minesweeper.bombs} Time:${iFrameData.minesweeper.time} ${iFrameData.minesweeper.gameState}`
      break
    }
    case 'Bananamp': {
      presenceData.state = `Playing ${iFrameData.bananamp.title}`
      presenceData.smallImageKey = iFrameData.bananamp.playing
        ? Assets.Play
        : Assets.Pause
      presenceData.smallImageText = iFrameData.bananamp.playing
        ? 'Playing'
        : 'Paused'
      break
    }
    case 'Defrag': {
      if (iFrameData.defrag.started)
        presenceData.state = `Progress: ${iFrameData.defrag.progress}`
      if (!iFrameData.defrag.playing) {
        presenceData.smallImageKey = Assets.Pause
        presenceData.smallImageText = 'Paused'
      }
      break
    }
    case 'Solitude': {
      presenceData.state = `${iFrameData.solitude.stack1} ${iFrameData.solitude.stack2} ${iFrameData.solitude.stack3} ${iFrameData.solitude.stack4}`
      break
    }
    case 'Maze 3D': {
      presenceData.state = iFrameData.maze.distance
      break
    }
    case 'WideoLAN': {
      if (!iFrameData.wlc.paused) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          iFrameData.wlc.currentTime,
          iFrameData.wlc.duration,
        )
      }
      presenceData.smallImageKey = iFrameData.wlc.paused
        ? Assets.Pause
        : Assets.Play
      presenceData.smallImageText = iFrameData.wlc.paused
        ? 'Paused'
        : 'Playing'
      break
    }
    case 'HYDRA': {
      presenceData.state = `${
        document.querySelectorAll('.virus--hydra').length
      } window${
        document.querySelectorAll('.virus--hydra').length !== 1 ? 's' : ''
      }`
      break
    }
  }

  if (!time) {
    delete presenceData.startTimestamp
    delete presenceData.endTimestamp
  }

  presence.setActivity(presenceData)
})

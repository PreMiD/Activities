import type { ComposerAudioDB, ComposerLyricsDB } from './types.js'
import { ActivityType, Assets, getTimestamps } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Composer%20TTML/assets/logo.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

async function readDB(db: IDBDatabase, storeName: string, key: string): Promise<any> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly')
      const getAudio = tx.objectStore(storeName).get(key)
      getAudio.onsuccess = () => resolve(getAudio.result)
      getAudio.onerror = () => resolve(null)
    }
    catch {
      resolve(null)
    }
  })
}

async function updatePresence() {
  const presenceData: PresenceData = {
    name: 'Composer',
    type: ActivityType.Listening,
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageKey: Assets.Writing,
  }

  // check what the user is ACTUALLY doing
  const tabButtons = Array.from(document.querySelectorAll(`nav[data-tour="tab-bar"]>button`))
  const active = tabButtons.find(btn => !btn.classList.contains('text-composer-text-muted'))

  if (active) {
    const btnInfo = active.getAttribute('data-tour')
    if (btnInfo === 'tab-import') {
      presenceData.details = 'Import'
      presenceData.state = 'Importing music'
    }
    else if (btnInfo === 'tab-edit') {
      presenceData.details = 'Edit'
      presenceData.state = 'Editing lyrics'
    }
    else if (btnInfo === 'tab-sync') {
      presenceData.details = 'Sync'
      presenceData.state = 'Synchronizing lyrics'
    }
    else if (btnInfo === 'tab-timeline') {
      presenceData.details = 'Timeline'
      presenceData.state = 'Adjusting lyric sync'
    }
    else if (btnInfo === 'tab-preview') {
      presenceData.details = 'Preview'
      presenceData.state = 'Previewing synced lyrics'
    }
    else if (btnInfo === 'tab-export') {
      presenceData.details = 'Export'
      presenceData.state = 'Exporting lyrics'
    }
  }

  // detect if user is playing the audio
  const audioPlayback: HTMLAudioElement | null = document.getElementById('composer-audio') as HTMLAudioElement
  if (audioPlayback) {
    // playing
    if (!audioPlayback.paused) {
      const timestamps = getTimestamps(audioPlayback.currentTime, audioPlayback.duration)
      presenceData.name += ' (Playing)'
      presenceData.startTimestamp = timestamps[0]
      presenceData.endTimestamp = timestamps[1]
    }

    // paused
    if (audioPlayback.paused) {
      presenceData.name = 'Composer'
      presenceData.startTimestamp = browsingTimestamp
      presenceData.endTimestamp = undefined
    }
  }

  // count lines and check for audio metadata
  try {
    const db = await new Promise<IDBDatabase | null>((resolve) => {
      const req = indexedDB.open('ttml-composer')
      req.onsuccess = e => resolve((e.target as any).result)
      req.onerror = () => resolve(null)
    })

    if (db) {
      const storeName = db.objectStoreNames.contains('projects') && 'projects'
      if (storeName) {
        const result: ComposerLyricsDB | null = await readDB(db, storeName, 'current')
        const audio: ComposerAudioDB | null = await readDB(db, storeName, 'current-audio')

        if (result) {
          presenceData.details += ` | ${result.lines.length} lines`
        }

        if (audio) {
          presenceData.largeImageText = audio.name
        }
      }
    }
  }
  catch {
    // Ignore IDB errors
  }

  // set the status!!
  presence.setActivity(presenceData)
}

presence.on('UpdateData', updatePresence)

// updater
document.addEventListener('click', updatePresence)

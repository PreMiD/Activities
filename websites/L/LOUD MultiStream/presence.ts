import { ActivityType } from 'premid'

// Presence is a global class in PreMiD environment

const presence = new Presence({
  clientId: '1469090046014525493',
})

// We can define some assets here if we uploaded them to PreMiD's CDN or use external URLs if supported (PreMiD usually requires CDN).
// For local testing, images might not show up perfectly without a valid clientId/Assets.

presence.on('UpdateData', async () => {
  const el = document.getElementById('premid-data')
  if (!el)
    return

  const dataStr = el.dataset.json
  if (!dataStr)
    return

  try {
    const data = JSON.parse(dataStr)
    // data structure: { count: number, streamers: [{ name, platform }] }

    if (data.count === 0) {
      // Not watching anything or just chatting
      presence.setActivity({
        type: ActivityType.Watching,
        details: 'In Chat',
        state: 'No streams visible',
        largeImageKey: 'logo', // Assuming 'logo' is a generic asset
      })
    }
    else {
      const names = data.streamers.map((s: any) => s.name).join(', ')
      const platforms = [...new Set(data.streamers.map((s: any) => s.platform))].join(', ')

      presence.setActivity({
        type: ActivityType.Watching,
        details: `Watching ${data.count} Streamer${data.count > 1 ? 's' : ''}`,
        state: `${names} on ${platforms}`,
        largeImageKey: 'https://i.imgur.com/sxoxOlW.png',
        largeImageText: 'LOUD MultiStream',
        // smallImageKey: 'https://cdn.rcd.gg/PreMiD.png', // Optional: Use a generic icon if needed
        // PreMiD/Discord expects Seconds, Date.now() is MS
        startTimestamp: data.startedAt ? Math.floor(data.startedAt / 1000) : undefined,
      })

      // To fix timestamp resetting:
      // We can check if 'startTimestamp' is already set in presence state, if so, keep it?
      // PreMiD presence object doesn't easily expose "current displayed activity".
      // A better way is to rely on the App passing a "sessionStart" timestamp.
    }
  }
  catch (e) {
    console.error('PreMiD Parse Error', e)
  }
})

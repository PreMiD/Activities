import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1387156126650597457',
})

window.addEventListener('message', (event) => {
  const msg = event.data

  // Ensure the message is from the correct source and has the expected structure
  if (
    msg.type !== 'playing_status'
    || msg.service !== 'LofiHaven'
    || !msg.data
  ) {
    return
  }

  const data = msg.data

  // If the data object is empty, clear the presence and stop
  if (Object.keys(data).length === 0) {
    presence.setActivity({})
    return
  }

  // Determine the activity type based on the details
  let activityType = ActivityType.Playing
  if (typeof data.playing_details === 'string') {
    const detailsLower = data.playing_details.toLowerCase()
    if (detailsLower.includes('listening')) {
      activityType = ActivityType.Listening
    }
    else if (detailsLower.includes('watching')) {
      activityType = ActivityType.Watching
    }
  }

  // Prepare the rich presence data from the message payload
  const presenceData: any = {
    details: data.playing_details || undefined,
    state: data.playing_state || undefined,
    largeImageKey: 'https://cynmqjmtk2ojy1db.public.blob.vercel-storage.com/lofihaven_logo_512x512-pwsoTs1SLgmnBZN0E3iaRcozmXgWFn.png',
    largeImageText: 'LofiHaven',
    startTimestamp: data.start_timestamp || undefined,
    buttons: [
      { label: 'Visit LofiHaven', url: 'https://lofihaven.xyz' },
      { label: 'Join the Community', url: 'https://discord.gg/EK7n8SsPVH' },
    ],
  }

  // Set the type for special activities like Listening or Watching
  if (
    activityType === ActivityType.Listening
    || activityType === ActivityType.Watching
  ) {
    presenceData.type = activityType
  }

  // Set the final activity on Discord
  presence.setActivity(presenceData)
})

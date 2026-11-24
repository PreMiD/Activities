const presence = new Presence({
  clientId: '587347620574265498',
})

let presenceData: PresenceData | null = null

presence.on('UpdateData', async () => {
  if (!presenceData || !presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})

presence.on('iFrameData', (data: unknown) => {
  presenceData = data as PresenceData
})

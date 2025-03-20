const presence = new Presence({
  clientId: '555834227833307146',
})

presence.on('UpdateData', async () => {
  const presenceData = await presence.getPageletiable<{ data: PresenceData }>(
    'PreMiD_PresenceData',
  )

  if (!presenceData)
    presence.setActivity()
  else presence.setActivity(presenceData.data)
})

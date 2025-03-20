const presence = new Presence({
  clientId: '798368817318330400',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Tokopedia/assets/logo.png',
  }
  const elapsed = Math.floor(Date.now() / 1000)
  if (document.location.hostname === 'www.tokopedia.com') {
    if (document.location.pathname.includes('/p?nref=')) {
      presenceData.details = 'Viewing Product List....'
      presenceData.startTimestamp = elapsed
      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/mitra')) {
      presenceData.details = 'Viewing a Tokopedia Partner....'
      presenceData.startTimestamp = elapsed
      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/promo')) {
      presenceData.details = 'Viewing a Promo....'
      presenceData.startTimestamp = elapsed
      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/edu')) {
      presenceData.details = 'Viewing on EduMart....'
      presenceData.startTimestamp = elapsed
      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/search')) {
      presenceData.details = 'Searching for a product....'
      presenceData.state = new URL(document.location.href).searchParams.get(
        'q',
      )
      presenceData.startTimestamp = elapsed
      presence.setActivity(presenceData)
    }
    else {
      presenceData.details = 'Viewing a Homepage'
      presenceData.startTimestamp = elapsed
      presence.setActivity(presenceData)
    }
  }
  else if (document.location.hostname === 'seller.tokopedia.com') {
    if (document.location.pathname.includes('/edu')) {
      presenceData.details = 'Viewing a Seller Education Center....'
      presenceData.startTimestamp = elapsed
      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/home')) {
      presenceData.details = 'Viewing a Seller Homepage'
      presenceData.startTimestamp = elapsed
      presence.setActivity(presenceData)
    }
  }
})

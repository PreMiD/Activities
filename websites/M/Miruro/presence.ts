const presence = new Presence({
  clientId: '1291708616952512613',
})

const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.ibb.co/7xm4GrPh/icon-512x512-tr-512x512.png',
    startTimestamp,
  }

  const cleanTitle = document.title.replace(/\s*[-|–]\s*Miruro\s*$/i, '').trim()

  switch (true) {
    case pathname === '/':
      presenceData.details = '🏠 On the homepage'
      presenceData.state = 'Browsing Miruro'
      break

    case pathname === '/about':
      presenceData.details = 'ℹ️ Viewing About Page'
      presenceData.state = cleanTitle || 'Learn about Miruro'
      break

    case pathname === '/faq':
      presenceData.details = '❓ Reading FAQs'
      presenceData.state = cleanTitle || 'Frequently Asked Questions'
      break

    case pathname === '/contact':
      presenceData.details = '📬 Contacting Miruro'
      presenceData.state = cleanTitle || 'Reach out or get help'
      break

    case pathname === '/domains':
      presenceData.details = '🌐 Viewing Official Domains'
      presenceData.state = cleanTitle || 'List of Miruro domains'
      break

    case pathname === '/privacy-policy':
      presenceData.details = '🔒 Reading Privacy Policy'
      presenceData.state = cleanTitle || 'Your data & privacy'
      break

    case pathname === '/terms-of-service':
      presenceData.details = '📜 Reading Terms of Service'
      presenceData.state = cleanTitle || 'User agreement'
      break

    case pathname === '/status/miruro':
      presenceData.details = '📊 Checking Service Status'
      presenceData.state = 'Miruro Status Page'
      break

    default:
      presenceData.details = '🌐 Exploring Miruro'
      presenceData.state = cleanTitle
      break
  }

  presence.setActivity(presenceData)
})

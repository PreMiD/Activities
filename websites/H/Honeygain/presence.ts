const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const path = window.location.pathname
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Honeygain/assets/logo.png',
    details: 'Browsing Honeygain',
    startTimestamp: browsingTimestamp,
    name: 'Honeygain',
  }

  if (document.location.hostname === 'www.honeygain.com') {
    if (document.querySelector('#comp-jvf30y3iinlineContent')) {
      presenceData.details = 'Reading Privacy Policy'
    }
    else if (document.querySelector('#comp-jvf2al4einlineContent')) {
      presenceData.details = 'Reading Terms of Use'
    }
    else if (path === '/') {
      const estEarningsPos = document
        .querySelector('#comp-jv3eiz6p')!
        .getBoundingClientRect()
      const whatIsHGPos = document
        .querySelector('#comp-jv0xq201')!
        .getBoundingClientRect()
      const howItWorksPos = document
        .querySelector('#comp-jvgnw4tj')!
        .getBoundingClientRect()
      if (estEarningsPos.top < window.innerHeight && estEarningsPos.bottom >= 0)
        presenceData.details = 'Estimating Earnings'

      if (whatIsHGPos.top < window.innerHeight && whatIsHGPos.bottom >= 0)
        presenceData.details = 'Reading What is Honeygain'

      if (howItWorksPos.top < window.innerHeight && howItWorksPos.bottom >= 0)
        presenceData.details = 'Reading How It Works'
    }
    else if (path.includes('/faq')) {
      presenceData.details = 'Reading FAQ'
    }
    else if (path.includes('/contact-us')) {
      presenceData.details = 'Seeking Help From Honeygain'
    }
    else if (path.includes('/download')) {
      presenceData.details = 'Downloading Honeygain'
    }
  }
  else if (path === '/') {
    presenceData.details = 'Viewing Dashboard'
    presenceData.state = `Balance: ${
      document
        .querySelectorAll('.sc-dnqmqq.kpUaxq')[0]
        ?.textContent
        ?.split('Equals to ')[1]
    }`
    presenceData.state += `, Gathered Today: ${
      document
        .querySelectorAll('.sc-dnqmqq.kpUaxq')[1]
        ?.textContent
        ?.split('Equals to ')[1]
    }`
  }
  else if (path.includes('/transactions')) {
    presenceData.details = 'Viewing Transaction History'
    presenceData.state = `Balance: ${
      document
        .querySelectorAll('.sc-dnqmqq.kpUaxq')[1]
        ?.textContent
        ?.split('Equals to ')[1]
    }`
  }
  else if (path.includes('/referrals')) {
    presenceData.details = 'Viewing Referrals'
    presenceData.state = `Referral Code: ${
      (
        document.querySelectorAll(
          '.sc-RefOD.izklIM.sc-bwCtUz.gqfLZQ',
        )[0] as HTMLInputElement
      ).value.split('https://r.honeygain.money/')[1]
    }`
  }
  else if (path.includes('/faq')) {
    presenceData.details = 'Viewing FAQ'
  }
  else if (path.includes('/profile')) {
    presenceData.details = 'Viewing Profile settings'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

const presence = new Presence({
  clientId: '817385570912174121',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Speedtest/assets/logo.png',
  }
  const showISP = await presence.getSetting<boolean>('showISP')

  if (window.location.hostname.includes('speedtest')) {
    if (window.location.pathname.includes('/run')) {
      const server = `${
        document.querySelector(
          '.result-item-icon.result-item-host .result-data, .result-item-icon.result-item-host .result-label',
        )?.textContent
      } - ${
        document.querySelector(
          '.result-item-icon.result-item-host .result-data, .result-item-icon.result-item-host .result-label .result-name',
        )?.textContent
      }`
      const ping = document.querySelector(
        'span.result-item.result-item-latency.result-data-latency-item.updated > span',
      )!.textContent!
      + document.querySelector('span:nth-child(1) > span.result-data-unit')!
        .textContent!
      const download = document.querySelector('.result-item-download .result-data')!
        .textContent!
        + document.querySelector('.result-item-download .result-data-unit')!
          .textContent!
      const upload = document.querySelector('.result-item-upload .result-data')!
        .textContent!
        + document.querySelector('.result-item-upload .result-data-unit')!
          .textContent!
      let isp = document.querySelector(
        '.result-item-icon.result-item-isp .result-label',
      )!.textContent!
      if (!showISP)
        isp = 'Hidden'
      // 27 & 29 = nothing + unit
      if (upload.length === 29) {
        presenceData.details = `Live results - Ping ${
          ping.length === 27 ? 'Testing' : ping
        } | Download ${
          download.length === 29 ? 'Testing' : download
        } | Upload Testing`
        presenceData.state = `ISP: ${isp} | Server: ${server}`
      }
      else {
        presenceData.details = 'Browsing the homepage'
      }
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/result')) {
      const server = `${
        document.querySelector(
          '.result-item-icon.result-item-host .result-data, .result-item-icon.result-item-host .result-label',
        )?.textContent
      } - ${
        document.querySelector(
          '.result-item-icon.result-item-host .result-data, .result-item-icon.result-item-host .result-label .result-name',
        )?.textContent
      }`
      let isp = document.querySelector(
        '.result-item-icon.result-item-isp .result-label',
      )?.textContent
      if (!showISP)
        isp = 'Hidden'
      try {
        presenceData.details = `Viewing results - Ping ${
          document.querySelector(
            'span.result-item.result-item-latency.result-data-latency-item.updated > span',
          )?.textContent
        } ms | Download ${
          document.querySelector(
            'div.result-item-container.result-item-container-align-center > div > div.result-data.u-align-left > span',
          )?.textContent
        } Mbps | Upload ${
          document.querySelector(
            'div.result-item-container.result-item-container-align-left > div > div.result-data.u-align-left > span',
          )?.textContent
        } Mbps`
      }
      catch {
        presenceData.details = `Viewing results - Ping ${
          document.querySelector(
            'span.result-item.result-item-latency.result-data-latency-item.updated > span',
          )?.textContent
        } ms | Download ${
          document.querySelector(
            'div.result-item-container.result-item-container-align-center > div > div.result-data.u-align-left > span',
          )?.textContent
        } Mbps | Upload ${
          document.querySelector(
            'div.result-item-container.result-item-container-align-left > div > div.result-data.u-align-left > span',
          )?.textContent
        } Mbps`
      }
      presenceData.state = `ISP: ${isp} | Server: ${server}`
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/ookla-5g-map')) {
      presenceData.details = 'Navigate on the 5G map'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/apps')) {
      presenceData.details = 'Watching apps'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.endsWith('/insights')) {
      presenceData.details = 'Browsing insights'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/insights/blog')) {
      presenceData.details = 'Browsing blog'
      if (window.location.pathname !== '/insights/blog/') {
        presenceData.state = document.querySelector(
          '#speedtest .header .header-wrap h1',
        )?.textContent
      }
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/global-index')) {
      presenceData.details = 'Browsing Speedtest Global Index'
      presenceData.state = document.querySelector(
        '.section .page-header',
      )?.textContent
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/speedtest-servers')) {
      presenceData.details = 'Look how to host a server'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/enterprise')) {
      presenceData.details = 'Look entreprise solutions'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/about')) {
      presenceData.details = 'About Ookla'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/login')) {
      presenceData.details = 'Log in'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/register')) {
      presenceData.details = 'Creating an account'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/settings')) {
      presenceData.details = 'Browsing settings'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (window.location.pathname.includes('/help')) {
      presenceData.details = 'Browsing help QA'
      presenceData.startTimestamp = browsingTimestamp
    }
    else if (
      document.querySelector<HTMLSpanElement>('a > span.start-background')?.style.opacity === '1'
    ) {
      const server = `${
        document.querySelector(
          '.result-item-icon.result-item-host .result-data, .result-item-icon.result-item-host .result-label',
        )?.textContent
      } - ${
        document.querySelector(
          '.result-item-icon.result-item-host .result-data, .result-item-icon.result-item-host .result-label .result-name',
        )?.textContent
      }`
      const download = document.querySelector('.result-item-download .result-data')!
        .textContent!
        + document.querySelector('.result-item-download .result-data-unit')!
          .textContent!
      const upload = `${
        document.querySelector('.result-item-upload .result-data')?.textContent
      }${
        document.querySelector('.result-item-upload .result-data-unit')
          ?.textContent
      }`
      let isp = document.querySelector(
        '.result-item-icon.result-item-isp .result-label',
      )?.textContent
      let ping = ''
      if (!showISP)
        isp = 'Hidden'
      if (
        document.querySelector(
          'span.result-item.result-item-latency.result-data-latency-item.updated > span',
        )
        && document.querySelector('span:nth-child(1) > span.result-data-unit')
      ) {
        ping = document.querySelector(
          'span.result-item.result-item-latency.result-data-latency-item.updated > span',
        )!.textContent!
        + document.querySelector('span:nth-child(1) > span.result-data-unit')!
          .textContent!
      }
      else {
        ping = 'N/A'
      }

      presenceData.details = `Testing ${server}`
      presenceData.details = `Live results - Ping ${
        ping.length === 27 ? 'Testing' : ping
      } | Download ${download.length === 29 ? 'Testing' : download} | Upload  ${
        upload.length === 29 ? 'Testing' : upload
      }`
      presenceData.state = `ISP: ${isp} | Server: ${server}`
    }
    else {
      presenceData.details = 'Browsing the homepage'
    }
    presenceData.startTimestamp = browsingTimestamp
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

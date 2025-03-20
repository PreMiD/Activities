import { Assets } from 'premid'

const presence = new Presence({
  clientId: '846071986902925312',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Nekopost/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.pathname.includes('/manga')) {
    if (document.location.pathname.includes('/manga/')) {
      if (document.querySelector('head > title')?.textContent?.includes('Ch')) {
        presenceData.details = `Manga :${
          document.querySelector('head > title')?.textContent?.split('-')[1]
        }!`

        presenceData.state = document
          .querySelector('head > title')
          ?.textContent
          ?.split(' ')[0]
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = `Manga :${
          document.querySelector('head > title')?.textContent
        }!`
        presenceData.smallImageKey = Assets.Search
      }
    }
    else {
      presenceData.details = 'กำลังเลือก Manga'
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (document.location.pathname.includes('/novel')) {
    if (document.location.pathname.includes('/novel/')) {
      if (document.querySelector('head > title')?.textContent?.includes('Ch')) {
        presenceData.details = `Novel :${
          document.querySelector('head > title')?.textContent?.split('-')[1]
        }!`

        presenceData.state = document
          .querySelector('head > title')
          ?.textContent
          ?.split(' ')[0]
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = `Novel :${
          document.querySelector('head > title')?.textContent
        }!`
        presenceData.smallImageKey = Assets.Search
      }
    }
    else {
      presenceData.details = 'กำลังเลือก Novel'
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (document.location.pathname.includes('/comic')) {
    if (document.location.pathname.includes('/comic/')) {
      if (document.querySelector('head > title')?.textContent?.includes('Ch')) {
        presenceData.details = `Comic :${
          document.querySelector('head > title')?.textContent?.split('-')[1]
        }!`

        presenceData.state = document
          .querySelector('head > title')
          ?.textContent
          ?.split(' ')[0]
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = `Comic :${
          document.querySelector('head > title')?.textContent
        }!`
        presenceData.smallImageKey = Assets.Search
      }
    }
    else {
      presenceData.details = 'กำลังเลือก Original Comic'
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (document.location.pathname.includes('/fiction')) {
    if (document.location.pathname.includes('/fiction/')) {
      if (document.querySelector('head > title')?.textContent?.includes('Ch')) {
        presenceData.details = `ONovel :${
          document.querySelector('head > title')?.textContent?.split('-')[1]
        }!`

        presenceData.state = document
          .querySelector('head > title')
          ?.textContent
          ?.split(' ')[0]
        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = `ONovel :${
          document.querySelector('head > title')?.textContent
        }!`
        presenceData.smallImageKey = Assets.Search
      }
    }
    else {
      presenceData.details = 'กำลังเลือก Original Novel'
      presenceData.smallImageKey = Assets.Search
    }
  }
  else if (document.location.pathname.includes('/explore')) {
    presenceData.details = 'กำลังเลือก Project'
    presenceData.smallImageKey = Assets.Search
  }
  else if (document.location.pathname === '/') {
    presenceData.details = 'กำลังหา...'
    presenceData.smallImageKey = Assets.Search
  }
  presence.setActivity(presenceData)
})

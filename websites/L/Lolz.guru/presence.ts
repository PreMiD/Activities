const presence = new Presence({
  clientId: '935242142106914869',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

function pathIncludes(string: string): boolean {
  return document.location.pathname.toLowerCase().includes(string)
}

async function getStrings() {
  return presence.getStrings(
    {
      readingThread: 'general.readingThread',
      reading: 'general.reading',
      viewProfileButton: 'general.buttonViewProfile',
      viewProfile: 'general.viewProfile',
      search: 'general.searchSomething',
      terms: 'general.terms',
      dm: 'general.readingDM',
      viewPage: 'general.viewPage',
      viewHome: 'general.viewHome',
    },

  )
}

let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/Lolz.guru/assets/logo.jpg',
  }
  const newLang = await presence.getSetting<string>('lang').catch(() => 'en')

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  switch (true) {
    case pathIncludes('/threads'):
      presenceData.details = (await strings).readingThread
      presenceData.state = document.querySelector(
        '#content > div > div > div.titleBar > h1',
      )?.textContent
      presenceData.buttons = [
        {
          label: 'Open',
          url: document.location.href,
        },
      ]
      presenceData.startTimestamp = browsingTimestamp
      break

    case pathIncludes('/threads')
      || pathIncludes('/guarantor')
      || pathIncludes('/service')
      || pathIncludes('/antipublic'):
      presenceData.details = (await strings).readingThread
      presenceData.state = document.querySelector(
        '#content > div > div > div.titleBar > h1',
      )?.textContent
      presenceData.buttons = [
        {
          label: 'Open',
          url: document.location.href,
        },
      ]
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathIncludes('/search'):
      presenceData.details = (await strings).search
      break
    case pathIncludes('/rules') || pathIncludes('/help'):
      presenceData.details = (await strings).reading
      presenceData.state = (await strings).terms
      presenceData.startTimestamp = browsingTimestamp
      break
    case pathIncludes('/conversations'):
      presenceData.details = `${(await strings).dm} ${
        document.querySelector(
          '#Conversations > div.conversationViewContainer.ImView > div.ImViewContent > div > div.ImDialogHeader > div.membersAndActions > div.fl_l.conversationRecipient > a > span',
        )?.textContent
      }`
      presenceData.startTimestamp = browsingTimestamp
      break
    default:
      presenceData.details = (await strings).viewHome
      presenceData.startTimestamp = browsingTimestamp
      break
  }
  if (
    document.querySelector('#page_info_wrap > div.page_top > h1')?.textContent
  ) {
    presenceData.details = (await strings).viewProfile
    presenceData.state = document.querySelector(
      '#page_info_wrap > div.page_top > h1',
    )?.textContent
    presenceData.buttons = [
      {
        label: (await strings).viewProfileButton,
        url: document.location.href,
      },
    ]
    presenceData.startTimestamp = browsingTimestamp
  }
  if (
    !pathIncludes('/reports')
    && !pathIncludes('/search')
    && document.querySelector(
      '#content > div > div > div > div > div.titleBar > h1',
    )?.textContent
  ) {
    presenceData.details = `${(await strings).viewPage} ${
      document.querySelector(
        '#content > div > div > div > div > div.titleBar > h1',
      )?.textContent
    }`
    presenceData.startTimestamp = browsingTimestamp
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

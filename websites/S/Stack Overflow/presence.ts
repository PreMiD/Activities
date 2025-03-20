const presence = new Presence({
  clientId: '610123745033584651',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let lastPage: string | null | undefined

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Unknown page',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Stack%20Overflow/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const showButtons = await presence.getSetting<boolean>('buttons')

  const title = document.querySelector('div#question-header h1 a')

  const pageNumber = document.querySelector('div.pager.fl span.page-numbers.current')

  const usersortagsPageNumber = document.querySelector(
    'div.pager.fr span.page-numbers.current',
  )

  const jobPageNumber = document.querySelector(
    'div:nth-child(1) > div > a.job-link.selected',
  )

  const allPages = document.querySelectorAll('div.pager.fr a')

  const jobLastPage = document.querySelectorAll('div.pagination a')

  const questionsLastPage = document.querySelectorAll('div.pager.fl a')

  if (
    document.location.pathname.includes('/users')
    || document.location.pathname.includes('/tags')
  ) {
    lastPage = allPages[allPages.length - 2]?.textContent
  }
  else if (document.location.pathname.includes('/jobs')) {
    lastPage = jobLastPage[jobLastPage.length - 2]?.textContent
  }
  else if (document.location.pathname === '/questions') {
    lastPage = questionsLastPage[questionsLastPage.length - 2]?.textContent
  }

  if (title && document.location.pathname.includes('/questions/')) {
    presenceData.details = 'Reading a question.'
    presenceData.state = title.textContent
    presenceData.buttons = [
      { label: 'View Question', url: document.location.href },
    ]
  }
  else if (document.location.pathname === '/') {
    presenceData.state = 'Main Page | Home'
    delete presenceData.details
  }
  else if (
    document.location.pathname === '/questions'
    && pageNumber?.textContent && pageNumber.textContent.length > 0
  ) {
    const lastPageNumber: number = +lastPage!
    const lastquestionsPageNumber: number = +pageNumber.textContent

    if (lastquestionsPageNumber > lastPageNumber) {
      presence.info(`${lastPageNumber} --- ${lastquestionsPageNumber}`)
      lastPage = pageNumber.textContent
    }

    presenceData.details = 'Browsing all the questions.'
    presenceData.state = `Current page: ${pageNumber.textContent}/${lastPage}`
  }
  else {
    switch (document.location.pathname) {
      case '/jobs': {
        const lastPageNumber: number = +lastPage!
        const lastjobPageNumber: number = +jobPageNumber!.textContent!

        if (lastjobPageNumber > lastPageNumber) {
          presence.info(`${lastPageNumber} --- ${lastjobPageNumber}`)

          lastPage = jobPageNumber!.textContent
        }

        presenceData.details = 'Browsing jobs.'

        presenceData.state = `Current page: ${jobPageNumber!.textContent}/${lastPage}`
        break
      }
      case '/users': {
        const lastPageNumber: number = +lastPage!
        const lastusersortagsPageNumber: number = +usersortagsPageNumber!.textContent!

        if (lastusersortagsPageNumber > lastPageNumber) {
          presence.info(`${lastPageNumber} --- ${lastusersortagsPageNumber}`)

          lastPage = usersortagsPageNumber!.textContent
        }

        presenceData.details = 'Browsing users.'

        presenceData.state = `Current page: ${usersortagsPageNumber?.textContent}/${lastPage}`
        break
      }
      case '/tags': {
        const lastPageNumber: number = +lastPage!
        const lastusersortagsPageNumber: number = +usersortagsPageNumber!.textContent!

        if (lastusersortagsPageNumber > lastPageNumber) {
          presence.info(`${lastPageNumber} --- ${lastusersortagsPageNumber}`)

          lastPage = usersortagsPageNumber!.textContent
        }

        presenceData.details = 'Browsing tags.'
        presenceData.state = `Current page: ${usersortagsPageNumber!.textContent}/${lastPage}`
        break
      }
    }
  }

  if (!showButtons)
    delete presenceData.buttons
  presence.setActivity(presenceData)
})

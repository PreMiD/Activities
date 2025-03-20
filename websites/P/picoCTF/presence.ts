const presence = new Presence({
  clientId: '989558631823474748',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting<boolean>('privacy')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/picoCTF/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'picoctf.org') {
    if (document.location.pathname.includes('/learning_guides/')) {
      presenceData.details = 'Reading a guide:'
      presenceData.state = `${document.location.pathname
        .split('/')[2]
        ?.replaceAll('-', ' ')
        .slice(6, -4)}`
    }
    else if (document.location.pathname.includes('/pdfs/')) {
      presenceData.details = document.location.pathname.includes(
        'Sponsorship_Flyer',
      )
        ? 'Reading about sponsoring'
        : 'Reading a research paper'
    }
    else if (document.location.pathname === '/get_started.html') {
      const viewing = document.querySelectorAll(
        'ul#competition-tabs li a:not([aria-selected="false"])',
      )[0]?.innerHTML === 'User Guide'
        ? 'Viewing the user guide'
        : 'Viewing the FAQ'

      presenceData.details = viewing

      if (!privacy && viewing === 'Viewing the user guide') {
        presenceData.state = Array.from(
          document.querySelectorAll(
            'div.active button:not([aria-selected="false"]) span',
          ),
          el => el.innerHTML,
        )
          .splice(
            document
              .querySelectorAll(
                'ul#guide-tabs li a:not([aria-selected="false"])',
              )[0]
              ?.innerHTML
              .includes('Learner')
              ? 0
              : 2,
            2,
          )
          .join(': ')
      }
    }
    else {
      switch (document.location.pathname) {
        case '/':
          presenceData.details = 'Viewing home page'
          break
        case '/resources.html':
          presenceData.details = 'Viewing learning resources'
          break
        case '/community.html':
          presenceData.details = 'Viewing community page'
          break
        case '/competitions/past.html':
          presenceData.details = 'Viewing past competitions'
          break
        case '/privacy.html':
          presenceData.details = 'Reading privacy statement'
          break
        case '/terms.html':
          presenceData.details = 'Reading terms of service'
          break
        case '/about.html':
          presenceData.details = 'Reading the about page'
          break
        case '/research.html':
          presenceData.details = 'Reading the research page'
          break
        case '/sponsors.html':
          presenceData.details = 'Viewing sponsors'
          break
        case '/contact.html':
          presenceData.details = 'Viewing the contact page'
          break
      }
    }
  }

  if (document.location.hostname === 'play.picoctf.org') {
    if (document.location.pathname === '/login') {
      presenceData.details = !privacy ? 'Logging in' : 'Viewing home page'
    }
    else if (document.location.pathname === '/practice') {
      const practiceparams = new URLSearchParams(document.location.search)
      const formatCategory = (cat: number) => {
        if (cat === 34)
          return 'uncategorized'

        const catText = document
          .querySelector('ul.filter-list')
          ?.children[cat]
          ?.innerHTML
          .toLowerCase()
          .split(' ')
        const amount = Number.parseInt(catText?.[catText.length - 1]?.replace(/\D/g, '') ?? '') || ''

        if (cat === 0)
          return amount

        return catText && catText.length === 3
          ? `${amount} ${catText[0]} ${catText[1]}`
          : `${amount} ${catText?.[0]}`
      }

      if (practiceparams.has('category')) {
        presenceData.details = `Viewing ${formatCategory(
          Number.parseInt(practiceparams.get('category')!),
        )} challs`
      }
      else {
        presenceData.details = `Viewing ${formatCategory(0)} challs`
      }

      presenceData.state = practiceparams.has('page')
        ? `Page ${practiceparams.get('page')}`
        : 'Page 1'

      if (!privacy) {
        const score = document
          .querySelector('div.col-md-3 h3.text-bluish')
          ?.innerHTML
          .split(' ')
        score?.splice(0, 1)
        score?.unshift(', ')
        presenceData.state += score?.join(' ')
      }
    }
    else if (document.location.pathname.includes('/practice/challenge/')) {
      if (!privacy) {
        presenceData.details = `Viewing "${
          document
            .querySelector('div.row.d-flex.justify-content-between h3.mb-1')
            ?.innerHTML
            .split('<button')[0]
        }" chall`
        presenceData.state = `${
          document.querySelector('div.body-lg.mr-3 svg')?.attributes[2]?.value
          === 'user'
            ? 'Unsolved'
            : 'Solved'
        }, ${document.querySelector('button.btn.btn-danger.btn-xs')?.innerHTML}`
      }
      else {
        presenceData.details = 'Solving a challenge'
      }
    }
    else if (document.location.pathname.includes('/users/')) {
      presenceData.details = privacy
        ? 'Viewing an account'
        : `Viewing account "${document.location.pathname.split('/')[2]}"`
    }
    else if (
      document.location.pathname.includes('/events/')
      && document.location.pathname.includes('/scoreboards')
    ) {
      presenceData.details = `Viewing ${
        document.querySelector('h3.card-title div.text-left')?.innerHTML
      }`
    }
    else if (document.location.pathname.includes('/classrooms')) {
      if (Number.parseInt(document.location.pathname.split('/')[2]!) && !privacy) {
        presenceData.details = `Viewing classroom "${
          document.querySelector('div.col-md-6 h2.card-title')?.innerHTML
        }"`
      }
      else {
        presenceData.details = 'Viewing classrooms'
      }
    }
    else if (document.location.pathname === '/notifications') {
      presenceData.details = 'Viewing notifications'

      if (!privacy) {
        const notifparams = new URLSearchParams(window.location.search)
        if (notifparams.has('show')) {
          presenceData.details = `Viewing ${notifparams.get(
            'show',
          )} notifications`
        }
        presenceData.state = `Page ${notifparams.get('page')}`
      }
    }
    else if (document.location.pathname === '/account' && !privacy) {
      presenceData.details = 'Editing account'
    }
    else if (document.location.pathname === '/compete') {
      presenceData.details = 'Viewing competitions'
    }
  }

  presence.setActivity(presenceData)
})

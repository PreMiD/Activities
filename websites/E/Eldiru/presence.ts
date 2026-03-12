const presence = new Presence({
  clientId: '798139973240225812',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Eldiru/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'eldiru.unsoed.ac.id') {
    if (document.location.pathname === '/') {
      presenceData.details = 'Viewing homepage'
    }
    else if (document.location.pathname.includes('/login')) {
      presenceData.details = 'Viewing login page'
    }
    else if (document.location.pathname.includes('/my')) {
      presenceData.details = 'Viewing dashboard'
    }
    else if (document.location.pathname.includes('/course/')) {
      const course = document.querySelector(
        '#page-course-view-topics > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1',
      )?.textContent
      presenceData.details = 'Viewing course:'
      presenceData.state = course
    }
    else if (document.location.pathname.includes('/mod/attendance/')) {
      const course = document.querySelector(
        '#page-mod-attendance-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1',
      )?.textContent
      if (
        document.querySelector(
          '#page-mod-attendance-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        ) !== null
      ) {
        const sub = document.querySelector(
          '#page-mod-attendance-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        )?.textContent
        presenceData.details = `Viewing ${sub}`
      }
      else {
        presenceData.details = 'Viewing attendance:'
      }

      presenceData.state = course
    }
    else if (document.location.pathname.includes('/mod/forum/')) {
      const course = document.querySelector(
        '#page-mod-forum-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1',
      )?.textContent
      if (
        document.querySelector(
          '#page-mod-forum-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        ) !== null
      ) {
        const sub = document.querySelector(
          '#page-mod-forum-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        )?.textContent
        presenceData.details = `Viewing ${sub}`
      }
      else {
        presenceData.details = 'Viewing forum:'
      }

      presenceData.state = course
    }
    else if (document.location.pathname.includes('/mod/page/')) {
      const course = document.querySelector(
        '#page-mod-page-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1',
      )?.textContent
      if (
        document.querySelector(
          '#page-mod-page-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        ) !== null
      ) {
        const sub = document.querySelector(
          '#page-mod-page-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        )?.textContent
        presenceData.details = `Viewing ${sub}`
      }
      else {
        presenceData.details = 'Viewing page:'
      }

      presenceData.state = course
    }
    else if (document.location.pathname.includes('/mod/assign/')) {
      const course = document.querySelector(
        '#page-mod-assign-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1',
      )?.textContent
      if (
        document.querySelector(
          '#page-mod-assign-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        ) !== null
      ) {
        const sub = document.querySelector(
          '#page-mod-assign-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        )?.textContent
        presenceData.details = `Viewing ${sub}`
      }
      else {
        presenceData.details = 'Viewing assignment:'
      }

      presenceData.state = course
    }
    else if (document.location.pathname.includes('/mod/quiz/')) {
      const course = document.querySelector(
        '#page-mod-quiz-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1',
      )?.textContent
      if (
        document.querySelector(
          '#page-mod-quiz-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        ) !== null
      ) {
        const sub = document.querySelector(
          '#page-mod-quiz-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2',
        )?.textContent
        presenceData.details = `Viewing ${sub}`
      }
      else {
        presenceData.details = 'Viewing quiz:'
      }

      presenceData.state = course
    }

    if (!presenceData.details)
      presence.setActivity()
    else presence.setActivity(presenceData)
  }
})

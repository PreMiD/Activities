const presence = new Presence({
  clientId: '715912352561627246',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/Jisho/assets/logo.png',
    smallImageText: 'Jisho Japanese Dictionary',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname === 'jisho.org') {
    if (document.location.pathname === '/') {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Home'
    }
    else if (document.location.pathname.startsWith('/search')) {
      if (document.querySelector('#result_area > div.kanji > div') === null) {
        presenceData.details = 'Searching:'
        presenceData.state = decodeURIComponent(
          document.location.pathname.substr(8),
        )
        presence.info('searching')
      }
      else {
        presenceData.details = 'Viewing a kanji:'
        const kanji = document.querySelector(
          '#result_area > div.kanji > div > div > div > div > h1.character',
        )?.textContent
        const meaning = document
          .querySelector(
            '#result_area > div.kanji > div > div > div > div > div.kanji-details__main-meanings',
          )
          ?.textContent
          ?.trim()
        presenceData.state = `${kanji} - ${meaning}`
        presence.info(`${kanji} - ${meaning}`)
      }
    }
    else if (document.location.pathname.startsWith('/word')) {
      presenceData.details = 'Viewing a word:'
      presenceData.state = decodeURIComponent(
        document.location.pathname.substr(6),
      )
    }
    else if (document.location.pathname.startsWith('/forum')) {
      if (document.location.pathname.length < 8) {
        presenceData.details = 'Viewing a page:'
        presenceData.state = 'Forum'
      }
      else {
        presenceData.details = 'Reading a forum post:'
        presenceData.state = document.querySelector(
          '#page_container > div > article.discussion_thread > div.first_comment > div.comment_body > div.discussion_title > h2',
        )?.textContent
      }
    }
    else if (document.location.pathname.startsWith('/users')) {
      presenceData.details = 'Viewing a user:'
      presenceData.state = document.querySelector(
        '#page_container > div > div.page > article > h2',
      )?.textContent
    }
    else if (document.location.pathname.startsWith('/sentences')) {
      presenceData.details = 'Reading a sentence:'
      presenceData.state = document.querySelector(
        '#page_container > div > div.page > article.sentences > li.sentence > div.sentence_content > div.english_sentence > span.english',
      )?.textContent
    }
    else if (document.location.pathname.startsWith('/docs')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Search Options'
    }
    else if (document.location.pathname.startsWith('/about')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'About'
    }
  }
  else if (document.location.hostname === 'classic.jisho.org') {
    presenceData.details = 'Jisho Classic'
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})

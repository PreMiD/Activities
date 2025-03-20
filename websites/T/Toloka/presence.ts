import { Assets } from 'premid'

const presence = new Presence({
  clientId: '798502531847421962',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Toloka = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/0.png',
  Film = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/1.png',
  Video = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/2.png',
  Home = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/3.png',
  Music = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/4.png',
  Reply = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/5.png',
  Archive = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/6.png',
  User = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/7.png',
  Book = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/8.png',
  Gamepad = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/9.png',
  Desktop = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/10.png',
  Sms = 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/11.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Toloka/assets/logo.png',
  }
  const showUseramePM = await presence.getSetting<boolean>('name')
  const showSearchQuery = await presence.getSetting<boolean>('search')

  switch (document.location.pathname) {
    case '/': {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Переглядаю головну'
      presenceData.state = 'сторінку'
      presenceData.smallImageKey = ActivityAssets.Home
      presenceData.smallImageText = 'Головна'

      break
    }
    case `/${encodeURIComponent('новини.html')}`: {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Переглядаю розділ:'
      presenceData.state = 'Загальне'
      presenceData.smallImageKey = ActivityAssets.Home
      presenceData.smallImageText = 'Загальне'

      break
    }
    case `/${encodeURIComponent('відео-гуртом.html')}`: {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Переглядаю розділ:'
      presenceData.state = 'Проект Відео Гуртом'
      presenceData.smallImageKey = ActivityAssets.Video
      presenceData.smallImageText = 'Відео Гуртом'

      break
    }
    case `/${encodeURIComponent('фільми-українською.html')}`: {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Переглядаю розділ:'
      presenceData.state = 'Фільми українською'
      presenceData.smallImageKey = ActivityAssets.Film
      presenceData.smallImageText = 'Фільми'

      break
    }
    case `/${encodeURIComponent('українська-музика.html')}`: {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Переглядаю розділ:'
      presenceData.state = 'Українська музика'
      presenceData.smallImageKey = ActivityAssets.Music
      presenceData.smallImageText = 'Музика'

      break
    }
    case `/${encodeURIComponent('література-українською.html')}`: {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Переглядаю розділ:'
      presenceData.state = 'Література українською'
      presenceData.smallImageKey = ActivityAssets.Book
      presenceData.smallImageText = 'Література'

      break
    }
    case `/${encodeURIComponent('програми-українською.html')}`: {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Переглядаю розділ:'
      presenceData.state = 'Програми українською'
      presenceData.smallImageKey = ActivityAssets.Desktop
      presenceData.smallImageText = 'Програми'

      break
    }
    case `/${encodeURIComponent('ігри-українською.html')}`: {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Переглядаю розділ:'
      presenceData.state = 'Ігри українською'
      presenceData.smallImageKey = ActivityAssets.Gamepad
      presenceData.smallImageText = 'Ігри'

      break
    }
    case `/${encodeURIComponent('архів.html')}`: {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Переглядаю розділ:'
      presenceData.state = 'Архів та смітник'
      presenceData.smallImageKey = ActivityAssets.Archive
      presenceData.smallImageText = 'Архів'

      break
    }
    default:
      if (/\/f\d+/.test(document.location.pathname)) {
        const title = document.querySelector(
          'body > div.maxwidth > table:nth-child(3) > tbody > tr > td.bodyline > table:nth-child(1) > tbody > tr > td > h1 > a.maintitle',
        )
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Переглядаю категорію:'
        presenceData.state = title?.textContent
      }
      else if (/\/u\d+/.test(document.location.pathname)) {
        const title = document.querySelector(
          'body > div.maxwidth > table:nth-child(3) > tbody > tr > td.bodyline > table.forumline:nth-child(2) > tbody > tr:nth-child(3) > td.row1:nth-child(2) > table > tbody > tr:nth-child(3) > td:nth-child(2) > span.genmed:nth-child(5) > a.genmed > b',
        )
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Переглядаю профіль:'
        presenceData.state = title?.textContent
        presenceData.smallImageKey = ActivityAssets.User
        presenceData.smallImageText = 'Профіль'
      }
      else if (/\/t\d+/.test(document.location.pathname)) {
        const title = document.querySelector(
          'body > div.maxwidth > table:nth-child(3) > tbody > tr > td.bodyline > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1) > h1 > a.maintitle',
        )
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Переглядаю тему:'
        presenceData.state = title?.textContent
      }
      else if (document.location.pathname.includes('/rightholders.php')) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Переглядаю сторінку'
        presenceData.state = 'Для правовласників'
      }
      else if (document.location.pathname.includes('/faq.php')) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Читаю FAQ'
        presenceData.smallImageKey = Assets.Question
        presenceData.smallImageText = 'FAQ'
      }
      else if (document.location.pathname.includes('/tracker.php')) {
        const search = document.querySelector<HTMLInputElement>(
          'body > div.maxwidth > table > tbody > tr > td.bodyline > form#form > table.forumline:nth-child(18) > tbody > tr:nth-child(2) > td.row4 > table:nth-child(3) > tbody > tr > td.row4:nth-child(3) > div > fieldset.fieldset > div > input.post',
        )
        presenceData.startTimestamp = browsingTimestamp
        if (search?.value === '' || !showSearchQuery) {
          presenceData.details = 'Щось шукаю'
        }
        else {
          presenceData.details = 'Шукаю:'
          presenceData.state = search?.value
        }
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Пошук'
      }
      else if (document.location.pathname.includes('/featured')) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Переглядаю авторські'
        presenceData.state = 'релізи'
      }
      else if (document.location.pathname.includes('/privmsg.php')) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.smallImageKey = ActivityAssets.Sms
        presenceData.smallImageText = 'ПП'
        if (document.location.search.includes('?folder=inbox&mode=read')) {
          const title = document.querySelector(
            'body > div.maxwidth > table:nth-child(3) > tbody > tr > td.bodyline > form > table.forumline > tbody > tr:nth-child(2) > td.row2:nth-child(2) > span.genmed',
          )
          if (showUseramePM) {
            presenceData.details = 'Читаю ПП від:'
            presenceData.state = title?.textContent
          }
          else {
            presenceData.details = 'Читаю ПП'
          }
        }
        else if (
          document.location.search.includes('?folder=sentbox&mode=read')
        ) {
          const title = document.querySelector(
            'body > div.maxwidth > table:nth-child(3) > tbody > tr > td.bodyline > form > table.forumline > tbody > tr:nth-child(3) > td.row2:nth-child(2) > span.genmed',
          )
          if (showUseramePM) {
            presenceData.details = 'Читаю ПП для:'
            presenceData.state = title?.textContent
          }
          else {
            presenceData.details = 'Читаю ПП'
          }
        }
        else if (
          document.location.search.includes('?folder=outbox&mode=read')
        ) {
          const title = document.querySelector(
            'body > div.maxwidth > table:nth-child(3) > tbody > tr > td.bodyline > form > table.forumline > tbody > tr:nth-child(3) > td.row2:nth-child(2) > span.genmed',
          )
          if (showUseramePM) {
            presenceData.details = 'Читаю ПП для:'
            presenceData.state = title?.textContent
          }
          else {
            presenceData.details = 'Читаю ПП'
          }
        }
        else if (
          document.location.search.includes('?folder=savebox&mode=read')
        ) {
          const title = document.querySelector(
            'body > div.maxwidth > table:nth-child(3) > tbody > tr > td.bodyline > form > table.forumline > tbody > tr:nth-child(3) > td.row2:nth-child(2) > span.genmed',
          )
          if (showUseramePM) {
            presenceData.details = 'Читаю збережене ПП'
            presenceData.state = `від:${title?.textContent}`
          }
          else {
            presenceData.details = 'Читаю ПП'
          }
        }
        else if (document.location.search.includes('?folder=inbox')) {
          presenceData.details = 'Переглядаю'
          presenceData.state = 'вхідні ПП'
        }
        else if (document.location.search.includes('?folder=sentbox')) {
          presenceData.details = 'Переглядаю'
          presenceData.state = 'відіслані ПП'
        }
        else if (document.location.search.includes('?folder=outbox')) {
          presenceData.details = 'Переглядаю'
          presenceData.state = 'вихідні ПП'
        }
        else if (document.location.search.includes('?folder=savebox')) {
          presenceData.details = 'Переглядаю'
          presenceData.state = 'збережені ПП'
        }
        else if (document.location.search.includes('?mode=reply')) {
          const title = document.querySelector(
            'body > div.maxwidth > table > tbody > tr > td.bodyline > form > table.forumline > tbody > tr > td.row2 > span.genmed > input.post',
          )
          if (showUseramePM) {
            presenceData.details = 'Відповідаю на ПП від:'
            presenceData.state = title?.textContent
          }
          else {
            presenceData.details = 'Відповідаю на ПП'
          }
        }
        else if (document.location.search.includes('?mode=quote')) {
          const title = document.querySelector(
            'body > div.maxwidth > table > tbody > tr > td.bodyline > form > table.forumline > tbody > tr > td.row2 > span.genmed > input.post',
          )
          if (showUseramePM) {
            presenceData.details = 'Цитую ПП від:'
            presenceData.state = title?.textContent
          }
          else {
            presenceData.details = 'Цитую ПП'
          }
        }
        else if (document.location.search.includes('?mode=post')) {
          presenceData.details = 'Пишу нове ПП'
        }
      }
      else if (document.location.pathname.includes('/watched_topics.php')) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Переглядаю'
        presenceData.state = 'відстежуввні теми'
      }
      else if (document.location.pathname.includes('/search.php')) {
        presenceData.startTimestamp = browsingTimestamp
        if (document.location.search.includes('?mode=searchuser')) {
          presenceData.details = 'Шукаю співрозмовника'
          presenceData.smallImageKey = Assets.Search
          presenceData.smallImageText = 'Пошук'
        }
        else if (document.location.search.includes('?search_id=newposts')) {
          presenceData.details = 'Переглядаю нові'
          presenceData.state = 'повідомлення'
        }
        else if (document.location.search.includes('?search_id=egosearch')) {
          presenceData.details = 'Переглядаю свої'
          presenceData.state = 'повідомлення'
        }
        else if (document.location.search.includes('?search_id=unanswered')) {
          presenceData.details = 'Переглядаю теми'
          presenceData.state = 'без відповідей'
        }
      }
      else if (document.location.pathname.includes('/posting.php')) {
        presenceData.startTimestamp = browsingTimestamp
        if (document.location.search.includes('?mode=newtopic')) {
          presenceData.details = 'Створюю нову'
          presenceData.state = 'тему'
        }
        else if (document.location.search.includes('?mode=reply')) {
          presenceData.details = 'Відповідаю на тему'
        }
      }
      else if (document.location.pathname.includes('/helptoseed.php')) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Переглядаю роздачі'
        presenceData.state = 'яким можна допомогти'
      }
      else if (document.location.pathname.includes('/googlesearch.php')) {
        const search = document.querySelector<HTMLInputElement>(
          'body > div.maxwidth > table > tbody > tr > td.bodyline > table.forumline > tbody > tr > td.row1 > div#___gcse_0 > div.gsc-control-cse.gsc-control-cse-uk > div.gsc-control-wrapper-cse > form.gsc-search-box.gsc-search-box-tools > table.gsc-search-box > tbody > tr > td.gsc-input > div#gsc-iw-id1.gsc-input-box > table#gs_id50.gstl_50.gsc-input > tbody > tr > td#gs_tti50.gsib_a > input#gsc-i-id1.gsc-input',
        )
        presenceData.startTimestamp = browsingTimestamp
        if (search?.textContent === '' || !showSearchQuery) {
          presenceData.details = 'Щось шукаю'
        }
        else {
          presenceData.details = 'Шукаю:'
          presenceData.state = search?.value
        }
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Пошук'
      }
      else if (document.location.pathname.includes('/release.php')) {
        presenceData.startTimestamp = browsingTimestamp
        presenceData.details = 'Додаю торрент'
        if (document.location.search.includes('?what=')) {
          const title = document.querySelector(
            'body > div.maxwidth > table:nth-child(3) > tbody > tr > td.bodyline > form > table.forumline > tbody > tr:nth-child(2) > td.row2 > b',
          )
          presenceData.details += ' в:'
          presenceData.state = title?.textContent
        }
      }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

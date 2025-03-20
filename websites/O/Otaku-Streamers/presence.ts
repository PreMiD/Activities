import { Assets } from 'premid'

const presence = new Presence({
  clientId: '719985436075753492',
})
const path = window.location.pathname
const browsingTimestamp = Math.floor(Date.now() / 1000)

let title, video, timestamps, chapter, blog

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/Otaku-Streamers/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (window.location.hostname === 'otaku-streamers.com') {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/Otaku-Streamers/assets/0.png'
    if (path === '/' || path === '/index.php') {
      presenceData.details = 'Home'
    }
    else if (path.includes('/info/')) {
      title = document.querySelector(
        'tr > td:nth-child(2) > span',
      ) as HTMLTextAreaElement
      if (title) {
        presenceData.details = 'Viewing'
        presenceData.state = title.textContent
      }
      else {
        presenceData.details = 'Error'
        presenceData.smallImageKey = Assets.Search
        presenceData.smallImageText = 'Error'
      }
    }
    else if (path.includes('/watch/')) {
      video = document.querySelector('#osvideo_html5_api') as HTMLVideoElement
      title = document.querySelector(
        '#strw_player > table > tbody > tr:nth-child(1) > td > span:nth-child(1) > a',
      ) as HTMLTextAreaElement
      chapter = document.querySelector('#video_episode') as HTMLTextAreaElement
      if (video) {
        timestamps = presence.getTimestamps(video.currentTime, video.duration)
        if (video.paused && title && video.currentTime !== 0) {
          presenceData.details = 'Paused'
          presenceData.smallImageKey = Assets.Pause
          presenceData.smallImageText = 'Paused'
          delete presenceData.startTimestamp
          delete presenceData.endTimestamp
          presenceData.state = `${title.textContent} ${chapter.textContent}`
        }
        else if (!video.paused && title && video.currentTime !== 0) {
          presenceData.details = 'Playing'
          presenceData.smallImageKey = Assets.Play
          presenceData.smallImageText = 'Playing';
          [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
          presenceData.state = `${title.textContent} ${chapter.textContent}`
        }
        else if (title) {
          presenceData.details = 'Viewing'
          presenceData.state = `${title.textContent} ${chapter.textContent}`
        }
        else {
          presenceData.details = 'Unable To Read Page'
        }
      }
    }
    else if (path.includes('/community/')) {
      title = document.querySelector('#pagetitle > h1') as HTMLTextAreaElement
      if (title) {
        presenceData.details = title.childNodes[0]?.textContent
        if (title.childNodes[1]) {
          presenceData.state = title.childNodes[1].textContent
        }
        else {
          blog = document.querySelector('#blog_title') as HTMLTextAreaElement
          if (blog)
            presenceData.state = blog.textContent
        }
        presenceData.smallImageKey = Assets.Reading
        presenceData.smallImageText = 'Reading'
      }
      else {
        presenceData.details = 'Unable to Read Page'
      }
    }
  }
  else if (window.location.hostname === 'beta.otaku-streamers.com') {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/O/Otaku-Streamers/assets/logo.png'
    switch (path) {
      case '/':
      case '/index.php':
      case '/#': {
        presenceData.details = 'Home'
        break
      }
      case '/news/': {
        presenceData.details = 'Viewing News'
        break
      }
      case '/new-titles/': {
        presenceData.details = 'Viewing New Titles Of This Season'
        break
      }
      default:
        if (path.includes('/genres/')) {
          title = document.querySelector(
            '#main > div.title-box > h4 > u',
          ) as HTMLTextAreaElement
          if (title) {
            presenceData.details = 'Viewing:'
            presenceData.state = title.textContent
          }
          else {
            presenceData.details = 'Viewing Genres'
          }
        }
        else if (path === '/discussions/') {
          presenceData.details = 'Viewing Discussions'
        }
        else if (path.includes('/thread/')) {
          title = document.querySelector('head > title') as HTMLTextAreaElement
          if (title) {
            presenceData.details = 'Discussions:'
            presenceData.state = title.textContent?.replace(
              ' - Otaku-Streamers',
              '',
            )
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = 'Reading'
          }
          else {
            presenceData.details = 'Reading a discusion'
          }
        }
        else if (path.includes('/title/')) {
          title = document.querySelector(
            'div.album-top-box.mb-4.text-left > h1',
          ) as HTMLTextAreaElement
          if (title) {
            presenceData.details = 'Viewing:'
            presenceData.state = title.textContent
          }
          else {
            presenceData.details = 'Viewing a show'
          }
        }
        else if (path.includes('/review/')) {
          title = document.querySelector(
            'div.title-box > h4 > a',
          ) as HTMLTextAreaElement
          if (title) {
            presenceData.details = 'Viewing Reviews:'
            presenceData.state = title.textContent
          }
          else {
            presenceData.details = 'Viewing Reviews'
          }
        }
        else if (path.includes('/watch/')) {
          video = document.querySelectorAll('.vjs-tech')[0] as HTMLVideoElement
          title = document.querySelector('div > h2 > a') as HTMLTextAreaElement
          chapter = document.querySelector(
            'div > h2 > span',
          ) as HTMLTextAreaElement
          if (video && title && chapter) {
            timestamps = presence.getTimestamps(
              video.currentTime,
              video.duration,
            )
            if (video.currentTime !== 0) {
              presenceData.smallImageKey = video.paused
                ? Assets.Pause
                : Assets.Play
              presenceData.smallImageText = video.paused ? 'Paused' : 'Playing'
              if (!video.paused) {
                [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps
                presenceData.details = 'Playing'
                presenceData.state = `${title.textContent} ${chapter.textContent}`
              }
              else {
                delete presenceData.startTimestamp
                delete presenceData.endTimestamp
                presenceData.details = 'Paused'
                presenceData.state = `${title.textContent} ${chapter.textContent}`
              }
            }
            else {
              presenceData.details = 'Watching Some Anime'
            }
          }
        }
        else if (path === '/top-titles/') {
          presenceData.details = 'Viewing Popular Anime'
        }
        else if (path === '/drama/') {
          presenceData.details = 'Viewing Drama'
        }
        else if (path.includes('/member/')) {
          title = document.querySelector(
            '#main > div.master-container-fluid > div.row.justify-content-between > div.col-xl-7.text-center.text-md-left > h1 > span',
          ) as HTMLTextAreaElement
          if (title) {
            presenceData.details = 'Viewing Profile:'
            presenceData.state = title.textContent
          }
        }
    }
  }
  else {
    presenceData.details = 'Site is Unreadable'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

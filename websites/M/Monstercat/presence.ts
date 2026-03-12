import { Assets } from 'premid'

const presence = new Presence({
  clientId: '632013978608074764',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let playing: boolean,
  paused: boolean,
  lastState: string | undefined

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Monstercat/assets/logo.png',
  }

  if (document.location.hostname === 'www.monstercat.com') {
    const progress = document.querySelector<HTMLDivElement>('.progress')?.style?.cssText.replace('width: ', '').replace('%;', '') // Replace everything so only "x.xxxx" is left (x standing for numbers)
    if (lastState === progress && progress !== '0' && progress !== '100') {
      playing = true
      paused = true
    }
    else if (progress === '0' || progress === '100') {
      playing = false
      paused = true
    }
    else {
      playing = true
      paused = false
    }
    lastState = progress

    const progressNumber = Number(progress)
    const progressRounded = Math.round(progressNumber)

    if (playing === true && paused === false) {
      const title = document.querySelector(
        'body > header > div.container.player > div.flex.controls.push-right.playing > a > span',
      )
      presenceData.details = title?.textContent
      presenceData.state = `${progressRounded}% progressed`
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = 'Playing'
    }
    else if (playing === true && paused === true) {
      const title = document.querySelector(
        'body > header > div.container.player > div.flex.controls.push-right.playing > a > span',
      )
      presenceData.details = title?.textContent
      presenceData.state = `${progress}% progressed`
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Paused'
    }
    else {
      // If there is no song playing display site information
      presenceData.startTimestamp = browsingTimestamp
      if (document.location.pathname.includes('/release/')) {
        const title = document.querySelector(
          'body > section > div:nth-child(1) > div.container.flex > div > h1',
        )
        const user = document.querySelector(
          'body > section > div:nth-child(1) > div.container.flex > div > h3',
        )
        presenceData.details = 'Viewing release:'
        presenceData.state = `${title?.textContent} by ${user?.textContent}`
      }
      else if (document.location.pathname.includes('/artist/')) {
        const user = document.querySelector(
          'body > section > div.top-banner > div.container.flex > div > div > h1',
        )
        presenceData.details = 'Viewing artist:'
        presenceData.state = user?.textContent
      }
      else if (document.location.pathname.includes('/music')) {
        presenceData.details = 'Browsing music releases...'
      }
      else if (document.location.pathname.includes('/browse')) {
        presenceData.details = 'Browsing...'
      }
      else if (document.location.pathname.includes('/catalog')) {
        presenceData.details = 'Viewing catalog'
      }
      else if (document.location.pathname.includes('/artists')) {
        presenceData.details = 'Viewing artists'
      }
      else if (document.location.pathname.includes('/playlist/')) {
        const title = document.querySelector('body > section > div > h1')
        presenceData.details = 'Viewing playlist:'
        presenceData.state = title?.textContent
      }
      else if (document.location.pathname.includes('/playlists')) {
        presenceData.details = 'Viewing their playlists'
      }
      else if (document.location.pathname.includes('/events')) {
        presenceData.details = 'Viewing events'
      }
      else if (document.location.pathname.includes('/event/')) {
        const title = document.querySelector(
          'body > section > div.event-page-header > div > div.container.container--event-header.flex > div > a.silent.no-hover > h1',
        )
        presenceData.details = 'Reading about event:'
        if (title?.textContent && title.textContent.length > 128) {
          presenceData.state = `${title.textContent.substring(
            0,
            125,
          )}...`
        }
        else {
          presenceData.state = title?.textContent
        }

        presenceData.smallImageKey = Assets.Reading
      }
      else if (document.location.pathname.includes('/publishing')) {
        presenceData.details = 'Viewing publishing'
      }
      else if (document.location.pathname.includes('/cotw')) {
        presenceData.details = 'Viewing radio'
      }
      else if (document.location.pathname.includes('/gold')) {
        presenceData.details = 'Viewing Monstercat Gold'
      }
      else if (document.location.pathname.includes('/account')) {
        presenceData.details = 'Viewing their account'
      }
      else if (document.location.pathname.includes('/blog/')) {
        if (document.location.pathname.includes('/tags/')) {
          const title = document.querySelector('head > title')
          presenceData.details = 'Blog - Viewing tag:'
          presenceData.state = title?.textContent?.replace(
            ' Posts - Monstercat',
            '',
          )
        }
        else {
          const title = document.querySelector(
            'body > section > div.panel.panel--article > header > h1',
          )
          presenceData.details = 'Reading article:'
          if (title?.textContent && title.textContent.length > 128) {
            presenceData.state = `${title.textContent.substring(0, 125)}...`
          }
          else {
            presenceData.state = title?.textContent
          }

          presenceData.smallImageKey = Assets.Reading
        }
      }
      else if (document.location.pathname.includes('/blog')) {
        presenceData.details = 'Viewing blog posts'
      }
      else if (document.location.pathname.includes('/search')) {
        const search = document.querySelector<HTMLInputElement>(
          'body > header > div.container.player > div.col-xs-hidden.col-md-visible.global-search > form > input[type=text]',
        )
        presenceData.details = 'Searching for:'
        presenceData.state = search?.value
        presenceData.smallImageKey = Assets.Search
      }
      else if (document.location.pathname === '/') {
        presenceData.details = 'Viewing homepage'
      }
    }
  }
  else if (document.location.hostname === 'shop.monstercat.com') {
    presenceData.startTimestamp = browsingTimestamp
    if (document.location.pathname.includes('/products/')) {
      presenceData.details = 'Shop - Viewing product:'
      const title = document.querySelector(
        '#product-description > div:nth-child(1) > h1',
      )
      if (title?.textContent && title.textContent.length > 128) {
        presenceData.state = `${title.textContent.substring(
          0,
          125,
        )}...`
      }
      else {
        presenceData.state = title?.textContent
      }
    }
    else if (document.location.pathname.includes('/collections/')) {
      presenceData.details = 'Shop - Viewing collection:'
      const title = document.querySelector('#collection-description > h1')
      presenceData.state = title?.textContent
    }
    else if (document.location.pathname.includes('/cart')) {
      presenceData.details = 'Shop - Viewing cart'
    }
    else if (document.location.pathname === '/') {
      presenceData.details = 'Viewing store front'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

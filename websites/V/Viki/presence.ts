import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '614387676467953674',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  live: 'general.live',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  // Get the video
  const video = document.querySelector<HTMLVideoElement>('video.vjs-tech')

  if (!video) {
    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Viki/assets/logo.png',
    }

    presenceData.startTimestamp = browsingTimestamp

    if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname === '/'
    ) {
      presenceData.details = 'Browsing through'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = 'the main page'
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/categories/country/all/genre/')
    ) {
      const title = document.querySelector(
        '#__next > div.page-wrapper > main > div > div.sc-lzgak0-0.VQRoS > h1',
      )

      presenceData.details = 'Browsing through genre:'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = title?.textContent
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/new-and-coming-soon')
    ) {
      const title = document.querySelector(
        '#__next > div.page-wrapper > main > div > div.sc-lzgak0-0.VQRoS > h1',
      )

      presenceData.details = 'Browsing through:'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = `${title?.textContent}`
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/collections/')
    ) {
      const title = document.querySelector(
        '#__next > div.page-wrapper > main > div.sc-ut95nx-0.fbdpde > div.sc-1bpy9iy-0.fPvbbo > div.sc-1bpy9iy-1.iRuisU > div.sc-mpx6ys-4.sOghX',
      )
      presenceData.details = 'Browsing through the collection'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = title?.textContent
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/partners')
    ) {
      presenceData.details = 'Viewing the partner page'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/advertise')
    ) {
      presenceData.details = 'Viewing the advertisers page'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/press')
    ) {
      presenceData.details = 'Viewing the press center'
      presenceData.smallImageKey = Assets.Reading
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/users/')
      && document.location.pathname.includes('/overview')
    ) {
      const title = document.querySelector(
        'div.page-wrapper > main > div > div > div > div > span',
      )
      presenceData.details = 'Viewing the profile of:'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = title?.textContent
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/users/')
      && document.location.pathname.includes('/reviews')
    ) {
      const title = document.querySelector(
        'div.page-wrapper > main > div > div > div > div > span',
      )

      presenceData.details = 'Viewing the reviews by:'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = title?.textContent
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/users/')
      && document.location.pathname.includes('/collections')
    ) {
      const title = document.querySelector(
        'div.page-wrapper > main > div > div > div > div > span',
      )

      presenceData.details = 'Viewing the collections by:'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = title?.textContent
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/users/')
      && document.location.pathname.includes('/connection')
    ) {
      const title = document.querySelector(
        'div.page-wrapper > main > div > div > div > div > span',
      )

      presenceData.details = 'Viewing the connections'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = `of: ${title?.textContent}`
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/users/')
      && document.location.pathname.includes('/following')
    ) {
      const title = document.querySelector(
        'div.page-wrapper > main > div > div > div > div > span',
      )

      presenceData.details = 'Viewing all the things'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = `${title?.textContent} follows`
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/celebrities/')
    ) {
      const title = document.querySelector(
        'div.page-wrapper > main > div.sc-t50ryb-0.chjqhy > div.sc-vn2ve1-0.icbNCN.sc-t50ryb-1.ddxSIs > div.sc-vn2ve1-1.gYHyae > span.sc-bdvvtL.fFPESN',
      )

      presenceData.details = 'Viewing the celeb profile'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = `of: ${title?.textContent}`
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/genres/')
    ) {
      const title = document.querySelector(
        'body > div.page-wrapper > header > div.container > div > div.col.s12.m12.l7 > h1',
      )

      presenceData.details = 'Browsing through genre:'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = title?.textContent
    }
    else if (
      document.location.hostname === 'blog.viki.com'
      && document.location.pathname.includes('/tagged/news')
    ) {
      presenceData.details = 'Browsing the Viki blogs'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = 'Reading latest news'
    }
    else if (
      document.location.hostname === 'blog.viki.com'
      && document.location.pathname.includes('/tagged/product')
    ) {
      presenceData.details = 'Browsing the Viki blogs'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = 'Reading latest products'
    }
    else if (
      document.location.hostname === 'blog.viki.com'
      && document.location.pathname.includes('/tagged/engineering')
    ) {
      presenceData.details = 'Browsing the Viki blogs'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = 'Reading latest engineering'
    }
    else if (
      document.location.hostname === 'blog.viki.com'
      && document.location.pathname.includes('/tagged/qc-rewards')
    ) {
      presenceData.details = 'Browsing the Viki blogs'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = 'Reading latest qc-rewards'
    }
    else if (
      document.location.hostname === 'blog.viki.com'
      && document.location.pathname.includes('/about')
    ) {
      presenceData.details = 'Viewing the about page'
      presenceData.smallImageKey = Assets.Reading
      delete presenceData.state
    }
    else if (
      document.location.hostname === 'blog.viki.com'
      && document.location.pathname.includes('/')
      && document.location.pathname.includes('-')
    ) {
      const title = document.querySelector('#a29a')

      presenceData.details = 'Reading blog post:'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = title?.textContent
    }
    else if (
      document.location.hostname === 'blog.viki.com'
      && document.location.pathname.includes('/search')
    ) {
      const title = document.querySelector<HTMLInputElement>(
        '#root > div > div.l.c > div.l.m.n.o.c > div.p.q.r.ab.ac > div.ab.q.ae > div > div > input',
      )

      presenceData.details = 'Searching for:'
      presenceData.smallImageKey = Assets.Search
      presenceData.state = title?.value
    }
    else if (
      document.location.hostname === 'blog.viki.com'
      && document.location.pathname.includes('/')
    ) {
      presenceData.details = 'Browsing through the'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = 'main blog page'
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/apps')
    ) {
      presenceData.details = 'Viewing the'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = 'Viki applications'
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/search')
    ) {
      const title = document.querySelector(
        '#__next > div.page-wrapper > main > div > div.sc-k3yneb-1.ZJdyd > ol > li.sc-k3yneb-2.kZcrBo > span',
      )

      presenceData.details = 'Searching for:'
      presenceData.smallImageKey = Assets.Search
      presenceData.state = title?.textContent
    }
    else if (document.location.hostname === 'support.viki.com') {
      presenceData.details = 'Viki Support page'
      delete presenceData.smallImageKey
      delete presenceData.state
    }
    else if (document.location.hostname === 'contribute.viki.com') {
      presenceData.details = 'Viki Contribution page'
      delete presenceData.smallImageKey
      delete presenceData.state
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/categories/')
      && document.location.pathname.includes('/country/')
    ) {
      const title = document.querySelector(
        '#__next > div.page-wrapper > main > div > div.sc-lzgak0-0.VQRoS > h1',
      )
      presenceData.details = 'Browsing through country'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = title?.textContent
    }
    else if (
      document.location.hostname === 'www.viki.com'
      && document.location.pathname.includes('/categories/')
      && document.location.pathname.includes('/others')
    ) {
      const title = document.querySelector(
        '#__next > div.page-wrapper > main > div > div.sc-lzgak0-0.VQRoS > h1',
      )
      presenceData.details = 'Browsing through genre'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = title?.textContent
    }

    presence.setActivity(presenceData)
  }

  // Check if it can find the video
  if (video && !Number.isNaN(video.duration)) {
    const timestamps = presence.getTimestamps(
      Math.floor(video.currentTime),
      Math.floor(video.duration),
    )
    const presenceData: PresenceData = {
      type: ActivityType.Watching,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/Viki/assets/logo.png',
      smallImageKey: video.paused ? Assets.Pause : Assets.Play,
      smallImageText: video.paused
        ? (await strings).pause
        : (await strings).play,
      startTimestamp: timestamps[0],
      endTimestamp: timestamps[1],
    }
    const title = document.querySelector('#channel-link > span')?.textContent
    presenceData.details = title?.split(': ').pop()
    presenceData.state = title?.split(': ').shift()

    if (video.paused) {
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }

    presence.setActivity(presenceData, !video.paused)
  }
})

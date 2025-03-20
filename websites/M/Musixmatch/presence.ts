const presence = new Presence({
  clientId: '1004813284253380628',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Musixmatch/assets/0.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname } = document.location

  if (hostname === 'musixmatch.com' || hostname === 'www.musixmatch.com') {
    if (pathname === '/') {
      presenceData.details = 'Viewing the home page'
    }
    else if (pathname.includes('/explore')) {
      presenceData.details = 'Exploring lyrics'
    }
    else if (pathname.includes('/community')) {
      presenceData.details = 'Viewing the community page'
    }
    else if (pathname.includes('/contribute')) {
      presenceData.details = 'Viewing the contribute page'
    }
    else if (pathname.includes('/profile/')) {
      // if user status = curator show curator badge
      if (
        document.querySelector(
          '#site > div > div > div > main > .mxm-page > .mxm-user-header > .container > .row > div > div > div > span',
        )
      ) {
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/Musixmatch/assets/1.png'
        presenceData.smallImageText = 'Curator'
      }
      if (pathname === '/profile/me') {
        presenceData.details = 'Viewing their profile'
      }
      else {
        presenceData.details = `Viewing ${
          document.querySelector('#site h1')?.textContent
        }'s profile`
      }
    }
    else if (pathname.includes('/search')) {
      presenceData.details = 'Searching'
      presenceData.state = pathname.split('/')[2]?.replaceAll('%20', ' ')
    }
    else if (
      pathname.includes('/lyrics')
      && pathname.includes('/translation/')
    ) {
      presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
        '[property="og:image"]',
      )?.content
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/Musixmatch/assets/0.png'
      presenceData.details = `Reading ${pathname.split('/')[5]} translation`
      presenceData.state = `${
        document.querySelector('#site h2 > span > a')?.textContent
        || document.querySelector('#site h2 > span > span > a')?.textContent
      } - ${document.querySelector('#site h1')?.childNodes[1]?.textContent}`
    }
    else if (pathname.includes('/lyrics')) {
      presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
        '[property="og:image"]',
      )?.content
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/Musixmatch/assets/0.png'
      presenceData.details = 'Reading lyrics'
      presenceData.state = `${
        document.querySelector('#site h2 > span > a')?.textContent
        || document.querySelector('#site h2 > span > span > a')?.textContent
      } - ${document.querySelector('#site h1')?.childNodes[1]?.textContent}`
    }
    else if (pathname.includes('/artist')) {
      const avatar = document.querySelector<HTMLMetaElement>(
        '[property="og:image"]',
      )?.content
      if (!avatar?.includes('avatar-placeholder.png')) {
        presenceData.largeImageKey = avatar
        presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/M/Musixmatch/assets/0.png'
      }
      presenceData.details = 'Browsing artist'
      presenceData.state = document.querySelector(
        '#site > #artist-page > #content h1',
      )?.textContent
    }
  }
  else if (hostname === 'curators.musixmatch.com') {
    if (pathname === '/' || pathname === '/missions') {
      presenceData.details = 'Browsing curator\'s missions'
    }
    else if (pathname.includes('/tasks/')) {
      presenceData.details = `Browsing ${
        document.querySelector(
          '#__next > div > div > div > div > div > div > div:nth-child(2) > div.css-1dbjc4n.r-1p0dtai.r-1d2f490.r-12vffkv.r-u8s1d.r-zchlnj.r-ipm5af > div.css-1dbjc4n.r-13awgt0.r-12vffkv > div > div > div > div > div > div.css-1dbjc4n.r-1mdbw0j.r-1guathk > div > div.css-1dbjc4n.r-obd0qt.r-18u37iz.r-1wtj0ep.r-1wzrnnt > div.css-901oao.r-jwli3a.r-1grxjyw.r-uho16t.r-146t82q.r-tskmnb.r-fdjqy7',
        )?.textContent
      } tasks`
    }
    else if (pathname.includes('/tool')) {
      presenceData.details = 'Editing lyrics'
      presenceData.state = `${
        document.querySelector(
          '#__next > div > div > div > div > div > div > div > div.css-1dbjc4n.r-1p0dtai.r-1d2f490.r-12vffkv.r-u8s1d.r-zchlnj.r-ipm5af > div.css-1dbjc4n.r-13awgt0.r-12vffkv > div > div > div > div > div > div > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(1) > div.css-1dbjc4n.r-13awgt0.r-1jkjb > div.css-901oao.css-bfa6kz.r-a023e6.r-rjixqe.r-fdjqy7',
        )?.textContent
      } - ${
        document.querySelector(
          '#__next > div > div > div > div > div > div > div > div.css-1dbjc4n.r-1p0dtai.r-1d2f490.r-12vffkv.r-u8s1d.r-zchlnj.r-ipm5af > div.css-1dbjc4n.r-13awgt0.r-12vffkv > div > div > div > div > div > div > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(1) > div.css-1dbjc4n.r-13awgt0.r-1jkjb > div.css-901oao.css-bfa6kz.r-jwli3a.r-1inkyih.r-1kfrs79.r-rjixqe.r-fdjqy7',
        )?.textContent
      }`
    }
  }

  presence.setActivity(presenceData)
})

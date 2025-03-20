import { Assets } from 'premid'

let elapsed = Math.floor(Date.now() / 1000)
let prevUrl = document.location.href

const presence = new Presence({
  clientId: '853718947412967474',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
  browsing: 'general.browsing',
  browsingThrough: 'discord.browseThrough',
  buttonWatchVideo: 'general.buttonWatchVideo',
  buttonWatchStream: 'general.buttonWatchStream',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/ARD%20Mediathek/assets/logo.png',
  ThreeSat = 'https://cdn.rcd.gg/PreMiD/websites/A/ARD%20Mediathek/assets/0.png',
  Deutschewelle = 'https://cdn.rcd.gg/PreMiD/websites/A/ARD%20Mediathek/assets/1.png',
  Kika = 'https://cdn.rcd.gg/PreMiD/websites/A/ARD%20Mediathek/assets/2.png',
  ArdMediathek = 'https://cdn.rcd.gg/PreMiD/websites/A/ARD%20Mediathek/assets/3.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  const path = location.pathname.replace(/\/?$/, '/')

  if (document.location.href !== prevUrl) {
    prevUrl = document.location.href
    elapsed = Math.floor(Date.now() / 1000)
  }

  if (path.startsWith('/video/') || path.startsWith('/live/')) {
    // Streaming
    const videoTitle = document.querySelector(
      '.H2-sc-1h18a06-3.fZOeKY',
    )?.textContent
    const video = document.querySelector<HTMLVideoElement>(
      '.ardplayer-mediacanvas',
    )!

    if (path.startsWith('/live/')) {
      // Livestream
      const channelLinkA = document.querySelector('.LogoLink-pae2yt-13.eOVFv')
      if (channelLinkA) {
        presenceData.largeImageKey = channelLinkA
          .getAttribute('href')
          ?.replace(/\//g, '')
      }
      else {
        // 3sat or KiKa or DeutscheWelle (speciality due to inconsistency in website -.-)
        const channelLinkIMG = document
          .querySelector('.src__Box-sc-1sbtrzs-0.Column-wbrv0h-1.llCdnS.hkXjQv')
          ?.children[0]
          ?.children[0]
          ?.getAttribute('src')
        if (channelLinkIMG === '/images/KdbelgIm.svg')
          presenceData.largeImageKey = ActivityAssets.ThreeSat
        else if (channelLinkIMG === '/images/siBNbNWW.svg')
          presenceData.largeImageKey = ActivityAssets.Deutschewelle
        else presenceData.largeImageKey = ActivityAssets.Kika
      }

      presenceData.smallImageKey = Assets.Live
      presenceData.smallImageText = 'Live'
      presenceData.details = `${document.title
        .replace(/Livestream \| ARD-Mediathek/, '')
        .replace(/ Livestream national \| ARD-Mediathek/g, '')} Live`
      presenceData.state = videoTitle
      presenceData.startTimestamp = elapsed
      presenceData.buttons = [
        { label: (await strings).buttonWatchStream, url: prevUrl },
      ]
    }
    else if (path.startsWith('/video/')) {
      // Video-on-demand
      presenceData.largeImageKey = ActivityAssets.ArdMediathek
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).play
      presenceData.details = videoTitle

      const videoDateDIV = document.querySelector('.Line-epbftj-1.dgMIUj')
      presenceData.state = `${
        videoDateDIV?.children[0]?.textContent
      } from ${videoDateDIV?.textContent?.substring(
        0,
        videoDateDIV.textContent.indexOf('∙') - 1,
      )}`;

      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
      presenceData.buttons = [
        { label: (await strings).buttonWatchVideo, url: prevUrl },
      ]
    }

    // Player paused ?
    if (video.paused) {
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = (await strings).pause
      delete presenceData.startTimestamp
      delete presenceData.endTimestamp
    }
  }
  else {
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = (await strings).browsingThrough
    presenceData.details = (await strings).browsing
    presenceData.startTimestamp = elapsed
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

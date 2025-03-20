import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '782853565550034954',
})
const strings = presence.getStrings({
  play: 'general.playing',
  pause: 'general.paused',
})
const stationIDMap: { [key: string]: string } = {
  olliolliworld: 'OlliOlli World',
  spacechannel5: 'Space Channel 5',
  live: 'Jet Set Radio Live',
  outerspace: 'Outer Space',
  classic: 'Classic',
  future: 'Future',
  ultraremixes: 'Ultra Remixes',
  garage: 'The Garage',
  ggs: 'GG\'s',
  noisetanks: 'Noise Tanks',
  poisonjam: 'Poison Jam',
  rapid99: 'Rapid 99',
  loveshockers: 'Love Shockers',
  immortals: 'The Immortals',
  doomriders: 'Doom Riders',
  goldenrhinos: 'Golden Rhinos',
  ganjah: 'Ganjah',
  lofi: 'Lo-Fi',
  chiptunes: 'Chiptunes',
  retroremix: 'Retro Remix',
  classical: 'Classical Remix',
  revolution: 'Revolution',
  endofdays: 'End of Days',
  silvagunner: 'SilvaGunner x JSR',
  futuregeneration: 'Future Generation',
  jetmashradio: 'Jet Mash Radio',
  memoriesoftokyoto: 'Memories of Tokyo-to',
  tokyotofuture: 'Sounds of Tokyo-to Future',
  crazytaxi: 'Crazy Taxi',
  ollieking: 'Ollie King',
  toejamandearl: 'Toe Jam & Earl',
  hover: 'Hover',
  butterflies: 'Butterflies',
  lethalleagueblaze: 'Lethal League Blaze',
  bonafidebloom: 'BonafideBloom',
  djchidow: 'DJ Chidow',
  verafx: 'VeraFX',
  summer: 'Summer',
  halloween: 'Halloween',
  christmas: 'Christmas',
  snowfi: 'Snow-Fi',
  brc: 'Bomb Rush Cyberfunk',
  elaquent: 'Elaquent',
  turntablism: 'Turntablism',
  sonicrush: 'Sonic Rush',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/Jet%20Set%20Radio%20Live/assets/logo.png',
  }
  const audio = document.querySelector<HTMLAudioElement>('#audioPlayer')
  const songName = document.querySelector(
    '#programInformationText.objectSettings.touchableOff',
  )
  const buttons = await presence.getSetting<boolean>('buttons')

  if ((songName?.textContent && songName.textContent.length < 1) || !audio) {
    presenceData.details = 'Not tuned in.'
  }
  else {
    const stationImage = document.querySelector<HTMLImageElement>('#graffitiSoul')?.src
    const stationName = stationIDMap[stationImage?.split('/')[5] ?? '']
    presenceData.largeImageKey = stationImage
    if (stationName)
      presenceData.state = stationName

    if (
      !audio.paused
      && !document.querySelector('#loadingTrackCircle:not([style*="hidden"])')
    ) {
      if (await presence.getSetting<boolean>('song'))
        presenceData.details = songName?.textContent
      if (
        (await presence.getSetting<boolean>('timestamp'))
        && Number.isFinite(audio.duration)
      ) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(audio)
      }
      presenceData.smallImageKey = Assets.Play
      presenceData.smallImageText = (await strings).play
    }
    else {
      presenceData.details = 'Paused'
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = (await strings).pause
    }

    if (buttons) {
      presenceData.buttons = [
        {
          label: 'Tune In',
          url: document.URL,
        },
      ]
    }
  }

  if (!presenceData.details && presenceData.state)
    presence.setActivity()
  else presence.setActivity(presenceData)
})

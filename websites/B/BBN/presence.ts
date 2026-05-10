import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1503081269427437588',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

interface SectionState {
  state: string
  smallImageKey?: string
  smallImageText?: string
}

const SECTIONS: Record<string, SectionState> = {
  about: { state: 'Lit l\'histoire de BBN' },
  universe: { state: 'Explore l\'univers BBN' },
  malife: { state: 'Regarde les photos' },
  setup: {
    state: 'Découvre le setup PC',
    smallImageKey: 'setup',
    smallImageText: 'Ryzen 7 7800X3D · RX 9070 XT',
  },
  rediff: {
    state: 'Regarde la dernière rediff',
    smallImageKey: 'twitch',
    smallImageText: 'Twitch',
  },
  socials: { state: 'Découvre les réseaux' },
  contact: { state: 'Envoie un message' },
}

presence.on('UpdateData', () => {
  const path = document.location.pathname
  const hash = (document.location.hash || '').replace('#', '').toLowerCase()

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: 'bbn',
    largeImageText: 'BBN — bbncorps.fr',
    details: 'BBN · Streamer & Créateur',
    state: 'Maurice × Paris',
    startTimestamp: browsingTimestamp,
    buttons: [
      { label: 'Visiter le site', url: 'https://bbncorps.fr/' },
      { label: 'Suivre sur Twitch', url: 'https://www.twitch.tv/bbn_zm/' },
    ],
  }

  if (hash && SECTIONS[hash]) {
    const section = SECTIONS[hash]
    presenceData.state = section.state
    if (section.smallImageKey) {
      presenceData.smallImageKey = section.smallImageKey
      presenceData.smallImageText = section.smallImageText
    }
  }

  if (path === '/' || path === '') {
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity({
      ...presenceData,
      state: 'Sur le site',
    })
  }
})

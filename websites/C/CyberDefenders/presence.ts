const presence = new Presence({
  clientId: '1046391448133701672',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

const enum Assets {
  Logo = 'https://cdn.discordapp.com/app-assets/1046391448133701672/1490308411441549432.png?size=512',
  Labs = 'https://cdn.discordapp.com/app-assets/1046391448133701672/1490360031940706385.png?size=512',
  CertifyL1 = 'https://cdn.discordapp.com/app-assets/1046391448133701672/1495835652389077173.png?size=512',
  CertifyL2 = 'https://cdn.discordapp.com/app-assets/1046391448133701672/1495835652766437456.png?size=512',
}

const certDisplayNames: Record<string, string> = {
  'certified-cyberdefender-level1-certification': 'CCDL1',
  'certified-cyberdefender-level2-certification': 'CCDL2',
}

function extractFromTitle(pattern: RegExp): string | null {
  const match = document.title.match(pattern)
  return match?.[1]?.trim() ?? null
}

function formatSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function getCertName(certSlug: string): string {
  return (
    certDisplayNames[certSlug]
    ?? extractFromTitle(/^(.+?)\s*-\s*Dashboard\s*\|\s*CyberDefenders/)
    ?? formatSlug(certSlug)
  )
}

function getPathSegments(): string[] {
  return document.location.pathname.split('/').filter(Boolean)
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: Assets.Logo,
    startTimestamp: browsingTimestamp,
  }

  const [showProgress, privacyMode] = await Promise.all([
    presence.getSetting<boolean>('showProgress'),
    presence.getSetting<boolean>('privacyMode'),
  ])

  const path = getPathSegments()
  const firstSegment = path[0] ?? ''

  switch (firstSegment) {
    case '': {
      presenceData.details = 'Browsing CyberDefenders'
      presenceData.state = 'Homepage'
      break
    }

    case 'blue-team-labs': {
      presenceData.largeImageKey = Assets.Labs
      presenceData.details = 'Browsing Blue Team Labs'
      break
    }

    case 'blueteam-ctf-challenges': {
      presenceData.largeImageKey = Assets.Labs

      if (path[1] === 'leaderboard') {
        presenceData.largeImageKey = Assets.Logo
        presenceData.details = 'Viewing Leaderboard'
        presenceData.state = 'BlueYard Rankings'
      }
      else if (path[1]) {
        const challengeName =
          extractFromTitle(/^(.+?)\s*[-|]\s*CyberDefenders/)
          ?? formatSlug(path[1])
        presenceData.details = privacyMode
          ? 'Viewing a Challenge'
          : `Viewing Challenge: ${challengeName}`
      }
      else {
        presenceData.details = 'Browsing CTF Challenges'
        presenceData.state = 'BlueYard'
      }
      break
    }

    case 'certify': {
      if (!path[1]) {
        presenceData.details = 'Browsing Certifications'
      }
      else {
        const certSlug = path[1]

        if (certSlug.includes('level2'))
          presenceData.largeImageKey = Assets.CertifyL2
        else
          presenceData.largeImageKey = Assets.CertifyL1

        const certName = getCertName(certSlug)
        const displayName = privacyMode ? 'a Certification' : certName

        if (path[2] === 'exams') {
          presenceData.details = 'Taking an Exam'
          presenceData.state = displayName
        }
        else if (path[2] === 'labs') {
          presenceData.details = privacyMode
            ? 'Practicing: a Certification'
            : `Practicing: ${certName}`
          presenceData.state = 'Certification Labs'
        }
        else if (path[2] === 'lessons') {
          presenceData.details = privacyMode
            ? 'Studying: a Certification'
            : `Studying: ${certName}`

          if (showProgress) {
            const progressEl = document.querySelector(
              '[role="progressbar"], .progress-bar, [data-progress]',
            )
            const progressValue =
              progressEl?.getAttribute('aria-valuenow')
              ?? progressEl?.getAttribute('data-progress')
              ?? progressEl?.getAttribute('style')?.match(/width:\s*(\d+)%/)?.[1]

            presenceData.state = progressValue
              ? `Lessons (${progressValue}%)`
              : 'Lessons'
          }
          else {
            presenceData.state = 'Lessons'
          }
        }
        else {
          presenceData.details = privacyMode
            ? 'Studying: a Certification'
            : `Studying: ${certName}`
          presenceData.state = 'Dashboard'
        }
      }
      break
    }

    case 'tracks': {
      presenceData.largeImageKey = Assets.Labs

      if (path[1]) {
        const trackName =
          extractFromTitle(/^(.+?)\s+Track\s*-\s*CyberDefenders/)
          ?? formatSlug(path[1])
        presenceData.details = privacyMode
          ? 'Viewing a Track'
          : `Viewing Track: ${trackName}`
      }
      else {
        presenceData.details = 'Browsing Learning Tracks'
      }
      break
    }

    case 'p': {
      presenceData.largeImageKey = Assets.Logo
      if (path[1]) {
        const username =
          extractFromTitle(/^(.+?)\s*\|\s*CyberDefenders/) ?? path[1]
        presenceData.details = 'Viewing Profile'
        presenceData.state = privacyMode ? 'a User' : username
      }
      else {
        presenceData.details = 'Viewing Profile'
      }
      break
    }

    case 'blog': {
      presenceData.largeImageKey = Assets.Logo

      if (path[1]) {
        const postTitle =
          extractFromTitle(/^(.+?)\s*\|\s*CyberDefenders Blog/)
          ?? formatSlug(path[1])
        presenceData.details = 'Reading Blog Post'
        presenceData.state = privacyMode ? 'an Article' : postTitle
      }
      else {
        presenceData.details = 'Browsing Blog'
      }
      break
    }

    case 'walkthroughs': {
      presenceData.largeImageKey = Assets.Labs

      if (path[1]) {
        const name = formatSlug(path[1])
        presenceData.details = 'Reading Walkthrough'
        presenceData.state = privacyMode ? 'a Walkthrough' : name
      }
      else {
        presenceData.details = 'Browsing Walkthroughs'
      }
      break
    }

    case 'cybersecurity-glossary': {
      presenceData.details = 'Browsing Glossary'
      break
    }

    case 'online-labs': {
      presenceData.largeImageKey = Assets.Labs

      if (path[1] === 'labs' && path[2]) {
        const labName =
          extractFromTitle(/^(.+?)\s*[-|]\s*CyberDefenders/)
          ?? formatSlug(path[2])
        presenceData.details = privacyMode
          ? 'Solving a Lab'
          : `Solving: ${labName}`
        presenceData.state = 'Online Labs'
      }
      else {
        presenceData.details = 'In a Lab Environment'
        presenceData.state = 'Online Labs'
      }
      break
    }

    case 'accounts': {
      if (path[1] === 'login') {
        presenceData.details = 'Logging in'
      }
      else if (path[1] === 'signup') {
        presenceData.details = 'Creating account'
      }
      else {
        presenceData.details = 'Browsing CyberDefenders'
      }
      break
    }

    case 'pricing': {
      presenceData.details = 'Viewing Pricing'
      break
    }

    default: {
      presenceData.details = 'Browsing CyberDefenders'
      break
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.setActivity()
})

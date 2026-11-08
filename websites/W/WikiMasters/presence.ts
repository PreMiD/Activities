const presence = new Presence({
  clientId: '1551307913526513815',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/WikiMasters/assets/logo.png',
}

presence.on('UpdateData', () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  switch (pathname) {
    case '/pulls': {
      presenceData.details = 'Opening packs'

      const match = (document.body.textContent ?? '').match(
        /(\d+)\s*\/\s*(\d+)\s*paquets disponibles/i,
      )

      if (match)
        presenceData.state = `${match[1]} / ${match[2]} packs available`

      break
    }

    case '/collection': {
      const modal = document.querySelector<HTMLElement>(
        'div.fixed.inset-0.z-50',
      )

      if (modal) {
        const text = modal.textContent ?? ''

        const cardMatch = text.match(
          /\n([^\n]+)\n(Légendaire|Ultra Rare|Super Rare|Rare|Peu Commune|Commune)\nDétails/i,
        )

        const statsMatch = text.match(
          /([\d \u202F\u00A0]+)\nATK\n([\d \u202F\u00A0]+)\nDEF/i,
        )

        if (cardMatch) {
          presenceData.details = `Viewing ${cardMatch[1]}`
          presenceData.state = cardMatch[2]

          if (statsMatch) {
            const atk = statsMatch[1]?.replace(/[ \u202F\u00A0]/g, '')
            const def = statsMatch[2]?.replace(/[ \u202F\u00A0]/g, '')

            presenceData.state += ` • ${atk} ATK • ${def} DEF`
          }
        }
      }
      else {
        presenceData.details = 'Browsing collection'

        const match = (document.body.textContent ?? '').match(
          /Page\s*(\d+)\s*\/\s*(\d+)/i,
        )

        if (match)
          presenceData.state = `Page ${match[1]} / ${match[2]}`
      }

      break
    }

    case '/trades': {
      presenceData.details = 'Managing trades'

      const bodyText = document.body.textContent ?? ''

      const match = bodyText.match(
        /(\d+)\s+offres? reçues?/i,
      )

      if (match) {
        presenceData.state = `${match[1]} received trade${match[1] === '1' ? '' : 's'}`
      }
      else if (/Aucune offre reçue en attente/i.test(bodyText)) {
        presenceData.state = 'No pending trades'
      }

      break
    }

    case '/marketplace': {
      presenceData.details = 'Browsing marketplace'

      const match = (document.body.textContent ?? '').match(
        /Parcourir\s*\((\d+)\)/i,
      )

      if (match)
        presenceData.state = `${match[1]} listings`

      break
    }

    case '/profile': {
      presenceData.details = 'Viewing profile'

      const match = (document.body.textContent ?? '').match(
        /(\d+(?:[ \u202F\u00A0]\d+)*)[ \u202F\u00A0]+Cartes uniques/i,
      )

      if (match) {
        const cards = match[1]?.replace(/[ \u202F\u00A0]/g, '')
        presenceData.state = `${cards} unique cards`
      }

      break
    }

    case '/global-collection': {
      const modal = document.querySelector<HTMLElement>(
        'div.fixed.inset-0.z-50',
      )

      if (modal) {
        const text = modal.textContent ?? ''

        const cardMatch = text.match(
          /\n([^\n]+)\n(Légendaire|Ultra Rare|Super Rare|Rare|Peu Commune|Commune)\nDétails/i,
        )

        const statsMatch = text.match(
          /([\d \u202F\u00A0]+)\nATK\n([\d \u202F\u00A0]+)\nDEF/i,
        )

        if (cardMatch) {
          presenceData.details = `Viewing ${cardMatch[1]}`
          presenceData.state = cardMatch[2]

          if (statsMatch) {
            const atk = statsMatch[1]?.replace(/[ \u202F\u00A0]/g, '')
            const def = statsMatch[2]?.replace(/[ \u202F\u00A0]/g, '')

            presenceData.state += ` • ${atk} ATK • ${def} DEF`
          }
        }
      }
      else {
        presenceData.details = 'Browsing all cards'

        const match = (document.body.textContent ?? '').match(
          /(\d+(?:[ \u202F\u00A0]\d+)*)[ \u202F\u00A0]+cartes au total/i,
        )

        if (match) {
          const cards = match[1]?.replace(/[ \u202F\u00A0]/g, '')
          presenceData.state = `${cards} cards available`
        }
      }

      break
    }

    case '/guild': {
      presenceData.details = 'Viewing guild'

      const bodyText = document.body.textContent ?? ''

      const rankMatch = bodyText.match(/#(\d+)/)
      const pointsMatch = bodyText.match(
        /(\d+(?:[ \u202F\u00A0]\d+)*)[ \u202F\u00A0]+pts/i,
      )
      const membersMatch = bodyText.match(
        /(\d+)\s*membres/i,
      )

      const parts: string[] = []

      if (rankMatch)
        parts.push(`#${rankMatch[1]}`)

      if (pointsMatch) {
        const points = pointsMatch[1]?.replace(/[ \u202F\u00A0]/g, '')
        parts.push(`${points} pts`)
      }

      if (membersMatch)
        parts.push(`${membersMatch[1]} members`)

      if (parts.length)
        presenceData.state = parts.join(' • ')

      break
    }

    case '/friends': {
      presenceData.details = 'Viewing friends'

      const match = (document.body.textContent ?? '').match(
        /AMIS\s*\((\d+)\)/i,
      )

      if (match)
        presenceData.state = `${match[1]} friend${match[1] === '1' ? '' : 's'}`

      break
    }

    case '/dms': {
      presenceData.details = 'Viewing messages'

      const bodyText = document.body.textContent ?? ''

      if (/Aucune conversation pour le moment/i.test(bodyText))
        presenceData.state = 'No conversations yet'

      break
    }

    case '/battle': {
      presenceData.details = 'Preparing for battle'

      const match = (document.body.textContent ?? '').match(
        /(\d+)\s*\/\s*(\d+)\s*défis envoyés aujourd'hui/i,
      )

      if (match)
        presenceData.state = `${match[1]} / ${match[2]} challenges sent today`

      break
    }

    case '/achievements': {
      presenceData.details = 'Viewing achievements'

      const match = (document.body.textContent ?? '').match(
        /(\d+)\s*\/\s*(\d+)\s*débloqués/i,
      )

      if (match)
        presenceData.state = `${match[1]} / ${match[2]} unlocked`

      break
    }

    case '/leaderboard': {
      presenceData.details = 'Viewing leaderboard'

      const bodyText = document.body.textContent ?? ''

      if (/Classement en maintenance/i.test(bodyText))
        presenceData.state = 'Leaderboard under maintenance'

      break
    }

    case '/settings': {
      presenceData.details = 'Changing settings'
      break
    }

    default: {
      presenceData.details = 'Browsing WikiMasters'
      break
    }
  }

  presence.setActivity(presenceData)
})

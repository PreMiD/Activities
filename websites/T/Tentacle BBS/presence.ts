import { ActivityType, StatusDisplayType, timestampFromFormat } from 'premid'

// Shows the door a player is in on tentaclebbs.com, and what they are looking at on the
// portal. The site names a door in <meta name="tentacle-presence"> (on /play and on the
// door's page) only when an anonymous visitor's catalog lists it: never a mature, hidden or
// admin-only door. Without the tag nothing names the door.

const presence = new Presence({ clientId: '1562569519359074364' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

// The same 512x512 logo as metadata.json.
const LOGO = 'https://i.imgur.com/wXPgPuN.png'

interface DoorInfo {
  door: string
  title: string
  // The chat ("InterBBS Chat") comes with "chat", its client's logo as the card and no page:
  // the site names the network and client, never a room, a nickname or a line.
  chat?: string
  card?: string
  page?: string
  // "DOS · RPG · 4.08 Beta (2006)": written by the site, so it changes without a new
  // version of this activity.
  kind?: string
}

function doorInfo(): DoorInfo | null {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="tentacle-presence"]')
  if (!meta)
    return null
  try {
    const info = JSON.parse(meta.content) as DoorInfo
    return info.door && info.title ? info : null
  }
  catch {
    return null
  }
}

presence.on('UpdateData', async () => {
  // If the settings cannot be read, show the private status rather than keep the last one.
  const [privacy, gameAsName, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('gameAsName'),
    presence.getSetting<boolean>('buttons'),
  ]).catch(() => [true, false, false])
  // The page may give its addresses relative to the site; Discord needs whole ones.
  const absolute = (path: string) => new URL(path, document.location.origin).href
  const { pathname } = document.location
  const info = privacy ? null : doorInfo()

  if (pathname === '/play') {
    const live = document.querySelector('#session-state')?.getAttribute('data-state') === 'live'
    if (!live) {
      presence.clearActivity()
      return
    }
    // The bar's session clock reads "mm:ss" or "h:mm:ss".
    const clock = document.querySelector('#session-clock')?.textContent?.trim() || '0'
    const startTimestamp = Math.floor(Date.now() / 1000) - timestampFromFormat(clock)
    if (!info) {
      presence.setActivity({
        name: 'Tentacle BBS',
        type: ActivityType.Playing,
        details: 'Playing on Tentacle BBS',
        state: 'Web door games',
        largeImageKey: LOGO,
        startTimestamp,
      })
      return
    }
    if (info.chat || !info.card || !info.page) {
      presence.setActivity({
        name: 'Tentacle BBS',
        type: ActivityType.Playing,
        statusDisplayType: StatusDisplayType.Details,
        details: info.title,
        state: info.kind ?? 'Multi-Relay Chat',
        largeImageKey: info.card ? absolute(info.card) : LOGO,
        startTimestamp,
      })
      return
    }
    presence.setActivity({
      // "Show game as activity name" makes the profile read "Playing Legend of the Red
      // Dragon"; the small logo then says where (CrazyGames does the same).
      name: gameAsName ? info.title : 'Tentacle BBS',
      type: ActivityType.Playing,
      // The member list shows the door either way. With the door as the name, the lines
      // under it say what and where instead of repeating the title.
      statusDisplayType: gameAsName ? StatusDisplayType.Name : StatusDisplayType.Details,
      ...(gameAsName
        ? { details: info.kind || 'Web door game', state: 'on Tentacle BBS' }
        : { details: info.title, detailsUrl: absolute(info.page), ...(info.kind ? { state: info.kind } : {}) }),
      largeImageKey: absolute(info.card),
      ...(gameAsName ? { smallImageKey: LOGO, smallImageText: 'Tentacle BBS' } : {}),
      startTimestamp,
      ...(showButtons ? { buttons: [{ label: 'Play Game', url: absolute(`/play?door=${encodeURIComponent(info.door)}`) }] } : {}),
    })
    return
  }

  // Only the portal's pages use PreMiD's shared strings. If they cannot be loaded, show
  // nothing rather than keep the last activity.
  let strings
  try {
    strings = await presence.getStrings({
      browsing: 'general.browsing',
      viewHome: 'general.viewHome',
      viewGame: 'general.viewGame',
      viewAGame: 'general.viewAGame',
      buttonViewGame: 'general.buttonViewGame',
    })
  }
  catch {
    presence.clearActivity()
    return
  }

  if (pathname.startsWith('/doors/')) {
    const named = info?.card && info.page ? info : null
    presence.setActivity({
      name: 'Tentacle BBS',
      type: ActivityType.Playing,
      details: named ? strings.viewGame : strings.viewAGame,
      ...(named ? { state: named.title } : {}),
      largeImageKey: named?.card ? absolute(named.card) : LOGO,
      startTimestamp: browsingTimestamp,
      ...(named?.page && showButtons ? { buttons: [{ label: strings.buttonViewGame, url: absolute(named.page) }] } : {}),
    })
    return
  }

  presence.setActivity({
    name: 'Tentacle BBS',
    type: ActivityType.Playing,
    details: strings.browsing,
    ...(pathname === '/' ? { state: strings.viewHome } : {}),
    largeImageKey: LOGO,
    startTimestamp: browsingTimestamp,
  })
})

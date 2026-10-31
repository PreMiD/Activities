import { buildActivity } from './activity.js'
import { readPage } from './pages.js'
import { getStrings } from './strings.js'

const presence = new Presence({ clientId: '609220157910286346' })
const navigation = new AbortController()
let active = true

window.dispatchEvent(new Event('niconico:reload'))
window.addEventListener('niconico:reload', () => navigation.abort(), { once: true, signal: navigation.signal })
window.addEventListener('pagehide', () => {
  active = false
}, { signal: navigation.signal })
window.addEventListener('pageshow', () => {
  active = true
}, { signal: navigation.signal })

presence.on('UpdateData', async () => {
  if (!active || navigation.signal.aborted)
    return

  const [strings, privacy, buttons, ads, pause, playback] = await Promise.all([
    getStrings(presence),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('ads'),
    presence.getSetting<boolean>('pause'),
    presence.getSetting<boolean>('playback'),
  ])

  if (!active || navigation.signal.aborted)
    return

  const page = readPage(new URL(document.location.href), document)
  await presence.setActivity(buildActivity(page, { privacy, buttons, ads, pause, playback }, strings))
})

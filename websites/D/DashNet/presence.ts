import { Assets } from 'premid'

let presence: Presence, newID: string, latestID: string
function presenceSet(pathname: string): Presence {
  if (!latestID && !newID) {
    newID = pathname.includes('/cookieclicker/')
      ? '676126246928777250'
      : '676120967159742465'
    presence = new Presence({ clientId: newID })
  }

  if (
    pathname.includes('/cookieclicker/')
    && latestID !== '676126246928777250'
  ) {
    presence = new Presence({ clientId: '676126246928777250' })
    newID = '676126246928777250'
  }
  else if (
    !pathname.includes('/cookieclicker/')
    && latestID !== '676120967159742465'
  ) {
    presence = new Presence({ clientId: '676120967159742465' })
    newID = '676120967159742465'
  }
  latestID = newID

  return presence
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence = presenceSet(document.location.pathname)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DashNet/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location

  presenceSet(pathname)

  if (pathname.includes('/cookieclicker/')) {
    const cookies = await presence.getPageVariable(
      'Game.cookies',
      'Game.cookiesPs',
      'Game.ascendMeterLevel',
    )
    presenceData.details = `${
      Math.round(Number(cookies['Game.cookies']) * 100) / 100
    } cookies`
    presenceData.state = `${
      Math.round(Number(cookies['Game.cookiesPs']) * 100) / 100
    } cookies per second`
    presenceData.smallImageText = `Legacy level: ${cookies['Game.ascendMeterLevel']}`
  }
  else if (pathname === '/') {
    presenceData.details = 'Browsing DashNet\'s'
    presenceData.state = 'video games and other fun things'
    presenceData.smallImageKey = Assets.Reading
  }
  else if (pathname.includes('/legacy/')) {
    presenceData.details = 'Playing Legacy'
  }
  else if (pathname.includes('/igm/')) {
    presenceData.details = 'Making an idle game'
  }
  else if (pathname.includes('/randomgen/')) {
    presenceData.details = 'Using RandomGen'
  }
  else if (pathname.includes('/nested/')) {
    presenceData.details = 'Playing Nested'
  }
  else if (pathname.includes('/murdergames/')) {
    presenceData.details = 'Playing Murder Games'
  }
  else if (pathname.includes('/lsystem/')) {
    presenceData.details = 'Playing Tutrle Toy'
  }
  else if (pathname.includes('/taskmaster/')) {
    presenceData.details = 'Using TaskMaster'
  }
  else if (pathname.includes('/cookies2cash/')) {
    presenceData.details = 'Using Cookies2Cash'
  }
  else if (pathname.includes('/musicgen/')) {
    presenceData.details = 'Using MusicGen'
  }
  else if (pathname.includes('/dungeongenerator/')) {
    presenceData.details = 'Using Dungeon Generator'
  }
  else if (pathname.includes('/dreamlog/')) {
    presenceData.details = 'Playing Dreamlog'
  }
  else if (pathname.includes('/PretendEverything/')) {
    presenceData.details = 'Playing PretendEverything'
  }
  else if (pathname.includes('/teaparty/')) {
    presenceData.details = 'Having a tea party'
  }
  else if (pathname.includes('/mailtopia/')) {
    presenceData.details = 'Playing mailtopia'
  }
  else if (pathname.includes('/life')) {
    presenceData.details = 'Playing Life'
  }
  else if (pathname.includes('/3dtest/2')) {
    presenceData.details = 'Using WebGL test'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

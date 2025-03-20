const presence = new Presence({
  clientId: '701914032541794386',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

function capitalizeFirstLetter(string: string) {
  if (string) {
    return (
      string.trim().charAt(0).toUpperCase()
      + string.trim().slice(1).toLowerCase()
    )
  }
}
let oldURL: string
let pdCache = {
  name: '',
  details: '',
  state: '',
  meetTitle: '',
  meetDetails: '',
  meetState: '',
}

function replacePlaceholders(
  original: string,
  mTime: string,
  mTitle: string,
  mPeople: string,
) {
  if (!original)
    return ''

  let tempString: string | undefined = original

  if (mTime)
    tempString = tempString.replace('%meettime%', `| time: ${mTime}`)
  else tempString = tempString.replace('%meettime%', '')

  if (mTitle)
    tempString = tempString.replace('%meettitle%', `| title: ${mTitle}`)
  else tempString = tempString.replace('%meettitle%', '')

  if (mPeople) {
    tempString = tempString.replace(
      '%meetpeople%',
      `| amount of attendants: ${mPeople}`,
    )
  }
  else {
    tempString = tempString.replace('%meetpeople%', '')
  }

  if (!tempString)
    return ''
  else if (tempString?.toLowerCase()?.includes('ready to join?'))
    return ''
  else if (tempString.at(0) === '|')
    tempString = capitalizeFirstLetter(tempString.slice(2))
  else if (tempString.at(1) === '|')
    tempString = capitalizeFirstLetter(tempString.slice(3))
  else tempString = capitalizeFirstLetter(tempString)

  return tempString
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Meet/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [
    usePresenceName,
    hideInviteCode,
    presenceName,
    presenceDetail,
    presenceState,
  ] = await Promise.all([
    presence.getSetting<boolean>('usePresenceName'),
    presence.getSetting<boolean>('hideInviteCode'),
    presence.getSetting<string>('meetTitle'),
    presence.getSetting<string>('meetDetail'),
    presence.getSetting<string>('meetState'),
  ])
  const { href, pathname } = document.location

  if (pathname.toLowerCase() === '/') {
    presenceData.details = 'Initial page'
    presenceData.state = 'Just waiting'
    return presence.setActivity(presenceData)
  }

  let meetTitle = document.querySelector('.lefKC')?.textContent

  const meetTime = document.querySelector('[jsname="W5i7Bf"]')?.textContent
  const meetPeople = document.querySelector('.uGOf1d')?.textContent

  if ((!meetTitle || !meetTitle?.includes(':') || !meetPeople) && !meetTime) {
    presenceData.details = 'Waiting for the meeting to start.'
    presence.setActivity(presenceData)
    return
  }
  if (
    href !== oldURL // If no href
    || !pdCache?.details // If no cached details
    || pdCache?.meetDetails !== presenceDetail // If cached presence setting details !== current presence setting details
    || pdCache?.meetState !== presenceState // If cached presence setting state !== current presence setting state
    || (usePresenceName && pdCache.meetTitle !== presenceName) // If use presenceName && cached presence setting name !== current presence setting name
  ) {
    meetTitle = meetTitle?.replace(/(\d{2}:\d{2})( )?((am)|(pm))?/g, '')
    if (
      meetTitle?.toLowerCase()?.match(/[a-z]{3}-[a-z]{4}-[a-z]{3}/g)?.[0]
      && hideInviteCode
    ) {
      // If the invitecode is in the title & the don't show invite code setting is enabled
      meetTitle = 'Secret'
    }

    presenceData.details = replacePlaceholders(
      presenceDetail,
      meetTime ?? '',
      meetTitle ?? '',
      meetPeople ?? '',
    )

    presenceData.state = replacePlaceholders(
      presenceState,
      meetTime ?? '',
      meetTitle ?? '',
      meetPeople ?? '',
    )

    oldURL = href

    if (usePresenceName) {
      presenceData.name = replacePlaceholders(
        presenceName,
        meetTime ?? '',
        meetTitle ?? '',
        meetPeople ?? '',
      )
    }
    pdCache = {
      name: presenceData?.name ?? '',
      details: presenceData?.details ?? '',
      state: presenceData?.state ?? '',
      meetTitle: presenceName ?? '',
      meetDetails: presenceDetail ?? '',
      meetState: presenceState ?? '',
    }
  }
  else if (pdCache?.details) {
    if (usePresenceName)
      presenceData.name = pdCache.name
    presenceData.details = pdCache.details
    presenceData.state = pdCache.state
  }

  presence.setActivity(presenceData)
})

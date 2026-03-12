const presence = new Presence({
  clientId: '797749214175035412',
})
const timeStamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const {
    title,
    location: { pathname: page },
  } = document
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/freeCodeCamp/assets/logo.png',
    startTimestamp: timeStamp,
  }
  const arr = page.split('/').filter(String)
  const capitalize = (str: string) =>
    str
      .split('-')
      .map(item => item.replace(item.charAt(0), item.charAt(0).toUpperCase()))
      .join(' ')
  const details = (page: string, title: string) => {
    if (page === '/')
      return 'Viewing:'
    if (page.match(/^\/news|^\/settings|^\/donate/))
      return 'Viewing page:'
    if (page.startsWith('/learn'))
      return arr.length === 1 ? 'Learning:' : `${capitalize(arr[1]!)}:`
    if (title.startsWith('Profile'))
      return 'Viewing Profile:'
  }
  const state = (page: string, title: string) => {
    if (page === '/')
      return 'The Main Page'
    if (page.match(/^\/news|^\/settings|^\/donate/))
      return arr[1] ? title : capitalize(arr[0]!)
    if (page.startsWith('/learn')) {
      return arr[2]
        ? capitalize(arr[2])
        : arr[1]
          ? 'Selecting Lesson'
          : 'Selecting Course'
    }
    if (title.startsWith('Profile'))
      return arr[0]
  }
  if (page !== '/') {
    presenceData.buttons = [
      { label: 'Visit Page', url: `https://freecodecamp.org${page}` },
    ]
  }
  presenceData.details = details(page, title)
  presenceData.state = state(page, title)
  presence.setActivity(presenceData)
})

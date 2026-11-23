const presence = new Presence({
  clientId: '1574343305700057119',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://wsrv.nl/logo.png?url=web.archive.org/web/20261118100506im_/https://www.kurskmed.com/images/logo.png&w=512&h=512&fit=contain&bg=white&filename=logo.png',
}

// Only fixed section names are shared. Never use page titles, patient names,
// record IDs or query strings in the activity.
// More specific routes must precede their parent routes.
const sections: [string, string][] = [
  ['/settings/appearance', 'Оформление'],
  ['/settings/profile', 'Профиль'],
  ['/settings', 'Настройки'],
  ['/dashboard', 'Главная'],
]

function getSection(pathname: string): string | undefined {
  return sections.find(
    ([route]) => pathname === route || pathname.startsWith(`${route}/`),
  )?.[1]
}

presence.on('UpdateData', async () => {
  const [showSection, showTimestamp] = await Promise.all([
    presence.getSetting<boolean>('showSection').catch(() => true),
    presence.getSetting<boolean>('showTimestamp').catch(() => true),
  ])

  // Read the route after settings resolve, including after SPA navigation.
  const pathname = document.location.pathname.replace(/\/+$/, '') || '/'
  // Protected routes render the sign-in form for guests as well.
  const isSigningIn
    = pathname === '/login'
      || pathname === '/forgot-password'
      || Boolean(document.querySelector('form[action*="/login"]'))

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Медицинский портал',
  }

  if (pathname === '/forgot-password')
    presenceData.state = 'Восстановление пароля'
  else if (isSigningIn)
    presenceData.state = 'Вход в систему'
  else if (showSection)
    presenceData.state = getSection(pathname)

  if (!isSigningIn && showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  presence.setActivity(presenceData)
})

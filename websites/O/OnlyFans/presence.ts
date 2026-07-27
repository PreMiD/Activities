import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '607587875122446359',
})

const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const OF_LOGO = 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/onlyfans.png'

  const presenceData: PresenceData = {
    type: ActivityType.Watching,
    largeImageKey: OF_LOGO,
    largeImageText: 'OnlyFans',
  }

  // Odczyt preferencji z ustawień PreMiD
  const [showProfileName, showProfileButton, showTimestamps, privacyMode, showCreatorAvatar] = await Promise.all([
    presence.getSetting<boolean>('showProfileName').catch(() => true),
    presence.getSetting<boolean>('showProfileButton').catch(() => true),
    presence.getSetting<boolean>('showTimestamps').catch(() => true),
    presence.getSetting<boolean>('privacyMode').catch(() => false),
    presence.getSetting<boolean>('showCreatorAvatar').catch(() => true),
  ])

  if (showTimestamps) {
    presenceData.startTimestamp = startTimestamp
  }

  const pathname = window.location.pathname.toLowerCase()
  const pathSegments = pathname.split('/').filter(Boolean)
  const firstSegment = pathSegments[0]

  // Sprawdzanie czy na stronie odtwarzany jest film wideo
  const activeVideo = document.querySelector<HTMLVideoElement>('video')
  const isVideoPlaying = activeVideo && !activeVideo.paused && activeVideo.currentTime > 0

  // System zaawansowanego wykrywania podstron i stanu
  if (pathname === '/' || pathname.startsWith('/home')) {
    if (isVideoPlaying) {
      presenceData.details = 'Ogląda film wideo'
      presenceData.state = 'Na stronie głównej'
    } else {
      presenceData.details = 'Przegląda stronę główną'
      presenceData.state = 'Aktualności i nowe wpisy'
    }
  } else if (pathname.startsWith('/my/chats')) {
    presenceData.details = 'Wiadomości prywatne'

    // Odczyt rozmówcy wyłącznie z nagłówka czatu (pomijając profil zalogowanego użytkownika)
    const chatHeader = document.querySelector('.b-chat__header, .b-chat__title-wrapper')
    const chatTitleElem = chatHeader?.querySelector('.b-chat__title, .g-user-name, .b-user-name')
    const chatAvatarElem = chatHeader?.querySelector<HTMLImageElement>('img')
    const activeChatUser = chatTitleElem?.textContent?.trim()

    if (!privacyMode && activeChatUser) {
      presenceData.state = `Rozmowa z ${activeChatUser}`
      if (chatAvatarElem?.src) {
        presenceData.smallImageKey = chatAvatarElem.src
        presenceData.smallImageText = activeChatUser
      }
    } else {
      presenceData.state = 'Rozmawia na czacie'
    }
  } else if (pathname.startsWith('/my/notifications')) {
    presenceData.details = 'Powiadomienia'
    presenceData.state = 'Sprawdza nowe polubienia i reakcje'
  } else if (pathname.startsWith('/my/collections') || pathname.startsWith('/my/bookmarks') || pathname.startsWith('/my/vault')) {
    presenceData.details = 'Skarbiec multimedialny'
    presenceData.state = 'Przegląda zapisane zdjęcia i filmy'
  } else if (pathname.startsWith('/my/subscribers') || pathname.startsWith('/my/subscriptions')) {
    presenceData.details = 'Zarządzanie subskrypcjami'
    presenceData.state = 'Przegląda listę obserwowanych twórców'
  } else if (pathname.startsWith('/my/settings') || pathname.startsWith('/settings')) {
    presenceData.details = 'Ustawienia konta'
    presenceData.state = 'Edytuje profil i preferencje'
  } else if (pathname.startsWith('/search') || window.location.search.includes('query=')) {
    presenceData.details = 'Wyszukiwarka'
    presenceData.state = 'Szuka nowych twórców'
  } else if (pathSegments.length === 1 && firstSegment && !firstSegment.startsWith('my')) {
    // Strona profilu twórcy (np. /ariraetv)
    const rawUsername = firstSegment

    // Odczyt danych wyznaczony WYŁĄCZNIE z sekcji nagłówka profilu twórcy
    const profileHeaderElem = document.querySelector('.b-profile__header, .b-profile__info, .b-user-info')
    const displayNameElem = profileHeaderElem?.querySelector('.b-username, .g-user-name, h1, .b-profile__name')
    const avatarElem = profileHeaderElem?.querySelector<HTMLImageElement>('img')
    const countersElem = document.querySelectorAll('.b-profile__sections .b-profile__sections-item, .b-counters__item')

    // Zabezpieczenie: pobieraj tylko nazwę z nagłówka profilu lub użyj nazwy z URL
    const fetchedDisplayName = displayNameElem?.textContent?.trim()
    const displayName = (fetchedDisplayName && fetchedDisplayName.length > 0) ? fetchedDisplayName : `@${rawUsername}`

    // Pobieranie dodatkowych statystyk
    const statsList: string[] = []
    countersElem.forEach((elem) => {
      const text = elem.textContent?.trim().replace(/\s+/g, ' ')
      if (text && text.length < 30) statsList.push(text)
    })
    const extraStats = statsList.length > 0 ? statsList.slice(0, 2).join(' • ') : null

    if (privacyMode) {
      presenceData.details = 'Przegląda profil twórcy'
      presenceData.state = 'Tryb dyskretny'
    } else {
      if (isVideoPlaying) {
        presenceData.details = `Ogląda wideo na profilu:`
      } else {
        presenceData.details = `Przegląda profil:`
      }

      // Formatowanie: jeśli nazwa wyświetlana i nazwa w URL są takie same lub brak, pokż `@rawUsername`
      if (showProfileName) {
        presenceData.state = (displayName !== `@${rawUsername}` && displayName !== rawUsername)
          ? `${displayName} (@${rawUsername})`
          : `@${rawUsername}`
      } else {
        presenceData.state = `@${rawUsername}`
      }

      // Ustawianie awatara twórcy (z sekcji nagłówka profilu)
      if (showCreatorAvatar && avatarElem?.src && !avatarElem.src.includes('data:image')) {
        presenceData.largeImageKey = avatarElem.src
        presenceData.largeImageText = `@${rawUsername}`
        presenceData.smallImageKey = OF_LOGO
        presenceData.smallImageText = extraStats || 'OnlyFans'
      } else if (extraStats) {
        presenceData.smallImageKey = OF_LOGO
        presenceData.smallImageText = extraStats
      }

      if (showProfileButton) {
        presenceData.buttons = [
          {
            label: `Profil @${rawUsername}`,
            url: `https://onlyfans.com/${rawUsername}`,
          },
        ]
      }
    }
  } else {
    presenceData.details = 'Przegląda OnlyFans'
    presenceData.state = 'Przeglądanie serwisu'
  }

  // Domyślny przycisk przekierowujący na OnlyFans
  if (!presenceData.buttons) {
    presenceData.buttons = [
      {
        label: 'Otwórz OnlyFans',
        url: 'https://onlyfans.com',
      },
    ]
  }

  presence.setActivity(presenceData)
})

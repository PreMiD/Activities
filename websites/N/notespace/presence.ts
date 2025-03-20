import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1193651901221306378',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Icon = 'https://cdn.rcd.gg/PreMiD/websites/N/notespace/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { href } = document.location
  const currentPath = href.replace('https://notespace.edu.pl', '')
  const presenceData: PresenceData = {
    details: 'Nauka nigdy nie była prostsza.',
    largeImageKey: ActivityAssets.Icon,
    smallImageKey: Assets.Viewing,
    smallImageText: 'Przegląda...',
    startTimestamp: browsingTimestamp,
    buttons: [
      {
        label: 'Odwiedź stronę o nas',
        url: 'https://notespace.edu.pl/o-nas',
      },
    ],
  }

  if (document.title.includes('404')) {
    presenceData.details = '404 - Nie znaleziono strony'
    presenceData.smallImageText = 'Coś poszło nie tak...'
    return presence.setActivity(presenceData)
  }

  if (
    href.endsWith('notespace.edu.pl/')
    || currentPath.includes('strona-glowna')
  ) {
    presenceData.details = 'Przegląda stronę główną'
    const activeQuestion = document.querySelector('.faq-item-header.active')
    if (activeQuestion) {
      presenceData.details = 'Przegląda wszystkie pytania - strona główna'
      presenceData.smallImageKey = Assets.Question
      presenceData.smallImageText = 'Czyta pytanie...'
      presenceData.state = `Czyta: "${activeQuestion.textContent?.trim()}"`
    }
  }
  else if (currentPath.includes('ankieta')) {
    presenceData.details = 'Przegląda strone ankiety'
    presenceData.state = 'Wypełnia ankietę'
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = 'Pisze...'
    presenceData.buttons = [{ label: 'Wypełnij ankietę', url: href }]
  }
  else if (currentPath.includes('centrum-pomocy')) {
    presenceData.details = 'Przegląda centrum pomocy'
  }
  else if (currentPath.includes('o-nas')) {
    presenceData.details = 'Przegląda strone o nas'
  }
  else if (currentPath.includes('kontakt')) {
    presenceData.details = 'Przegląda strone kontaktów'
    presenceData.smallImageKey = Assets.Call
    presenceData.smallImageText = 'Kontaktuje się z nami...'
    presenceData.buttons = [
      {
        label: 'Skontaktuj się z nami',
        url: href,
      },
    ]
  }
  else if (currentPath.includes('dokumenty')) {
    presenceData.details = 'Przegląda stronę dokumentów'
  }
  else if (currentPath.includes('polityka-prywatnosci')) {
    presenceData.details = 'Przegląda dokument'
    presenceData.state = 'Polityka prywatności'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Czyta...'
    presenceData.buttons = [
      {
        label: 'Dowiedz sie o naszej polityce o prywatności',
        url: href,
      },
    ]
  }
  else if (currentPath.includes('polityka-cookies')) {
    presenceData.details = 'Przegląda dokument'
    presenceData.state = 'Polityka cookies'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Czyta...'
    presenceData.buttons = [
      {
        label: 'Dowiedz sie o naszej polityce o ciasteczkach',
        url: href,
      },
    ]
  }
  else if (currentPath.includes('rodo')) {
    presenceData.details = 'Przegląda dokument'
    presenceData.state = 'RODO'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Czyta...'
    presenceData.buttons = [
      {
        label: 'Dowiedz sie o naszej polityce o RODO',
        url: href,
      },
    ]
  }
  else if (currentPath.includes('warunki-uzytkowania')) {
    presenceData.details = 'Przegląda dokument'
    presenceData.state = 'Warunki użytkowania'
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = 'Czyta...'
    presenceData.buttons = [
      {
        label: 'Dowiedz sie o naszych warunkach użytkowania',
        url: href,
      },
    ]
  }
  else if (currentPath.includes('archiwum-dokumentow')) {
    presenceData.details = 'Przegląda archiwum dokumentów'
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = 'Przegłąda...'
    presenceData.buttons = [
      {
        label: 'Przejrzyj nasze stare dokumenty',
        url: href,
      },
    ]
  }
  else if (currentPath.startsWith('/en')) {
    if (href.endsWith('notespace.edu.pl/en/') || currentPath.includes('home')) {
      presenceData.details = 'Browsing the main page'
      const activeQuestion = document.querySelector('.faq-item-header.active')
      if (activeQuestion) {
        presenceData.details = 'Browsing all the questions - main page'
        presenceData.smallImageKey = Assets.Question
        presenceData.smallImageText = 'Reading a question...'
        presenceData.state = `Reading: "${activeQuestion.textContent?.trim()}"`
      }
    }
    else if (currentPath.includes('contact')) {
      presenceData.details = 'Browse the contact page'
      presenceData.smallImageKey = Assets.Call
      presenceData.smallImageText = 'Contacting us...'
      presenceData.buttons = [
        {
          label: 'Contact us',
          url: href,
        },
      ]
    }
  }
  else if (currentPath.startsWith('/app')) {
    if (currentPath.includes('logowanie')) {
      presenceData.state = 'Wprowadza dane'
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Pisze...'
      if (currentPath.includes('zaloguj-sie'))
        presenceData.details = 'Loguje się'
      else if (currentPath.includes('zarejestruj-sie'))
        presenceData.details = 'Rejestruje się'
    }
    else if (currentPath.startsWith('/app/')) {
      presenceData.details = 'Korzysta z aplikacji'
      presenceData.state = 'Przegląda stronę główną aplikacji'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Przegląda...'
      presenceData.buttons = [
        { label: 'Użyj naszej aplikacji', url: 'https://notespace.edu.pl/app' },
      ]
      if (currentPath.includes('biblioteka')) {
        if (
          currentPath.includes('ulubione')
          || currentPath.includes('polubione')
        ) {
          presenceData.state = 'Przegląda swoje polubione notatki/zbiory'
          presenceData.smallImageKey = Assets.Viewing
          presenceData.smallImageText = 'Przegląda...'
          presenceData.buttons = [
            {
              label: 'Przeglądnij swoją liste polubionych',
              url: href,
            },
          ]
        }
        else if (currentPath.includes('moje-notatki')) {
          presenceData.state = 'Przegląda swoje notatki'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Czyta...'
          presenceData.buttons = [
            {
              label: 'Przeglądnij swoje notatki',
              url: href,
            },
          ]
        }
        else if (currentPath.includes('notatka')) {
          presenceData.state = 'Przegląda notatke'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Czyta...'
        }
        else if (currentPath.includes('zbior')) {
          presenceData.state = 'Przegląda zbiór'
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = 'Czyta...'
        }
        else {
          presenceData.state = 'Przegląda biblioteke'
          presenceData.smallImageKey = Assets.Viewing
          presenceData.smallImageText = 'Przegląda...'
          presenceData.buttons = [
            {
              label: 'Przeglądnij swoją biblioteke',
              url: href,
            },
          ]
        }
      }
      else if (
        currentPath.includes('menu')
        || currentPath.includes('ustawienia')
      ) {
        if (
          !currentPath.endsWith('ustawienia')
          && !currentPath.endsWith('menu')
          && !currentPath.endsWith('ustawienia/')
          && !currentPath.endsWith('menu/')
        ) {
          presenceData.smallImageKey = Assets.Writing
          presenceData.smallImageText = 'Ustawianie...'
          if (currentPath.includes('moje-konto')) {
            presenceData.state = 'Zmienia ustawienia konta'
          }
          else if (currentPath.includes('prywatnosc-i-bezpieczenstwo')) {
            presenceData.state = 'Zmienia ustawienia prywatności'
          }
          else if (currentPath.includes('preferencje')) {
            presenceData.state = 'Zmienia ustawienia preferencji'
          }
          else if (currentPath.includes('o-aplikacji')) {
            presenceData.state = 'Informacje o aplikacji'
            presenceData.smallImageKey = Assets.Viewing
            presenceData.smallImageText = 'Przegląda...'
          }
        }
        else {
          presenceData.state = 'Przegląda ustawienia uzytkownika'
          presenceData.smallImageKey = Assets.Viewing
          presenceData.smallImageText = 'Przegląda...'
        }
      }
      else if (currentPath.includes('wyszukiwarka')) {
        presenceData.state = 'Używa wyszukiwarke'
        presenceData.smallImageKey = Assets.Writing
        presenceData.smallImageText = 'Szuka...'
      }
      else if (
        currentPath.includes('przeslij')
        || currentPath.includes('dodaj-zbior')
      ) {
        presenceData.smallImageKey = Assets.Uploading
        presenceData.smallImageText = 'Przesyła...'
        if (currentPath.includes('przeslij'))
          presenceData.state = 'Przesyła notatke'
        else if (currentPath.includes('dodaj-zbior'))
          presenceData.state = 'Dodaje zbiór'
      }
      else if (currentPath.includes('profil')) {
        presenceData.state = `Przegląda profil: ${
          currentPath.split('/')[currentPath.split('/').length - 1]
        }`
        presenceData.smallImageKey = Assets.Viewing
        presenceData.smallImageText = 'Przegląda...'
      }
    }
  }

  presence.setActivity(presenceData)
})

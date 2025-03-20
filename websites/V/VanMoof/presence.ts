const presence = new Presence({
  clientId: '941761536681201676',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

const assets = {
  vanmoof_v: 'https://cdn.rcd.gg/PreMiD/websites/V/VanMoof/assets/0.png',
  vanmoof_s3: 'https://cdn.rcd.gg/PreMiD/websites/V/VanMoof/assets/1.png',
  vanmoof_x3: 'https://cdn.rcd.gg/PreMiD/websites/V/VanMoof/assets/2.png',
  vanmoof_a5: 'https://cdn.rcd.gg/PreMiD/websites/V/VanMoof/assets/3.png',
  vanmoof_s5: 'https://cdn.rcd.gg/PreMiD/websites/V/VanMoof/assets/4.png',
}

presence.on('UpdateData', async () => {
  const urlpath = window.location.pathname.split('/')
  const presenceData: PresenceData = {
    details: 'Other',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/VanMoof/assets/logo.png',
    startTimestamp: browsingTimestamp,
    buttons: [
      {
        label: 'View Page',
        url: window.location.href.replace(`${urlpath[1]}/`, ''),
      },
    ],
  }

  switch (true) {
    case /[a-z]{2}-[A-Z]{2}/.test(urlpath[1] ?? '') && !urlpath[2]:
      presenceData.details = 'Home'
      delete presenceData.buttons

      break

    case urlpath[1] === 'shop':
      presenceData.details = 'Shop'

      if (urlpath[2]?.startsWith('outlet')) {
        presenceData.state = 'Outlet'

        switch (urlpath[3]) {
          case 'bikes':
            if (urlpath[4]) {
              presenceData.details = 'Shop - Outlet Bike'
              presenceData.state = document.querySelector('h1.page-title span')?.textContent
                ?? 'Unknown'
            }
            else {
              presenceData.state = 'Outlet Bikes'
            }

            break

          case 'faq':
            presenceData.state = 'FAQ'

            break
        }
      }
      else {
        const hash = window.location.hash.replace('#', '')

        if (urlpath[3]?.startsWith('configure-')) {
          presenceData.state = 'Configuring'
          return
        }

        switch (urlpath[3]) {
          case 'accessories':
            presenceData.state = 'Accessories'

            if (urlpath[4]) {
              presenceData.details = 'Shop - Accessories'
              presenceData.state = document.querySelector('h1.product-title')?.textContent
                ?? 'Unknown'
            }

            break

          case 'checkout':
            if (hash) {
              presenceData.details = 'Shop - Checkout'
              presenceData.state = hash[0]?.toUpperCase() + hash.slice(1)
            }
            else {
              presenceData.state = 'Checkout'
            }

            break
        }
      }

      break

    case urlpath[1] === 'my-vanmoof':
      presenceData.details = 'My VanMoof'

      switch (urlpath[3]) {
        case 'home':
          presenceData.state = 'Home'

          break

        case 'bikes':
          presenceData.state = 'Bikes'

          if (document.querySelector('#chakra-modal-register-bike')) {
            presenceData.state = 'Registering Bike'
          }
          else if (document.querySelector('#remove-bike-ownership')) {
            const bikeName = document.querySelectorAll('.m-info__top-title')[1]?.textContent

            presenceData.state = `Managing Bike${
              bikeName ? `: ${bikeName}` : ''
            }`
          }

          break

        case 'orders':
        case 'rewards':
        case 'help':
        case 'profile':
          presenceData.state = `${urlpath[3][0]?.toUpperCase()}${urlpath[3].slice(
            1,
          )}`

          break
      }

      break

    case urlpath[1] === 'blog':
      presenceData.details = 'Blog'

      if (urlpath[2] && urlpath[3]) {
        presenceData.details = 'Blog - Article'
        presenceData.state = document.querySelector('h1.heading.heading--article-page')
          ?.textContent ?? 'Unknown'

        presenceData.buttons = [
          {
            label: 'View on VanMoof',
            url: window.location.href,
          },
        ]

        if (urlpath[3] === 'category') {
          presenceData.details = 'Blog - Category'
          presenceData.state = document.querySelector('h1.heading.heading--hero')?.textContent
            ?? 'Unknown'
        }
        else if (urlpath[3] === 'search') {
          presenceData.details = 'Blog - Search'
          presenceData.state = document.querySelector<HTMLInputElement>('input.search-form__input')
            ?.value ?? 'Unknown'
        }
      }

      break

    case urlpath[1] === 'news':
      presenceData.details = 'News'

      if (urlpath[3]) {
        switch (urlpath[3]) {
          case 'media_kits':
            presenceData.state = 'Media'

            break

          case 'about':
            presenceData.state = 'About Us'

            break

          case 'contact':
            presenceData.state = 'Contact Us'

            break

          default:
            presenceData.details = 'News - Article'
            presenceData.state = document.querySelector('article div.block h1')?.textContent
              ?? 'Unknown'

            break
        }

        presenceData.buttons = [
          {
            label: 'View on VanMoof',
            url: window.location.href,
          },
        ]
      }

      break

    default:
      switch (urlpath[2]) {
        case 'electric-bikes':
        case 'ebikes':
        case 'velos-electriques':
        case 'elektrische-fietsen':
          switch (urlpath[3]) {
            case 'powerbank':
              presenceData.details = 'Viewing PowerBank'

              break

            case 'app':
              presenceData.details = 'Viewing App'

              break

            default:
              presenceData.details = 'Viewing E-Bikes'

              break
          }

          break

        case 's3':
        case 'x3':
        case 's5':
        case 'a5':
        case 'vanmoof-v':
          presenceData.details = 'Viewing E-Bike'
          presenceData.state = `VanMoof ${urlpath[2]
            .split('-')
            .pop()
            ?.toUpperCase()}`
          presenceData.largeImageKey = assets[
            `vanmoof_${urlpath[2].split('-').pop()}` as keyof typeof assets
          ]
          presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/V/VanMoof/assets/logo.png'
          presenceData.buttons = [
            {
              label: 'View on VanMoof',
              url: `https://www.vanmoof.com/${urlpath[2]}/`,
            },
          ]
          break

        case 'test-rides':
          presenceData.details = 'Booking a Test Ride'

          break

        case 'peace-of-mind':
          presenceData.details = 'Viewing Peace of Mind Services'

          break

        case 'payment-options':
          presenceData.details = 'Viewing Payment Options'

          break

        case 'payment-plans':
          presenceData.details = 'Viewing Payment Plans'

          break

        case 'about':
          presenceData.details = 'About Us'

          break

        case 'stores':
          presenceData.details = 'Searching for Stores'

          break

        case 'company-bikes':
        case 'firmenfahrräder':
          presenceData.details = 'Viewing Company Bikes'

          break

        case 'certified-partner':
          presenceData.details = 'About Certified Partnerships'

          break

        case 'shipping':
          presenceData.details = 'Viewing Shipping Information'

          break

        case 'returns':
          presenceData.details = 'Viewing Return Policy'

          break

        case 'warranty':
          presenceData.details = 'Viewing Warranty Information'

          break

        case 'privacy':
        case 'terms-and-conditions':
        case 'cookie-statement':
        case 'recruitment-statement':
          presenceData.details = `Viewing ${urlpath[2]
            .replaceAll(/-/g, ' ')
            .split(/ /)
            .map(word => `${word[0]?.toUpperCase()}${word.slice(1)}`)
            .join(' ')}`

          break
      }

      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

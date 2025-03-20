import { Assets } from 'premid'

const presence = new Presence({
  clientId: '619219701146583080',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/eBay/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [, page] = location.pathname.split('/')

  if (location.hostname.startsWith('www.')) {
    if (!page) {
      presenceData.details = 'Viewing the'
      presenceData.state = 'Homepage'
    }
    else {
      switch (page) {
        case 'itm': {
          presenceData.details = document
            .querySelector('#itemTitle')
            ?.textContent
            ?.replace(
              document.querySelector('#itemTitle > span')?.textContent ?? '',
              '',
            )
          presenceData.buttons = [
            { label: 'View Item', url: location.href },
            {
              label: 'View Seller',
              url: document.querySelector<HTMLAnchorElement>('.mbg > a')?.href ?? '',
            },
          ]

          if (document.querySelector('#vi-cdown_timeLeft')) {
            delete presenceData.startTimestamp
            presenceData.state = document.querySelector('#vi-cdown_timeLeft')?.textContent
          }

          break
        }
        case 'sch': {
          if (location.pathname.includes('/i.html')) {
            presenceData.details = `Searching: ${
              document.querySelector(
                '.srp-controls__count-heading .BOLD:nth-child(2)',
              )?.textContent
            }`
            presenceData.state = `${
              document.querySelector('.srp-controls__count-heading .BOLD')
                ?.textContent
            } Results`
            presenceData.smallImageKey = Assets.Search
          }
          else if (location.pathname.includes('/m.html')) {
            const seller = document.querySelector('.mbid') as HTMLAnchorElement

            presenceData.details = 'Viewing listed products of:'
            presenceData.state = seller.textContent
            presenceData.buttons = [
              { label: 'View List', url: location.href },
              {
                label: 'View Seller',
                url: seller.href,
              },
            ]
          }

          break
        }
        case 'usr': {
          presenceData.details = 'User:'
          presenceData.state = document
            .querySelector('.mbg-id')
            ?.textContent
            ?.replace(
              document.querySelector('.mbg-id > span')?.textContent ?? '',
              '',
            )
          presenceData.buttons = [{ label: 'View User', url: location.href }]

          break
        }
        default:
          if (location.pathname.includes('/myb/')) {
            presenceData.details = 'Viewing their:'
            presenceData.state = document.querySelector(
              '#top-nav > div.topTitle > h1 > span.page-name',
            )?.textContent
          }
          else if (
            location.pathname.includes('/sns')
            || location.pathname.includes('/b/Stores-Hub/')
          ) {
            presenceData.details = 'Viewing stores'
          }
          else if (location.pathname.includes('/sl/')) {
            presenceData.details = 'eBay Sell'
            presenceData.state = 'Listing an item'
          }
          else if (location.pathname.includes('/b/')) {
            presenceData.details = 'Viewing category:'
            presenceData.state = document.querySelector(
              '.b-pageheader__text',
            )?.textContent
          }
          else if (location.pathname.includes('/help/')) {
            presenceData.details = 'eBay Help'
          }
          else if (location.pathname.includes('/deals')) {
            presenceData.details = 'Viewing the latest'
            presenceData.state = 'eBay deals'
          }
          else if (location.pathname.includes('/allcategories')) {
            presenceData.details = 'Viewing all categories'
          }
      }
    }
  }
  else if (page === 'str') {
    presenceData.details = 'eBay Store'
    presenceData.state = document.querySelector(
      '.str-billboard__title',
    )?.textContent
    presenceData.buttons = [{ label: 'View Store', url: location.href }]
  }
  else if (location.hostname.startsWith('mesg.')) {
    if (location.pathname.includes('/ViewMessageDetail/')) {
      presenceData.details = 'eBay Messages'
      presenceData.state = 'Viewing a message'
    }
    else if (location.pathname.includes('/ViewMessages/')) {
      presenceData.details = 'Browsing through'
      presenceData.state = 'eBay Messages'
    }
    else {
      presenceData.details = 'eBay Messages'
    }
  }
  else if (location.hostname.startsWith('ocsnext.')) {
    presenceData.details = 'eBay Customer Support'
  }
  else if (location.hostname.includes('developer.')) {
    presenceData.details = 'eBay Developer Program'
  }
  else if (location.hostname.startsWith('resolutioncenter.')) {
    presenceData.details = 'eBay Resolution Center'
  }
  else if (location.hostname.startsWith('my.')) {
    presenceData.details = 'Viewing their eBay'
  }
  else if (location.hostname.startsWith('login.')) {
    presenceData.details = 'eBay Login'
  }
  else if (location.hostname.startsWith('signin.')) {
    presenceData.details = 'eBay Login'
  }
  else if (location.hostname.startsWith('pages.')) {
    if (location.hash !== '') {
      presenceData.details = 'Viewing the sitemap'
      presenceData.state = location.hash
    }
    else if (location.pathname.includes('sitemap.html')) {
      presenceData.details = 'Viewing the sitemap'
    }
    else if (location.pathname.includes('seller-center')) {
      presenceData.details = 'Viewing the seller center'
    }
  }
  else if (location.hostname.startsWith('community.')) {
    if (document.querySelector('.lia-message-subject')) {
      presenceData.details = 'eBay Forum, Viewing:'
      presenceData.state = document.querySelector(
        '.lia-message-subject',
      )?.textContent

      presenceData.buttons = [
        { label: 'View Post', url: location.href },
        {
          label: 'View Author',
          url: document.querySelector<HTMLAnchorElement>(
            '.lia-component-message-view-widget-author-username > a',
          )?.href ?? '',
        },
      ]
    }
    else if (location.pathname.includes('/user/')) {
      presenceData.details = 'eBay Forum Author:'
      presenceData.state = document.querySelector(
        '.lia-user-name-link',
      )?.textContent
      presenceData.buttons = [{ label: 'View Author', url: location.href }]
    }
    else if (location.pathname.includes('/searchpage/')) {
      presenceData.details = 'eBay Forum Search:'
      presenceData.state = (
        document.querySelector('.lia-search-input-message') as HTMLInputElement
      )?.value
    }
    else {
      presenceData.details = 'eBay Forum'
    }
  }

  const showButtons = await presence.getSetting<boolean>('buttons')

  if (!showButtons)
    delete presenceData.buttons

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

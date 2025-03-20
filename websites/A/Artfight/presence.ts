import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1002575262292131910',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const slideshow = new Slideshow()

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Artfight/assets/logo.jpg',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const presenceDataSlide: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const presenceDataTeam: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, origin } = document.location
  const pathArr = pathname.split('/')
  const [showCover, showButtons] = await Promise.all([
    presence.getSetting<boolean>('cover'),
    presence.getSetting<boolean>('buttons'),
  ])

  switch (pathArr[1]) {
    case '':
      presenceData.details = 'Browsing homepage'
      break
    case 'attack': {
      presenceData.details = presenceDataSlide.details = presenceDataTeam.details = `Viewing a${
        document.querySelector('td > div.badge.badge-info')?.textContent
        ?? 'n attack'
      }`

      presenceData.state = `"${document
        .querySelector('.profile-header-name > a > u')
        ?.textContent
        ?.trim()}"`

      if (!document.querySelector('div.alert')) {
        presenceData.largeImageKey = presenceDataSlide.largeImageKey = presenceDataTeam.largeImageKey = document
          .querySelector('#image-pane > div > a > img')
          ?.getAttribute('src')
      }

      const tableAttackData = document.querySelectorAll('tbody > tr > td')
      presenceDataSlide.state = `From ${tableAttackData[1]?.textContent?.trim()} to ${tableAttackData[3]?.textContent?.trim()}`
      presenceDataTeam.state = `Team ${tableAttackData[5]?.textContent?.trim()}`

      presenceData.buttons = presenceDataSlide.buttons = presenceDataTeam.buttons = [
        { label: 'View Drawing', url: href },
        {
          label: 'View Artist',
          url: `${origin}/~${tableAttackData[1]?.textContent?.trim()}`,
        },
      ]

      slideshow.addSlide('attackName', presenceData, 5000)
      slideshow.addSlide('authorName', presenceDataSlide, 5000)
      slideshow.addSlide('teamName', presenceDataTeam, 5000)
      break
    }
    case 'browse':
      presenceData.details = 'Browsing'
      if (pathArr[2]?.startsWith('attacks'))
        presenceData.state = 'attacks'
      else if (pathArr[2]?.startsWith('characters'))
        presenceData.state = 'characters'
      else if (pathArr[2]?.startsWith('tags'))
        presenceData.state = 'characters by tags'
      break
    case 'info':
      presenceData.details = 'Reading'
      presenceData.smallImageKey = Assets.Reading
      presenceData.state = {
        'help': 'Help page',
        'about': 'About Artfight',
        'faq': 'Frequently Asked Questions',
        'guide-attacks': 'Guide to categorize your attack',
        'size': 'Guide to name character size',
        'drawings': 'Guide to rate drawings',
        '3d-modeling': 'Guide to rate 3D models',
        'crafts': 'Guide to rate crafts arts',
        'animation': 'Guide to rate animations',
        'guide-maturity': 'Guide to filter mature content',
        'gore': 'Guide to filter gore content',
        'bodyhorror': 'Guide to filter bodyhorror content',
        'nudity': 'Guide to filter nudity content',
        'sexualthemes': 'Guide to filter sexual themes content',
        'epilespy': 'Guide to Epilespy and eye strain warning',
        'otherfilters': 'Guide to other sensitive content',
        'guide-bbcode': 'Guide to BBCode and CSS',
        'contact-us': 'How to contact a moderator',
        'contact': 'How to contact an administrator',
        'credits': 'Staff credits page',
        'artcredits': 'Art credits page',
        'rules': 'artfight rules',
        'tos': 'ToS page',
        'privacy': 'Privacy policy',
      }[pathArr[2] ?? '']
      break
    case 'shop':
      presenceData.details = 'Browsing the shop'
      presenceData.state = document
        .querySelector('div.alert')
        ?.textContent
        ?.includes('closed')
        ? 'Actually closed'
        : 'Shop opened'
      break
    case 'donate':
      presenceData.details = 'Donating to Artfight'
      break
    case 'news':
      presenceData.details = 'Reading news'
      presenceData.smallImageKey = Assets.Reading
      break
    case 'members': {
      presenceData.details = 'Browsing members'
      const browsingPageNumber = href.split('?')
      presenceData.state = browsingPageNumber.length === 1
        ? 'Page 1'
        : `Page ${browsingPageNumber[1]?.split('=')[1]}`
      presenceData.largeImageKey = document
        .querySelector<HTMLSpanElement>('span.icon-user')
        ?.style
        .backgroundImage
        .split('"')[1]

      break
    }
    case 'event':
      if (
        document
          .querySelector<HTMLHeadingElement>('div.container-fluid > h1')
          ?.textContent
          ?.trim() === 'No Event'
      ) {
        presenceData.details = 'Viewing event page'
      }
      else {
        presenceData.details = document.querySelector<HTMLHeadingElement>(
          'div.container-fluid > h1',
        )?.firstChild?.textContent
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          '.container-fluid > h2',
        )?.textContent
        presenceData.buttons = [
          {
            label: 'Join a team !',
            url: document
              .querySelector<HTMLLinkElement>('.btn')!.getAttribute('href'),
          },
        ]
      }
      break
    case 'team':
      if (pathArr[2] === 'sort') {
        presenceData.details = 'On team sorting page'
      }
      else {
        presenceData.details = 'On team page'
        presenceData.state = document.querySelector<HTMLHeadingElement>(
          'div.container-fluid > h1 > strong > a',
        )?.textContent
        presenceData.buttons = [{ label: 'View Team Page', url: href }]
      }
      break
    case 'character':
      presenceData.details = `Viewing ${
        document.querySelector('.profile-header-name > a')?.textContent
      }`
      presenceData.state = `Owner : ${document
        .querySelector(
          '.profile-header-normal-status > div > strong:nth-child(2)',
        )
        ?.textContent
        ?.trim()}`
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>('div > a > img')?.src
      presenceData.buttons = [{ label: 'View character', url: href }]
      break
    default:
      if (pathArr[1]?.startsWith('~')) {
        presenceData.details = `Viewing ${
          document.querySelector('.profile-header-name > strong')?.textContent
        }`
        presenceData.state = document
          .querySelector('.profile-header-normal-status > p:nth-child(3)')
          ?.textContent
          ?.trim()
        presenceData.largeImageKey = document
          .querySelector<HTMLSpanElement>('.icon-user')
          ?.style
          ?.backgroundImage
          ?.split('"')[1]
        presenceData.buttons = [{ label: 'View artist profile', url: href }]
      }
  }

  if (!showCover) {
    presenceData.largeImageKey = presenceDataSlide.largeImageKey = presenceDataTeam.largeImageKey = ActivityAssets.Logo
  }
  if (!showButtons) {
    delete presenceData.buttons
    delete presenceDataSlide.buttons
    delete presenceDataTeam.buttons
  }

  if (slideshow.getSlides().length > 0)
    presence.setActivity(slideshow)
  else if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

const presence: Presence = new Presence({
  clientId: '833430731816173669',
})
const levelImages: Record<string, string> = {
  10: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/0.png',
  20: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/1.png',
  30: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/2.png',
  40: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/3.png',
  50: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/4.png',
  60: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/5.png',
  70: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/6.png',
  80: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/7.png',
  90: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/8.png',
  100: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/9.png',
}
const slideshow = presence.createSlideshow()

let browsingTimestamp = Math.floor(Date.now() / 1000)
let oldPath: string

function getLevelIcon(level: number) {
  let iconKey = levelImages['10']
  if (level >= 10 && level < 100)
    iconKey = levelImages[`${Math.floor(level / 10) * 10}`]
  if (level < 10)
    iconKey = levelImages['10']
  if (level >= 100)
    iconKey = levelImages['100']
  return iconKey
}

function applyItemDetails(presenceData: PresenceData) {
  const { pathname, href } = document.location
  presenceData.details = 'Viewing an item'
  presenceData.state = `${removeRubyCharacters(document.querySelector('h1 span span')!)} - ${document.querySelector('h1 span:nth-child(2)')?.textContent}`
  if (!pathname.startsWith('/learn'))
    presenceData.buttons = [{ label: 'View Grammar Point', url: href }]
}

function applyReviewDetails(presenceData: PresenceData) {
  const details = document.querySelector(
    '#js-tour-quiz-info',
  )
  const correctElement = details?.querySelector('li:has(> svg[data-name="CHECK"])')
  const remainingElement = details?.querySelector('li:has(> svg[data-name="INBOX"])')
  const wrapUpElement = details?.querySelector('li:has(> svg[data-name="WRAPUP"])')

  const stateDetails = []
  if (correctElement) {
    stateDetails.push(`${correctElement?.textContent} correct`)
  }

  if (remainingElement) {
    stateDetails.push(`${remainingElement.textContent} remaining`)
  }
  else if (wrapUpElement) {
    presenceData.details = `${presenceData.details} (Wrapping up)`

    stateDetails.push(wrapUpElement.textContent)
  }

  presenceData.state = stateDetails.filter(x => !!x).join(' | ')
}

function removeRubyCharacters(element: HTMLElement) {
  let text = ''
  for (const child of element.childNodes) {
    if (child.nodeName === 'RUBY')
      text += child.childNodes[0]?.textContent
    else text += child.textContent
  }
  return text
}

presence.on('UpdateData', async () => {
  let hideActivity = false
  const { pathname, hostname, href } = document.location
  const pathSplit = pathname.split('/').slice(1)
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Bunpro/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (oldPath !== pathname) {
    browsingTimestamp = Math.floor(Date.now() / 1000)
    oldPath = pathname
  }

  if (hostname === 'community.bunpro.jp') {
    switch (pathSplit[0]) {
      case '':
      case 'categories': {
        presenceData.details = 'Browsing the community'
        break
      }
      case 'c': {
        presenceData.details = 'Browsing community category'
        presenceData.state = document.querySelector<HTMLSpanElement>(
          '.category-name',
        )?.textContent
        break
      }
      case 'latest': {
        presenceData.details = 'Browsing latest topics'
        break
      }
      case 'new': {
        presenceData.details = 'Browsing new topics'
        break
      }
      case 'search': {
        presenceData.details = 'Searching the community'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '.search-bar > input',
        )?.value
        break
      }
      case 't': {
        presenceData.details = 'Viewing a community topic'
        presenceData.state = document.querySelector('h1')?.textContent
        presenceData.buttons = [{ label: 'View Topic', url: href }]
        break
      }
      case 'top': {
        presenceData.details = 'Browsing top topics'
        break
      }
      case 'u': {
        presenceData.details = `Viewing ${document
          .querySelector('h1')
          ?.textContent
          ?.trim()}'s community profile`
        presenceData.state = document.querySelector<HTMLAnchorElement>(
          '.user-primary-navigation .active',
        )?.textContent
        presenceData.smallImageKey = document.querySelector<HTMLImageElement>(
          '.user-profile-avatar > img',
        )?.src
        presenceData.smallImageText = `Level ${
          document
            .querySelector<HTMLDivElement>('.user-profile-avatar .avatar-flair')
            ?.title
            ?.match(/\d+/)?.[0] ?? 0
        }`
        presenceData.buttons = [{ label: 'View Profile', url: href }]
        break
      }
      case 'unread': {
        presenceData.details = 'Browsing unread topics'
        break
      }
      default: {
        presenceData.details = 'Browsing the community'
        presenceData.state = document.title.match(
          /^(.*?)( - Bunpro Community)?$/,
        )?.[1]
      }
    }
  }
  else {
    const level = +((
      document.querySelector<HTMLParagraphElement>('.header-user-level')
      ?? document
        .querySelector<HTMLImageElement>('header li > button img')
        ?.closest<HTMLDivElement>('button > div')
        ?.querySelector<HTMLParagraphElement>('div:nth-child(2) p:last-child')
    )?.textContent?.match(/\d+/)?.[0] ?? 0)
    if (level) {
      presenceData.smallImageKey = getLevelIcon(level)
      presenceData.smallImageText = `Level ${level}`
    }
    switch (pathSplit[0]) {
      case 'bookmarks': {
        presenceData.details = 'Viewing their bookmarks'
        break
      }
      case 'cram': {
        presenceData.details = 'Cramming'
        if (document.querySelector<HTMLDivElement>('#new-cram'))
          presenceData.state = 'Selecting grammar to cram'
        else applyReviewDetails(presenceData)
        break
      }
      case 'dashboard': {
        const reviews = document.querySelector<HTMLDivElement>(
          '#js-tour-dash-quicklinks>li:nth-child(2) span',
        )!.textContent!
        const learned = document.querySelector<HTMLParagraphElement>(
          '#js-tour-dash-quicklinks>li:first-child>div>*:not(.hidden) p',
        )!.textContent!
        presenceData.details = 'Viewing dashboard'
        presenceData.state = `${learned} learned | ${reviews} review${reviews === '1' ? '' : 's'}`
        const hideOnDone = await presence.getSetting('hideOnDone')
        // 'learned' is a string of format x/y with x and y as numbers in strings, lessons are done if x === y
        if (hideOnDone && +reviews === 0 && +learned.split('/')[0]! === +learned.split('/')[1]!)
          hideActivity = true
        break
      }
      case 'grammar_points': {
        if (pathSplit[1])
          applyItemDetails(presenceData)
        else presenceData.details = 'Browsing grammar points'
        break
      }
      case 'learn': {
        if (document.querySelector('#js-quiz')) {
          applyReviewDetails(presenceData)
        }
        else {
          applyItemDetails(presenceData)
        }
        presenceData.details = 'Learning new items'
        break
      }
      case 'lessons': {
        if (pathSplit[1]) {
          presenceData.details = 'Practicing reading'
          presenceData.state = document.querySelector('h2')?.textContent?.trim()
          presenceData.buttons = [{ label: 'View Lesson', url: href }]
        }
        else {
          presenceData.details = 'Viewing lessons'
        }
        break
      }
      case 'notifications': {
        presenceData.details = 'Viewing their notifications'
        break
      }
      case 'paths': {
        if (pathSplit[1]) {
          if (pathSplit[2]) {
            applyItemDetails(presenceData)
          }
          else {
            presenceData.details = 'Viewing a grammar path'
            presenceData.state = document.querySelector('h2')?.textContent
            presenceData.buttons = [{ label: 'View Grammar Path', url: href }]
          }
        }
        else {
          presenceData.details = 'Browsing grammar paths'
        }
        break
      }
      case 'reading_passages': {
        presenceData.details = 'Browsing practice reading passages'
        break
      }
      case 'reviews': {
        presenceData.details = 'Doing reviews'
        applyReviewDetails(presenceData)
        break
      }
      case 'summary': {
        presenceData.details = 'Viewing review summary'
        const correctElement = document.querySelector<HTMLHeadingElement>(
          'h4.text-quiz-correct',
        )
        if (correctElement) {
          presenceData.state = `${correctElement.textContent} correct / ${
            document.querySelector<HTMLHeadingElement>('h4.text-quiz-incorrect')
              ?.textContent
          } incorrect (${
            document.querySelector<HTMLHeadingElement>('aside h3')?.textContent
          })`
        }
        break
      }
      case 'user': {
        if (pathSplit[1] === 'feedback') {
          presenceData.details = 'Viewing their feedback'
        }
        else {
          switch (pathSplit[2] ?? '') {
            case '': {
              presenceData.details = 'Viewing their profile'
              const [daysStudied, studyStreak, level, xp] = document.querySelector<HTMLDivElement>('h2 + div')?.children ?? []
              presenceData.state = `${daysStudied
                ?.querySelector('p')
                ?.textContent
                ?.trim()} days studied | ${studyStreak
                ?.querySelector('p')
                ?.textContent
                ?.trim()} streak | Level ${level
                ?.querySelector('p')
                ?.textContent
                ?.trim()} (${xp
                ?.querySelector('p')
                ?.textContent
                ?.trim()} XP)`
              break
            }
            case 'badges': {
              for (const [i, badgeContainer] of document
                .querySelectorAll<HTMLDivElement>('.user-profile-badge--earned')
                .entries()) {
                slideshow.addSlide(
                  i.toString(),
                  {
                    ...presenceData,
                    details: 'Viewing their badges',
                    state: `${
                      badgeContainer.querySelector('h3')?.textContent
                    } - ${
                      badgeContainer.querySelector<HTMLDivElement>(
                        '.user-profile-badge--requirement',
                      )?.textContent
                    }`,
                    largeImageKey: badgeContainer.querySelector<HTMLImageElement>(
                      '.user-profile-badge--icon',
                    )?.src,
                    smallImageText: badgeContainer.querySelector<HTMLDivElement>(
                      '.user-profile-badge--flavor-text',
                    )?.textContent,
                  },
                  5000,
                )
              }
              break
            }
            case 'reset': {
              presenceData.details = 'Resetting their account'
              break
            }
            case 'stats': {
              presenceData.details = 'Viewing their stats'
              break
            }
          }
        }
        break
      }
      case 'vocabs': {
        if (pathSplit[1]) {
          presenceData.details = 'Viewing a vocabulary'
          presenceData.state = `${removeRubyCharacters(
            document.querySelector<HTMLDivElement>('h1 span span')!,
          )} - ${document.querySelector('h1 span:nth-child(2)')?.textContent}`
          presenceData.buttons = [{ label: 'View Vocabulary', url: href }]
        }
        else {
          presenceData.details = 'Searching for vocabulary'
          presenceData.state = document.querySelector<HTMLInputElement>('#query')?.value
        }
        break
      }
      default: {
        presenceData.details = 'Browsing'
        presenceData.state = document.querySelector('h1')?.textContent?.trim()
      }
    }
  }

  if (presenceData.details && !hideActivity) {
    presence.setActivity(presenceData)
    slideshow.deleteAllSlides()
  }
  else if (slideshow.getSlides().length) {
    presence.setActivity(slideshow)
  }
  else {
    presence.clearActivity()
    slideshow.deleteAllSlides()
  }
})

import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1194078283919274004',
})
const slideshow = presence.createSlideshow()

let oldPath = document.location.pathname
let browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/B/BoardGameGeek/assets/logo.png',
  RatingIcon = 'https://cdn.rcd.gg/PreMiD/websites/B/BoardGameGeek/assets/0.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, href, search } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  if (oldPath !== pathname) {
    oldPath = pathname
    browsingTimestamp = Math.floor(Date.now() / 1000)
    slideshow.deleteAllSlides()
  }

  let useSlideshow = false

  switch (pathList[0] ?? '/') {
    case '/': {
      presenceData.details = 'Browsing the homepage'
      break
    }
    case 'blog': {
      if (pathList[1] === 'create') {
        presenceData.details = 'Creating a new blog'
        break
      }
      else {
        presenceData.details = 'Viewing a blog'
        presenceData.state = document.querySelector<HTMLAnchorElement>('.post_title > a')
        presenceData.buttons = [{ label: 'View Blog', url: href }]
      }
      break
    }
    case 'blogs': {
      if (pathList[1] === 'myblogs')
        presenceData.details = 'Viewing their blogs'
      else presenceData.details = 'Browsing blogs'
      break
    }
    case 'blogpost': {
      const postHeader = document.querySelector<HTMLAnchorElement>('.post_title > a')
      presenceData.largeImageKey = document.querySelector<HTMLMetaElement>(
        'meta[property=\'og:image\']',
      )?.content
      presenceData.details = 'Reading a blog post'
      presenceData.state = postHeader
      presenceData.buttons = [{ label: 'Read Post', url: postHeader }]
      break
    }
    case 'boardgame': {
      const gameHeader = document.querySelector<HTMLAnchorElement>('h1 > a')
      const gameHeaderText = gameHeader?.textContent?.trim()
      presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
        '.game-header-image img',
      )
      presenceData.buttons = [{ label: 'View Game', url: gameHeader }]
      switch (pathList[3]) {
        case 'credits': {
          presenceData.details = `Viewing credits for '${gameHeaderText}'`
          break
        }
        case 'expansions': {
          const expansions = document.querySelectorAll<HTMLDivElement>(
            'linked-items-module .summary-item',
          )
          presenceData.details = `Viewing expansions for '${gameHeaderText}'`

          for (const expansion of expansions) {
            const expansionLink = expansion.querySelector<HTMLAnchorElement>(
              '.summary-item-title > a',
            )
            const ratingContainer = expansion.querySelector<HTMLDivElement>(
              '.rating-media-overlay',
            )
            const slide: PresenceData = {
              ...presenceData,
              largeImageKey: expansion.querySelector<HTMLImageElement>('.media img'),
              state: expansionLink,
              smallImageKey: ActivityAssets.RatingIcon,
              smallImageText: `Rating: ${ratingContainer?.childNodes[2]?.textContent?.trim()} (${ratingContainer?.getAttribute(
                'uib-tooltip',
              )})`,
            }
            slide.buttons?.push({ label: 'View Expansion', url: expansionLink })
            slideshow.addSlide(expansionLink?.href ?? '', slide, 5000)
          }

          if (expansions.length)
            useSlideshow = true
          break
        }
        case 'files': {
          presenceData.details = `Viewing files for '${gameHeaderText}'`
          presenceData.buttons.push({ label: 'View Files', url: href })
          break
        }
        case 'forums': {
          presenceData.details = `Viewing forums for '${gameHeaderText}'`
          presenceData.state = document.querySelector(
            'forums-module h3 span',
          )?.childNodes[2]
          break
        }
        case 'geeklist': {
          presenceData.details = 'Viewing a GeekList'
          presenceData.state = document.querySelector('header h2')
          presenceData.buttons = [{ label: 'View GeekList', url: href }]
          slideshow.addSlide(href, presenceData, 5000)

          const items = document.querySelectorAll<HTMLDivElement>(
            'gg-geeklist-items-by-geeklist gg-geeklist-item .geeklist-item',
          )
          for (const item of items) {
            const itemLink = item.querySelector<HTMLAnchorElement>('h2 a')
            const slide: PresenceData = {
              details: `Viewing a GeekList item - ${gameHeaderText}`,
              state: itemLink,
              largeImageKey: item.querySelector<HTMLImageElement>('gg-image img'),
              smallImageKey: Assets.Question,
              smallImageText: itemLink,
              buttons: [
                { label: 'View GeekList', url: href },
                { label: 'View Item', url: itemLink },
              ],
            }
            slideshow.addSlide(itemLink?.href ?? '', slide, 5000)
          }

          useSlideshow = true
          break
        }
        case 'geeklists': {
          presenceData.details = `Viewing GeekLists for '${gameHeaderText}'`
          const geeklists = document.querySelectorAll<HTMLLIElement>(
            'geeklists-module .summary-item',
          )

          for (const geeklist of geeklists) {
            const geeklistLink = geeklist.querySelector<HTMLAnchorElement>(
              '.summary-item-title > a',
            )
            const slide: PresenceData = {
              ...presenceData,
              state: geeklistLink,
            }
            slide.buttons?.push({ label: 'View GeekList', url: geeklistLink })
            slideshow.addSlide(geeklistLink?.href ?? '', slide, 5000)
          }

          if (geeklists.length)
            useSlideshow = true
          break
        }
        case 'images': {
          const imageContainers = document.querySelectorAll<HTMLDivElement>(
            'images-module .summary-image-item',
          )
          presenceData.details = `Viewing images for '${gameHeaderText}'`
          for (const imageContainer of imageContainers) {
            const imageLink = imageContainer.querySelector<HTMLAnchorElement>(
              '.summary-image-thumbnail',
            )
            const slide: PresenceData = {
              ...presenceData,
              largeImageKey: imageLink?.querySelector<HTMLImageElement>('img'),
              smallImageKey: Assets.Question,
              smallImageText: imageContainer.querySelector<HTMLDivElement>(
                '.summary-item-title',
              ),
            }
            slide.buttons?.push({ label: 'View Image', url: imageLink })
            slideshow.addSlide(imageLink?.href ?? '', slide, 5000)
          }
          if (imageContainers.length)
            useSlideshow = true
          break
        }
        case 'marketplace': {
          presenceData.details = `Viewing stores for '${gameHeaderText}'`
          break
        }
        case 'mentions': {
          presenceData.details = `Viewing mentions for '${gameHeaderText}'`
          break
        }
        case 'mygames': {
          presenceData.details = `Viewing their collections for '${gameHeaderText}'`
          break
        }
        case 'ratings': {
          const reviewElements = document.querySelectorAll<HTMLLIElement>(
            'ratings-module ul > li',
          )
          presenceData.details = `Viewing ratings for '${gameHeaderText}'`
          for (const reviewElement of reviewElements) {
            let text = reviewElement
              ?.querySelector<HTMLDivElement>('.summary-item-callout')
              ?.textContent
              ?.trim() ?? ''
            if (
              reviewElement?.querySelector<HTMLSpanElement>('.comment-body span')
                ?.textContent
            ) {
              text += ` - ${reviewElement
                ?.querySelector<HTMLSpanElement>('.comment-body span')
                ?.textContent
                ?.trim()}`
            }
            const username = reviewElement
              ?.querySelector<HTMLAnchorElement>('.comment-header-user')
              ?.textContent
              ?.trim() ?? ''
            const slide: PresenceData = {
              ...presenceData,
              state: text,
              smallImageKey: reviewElement?.querySelector<HTMLImageElement>('.avatar')
                ?? Assets.Question,
              smallImageText: username,
            }
            slideshow.addSlide(username, slide, 5000)
          }
          if (reviewElements.length)
            useSlideshow = true
          break
        }
        case 'recommendations': {
          presenceData.details = `Viewing recommendations for '${gameHeaderText}'`
          break
        }
        case 'sleeves': {
          presenceData.details = `Viewing sleeves for '${gameHeaderText}'`
          break
        }
        case 'stats': {
          presenceData.details = `Viewing stats for '${gameHeaderText}'`

          const gamePanels = document.querySelectorAll<HTMLDivElement>('.game-stats .panel')
          for (const gamePanel of gamePanels) {
            const gamePanelItems = gamePanel.querySelectorAll<HTMLLIElement>('.outline-item')

            for (const gamePanelItem of gamePanelItems) {
              const gamePanelItemTitle = gamePanelItem
                .querySelector('.outline-item-title')
                ?.textContent
                ?.trim()
              const slide: PresenceData = {
                ...presenceData,
                state: `${gamePanel
                  .querySelector('h3')
                  ?.textContent
                  ?.trim()}: ${gamePanelItemTitle} - ${gamePanelItem
                  .querySelector('.outline-item-description')
                  ?.textContent
                  ?.trim()}`,
              }
              slideshow.addSlide(gamePanelItemTitle ?? '', slide, 5000)
            }
          }

          useSlideshow = true
          break
        }
        case 'tags': {
          presenceData.details = `Viewing tags for '${gameHeaderText}'`
          break
        }
        case 'trading': {
          presenceData.details = `Viewing trades for '${gameHeaderText}'`
          break
        }
        case 'versions': {
          presenceData.details = `Viewing versions for '${gameHeaderText}'`
          const versions = document.querySelectorAll<HTMLAnchorElement>(
            'linked-items-module .summary-item-title > a',
          )
          for (const version of versions) {
            const slide: PresenceData = {
              ...presenceData,
              state: version,
            }
            slide.buttons?.push({ label: 'View Version', url: version })
            slideshow.addSlide(version.href, slide, 5000)
          }
          if (versions.length)
            useSlideshow = true
          break
        }
        case 'videos': {
          const videoElements = document.querySelectorAll<HTMLDivElement>(
            'videos-module .summary-video-item',
          )
          presenceData.details = `Viewing videos for '${gameHeaderText}'`
          for (const videoElement of videoElements) {
            const videoLink = videoElement.querySelector<HTMLAnchorElement>(
              '.summary-video-thumbnail',
            )
            const slide: PresenceData = {
              ...presenceData,
              largeImageKey: videoLink?.querySelector<HTMLImageElement>('img'),
              smallImageKey: Assets.Question,
              smallImageText: videoElement.querySelector<HTMLDivElement>(
                '.summary-item-title',
              ),
            }
            slide.buttons?.push({ label: 'View Video', url: videoLink })
            slideshow.addSlide(videoLink?.href ?? '', slide, 5000)
          }
          if (videoElements.length)
            useSlideshow = true
          break
        }
        case 'wiki': {
          presenceData.details = `Viewing the wiki for '${gameHeaderText}'`
          presenceData.buttons.push({ label: 'View Wiki', url: href })
          break
        }
        default: {
          presenceData.details = 'Viewing a game'
          presenceData.state = `${gameHeaderText} - ${gameHeader
            ?.closest('div')
            ?.querySelector('p')
            ?.textContent
            ?.trim()}`
          presenceData.smallImageKey = ActivityAssets.RatingIcon
          presenceData.smallImageText = `Rating: ${document
            .querySelector('overall-rating [ng-show=showRating]')
            ?.textContent
            ?.trim()}`
        }
      }
      break
    }
    case 'browse': {
      presenceData.details = 'Browsing games'
      break
    }
    case 'collection': {
      presenceData.details = 'Viewing a game collection'
      presenceData.buttons = [{ label: 'View Collection', url: href }]
      break
    }
    case 'fan': {
      presenceData.details = 'Viewing fan items'
      break
    }
    case 'files': {
      presenceData.details = 'Browsing files'
      break
    }
    case 'findgamers.php':
    case 'map':
    case 'searchform':
    case 'users.php': {
      presenceData.details = 'Searching users'
      break
    }
    case 'forums': {
      if (pathList[1] === 'search') {
        presenceData.details = 'Searching the forums'
      }
      else if (pathList[1]) {
        presenceData.details = 'Browsing a forum section'
        presenceData.state = document.querySelector<HTMLHeadingElement>('header h2')
        presenceData.buttons = [{ label: 'View Forum', url: href }]
      }
      else {
        presenceData.details = 'Browsing forums'
      }
      break
    }
    case 'geekaccount': {
      presenceData.details = 'Managing their account'
      break
    }
    case 'geekaccount.php': {
      presenceData.details = 'Managing their profile'
      break
    }
    case 'geekbuddy.php': {
      presenceData.details = 'Managing their GeekBuddy'
      break
    }
    case 'geekcentral': {
      presenceData.details = 'Managing their GeekCentral'
      break
    }
    case 'geeklist': {
      if (pathList[1] === 'new') {
        presenceData.details = 'Creating a GeekList'
      }
      else {
        presenceData.details = 'Viewing a GeekList'
        presenceData.state = document.querySelector('header h2')
        presenceData.buttons = [{ label: 'View GeekList', url: href }]

        const items = document.querySelectorAll<HTMLDivElement>(
          'gg-geeklist-items-by-geeklist gg-geeklist-item .geeklist-item',
        )
        for (const item of items) {
          const itemLink = item.querySelector<HTMLAnchorElement>('h2 a')
          const slide: PresenceData = {
            ...presenceData,
            smallImageKey: item.querySelector<HTMLImageElement>('gg-image img'),
            smallImageText: itemLink,
          }
          slide.buttons?.push({ label: 'View Item', url: itemLink })
          slideshow.addSlide(itemLink?.href ?? '', slide, 5000)
        }

        useSlideshow = true
      }
      break
    }
    case 'geeklists': {
      switch (pathList[1]) {
        case 'bookmarks': {
          presenceData.details = 'Viewing their bookmarked GeekLists'
          break
        }
        case 'mylists': {
          presenceData.details = 'Viewing their GeekLists'
          break
        }
        default: {
          presenceData.details = 'Browsing GeekLists'
        }
      }
      break
    }
    case 'geekmail': {
      presenceData.details = 'Browsing their GeekMail'
      break
    }
    case 'geekpreview': {
      const title = document.querySelector<HTMLHeadingElement>(
        '.geekpreview-header-info h1',
      )
      const previewImage = document.querySelector<HTMLImageElement>(
        '.geekpreview-header-logo img',
      )
      presenceData.details = 'Viewing a GeekPreview'
      presenceData.state = title
      presenceData.largeImageKey = previewImage
      presenceData.buttons = [{ label: 'View GeekPreview', url: href }]

      slideshow.addSlide(href, presenceData, 5000)

      const items = document.querySelectorAll('geekpreview-singleitem')
      for (const item of items) {
        const itemLink = item.querySelector<HTMLAnchorElement>(
          '.geekpreview-item-inner-info-header-title a',
        )
        const slide: PresenceData = {
          details: `Viewing a GeekPreview item - ${title?.textContent?.trim()}`,
          state: itemLink,
          largeImageKey: item.querySelector<HTMLImageElement>(
            '.geekpreview-item-inner-cover img',
          ),
          smallImageKey: previewImage,
          smallImageText: title,
          buttons: [
            { label: 'View GeekPreview', url: href },
            { label: 'View Item', url: itemLink },
          ],
        }
        slideshow.addSlide(itemLink?.href ?? '', slide, 5000)
      }

      useSlideshow = true
      break
    }
    case 'geeksearch.php': {
      presenceData.details = 'Searching for a game'
      presenceData.state = new URLSearchParams(search).get('q')
      break
    }
    case 'geekwidget.php': {
      presenceData.details = 'Editing their GeekWidget'
      break
    }
    case 'gonecardboard': {
      presenceData.details = 'Viewing Gone Cardboard listings'
      break
    }
    case 'image': {
      presenceData.details = 'Viewing an image'
      presenceData.smallImageKey = document.querySelector<HTMLImageElement>('gg-image-nav img')
      presenceData.buttons = [{ label: 'View Image', url: href }]
      break
    }
    case 'images': {
      presenceData.details = 'Browsing images'

      const images = document.querySelectorAll<HTMLImageElement>(
        'gg-image-browser gg-image img',
      )
      for (const image of images) {
        slideshow.addSlide(
          image.src,
          {
            ...presenceData,
            largeImageKey: image,
          },
          5000,
        )
      }

      useSlideshow = true
      break
    }
    case 'item': {
      presenceData.details = 'Creating an item'
      break
    }
    case 'guild': {
      const useGuildDetails = () => {
        presenceData.details = 'Viewing a guild'
        presenceData.state = document.querySelector('#name')
        presenceData.buttons = [{ label: 'View Guild', url: href }]
      }

      if (Number.isNaN(+pathList[1]!)) {
        switch (pathList[2]) {
          case 'category': {
            presenceData.details = 'Viewing a guild category'
            presenceData.state = pathList[pathList.length - 1]
            break
          }
          case 'home': {
            presenceData.details = 'Browsing guild categories'
            break
          }
          case 'list': {
            presenceData.details = 'Browsing guilds'
            break
          }
          case 'view': {
            useGuildDetails()
            break
          }
        }
      }
      else {
        useGuildDetails()
      }
      break
    }
    case 'market': {
      switch (pathList[1]) {
        case 'browse': {
          const itemTitle = document.querySelector('h3')?.childNodes[0]
          presenceData.details = 'Browsing a product'
          presenceData.state = itemTitle
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>('.thumbnail')
          presenceData.smallImageText = itemTitle
          break
        }
        case 'product': {
          presenceData.details = 'Viewing a product'
          presenceData.state = document.querySelector(
            'table tr:first-child td:last-child',
          )
          break
        }
        case 'search': {
          presenceData.details = 'Searching the marketplace'
          presenceData.state = new URLSearchParams(search).get('q')
          break
        }
        default: {
          presenceData.details = 'Browsing the marketplace'
        }
      }
      break
    }
    case 'microbadge': {
      switch (pathList[1]) {
        case 'edit': {
          presenceData.details = 'Editing their microbadges'
          break
        }
        case 'browse': {
          presenceData.details = 'Browsing microbadges'
          break
        }
        default: {
          presenceData.details = 'Viewing a microbadge'
          presenceData.state = document.querySelector<HTMLTableCellElement>(
            'table td:nth-child(2) > table td:nth-child(2)',
          )
          presenceData.smallImageKey = document.querySelector<HTMLImageElement>('h2 img')
          presenceData.smallImageText = document.querySelector<HTMLTableCellElement>(
            'table td:nth-child(2) > table tr:nth-child(2) td:nth-child(2)',
          )
        }
      }
      break
    }
    case 'microbadges': {
      presenceData.details = 'Browsing microbadges'
      break
    }
    case 'play': {
      const thumbnailContainer = document.querySelector<HTMLSpanElement>('.go_thumbnail')
      presenceData.details = 'Viewing a play'
      presenceData.state = `${document
        .querySelector<HTMLAnchorElement>('.username a')
        ?.textContent
        ?.trim()} - ${thumbnailContainer?.nextElementSibling?.textContent?.trim()}`
      presenceData.largeImageKey = thumbnailContainer?.querySelector<HTMLImageElement>('img')
      presenceData.buttons = [
        { label: 'View Play', url: href },
        {
          label: 'View Game',
          url: thumbnailContainer?.nextElementSibling as HTMLAnchorElement,
        },
      ]
      break
    }
    case 'plays': {
      presenceData.details = 'Viewing a user\'s plays'
      presenceData.state = document.querySelector<HTMLAnchorElement>('.username a')
      presenceData.buttons = [{ label: 'View Plays', url: href }]
      break
    }
    case 'previews': {
      presenceData.details = 'Browsing previews'
      break
    }
    case 'quickbar': {
      presenceData.details = 'Managing their QuickBar'
      break
    }
    case 'recentadditions': {
      presenceData.details = 'Viewing recent additions'
      break
    }
    case 'subscriptions': {
      presenceData.details = 'Viewing their subscriptions'
      break
    }
    case 'tag': {
      presenceData.details = 'Viewing a tag'
      presenceData.state = document.querySelector<HTMLAnchorElement>('.tagtitle a')
      presenceData.buttons = [{ label: 'View Tag', url: href }]
      break
    }
    case 'tags': {
      presenceData.details = 'Browsing tags'
      break
    }
    case 'thread': {
      presenceData.details = 'Viewing a thread'
      presenceData.state = document.querySelector<HTMLAnchorElement>('.forum-header a')
      presenceData.buttons = [{ label: 'View Thread', url: href }]
      break
    }
    case 'threads': {
      switch (pathList[1]) {
        case 'bookmarks': {
          presenceData.details = 'Viewing their bookmarked threads'
          break
        }
        case 'new': {
          presenceData.details = 'Creating a new thread'
          break
        }
        case 'region': {
          presenceData.details = 'Browsing threads'
          break
        }
        case 'reviews': {
          presenceData.details = 'Viewing reviews'
          break
        }
        case 'sessions': {
          presenceData.details = 'Viewing game sessions'
          break
        }
      }
      break
    }
    case 'user': {
      const avatar = document.querySelector<HTMLImageElement>(
        '.avatarblock img[data-overtexttype=avatarovertext]',
      )
      presenceData.details = `Viewing a user's ${document
        .querySelector('.menu_table .tabOn')
        ?.textContent
        ?.trim()}`
      presenceData.state = document.querySelector<HTMLAnchorElement>('.username a')
      presenceData.buttons = [{ label: 'View User', url: href }]
      if (avatar)
        presenceData.smallImageKey = avatar
      break
    }
    case 'users': {
      presenceData.details = 'Browsing users'
      break
    }
    case 'wiki': {
      presenceData.details = 'Viewing the wiki'
      presenceData.state = document.querySelector<HTMLHeadingElement>('.wiki h2')
      break
    }
  }

  if (useSlideshow)
    presence.setActivity(slideshow)
  else if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})

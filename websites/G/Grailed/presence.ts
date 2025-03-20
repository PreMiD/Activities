const presence = new Presence({
  clientId: '786739998011293717',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const userName = document.querySelector(
  '#wardrobe > div > div.UserInfo > div.--header > div.--info > div.--user-container > div.--user-info > div.--username-container > span',
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Grailed/assets/logo.png',
  }

  presenceData.startTimestamp = browsingTimestamp

  if (document.location.hostname === 'www.grailed.com') {
    if (document.location.href.includes('www.grailed.com/listings/')) {
      const item = document.querySelector(
        'body > div.container > div > div.show-listing > div.listing-details-wrapper > div.-listing-details-and-likes-wrapper > div.-listing-designer-title-size > h1',
      )
      presenceData.details = 'Viewing a listing:'
      if (item?.textContent && item.textContent.length > 128) {
        presenceData.state = `${item.textContent
          .replaceAll('amp;', '')
          .substring(0, 125)}...`
      }
      else {
        presenceData.state = item?.textContent?.replaceAll('amp;', '')
      }

      presence.setActivity(presenceData)
    }
    else if (document.location.href.includes('www.grailed.com/mygrails/')) {
      presenceData.details = 'Browsing:'
      presenceData.state = 'My Grails'
      presence.setActivity(presenceData)
    }
    else if (document.location.href.endsWith('www.grailed.com/foryou')) {
      presenceData.details = 'Viewing:'
      presenceData.state = 'For You'
      presence.setActivity(presenceData)
    }
    else if (
      document.location.href.includes('www.grailed.com/collaborations/')
    ) {
      const item = document.querySelector(
        '#designer-collaboration > div.designer-profile-container > div.designer-profile-info-container > div > h1',
      )
      presenceData.details = 'Viewing a collaboration:'
      if (item?.textContent && item.textContent.length > 128) {
        presenceData.state = `${item.textContent
          .replaceAll('amp;', '')
          .substring(0, 125)}...`
      }
      else {
        presenceData.state = item?.textContent?.replaceAll('amp;', '')
      }

      presence.setActivity(presenceData)
    }
    else if (
      document.location.href.includes('www.grailed.com/collections/')
    ) {
      presenceData.details = 'Browsing a Collection:'
      const item = document.querySelector(
        '#CapsulePage > div.CapsuleHeader > div.-container._has-hero > div > div.-name-container > h1',
      )
      if (item?.textContent && item.textContent.length > 128) {
        presenceData.state = `${item.textContent
          .replaceAll('amp;', '')
          .substring(0, 125)}...`
      }
      else {
        presenceData.state = item?.textContent?.replaceAll('amp;', '')
      }

      presence.setActivity(presenceData)
    }
    else if (document.location.href.includes('www.grailed.com/collections')) {
      presenceData.details = 'Browsing:'
      presenceData.state = 'Collections'
      presence.setActivity(presenceData)
    }
    else if (document.location.href.includes('www.grailed.com/designers')) {
      if (document.location.href.includes('www.grailed.com/designers/')) {
        if (document.location.pathname.lastIndexOf('/') < 11) {
          presenceData.details = 'Browsing a Designer:'
          const item = document.querySelector(
            '#__next > div > main > div:nth-child(2) > div.ProfileWrapper > div > div.DetailPageProfile-Info > div > h1',
          )
          if (item?.textContent && item.textContent.length > 128) {
            presenceData.state = `${item.textContent
              .replaceAll('amp;', '')
              .substring(0, 125)}...`
          }
          else {
            presenceData.state = item?.textContent?.replaceAll('amp;', '')
          }
        }
        else {
          const item = document.querySelector(
            '#designer-category > div.FiltersInstantSearch > div.feed-and-filters > div.right > h2',
          )
          presenceData.details = 'Browsing:'
          if (item?.textContent && item.textContent.length > 128) {
            presenceData.state = `${item.textContent
              .replaceAll('amp;', '')
              .substring(29, 125)}...`
          }
          else {
            presenceData.state = item?.textContent
              ?.replaceAll('amp;', '')
              .substring(29, item.textContent.length)
          }
        }
      }
      else if (document.location.href.endsWith('www.grailed.com/designers')) {
        presenceData.details = 'Browsing:'
        presenceData.state = 'Designers'
      }
      presence.setActivity(presenceData)
    }
    else if (document.location.href.includes('www.grailed.com/categories/')) {
      presenceData.details = 'Browsing:'
      const item = document.querySelector(
        '#CategoryPage > div.-pageHeader > div > div.DetailPage--Header > div.-details > h1',
      )
      if (item?.textContent && item.textContent.length > 128) {
        presenceData.state = `${item.textContent
          .replaceAll('amp;', '')
          .substring(0, 125)}...`
      }
      else {
        presenceData.state = item?.textContent?.replaceAll('amp;', '')
      }

      presence.setActivity(presenceData)
    }
    else if (
      document.location.href.includes(
        'www.grailed.com/drycleanonly/categories/',
      )
    ) {
      presenceData.details = 'Reading:'
      const item = document.querySelector(
        '#blog > div.container.tagged-articles > div.filtered-articles-wrapper > h1',
      )
      if (item?.textContent && item.textContent.length > 128) {
        presenceData.state = `${item.textContent
          .replaceAll('amp;', '')
          .substring(0, 125)}...`
      }
      else {
        presenceData.state = item?.textContent?.replaceAll('amp;', '')
      }

      presence.setActivity(presenceData)
    }
    else if (document.location.href.includes('www.grailed.com/products/')) {
      presenceData.details = 'Browsing a Product:'
      const item = document.querySelector(
        '#ProductPage > div.ProductPageHeader > div.-info > h1.-product-name',
      )
      const item2 = document.querySelector(
        '#ProductPage > div.ProductPageHeader > div.-info > h1.-designers-names',
      )
      if (item?.textContent && item.textContent.length > 108) {
        presenceData.state = `${item2?.textContent?.replaceAll(
          'amp;',
          '',
        )}: ${item?.textContent?.replaceAll('amp;', '').substring(0, 105)}...`
      }
      else {
        presenceData.state = `${item2?.textContent?.replaceAll(
          'amp;',
          '',
        )}: ${item?.textContent?.replaceAll('amp;', '')}`
      }
      presence.setActivity(presenceData)
    }
    else if (
      document.location.href.includes('www.grailed.com/drycleanonly')
    ) {
      if (document.location.href.includes('www.grailed.com/drycleanonly/')) {
        const item = document.querySelector(
          '#blog > div.article-wrapper > div > div.article-top-section > h1 > p',
        )
        const item2 = document.querySelector(
          'div.heatwave-app > div.Heatwave--Page > div.Editorial--CampaignPageHeroModule._Heatwave > div > div.--title',
        )
        presenceData.details = 'Reading:'
        if (item) {
          if (item.textContent && item.textContent.length > 128) {
            presenceData.state = `${item.textContent
              .replaceAll('amp;', '')
              .substring(0, 125)}...`
          }
          else {
            presenceData.state = item?.textContent?.replaceAll('amp;', '')
          }
        }
        else if (item2) {
          if (item2?.textContent && item2.textContent.length > 128) {
            presenceData.state = `${item2.textContent
              .replaceAll('amp;', '')
              .substring(0, 125)}...`
          }
          else {
            presenceData.state = item2?.textContent?.replaceAll('amp;', '')
          }
        }
      }
      else {
        presenceData.details = 'Reading:'
        presenceData.state = 'Dry Clean Only'
      }
      presence.setActivity(presenceData)
    }
    else if (document.location.href.includes('www.grailed.com/shop')) {
      if (document.location.href.includes('grailed.com/shop/staff-picks')) {
        presenceData.details = 'Browsing:'
        presenceData.state = 'Staff Picks'
      }
      else {
        const item = document.querySelector(
          '#shop > div > div > div.feed-and-filters > div.right > h2',
        )
        if (item?.textContent?.includes('Available listings related to')) {
          presenceData.details = 'Searching for:'
          presenceData.state = item?.textContent
            ?.replaceAll('amp;', '')
            .substring(29, 125)
        }
        else if (item?.textContent?.endsWith('Listings')) {
          presenceData.details = 'Searching for:'
          presenceData.state = item?.textContent
            ?.replaceAll('amp;', '')
            .replaceAll('|Listings', '')
        }
        else {
          presenceData.details = 'Browsing:'
          presenceData.state = 'The Feed'
        }
      }
      presence.setActivity(presenceData)
    }
    else if (document.location.pathname === '/') {
      presenceData.details = 'Viewing:'
      presenceData.state = 'The Main Page'
      presence.setActivity(presenceData)
    }
    else if (userName) {
      presenceData.details = 'Viewing a User:'
      if (userName?.textContent && userName.textContent.length > 128)
        presenceData.state = `${userName.textContent.substring(0, 125)}...`
      else presenceData.state = userName.textContent

      presence.setActivity(presenceData)
    }
    else {
      presence.setActivity()
    }
  }
})

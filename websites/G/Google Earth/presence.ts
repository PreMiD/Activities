const presence = new Presence({
  clientId: '1034133591938060298',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Earth/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = window.location

  if (pathname === '/web/') {
    presenceData.details = 'Loading'
  }
  else {
    const appRoot = document.querySelector('earth-app')?.shadowRoot
    const knowledgeCard = appRoot?.querySelector('earth-knowledge-card')
    const drawerContainer = appRoot?.querySelector('paper-drawer-panel')
    const drawerRoot = drawerContainer?.querySelector('earth-drawer')?.shadowRoot
    const topToolbarRoot = appRoot?.querySelector('earth-top-toolbar')?.shadowRoot
    const imageLightBox = document.querySelector<HTMLElement>(
      'earth-image-lightbox',
    )
    const voyager = appRoot?.querySelector<HTMLElement>('earth-voyager')
    const measurementToolRoot = drawerContainer?.querySelector('earth-measure-tool')?.shadowRoot
    const fullscreenBalloon = appRoot?.querySelector<HTMLElement>(
      'earth-balloon-fullscreen',
    )
    if (
      pathname.startsWith('/web/search/')
      && appRoot
        ?.querySelector('earth-toolbar')
        ?.shadowRoot
        ?.querySelector('#search')
        ?.hasAttribute('active')
    ) {
      presenceData.details = 'Searching'
      presenceData.state = drawerRoot
        ?.querySelector('earth-search')
        ?.shadowRoot
        ?.querySelector('app-header-layout')
        ?.querySelector('earth-omnibox')
        ?.shadowRoot
        ?.querySelector<HTMLInputElement>('iron-input > input')
        ?.value
    }
    else if (knowledgeCard?.getAttribute('hidden') !== 'true') {
      const mainCardRoot = knowledgeCard?.shadowRoot?.querySelector('#top-card')?.shadowRoot
      presenceData.details = 'Looking at a location'
      presenceData.state = `${
        mainCardRoot?.querySelector<HTMLDivElement>('#title')?.textContent
      } - ${
        mainCardRoot?.querySelector<HTMLDivElement>('#known-for')?.textContent
      }`
    }
    else if (knowledgeCard.hasAttribute('expanded')) {
      const expandedCartRoot = document
        ?.querySelector('earth-expanded-card')
        ?.shadowRoot
        ?.querySelector('app-header-layout')
        ?.querySelector<HTMLDivElement>('#card-content')
      presenceData.details = 'Viewing more information about a location'
      presenceData.state = `${
        expandedCartRoot?.querySelector<HTMLDivElement>('#title')?.textContent
      } - ${
        expandedCartRoot?.querySelector<HTMLDivElement>('#known-for')?.textContent
      }`
    }
    else {
      switch (
        topToolbarRoot
          ?.querySelector('#navigation-action')
          ?.getAttribute('action')
      ) {
        case 'USER_ACTION_NAVIGATION_BACK_VOYAGER_FEED_ITEM': {
          presenceData.details = 'Viewing a Voyager Feed'
          presenceData.state = topToolbarRoot.querySelector<HTMLHeadingElement>(
            '#toolbar-title',
          )?.textContent
          break
        }
        case 'USER_ACTION_NAVIGATION_BACK_PLAY_MODE': {
          presenceData.details = 'Viewing a project presentation'
          presenceData.state = topToolbarRoot.querySelector<HTMLHeadingElement>(
            '#project-title',
          )?.textContent
          break
        }
        case 'USER_ACTION_NAVIGATION_BACK_STREET_VIEW': {
          presenceData.details = 'Viewing Street View'
          presenceData.state = topToolbarRoot
            .querySelector('app-toolbar')
            ?.getAttribute('aria-label')
          break
        }
        default:
          if (imageLightBox && imageLightBox.style.display !== 'none') {
            presenceData.details = 'Viewing a photo'
            presenceData.largeImageKey = imageLightBox?.shadowRoot
              ?.querySelector('#image')
              ?.shadowRoot
              ?.querySelector<HTMLDivElement>('#sizedImgDiv')
              ?.style
              ?.backgroundImage
              ?.match(/url\("(.+)"\)/)?.[1]
          }
          else if (
            voyager?.hasAttribute('enabled')
            && voyager?.style?.display !== 'none'
          ) {
            presenceData.details = 'Browsing Voyager'
          }
          else if (
            fullscreenBalloon
            && fullscreenBalloon.style.display !== 'none'
          ) {
            presenceData.details = 'Preparing Voyager'
          }
          else if (
            measurementToolRoot
              ?.querySelector('#card')
              ?.getAttribute('hidden') !== 'true'
          ) {
            presenceData.details = 'Measuring a distance'
            presenceData.state = measurementToolRoot?.querySelector<HTMLSpanElement>(
              '#formatted-distance',
            )?.textContent
          }
          else if (
            appRoot
              ?.querySelector('earth-toolbar')
              ?.shadowRoot
              ?.querySelector('#projects')
              ?.hasAttribute('active')
          ) {
            const root = drawerRoot?.querySelector('earth-my-places')?.shadowRoot
            const projectPage = root?.querySelector('earth-document-view')
            const propertyEditor = root?.querySelector('earth-property-editor')
            if (projectPage?.getAttribute('hidden') !== 'true') {
              presenceData.details = 'Viewing a project'
              presenceData.state = projectPage?.shadowRoot?.querySelector<HTMLHeadingElement>(
                '#title',
              )?.textContent
            }
            else if (propertyEditor?.getAttribute('hidden') !== 'true') {
              presenceData.details = 'Adding something to a project'
              presenceData.state = propertyEditor?.shadowRoot
                ?.querySelector('#content-panel')
                ?.shadowRoot
                ?.querySelector('.title-input')
                ?.shadowRoot
                ?.querySelector<HTMLInputElement>('#input')
                ?.value
            }
            else {
              presenceData.details = 'Browsing their projects'
            }
          }
          else {
            presenceData.details = 'Looking at a point on the map'
            presenceData.state = appRoot
              ?.querySelector('earth-view-status')
              ?.shadowRoot
              ?.querySelector<HTMLSpanElement>('#pointer-coordinates')
              ?.textContent
              ?.trim()
          }
      }
    }
  }

  presence.info(presenceData.details)

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

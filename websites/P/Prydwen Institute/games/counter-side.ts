import { use } from '../util.js'

export enum CounterSideAssets {
  Gearbuilder = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/2.png',
  Guide = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/3.png',
  TierList = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/4.png',
  Operators = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/5.png',
  Ships = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/6.png',
  Upcoming = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/7.png',
  Skins = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/8.png',
  Stats = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/9.png',
  Blogs = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/10.png',
  ShipBackground = 'https://cdn.rcd.gg/PreMiD/websites/P/Prydwen%20Institute/assets/11.png',
}

export function apply(presenceData: PresenceData, pathList: string[]) {
  switch (pathList[0]) {
    case 'operators': {
      interface OperatorData {
        activeOperator: HTMLDivElement | null
      }

      const { activeOperator } = use<OperatorData>((data) => {
        const observer = new MutationObserver((changes) => {
          for (const change of changes) {
            switch (change.type) {
              case 'attributes': {
                if (change.attributeName === 'aria-expanded') {
                  const target = change.target as HTMLElement
                  if (target.getAttribute('aria-expanded') === 'true') {
                    data.activeOperator = target.closest('.single-operator')
                    return
                  }
                  data.activeOperator = null
                }
                break
              }
              case 'childList': {
                // searching or changing filters
                data.activeOperator = null
                return
              }
            }
          }
        })
        const operatorContainer = document.querySelector(
          '.operator-simplified-view',
        )
        if (!operatorContainer) {
          return null
        }
        observer.observe(operatorContainer, {
          subtree: true,
          childList: true,
          attributes: true,
        })
        return () => observer.disconnect()
      }, pathList)
      if (activeOperator) {
        presenceData.details = 'Viewing an Operator'
        presenceData.state = `${activeOperator.querySelector('.name')?.textContent} - ${activeOperator.querySelector('.nav-link.active')?.textContent}`
        presenceData.smallImageKey = activeOperator.querySelector('img')
        presenceData.smallImageText = [
          ...(activeOperator.querySelector('.details')?.children ?? []),
        ]
          .map(child => child.textContent)
          .join(' ')
      }
      else {
        presenceData.details = 'Viewing Operators'
        presenceData.smallImageKey = CounterSideAssets.Operators
        presenceData.smallImageText = 'Viewing Operators'
      }
      break
    }
  }
  //   else if (document.location.pathname === '/ships') {
  //     presenceData.details = 'Viewing ships'
  //     presenceData.largeImageKey = CounterSideAssets.Ships
  //     presenceData.smallImageKey = CounterSideAssets.Ships
  //     presenceData.smallImageText = 'Viewing ships'
  //   }
  //   else if (document.location.pathname.startsWith('/ships')) {
  //     presenceData.details = 'Viewing a ship'
  //     presenceData.state = shortTitle
  //     presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
  //       '#gatsby-focus-wrapper > div > main > div > div > div.unit-page.ship > div.unit-header.align-items-center.d-flex.flex-wrap > div:nth-child(1) > span > a > div > div > picture > img',
  //     )?.src
  //     presenceData.smallImageKey = CounterSideAssets.Ships
  //     presenceData.smallImageText = 'Viewing ships'
  //     presenceData.buttons = [{ label: 'View Ship', url: document.URL }]
  //   }
  //   else if (
  //     document.querySelector('body > div.fade.modal-backdrop.show')
  //     && document.location.href.includes('skins')
  //   ) {
  //     presenceData.details = 'Viewing skin'
  //     presenceData.state = document
  //       .querySelector(
  //         'body > div.fade.skin-viewer.modal.show > div > div > div.modal-body > div.details > div.name',
  //       )
  //       ?.textContent
  //       ?.substring(
  //         0,
  //         (document
  //           .querySelector(
  //             'body > div.fade.skin-viewer.modal.show > div > div > div.modal-body > div.details > div.name',
  //           )
  //           ?.textContent
  //           ?.lastIndexOf('-') ?? 0) - 1,
  //       )
  //     presenceData.largeImageKey = CounterSideAssets.Ships
  //     presenceData.smallImageKey = CounterSideAssets.Skins
  //     presenceData.smallImageText = 'Viewing skins'
  //   }
  //   else {
  //     switch (document.location.pathname) {
  //       case '/skins': {
  //         presenceData.details = 'Viewing skins'
  //         presenceData.largeImageKey = CounterSideAssets.Ships
  //         presenceData.smallImageKey = CounterSideAssets.Skins
  //         presenceData.smallImageText = 'Viewing skins'

  //         break
  //       }
  //       case '/stats': {
  //         presenceData.details = 'Viewing stats'
  //         presenceData.largeImageKey = CounterSideAssets.Ships
  //         presenceData.smallImageKey = CounterSideAssets.Stats
  //         presenceData.smallImageText = 'Viewing stats'

  //         break
  //       }
  //       case '/tier-list': {
  //         presenceData.details = 'Viewing the tier list'
  //         presenceData.largeImageKey = CounterSideAssets.Ships
  //         presenceData.smallImageKey = CounterSideAssets.Tierlist
  //         presenceData.smallImageText = 'Viewing tier list'

  //         break
  //       }
  //   }
}

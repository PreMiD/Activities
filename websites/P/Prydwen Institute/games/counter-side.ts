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
      if (pathList[1]) {
        presenceData.details = 'Looking into an operator\'s profile'
        presenceData.state = document.querySelector('h1')
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
          '#gatsby-focus-wrapper > div > main > div > div > div.unit-page.operator > div.unit-header.align-items-center.d-flex.flex-wrap > div:nth-child(1) > span > a > div > div > picture > img',
        )?.src
        presenceData.smallImageKey = CounterSideAssets.Ships
        presenceData.smallImageText = 'Prydwen Institute'
        presenceData.buttons = [{ label: 'View Operator', url: document.location.href }]
      }
      else {
        presenceData.details = 'Viewing operators'
        presenceData.largeImageKey = CounterSideAssets.Ships
        presenceData.smallImageKey = CounterSideAssets.Operators
        presenceData.smallImageText = 'Viewing operators'
      }
      break
    }
  }
  //   if (document.location.pathname === '/operators') {
  //   }
  //   else if (document.location.pathname.startsWith('/operators')) {

  //   }
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
  //       case '/guides': {
  //         presenceData.details = 'Finding guides'
  //         presenceData.largeImageKey = CounterSideAssets.Ships
  //         presenceData.smallImageKey = CounterSideAssets.Guide
  //         presenceData.smallImageText = 'Viewing guides'

//         break
//       }
//       default:
//         if (document.location.pathname.startsWith('/guides')) {
//           presenceData.details = 'Reading a guide:'
//           presenceData.state = shortTitle
//           presenceData.largeImageKey = CounterSideAssets.Guide
//           presenceData.smallImageKey = CounterSideAssets.Ships
//           presenceData.smallImageText = 'Prydwen Institute'
//           presenceData.buttons = [{ label: 'Read Guide', url: document.URL }]
//         }
//         else if (document.location.href.includes('gear-builder')) {
//           presenceData.details = 'Making a Gear Builder template'
//           presenceData.largeImageKey = CounterSideAssets.Ships
//           presenceData.smallImageKey = CounterSideAssets.Gearbuilder
//           presenceData.smallImageText = 'Gear building'
//         }
//         else {
//           presenceData.details = 'Browsing the wiki'
//           presenceData.largeImageKey = CounterSideAssets.Ships
//         }
//     }
//   }
}

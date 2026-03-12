import { Assets } from 'premid'

const presence = new Presence({
  clientId: '647973934603567130',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/%23/%E5%B7%B4%E5%93%88%E5%A7%86%E7%89%B9/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  if (document.location.hostname === 'forum.gamer.com.tw') {
    if (document.location.pathname === '/') {
      presenceData.startTimestamp = browsingTimestamp
      presenceData.details = 'Viewing home page'
    }
    else if (document.querySelector('.BH-menu')) {
      if (document.location.pathname.includes('A.php')) {
        presenceData.details = document.querySelector('div.BH-menu > ul.BH-menuE > li > a[title]')?.getAttribute('title')
        presenceData.state = '首頁'
        presence.setActivity(presenceData)
        presenceData.smallImageKey = Assets.Reading
      }
      if (document.location.pathname.includes('B.php')) {
        presenceData.details = document.querySelector('div.BH-menu > ul.BH-menuE > li > a[title]')?.getAttribute('title')
        presenceData.state = '列表'
        presence.setActivity(presenceData)
        presenceData.smallImageKey = Assets.Reading
      }
      if (document.location.pathname.includes('C.php')) {
        presenceData.details = document.querySelector('div.BH-menu > ul.BH-menuE > li > a[title]')?.getAttribute('title')
        presenceData.state = document.querySelectorAll(
          '.c-post__header__title',
        )[0]?.textContent
        presence.setActivity(presenceData)
        presenceData.smallImageKey = Assets.Reading
      }
    }
  }
  if (!presenceData.details) {
    presenceData.startTimestamp = browsingTimestamp
    presenceData.details = 'Viewing site:'
    presenceData.state = '巴哈姆特'
    presence.setActivity(presenceData)
  }
  else {
    presence.setActivity(presenceData)
  }
})

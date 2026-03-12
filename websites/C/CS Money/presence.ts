const presence = new Presence({
  clientId: '922108073533898763',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/CS%20Money/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (
    document.querySelector('#modal > div.styles_overlay__3KR4i')
    && document.location.href.includes('csgo')
  ) {
    presenceData.details = `Inspecting skin: ${
      document.querySelector(
        '#modal > div > div.styles_wrapper__1pcux > div > div > div > div.ItemDetailsLayout_item_numerical__2-JYQ > div:nth-child(1) > div > div > div > div.ItemDetailsLayout_name__ZYPKv',
      )?.textContent
    }`
    presenceData.state = document.querySelector(
      '#modal > div > div.styles_wrapper__1pcux > div > div > div > div.ItemDetailsLayout_item_numerical__2-JYQ > div:nth-child(5) > div.ItemDetailsLayout_price_block__37gpv > div.styles_price_wrap__7fZ5J > div.styles_information__TKFXx > div.styles_price_container__3Fc2t > span > span',
    )?.textContent
    presenceData.buttons = [
      {
        label: 'Inspect 3D',
        url: document.querySelector<HTMLAnchorElement>(
          '#modal > div > div.styles_wrapper__1pcux > div > div > div > div.ItemDetailsLayout_item_visual__2lBPE > div:nth-child(3) > div > a:nth-child(3)',
        )!.href,
      },
      {
        label: 'More details',
        url: document.querySelector<HTMLAnchorElement>(
          '#modal > div > div.styles_wrapper__1pcux > div > div > div > div.ItemDetailsLayout_item_visual__2lBPE > div:nth-child(3) > div > a:nth-child(4)',
        )!.href,
      },
    ]
  }
  else if (
    document.querySelector('#modal > div.styles_overlay__3KR4i')
    && document.location.href.includes('dota')
  ) {
    presenceData.details = `Inspecting item: ${
      document.querySelector(
        '#modal > div > div.styles_wrapper__1pcux > div > div > div > div.ItemDetailsLayout_item_numerical__2-JYQ > div.MediaQueries_desktop__TwhBE > div > div > div > div',
      )?.textContent
    }`
    presenceData.state = document.querySelector(
      '#modal > div > div.styles_wrapper__1pcux > div > div > div > div.ItemDetailsLayout_item_numerical__2-JYQ > div:nth-child(5) > div.ItemDetailsLayout_price_block__37gpv > div.styles_price_wrap__7fZ5J > div.styles_information__TKFXx > div.styles_price_container__3Fc2t > span > span',
    )?.textContent
  }
  else if (document.location.href.includes('trade')) {
    presenceData.details = 'Making a trade offer'
  }
  else if (document.location.href.includes('store')) {
    presenceData.details = 'Browsing the store'
  }
  else if (document.location.href.includes('sell')) {
    presenceData.details = 'Selling items'
  }
  else if (document.location.href.includes('auction')) {
    presenceData.details = 'Joining an auction'
  }
  else if (document.location.href.includes('personal-info')) {
    presenceData.details = 'Viewing personal info'
  }
  else if (document.location.href.includes('transactions')) {
    presenceData.details = 'Viewing transactions'
  }
  else if (document.location.hostname === '3d.cs.money') {
    presenceData.details = 'Inspecting 3D'
    presenceData.state = document.title.substring(
      0,
      document.title.lastIndexOf('|') - 1,
    )
    presenceData.buttons = [{ label: 'Inspect 3D', url: document.URL }]
  }
  else if (document.location.hostname === 'wiki.cs.money') {
    presenceData.details = 'Reading the wiki';
    [presenceData.state] = document.title.split(/—/)
    presenceData.buttons = [{ label: 'Read wiki', url: document.URL }]
  }
  else {
    presenceData.details = 'Browsing'
  }
  presence.setActivity(presenceData)
})

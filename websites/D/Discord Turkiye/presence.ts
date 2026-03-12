const presence = new Presence({ clientId: '503557087041683458' })
const startTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Discord%20Turkiye/assets/logo.png',
    details: 'Geziniyor',
    startTimestamp,
    name: 'Discord Turkiye',
  }
  const { pathname } = document.location
  const privacyMode = await presence.getSetting('privacy_mode').catch(() => false)

  if (document.querySelector('[href="/login/"]')) {
    presenceData.smallImageText = 'Misafir Modu'
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Discord%20Turkiye/assets/0.png'
  }
  else if (document.querySelector('span.avatar.avatar--xxs > img')) {
    presenceData.smallImageText = document
      .querySelector('span.avatar.avatar--xxs > img')
      ?.getAttribute('alt')
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/D/Discord%20Turkiye/assets/0.png'
  }

  switch (pathname) {
    case '/':
      presenceData.details = 'Anasayfayı görüntülüyor'
      break
    case '/hesabim':
      presenceData.details = 'Kişisel detaylarını görüntülüyor'
      break
    case '/kullanicilar/':
      presenceData.details = 'Kullanıcıları görüntülüyor'
      break
    case '/araclar/':
      presenceData.details = 'Araçları görüntülüyor'
      delete presenceData.smallImageKey
      break

    case '/araclar/davet/':
      delete presenceData.smallImageKey
      if (privacyMode) {
        presenceData.details = 'Davet görüntülüyor'
      }
      else if (
        document.querySelector<HTMLElement>('div.tag > div.name')?.textContent
      ) {
        presenceData.details = 'Daveti görüntülüyor:'
        presenceData.state = document.querySelector<HTMLElement>('div.tag > div.name')?.textContent
        presenceData.largeImageKey = document
          .querySelector<HTMLElement>('div.icon')
          ?.style
          ?.backgroundImage
          ?.split('url("')[1]
          ?.split('");')[0]
      }
      break
    case '/konular/':
      presenceData.details = 'Konuyu görüntülüyor:'
      presenceData.state = document.title.split(' | ')[0]
      if (
        document
          .querySelector<HTMLElement>('div.fr-element.fr-view > p')
          ?.textContent
          ?.trim()
      ) {
        presenceData.details = 'Konuya yorum yazıyor:'
        presenceData.state = document.title.split(' | ')[0]
      }
      break
    case '/araclar/kullanici/':
      delete presenceData.smallImageKey
      if (privacyMode) {
        presenceData.details = 'Kullanıcı görüntülüyor'
      }
      else if (document.querySelector<HTMLElement>('div.tag')?.textContent) {
        presenceData.details = 'Kullanıcı görüntülüyor:'
        presenceData.state = `${
          document.querySelector<HTMLElement>('div.tag > div.username')
            ?.textContent
        }${
          document.querySelector<HTMLElement>('div.tag > div.discriminator')
            ?.textContent
        }`
        presenceData.largeImageKey = document
          .querySelector<HTMLElement>('div.avatar')
          ?.style
          ?.backgroundImage
          ?.split('url("')[1]
          ?.split('");')[0]
      }
      break
    case '/konusmalar/':
      presenceData.details = 'Konuşmalarını görüntülüyor'
      break
    case '/tags/':
      presenceData.details = 'Etiketi görüntülüyor:'
      presenceData.state = document.title.split(' | ')[0]
      break
    case '/tags':
      presenceData.details = 'Etiketleri görüntülüyor'
      break
    case '/post-thread':
      presenceData.details = 'Kategoride konu açıyor:'
      presenceData.state = document.querySelector(
        '[itemprop="itemListElement"]:last-child span[itemprop="name"]',
      )?.textContent
      break
  }

  if (document.querySelector('span.username > span')) {
    presenceData.details = 'Kullanıcıyı görüntülüyor:'
    presenceData.state = document.title.split(' | ')[0]
  }

  if (document.querySelector<HTMLElement>('div.tag')?.textContent) {
    presenceData.details = 'Kullanıcı görüntülüyor:'
    presenceData.state = `${
      document.querySelector<HTMLElement>('div.tag > div.username')?.textContent
    }${
      document.querySelector<HTMLElement>('div.tag > div.discriminator')
        ?.textContent
    }`
    presenceData.largeImageKey = document
      .querySelector<HTMLElement>('div.avatar')
      ?.style
      ?.backgroundImage
      ?.split('url("')[1]
      ?.split('");')[0]
  }

  presence.setActivity(presenceData)
})

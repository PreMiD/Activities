const presence = new Presence({
  clientId: '1193287365620400128',
})
function capitalize(text: string): string {
  return text
    .replace(/[[{(_)}\]]/g, ' ')
    .split(' ')
    .map((str) => {
      return str.charAt(0).toUpperCase() + str.slice(1)
    })
    .join(' ')
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/CacaX/assets/logo.png',
  }
  const images = document.querySelectorAll('img')

  if (pathname.includes('/users/')) {
    presenceData.details = `Profil de : ${
      (document
        .querySelector('p.text-md.text-neutral-500')
        ?.childNodes[0]
        ?.textContent
        ?.trim() ?? '')
      + (document
        .querySelector('p.text-md.text-neutral-500')
        ?.childNodes[1]
        ?.textContent
        ?.trim() ?? '')
    }`
    presenceData.state = `Regarde le profil de l'utilisateur ${
      document.querySelector('h1')?.textContent
    }...`
    presenceData.buttons = [{ label: 'Voir le Profil', url: href }]
    let imgUrl = ''

    for (const image of images) {
      // Vérifie si la source (src) commence par "data:image/webp;base64", si alt est égal à "Avatar" et n'est pas à l'intérieur de l'élément exclu
      if (
        !image.closest('.bg-neutral-800')
        && image.src.startsWith('data:image/')
        && image.alt === 'Avatar'
      ) {
        imgUrl = image.src
        presenceData.smallImageKey = imgUrl
        break
      }
    }

    // si rien trouvé
    if (imgUrl === '') {
      presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/C/CacaX/assets/0.png'
    }
    else {
      presenceData.largeImageKey = imgUrl
    }

    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/C/CacaX/assets/logo.png'
  }
  else if (pathname.includes('/posts/')) {
    presenceData.details = 'Posts'
    presenceData.state = `Regarde le post de ${
      document.querySelector('span')?.textContent
    }...`
    presenceData.buttons = [{ label: 'Voir le Post', url: href }]

    let imgUrl = ''

    for (const image of images) {
      // Vérifie si la source (src) commence par "data:image/webp;base64", si alt est égal à "Avatar" et n'est pas à l'intérieur de l'élément exclu
      if (
        !image.closest('.bg-neutral-800')
        && image.src.startsWith('data:image/')
        && image.alt === 'Avatar'
      ) {
        imgUrl = image.src
        presenceData.smallImageKey = imgUrl
        break
      }
    }

    // si rien trouvé
    if (imgUrl === '') {
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/C/CacaX/assets/0.png'
    }
    else {
      presenceData.smallImageKey = imgUrl
    }

    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/C/CacaX/assets/logo.png'
  }
  else {
    switch (pathname) {
      case '/':
        presenceData.details = 'Accueil'
        presenceData.state = 'Regarde les derniers posts...'
        break
      case '/notifications':
        presenceData.details = 'Notifications'
        presenceData.state = 'Regarde ses notifications...'
        break
      case '/messages':
        presenceData.details = 'Messagerie'
        presenceData.state = 'Regarde ses messages...'
        break
      case '/about':
        presenceData.details = 'À propos'
        presenceData.state = 'Regarde la page à propos...'
        break
      case '/privacy':
        presenceData.details = 'Politique de confidentialité'
        presenceData.state = 'Regarde la politique de confidentialité (il veut voir si on respecte le RGPD)...'
        break
      case '/cacaxcoin':
        presenceData.details = 'CacaXCoin (CXC)'
        presenceData.state = 'Regarde la page CacaXCoin...'
        break
      default:
        presenceData.details = 'Navigue'
        presenceData.state = capitalize(pathname.split('/')[1]!)
    }
  }

  presence.setActivity(presenceData)
})

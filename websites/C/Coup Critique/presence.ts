import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1070406808113532989',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const staticPages: Record<string, PresenceData> = {
  '': { details: 'Parcours la page d\'accueil' },
  'resources': { details: 'Parcours les liens utiles' },
  'user': { details: 'Consulte son profil' },
  'notifications': { details: 'Consulte ses notifications' },
  'remerciements': { details: 'Lit les remerciements' },
}
const staticDatas: Record<string, string[]> = {
  guides: ['Parcours les guides', 'Lit le guide'],
  actualities: ['Parcours les actualités', 'Lit l\'actualité'],
  tournaments: ['Parcours les tournois', 'Lit la page du tournoi'],
}
const slideshow = new Slideshow()

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/C/Coup%20Critique/assets/logo.png',
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: ActivityAssets.Logo,
  }
  const { pathname, href } = document.location
  const pathArr = pathname.replace('entity/', '').split('/')
  const startPath = pathArr[1]
  const presenceDataSlide: PresenceData = {
    startTimestamp: browsingTimestamp,
    largeImageKey: ActivityAssets.Logo,
  }
  const [privacy, showImg, showButtons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('image'),
    presence.getSetting<boolean>('buttons'),
  ])

  switch (startPath) {
    case 'teams':
      presenceData.details = 'Parcours les équipes'
      if (pathArr[2] === 'create') {
        presenceData.details = presenceDataSlide.details = 'Crée une équipe'
        presenceData.state = `Tier : ${
          document.querySelector<HTMLInputElement>('input[name=\'tier\']')?.value
        }`
        const name = document.querySelector<HTMLInputElement>('input[name=\'name\']')?.value
        presenceDataSlide.state = `Nom : ${name === '' ? 'aucun nom' : name}`
        slideshow.addSlide('nameSlide', presenceDataSlide, 5000)
        slideshow.addSlide('tierSlide', presenceData, 5000)
      }
      else if (pathArr.length > 2) {
        presenceData.details = 'Regarde l\'équipe'
        presenceData.state = document.querySelector('h1')?.textContent
        presenceData.buttons = [{ label: 'Voir l\'Equipe', url: href }]
      }
      break
    case 'pokemons':
      presenceData.details = 'Parcours la liste des pokemons'
      if (pathArr.length > 2) {
        presenceData.details = 'Lit la fiche pokemon'
        presenceData.state = document
          .querySelector('h1')
          ?.textContent
          ?.split('de ')[1]
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.art-pokemon')?.src
        presenceData.smallImageKey = Assets.Reading
        presenceData.buttons = [{ label: 'Voir la Fiche', url: href }]
      }
      break
    case 'tiers':
      presenceData.details = pathArr.length > 2
        ? `[${
          document.querySelector('h1')?.textContent
        }] Parcours les pokemons`
        : 'Regarde la liste des tiers'
      presenceData.state = `Génération ${
        document.querySelector('div.labeled > a')?.textContent
      }`
      presenceData.buttons = [{ label: 'Voir la Liste', url: href }]
      break
    case 'items':
    case 'moves': {
      const caseString = startPath === 'moves' ? 'capacités' : 'objets'
      presenceData.details = `Parcours la liste des ${caseString}`
      if (pathArr.length > 2) {
        presenceData.details = `Lit la fiche ${caseString.substring(
          0,
          caseString.length - 1,
        )}`
        presenceData.state = document.querySelector('h1')?.textContent
        presenceData.smallImageKey = Assets.Reading
        presenceData.buttons = [{ label: 'Voir la Fiche', url: href }]
      }
      break
    }
    case 'abilities':
    case 'types': {
      const caseString = startPath === 'types' ? 'types' : 'talents'
      presenceData.details = `Regarde la liste des ${caseString}`
      if (pathArr.length > 2) {
        presenceData.details = `Parcours la liste du ${caseString.substring(
          0,
          caseString.length - 1,
        )}`
        presenceData.state = document.querySelector('h1')?.textContent
      }
      break
    }
    case 'videos': {
      presenceData.details = presenceDataSlide.details = 'Parcours les vidéos'
      const categories = document.querySelector<HTMLLinkElement>('div[name="tags"] a')
      const author = document.querySelector<HTMLDivElement>(
        'div[label="Auteur"] div[class="text"]',
      )
      if (categories) {
        presenceData.state = `Catégorie ${categories.textContent}`
        slideshow.addSlide('categoriesSlide', presenceData, 5000)
      }
      if (author) {
        presenceDataSlide.state = `Par ${author.textContent}`
        slideshow.addSlide('authorSlide', presenceDataSlide, 5000)
      }
      break
    }
    case 'guides':
    case 'actualities':
    case 'tournaments':
      presenceData.details = staticDatas[startPath]?.[0]
      if (pathArr.length > 2) {
        presenceData.details = staticDatas[startPath]?.[1]
        presenceData.state = document.querySelector('h1')?.textContent
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('div > img')?.src
        presenceData.buttons = [{ label: 'Consulter la page', url: href }]
      }
      break
    default:
      if (Object.keys(staticPages).includes(startPath!))
        presenceData = { ...presenceData, ...staticPages[startPath!] }
  }

  if ((privacy || !showButtons) && presenceData.buttons)
    delete presenceData.buttons
  if ((privacy || !showImg) && presenceData.largeImageKey)
    presenceData.largeImageKey = ActivityAssets.Logo

  if (slideshow.getSlides().length > 0)
    presence.setActivity(slideshow)
  else if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

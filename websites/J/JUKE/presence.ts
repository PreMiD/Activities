import { Assets } from 'premid'

const presence = new Presence({
  clientId: '811305223783448627',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/JUKE/assets/logo.png',
    buttons: [{ label: 'Radio luisteren', url: document.location.href }],
  }

  if (document.querySelector('span[class*=eC-title]')) {
    presenceData.details = document
      .querySelector('span[class*=eC-title]')
      ?.textContent
      ?.replace('De ', 'de ')
      .replace('Het ', 'het ')
      .replace('&amp;', '&')
    if (document.querySelector('span[class*=eC-subtitle]')) {
      presenceData.state = document
        .querySelector('span[class*=eC-subtitle]')
        ?.textContent
        ?.replace('De ', 'de ')
        .replace('Het ', 'het ')
        .replace('&amp;', '&')
    }
  }

  if (!presenceData.details) {
    presenceData.details = 'Bladert op JUKE.nl'
    presenceData.state = `Pagina '${document.title
      .replace(' |', '|')
      .split('|')[0]
      ?.replace(
        'JUKE - Luister nu jouw favoriete radiozenders, non-stop muziek en podcasts!',
        'Home',
      )}'`
  }

  if (document.querySelector('rect')) {
    presenceData.smallImageKey = Assets.Play
    presenceData.smallImageText = 'Wordt afgespeeld'
    presenceData.buttons = [
      { label: 'Ook radio luisteren', url: document.location.href },
    ]
  }
  else if (document.querySelector('[class*=spinner]')) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Wordt geladen'
  }
  else if (document.querySelector('polygon')) {
    presenceData.smallImageKey = Assets.Pause
    presenceData.smallImageText = 'Gepauzeerd'
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

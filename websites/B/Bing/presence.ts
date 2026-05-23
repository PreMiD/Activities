import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Bing/assets/logo.png',
    name: 'Bing',
  }

  // Get search query from HTML form input.
  function searchQuery(): HTMLInputElement {
    return document.querySelector('#sb_form_q') as HTMLInputElement
  }

  //  Get amount of results from query.
  function queryResults(): HTMLElement {
    return document.querySelectorAll('.sb_count')[0] as HTMLElement
  }

  // Sets the timestamp.
  function setTimestamp(): number {
    return Math.floor(Date.now() / 1000)
  }

  /**
   * Get's the setting specified and replaces %search% with the search input.
   * @param {string} settingName Name of the setting
   */
  async function handleFormatting(settingName: string): Promise<string> {
    const setting = await presence.getSetting<string>(settingName)
    return setting.replace('%search%', searchQuery().value)
  }

  if (
    document.URL === 'https://www.bing.com/'
    || document.URL === 'https://www.bing.com'
    || document.location.href.includes('/?cc=')
    || document.location.href.includes('/?FORM=Z9FD1')
  ) {
    presenceData.details = await presence.getSetting<string>('homepageMessage')
    presenceData.startTimestamp = setTimestamp()
  }
  else if (document.location.href.includes('/account/general')) {
    presenceData.details = await presence.getSetting<string>('settingsMessage')
    presenceData.startTimestamp = setTimestamp()
  }
  else if (document.location.href.includes('?q=')) {
    presenceData.startTimestamp = setTimestamp()
    presenceData.smallImageKey = Assets.Search

    if (document.location.href.includes('/images/')) {
      presenceData.details = await handleFormatting('imageSearch')
    }
    else if (document.location.href.includes('/videos/')) {
      presenceData.details = await handleFormatting('videoSearch')
    }
    else if (document.location.href.includes('/news/')) {
      presenceData.details = await handleFormatting('newsSearch')
    }
    else {
      presenceData.details = await handleFormatting('standardSearch')
      presenceData.state = queryResults().textContent
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

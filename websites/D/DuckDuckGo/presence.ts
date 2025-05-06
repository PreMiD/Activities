import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/DuckDuckGo/assets/logo.png',
    name: 'DuckDuckGo',
  }

  // Get search query from HTML form input.
  function searchQuery(): HTMLInputElement {
    return document.querySelector('#search_form_input') as HTMLInputElement
  }

  // Sets the timestamp.
  function setTimestamp(): number {
    return Math.floor(Date.now() / 1000)
  }

  /**
   * Get's the setting specified and replaces %search% with the search input or %content% when indicated.
   * @param {string} settingName Name of the setting
   * @param {string} content Optional - Replaces %content% with this input
   */
  async function handleFormatting(
    settingName: string,
    content?: string,
  ): Promise<string> {
    const setting = await presence.getSetting<string>(settingName)
    if (!content)
      return setting.replace('%search%', searchQuery().value)
    return setting.replace('%content%', content)
  }

  if (
    document.URL === 'https://duckduckgo.com/'
    || document.URL === 'https://duckduckgo.com'
    || document.location.href.includes('/&t=h_')
  ) {
    presenceData.details = await presence.getSetting<string>('homepageMessage')
    presenceData.startTimestamp = setTimestamp()
  }
  else if (document.location.href.includes('/settings')) {
    presenceData.details = await presence.getSetting<string>('settingsMessage')
    presenceData.startTimestamp = setTimestamp()
  }
  else if (document.location.href.includes('?q=')) {
    presenceData.startTimestamp = setTimestamp()
    presenceData.smallImageKey = Assets.Search

    if (document.location.href.includes('iaxm=maps')) {
      presenceData.details = await handleFormatting('mapSearch')
    }
    else if (document.location.href.includes('iax=images')) {
      presenceData.details = await handleFormatting('imageSearch')
    }
    else if (document.location.href.includes('iax=videos')) {
      presenceData.details = await handleFormatting('videoSearch')
    }
    else if (document.location.href.includes('iar=news')) {
      presenceData.details = await handleFormatting('newsSearch')
    }
    else if (document.location.href.includes('ia=meanings')) {
      presenceData.details = await handleFormatting('meaningsSearch')
    }
    else if (document.location.href.includes('ia=definition')) {
      presenceData.details = await handleFormatting('definitonSearch')
    }
    else if (document.location.href.includes('ia=shopping')) {
      presenceData.details = await handleFormatting('shoppingSearch')
    }
    else if (document.location.href.includes('ia=recipes')) {
      presenceData.details = await handleFormatting('recipeSearch')
    }
    else if (document.location.href.includes('&ia=stock')) {
      presenceData.details = await handleFormatting(
        'stockSearch',
        document.querySelectorAll('.stocks__header')[0]?.querySelectorAll('a')[0]
          ?.textContent ?? '',
      )
    }
    else {
      presenceData.details = await handleFormatting('standardSearch')
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

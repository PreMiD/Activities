import { Assets } from 'premid'

const presence = new Presence({
  clientId: '626536244670889985',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/CurseForge/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  function setStateGame(
    game: string,
    categoryURL: string,
    categoryText: string,
    categoryTextSingle: string,
  ): void {
    if (document.location.pathname.includes(`/${categoryURL}/`)) {
      const title = document.querySelector(
        'body > div.flex.flex-col.min-h-full.min-h-screen > main > div.z-0 > header > div.container.mx-auto.mt-auto.flex.justify-between > div:nth-child(1) > div > div:nth-child(1) > h2',
      )
      if (!title) {
        const title = document.querySelector(
          'body > div.flex.flex-col.min-h-full.min-h-screen > main > div.z-0 > div > section > div.px-2.flex-1 > div > div.flex.flex-col.mb-4 > h2',
        )!
        presenceData.details = `${game}, Viewing category:`
        presenceData.state = `${categoryText} - ${title.textContent?.replace('All ', '')}`

        delete presenceData.smallImageKey
      }
      else {
        presenceData.details = `${game}, Viewing ${categoryTextSingle}:`
        if (title.textContent!.length > 128) {
          presenceData.state = `${title.textContent!.substring(
            0,
            125,
          )}...`
        }
        else {
          presenceData.state = title.textContent
        }

        delete presenceData.smallImageKey
      }
    }
    else if (document.location.pathname.includes(`/${categoryURL}`)) {
      presenceData.details = `${game}, Viewing category:`
      presenceData.state = categoryText

      delete presenceData.smallImageKey
    }
    else {
      presenceData.details = `CurseForge - ${game}`
      delete presenceData.state

      delete presenceData.smallImageKey
    }
  }

  if (document.location.hostname === 'www.curseforge.com') {
    if (document.location.pathname.includes('/minecraft/')) {
      if (document.location.pathname.includes('/modpacks')) {
        setStateGame('MC', 'modpacks', 'Modpacks', 'modpack')
      }
      else if (document.location.pathname.includes('/bukkit-plugins')) {
        setStateGame('MC', 'bukkit-plugins', 'Bukkit plugins', 'Bukkit plugin')
      }
      else if (document.location.pathname.includes('/customization')) {
        setStateGame('MC', 'customization', 'Customizations', 'customization')
      }
      else if (document.location.pathname.includes('/mc-addons')) {
        setStateGame('MC', 'mc-addons', 'Addons', 'addon')
      }
      else if (document.location.pathname.includes('/mc-mods')) {
        setStateGame('MC', 'mc-mods', 'Mods', 'mod')
      }
      else if (document.location.pathname.includes('/texture-packs')) {
        setStateGame('MC', 'texture-packs', 'Texture Packs', 'texturepack')
      }
      else if (document.location.pathname.includes('/worlds')) {
        setStateGame('MC', 'worlds', 'Worlds', 'world')
      }
      else {
        presenceData.details = 'CurseForge - MC'
        delete presenceData.state

        delete presenceData.smallImageKey
      }
    }
    else if (document.location.pathname.includes('/wow/')) {
      setStateGame('WoW', 'addons', 'Addons', 'addon')
    }
    else if (document.location.pathname.includes('/sc2/')) {
      setStateGame('SC2', 'assets', 'Assets', 'asset')
    }
    else if (document.location.pathname.includes('/kerbal/')) {
      setStateGame('Kerbal', 'ksp-mods', 'Mods', 'mod')
    }
    else if (document.location.pathname.includes('/wildstar/')) {
      setStateGame('WildStar', 'ws-addons', 'Addons', 'addon')
    }
    else if (document.location.pathname.includes('/terraria/')) {
      if (document.location.pathname.includes('/maps')) {
        setStateGame('Terraria', 'maps', 'Maps', 'map')
      }
      else if (document.location.pathname.includes('/mods')) {
        setStateGame('Terraria', 'mods', 'Mods', 'mod')
      }
      else {
        presenceData.details = 'CurseForge - Terraria'
        delete presenceData.state

        delete presenceData.smallImageKey
      }
    }
    else if (document.location.pathname.includes('/worldoftanks/')) {
      if (document.location.pathname.includes('/wot-mods')) {
        setStateGame('WoT', 'wot-mods', 'Mods', 'mod')
      }
      else if (document.location.pathname.includes('/wot-skins')) {
        setStateGame('WoT', 'wot-skins', 'Skins', 'skin')
      }
      else {
        presenceData.details = 'CurseForge - WoT'
        delete presenceData.state

        delete presenceData.smallImageKey
      }
    }
    else if (document.location.pathname.includes('/rift/')) {
      setStateGame('Rift', 'addons', 'Addons', 'addon')
    }
    else if (document.location.pathname.includes('/rom/')) {
      setStateGame('RoM', 'addons', 'Addons', 'addon')
    }
    else if (document.location.pathname.includes('/skyrim/')) {
      setStateGame('Skyrim', 'mods', 'Mods', 'mod')
    }
    else if (document.location.pathname.includes('/tsw/')) {
      setStateGame('TSW', 'tsw-mods', 'Mods', 'mod')
    }
    else if (document.location.pathname.includes('/teso/')) {
      setStateGame('TESO', 'teso-addons', 'Addons', 'addon')
    }
    else if (document.location.pathname.includes('/stardewvalley/')) {
      setStateGame('Stardew Valley', 'mods', 'Mods', 'mod')
    }
    else if (document.location.pathname.includes('/swlegends/')) {
      setStateGame('SWLegends', 'tswl-mods', 'Mods', 'mod')
    }
    else if (document.location.pathname.includes('/chronicles-of-arcadia/')) {
      setStateGame('Chronicles of Arcadia', 'addons', 'Addons', 'addon')
    }
    else if (document.location.pathname.includes('/surviving-mars/')) {
      setStateGame('Surviving Mars', 'mods', 'Mods', 'mod')
    }
    else if (document.location.pathname.includes('/darkestdungeon/')) {
      setStateGame('Darkest Dungeon', 'dd-mods', 'Mods', 'mod')
    }
    else if (document.location.pathname.includes('/gta5/')) {
      if (document.location.pathname.includes('/gta-v-mods')) {
        setStateGame('GTA5', 'gta-v-mods', 'Mods', 'mod')
      }
      else if (document.location.pathname.includes('/gta-v-tools')) {
        setStateGame('GTA5', 'gta-v-tools', 'Tools', 'tool')
      }
      else {
        presenceData.details = 'CurseForge - GTA5'
        delete presenceData.state

        delete presenceData.smallImageKey
      }
    }
    else if (document.location.pathname.includes('/staxel/')) {
      setStateGame('Staxel', 'staxel-mods', 'Mods', 'mod')
    }
    else if (document.location.pathname.includes('/members/')) {
      const user = document.querySelector(
        'body > div.flex.flex-col.min-h-full.min-h-screen > main > section > div > div.text-base > div.username.text-xl',
      )
      presenceData.details = 'Viewing user:'
      presenceData.state = user?.textContent

      delete presenceData.smallImageKey
    }
    else if (document.location.pathname.includes('/private-messages')) {
      presenceData.details = 'Reading DMs'
      delete presenceData.state

      presenceData.smallImageKey = Assets.Reading
    }
    else if (document.location.pathname.includes('/account')) {
      presenceData.details = 'Viewing account settings'
      delete presenceData.state

      delete presenceData.smallImageKey
    }
    else if (document.location.pathname.includes('/all-games')) {
      presenceData.details = 'Viewing all games'
      delete presenceData.state

      delete presenceData.smallImageKey
    }
    else if (document.location.pathname.includes('/project/')) {
      presenceData.details = 'CurseForge - Projects'
      delete presenceData.state

      delete presenceData.smallImageKey
    }
  }
  else if (
    document.location.hostname === 'minecraft.curseforge.com'
    || document.location.hostname === 'authors.curseforge.com'
  ) {
    if (document.location.pathname.includes('/forums/')) {
      const title = document.querySelector('#content > section > div > header > h2')
      if (title) {
        presenceData.details = 'Forums, viewing category:'
        presenceData.state = title.textContent

        delete presenceData.smallImageKey
      }
      else if (
        document.querySelector('#content > section > div > div > header > h2')
      ) {
        const title = document.querySelector(
          '#content > section > div > div > header > h2',
        )!
        presenceData.details = 'Forums, reading thread:'
        if (title.textContent!.length > 128) {
          presenceData.state = `${title.textContent!.substring(
            0,
            125,
          )}...`
        }
        else {
          presenceData.state = title.textContent
        }

        presenceData.smallImageKey = Assets.Reading
      }
      else {
        presenceData.details = 'Forums, Browsing...'
        delete presenceData.state
        delete presenceData.smallImageKey
      }
    }
    else if (document.location.pathname.includes('/search')) {
      const search = document.querySelector<HTMLInputElement>('#field-search')
      if (search?.value && search.value.length > 1) {
        presenceData.details = 'Forums, Searching for:'
        presenceData.state = search.value
        presenceData.smallImageKey = Assets.Search
      }
      else {
        presenceData.details = 'Forums, Going to search'
        presenceData.state = 'something up'
        presenceData.smallImageKey = Assets.Search
      }
    }
    else if (document.location.pathname.includes('/account')) {
      presenceData.details = 'Forums, viewing:'
      presenceData.state = 'Account Settings'
      delete presenceData.smallImageKey
    }
    else if (document.location.pathname.includes('/knowledge-base')) {
      presenceData.details = 'Forums, viewing:'
      presenceData.state = 'Knowledge Base'
      delete presenceData.smallImageKey
    }
    else if (document.location.pathname.includes('/store')) {
      presenceData.details = 'Forums, viewing:'
      presenceData.state = 'Reward Store'
      delete presenceData.smallImageKey
    }
    else if (document.location.pathname.includes('/dashboard')) {
      presenceData.details = 'Forums, viewing:'
      presenceData.state = 'Dashboard'
      delete presenceData.smallImageKey
    }
    else if (document.location.pathname.includes('/paste')) {
      presenceData.details = 'Forums, viewing:'
      presenceData.state = 'Paste'
      delete presenceData.smallImageKey
    }
    else if (document.location.pathname.includes('/members')) {
      if (document.URL.includes('filter-user-sort=')) {
        const [title] = document.URL.split('filter-user-sort=')[1]?.split('&') ?? []
        switch (title) {
          case '1':
            presenceData.details = 'Forums, Viewing list of'
            presenceData.state = 'members in alphabetical order'

            delete presenceData.smallImageKey
            break
          case '2':
            presenceData.details = 'Forums, Viewing list of'
            presenceData.state = 'members with most messages'

            delete presenceData.smallImageKey
            break
          case '3':
            presenceData.details = 'Forums, Viewing list of'
            presenceData.state = 'members which are online'

            delete presenceData.smallImageKey
            break
          case '4':
            presenceData.details = 'Forums, Viewing the list'
            presenceData.state = 'members sorted by newest'

            delete presenceData.smallImageKey
            break
          case '5':
            presenceData.details = 'Forums, Viewing the list'
            presenceData.state = 'members sorted by oldest'

            delete presenceData.smallImageKey
            break
        }
      }
      else if (
        document.querySelector(
          '#content > section > section > div.p-user-info > ul.p-user-details > li.username',
        ) !== null
      ) {
        const user = document.querySelector(
          '#content > section > section > div.p-user-info > ul.p-user-details > li.username',
        )!
        presenceData.details = 'Forums, Viewing user:'
        presenceData.state = user.textContent

        delete presenceData.smallImageKey
      }
      else {
        presenceData.details = 'Forums, Viewing list of'
        presenceData.state = 'members which are online'

        delete presenceData.smallImageKey
      }
    }
    else {
      presenceData.details = 'Forums, Browsing...'
      delete presenceData.state

      delete presenceData.smallImageKey
    }
  }
  else if (
    document.querySelector(
      '#content > section > div.featured-site-info-container > div > h2',
    ) !== null
  ) {
    const title = document.querySelector(
      '#content > section > div.featured-site-info-container > div > h2',
    )!
    presenceData.details = 'Viewing game:'
    presenceData.state = title.textContent

    delete presenceData.smallImageKey
  }
  else {
    presence.setActivity()
  }
})

const presence = new Presence({
  clientId: '810082044284895253',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/FR-Minecraft/assets/logo.png',
  }
  const browsingTimestamp = Math.floor(Date.now() / 1000)
  const privacy = await presence.getSetting<boolean>('privacy')
  const button = await presence.getSetting<boolean>('button')

  presenceData.startTimestamp = browsingTimestamp
  if (privacy) {
    presenceData.details = 'Browsing'
  }
  else if (window.location.pathname.startsWith('/forum')) {
    presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/F/FR-Minecraft/assets/0.png'
    if (
      window.location.pathname.startsWith('/forum/forum-')
      || window.location.pathname.startsWith('/forum/topic-')
      || window.location.pathname.startsWith('/forum/viewforum.php')
      || window.location.pathname.startsWith('/forum/message-')
    ) {
      presenceData.details = 'Viewing a topic in the forum:'
      presenceData.state = document
        .querySelector('.crumbs')
        ?.textContent
        ?.replace('Accueil', '')
        .replace('»', '')
      if (button) {
        presenceData.buttons = [
          {
            label: 'View topic',
            url: document.URL,
          },
        ]
      }
    }
    else if (
      window.location.pathname.startsWith('/forum/index.php')
      || window.location.pathname === '/forum/'
    ) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Forum'
    }
    else if (window.location.pathname.startsWith('/forum/profile.php')) {
      presenceData.details = 'Viewing a user:'
      if (
        document.title
          .replace('Profil de', '')
          .replace(
            '/ Forum francais Minecraft. Serveur de jeu FR-Minecraft et astuces pour Minecraft.',
            '',
          ) === 'Principal / Profil '
      ) {
        presenceData.state = `${document
          .querySelector('.blockform > h2 > span')
          ?.textContent
          ?.replace(' - Principal', '')} (by the forum)`
      }
      else {
        presenceData.state = `${document.title
          .replace('Profil de', '')
          .replace(
            '/ Forum francais Minecraft. Serveur de jeu FR-Minecraft et astuces pour Minecraft.',
            '',
          )} (by the forum)`
      }
    }
    else if (window.location.pathname.startsWith('/forum/userlist.php')) {
      presenceData.details = 'Viewing a page:'
      presenceData.state = 'Userlist (Forum)'
    }
    else if (window.location.pathname.startsWith('/forum/search.php')) {
      presenceData.details = 'Searching something'
      presenceData.state = 'on the forum'
    }
    else if (window.location.pathname.startsWith('/forum/pmsnew.php')) {
      presenceData.details = 'Looking his DM'
      presenceData.state = 'on the forum'
    }
  }
  else if (window.location.pathname.includes('profil-')) {
    presenceData.details = 'Viewing a user:'
    presenceData.state = document
      .querySelector('.bloc-content > h1')
      ?.textContent
      ?.replace('Profil de ', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View user',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.length === 1) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Home'
  }
  else if (window.location.pathname.includes('news.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft News'
  }
  else if (window.location.pathname.includes('news-minecraft-')) {
    presenceData.details = 'Reading a minecraft news:'
    presenceData.state = document.title
      .replace('FR-Minecraft', '')
      .replace('.', '')
      .replace('Minecraft', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View news',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('differents-blocs-jeu.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Blocks'
  }
  else if (
    window.location.pathname.includes('outils-et-objets-dans-minecraft.php')
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Items'
  }
  else if (window.location.pathname.includes('item-')) {
    let type
    if (
      document
        .querySelector('#popup > h3')
        ?.textContent
        ?.includes('Minage du bloc')
    ) {
      presenceData.details = 'Viewing a minecraft block:'
      type = 'bloc'
    }
    else {
      presenceData.details = 'Viewing a minecraft item:'
      type = 'item'
    }
    presenceData.state = document.title.replace('Minecraft', '')
    if (button) {
      presenceData.buttons = [
        {
          label: `View ${type}`,
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes('aide-crafting-sur-minecraft.php')
  ) {
    // creatures-mobs-animaux-sur-minecraft.php
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Crafting'
  }
  else if (
    window.location.pathname.includes(
      'creatures-mobs-animaux-sur-minecraft.php',
    )
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Mobs'
  }
  else if (window.location.pathname.includes('mob-')) {
    presenceData.details = 'Viewing a minecraft mob:'
    presenceData.state = document.title.replace('Minecraft', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View mob',
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes('recettes-potions-minecraft.php')
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Potions'
  }
  else if (window.location.pathname.includes('potion-')) {
    presenceData.details = 'Viewing a minecraft potion:'
    presenceData.state = document.title.replace('Minecraft', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View potion',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('enchantements-minecraft.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Enchantements'
  }
  else if (window.location.pathname.includes('enchantement-')) {
    presenceData.details = 'Viewing a minecraft enchantement:'
    presenceData.state = document.title.replace('Minecraft Enchantement ', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View enchantement',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('biomes-minecraft.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Biomes'
  }
  else if (window.location.pathname.includes('biome-')) {
    presenceData.details = 'Viewing a minecraft biome:'
    presenceData.state = document.title.replace('Minecraft Biome', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View biome',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('advancements-minecraft.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Advancements'
  }
  else if (window.location.pathname.includes('advancement-')) {
    presenceData.details = 'Viewing a minecraft advancement:'
    presenceData.state = document.title.replace('Minecraft Progrès', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View advancement',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('effets-minecraft.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Potions Effects'
  }
  else if (window.location.pathname.includes('effet-')) {
    presenceData.details = 'Viewing a minecraft effect:'
    presenceData.state = document.title.replace('Minecraft Effet', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View effect',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('astuces.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Tips'
  }
  else if (window.location.pathname.includes('astuce-minecraft-')) {
    presenceData.details = 'Viewing a minecraft tip:'
    presenceData.state = document.title.replace('Minecraft', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View tip',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('seeds.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Seeds'
  }
  else if (window.location.pathname.includes('seed-minecraft-')) {
    presenceData.details = 'Viewing a minecraft seed:'
    presenceData.state = document.title.replace(
      'Minecraft Seed Minecraft :',
      '',
    )
    if (button) {
      presenceData.buttons = [
        {
          label: 'View seed',
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes('guide-des-commandes-minecraft.php')
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Commands'
  }
  else if (window.location.pathname.includes('commande-')) {
    presenceData.details = 'Viewing a minecraft command:'
    presenceData.state = document.title.replace('Minecraft Commande', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View command',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('tags-minecraft.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Minecraft Tags'
  }
  else if (window.location.pathname.includes('tag-')) {
    presenceData.details = 'Viewing a minecraft tag:'
    presenceData.state = document.title.replace('Minecraft Tag', '')
    if (button) {
      presenceData.buttons = [
        {
          label: 'View tag',
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes('skin-habillage-personnage-minecraft.php')
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Skin'
  }
  else if (window.location.pathname.includes('skin-minecraft-')) {
    presenceData.details = 'Viewing a skin:'
    presenceData.state = document.title.replace(
      'Minecraft Skin Minecraft :',
      '',
    )
    if (button) {
      presenceData.buttons = [
        {
          label: 'View skin',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('textures.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Ressource Packs'
  }
  else if (window.location.pathname.includes('texture-minecraft-')) {
    presenceData.details = 'Viewing a ressource pack:'
    presenceData.state = document.title.replace(
      'Minecraft Texture Minecraft :',
      '',
    )
    if (button) {
      presenceData.buttons = [
        {
          label: 'View ressource pack',
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes('telecharger-mods-minecraft.php')
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Mods'
  }
  else if (window.location.pathname.includes('mod-minecraft-')) {
    presenceData.details = 'Viewing a mod:'
    presenceData.state = document.title.replace(
      'Minecraft Mod Minecraft :',
      '',
    )
    if (button) {
      presenceData.buttons = [
        {
          label: 'View mod',
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes('telecharger-maps-minecraft.php')
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Maps'
  }
  else if (window.location.pathname.includes('map-minecraft-')) {
    presenceData.details = 'Viewing a map:'
    presenceData.state = document.title.replace(
      'Minecraft Map Minecraft :',
      '',
    )
    if (button) {
      presenceData.buttons = [
        {
          label: 'View map',
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes('telecharger-datapack-minecraft.php')
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Datapacks'
  }
  else if (window.location.pathname.includes('datapack-minecraft-')) {
    presenceData.details = 'Viewing a datapack:'
    presenceData.state = document.title.replace(
      'Minecraft Datapack Minecraft :',
      '',
    )
    if (button) {
      presenceData.buttons = [
        {
          label: 'View datapack',
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes('telecharger-structure-minecraft.php')
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Structures'
  }
  else if (window.location.pathname.includes('structure-minecraft-')) {
    presenceData.details = 'Viewing a structure:'
    presenceData.state = document.title.replace(
      'Minecraft Structure Minecraft :',
      '',
    )
    if (button) {
      presenceData.buttons = [
        {
          label: 'View structure',
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes('fonds-ecran-minecraft-gratuit.php')
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Wallpapers'
  }
  else if (window.location.pathname.includes('wallpaper-minecraft-')) {
    presenceData.details = 'Viewing a wallpaper'
    if (button) {
      presenceData.buttons = [
        {
          label: 'View wallpaper',
          url: document.URL,
        },
      ]
    }
  }
  else if (window.location.pathname.includes('videos-minecraft.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Videos'
  }
  else if (window.location.pathname.includes('video-minecraft-')) {
    presenceData.details = 'Viewing a video:'
    presenceData.state = document.title.replace(
      'Minecraft Vidéo Minecraft',
      '',
    )
    if (button) {
      presenceData.buttons = [
        {
          label: 'View video',
          url: document.URL,
        },
      ]
    }
  }
  else if (
    window.location.pathname.includes(
      'minecraft-papercraft-ou-creation-de-blocs-minecraft-en-papier.php',
    )
  ) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Papercraft'
  }
  else if (window.location.pathname.includes('codes-couleur-minecraft.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Color codes'
  }
  else if (window.location.pathname.includes('mojang-status.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'Mojang status'
  }
  else if (window.location.pathname.includes('launcher-fr-minecraft.php')) {
    presenceData.details = 'Viewing a page:'
    presenceData.state = 'FR-Minecraft launcher'
    if (button) {
      presenceData.buttons = [
        {
          label: 'View FRM Launcher',
          url: document.URL,
        },
      ]
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

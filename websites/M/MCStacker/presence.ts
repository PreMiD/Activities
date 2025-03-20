const presence = new Presence({
  clientId: '629413450774347786',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MCStacker/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  if (
    document.location.hostname === 'bimbimma.com'
    && document.URL.includes('/mcstacker/2014-08-31.php')
  ) {
    presenceData.details = 'MCStacker for 1.7.x'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'mcstacker.bimbimma.com'
    && document.URL.includes('/mcstacker1.10.php')
  ) {
    presenceData.details = 'MCStacker for 1.8.x - 1.10.x'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (
    document.location.hostname === 'mcstacker.bimbimma.com'
    || document.URL.includes('mcstacker.net/1.12.php')
  ) {
    presenceData.details = 'MCStacker for 1.12.x'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (document.URL.includes('mcstacker.net/1.13converter.php')) {
    presenceData.details = 'MCStacker Converter for 1.13.x'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (document.URL.includes('mcstacker.net/1.13.php')) {
    presenceData.details = 'MCStacker for 1.13.x'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (document.URL.includes('mcstacker.net/1.14.php')) {
    presenceData.details = 'MCStacker for 1.14.x'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (document.URL.includes('mcstacker.net/1.15.php')) {
    presenceData.details = 'MCStacker for 1.15.x'
    delete presenceData.state

    delete presenceData.smallImageKey

    presence.setActivity(presenceData)
  }
  else if (document.location.hostname === 'mcstacker.net') {
    if (document.querySelector('#lootTableContainer')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a loot table'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#lootPane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /loot command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#bossbarPane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /bossbar command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#scoreboardPane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /scoreboard command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#teamPane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /team command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#particlePane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /particle command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#soundPane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /playsound command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#replaceItemPane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /replaceitem command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#tellrawPane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /tellraw command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#blockPane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /block command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#rootEntity')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /entity command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#givePane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /give command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.querySelector('#effectPane')) {
      presenceData.details = 'MCStacker for latest'
      presenceData.state = 'Making a /effect command'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.URL.includes('/versions.php')) {
      presenceData.details = 'MCStacker viewing:'
      presenceData.state = 'Version page'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/npc/')) {
      presenceData.details = 'Using the'
      presenceData.state = 'NPC generator'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else if (document.location.pathname.includes('/murals/')) {
      presenceData.details = 'Using the'
      presenceData.state = 'Mural generator'

      delete presenceData.smallImageKey

      presence.setActivity(presenceData)
    }
    else {
      presence.setActivity()
    }
  }
  else {
    presence.setActivity()
  }
})

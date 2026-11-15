const presence = new Presence({
  clientId: '1399154076599717969',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const { pathname, hostname, search } = document.location

  try {
    const layerKeys = [
      'satellite',
      'radar',
      'wind',
      'gust',
      'rain',
      'rainAccu',
      'snowAccu',
      'snowcover',
      'thunder',
      'temp',
      'aqi',
      'clouds',
      'hclouds',
      'mclouds',
      'lclouds',
      'fog',
      'cape',
      'thermals',
      'freezing',
      'ozone',
      'so2',
      'ozoneLayer',
      'pm2p5',
      'aerosol',
      'dust',
      'waves',
      'swell1',
      'swell2',
      'swell3',
      'seaTemp',
      'currents',
      'tidal',
      'hurricanes',
      'windAccu',
      'pressure',
      'dewpoint',
      'rh',
      'wetbulb',
      'solar',
      'uvindex',
      'ptype',
      'cloudtop',
      'cloudbase',
      'visibility',
      'icing',
      'cat',
      'wwaves',
      'wavepower',
      'no2',
      'co',
      'drought',
      'fire',
      'cap',
      'efi',
      'hiking',
    ]

    const stringsToFetch: Record<string, string> = {
      community: 'windy.community',
      readingForum: 'windy.readingForum',
      readingTopic: 'windy.readingTopic',
      browsingCategory: 'windy.browsingCategory',
      settings: 'windy.settings',
      modifyingSettings: 'windy.modifyingSettings',
      mainMenu: 'windy.mainMenu',
      navigating: 'windy.navigating',
      weatherStation: 'windy.weatherStation',
      viewingStation: 'windy.viewingStation',
      localForecast: 'windy.localForecast',
      globalMap: 'windy.globalMap',
      exploring: 'windy.exploring',
      exploringHurricanes: 'windy.exploringHurricanes',
      stationFallback: 'windy.stationFallback',
      layer: 'windy.layer',
    }

    layerKeys.forEach((key) => {
      stringsToFetch[key] = `windy.layer_${key}`
    })

    const [showLayer, showStation, showMenu, showSettings, t] = await Promise.all([
      presence.getSetting<boolean>('showLayer').then(v => v ?? true),
      presence.getSetting<boolean>('showStation').then(v => v ?? true),
      presence.getSetting<boolean>('showMenu').then(v => v ?? false),
      presence.getSetting<boolean>('showSettings').then(v => v ?? true),
      presence.getStrings(stringsToFetch).catch(() => null),
    ])

    if (!t)
      return

    const presenceData: PresenceData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Windy/assets/logo.png',
      startTimestamp: browsingTimestamp,
    }

    if (hostname === 'community.windy.com') {
      const isTopic = pathname.includes('/topic/')
      const isCategory = pathname.includes('/category/')

      presenceData.details = isTopic ? t.readingTopic : (isCategory ? t.browsingCategory : t.community)
      presenceData.state = (isTopic || isCategory) ? (document.title.split('@')[0]?.trim() || t.readingForum) : t.readingForum
    }
    else if (pathname.includes('/settings')) {
      if (showSettings) {
        presenceData.details = t.settings
        presenceData.state = t.modifyingSettings
      }
      else {
        presenceData.details = t.exploring
      }
    }
    else if (pathname.includes('/menu')) {
      if (showMenu) {
        presenceData.details = t.mainMenu
        presenceData.state = t.navigating
      }
      else {
        presenceData.details = t.exploring
      }
    }
    else if (pathname.includes('/station/')) {
      if (showStation) {
        let stationName = document.querySelector('.station-title')?.textContent?.trim()
          || document.title.split('-')[0]?.trim()
          || t.stationFallback
          || ''
        stationName = stationName.replace(/\s*\([^)]*(?:estaci[oó]n|station|estação|wetterstation)[^)]*\)/gi, '')
        stationName = stationName.replace(/\s*\(undefined\)/gi, '')
        stationName = stationName.replace(/^Windy:\s*/i, '').trim()
        presenceData.details = stationName
        presenceData.state = t.weatherStation
      }
      else {
        presenceData.details = t.viewingStation
      }
    }
    else if (pathname.includes('/hurricanes/')) {
      const hurricaneName = pathname.split('/hurricanes/')[1]?.split('/')[0]?.replace(/[-_]/g, ' ').toUpperCase() || ''
      presenceData.details = t.exploringHurricanes
      presenceData.state = hurricaneName || undefined
    }
    else {
      // General map exploration
      const layerTokens = search.substring(1).split(/[:,]/)
      const activeLayerMatch = layerTokens.find(token => layerKeys.includes(token)) || ''
      const layerTranslated = activeLayerMatch ? (t as any)[activeLayerMatch] : undefined

      presenceData.details = pathname === '/' ? t.globalMap : t.exploring
      presenceData.state = (showLayer && layerTranslated) ? `${t.layer}: ${layerTranslated}` : undefined
    }

    presence.setActivity(presenceData)
  }
  catch {
    presence.clearActivity()
  }
})

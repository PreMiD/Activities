const presence = new Presence({
  clientId: '1399154076599717969',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const i18n = {
  1: {
    community: 'Comunidad',
    readingForum: 'Leyendo el foro',
    readingTopic: 'Viendo tema',
    browsingCategory: 'Viendo categoría',
    settings: 'Ajustes',
    modifyingSettings: 'Modificando configuración',
    mainMenu: 'Menú principal',
    navigating: 'Navegando',
    weatherStation: 'Estación',
    viewingStation: 'Mirando una estación',
    localForecast: 'Pronóstico local',
    globalMap: 'Mapa global',
    exploring: 'Explorando',
    exploringWindy: 'Explorando',
    coords: 'Coordenadas',
    exploringHurricanes: 'Viendo huracanes',
    stationFallback: 'Estación',
    exploringWebcam: 'Cámara web',
    viewingWebcam: 'Cámara web',
    webcamFallback: 'Cámara',
    layer: 'Capa',
    layers: {
      satellite: 'Satélite',
      radar: 'Radar del tiempo',
      wind: 'Viento',
      gust: 'Rachas de viento',
      rain: 'Lluvia, truenos',
      rainAccu: 'Acumulación de lluvia',
      snowAccu: 'Nieve nueva',
      snowcover: 'Profundidad de nieve',
      thunder: 'Tormentas eléctricas',
      temp: 'Temperatura',
      aqi: 'Calidad del aire',
      clouds: 'Nubes',
      hclouds: 'Nubes altas',
      mclouds: 'Nubes medias',
      lclouds: 'Nubes bajas',
      fog: 'Niebla',
      cape: 'Índice CAPE',
      thermals: 'Térmicas',
      freezing: 'Altitud de congelación',
      ozone: 'Capa de ozono',
      so2: 'SO2',
      ozoneLayer: 'Ozono superficial',
      pm2p5: 'PM2.5',
      aerosol: 'Aerosol',
      dust: 'Masa de polvo',
      waves: 'Olas',
      swell1: 'Oleaje',
      swell2: 'Oleaje 2',
      swell3: 'Oleaje 3',
      seaTemp: 'Temperatura del mar',
      currents: 'Corrientes marinas',
      tidal: 'Corrientes de marea',
      hurricanes: 'Seguimiento de huracanes',
      windAccu: 'Acumulación de viento',
      pressure: 'Presión',
      dewpoint: 'Punto de rocío',
      rh: 'Humedad',
      wetbulb: 'Temp. húmeda',
      solar: 'Energía solar',
      uvindex: 'Índice UV',
      ptype: 'Tipo de precipitación',
      cloudtop: 'Cima de la nube',
      cloudbase: 'Base de la nube',
      visibility: 'Visibilidad',
      icing: 'Escarcha',
      cat: 'Turbulencia de aire limpio',
      wwaves: 'Mar de viento',
      wavepower: 'Poder del oleaje',
      no2: 'NO2',
      co: 'Concentración de CO',
      drought: 'Vigilancia de sequía',
      fire: 'Peligro de incendio',
      cap: 'Avisos climatológicos',
      efi: 'Pronóstico extremo',
      hiking: 'Mapa de senderismo',
    },
  },
  0: {
    community: 'Community',
    readingForum: 'Reading the forum',
    readingTopic: 'Viewing topic',
    browsingCategory: 'Browsing category',
    settings: 'Settings',
    modifyingSettings: 'Modifying configuration',
    mainMenu: 'Main Menu',
    navigating: 'Navigating',
    weatherStation: 'Weather station',
    viewingStation: 'Viewing a station',
    localForecast: 'Local forecast',
    globalMap: 'Global map',
    exploring: 'Exploring',
    exploringWindy: 'Exploring',
    coords: 'Coordinates',
    exploringHurricanes: 'Viewing hurricanes',
    stationFallback: 'Station',
    exploringWebcam: 'Webcam',
    viewingWebcam: 'Webcam',
    webcamFallback: 'Webcam',
    layer: 'Layer',
    layers: {
      satellite: 'Satellite',
      radar: 'Weather radar',
      wind: 'Wind',
      gust: 'Wind gusts',
      rain: 'Rain, thunder',
      rainAccu: 'Rain accumulation',
      snowAccu: 'New snow',
      snowcover: 'Snow depth',
      thunder: 'Thunderstorms',
      temp: 'Temperature',
      aqi: 'Air quality index',
      clouds: 'Clouds',
      hclouds: 'High clouds',
      mclouds: 'Medium clouds',
      lclouds: 'Low clouds',
      fog: 'Fog',
      cape: 'CAPE index',
      thermals: 'Thermals',
      freezing: 'Freezing altitude',
      ozone: 'Ozone layer',
      so2: 'SO2',
      ozoneLayer: 'Surface ozone',
      pm2p5: 'PM2.5',
      aerosol: 'Aerosol',
      dust: 'Dust mass',
      waves: 'Waves',
      swell1: 'Swell',
      swell2: 'Swell 2',
      swell3: 'Swell 3',
      seaTemp: 'Sea temperature',
      currents: 'Sea currents',
      tidal: 'Tidal currents',
      hurricanes: 'Hurricane tracker',
      windAccu: 'Wind accumulation',
      pressure: 'Pressure',
      dewpoint: 'Dew point',
      rh: 'Humidity',
      wetbulb: 'Wet-bulb temp',
      solar: 'Solar power',
      uvindex: 'UV index',
      ptype: 'Precip type',
      cloudtop: 'Cloud top',
      cloudbase: 'Cloud base',
      visibility: 'Visibility',
      icing: 'Icing',
      cat: 'Clear air turbulence',
      wwaves: 'Wind waves',
      wavepower: 'Wave power',
      no2: 'NO2',
      co: 'CO concentration',
      drought: 'Drought monitor',
      fire: 'Fire danger',
      cap: 'Weather warnings',
      efi: 'Extreme forecast',
      hiking: 'Hiking map',
    },
  },
  2: {
    community: 'Comunidade',
    readingForum: 'Lendo o fórum',
    readingTopic: 'Lendo tópico',
    browsingCategory: 'Navegando categoria',
    settings: 'Configurações',
    modifyingSettings: 'Modificando configurações',
    mainMenu: 'Menu Principal',
    navigating: 'Navegando',
    weatherStation: 'Estação',
    viewingStation: 'Vendo uma estação',
    localForecast: 'Previsão local',
    globalMap: 'Mapa global',
    exploring: 'Explorando',
    exploringWindy: 'Explorando',
    coords: 'Coordenadas',
    exploringHurricanes: 'Vendo furacões',
    stationFallback: 'Estação',
    exploringWebcam: 'Webcam',
    viewingWebcam: 'Webcam',
    webcamFallback: 'Webcam',
    layer: 'Camada',
    layers: {
      satellite: 'Satélite',
      radar: 'Radar meteorológico',
      wind: 'Vento',
      gust: 'Rajadas de vento',
      rain: 'Chuva, trovoadas',
      rainAccu: 'Acumulação de chuva',
      snowAccu: 'Neve nova',
      snowcover: 'Profundidade da neve',
      thunder: 'Trovoadas',
      temp: 'Temperatura',
      aqi: 'Qualidade do ar',
      clouds: 'Nuvens',
      hclouds: 'Nuvens altas',
      mclouds: 'Nuvens médias',
      lclouds: 'Nuvens baixas',
      fog: 'Nevoeiro',
      cape: 'Índice CAPE',
      thermals: 'Térmicas',
      freezing: 'Nível de congelamento',
      ozone: 'Camada de ozônio',
      so2: 'SO2',
      ozoneLayer: 'Ozônio superficial',
      pm2p5: 'PM2.5',
      aerosol: 'Aerossol',
      dust: 'Massa de poeira',
      waves: 'Ondul.',
      swell1: 'Ondulação',
      swell2: 'Ondulação 2',
      swell3: 'Ondulação 3',
      seaTemp: 'Temperatura do mar',
      currents: 'Correntes marítimas',
      tidal: 'Correntes de maré',
      hurricanes: 'Rastreador de furacões',
      windAccu: 'Acumulação de vento',
      pressure: 'Pressão',
      dewpoint: 'Ponto de orvalho',
      rh: 'Umidade',
      wetbulb: 'Temp. de bulbo úmido',
      solar: 'Energia solar',
      uvindex: 'Índice UV',
      ptype: 'Tipo precipitação',
      cloudtop: 'Topo da nuvem',
      cloudbase: 'Base da nuvem',
      visibility: 'Visibilidade',
      icing: 'Gelo',
      cat: 'Turbulência',
      wwaves: 'Mar de vento',
      wavepower: 'Poder das ondas',
      no2: 'NO2',
      co: 'Concentração de CO',
      drought: 'Monitor de secas',
      fire: 'Perigo de incêndio',
      cap: 'Avisos meteorológicos',
      efi: 'Previsão extrema',
      hiking: 'Mapa de trilhas',
    },
  },
  3: {
    community: 'Communauté',
    readingForum: 'Lecture du forum',
    readingTopic: 'Lecture du sujet',
    browsingCategory: 'Navigation catégorie',
    settings: 'Paramètres',
    modifyingSettings: 'Modification des paramètres',
    mainMenu: 'Menu Principal',
    navigating: 'Navigation',
    weatherStation: 'Station',
    viewingStation: 'Visualisation d\'une station',
    localForecast: 'Prévisions locales',
    globalMap: 'Carte globale',
    exploring: 'Exploration',
    exploringWindy: 'Exploration',
    coords: 'Coordonnées',
    exploringHurricanes: 'Voir les ouragans',
    stationFallback: 'Station',
    exploringWebcam: 'Webcam',
    viewingWebcam: 'Webcam',
    webcamFallback: 'Webcam',
    layer: 'Couche',
    layers: {
      satellite: 'Satellite',
      radar: 'Radar météo',
      wind: 'Vent',
      gust: 'Rafales de vent',
      rain: 'Pluie, orages',
      rainAccu: 'Accumulation de pluie',
      snowAccu: 'Nouvelle neige',
      snowcover: 'Profondeur de neige',
      thunder: 'Orages',
      temp: 'Température',
      aqi: 'Qualité de l\'air',
      clouds: 'Nuages',
      hclouds: 'Nuages hauts',
      mclouds: 'Nuages moyens',
      lclouds: 'Nuages bas',
      fog: 'Brouillard',
      cape: 'Indice CAPE',
      thermals: 'Thermiques',
      freezing: 'Isotherme 0°C',
      ozone: 'Couche d\'ozone',
      so2: 'SO2',
      ozoneLayer: 'Ozone de surface',
      pm2p5: 'PM2.5',
      aerosol: 'Aérosols',
      dust: 'Masse de poussière',
      waves: 'Vagues',
      swell1: 'Houle',
      swell2: 'Houle 2',
      swell3: 'Houle 3',
      seaTemp: 'Température de la mer',
      currents: 'Courants marins',
      tidal: 'Courants de marée',
      hurricanes: 'Suivi des ouragans',
      windAccu: 'Accumulation vent',
      pressure: 'Pression',
      dewpoint: 'Point de rosée',
      rh: 'Humidité',
      wetbulb: 'Temp. humide',
      solar: 'Énergie solaire',
      uvindex: 'Indice UV',
      ptype: 'Type de précip.',
      cloudtop: 'Sommet des nuages',
      cloudbase: 'Base des nuages',
      visibility: 'Visibilité',
      icing: 'Givrage',
      cat: 'Turbulence',
      wwaves: 'Mer du vent',
      wavepower: 'Énergie des vagues',
      no2: 'NO2',
      co: 'Concentration de CO',
      drought: 'Surveillance sécheresse',
      fire: 'Risque d\'incendie',
      cap: 'Alertes météo',
      efi: 'Prévisions extrêmes',
      hiking: 'Carte de randonnée',
    },
  },
  4: { // German
    community: 'Gemeinschaft',
    readingForum: 'Forum lesen',
    readingTopic: 'Thema lesen',
    browsingCategory: 'Kategorie durchsuchen',
    settings: 'Einstellungen',
    modifyingSettings: 'Einstellungen ändern',
    mainMenu: 'Hauptmenü',
    navigating: 'Navigieren',
    weatherStation: 'Wetterstation',
    viewingStation: 'Eine Station ansehen',
    localForecast: 'Lokale Vorhersage',
    globalMap: 'Globale Karte',
    exploring: 'Erkunden',
    exploringWindy: 'Erkunden',
    coords: 'Koordinaten',
    exploringHurricanes: 'Hurrikane ansehen',
    stationFallback: 'Station',
    exploringWebcam: 'Webcam',
    viewingWebcam: 'Webcam',
    webcamFallback: 'Webcam',
    layer: 'Ebene',
    layers: {
      satellite: 'Satellit',
      radar: 'Wetterradar',
      wind: 'Wind',
      gust: 'Windböen',
      rain: 'Regen, Gewitter',
      rainAccu: 'Regenakkumulation',
      snowAccu: 'Neuschnee',
      snowcover: 'Schneehöhe',
      thunder: 'Gewitter',
      temp: 'Temperatur',
      aqi: 'Luftqualität',
      clouds: 'Wolken',
      hclouds: 'Hohe Wolken',
      mclouds: 'Mittlere Wolken',
      lclouds: 'Tiefe Wolken',
      fog: 'Nebel',
      cape: 'CAPE-Index',
      thermals: 'Aufwinde',
      freezing: 'Nullgradgrenze',
      ozone: 'Ozonschicht',
      so2: 'SO2',
      ozoneLayer: 'Bodennahes Ozon',
      pm2p5: 'PM2.5',
      aerosol: 'Aerosol',
      dust: 'Staubmasse',
      waves: 'Wellen',
      swell1: 'Dünung',
      swell2: 'Dünung 2',
      swell3: 'Dünung 3',
      seaTemp: 'Meerestemperatur',
      currents: 'Meeresströmungen',
      tidal: 'Gezeitenströmungen',
      hurricanes: 'Hurrikan-Tracker',
      windAccu: 'Windakkumulation',
      pressure: 'Druck',
      dewpoint: 'Taupunkt',
      rh: 'Luftfeuchtigkeit',
      wetbulb: 'Feuchtkugeltemperatur',
      solar: 'Solarenergie',
      uvindex: 'UV-Index',
      ptype: 'Niederschlagsart',
      cloudtop: 'Wolkenobergrenze',
      cloudbase: 'Wolkenuntergrenze',
      visibility: 'Sichtweite',
      icing: 'Vereisung',
      cat: 'Turbulenz',
      wwaves: 'Windsee',
      wavepower: 'Wellenenergie',
      no2: 'NO2',
      co: 'CO-Konzentration',
      drought: 'Dürremonitor',
      fire: 'Brandgefahr',
      cap: 'Wetterwarnungen',
      efi: 'Extremvorhersagen',
      hiking: 'Wanderkarte',
    },
  },
}

presence.on('UpdateData', async () => {
  const { pathname, hostname, search } = document.location

  const langId = await presence.getSetting<number>('lang') ?? 0
  const showLayer = await presence.getSetting<boolean>('showLayer') ?? true
  const showStation = await presence.getSetting<boolean>('showStation') ?? true
  const showMenu = await presence.getSetting<boolean>('showMenu') ?? false
  const showSettings = await presence.getSetting<boolean>('showSettings') ?? true

  const t = i18n[langId as keyof typeof i18n] || i18n[0]

  const presenceData: PresenceData = {
    largeImageKey: 'https://i.imgur.com/DYIEgcX.png',
    startTimestamp: browsingTimestamp,
  }

  try {
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
      } else {
        presenceData.details = t.exploringWindy
      }
    }
    else if (pathname.includes('/menu')) {
      if (showMenu) {
        presenceData.details = t.mainMenu
        presenceData.state = t.navigating
      } else {
        presenceData.details = t.exploringWindy
      }
    }
    else if (pathname.includes('/station/')) {
      if (showStation) {
        let stationName = document.querySelector('.station-title')?.textContent?.trim()
          || document.title.split('-')[0]?.trim()
          || t.stationFallback
        stationName = stationName.replace(/\s*\([^)]*(estaci[oó]n|station|estação|wetterstation)[^)]*\)/gi, '')
        stationName = stationName.replace(/\s*\(undefined\)/gi, '')
        stationName = stationName.replace(/^Windy:\s*/i, '').trim()
        presenceData.details = stationName
        presenceData.state = t.weatherStation
      }
      else {
        presenceData.details = t.viewingStation
      }
    }
    else if (pathname.includes('/webcams/')) {
      presenceData.details = t.exploringWebcam

      let webcamName = document.querySelector('.webcam-header .title')?.textContent
        || document.querySelector('.wcm-detail .title')?.textContent
        || document.querySelector('h2')?.textContent
        || ''

      let titleName = document.title.split('-')[0]?.trim() || ''
      if (titleName.toLowerCase().includes('windy') || titleName.toLowerCase().includes('pronóstico')) {
        titleName = ''
      }

      webcamName = webcamName.trim() || titleName || t.webcamFallback
      presenceData.state = webcamName.replace(/Cámaras web:/i, '').replace(/Webcams:/i, '').replace(/\s*\(undefined\)/gi, '').trim()
    }
    else if (pathname.includes('/hurricanes/')) {
      const hurricaneName = pathname.split('/hurricanes/')[1]?.split('/')[0]?.replace(/[-_]/g, ' ').toUpperCase() || ''
      presenceData.details = t.exploringHurricanes
      presenceData.state = hurricaneName
    }
    else {
      const activeLayerMatch: string = search ? (search.substring(1).split(',')[0] || '') : ''
      const layersMap: Record<string, string> = t.layers as any
      const layerTranslated = activeLayerMatch ? layersMap[activeLayerMatch] : undefined

      presenceData.details = pathname === '/' ? t.globalMap : t.exploringWindy
      presenceData.state = (showLayer && layerTranslated) ? `${t.layer}: ${layerTranslated}` : undefined
    }

    presence.setActivity(presenceData)
  }
  catch (error) {
    presence.clearActivity()
  }
})

import type { EventContext, GameEngine, GameLayer, GameStatus, GameVideo, WebpackRuntime } from './game.types.js'

export function readGameStatus(route: string, isIdolPage = false): GameStatus | null {
  const albumId = /^\/idolAlbum\/([^/]+)\/?$/.exec(route)?.[1]
  const eventContextKey = Symbol.for('PreMiD.shinycolors.eventContext')
  let eventContext = Reflect.get(window, eventContextKey) as EventContext | undefined
  if (eventContext && eventContext.route !== route) {
    Reflect.deleteProperty(window, eventContextKey)
    eventContext = undefined
  }

  const cacheKey = Symbol.for('PreMiD.shinycolors.engine')
  let engine = Reflect.get(window, cacheKey) as GameEngine | undefined

  if (!engine) {
    const candidates = Object.values(Object.getOwnPropertyDescriptors(window))
      .map(({ value }) => value as unknown)
      .filter((value): value is unknown[] => Array.isArray(value) && value.push !== Array.prototype.push)
      .filter(chunks => chunks.some((chunk) => {
        if (!Array.isArray(chunk) || !chunk[1] || typeof chunk[1] !== 'object')
          return false

        return Object.values(chunk[1]).some((factory) => {
          if (typeof factory !== 'function')
            return false

          const source = Function.prototype.toString.call(factory)
          return source.includes('.sceneManager')
        })
      }))

    const chunks = candidates[0]
    if (candidates.length !== 1 || !chunks)
      return null

    const captured: { runtime?: WebpackRuntime } = {}
    const probe = [
      [`premid-status-${crypto.randomUUID()}`],
      {},
      (runtime: WebpackRuntime) => { captured.runtime = runtime },
    ]

    try {
      chunks.push(probe)
    }
    finally {
      if (chunks.at(-1) === probe)
        chunks.pop()
    }

    const runtime = captured.runtime
    if (!runtime)
      return null

    const modules = Object.entries(runtime.m).filter(([, factory]) => {
      if (typeof factory !== 'function')
        return false

      const source = Function.prototype.toString.call(factory)
      return source.length < 200 && source.includes('window.ezg')
    })
    const moduleId = modules[0]?.[0]
    if (modules.length !== 1 || !moduleId)
      return null

    engine = runtime(moduleId)
    if (!engine?.sceneManager)
      return null

    Object.defineProperty(window, cacheKey, { value: engine, configurable: true })
  }

  const scenes = engine.sceneManager.getScenes().reverse()
  const isProducing = route === '/produce'
    || scenes.some(scene => scene?._store?.userProduce || scene?._params?.userProduce
      || scene?._pokerProduceStore || scene?._endingLayer)
  const readHeader = (root: GameLayer, includeDialogs = false): string | null => {
    const nodes = [root]
    while (nodes.length) {
      const node = nodes.pop()
      if (!node || node.visible === false || node.renderable === false)
        continue

      const title = node._header?.visible === false ? null : node._header?.text?.text
      if (typeof title === 'string' && title.trim())
        return title.trim()

      const dialogTitle = includeDialogs && node._buttonMap
        ? node._base?.children?.find(child => typeof child.text === 'string' && child.text.trim())?.text
        : null
      if (typeof dialogTitle === 'string')
        return dialogTitle.trim()

      if (node.children)
        nodes.push(...node.children)
    }
    return null
  }
  const eventNamesKey = Symbol.for('PreMiD.shinycolors.eventNames')
  let eventNames = Reflect.get(window, eventNamesKey) as { id: string, name: string }[] | undefined
  for (const scene of scenes) {
    const events = scene?._myPage?.gameEvent
    if (!Array.isArray(events))
      continue

    eventNames = events.flatMap((event) => {
      if (typeof event?.id !== 'string' || !event.id
        || typeof event.name !== 'string' || !event.name.trim()) {
        return []
      }
      return [{ id: event.id, name: event.name.trim().replace(/\s+/g, ' ') }]
    })
    Object.defineProperty(window, eventNamesKey, { value: eventNames, configurable: true })
    break
  }

  for (const scene of scenes) {
    const album = scene?._albumStore?._album
    const sources = [
      {
        category: 'game_event_communications',
        parentId: 'gameEventId' as const,
        lists: [
          { ...scene?._params?.gameEvent, communications: scene?._params?.releasedCommunications },
          ...(Array.isArray(album?.gameEvents) ? album.gameEvents : []),
          ...(Array.isArray(album?.collaborationGameEvents) ? album.collaborationGameEvents : []),
        ],
      },
      {
        category: 'special_communications',
        parentId: 'specialCommunicationListId' as const,
        lists: Array.isArray(album?.specialEvents) ? album.specialEvents : [],
      },
    ]
    const events = sources.flatMap(({ category, parentId, lists }) => lists.flatMap((event) => {
      if (typeof event?.id !== 'string' || typeof event.name !== 'string' || !event.name.trim()
        || !Array.isArray(event.communications)) {
        return []
      }

      const episodes = event.communications.flatMap((communication) => {
        if (communication?.[parentId] !== event.id
          || typeof communication.id !== 'string'
          || typeof communication.name !== 'string' || !communication.name.trim()
          || typeof communication.title !== 'string' || !communication.title.trim()) {
          return []
        }
        return [{
          id: communication.id,
          chapter: communication.name.trim(),
          title: communication.title.trim(),
        }]
      })
      return [{
        category,
        event: event.name.trim().replace(/\s+/g, ' '),
        episodes,
      }]
    }))
    if (!events.length)
      continue

    eventContext = { route, events }
    Object.defineProperty(window, eventContextKey, { value: eventContext, configurable: true })
    break
  }

  const playback = scenes[0]?._params
  const detailScene = scenes[0]
  const detailTitle = detailScene?._idolDetail ? readHeader(detailScene) : null
  const cardName = detailScene?._userIdol?.name ?? detailScene?._userSupportIdol?.name
  if (detailTitle && typeof cardName === 'string' && cardName.trim())
    return { page: detailTitle, state: cardName.trim() }

  if (route.startsWith('/283Stage')) {
    for (const scene of scenes) {
      const communication = scene?._prologueCommunications?.find(communication => communication.id === playback?.id
        && communication.category === playback?.category)
      if (!isProducing && typeof communication?.name === 'string' && communication.name.trim()
        && typeof communication.title === 'string' && communication.title.trim()) {
        return { stagePage: { section: `${communication.name.trim()} ／ ${communication.title.trim()}` } }
      }
    }

    if (!isProducing && playback?.category === 'produce_events')
      return { stagePage: { section: 'コミュ' } }

    const ready = scenes.find(scene => scene?._pokerProduceDeckStore)
    const mode = ready?._mainLayer?._areaSelectLayer?.visible === false
      ? ready._pokerProduceDeckStore?._pokerProduce?.name
      : undefined
    const section = scenes.map(scene => readHeader(scene, true)).find(Boolean) ?? undefined
    return { stagePage: { mode: typeof mode === 'string' && mode.trim() ? mode.trim() : undefined, section } }
  }

  const characterAlbum = playback?.characterAlbum
    ?? scenes.find(scene => scene?._params?.characterAlbum)?._params?.characterAlbum
  const homeCommunication = playback?.category === 'mypage_communications'
    ? playback.userMypageCommunication?.mypageCommunication
    : undefined
  const playbackId = homeCommunication?.id ?? playback?.id
  const isReplay = playback?.isReleasedCommunication === true || homeCommunication?.isHomeIdolCommu === true
  if (!isProducing && playback && isReplay && characterAlbum
    && typeof playbackId === 'string' && playbackId
    && typeof playback.category === 'string' && playback.category
    && (!albumId || characterAlbum.id === albumId)
    && typeof characterAlbum.name === 'string' && characterAlbum.name.trim()) {
    const communication = characterAlbum.communications?.find(communication => communication.id === playbackId
      && (homeCommunication
        ? communication.isHomeIdolCommu === true && communication.characterId === characterAlbum.id
        : communication.eventCategory?.dataPath === playback.category))
    if (typeof communication?.title === 'string' && communication.title.trim()) {
      const group = characterAlbum.albumCommunicationTitles?.find(group => group.albumType === communication.albumType)?.title
      return {
        communication: {
          name: typeof group === 'string' && group.trim()
            ? `${characterAlbum.name.trim()} ／ ${group.trim()}`
            : characterAlbum.name.trim(),
          title: communication.title.trim(),
        },
      }
    }
  }

  const plate = playback?.plateParams
  if (!isProducing && isReplay && playback?.category === 'produce_events'
    && (!albumId || characterAlbum?.id === albumId)
    && typeof plate?.idolIconImagePath === 'string' && plate.idolIconImagePath
    && typeof plate.title === 'string' && plate.title.trim()
    && typeof plate.eventCategoryName === 'string' && plate.eventCategoryName.trim()) {
    const card = [
      ...scenes.flatMap(scene => [scene._userIdol, scene._userSupportIdol]),
      ...(characterAlbum?.produceIdols ?? []),
      ...(characterAlbum?.supportIdols ?? []),
    ].find(card => card?.getIconImagePath?.() === plate.idolIconImagePath)
    if (typeof card?.name === 'string' && card.name.trim()) {
      return {
        communication: {
          name: card.name.trim(),
          title: `${plate.eventCategoryName.trim()} ／ ${plate.title.trim()}`,
        },
      }
    }
  }

  if (!isProducing && playback && eventContext) {
    for (const event of eventContext.events.filter(event => event.category === playback.category)) {
      const episode = event.episodes.find(episode => episode.id === playback.id)
      if (episode) {
        return {
          event: event.event,
          episode: { chapter: episode.chapter, title: episode.title },
        }
      }
    }
  }

  const isCommunicationPlayer = typeof scenes[0]?._isEventShown === 'boolean' || !!homeCommunication
  if (!isProducing && isCommunicationPlayer
    && typeof playbackId === 'string' && playbackId
    && typeof playback?.category === 'string' && playback.category) {
    const title = plate?.title ?? homeCommunication?.title
    const category = plate?.eventCategoryName
    return {
      communication: {
        name: 'コミュ',
        title: typeof title === 'string' && title.trim()
          ? [typeof category === 'string' ? category.trim() : '', title.trim()].filter(Boolean).join(' ／ ')
          : undefined,
      },
    }
  }

  if (route === '/characterProfile') {
    const character = scenes.find(scene => scene?._mainLayer?._selectedCharacter)?._mainLayer?._selectedCharacter?.name
    if (typeof character === 'string' && character.trim())
      return { miniGame: { route, section: character.trim() } }
  }

  if (route === '/miniGamePortal') {
    const ready = scenes.find(scene => Array.isArray(scene?._params?.daifugoCourses)
      && scene.visible !== false && scene.renderable !== false)
    if (ready)
      return { miniGame: { route: '/daifugo', section: readHeader(scenes[0] ?? ready, true) ?? 'コース選択' } }
  }

  if (route === '/daifugo') {
    const game = scenes.find(scene => scene?._gameService?.daifugoCourse)
    if (game) {
      const course = game._gameService?.daifugoCourse?.name
      const result = game.children?.some(child => child.visible !== false && child.renderable !== false
        && child._content1 && child._content2)
      const menu = game._menuPopup
      let phase = readHeader(scenes[0] ?? game, true) ?? '対戦'
      if (result)
        phase = 'リザルト'
      else if (menu && menu.visible !== false && menu.renderable !== false)
        phase = '一時停止'
      return {
        miniGame: {
          route,
          section: [typeof course === 'string' ? course.trim() : '', phase].filter(Boolean).join(' ／ '),
        },
      }
    }
  }

  if ((route === '/fesTop' || route === '/fesReady') && scenes.some(scene => scene?._fesDeckLayer))
    return { fesUnit: true }

  if (albumId) {
    for (const scene of scenes) {
      const album = scene?._params?.characterAlbum
      if (album?.id === albumId && typeof album.name === 'string' && album.name.trim())
        return { album: album.name }
    }
    return null
  }

  for (const scene of route === '/produceReady' ? scenes : []) {
    const deck = scene?._mainLayer?._deckEditLayer
    const mode = scene?._store?._selectProduceArea?.produce?.title
    const stage = deck?._commonPartsLayer?._header?.text?.text
    if (deck?._areaSelectLayer?.visible !== false
      || ![deck._deckEditDetailLayer, deck._knowHowBookLayer, deck._itemPreparationLayer].some(layer => layer?.visible === true)
      || typeof mode !== 'string' || !mode.trim()
      || typeof stage !== 'string' || !stage.trim()) {
      continue
    }

    let frontTitle: string | null = null
    for (const front of scenes) {
      frontTitle = readHeader(front)
      if (frontTitle || front === scene)
        break
    }
    return {
      preparation: {
        mode: mode.trim().replace(/編$/, ''),
        stage: frontTitle && frontTitle !== stage.trim() ? `${stage.trim()} - ${frontTitle}` : stage.trim(),
      },
    }
  }

  const produceStages: Record<string, Record<string, string>> = {
    'wing': { semi_final: 'W.I.N.G.準決勝', final: 'W.I.N.G.決勝' },
    'fan_meeting': { rehearsal: 'リハーサル', public_performance: '本番' },
    '3rd_produce_area': { grad_first: '一次審査', grad_second: '二次審査', grad_final: '最終審査' },
    '4th_produce_area': { '4th_concert': 'ライブ' },
    '5th_produce_area': { '5th_entry': 'エントリー', '5th_exhibition': 'エキシビション' },
  }
  const getProduceStage = (mode: string, category: unknown) => typeof category === 'string'
    ? produceStages[mode]?.[category]
    : undefined

  let hasProduceScene = false
  for (const scene of route === '/produce' ? scenes : []) {
    if (scene?._myPage)
      return hasProduceScene ? null : { home: true }

    if (scene?._produceType || scene?._endingLayer)
      hasProduceScene = true

    const concertStage = getProduceStage('wing', scene?._concertCategory)
    if (scene?._produceType === 'wing' && concertStage) {
      const idol = scene.children?.find(layer => layer._concertService)?._concertService?._store?.centerIdol?.fullName
      if (typeof idol === 'string' && idol.trim())
        return { idol, scenario: 'W.I.N.G.編', stage: concertStage }
    }

    for (const layer of [scene, ...(scene?._frontLayer?.children ?? [])]) {
      const result = layer?._params
      const produce = result?.userProduce?.produce
      if (result?.userProduce)
        hasProduceScene = true

      const idol = result?.userProduceIdol?.fullName ?? result?.produceIdol?.fullName ?? layer?._produceIdol?.fullName
      const scenario = produce?.title

      if (typeof produce?.produceType !== 'string' || !produce.produceType.trim()
        || typeof idol !== 'string' || !idol.trim()
        || typeof scenario !== 'string' || !scenario.trim()) {
        continue
      }

      if (layer === scene && scene?._endingLayer)
        return { idol, scenario, stage: 'プロデュースリザルト' }

      if (produce.produceType !== 'wing')
        continue

      const concert = result?.userProduce?.produceConcert
      const comment = concert?.id == null
        ? undefined
        : result?.produceStaffConcertComments?.find(comment => comment.concertId === concert.id)
      const category = result?.concertType ?? concert?.category
      const outcome = result?.result ?? comment?.result
      const concertStage = getProduceStage('wing', category)
      if (!concertStage || (outcome !== 'win' && outcome !== 'lose'))
        continue

      const stage = outcome === 'lose'
        ? `${concertStage}敗退`
        : category === 'final' ? 'W.I.N.G.優勝' : 'W.I.N.G.決勝進出'
      return { idol, scenario, stage }
    }

    const store = scene?._store
    const produce = store?.userProduce?.produce
    if (store?.userProduce)
      hasProduceScene = true

    const idol = store?.userProduceIdol?.fullName
    const scenario = produce?.title
    const season = store?.displayingSeasonNum ?? store?.seasonNum
    const remainingWeeks = store?.remainSeasonWeek

    if (typeof produce?.produceType !== 'string' || !produce.produceType.trim()
      || typeof idol !== 'string' || !idol.trim()
      || typeof scenario !== 'string' || !scenario.trim()
      || typeof season !== 'number' || !Number.isInteger(season) || season < 1
      || typeof remainingWeeks !== 'number' || !Number.isInteger(remainingWeeks) || remainingWeeks < 0) {
      continue
    }

    const stage = getProduceStage(produce.produceType, store?.weekType)
      ?? `シーズン${season}・残り${remainingWeeks}週`
    return { idol, scenario, stage }
  }

  for (const scene of scenes) {
    const musicList = scene?._main?._musicList
    const song = musicList?._activeConcertBgm
    const title = readHeader(scene, isIdolPage)
    if (route === '/profile' && scene === scenes[0] && scenes.some(scene => scene?._profileParams)) {
      const idolSelect = scene._idolSelectLayer
      if (scene._profileParams && scene.visible !== false && scene.renderable !== false
        && idolSelect?.visible === true && idolSelect.renderable !== false) {
        return { profilePage: 'お気に入りアイドル変更' }
      }
      if (!scene._profileParams && title)
        return { profilePage: title }
    }

    if (musicList?._isTrialListening === true && title) {
      const songTitle = typeof song?.songTitle === 'string' ? song.songTitle.trim() : ''
      const artist = typeof song?.artist === 'string' ? song.artist.trim() : ''
      const mvPaths = [song?.getMvBgmPath?.(), song?.getFullMvBgmPath?.()]
      const nodes: GameLayer[] = [scene]
      let video: GameVideo | undefined
      while (nodes.length) {
        const node = nodes.pop()
        if (!node || node.visible === false || node.renderable === false)
          continue
        if (typeof node._bgmPath === 'string' && mvPaths.includes(node._bgmPath)
          && node.texture?.baseTexture?.source) {
          video = node.texture.baseTexture.source
          break
        }
        if (node.children)
          nodes.push(...node.children)
      }
      const sound = engine.soundManager?.bgm
      let position = video ? video.currentTime : sound?.currentTime
      const duration = video ? video.duration : sound?.duration
      const loopStart = sound?.loopStart
      const loopEnd = sound?.loopEnd
      const isSong = typeof sound?.name === 'string'
        && sound.name === song?.getBgmPath?.()
      if (!video && sound?.loop && typeof position === 'number'
        && typeof loopStart === 'number' && typeof loopEnd === 'number'
        && Number.isFinite(loopStart) && Number.isFinite(loopEnd)
        && loopStart >= 0 && loopEnd > loopStart && position >= loopEnd) {
        position = loopStart + (position - loopEnd) % (loopEnd - loopStart)
      }
      const playback = (video ? !video.ended : isSong && !sound?.ended)
        && typeof position === 'number' && Number.isFinite(position) && position >= 0
        && typeof duration === 'number' && Number.isFinite(duration) && duration > 0 && position < duration
        ? { type: video ? 'video' as const : 'audio' as const, position, duration, paused: video ? video.paused === true : sound?._paused === true }
        : undefined
      return { page: video ? `${title} ／ MV` : title, state: songTitle ? [songTitle, artist].filter(Boolean).join(' ／ ') : undefined, playback }
    }

    if (scene?._myPage) {
      Reflect.deleteProperty(window, eventContextKey)
      return { home: true }
    }

    if (title) {
      const slotIdolId = scene._store?._selectedSlotParam?.idolId
      const slotIdol = isIdolPage && typeof slotIdolId === 'string'
        ? scene._store?.getUserProduceExSkillIdolByIdolId?.(slotIdolId)
        : undefined
      const idolName = isIdolPage
        ? scene._userIdol?.name ?? scene._userSupportIdol?.name ?? scene._userFesIdol?.idol?.name
        ?? scene._targetIdol?.idol?.name ?? scene._store?.detailUserIdol?.name ?? scene._store?.activeUserIdol?.name
        ?? scene._awakeIdolSelectLayer?._characterList?._selectedCharacter?.name
        ?? slotIdol?.idol?.name
        : undefined
      return { page: title, state: typeof idolName === 'string' && idolName.trim() ? idolName.trim() : undefined }
    }

    const storedEvent = scene?._mainLayer?._store?._gameEvent
    const eventName = scene?._params?.gameEvent?.name
      ?? (typeof storedEvent?.id === 'string' && storedEvent.id === scene?._gameEventId ? storedEvent.name : undefined)
    if (typeof eventName === 'string' && eventName.trim())
      return { event: eventName.trim().replace(/\s+/g, ' ') }

    const cachedEvent = eventNames?.find(event => event.id === scene?._gameEventId)
    if (cachedEvent)
      return { event: cachedEvent.name }
  }

  return null
}

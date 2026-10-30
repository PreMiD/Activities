interface ProduceStore {
  userProduce?: {
    produce?: { produceType?: unknown, title?: unknown }
    produceConcert?: { id?: unknown, category?: unknown }
  }
  userProduceIdol?: { fullName?: unknown }
  seasonNum?: unknown
  displayingSeasonNum?: unknown
  remainSeasonWeek?: unknown
  weekType?: unknown
  _selectProduceArea?: { produce?: { title?: unknown } }
}

interface IdolPageStore {
  activeUserIdol?: { name?: unknown }
  detailUserIdol?: { name?: unknown }
  _selectedSlotParam?: { idolId?: unknown }
  getUserProduceExSkillIdolByIdolId?: (id: string) => { idol?: { name?: unknown } } | undefined
}

interface EventCommunication {
  id?: unknown
  gameEventId?: unknown
  specialCommunicationListId?: unknown
  name?: unknown
  title?: unknown
}

interface GameEvent {
  id?: unknown
  name?: unknown
  communications?: EventCommunication[]
}

interface AlbumCommunication {
  id?: unknown
  characterId?: unknown
  albumType?: unknown
  title?: unknown
  isHomeIdolCommu?: unknown
  eventCategory?: { dataPath?: unknown }
}

interface AlbumCard {
  name?: unknown
  getIconImagePath?: () => unknown
}

interface CharacterAlbum {
  id?: unknown
  name?: unknown
  communications?: AlbumCommunication[]
  albumCommunicationTitles?: { albumType?: unknown, title?: unknown }[]
  produceIdols?: AlbumCard[]
  supportIdols?: AlbumCard[]
}

export interface GameVideo {
  currentTime?: unknown
  duration?: unknown
  paused?: boolean
  ended?: boolean
}

export interface GameLayer {
  _bgmPath?: unknown
  texture?: {
    baseTexture?: {
      source?: GameVideo
    }
  }
  text?: unknown
  _base?: GameLayer
  _buttonMap?: unknown
  _params?: {
    characterAlbum?: CharacterAlbum
    gameEvent?: GameEvent
    releasedCommunications?: EventCommunication[]
    id?: unknown
    category?: unknown
    userMypageCommunication?: { mypageCommunication?: AlbumCommunication }
    isReleasedCommunication?: unknown
    plateParams?: { title?: unknown, eventCategoryName?: unknown, idolIconImagePath?: unknown }
    userProduce?: ProduceStore['userProduce']
    userProduceIdol?: ProduceStore['userProduceIdol']
    produceIdol?: ProduceStore['userProduceIdol']
    concertType?: unknown
    result?: unknown
    produceStaffConcertComments?: { concertId?: unknown, result?: unknown }[]
  }
  _produceIdol?: ProduceStore['userProduceIdol']
  _header?: { visible?: boolean, text?: { text?: unknown } }
  _concertService?: {
    _store?: { centerIdol?: { fullName?: unknown } }
  }
  visible?: boolean
  renderable?: boolean
  children?: GameLayer[]
}

interface GameScene extends GameLayer {
  _fesDeckLayer?: GameLayer
  _idolDetail?: unknown
  _userIdol?: AlbumCard
  _userSupportIdol?: AlbumCard
  _isEventShown?: boolean
  _pokerProduceStore?: unknown
  _userFesIdol?: { idol?: { name?: unknown } }
  _targetIdol?: { idol?: { name?: unknown } }
  _awakeIdolSelectLayer?: { _characterList?: { _selectedCharacter?: { name?: unknown } } }
  _profileParams?: unknown
  _idolSelectLayer?: GameLayer
  _main?: {
    _musicList?: {
      _isTrialListening?: boolean
      _activeConcertBgm?: {
        songTitle?: unknown
        artist?: unknown
        getBgmPath?: () => unknown
        getMvBgmPath?: () => unknown
        getFullMvBgmPath?: () => unknown
      }
    }
  }
  _prologueCommunications?: (EventCommunication & { category?: unknown })[]
  _pokerProduceDeckStore?: { _pokerProduce?: { name?: unknown } }
  _myPage?: { gameEvent?: GameEvent[] }
  _albumStore?: {
    _album?: {
      gameEvents?: GameEvent[]
      collaborationGameEvents?: GameEvent[]
      specialEvents?: GameEvent[]
    }
  }
  _gameEventId?: unknown
  _store?: ProduceStore & IdolPageStore
  _mainLayer?: {
    _areaSelectLayer?: GameLayer
    _store?: { _gameEvent?: GameEvent }
    _deckEditLayer?: {
      _commonPartsLayer?: GameLayer
      _areaSelectLayer?: GameLayer
      _deckEditDetailLayer?: GameLayer
      _knowHowBookLayer?: GameLayer
      _itemPreparationLayer?: GameLayer
    }
  }
  _endingLayer?: unknown
  _frontLayer?: GameLayer
  _produceType?: unknown
  _concertCategory?: unknown
}

export interface GameEngine {
  sceneManager: { getScenes: () => GameScene[] }
  soundManager?: {
    bgm?: {
      name?: unknown
      currentTime?: unknown
      duration?: unknown
      loop?: boolean
      loopStart?: unknown
      loopEnd?: unknown
      _paused?: boolean
      ended?: boolean
    }
  }
}

export interface WebpackRuntime {
  (id: string): GameEngine | undefined
  m: Record<string, unknown>
}

interface ProduceStatus {
  idol: string
  scenario: string
  stage: string
}

interface EventStatus {
  event: string
  episode?: { chapter: string, title: string }
}

export interface EventContext {
  route: string
  events: {
    category: string
    event: string
    episodes: { id: string, chapter: string, title: string }[]
  }[]
}

export type GameStatus = ProduceStatus | { home: true } | { album: string } | {
  page: string
  state?: string
  playback?: { type: 'audio' | 'video', position: number, duration: number, paused: boolean }
} | EventStatus | {
  fesUnit: true
} | {
  profilePage: string
} | {
  stagePage: { mode?: string, section?: string }
} | {
  preparation: { mode: string, stage: string }
} | {
  communication: { name: string, title?: string }
}

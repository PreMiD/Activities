import {
  assets,
  decompressGzip,
  deEsser,
  giveArticle,
  makeProgressBar,
  updateUndefinedKeys,
} from './util.js'

const presence = new Presence({
  clientId: '1177802176140156998',
})
const timeStamp = newTimeStamp()
const IMAGE = {
  duoTool: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/0.png',
  profileDuo: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/1.png',
  duoGlobe: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/2.png',
}
const LANGUAGE_NAMES: Record<string, string> = {
  'ar': 'Arabic',
  'ca': 'Catalan',
  'cs': 'Czech',
  'cy': 'Welsh',
  'da': 'Danish',
  'de': 'German',
  'el': 'Greek',
  'en': 'English',
  'eo': 'Esperanto',
  'es': 'Spanish',
  'fi': 'Finnish',
  'fr': 'French',
  'gd': 'Scottish Gaelic',
  'gn': 'Guarani',
  'he': 'Hebrew',
  'hi': 'Hindi',
  'ht': 'Haitian Creole',
  'hu': 'Hungarian',
  'hv': 'High Valyrian',
  'hw': 'Hawaiian',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'la': 'Latin',
  'nl-nl': 'Dutch',
  'no-bo': 'Norwegian (Bokmål)',
  'nv': 'Navajo',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'qc': 'K\'iche\'',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sw': 'Swahili',
  'ga': 'Irish',
  'sv': 'Swedish',
  'tlh': 'Klingon',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese',
  'yi': 'Yiddish',
  'yu': 'Yucatec',
  'zh': 'Chinese',
  'zh-hk': 'Chinese (Cantonese)',
  'zu': 'Zulu',
}
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/logo.png',
}
const settings = {
  showTime: true,
  showTimeOverwrite: false,
  lastPath: null as unknown as string,
}
const language = {
  code: null as unknown as string,
  name: null as unknown as string,
}
const user = {
  currentCourseId: null as unknown as string,
  streak: null as unknown as number,
  xp: null as unknown as number,
  freezes: null as unknown as number,
  lesson: {
    timeStamp: null as unknown as number,
    active: false,
    finished: null as unknown as string,
  },
}
const storedUsers = localStorage.getItem('PMD-users-cache')
const users: { username?: string, displayName?: string, img?: string }[] = storedUsers
  ? JSON.parse(storedUsers)
  : []

let timeoutId: number

function newTimeStamp() {
  return Math.floor(Date.now() / 1000)
}

function handleLesson(_path: string | string[]) {
  const progressBarElement = document.querySelector('div[role="progressbar"]')
  const PBProgression = Number(progressBarElement?.getAttribute('aria-valuenow'))
  if (
    !document.querySelector('[data-test="daily-quest-progress-slide"]')
    && PBProgression < 10
  ) {
    user.lesson.finished = null as unknown as string
  }
  if (
    user.lesson.finished
    || document.querySelector('[data-test="daily-quest-progress-slide"]')
    || document.querySelector('[data-test="session-complete-slide"]')
  ) {
    const path = user.lesson.finished ? [user.lesson.finished] : _path

    switch (true) {
      case path.includes('legendary'):
        user.lesson.finished = 'legendary'
        presenceData.details = `Finished ${giveArticle(
          language.name,
        )} legendary challenge`
        break
      case path.includes('placement'):
        user.lesson.finished = 'placement'
        presenceData.details = `Finished ${language.name} placement test`
        break
      case path.includes('test'):
        user.lesson.finished = 'test'
        presenceData.details = `Passed ${giveArticle(
          language.name,
        )} jump ahead test`
        break
      case path.includes('mistakes-review'):
        user.lesson.finished = 'mistakes-review'
        presenceData.details = 'Finished reviewing past mistakes'
        break
      case path.includes('unit-rewind'):
        user.lesson.finished = 'unit-rewind'
        presenceData.details = 'Finished reviewing old exercises'
        break
      case path.includes('listen-up'):
      case path.includes('listening-practice'):
        user.lesson.finished = 'listening-practice'
        presenceData.details = `Finished ${language.name} listening exercises`
        break
      case path.includes('finished-default'):
      default:
        user.lesson.finished = 'finished-default'
        presenceData.details = `Finished ${giveArticle(language.name)} lesson`
    }
  }

  if (!user.lesson.finished && progressBarElement) {
    user.lesson.active = true

    presenceData.state = `${makeProgressBar(
      PBProgression,
      Number(progressBarElement?.getAttribute('aria-valuemax')),
      (presenceData.details as string).length / 3.2,
      /--web-ui_progress-bar-color: rgb\(var\(--color-(\w+)\)\);/.exec(
        progressBarElement?.getAttribute('style') ?? '',
      )?.[1],
    )}`
    if (!user.lesson.timeStamp)
      user.lesson.timeStamp = newTimeStamp()
    settings.showTimeOverwrite = false
  }
  else if (_path.includes('tips')) {
    presenceData.state = 'Viewing tips'
  }
  else if (!user.lesson.active) {
    settings.lastPath = '~'
    presenceData.state = 'Loading...'
    settings.showTimeOverwrite = true
    user.lesson.finished = null as unknown as string
  }
}

async function updateData(_inLesson = false) {
  let state = JSON.parse(window.localStorage.getItem('duo.state') ?? '')
  state = JSON.parse(await decompressGzip(state))?.state?.redux
  if (!state)
    return
  // resets lesson variables to default on updateData()
  // on updateData(true), lesson variables stay untouched
  if (!_inLesson) {
    user.lesson.active = false
    user.lesson.finished = null as unknown as string
    settings.showTimeOverwrite = true
  }

  user.currentCourseId = state.user.currentCourseId
  if (user.currentCourseId)
    setLang(/_(.*?)_/.exec(user.currentCourseId)?.[1] ?? '')

  const showTime = await presence.getSetting<boolean>('timestamps')
  settings.showTime = showTime
}

function setLang(code: string) {
  language.code = code?.toLowerCase()
  language.name = LANGUAGE_NAMES[language.code] || null as unknown as string
  if (!language.name && language.code) {
    setLang(
      {
        dn: 'nl-nl',
        nb: 'no-bo',
        zc: 'zh-hk',
      }[language.code]!,
    )
  }
  else if (language.name && language.code) {
    presenceData.smallImageKey = assets[`lang_${language.code.split('-')[0]}`]
    presenceData.smallImageText = `${language.name}`
  }
  else {
    presenceData.smallImageKey = IMAGE.duoGlobe
  }
}
updateData()
presence.on('UpdateData', async () => {
  if (settings.lastPath === document.location.pathname)
    return

  const path = decodeURI(document.location.pathname).split('/')

  delete presenceData.details
  delete presenceData.smallImageKey
  delete presenceData.smallImageText
  delete presenceData.state
  delete presenceData.startTimestamp

  switch (path[1]) {
    case 'learn':
      updateData()
      presenceData.details = `Choosing ${giveArticle(language.name)} lesson`
      break
    case 'characters':
      updateData()
      presenceData.details = `Viewing ${language.name} characters`
      break

    case 'mistakes-review':
      updateData(true)
      presenceData.details = 'Reviewing recent mistakes'
      handleLesson(path)
      break
    case 'practice-hub':
      switch (path[2]) {
        case 'unit-rewind':
          updateData(true)
          presenceData.details = 'Reviewing old exercises'
          handleLesson(path)
          break
        case 'listen-up':
        case 'listening-practice':
          updateData(true)
          presenceData.details = `Practicing Listening in ${language.name}`
          handleLesson(path)
          break
        default:
          updateData()
          presenceData.details = 'In practice hub'
          switch (true) {
            case path.includes('mistakes'):
              presenceData.state = 'Viewing mistakes'
              break
            case path.includes('stories'):
              presenceData.state = 'Viewing stories'
          }
      }
      break
    case 'lesson':
    case 'practice':
    case 'alphabets':
      updateData(true)
      switch (true) {
        case path.includes('legendary'):
          presenceData.details = `In ${giveArticle(
            language.name,
          )} legendary challenge`
          break

        case path.includes('test'):
          presenceData.details = `Taking ${giveArticle(
            language.name,
          )} jump ahead test`
          break
        case path.includes('alphabets'):
          if (path[3] === 'tips') {
            presenceData.details = 'Viewing alphabet tips'
            presenceData.state = `${language.name}`
          }
          else {
            presenceData.details = `Learning ${path[3]} alphabet`
          }
          break

        default:
          presenceData.details = `Working on ${giveArticle(
            language.name,
          )} lesson`
      }
      if (!path.includes('tips'))
        handleLesson(path)
      break

    case 'placement':
      setLang(path[2] ?? '')
      presenceData.details = `Taking ${language.name} placement test`
      handleLesson(path)
      break

    case 'leaderboard':
      presenceData.details = 'Viewing leaderboard'
      break

    case 'quests':
      presenceData.state = 'Viewing quests'
      break

    case 'shop':
      presenceData.state = 'Viewing shop'
      break

    case 'courses':
      presenceData.details = 'Viewing available courses'
      presenceData.smallImageKey = IMAGE.duoGlobe
      presenceData.smallImageText = 'viewing courses'
      break
    case 'enroll':
      setLang(path[2] ?? '')
      presenceData.details = `Viewing ${language.name} course`
      break

    case 'year-in-review':
      presenceData.details = `Viewing ${path[2]} Year in Review`
      break
    case 'profile':
    case 'u': {
      const username = path[2]
      const displayName = document.querySelector(
        'h1[data-test="profile-username"] span',
      )?.textContent ?? undefined
      const img = document.querySelector<HTMLImageElement>(
        `img[alt="${displayName}"]`,
      )?.src
      const i = users.findIndex(user => user.username === username)

      if (i !== -1) {
        updateUndefinedKeys(users[i]!, {
          username,
          displayName,
          img,
        })
      }
      else {
        users.push({ username, displayName, img })
        if (users.length > 20)
          users.shift()
      }

      localStorage.setItem('PMD-users-cache', JSON.stringify(users))

      if (!users[i]?.displayName) {
        settings.lastPath = '~'
        return
      }

      presenceData.details = `${path[3] ? 'On' : 'Viewing'} ${
        users[i]?.displayName ?? displayName
      }'s profile`
      if (path[3])
        presenceData.state = `Viewing ${path[3]}`
      presenceData.smallImageKey = users[i]?.img ?? img ?? IMAGE.profileDuo
      presenceData.smallImageText = path[1] === 'u' ? displayName : username
      break
    }
    case 'settings':
      presenceData.details = `In ${deEsser(path[2] ?? '')} settings`
      presenceData.smallImageKey = IMAGE.duoTool
      break
  }

  if (!user.lesson.active)
    user.lesson.timeStamp = null as unknown as number
  if (settings.showTime && !settings.showTimeOverwrite)
    presenceData.startTimestamp = user.lesson.timeStamp ?? timeStamp

  presence.setActivity(presenceData)

  settings.lastPath = document.location.pathname

  timeoutId = setTimeout(() => {
    settings.lastPath = '~'
    clearTimeout(timeoutId)
  }, 2000)
})

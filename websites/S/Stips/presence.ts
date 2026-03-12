const presence = new Presence({
  clientId: '745570917823807519',
})

function translate(isMale: boolean) {
  const refferGender = (arr: [string, string]): string => (isMale ? arr[0] : arr[1])
  const reporting: string = refferGender(['מדווח', 'מדווחת'])
  const removingQuestion: string = refferGender(['מוחק שאלה', 'מוחקת שאלה'])
  const removingAnswer: string = refferGender(['מוחק תשובה', 'מוחקת תשובה'])
  const editingQuestion: string = refferGender(['עורך שאלה', 'עורכת שאלה'])
  const editingAnswer: string = refferGender(['עורך תשובה', 'עורכת תשובה'])

  return {
    'default': refferGender(['גולש בסטיפס', 'גולשת בסטיפס']),
    '/': {
      main: 'בעמוד הראשי',
    },
    'ask': {
      main: refferGender(['קורא שאלה', 'קוראת שאלה']),
      scroll: refferGender(['קורא תשובות', 'קוראת תשובות']),
      write: refferGender(['כותב תשובה', 'כותבת תשובה']),
      report: reporting,
      removeAsk: removingQuestion,
      removeAns: removingAnswer,
      editAsk: editingQuestion,
      editAns: editingAnswer,
    },
    'explore': {
      '/': {
        main: 'צופה בשאלות חדשות',
        report: reporting,
        remove: removingQuestion,
        edit: editingQuestion,
      },
      'hot': {
        main: 'צופה בשאלות החמות',
        report: reporting,
        remove: removingQuestion,
        edit: editingQuestion,
      },
      'me': {
        main: refferGender(['צופה בשאלות ששאל', 'צופה בשאלות ששאלה']),
        report: reporting,
        remove: removingQuestion,
        edit: editingQuestion,
      },
      'unknown': 'צופה בשאלות',
    },
    'channel': {
      main: 'צופה בשאלות בחדר %channel%',
      report: reporting,
      remove: removingQuestion,
      edit: editingQuestion,
    },
    'pen-friends': {
      main: 'בחברים לעט',
      remove: refferGender(['מוחק מסר בחברים לעט', 'מוחקת מסר בחברים לעט']),
      write: refferGender(['כותב מסר בחברים לעט', 'כותבת מסר בחברים לעט']),
    },
    'reports': {
      main: 'ברשימת הדיווחים',
      removeAsk: removingQuestion,
      removeAns: removingAnswer,
      editAsk: editingQuestion,
      editAns: editingAnswer,
    },
    'settings': {
      main: 'בהגדרות',
    },
    'topic': {
      main: 'צופה בשאלות בנושא %topic%',
      report: reporting,
      remove: removingQuestion,
      edit: editingQuestion,
    },
    'profile': {
      main: 'בפרופיל של %nickname%',
      scroll: 'בקיר התודות של %nickname%',
      remove: refferGender(['מוחק מסר בקיר התודות', 'מוחקת מסר בקיר התודות']),
    },
    'notifications': {
      main: 'צופה בהתראות',
    },
    'messages': {
      '/': {
        main: 'במסרים',
        additionalPage: refferGender(['מסתכל באנשי הקשר', 'מסתכלת באנשי הקשר']),
      },
      'any': {
        // /messages/<user_id> //
        main: 'בשיחה עם %nickname%',
      },
    },
    'post': {
      ask: {
        main: refferGender(['כותב שאלה', 'כותבת שאלה']),
      },
    },
  }
}

function elemExists(query: string): boolean {
  return !!document.querySelector(query)
}

let elapsed: number
let oldUrl: string
let lastAction: string
let action: string
let isMale = true
const hasDark: boolean = elemExists('#darkmode')

// get gender
fetch('https://stips.co.il/api?name=user.get_app_user').then(resp =>
  resp.json().then((json) => {
    if (json.data.appUser.gender === 'male')
      isMale = true
    else isMale = false
  }),
)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Stips/assets/logo.png',
  StipspiLight = 'https://cdn.rcd.gg/PreMiD/websites/S/Stips/assets/0.png',
  StipspinDark = 'https://cdn.rcd.gg/PreMiD/websites/S/Stips/assets/1.png',
}

// main loop
presence.on('UpdateData', () => {
  const Path = window.location.pathname
  let [PathMain, PathSecond] = Path.split('/')
  let details
  let isReport = false
  let isDelete = false
  let isAns = true
  let isEdit = false
  let isWrite = false
  let askObj
  let xplrObj
  let cnlObj
  let msgObj
  let pflObj
  let repObj
  let tpcObj
  let pstObj
  let penfObj

  if (PathMain === '')
    PathMain = '/'
  PathSecond ??= '/'

  // detect url changes
  if (window.location.href !== oldUrl || lastAction !== action) {
    oldUrl = window.location.href
    lastAction = action
    elapsed = Math.floor(Date.now() / 1000)
  }

  switch (PathMain) {
    case '/':
      details = translate(isMale)['/'].main
      action = `${Path} & ${details}`
      break
    case 'ask':
      // get elements info
      isReport = elemExists('app-report-send')
      isDelete = elemExists('app-item-editor-delete')
      isEdit = elemExists('.edit-view')
      isWrite = elemExists('.active app-add-item-form')
      if (isDelete)
        isAns = elemExists('app-item app-item-editor-delete')
      if (isEdit)
        isAns = elemExists('.list-single-item .edit-view')

      // set state text
      askObj = translate(isMale).ask
      if (isReport)
        details = askObj.report
      if (isDelete)
        details = isAns ? askObj.removeAns : askObj.removeAsk
      if (isEdit)
        details = isAns ? askObj.editAns : askObj.editAsk
      if (isWrite)
        details = askObj.write

      details ??= askObj.main

      action = `${Path} & ${details}`
      break
    case 'explore':
      isReport = elemExists('app-report-send')
      isDelete = elemExists('app-item-editor-delete')
      isEdit = elemExists('.edit-view')

      xplrObj = translate(isMale).explore

      // if any of the bools apply, we don't care about the second path
      if (isReport)
        details = xplrObj['/'].report
      if (isDelete)
        details = xplrObj['/'].remove
      if (isEdit)
        details = xplrObj['/'].edit

      if (
        !details // eslint-disable-next-line no-prototype-builtins
        && xplrObj.hasOwnProperty(PathSecond)
      ) {
        // seems like xplrObj[PathSecond] won't work
        // let's do it manually then >'-'<
        switch (PathSecond) {
          case '/':
            details = xplrObj['/'].main
            break
          case 'hot':
            details = xplrObj.hot.main
            break
          case 'me':
            details = xplrObj.me.main
            break
          default:
            details = xplrObj.unknown
        }
      }

      action = `${Path} & ${details}`
      break
    case 'channel':
      isReport = elemExists('app-report-send')
      isDelete = elemExists('app-item-editor-delete')
      isEdit = elemExists('.edit-view')

      cnlObj = translate(isMale).channel

      if (isReport)
        details = cnlObj.report
      if (isDelete)
        details = cnlObj.remove
      if (isEdit)
        details = cnlObj.edit

      details ??= cnlObj.main
        .replace('%channel%', decodeURI(location.pathname.split('/')[2]!)) // %D7%90%D7%91%D7%92 => אבג
        .replace('-', ' ') // סדרות-וסרטים => סדרות וסרטים

      action = `${Path} & ${details}`
      break
    case 'pen-friends':
      isDelete = elemExists('app-item-editor-delete')
      isWrite = elemExists('.active app-add-item-form')

      penfObj = translate(isMale)['pen-friends']
      if (isDelete)
        details = penfObj.remove
      if (isWrite)
        details = penfObj.write
      details ??= penfObj.main

      action = `${Path} & ${details}`
      break
    case 'reports':
      // get elements info
      isDelete = elemExists('app-item-editor-delete')
      isEdit = elemExists('.edit-view')

      if (isDelete) {
        isAns = !!document
          .querySelector('app-item-editor-delete .text-title')
          ?.textContent
          ?.includes('תשובה')
      }
      if (isEdit)
        isAns = elemExists('.edit-view + mat-card.item-type-ans')

      // set state text
      repObj = translate(isMale).reports
      if (isDelete)
        details = isAns ? repObj.removeAns : repObj.removeAsk
      if (isEdit)
        details = isAns ? repObj.editAns : repObj.editAsk

      details ??= repObj.main

      action = `${Path} & ${details}`
      break
    case 'settings':
      details = translate(isMale).settings.main
      action = Path
      break
    case 'topic':
      isReport = elemExists('app-report-send')
      isDelete = elemExists('app-item-editor-delete')
      isEdit = elemExists('.edit-view')

      tpcObj = translate(isMale).topic

      if (isReport)
        details = tpcObj.report
      if (isDelete)
        details = tpcObj.remove
      if (isEdit)
        details = tpcObj.edit

      details ??= tpcObj.main.replace(
        '%topic%',
        decodeURI(location.pathname.split('/')[2]!),
      )

      action = `${Path} & ${details}`
      break
    case 'profile':
      isDelete = elemExists('app-item-editor-delete')

      pflObj = translate(isMale).profile

      if (isDelete)
        details = pflObj.remove

      details ??= pflObj.main.replace(
        '%nickname%',
        document.querySelector('app-user-profile .nickname')?.textContent
        || 'טוען...',
      )

      action = `${Path} & ${details}`
      break
    case 'notifications':
      details = translate(isMale).notifications.main
      action = Path
      break
    case 'messages':
      msgObj = translate(isMale).messages

      if (PathSecond === '/') {
        details = elemExists('app-contacts')
          ? msgObj['/'].additionalPage
          : msgObj['/'].main
      }
      else {
        details = elemExists('.user-nickname')
          ? msgObj.any.main.replace(
              '%nickname%',
              document.querySelector('.user-nickname')?.textContent ?? '',
            )
          : msgObj['/'].main // invalid <user-id> in path
      }

      action = `${Path} & ${details}`
      break
    case 'post':
      pstObj = translate(isMale).post
      if (PathSecond === 'ask')
        details = pstObj.ask.main

      action = `${Path} & ${details}`
      break
  }

  const smallImageText = location.host
    + decodeURI(
      location.pathname.split('/').length === 4
        ? location.pathname.replace(
            `/${location.pathname.split('/').pop()}`,
            '',
          )
        : location.pathname === '/'
          ? ''
          : location.pathname,
    )

  presence.setActivity({
    details: details ?? translate(isMale).default,
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: hasDark ? ActivityAssets.StipspinDark : ActivityAssets.StipspiLight,
    startTimestamp: elapsed,
    smallImageText,
  })
})

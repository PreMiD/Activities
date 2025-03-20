// This is required to retrieve the values from the Tetris game
// The scores and other information is stored deep within a global
// object, and rendered on a canvas, so we need to traverse the object
// to find the values. Current methods for reading global variables
// are not sufficient.
// It also needs to use functions to determine the current scene.
function iframeInject() {
  interface TetrisApp extends Record<string, unknown> {
    mSceneMgr: {
      getCurrentScene: () => {
        mSceneName: string
      }
    }
  }

  interface Window {
    mBPSApp: TetrisApp
  }

  let values: Record<
    string,
    {
      mText: string
    }
  > = {}

  function recursiveSearch(
    obj: Record<string, unknown>,
    seenAlready = new Set(),
  ) {
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        if (seenAlready.has(obj[key]))
          continue
        seenAlready.add(obj[key])
        if (
          new Set([
            'mLinesValueView',
            'mScoreValueView',
            'mLevelValueView',
          ]).has(key)
        ) {
          values[key] = obj[key] as { mText: string }
        }

        if (obj[key] && typeof obj[key] === 'object')
          recursiveSearch(obj[key] as Record<string, unknown>, seenAlready)
      }
    }
  }

  let found = false
  setInterval(() => {
    const currentScene = (
      window as unknown as Window
    ).mBPSApp.mSceneMgr.getCurrentScene().mSceneName
    if (!found && currentScene === 'game') {
      values = {}
      recursiveSearch((window as unknown as Window).mBPSApp)
      if (Object.keys(values).length === 3)
        found = true
    }
    else if (currentScene === 'mainMenu' || currentScene === 'gameOver') {
      found = false
    }

    try {
      document.querySelector<HTMLTextAreaElement>(
        '#PreMiD-tetris-presence-output',
      )!.value = JSON.stringify({
        lines: values.mLinesValueView?.mText,
        score: values.mScoreValueView?.mText,
        level: values.mLevelValueView?.mText,
      })
    }
    catch {
      /* ignore */
    }
  }, 2000)
}

const template = document.createElement('template')
const script = document.createElement('script')
const output = document.createElement('textarea')

output.id = 'PreMiD-tetris-presence-output'
output.style.display = 'none'
script.id = 'PreMiD-tetris-presence-script'
script.textContent = `{(${iframeInject.toString()})();}`
template.append(script, output)
document.head.append(template.cloneNode(true))

const iframe = new iFrame()

iframe.on('UpdateData', () => {
  try {
    const data = JSON.parse(
      document.querySelector<HTMLTextAreaElement>(
        '#PreMiD-tetris-presence-output',
      )!.value,
    )
    iframe.send(data)
  }
  catch {
    /* ignore */
  }
})

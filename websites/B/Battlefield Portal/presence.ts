const presence = new Presence({
  clientId: '919182644296683520',
})

interface PlaygoundInfo {
  playgroundId?: string
  type?: string
  playgroundName?: string
  playgroundDescription?: string
}

async function getPlaygroundInfo(playgroundId: string): Promise<string> {
  const resp = await fetch(
    `https://api.gametools.network/bf2042/playground/?playgroundid=${playgroundId}`,
  )
  if (!resp.ok)
    throw new Error('Failed')
  return resp.text()
}

let called = false
let playgroundId: string | undefined

const editingStamp = Math.floor(Date.now() / 1000)
const info: PlaygoundInfo = {}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Battlefield%20Portal/assets/logo.png',
  }
  const [block, time, buttons, name, description] = await Promise.all([
    presence.getSetting<boolean>('block'),
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('name'),
    presence.getSetting<boolean>('desc'),
  ])
  const url = document.URL

  if (url.search('=') > 0)
    playgroundId = url.split('=').pop()

  if (
    document.cookie.match(/(^| )sessionId=([^;]+)/)?.[1]
    && playgroundId
  ) {
    info.playgroundId = playgroundId
    if (document.readyState === 'complete') {
      if (!called) {
        called = true
        await getPlaygroundInfo(playgroundId).then((value) => {
          const json = JSON.parse(value)
          if (!json) {
            called = false
          }
          else {
            info.type = json.naming.type
            info.playgroundDescription = json.naming.playgroundDescription
            info.playgroundName = json.naming.playgroundName
            presence.info(JSON.stringify(info))
          }
        })
      }
    }
    else {
      called = false
    }
  }
  if (info) {
    if (name)
      presenceData.details = `Making ${info.playgroundName}`
    if (description)
      presenceData.state = info.playgroundDescription
  }

  if (block) {
    const selected = document.querySelector('.blocklySelected')
    if (selected) {
      if (
        selected.querySelector('.subroutineBlockSubroutineText')
          ?.textContent === 'SUBROUTINE'
      ) {
        const blocklyText = selected.querySelectorAll(
          'text[class=blocklyText]',
        )
        for (const element of blocklyText) {
          if (
            element.parentElement?.getAttribute('transform')
            === 'translate(126.36666870117188,18)'
          ) {
            presenceData.state = `in Subroutine ${element.textContent}`
          }
        }
      }
      else if (
        selected.querySelector('.ruleBlockRuleText')?.textContent === 'RULE'
      ) {
        const blocklyText = selected.querySelectorAll(
          'text[class=blocklyText]',
        )
        for (const element of blocklyText) {
          if (
            element.parentElement?.getAttribute('transform')
            === 'translate(72.78333282470703,8.5)'
          ) {
            presenceData.state = `in RULE ${element.textContent}`
          }
        }
      }
      else if (description) {
        // todo: need to implement if a single block is selected
        presenceData.state = info.playgroundDescription
      }
    }
  }

  if (time)
    presenceData.startTimestamp = editingStamp
  if (buttons)
    presenceData.buttons = [{ label: 'View Experience', url }]
  presence.setActivity(presenceData)
})

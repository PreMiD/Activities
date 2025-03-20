import { byHref } from './data.js'
import { handleSport } from './handleSport.js'
import { ActivityAssets } from './presence.js'

function noTemplate(ext: string, presenceData: PresenceData): void {
  switch (ext.split('/')[0]) {
    case 'for-you':
      presenceData.details = 'browsing personalized feed'
      break

    case 'games':
      presenceData.details = 'playing games!'
      break

    default:
      presenceData.details = 'Browsing the news'
  }
}

function formatTitle(presenceData: PresenceData): void {
  presenceData.details = 'Browsing Section'
  presenceData.state = document.title.split('|')[0]?.trim()
}

// I'm leaving this well-commented because I hate regex
function extractNameFromString(formattedString: string, formatPattern: string) {
  let result = ''
  let match: RegExpExecArray | null
  //* Loop through the format pattern to find text between curly braces
  let formatPatternCopy = formatPattern
  while (true) {
    match = /\{[^}]*\}|([^{}]+)/.exec(formatPatternCopy)
    if (!match)
      break

    //* Add any captured text (not inside braces) to result
    if (match[1])
      result += match[1]

    formatPatternCopy = formatPatternCopy.slice(match.index + match[0].length)
  }

  // Replace occurrences of any strings from the list with nothing
  return formattedString.replace(
    new RegExp(
      result
        .split(' ')
        .filter(o => o)
        .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|'),
      'g',
    ),
    '',
  )
}

export function findPage(ext: string, presenceData: PresenceData): void {
  // find by template
  const template = byHref[ext]
  if (ext.startsWith('sport')) {
    handleSport(ext, presenceData)
  }
  else if (template && template.customMsg) {
    presenceData.details = template.customMsg
  }
  else if (!template || !template.template) {
    noTemplate(ext, presenceData)
  }
  else if (template.template === 'OTHER') {
    presenceData.details = 'Browsing Section'
    presenceData.state = template.subsectionTitle
  }
  else if (template.template === 'USETITLE') {
    formatTitle(presenceData)
  }
  else {
    let el: HTMLElement | null | undefined = document.body
    for (const CSSsel of template.template.split(' > '))
      el = el?.querySelector(CSSsel)

    // format the title
    const strToAdd = template.format && el?.textContent
      ? extractNameFromString(el.textContent, template.format)
      : el?.textContent
    presenceData.details = strToAdd || 'the news'
  }

  if (ext === 'video/index.html') {
    presenceData.details = `Watching ${presenceData.details}`
    presenceData.buttons = [
      { label: 'Watch Along', url: document.location.href },
    ]

    const vid = document.querySelector('video')!
    if (!vid.paused && !vid.ended)
      presenceData.smallImageKey = ActivityAssets.PlayIco
    else presenceData.smallImageKey = ActivityAssets.PauseIco
  }
  else {
    presenceData.buttons = [
      { label: 'Browse Along', url: document.location.href },
    ]
  }
}

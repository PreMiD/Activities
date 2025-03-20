import { getWorkspaceName } from '../lib/workspace.js'
import { ActivityAssets } from '../presence.js'

function getEndpoint(): string | null {
  const cmLine = document.querySelector('.cm-line')

  if (!cmLine)
    return null

  const childNodes = [...cmLine.childNodes]
  const firstNodeContent = childNodes[0]?.textContent

  if (!firstNodeContent)
    return null

  if (childNodes.length === 1) {
    return new URL(firstNodeContent).pathname
  }
  else {
    return childNodes
      .filter(node => node.nodeType === node.TEXT_NODE)
      .map(node => node.textContent)
      .join('')
      .split('?')[0]!
  }
}

function getMethod(): string | null {
  const tab = document.querySelector('[id*="removable-tab"].active')

  if (!tab)
    return null

  const method = tab.querySelector('span.text-tiny')

  if (!method)
    return null

  return method.textContent
}

export function Rest(): PresenceData | null {
  const endpoint = getEndpoint()

  if (!endpoint)
    return null

  const method = getMethod()

  if (!method)
    return null

  return {
    smallImageKey: ActivityAssets.Rest,
    smallImageText: 'REST',
    details: getWorkspaceName(),
    state: `🧑‍💻 | ${method} ${endpoint}`,
  } as PresenceData
}

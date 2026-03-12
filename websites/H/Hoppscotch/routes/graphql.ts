import { getWorkspaceName } from '../lib/workspace.js'
import { ActivityAssets } from '../presence.js'

function getEndpoint() {
  const input = document.querySelector<HTMLInputElement>('input#url')

  if (!input)
    return null

  const url = new URL(input.value)

  return `${url.hostname}${url.pathname}`
}

export function GraphQL(): PresenceData | null {
  const endpoint = getEndpoint()

  if (!endpoint)
    return null

  return {
    smallImageKey: ActivityAssets.GraphQL,
    smallImageText: 'GraphQL',
    details: getWorkspaceName(),
    state: `🧑‍💻 | ${endpoint}`,
  }
}

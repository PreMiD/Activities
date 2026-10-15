const presence = new Presence({
  clientId: '1560302281801470144',
})

const browsingTimestamp: number = Math.floor(Date.now() / 1000)

const ActivityAssets: { Logo: string } = {
  Logo: 'https://venice.ai/favicon.png',
}

// Ordered: first match wins.
const MODES: [string, string][] = [
  ['/chat/agent', 'Agentic chat'],
  ['/chat', 'Classic chat'],
  ['/studio', 'Studio'],
  ['/minds', 'Minds'],
  ['/character-chat', 'Characters'],
  ['/settings/api', 'API settings'],
  ['/token', 'Token dashboard'],
  ['/labs', 'Labs'],
]

function modeOf(path: string): string {
  for (const [base, name] of MODES) {
    if (path === base || path.startsWith(base + '/')) return name
  }
  return 'Venice AI'
}

function readModel(selector: string): string | null {
  const text: string = (document.querySelector(selector)?.textContent ?? '').trim()
  if (text.length === 0 || text.length > 60 || /credit/i.test(text)) return null
  return text
}

function getModel(): string | null {
  return readModel('[data-testid="minds-chat-agent-model-label"]') ?? readModel('p.css-1vyjab')
}

presence.on('UpdateData', async () => {
  let path: string = document.location.pathname.toLowerCase()
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)

  const model: string | null = getModel()

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details: modeOf(path),
    state: model ? 'Model: ' + model : 'Browsing',
  }

  presence.setActivity(presenceData)
})

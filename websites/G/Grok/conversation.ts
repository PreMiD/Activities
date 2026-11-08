export interface ConversationInfo {
  id: string | null
  title: string | null
  lastPrompt: string | null
  isGenerating: boolean
}

interface ConversationCache {
  id: string
  title: string | null
  lastPrompt: string | null
  fetchedAt: number
}

const FETCH_INTERVAL = 12_000
let cache: ConversationCache | null = null
let inflight: Promise<void> | null = null

function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function truncate(text: string, max: number): string {
  const value = collapse(text)
  if (value.length <= max)
    return value
  return `${value.slice(0, Math.max(0, max - 1))}…`
}

export function getConversationId(pathname: string): string | null {
  const match = pathname.match(/^\/(?:a\/)?(?:c|chat)\/([^/?#]+)/)
  const id = match?.[1]
  if (!id || id === 'c' || id === 'chat')
    return null
  try {
    return decodeURIComponent(id)
  }
  catch {
    return id
  }
}

function titleFromDocument(): string | null {
  const raw = document.title
    .replace(/\s*[—–|·-]\s*Grok\s*$/i, '')
    .replace(/^Grok\s*[—–|·-]\s*/i, '')
    .trim()
  if (!raw || /^grok$/i.test(raw))
    return null
  return raw
}

function titleFromSidebar(id: string): string | null {
  const selectors = [
    `a[href="/c/${CSS.escape(id)}"]`,
    `a[href="/chat/${CSS.escape(id)}"]`,
  ]
  for (const selector of selectors) {
    const text = document.querySelector(selector)?.textContent
    if (text && collapse(text))
      return collapse(text)
  }

  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href^="/c/"], a[href^="/chat/"]')) {
    if (link.href.includes(id) && link.textContent)
      return collapse(link.textContent)
  }
  return null
}

function lastPromptFromDom(): string | null {
  const bubbles = document.querySelectorAll(
    '.message-bubble.user-message, .user-message .message-bubble, .user-message',
  )
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const clone = bubbles[i]!.cloneNode(true) as HTMLElement
    for (const noise of clone.querySelectorAll('button, svg, nav, time, [aria-hidden="true"]'))
      noise.remove()
    const text = collapse(clone.textContent ?? '')
    if (text)
      return text
  }
  return null
}

export function isGenerating(): boolean {
  if (document.querySelector('[id="model-select-trigger"]') && document.querySelector('.animate-gaussian'))
    return true
  if (document.querySelector('.animate-gaussian'))
    return true
  const abort = document.querySelector(
    '[aria-label="Stop model response"], [aria-label*="Stop model"], [aria-label*="Stop generating"]',
  )
  return !!abort
}

async function fetchConversationFallback(id: string): Promise<void> {
  if (cache?.id === id && Date.now() - cache.fetchedAt < FETCH_INTERVAL)
    return
  if (inflight)
    return inflight

  inflight = (async () => {
    const next: ConversationCache = {
      id,
      title: cache?.id === id ? cache.title : null,
      lastPrompt: cache?.id === id ? cache.lastPrompt : null,
      fetchedAt: Date.now(),
    }

    try {
      const detail = await fetch(
        `https://grok.com/rest/app-chat/conversations_v2/${encodeURIComponent(id)}`,
        { credentials: 'include', headers: { Accept: 'application/json' } },
      )
      if (detail.ok) {
        const payload = await detail.json() as {
          conversation?: { title?: string }
        }
        if (payload.conversation?.title)
          next.title = collapse(payload.conversation.title)
      }
    }
    catch {
      // Title API is optional; DOM title is used when this fails.
    }

    try {
      const nodesResponse = await fetch(
        `https://grok.com/rest/app-chat/conversations/${encodeURIComponent(id)}/response-node`,
        { credentials: 'include', headers: { Accept: 'application/json' } },
      )
      if (nodesResponse.ok) {
        const nodesPayload = await nodesResponse.json() as {
          responseNodes?: Array<{ responseId?: string, sender?: string }>
        }
        const responseIds = (nodesPayload.responseNodes ?? [])
          .map(node => node.responseId)
          .filter((value): value is string => !!value)
          .slice(-12)

        if (responseIds.length) {
          const loaded = await fetch(
            `https://grok.com/rest/app-chat/conversations/${encodeURIComponent(id)}/load-responses`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ responseIds }),
            },
          )
          if (loaded.ok) {
            const loadedPayload = await loaded.json() as {
              responses?: Array<{ sender?: string, message?: string }>
            }
            const human = (loadedPayload.responses ?? [])
              .filter(response => /^(?:human|user)$/i.test(response.sender ?? ''))
              .at(-1)
            if (human?.message)
              next.lastPrompt = collapse(human.message)
          }
        }
      }
    }
    catch {
      // Prompt API is optional; DOM messages are used when this fails.
    }

    cache = next
  })().finally(() => {
    inflight = null
  })

  return inflight
}

export async function getConversationInfo(pathname: string): Promise<ConversationInfo> {
  const id = getConversationId(pathname)
  if (!id) {
    cache = null
    return {
      id: null,
      title: titleFromDocument(),
      lastPrompt: lastPromptFromDom(),
      isGenerating: isGenerating(),
    }
  }

  const title = titleFromSidebar(id) ?? titleFromDocument()
  const lastPrompt = lastPromptFromDom()

  if (!title || !lastPrompt)
    await fetchConversationFallback(id)

  return {
    id,
    title: title ?? (cache?.id === id ? cache.title : null),
    lastPrompt: lastPrompt ?? (cache?.id === id ? cache.lastPrompt : null),
    isGenerating: isGenerating(),
  }
}

export function formatPrompt(prompt: string): string {
  return truncate(prompt, 96)
}

export function formatTitle(title: string): string {
  return truncate(title, 128)
}

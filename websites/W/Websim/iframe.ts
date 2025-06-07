declare global {
  interface Document {
    premidPresence?: {
      getPresenceData: () => any
    }
  }
}

function connectClient(
  name: string,
  targetOrigin: string,
  targetWindow: Window,
): any {
  return new Proxy(
    {},
    {
      get(_: object, fn: string) {
        return (...args: any[]) => {
          return new Promise((resolve, reject) => {
            const id = `rpc:${Math.random().toString(36).slice(2)}`
            const handler = (event: MessageEvent) => {
              if (
                event.isTrusted
                && event.source === targetWindow
                && event.data.id === id
              ) {
                window.removeEventListener('message', handler)
                if (event.data.error) {
                  reject(event.data.error)
                  return
                }
                resolve(event.data.result)
              }
            }
            window.addEventListener('message', handler)
            targetWindow.postMessage({ id, name, fn, args }, targetOrigin)
          })
        }
      },
    },
  )
}

const parentApi = connectClient('parent', 'https://websim.com', window.parent)

const iframe = new iFrame()

function getFaviconLink(): string | null {
  const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  return link ? link.href : null
}

async function main() {
  const { creator, currentUser } = { creator: await parentApi.getCreator(), currentUser: await parentApi.getUser() }
  iframe.send({
    favicon: getFaviconLink() || 'https://cdn.rcd.gg/PreMiD/websites/W/Websim/assets/logo.png',
    isOwner: currentUser?.id === creator?.id,
    creator,
    projectName: document.title,
  })
}

main()

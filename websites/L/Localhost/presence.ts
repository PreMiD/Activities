const presence = new Presence({
  clientId: '1428506399884841082',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getFavi(): Promise<string> {
  let favicon: string | undefined
  const nodeList = document.getElementsByTagName('link')

  for (let i = 0; i < nodeList.length; i++) {
    if (nodeList[i]?.getAttribute('rel') === 'icon' || nodeList[i]?.getAttribute('rel') === 'shortcut icon') {
      favicon = nodeList[i]?.getAttribute('href') ?? undefined
      break
    }
  }

  if (!favicon) {
    return ''
  }

  try {
    const absoluteUrl = new URL(favicon, window.location.href).href
    const response = await fetch(absoluteUrl)
    const blob = await response.blob()
    const icon = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
    return icon as string
  }
  catch (error) {
    console.error('[PreMiD Localhost] We could not grab this page\'s favicon.', error)
    return ''
  }
}

presence.on('UpdateData', async () => {
  const title = document.title

  const presenceData = {
    startTimestamp: browsingTimestamp,
    name: title,
    details: `Developing on ${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`,
    largeImageKey: await getFavi(),
    largeImageText: 'Favicon',
  } as PresenceData

  if (presenceData.name) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})

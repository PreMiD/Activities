const presence = new Presence({
  clientId: '1486470685994913873',
})

const browsingTimestamp: number = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async (): Promise<void> => {
  try {
    const presenceData: PresenceData = {
      largeImageKey: 'https://i.imgur.com/CwNKdGJ.png',
      startTimestamp: browsingTimestamp,
    }

    const pathname: string = document.location.pathname

    const songTitleElement: HTMLElement | null = document.querySelector<HTMLElement>('.t1')
    const artistNameElement: HTMLElement | null = document.querySelector<HTMLElement>('.t3')

    const songTitle: string | null = songTitleElement?.textContent?.trim() ?? null
    const artistName: string | null = artistNameElement?.textContent?.trim() ?? null

    if (songTitle && artistName) {
      presenceData.details = `Música: ${songTitle}`
      presenceData.state = `Artista: ${artistName}`
    }
    else if (pathname === '/') {
      presenceData.details = 'Procurando novas cifras...'
    }
    else {
      presenceData.details = 'Navegando no site'
    }

    presence.setActivity(presenceData)
  }
  catch (error) {
    console.error(
      '[PreMiD - Cifra Club] Error updating presence payload:',
      error,
    )
  }
})

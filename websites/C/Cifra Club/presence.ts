/**
 * PreMiD Presence instance configuration for Cifra Club.
 *
 * @see https://github.com/premidlibrary/discordjs-premid#usage
 */
const presence = new Presence({
  clientId: '1486470685994913873',
})

/**
 * Stores the initial browsing timestamp in Unix format (seconds).
 * Declared in the global scope to prevent the Discord elapsed time counter
 * from resetting on each update cycle.
 */
const browsingTimestamp: number = Math.floor(Date.now() / 1000)

/**
 * Event listener triggered by the PreMiD extension to update the presence payload.
 * Extracts DOM metadata from Cifra Club's structure to populate Discord Rich Presence.
 *
 * @returns {Promise<void>} Resolves when the activity payload is successfully set.
 *
 * @see https://github.com/premidlibrary/discordjs-premid#updating-data
 */
presence.on('UpdateData', async (): Promise<void> => {
  try {
    /**
     * Base presence payload instantiated on every update cycle.
     * @type {PresenceData}
     */
    const presenceData: PresenceData = {
      largeImageKey: 'https://i.imgur.com/CwNKdGJ.png',
      startTimestamp: browsingTimestamp,
    }

    /**
     * Current page path from the browser's location object.
     * Used to conditionally set the presence details and state.
     */
    const pathname: string = document.location.pathname

    /**
     * DOM nodes for song and artist metadata.
     */
    const songTitleElement: HTMLElement | null = document.querySelector<HTMLElement>('.t1')
    const artistNameElement: HTMLElement | null = document.querySelector<HTMLElement>('.t3')

    /**
     * Extracted song title and artist name from the DOM nodes.
     */
    const songTitle: string | null = songTitleElement?.textContent?.trim() ?? null
    const artistName: string | null = artistNameElement?.textContent?.trim() ?? null

    /**
     * Conditionally sets the presence details and state based on the current page path.
     */
    presenceData.details = songTitle && artistName
      ? `Música: ${songTitle}`
      : pathname === '/'
        ? 'Procurando novas cifras...'
        : 'Navegando no site'

    if (songTitle && artistName) {
      presenceData.state = `Artista: ${artistName}`
    }

    /**
     * Updates the presence payload with the extracted metadata.
     */
    presence.setActivity(presenceData)
  }
  catch (error) {
    /**
     * Logs any errors encountered while updating the presence payload.
     * @param {Error} error - The error object.
     */
    console.error(
      '[PreMiD - Cifra Club] Error updating presence payload:',
      error,
    )
  }
})

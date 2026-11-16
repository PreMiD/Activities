import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1568341036894523432',
})

presence.on('UpdateData', async () => {
  const el = document.getElementById('premid-presence')
  if (el) {
    const details = el.getAttribute('data-details')
    const state = el.getAttribute('data-state')
    const largeImage = el.getAttribute('data-large-image')
    const largeText = el.getAttribute('data-large-text')
    const smallImage = el.getAttribute('data-small-image')
    const smallText = el.getAttribute('data-small-text')
    const start = el.getAttribute('data-start')
    const end = el.getAttribute('data-end')
    const buttonLabel = el.getAttribute('data-button-label')
    const buttonUrl = el.getAttribute('data-button-url')

    if (details) {
      const isBrowsing
        = !end
          && (state?.includes('Parcourt')
            || state?.includes('Cherche')
            || state?.includes('Explore')
            || state?.includes('Consulte'))

      const activity: any = {
        type: isBrowsing ? ActivityType.Playing : ActivityType.Watching,
        details,
        state: state || undefined,
        largeImageKey: largeImage || 'https://sakura.thefoxy.me/icon.png',
        largeImageText: largeText || 'SAKURA',
        smallImageKey: smallImage || 'https://sakura.thefoxy.me/icon.png',
        smallImageText: smallText || 'SAKURA',
      }

      if (start)
        activity.startTimestamp = Math.floor(Number(start))
      if (end)
        activity.endTimestamp = Math.floor(Number(end))

      if (buttonLabel && buttonUrl && buttonUrl.startsWith('http')) {
        activity.buttons = [
          {
            label: buttonLabel.slice(0, 32),
            url: buttonUrl,
          },
        ]
      }

      presence.setActivity(activity)
      return
    }
  }

  presence.clearActivity()
})

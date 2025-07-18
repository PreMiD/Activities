import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1395486313251213494',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Lc2MCM6.png',
}

let isInGame = false
let gameStartTimestamp: number | null = null

presence.on('UpdateData', async () => {
  const path = document.location.pathname.toLowerCase()

  if (path.includes('/join/')) {
    if (isInGame && gameStartTimestamp !== null) {
      presence.setActivity({
        largeImageKey: ActivityAssets.Logo,
        smallImageKey: Assets.Play,
        startTimestamp: gameStartTimestamp,
        details: 'In a game',
      })
      return
    }

    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: Assets.Search,
      details: 'Loading players...',
    })

    const targetDiv = document.querySelector('div.w-15.h-8.lg\\:w-24.lg\\:h-10')

    if (targetDiv) {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const newText = (targetDiv.textContent ?? '').trim()

            if (/^\d+/.test(newText)) {
              isInGame = true
              gameStartTimestamp = Math.floor(Date.now() / 1000)

              presence.setActivity({
                largeImageKey: ActivityAssets.Logo,
                smallImageKey: Assets.Play,
                startTimestamp: gameStartTimestamp,
                details: 'In a game',
              })

              observer.disconnect()
              break
            }
          }
        }
      })

      observer.observe(targetDiv, { childList: true, subtree: true, characterData: true })
    }
  }
  else {
    isInGame = false
    gameStartTimestamp = null

    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      details: 'In the lobby',
    })
  }
})

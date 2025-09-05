import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1395486313251213494',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/O/OpenFront.io/assets/logo.png',
}

let isInGame = false
let gameStartTimestamp: number | null = null
let observerInitialized = false
let observer: MutationObserver | null = null

presence.on('UpdateData', async () => {
  const hash = document.location.hash.toLowerCase()

  if (hash.startsWith('#join=')) {
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

    const targetDiv = document.querySelector('div.h-8.lg\\:w-24.lg\\:h-10.border.border-slate-400.flex.items-center.justify-center.text-white')
    if (!targetDiv || observerInitialized)
      return

    observer = new MutationObserver((mutationsList) => {
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

            observer?.disconnect()
            observerInitialized = false
            observer = null
            break
          }
        }
      }
    })

    observer.observe(targetDiv, { childList: true, subtree: true, characterData: true })
    observerInitialized = true
  }
  else {
    isInGame = false
    gameStartTimestamp = null

    presence.setActivity({
      largeImageKey: ActivityAssets.Logo,
      details: 'In the lobby',
    })

    if (observer) {
      observer.disconnect()
      observer = null
      observerInitialized = false
    }
  }
})

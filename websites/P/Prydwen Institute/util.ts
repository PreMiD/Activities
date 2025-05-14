export enum ActivityAssets {
  Logo = 'https://i.imgur.com/XXdgNCU.png',
}

export const presence = new Presence({
  clientId: '918337184929546322',
})

export const slideshow = presence.createSlideshow()

let currentCacheKey: unknown[] = []
let currentCacheCallback: (() => void) | null = () => {}
let currentCacheDataStorage: object = {}
/**
 * Caches a method used to interact with browser APIs (eg MutationObserver) when the path changes.
 *
 * @param callback Function to run setup code on a certain path. Should return a cleanup function when path changes
 * @param dependenciesGetter Function to modify the dependency list if needed
 */
export function usePathCache<Data extends object>(
  callback: (storage: Data) => (() => void) | null,
  dependenciesGetter?: (baseDeps: string[]) => string[],
): Data {
  let dependencies = document.location.pathname.split('/').filter(Boolean)
  if (dependenciesGetter) {
    dependencies = dependenciesGetter(dependencies)
  }
  function executeChange() {
    currentCacheKey = structuredClone(dependencies)
    currentCacheCallback?.() // execute cleanup function
    currentCacheDataStorage = {}
    const cb = callback(currentCacheDataStorage as Data)
    const recheckInterval = setInterval(() => {
      dependencies = document.location.pathname.split('/').filter(Boolean)
      if (dependenciesGetter) {
        dependencies = dependenciesGetter(dependencies)
      }
      verify()
    }, 1000)
    currentCacheCallback = () => {
      clearInterval(recheckInterval)
      cb?.()
    }
  }
  function verify() {
    if (dependencies.length !== currentCacheKey.length) {
      executeChange()
      return currentCacheDataStorage as Data
    }
    for (let i = 0; i < dependencies.length; i++) {
      if (dependencies[i] !== currentCacheKey[i]) {
        executeChange()
        return currentCacheDataStorage as Data
      }
    }
    return null
  }
  const data = verify()
  if (data !== null) {
    return data
  }
  // no change to dependencies, ignore
  return currentCacheDataStorage as Data
}

let oldSlideshowKey: string
export function registerSlideshowKey(key: string): boolean {
  if (oldSlideshowKey !== key) {
    slideshow.deleteAllSlides()
    oldSlideshowKey = key
    return true
  }
  return false
}

export function addButton(
  presenceData: PresenceData,
  button: ButtonData,
): void {
  if (presenceData.buttons) {
    if (presenceData.buttons.length < 2) {
      presenceData.buttons.push(button)
    }
  }
  else {
    presenceData.buttons = [button]
  }
}

export interface ActiveAccordionData {
  active: HTMLDivElement | null
}

export function useActive(container: HTMLDivElement | null): ActiveAccordionData {
  return usePathCache<ActiveAccordionData>((data) => {
    const observer = new MutationObserver((changes) => {
      for (const change of changes) {
        switch (change.type) {
          case 'attributes': {
            if (change.attributeName === 'aria-expanded') {
              const target = change.target as HTMLElement
              if (target.getAttribute('aria-expanded') === 'true') {
                data.active = target.closest('.accordian')
                return
              }
              data.active = null
            }
            break
          }
          case 'childList': {
            // searching or changing filters
            data.active = null
            return
          }
        }
      }
    })
    if (!container) {
      return null
    }
    observer.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
    })
    return () => observer.disconnect()
  })
}

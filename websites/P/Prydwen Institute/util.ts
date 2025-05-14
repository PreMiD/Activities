export enum ActivityAssets {
  Logo = 'https://i.imgur.com/XXdgNCU.png',
}

let currentCacheKey: unknown[] = []
let currentCacheCallback: (() => void) | null = () => {}
let currentCacheDataStorage: object = {}
export function use<Data extends object>(
  callback: ((storage: Data) => ((() => void) | null)),
  dependencies: unknown[],
): Data {
  const executeChange = () => {
    currentCacheKey = structuredClone(dependencies)
    currentCacheCallback?.() // execute cleanup function
    currentCacheDataStorage = {}
    currentCacheCallback = callback(currentCacheDataStorage as Data)
  }
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
  // no change to dependencies, ignore
  return currentCacheDataStorage as Data
}

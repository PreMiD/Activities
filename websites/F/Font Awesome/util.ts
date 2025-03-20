export const presence = new Presence({
  clientId: '820023496934817804',
})
export const browsingTimestamp = Math.floor(Date.now() / 1000)
export const slideshow = presence.createSlideshow()

let oldSlideshowKey: string
/**
 * Registers a new slideshow key and clears the current slideshow on changes.
 */
export function registerSlideshowKey(key: string): boolean {
  if (oldSlideshowKey !== key) {
    presence.info(`Slideshow key changed from ${oldSlideshowKey} to ${key}`)
    slideshow.deleteAllSlides()
    oldSlideshowKey = key
    return true
  }
  return false
}

const iconCache: Record<string, Promise<Blob>> = {}
/**
 * Converts an icon <i> element to a Blob.
 *
 * @param icon
 * @param backgroundColor The background color of the icon
 */
export function getIconImage(
  icon: HTMLElement,
  backgroundColor = '#fff',
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  // get the icon's computed style
  const { fontFamily, fontWeight, color } = getComputedStyle(icon)
  const { content } = getComputedStyle(icon, ':before')
  const text = content.replace(/"/g, '')
  const key = `${fontFamily}-${fontWeight}-${backgroundColor}-${color}-${text}`

  if (key in iconCache)
    return iconCache[key]!
  // render the background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, 512, 512)

  // render the text
  ctx.font = `${fontWeight} 384px/1 ${fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 256)

  const blobPromise: Promise<Blob> = new Promise((resolve) => {
    canvas.toBlob((blob) => {
      // for debugging
      const url = URL.createObjectURL(blob!)
      presence.info(`${key} -> ${url}`)
      setTimeout(() => URL.revokeObjectURL(url), 15e3)
      resolve(blob!)
    })
  })

  iconCache[key] = blobPromise
  return iconCache[key]
}

let batchCacheKey: string
let batchCache: unknown[] = []
let batchInterval: number | null = null
let batchIndex = 0
let batchItems: unknown[] = []
let batchAborter = new AbortController()
/**
 * Batches a list of items and maps them to a new list of items.
 * Useful for expensive operations.
 *
 * The batch will execute every 5 seconds and will stop if the key changes.
 * If new items are added, the batch will restart.
 *
 * @param key A unique key for the batch
 * @param itemList The list of items to batch
 * @param mapper The function to map the items
 */
export async function batch<I, O>(
  key: string,
  itemList: I[],
  mapper: (input: I) => Awaitable<O>,
): Promise<O[]> {
  if (batchCacheKey === key) {
    // check if items changed
    if (batchItems.length !== itemList.length) {
      presence.info(
        `Batched items changed from ${batchItems.length} to ${itemList.length}`,
      )
      batchAborter.abort()
      batchCache = []
      batchIndex = 0
      batchItems = itemList
      if (batchInterval === null)
        executeBatch()
    }
    return batchCache as O[]
  }
  presence.info(`Batched key changed from ${batchCacheKey} to ${key}`)
  if (batchInterval)
    clearTimeout(batchInterval)
  batchAborter.abort()
  batchCacheKey = key
  batchCache = []
  batchItems = itemList
  batchIndex = 0

  async function executeBatch() {
    for (let i = batchIndex, j = 0; i < batchItems.length && j < 10; i++, j++) {
      const data = await mapper((batchItems as I[])[i]!)
      if (batchAborter.signal.aborted) {
        presence.info('Batch aborted')
        batchAborter = new AbortController()
        break
      }
      batchCache.push(data)
      batchIndex++
    }
    presence.info(`Batched ${batchIndex} of ${batchItems.length}`)
    if (batchIndex === batchItems.length) {
      if (batchInterval)
        clearTimeout(batchInterval)
      batchInterval = null
    }
    else if (key === batchCacheKey) {
      batchInterval = setTimeout(executeBatch, 5000)
    }
  }

  executeBatch()
  return batchCache as O[]
}

export const presence = new Presence({
  clientId: '1222797423953575977',
})

// eslint-disable-next-line import/no-mutable-exports
export let browsingTimestamp = Math.floor(Date.now() / 1000)

let currentTimestampKey: string
export function registerTimestampUpdate(key: string): void {
  if (currentTimestampKey !== key) {
    currentTimestampKey = key
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }
}

export const slideshow = presence.createSlideshow()

export const SLIDESHOW_TIMEOUT = 5000

let currentSlideshowKey: string
export function registerSlideshowKey(key: string): void {
  if (currentSlideshowKey !== key) {
    currentSlideshowKey = key
    slideshow.deleteAllSlides()
  }
}

export function getWindString(windIndex: number): string {
  switch (windIndex) {
    case 0:
      return 'East'
    case 1:
      return 'South'
    case 2:
      return 'West'
    case 3:
      return 'North'
    default:
      return 'Unknown'
  }
}

export function getPositionString(position: number): string {
  switch (position) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

const imageCache: Record<string, Promise<Blob | string>> = {}
export function squareImage(image: HTMLImageElement): Promise<Blob | string> {
  const { src, complete } = image
  image.crossOrigin = 'anonymous'
  if (src in imageCache)
    return imageCache[src]!
  const render = () => {
    const { naturalHeight: height, naturalWidth: width } = image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = width
    canvas.height = height
    if (width > height)
      canvas.height = width
    if (height > width)
      canvas.width = height
    if (width === height) {
      imageCache[src] = Promise.resolve(src)
      return imageCache[src]
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(
      image,
      (canvas.width - width) / 2,
      (canvas.height - height) / 2,
    )
    const output = new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      })
    })
    imageCache[src] = output
    return output
  }
  if (!complete) {
    return new Promise((resolve) => {
      image.onload = () => {
        resolve(render())
      }
    })
  }
  else {
    return render()
  }
}

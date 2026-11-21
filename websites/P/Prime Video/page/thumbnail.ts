import { CropAlignment, ImageType, MAX_CACHED_THUMBNAILS, RIGHT_SIDE_CROP_SIZE, THUMBNAIL_SIZE } from '../config/constants.js'

// Ready thumbnails (data URL, or original URL on failure) and requests in progress, keyed by type + URL
const thumbnails = new Map<string, string>()
const loading = new Set<string>()

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function generateThumbnail(thumbnailUrl: string, type: number, alignment: CropAlignment): Promise<string> {
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = thumbnailUrl
    // Decoded off the main thread, so that drawing it is cheap
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_SIZE
    canvas.height = THUMBNAIL_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return thumbnailUrl

    let sx = 0
    let sy = 0
    let sw = img.width
    let sh = img.height

    if (type === ImageType.RightSide) {
      if (alignment === CropAlignment.Right) {
        sw = Math.min(RIGHT_SIDE_CROP_SIZE, img.width)
        sh = Math.min(RIGHT_SIDE_CROP_SIZE, img.height)
        sx = img.width - sw
      }
      else {
        sw = Math.min(img.width, img.height)
        sh = sw
        sx = (img.width - sw) / 2
      }
      sy = (img.height - sh) / 2
    }

    const scale = THUMBNAIL_SIZE / Math.max(sw, sh)
    const width = sw * scale
    const height = sh * scale
    ctx.drawImage(img, sx, sy, sw, sh, (THUMBNAIL_SIZE - width) / 2, (THUMBNAIL_SIZE - height) / 2, width, height)

    // `toDataURL` would encode synchronously on the main thread
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    return blob ? await blobToDataUrl(blob) : thumbnailUrl
  }
  catch {
    return thumbnailUrl
  }
}

// Non-blocking: the thumbnail if it is ready, otherwise `undefined` while it is being generated.
// A failure is cached too, so a broken image is not requested again on every update.
function getThumbnail(thumbnailUrl: string, type: number, alignment: CropAlignment): string | undefined {
  const key = `${type}|${alignment}|${thumbnailUrl}`

  const cached = thumbnails.get(key)
  if (cached)
    return cached

  if (!loading.has(key)) {
    loading.add(key)
    generateThumbnail(thumbnailUrl, type, alignment)
      .then((result) => {
        thumbnails.set(key, result)
        if (thumbnails.size > MAX_CACHED_THUMBNAILS)
          thumbnails.delete(thumbnails.keys().next().value!)
      })
      .finally(() => loading.delete(key))
  }

  return undefined
}

// Sets the cover once its thumbnail is ready; until then, the default image stays
export function applyCover(
  presenceData: PresenceData,
  url: string | undefined,
  { showCover, imageType, alignment = CropAlignment.Right }: { showCover: boolean, imageType: number, alignment?: CropAlignment },
): void {
  const thumbnail = url && showCover ? getThumbnail(url, imageType, alignment) : undefined
  if (thumbnail)
    presenceData.largeImageKey = thumbnail
}

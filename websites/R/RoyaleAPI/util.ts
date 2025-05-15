export const presence = new Presence({
  clientId: '503557087041683458',
})
export const slideshow = presence.createSlideshow()

let oldSlideshowKey: string
export function registerSlideshowKey(key: string): boolean {
  if (oldSlideshowKey !== key) {
    slideshow.deleteAllSlides()
    oldSlideshowKey = key
    return true
  }
  return false
}

const cache = new Map()
export function renderMatchupIcon(container: HTMLElement) {
  if (cache.has(container)) {
    return cache.get(container)
  }
  const [mainImage, targetImage] = document.querySelectorAll('img')
  const canvas = document.createElement('canvas')
  canvas.width = mainImage!.width
  canvas.height = mainImage!.height
  const ctx = canvas.getContext('2d')!

  ctx.save()
  ctx.moveTo(0, 0)
  ctx.lineTo(canvas.width, 0)
  ctx.lineTo(0, canvas.height)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(mainImage!, 0, 0, canvas.width, canvas.height)
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(canvas.width, canvas.height)
  ctx.lineTo(canvas.width, 0)
  ctx.lineTo(0, canvas.height)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(targetImage!, 0, 0, canvas.width, canvas.height)
  ctx.restore()

  const data = canvas.toDataURL()
  cache.set(container, data)
  return data
}

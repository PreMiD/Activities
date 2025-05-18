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
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')!
export async function renderMatchupIcon(container: HTMLElement) {
  if (cache.has(container)) {
    return cache.get(container)
  }
  const [mainImage, targetImage] = (await Promise.all(
    [...container.querySelectorAll('img')].map((node) => {
      return new Promise((res) => {
        const image = new Image()
        image.onload = () => res(image)
        image.crossOrigin = 'anonymous'
        image.src = node.src
      })
    }),
  )) as HTMLImageElement[]
  canvas.width = mainImage!.width
  canvas.height = mainImage!.height
  ctx.clearRect(0, 0, canvas.width, canvas.height)

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

export function findNearestAboveElement(
  element: Element,
  selector: string,
): Element | null {
  let currentElement: Element | null = element
  while (currentElement) {
    if (currentElement.matches(selector))
      return currentElement
    currentElement = currentElement.previousElementSibling
  }
  return null
}

const imageCache: Record<string, Promise<Blob | string>> = {}
export async function squareImage(
  image: HTMLImageElement,
): Promise<Blob | string> {
  const { src, width, height } = image
  if (src in imageCache)
    return imageCache[src]!
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
    return src
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

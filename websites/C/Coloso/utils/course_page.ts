export function getCourseTitle(): string | undefined {
  return document.querySelector('[class="catalog-cover__caption-title"]')?.textContent
}

export function getCreatorName(): string | undefined {
  return document.querySelector('[class="CreatorDisplaySection-module-scss-module__yZk2mG__baseText"]')?.textContent
}

let generatedImageSrc: string
let generatedImage: string
export function getCourseThumbnail(): Promise<string> | undefined {
  const imgSrc = document.querySelector('[class="catalog-cover__image"]')?.querySelector('img')?.src

  if (imgSrc === generatedImageSrc) {
    return Promise.resolve(generatedImage)
  }

  if (imgSrc) {
    return new Promise((resolve) => {
      const img = new Image()
      const wh = 320
      img.crossOrigin = 'anonymous'
      img.src = imgSrc

      img.onload = () => {
        let newWidth: number
        let newHeight: number
        let offsetX: number
        let offsetY: number

        if (img.width > img.height) {
          newWidth = wh
          newHeight = (wh / img.width) * img.height
          offsetX = 0
          offsetY = (wh - newHeight) / 2
        }
        else {
          newHeight = wh
          newWidth = (wh / img.height) * img.width
          offsetX = (wh - newWidth) / 2
          offsetY = 0
        }
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = wh
        tempCanvas.height = wh

        tempCanvas
          .getContext('2d')
          ?.drawImage(img, offsetX, offsetY, newWidth, newHeight)

        generatedImageSrc = imgSrc
        generatedImage = tempCanvas.toDataURL('image/png')
        resolve(generatedImage)
      }
      img.onerror = () => {
        resolve(imgSrc)
      }
    })
  }
}

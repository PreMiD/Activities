import type { GuideData } from '../types.js'
import pLimit from 'p-limit'

const limit = pLimit(1)

export const guideMetadata: {
  url: string
  data?: GuideData
} = {
  url: '',
}

export async function fetchGuideMetadata(id: string): Promise<void> {
  await limit(async () => {
    if (guideMetadata?.url === document.location.href)
      return

    guideMetadata.url = document.location.href
    guideMetadata.data = await (
      await fetch(`https://www.ifixit.com/api/2.0/guides/${id}`)
    ).json()
  })
}

export function clearGuideMetadata(): void {
  guideMetadata.url = ''
  delete guideMetadata.data
}

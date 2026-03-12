import type { Root } from '../types.js'
import pLimit from 'p-limit'

const limit = pLimit(1)

// eslint-disable-next-line import/no-mutable-exports
export let metadata: {
  url: string
  data?: Root
} | null = null

export async function fetchMetadata(id: string): Promise<void> {
  await limit(async () => {
    if (metadata?.url === document.location.href)
      return

    const getVideoTitleResponse = await fetch('https://cc.unext.jp/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'cosmo_getVideoTitle',
        variables: {
          code: id,
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: '9c27258639966cfe47ebf308f155c3107d7489ed421b4d6e5ea61c3dd3c06c57',
          },
        },
      }),
    })
    const getVideoTitleEpisodesResponse = await fetch('https://cc.unext.jp/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'cosmo_getVideoTitleEpisodes',
        variables: {
          code: id,
          page: 1,
          pageSize: 20,
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: 'a2ee1b5c371aa0385a45bd8066671e50b8e618312246356a4d6b3feaf50d6a93',
          },
        },
      }),
    })

    metadata = {
      url: document.location.href,
      data: {
        webfrontTitleStage: (await getVideoTitleResponse.json()).data.webfront_title_stage,
        webfrontTitleTitleEpisodes: (await getVideoTitleEpisodesResponse.json())
          .data
          .webfront_title_titleEpisodes,
      },
    }
  })
}

export function clearMetadata(): void {
  metadata = null
}

import type { LiveRoot } from '../types.js'
import pLimit from 'p-limit'

const limit = pLimit(1)

// eslint-disable-next-line import/no-mutable-exports
export let liveMetadata: {
  url: string
  data?: LiveRoot
} | null = null

export async function fetchLiveMetadata(id: string): Promise<void> {
  await limit(async () => {
    if (liveMetadata?.url === document.location.href)
      return

    const getLiveDetailResponse = await fetch('https://cc.unext.jp/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'cosmo_getLiveDetail',
        variables: {
          liveCode: id,
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: '02f3512167abdfa1ebc3ba0fba04f54d2ccf5203e3e5639cbe36e5b844cbee38',
          },
        },
      }),
    })

    liveMetadata = {
      url: document.location.href,
      data: {
        webfrontGetLive: (await getLiveDetailResponse.json()).data.webfront_getLive,
      },
    }
  })
}

export function clearLiveMetadata(): void {
  liveMetadata = null
}

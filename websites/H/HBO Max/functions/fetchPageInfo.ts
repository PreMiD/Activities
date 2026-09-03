import type { IncludedItem, MaxAPIResponse } from '../types.ts'
import pLimit from 'p-limit'

const limit = pLimit(1)

let pageInfo: {
  url: string
  data?: MaxAPIResponse
} | null = null

export function getPageInfo() {
  return pageInfo
}

export async function fetchPageInfo(pathname: string): Promise<void> {
  await limit(async () => {
    if (pageInfo?.url === document.location.href)
      return

    pageInfo = { url: document.location.href }

    try {
      pageInfo.data = await fetch(
        `https://default.any-amer.prd.api.hbomax.com/cms/routes${pathname}?include=default&decorators=viewingHistory,isFavorite,contentAction,badges&page[items.size]=10`,
        {
          headers: {
            'x-device-info': 'hbomax/7.6.0 (desktop/desktop; Windows/NT 10.0; 177ff0d8-8ac4-4ab9-a39e-c14f2e98bb34/da0cdd94-5a39-42ef-aa68-54cbc1b852c3)',
            'x-disco-client': 'WEB:NT 10.0:hbomax:7.6.0',
            'x-disco-params': 'realm=bolt,bid=beam,features=ar',
          },
          method: 'GET',
          credentials: 'include',
        },
      ).then(res => res.json())
    }
    catch {
      pageInfo = null
    }
  })
}

export function clearPageInfo(): void {
  pageInfo = null
}

export type { IncludedItem }

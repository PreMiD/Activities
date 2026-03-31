import type { IncludedItem, MaxAPIResponse } from '../types.ts'
import pLimit from 'p-limit'

const limit = pLimit(1)

// eslint-disable-next-line import/no-mutable-exports
export let pageInfo: {
  url: string
  data?: MaxAPIResponse
} | null = null

export async function fetchPageInfo(pathname: string): Promise<void> {
  await limit(async () => {
    if (pageInfo?.url === document.location.href)
      return

    pageInfo = { url: document.location.href }

    try {
      pageInfo.data = await fetch(
        `https://default.any-amer.prd.api.hbomax.com/cms/routes${pathname}?include=default&page[items.size]=10`,
        {
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
import type { LoadResponses, ResponseNode } from '../types.js'
import { isEqual } from 'lodash'
import pLimit from 'p-limit'

const limit = pLimit(1)

// eslint-disable-next-line import/no-mutable-exports
export let responsesMetadata: {
  url: string
  data: {
    responseNode?: ResponseNode
    loadResponses?: LoadResponses
  }
  request: {
    responseNode?: {
      lastTimestamp: number
      rateLimited: boolean
    }
    loadResponses?: {
      lastTimestamp: number
      rateLimited: boolean
    }
  }
} = {
  url: document.location.href,
  data: {},
  request: {},
}

export async function fetchResponsesMetadata(id: string): Promise<void> {
  await limit(async () => {
    if (
      responsesMetadata.request.responseNode
      && responsesMetadata.request.responseNode.lastTimestamp + 10000 > Date.now()
    ) {
      return
    }

    if (
      responsesMetadata.request.responseNode?.rateLimited
      && responsesMetadata.request.responseNode.lastTimestamp + 60000 > Date.now()
    ) {
      return
    }

    const responseNodeResponse = await fetch(
      `https://grok.com/rest/app-chat/conversations/${id}/response-node`,
    )
    const responseNodeLastRequestTimestamp = Date.now()

    if (!responseNodeResponse.ok) {
      if (responseNodeResponse.status === 429) {
        responsesMetadata.request.responseNode = {
          lastTimestamp: responseNodeLastRequestTimestamp,
          rateLimited: true,
        }
      }
      else {
        responsesMetadata.request.responseNode = {
          lastTimestamp: responseNodeLastRequestTimestamp,
          rateLimited: false,
        }
      }
      return
    }
    responsesMetadata.request.responseNode = {
      lastTimestamp: responseNodeLastRequestTimestamp,
      rateLimited: false,
    }
    const responseNode: ResponseNode = await responseNodeResponse.json()

    if (
      responsesMetadata.url === document.location.href
      && responsesMetadata?.data.responseNode
      && isEqual(
        responsesMetadata.data.responseNode.responseNodes.map(
          node => node.responseId,
        ),
        responseNode.responseNodes.map(node => node.responseId),
      )
    ) {
      return
    }

    responsesMetadata.url = document.location.href
    responsesMetadata.data.responseNode = responseNode

    if (
      responsesMetadata.request.loadResponses
      && responsesMetadata.request.loadResponses.lastTimestamp + 10000 > Date.now()
    ) {
      return
    }

    if (
      responsesMetadata.request.loadResponses?.rateLimited
      && responsesMetadata.request.loadResponses.lastTimestamp + 60000 > Date.now()
    ) {
      return
    }

    const loadResponsesResponse = await fetch(
      `https://grok.com/rest/app-chat/conversations/${id}/load-responses`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseIds: responseNode.responseNodes.map(
            node => node.responseId,
          ),
        }),
      },
    )
    const loadResponsesLastRequestTimestamp = Date.now()

    if (!loadResponsesResponse.ok) {
      if (loadResponsesResponse.status === 429) {
        responsesMetadata.request.loadResponses = {
          lastTimestamp: loadResponsesLastRequestTimestamp,
          rateLimited: true,
        }
      }
      else {
        responsesMetadata.request.loadResponses = {
          lastTimestamp: loadResponsesLastRequestTimestamp,
          rateLimited: false,
        }
      }
      return
    }
    responsesMetadata.request.loadResponses = {
      lastTimestamp: loadResponsesLastRequestTimestamp,
      rateLimited: false,
    }
    const loadResponses: LoadResponses = await loadResponsesResponse.json()

    responsesMetadata.url = document.location.href
    responsesMetadata.data.loadResponses = loadResponses
  })
}

export function clearResponsesMetadata(): void {
  responsesMetadata = {
    url: document.location.href,
    data: {},
    request: {},
  }
}

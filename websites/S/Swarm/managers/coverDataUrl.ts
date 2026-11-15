let cache: { url: string, data: string } | null = null

const maxBytes = 8 * 1024 * 1024

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function swarmCoverToDataUrl(imageUrl: string): Promise<string | null> {
  if (cache?.url === imageUrl) {
    return cache.data
  }

  try {
    const res = await fetch(imageUrl, { credentials: 'omit', cache: 'force-cache' })
    if (!res.ok) {
      return null
    }
    const headerLen = Number(res.headers.get('content-length'))
    if (Number.isFinite(headerLen) && headerLen > maxBytes) {
      return null
    }
    const blob = await res.blob()
    if (blob.size > maxBytes) {
      return null
    }
    if (blob.type && !blob.type.startsWith('image/')) {
      return null
    }
    const data = await readBlobAsDataUrl(blob)
    cache = { url: imageUrl, data }
    return data
  }
  catch {
    return null
  }
}

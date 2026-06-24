import type { LineDetails, Root, TransportLine } from '../types.js'

const API_URL = 'https://gateway-apim.infotbm.com/maas-web/web/v9/timetables/lines'

let linesDataCache: Root | null = null
let fetchPromise: Promise<Root> | null = null

async function fetchLinesData(): Promise<Root> {
  if (linesDataCache) {
    return linesDataCache
  }

  if (fetchPromise) {
    return fetchPromise
  }

  fetchPromise = fetch(API_URL)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error : ${response.status}`)
      }
      return (await response.json()) as Root
    })
    .then((data) => {
      linesDataCache = data
      fetchPromise = null
      return data
    })
    .catch((error) => {
      fetchPromise = null
      throw error
    })

  return fetchPromise
}

export async function getSpecificLineInfos(code: string): Promise<LineDetails | null> {
  if (!code)
    return null

  try {
    const data = await fetchLinesData()
    const searchCode = code.trim().toUpperCase()

    for (const modeCategory of data.modes) {
      const foundLine = modeCategory.lines.find((line: TransportLine) =>
        line.code.toUpperCase() === searchCode,
      )

      if (foundLine && foundLine.iconUrl && foundLine.name) {
        return {
          name: foundLine.name,
          iconUrl: foundLine.iconUrl,
        }
      }
    }

    return null
  }
  catch (error) {
    console.error('Failed to fetch specific line infos :', error)
    return null
  }
}

import type { ActivityMetadata } from './ActivityCompiler.js'
import { Buffer } from 'node:buffer'
import { readFile, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import process from 'node:process'
import FormData from 'form-data'
import { globby } from 'globby'
import ky from 'ky'
import sharp from 'sharp'
import { getFolderLetter } from '../util/getFolderLetter.js'
import { getJsonPosition } from '../util/getJsonPosition.js'
import { error, exit } from '../util/log.js'
import { sanitazeFolderName } from '../util/sanitazeFolderName.js'
import { addSarifLog, SarifRuleId } from '../util/sarif.js'

export enum AssetType {
  Logo = 'logo',
  Thumbnail = 'thumbnail',
  ActivityAsset = 'ActivityAsset',
}

export enum MimeType {
  PNG = 'image/png',
  JPG = 'image/jpg',
  JPEG = 'image/jpeg',
  GIF = 'image/gif',
  WEBP = 'image/webp',
}
export const IMAGE_EXTENSIONS = [
  { extension: 'png', mimeType: MimeType.PNG },
  { extension: 'jpg', mimeType: MimeType.JPG },
  { extension: 'jpeg', mimeType: MimeType.JPEG },
  { extension: 'gif', mimeType: MimeType.GIF },
  { extension: 'webp', mimeType: MimeType.WEBP },
]

export interface Asset {
  type: AssetType
  url: string
  location: {
    filePath: string
    line: number
    column: number
  }
}

export interface FullAsset extends Asset {
  dimensions: {
    width: number
    height: number
  }
  mimeType: MimeType
}

export interface CdnActivityAsset {
  type: AssetType.ActivityAsset
  url: string
  mimeType: MimeType
  index: number
}

export type CdnAsset = {
  type: Exclude<AssetType, AssetType.ActivityAsset>
  url: string
  mimeType: MimeType
} | CdnActivityAsset

const CDN_BASE_URL = 'https://cdn.rcd.gg'

export class AssetsManager {
  constructor(
    public readonly cwd: string,
    public readonly activity: ActivityMetadata,
    public readonly versionized: boolean,
  ) { }

  private readonly imageCache = new Map<string, { width: number, height: number, mimeType: string }>()

  get baseUrl() {
    const service = encodeURIComponent(sanitazeFolderName(this.activity.service))
    const folderLetter = encodeURIComponent(getFolderLetter(this.activity.service))
    const version = this.versionized ? `/v${this.activity.apiVersion}` : ''
    return `${CDN_BASE_URL}/PreMiD/websites/${folderLetter}/${service}${version}/assets`
  }

  private async validateImageDimensions(dimensionAndType: { width: number, height: number }, asset: Asset, kill: boolean): Promise<boolean> {
    //* Thumbnail is allowed to have any size
    if (asset.type !== AssetType.Thumbnail && (dimensionAndType.width !== 512 || dimensionAndType.height !== 512)) {
      const message = `Image URL dimensions must be exactly 512x512 pixels, got ${dimensionAndType.width}x${dimensionAndType.height} for URL: ${asset.url}`
      return this.handleValidationError(message, asset, kill, SarifRuleId.imageSizeCheck)
    }
    return true
  }

  private async validateImageMimeType(dimensionAndType: { mimeType: string }, asset: Asset, kill: boolean): Promise<boolean> {
    if (!IMAGE_EXTENSIONS.some(ext => dimensionAndType.mimeType === ext.extension)) {
      const message = `Image URL has an invalid MIME type (allowed: ${IMAGE_EXTENSIONS.map(ext => ext.extension).join(', ')}), got ${dimensionAndType.mimeType} for URL: ${asset.url}`
      return this.handleValidationError(message, asset, kill, SarifRuleId.imageMimeTypeCheck)
    }
    return true
  }

  private handleValidationError(message: string, asset: Asset, kill: boolean, ruleId: SarifRuleId): boolean {
    if (kill) {
      exit(message)
    }

    error(message)
    addSarifLog({
      path: asset.location.filePath,
      message,
      ruleId,
      position: {
        line: asset.location.line,
        column: asset.location.column,
      },
    })
    return false
  }

  async validateImage({ asset, kill }: {
    asset: Asset
    kill: boolean
  }) {
    let dimensionAndType = this.imageCache.get(asset.url)

    if (!dimensionAndType) {
      try {
        const response = await ky.get(asset.url.replaceAll(/\\/g, '')).arrayBuffer()
        const metadata = await sharp(Buffer.from(response)).metadata()
        if (!metadata.width || !metadata.height || !metadata.format) {
          throw new Error('Could not get image metadata')
        }
        dimensionAndType = { width: metadata.width, height: metadata.height, mimeType: metadata.format }
        this.imageCache.set(asset.url, dimensionAndType)
      }
      catch (err: unknown) {
        const message = `Failed to validate image URL (${asset.url}): ${err instanceof Error ? err.message : String(err)}`
        return this.handleValidationError(message, asset, kill, SarifRuleId.imageSizeCheck)
      }
    }

    const dimensionsValid = await this.validateImageDimensions(dimensionAndType, asset, kill)
    if (!dimensionsValid)
      return false

    return this.validateImageMimeType(dimensionAndType, asset, kill)
  }

  async getAssets(): Promise<Asset[]> {
    const logo: Asset = {
      type: AssetType.Logo,
      url: this.activity.logo,
      location: {
        filePath: resolve(this.cwd, 'metadata.json'),
        ...await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'logo'),
      },
    }
    const thumbnail: Asset = {
      type: AssetType.Thumbnail,
      url: this.activity.thumbnail,
      location: {
        filePath: resolve(this.cwd, 'metadata.json'),
        ...await getJsonPosition(resolve(this.cwd, 'metadata.json'), 'thumbnail'),
      },
    }

    const assets: Asset[] = [logo, thumbnail]

    //* Check image URLs in TypeScript files
    const tsFiles = await globby('**/*.ts', { cwd: this.cwd, absolute: true })

    for (const file of tsFiles) {
      const content = await readFile(file, 'utf-8')
      const imageUrlRegex = /(?<=["'`])(https?:\/\/.*?\.(?:png|jpg|jpeg|gif|webp)(?:\?[^'"`]+)?)(?=["'`])/g
      const matches = content.matchAll(imageUrlRegex)

      for (const match of matches) {
        //* If the url contains a template literal, skip it
        if (match[1].includes('${'))
          continue

        //* Skip URLs that are concatenated with strings (e.g., "https://" + "example.com/image.png")
        if (/(?<=\+ )["'`].*?["'`]/.test(match[1]))
          continue

        //* Skip URLs that are followed by string methods (e.g., "https://example.com/image.png").toLowerCase())
        if (/(?<!\\)["'`]\)?\./.test(match[1])) {
          continue
        }

        const url = match[1]
        const line = content.substring(0, match.index).split('\n').length
        const column = match.index - content.lastIndexOf('\n', match.index) - 1

        assets.push({
          type: AssetType.ActivityAsset,
          url,
          location: {
            filePath: file,
            line,
            column,
          },
        })
      }
    }

    return assets
  }

  async getCdnAssets(): Promise<CdnAsset[]> {
    const assets: CdnAsset[] = []

    const [logo, thumbnail] = await Promise.all([
      this.doesExistAnyExtension(`${this.baseUrl}/logo`),
      this.doesExistAnyExtension(`${this.baseUrl}/thumbnail`),
    ])

    if (logo.success) {
      assets.push({
        type: AssetType.Logo,
        url: logo.url,
        mimeType: logo.mimeType,
      })
    }

    if (thumbnail.success) {
      assets.push({
        type: AssetType.Thumbnail,
        url: thumbnail.url,
        mimeType: thumbnail.mimeType,
      })
    }

    let index = 0
    while (true) {
      const asset = await this.doesExistAnyExtension(`${this.baseUrl}/${index}`)
      if (asset.success) {
        assets.push({
          type: AssetType.ActivityAsset,
          url: asset.url,
          mimeType: asset.mimeType,
          index,
        })
        index++
      }
      else {
        break
      }
    }

    return assets
  }

  private async doesAssetExist(url: string): Promise<boolean> {
    return await ky.head(url).then(response => response.ok).catch(() => false)
  }

  private async doesExistAnyExtension(url: string): Promise<{
    success: true
    mimeType: MimeType
    url: string
  } | {
    success: false
  }> {
    for (const { extension, mimeType } of IMAGE_EXTENSIONS) {
      const urlWithExtension = `${url}.${extension}`
      if (await this.doesAssetExist(urlWithExtension)) {
        return {
          success: true,
          mimeType,
          url: urlWithExtension,
        }
      }
    }

    return {
      success: false,
    }
  }

  private getExtensionFromUrl(url: string): string {
    return extname(new URL(url).pathname)
  }

  private getMimeTypeFromExtension(extension: string): MimeType {
    const mimeType = IMAGE_EXTENSIONS.find(ext => ext.extension === extension)?.mimeType
    if (!mimeType) {
      throw new Error(`Invalid extension: ${extension}`)
    }

    return mimeType
  }

  private findMissing(numbers: number[]) {
    numbers.push(-1) // ? Make sure there is at least one number in the array
    const max = Math.max(...numbers)
    const min = Math.min(...numbers)
    const missing = []

    for (let i = min; i <= max; i++) {
      if (!numbers.includes(i))
        missing.push(i)
    }

    return missing
  }

  //* Handles updates for logo and thumbnail assets
  private async handleStaticAssetUpdate(
    assetType: AssetType.Logo | AssetType.Thumbnail,
    asset: Asset | undefined,
    cdnAsset: CdnAsset | undefined,
    toBeUploaded: Map<string, { url: string, method: 'POST' | 'PUT' }>,
    toBeDeleted: Set<string>,
  ) {
    if (asset) {
      const extension = this.getExtensionFromUrl(asset.url)
      const mimeType = this.getMimeTypeFromExtension(extension.slice(1))
      const newAsset = `${this.baseUrl}/${assetType}${extension}`

      if (!cdnAsset) {
        toBeUploaded.set(asset.url, {
          url: newAsset,
          method: 'POST',
        })
      }
      else if (asset.url !== cdnAsset.url) {
        const method = mimeType === cdnAsset.mimeType ? 'PUT' : 'POST'
        if (method !== 'PUT') {
          toBeDeleted.add(cdnAsset.url)
        }
        toBeUploaded.set(asset.url, {
          url: newAsset,
          method,
        })
      }
    }
    else if (cdnAsset) {
      toBeDeleted.add(cdnAsset.url)
    }
  }

  private async handleActivityAssetsUpdate(
    activityAssets: Asset[],
    cdnActivityAssets: CdnActivityAsset[],
    logo: Asset | undefined,
    toBeUploaded: Map<string, { url: string, method: 'POST' | 'PUT' }>,
    toBeDeleted: Set<string>,
    toBeMoved: Map<string, { url: string, method: 'POST' }>,
  ) {
    const cdnAssetsInUse = new Map<number, string>()
    const usedIndexes = new Set<number>()

    for (const { index, url } of cdnActivityAssets) {
      if (activityAssets.some(asset => asset.url === url)) {
        cdnAssetsInUse.set(index, url)
        usedIndexes.add(index)
      }
      else {
        toBeDeleted.add(url)
      }
    }

    const newAssets = new Set<string>()
    for (const { url } of activityAssets) {
      if (url === logo?.url)
        continue
      if (new URL(url).origin !== CDN_BASE_URL) {
        newAssets.add(url)
      }
    }

    let index = 0
    for (const asset of newAssets) {
      while (usedIndexes.has(index)) index++
      const newAsset = `${this.baseUrl}/${index}${this.getExtensionFromUrl(asset)}`
      toBeUploaded.set(asset, {
        url: newAsset,
        method: 'POST',
      })
      usedIndexes.add(index)
      index++
    }

    const missingIndexes = this.findMissing([...usedIndexes])
    if (missingIndexes.length) {
      const cdnAssetsInUseArray = [...cdnAssetsInUse].sort(([a], [b]) => a - b)
      for (const index of missingIndexes) {
        const last = cdnAssetsInUseArray.pop()
        if (!last)
          break
        const [_, asset] = last
        const newAsset = `${this.baseUrl}/${index}${this.getExtensionFromUrl(asset)}`
        toBeMoved.set(asset, {
          url: newAsset,
          method: 'POST',
        })
      }
    }
  }

  private isActivityAsset(asset: CdnAsset): asset is CdnActivityAsset {
    return asset.type === AssetType.ActivityAsset
  }

  async updateCdnAssets(): Promise<number> {
    const toBeUploaded = new Map<string, { url: string, method: 'POST' | 'PUT' }>()
    const toBeDeleted = new Set<string>()
    const toBeMoved = new Map<string, { url: string, method: 'POST' }>()

    const assets = await this.getAssets()
    const cdnAssets = await this.getCdnAssets()

    const logo = assets.find(asset => asset.type === AssetType.Logo)
    const logoCdn = cdnAssets.find(asset => asset.type === AssetType.Logo)
    const thumbnail = assets.find(asset => asset.type === AssetType.Thumbnail)
    const thumbnailCdn = cdnAssets.find(asset => asset.type === AssetType.Thumbnail)

    await this.handleStaticAssetUpdate(AssetType.Logo, logo, logoCdn, toBeUploaded, toBeDeleted)
    await this.handleStaticAssetUpdate(AssetType.Thumbnail, thumbnail, thumbnailCdn, toBeUploaded, toBeDeleted)

    const activityAssets = assets.filter(asset => asset.type === AssetType.ActivityAsset)
    const cdnActivityAssets = cdnAssets.filter(this.isActivityAsset)

    await this.handleActivityAssetsUpdate(activityAssets, cdnActivityAssets, logo, toBeUploaded, toBeDeleted, toBeMoved)

    if (toBeDeleted.size) {
      await this.deleteAssets(toBeDeleted)
    }

    if (toBeMoved.size) {
      await this.uploadAssets(toBeMoved)
      await this.deleteAssets([...toBeMoved.keys()])

      await this.replaceInFiles(toBeMoved)
    }

    if (toBeUploaded.size) {
      await this.uploadAssets(toBeUploaded)

      await this.replaceInFiles(toBeUploaded)
    }

    //* Return the number of assets updated
    return toBeUploaded.size + toBeMoved.size + toBeDeleted.size
  }

  private async deleteAssets(urls: string[] | Set<string>) {
    await Promise.all(
      Array.from(urls).map(url => ky.delete(url, {
        headers: {
          Authorization: process.env.CDN_TOKEN,
        },
      }).catch(() => { })),
    )
  }

  private async uploadAssets(urls: Map<string, {
    url: string
    method: 'POST' | 'PUT'
  }>) {
    await Promise.all(
      Array.from(urls).map(async ([url, { url: newUrl, method }]) => {
        const response = await ky.get(url).arrayBuffer()
        const form = new FormData()
        form.append('file', Buffer.from(response), {
          contentType: this.getMimeTypeFromExtension(this.getExtensionFromUrl(url).slice(1)),
        })

        await ky(newUrl, {
          method,
          headers: {
            Authorization: process.env.CDN_TOKEN,
            ...form.getHeaders(),
          },
          body: form.getBuffer(),
        })
      }),
    )
  }

  private async replaceInFiles(assets: Map<string, { url: string }>) {
    const replacements = new Map<string, string>(
      Array.from(assets).map(([url, { url: newUrl }]) => [url, newUrl]),
    )

    for (const file of await globby('**/*.ts', { cwd: this.cwd, absolute: true })) {
      let content = await readFile(file, 'utf-8')
      let changed = false
      for (const [oldUrl, newUrl] of replacements) {
        if (!content.includes(oldUrl))
          continue
        content = content.replaceAll(oldUrl, newUrl)
        changed = true
      }

      if (changed)
        await writeFile(file, content, 'utf-8')
    }

    let metadata = await readFile(resolve(this.cwd, 'metadata.json'), 'utf-8')
    let changed = false
    for (const [oldUrl, newUrl] of replacements) {
      if (!metadata.includes(oldUrl))
        continue
      metadata = metadata.replaceAll(oldUrl, newUrl)
      changed = true
    }

    if (changed)
      await writeFile(resolve(this.cwd, 'metadata.json'), metadata, 'utf-8')
  }

  async deleteCdnAssets(): Promise<number> {
    const cdnAssets = await this.getCdnAssets()
    await this.deleteAssets(cdnAssets.map(asset => asset.url))
    return cdnAssets.length
  }
}

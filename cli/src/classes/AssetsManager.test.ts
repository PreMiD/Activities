import type { ActivityMetadata } from './ActivityCompiler.js'
import type { CdnAsset } from './AssetsManager.js'
import { Buffer } from 'node:buffer'
import { ReadStream } from 'node:fs'
import { Readable } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AssetsManager, AssetType, MimeType } from './AssetsManager.js'

const mocks = vi.hoisted(() => ({
  globby: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  got: Object.assign(
    vi.fn(),
    {
      get: vi.fn(),
      head: vi.fn(),
      delete: vi.fn().mockImplementation(() => Promise.resolve()),
      stream: vi.fn(),
    },
  ),
  sharp: vi.fn(),

  formData: vi.fn().mockImplementation(function () {
    const appendSpy = vi.fn()
    this.append = appendSpy
    this.getHeaders = vi.fn().mockReturnValue({ 'content-type': 'multipart/form-data' })
    this.getBuffer = vi.fn().mockReturnValue(Buffer.from('mock-buffer'))
    //* Track the last appended values for assertions
    this._lastAppended = () => appendSpy.mock.calls[appendSpy.mock.calls.length - 1]
  }),
}))

//* Mock external dependencies
vi.mock('got', () => ({
  default: mocks.got,
}))

vi.mock('sharp', () => ({
  default: mocks.sharp,
}))

vi.mock('globby', () => ({
  globby: mocks.globby,
}))

vi.mock('node:fs/promises', () => ({
  readFile: mocks.readFile,
  writeFile: mocks.writeFile,
}))

vi.mock('form-data', () => {
  return {
    __esModule: true,
    default: mocks.formData,
  }
})

const mockActivity: ActivityMetadata = {
  service: 'TestService',
  apiVersion: 1,
  version: '1.0.0',
  logo: 'https://example.com/logo.png',
  thumbnail: 'https://example.com/thumbnail.png',
  description: {
    en: 'Test description',
  },
  tags: ['test', 'activity'],
}

describe('assetsManager', () => {
  let assetsManager: AssetsManager

  beforeEach(() => {
    vi.clearAllMocks()
    assetsManager = new AssetsManager('/test/path', mockActivity, true)
  })

  describe('baseUrl', () => {
    it('should generate correct base URL with API version', () => {
      const expectedUrl = 'https://cdn.rcd.gg/PreMiD/websites/T/TestService/v1/assets'
      expect(assetsManager.baseUrl).toBe(expectedUrl)
    })

    it('should generate correct base URL without API version', () => {
      assetsManager = new AssetsManager('/test/path', mockActivity, false)
      const expectedUrl = 'https://cdn.rcd.gg/PreMiD/websites/T/TestService/assets'
      expect(assetsManager.baseUrl).toBe(expectedUrl)
    })
  })

  describe('validateImage', () => {
    it('should validate correct 512x512 image', async () => {
      const mockAsset = {
        type: AssetType.Logo,
        url: 'https://example.com/valid.png',
        location: { filePath: 'test.json', line: 1, column: 1 },
      }

      //* Mock image validation responses
      mocks.got.get.mockReturnValue({
        buffer: () => Promise.resolve(Buffer.from('mock-buffer')),
      } as any)

      mocks.sharp.mockReturnValue({
        metadata: () => Promise.resolve({
          width: 512,
          height: 512,
          format: 'png',
        }),
      } as any)

      const result = await assetsManager.validateImage({ asset: mockAsset, kill: false })
      expect(result).toBe(true)
    })

    it('should reject image with wrong dimensions', async () => {
      const mockAsset = {
        type: AssetType.Logo,
        url: 'https://example.com/invalid.png',
        location: { filePath: 'test.json', line: 1, column: 1 },
      }

      mocks.got.get.mockReturnValue({
        buffer: () => Promise.resolve(Buffer.from('mock-buffer')),
      } as any)

      mocks.sharp.mockReturnValue({
        metadata: () => Promise.resolve({
          width: 256,
          height: 256,
          format: 'png',
        }),
      } as any)

      mocks.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('package.json')) {
          return Promise.resolve(JSON.stringify({ version: '1.0.0' }))
        }
        return Promise.resolve('')
      })

      const result = await assetsManager.validateImage({ asset: mockAsset, kill: false })
      expect(result).toBe(false)
    })

    it('should reject image with wrong MIME type', async () => {
      const mockAsset = {
        type: AssetType.Logo,
        url: 'https://example.com/invalid.svg',
        location: { filePath: 'test.json', line: 1, column: 1 },
      }

      mocks.got.get.mockReturnValue({
        buffer: () => Promise.resolve(Buffer.from('mock-buffer')),
      } as any)

      mocks.sharp.mockReturnValue({
        metadata: () => Promise.resolve({
          width: 512,
          height: 512,
          format: 'svg',
        }),
      } as any)

      const result = await assetsManager.validateImage({ asset: mockAsset, kill: false })
      expect(result).toBe(false)
    })
  })

  describe('getAssets', () => {
    beforeEach(() => {
      mocks.globby.mockReset()
      mocks.readFile.mockReset()
    })

    it('should return logo and thumbnail assets', async () => {
      mocks.globby.mockResolvedValue([])
      mocks.readFile.mockImplementation((filePath) => {
        if (filePath.endsWith('metadata.json')) {
          return Promise.resolve(JSON.stringify(mockActivity))
        }
        return Promise.resolve('')
      })

      const assets = await assetsManager.getAssets()

      expect(assets).toHaveLength(2)
      expect(assets[0]).toEqual(expect.objectContaining({
        type: AssetType.Logo,
        url: mockActivity.logo,
      }))
      expect(assets[1]).toEqual(expect.objectContaining({
        type: AssetType.Thumbnail,
        url: mockActivity.thumbnail,
      }))
    })

    it('should find image URLs in TypeScript files', async () => {
      mocks.globby.mockResolvedValue(['test.ts'])
      mocks.readFile.mockImplementation((filePath) => {
        if (filePath === 'test.ts') {
          return Promise.resolve(`
            const img = "https://example.com/image.png"
            const img2 = 'https://example.com/image2.jpg'
          `)
        }
        if (filePath.endsWith('metadata.json')) {
          return Promise.resolve(JSON.stringify(mockActivity))
        }
        return Promise.resolve('')
      })

      const assets = await assetsManager.getAssets()
      expect(assets).toHaveLength(4) //* Logo, thumbnail, and 2 activity assets
      expect(assets[2]).toEqual(expect.objectContaining({
        type: AssetType.ActivityAsset,
        url: 'https://example.com/image.png',
      }))
      expect(assets[3]).toEqual(expect.objectContaining({
        type: AssetType.ActivityAsset,
        url: 'https://example.com/image2.jpg',
      }))
    })

    it('should return both static and activity assets', async () => {
      mocks.globby.mockResolvedValue(['test.ts'])
      mocks.readFile.mockImplementation((filePath) => {
        if (filePath === 'test.ts') {
          return Promise.resolve(`
            const img = "https://example.com/image.png"
            const img2 = 'https://example.com/image2.jpg'
          `)
        }
        if (filePath.endsWith('metadata.json')) {
          return Promise.resolve(JSON.stringify(mockActivity))
        }
        return Promise.resolve('')
      })

      const assets = await assetsManager.getAssets()
      expect(assets).toHaveLength(4) //* Logo, thumbnail, and 2 activity assets
      expect(assets[0]).toEqual(expect.objectContaining({
        type: AssetType.Logo,
        url: mockActivity.logo,
      }))
      expect(assets[1]).toEqual(expect.objectContaining({
        type: AssetType.Thumbnail,
        url: mockActivity.thumbnail,
      }))
      expect(assets[2]).toEqual(expect.objectContaining({
        type: AssetType.ActivityAsset,
        url: 'https://example.com/image.png',
      }))
      expect(assets[3]).toEqual(expect.objectContaining({
        type: AssetType.ActivityAsset,
        url: 'https://example.com/image2.jpg',
      }))
    })
  })

  describe('getCdnAssets', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return empty array when no assets exist on CDN', async () => {
      //* Mock head requests to return 404
      mocks.got.head.mockRejectedValue(new Error('Not found'))

      const assets = await assetsManager.getCdnAssets()
      expect(assets).toHaveLength(0)
    })

    it('should return logo and thumbnail when they exist', async () => {
      //* Mock successful head requests for logo and thumbnail
      mocks.got.head.mockImplementation((url) => {
        const urlStr = url.toString()
        if (urlStr.includes('logo.png') || urlStr.includes('thumbnail.png')) {
          return Promise.resolve({ statusCode: 200, ok: true })
        }
        return Promise.reject(new Error('Not found'))
      })

      const assets = await assetsManager.getCdnAssets()
      expect(assets).toHaveLength(2)
      expect(assets[0]).toEqual({
        type: AssetType.Logo,
        url: `${assetsManager.baseUrl}/logo.png`,
        mimeType: MimeType.PNG,
      })
      expect(assets[1]).toEqual({
        type: AssetType.Thumbnail,
        url: `${assetsManager.baseUrl}/thumbnail.png`,
        mimeType: MimeType.PNG,
      })
    })

    it('should return activity assets with sequential indices', async () => {
      //* Mock head requests to return success for first 3 activity assets and fail for the 4th
      mocks.got.head.mockImplementation((url) => {
        const urlStr = url.toString()
        if (urlStr.includes('0.png') || urlStr.includes('1.jpg') || urlStr.includes('2.gif')) {
          return Promise.resolve({ statusCode: 200, ok: true })
        }
        return Promise.reject(new Error('Not found'))
      })

      const assets = await assetsManager.getCdnAssets()
      expect(assets).toHaveLength(3)
      expect(assets).toEqual([
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/0.png`,
          mimeType: MimeType.PNG,
          index: 0,
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/1.jpg`,
          mimeType: MimeType.JPG,
          index: 1,
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/2.gif`,
          mimeType: MimeType.GIF,
          index: 2,
        },
      ])
    })

    it('should return both static and activity assets', async () => {
      //* Mock head requests to return success for first 3 activity assets and fail for the 4th
      mocks.got.head.mockImplementation((url) => {
        const urlStr = url.toString()
        if (
          urlStr.includes('0.png')
          || urlStr.includes('1.jpg')
          || urlStr.includes('2.gif')
          || urlStr.includes('logo.webp')
          || urlStr.includes('thumbnail.jpeg')
        ) {
          return Promise.resolve({ statusCode: 200, ok: true })
        }
        return Promise.reject(new Error('Not found'))
      })

      const assets = await assetsManager.getCdnAssets()
      expect(assets).toHaveLength(5)
      expect(assets).toEqual([
        {
          type: AssetType.Logo,
          url: `${assetsManager.baseUrl}/logo.webp`,
          mimeType: MimeType.WEBP,
        },
        {
          type: AssetType.Thumbnail,
          url: `${assetsManager.baseUrl}/thumbnail.jpeg`,
          mimeType: MimeType.JPEG,
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/0.png`,
          mimeType: MimeType.PNG,
          index: 0,
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/1.jpg`,
          mimeType: MimeType.JPG,
          index: 1,
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/2.gif`,
          mimeType: MimeType.GIF,
          index: 2,
        },
      ])
    })
  })

  describe('updateCdnAssets', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      process.env.CDN_TOKEN = 'test-token'

      //* Mock got direct calls for file uploads
      mocks.got.mockImplementation((url, options) => {
        if (options?.method === 'POST' || options?.method === 'PUT') {
          return Promise.resolve({ statusCode: 200, ok: true })
        }
        return Promise.reject(new Error('Unexpected got call'))
      })

      //* Ensure all got methods return promises
      mocks.got.delete.mockImplementation(() => Promise.resolve({ statusCode: 200, ok: true }))
      mocks.got.head.mockImplementation(() => Promise.resolve({ statusCode: 200, ok: true }))
      mocks.got.get.mockImplementation(() => ({
        buffer: () => Promise.resolve(Buffer.from('mock-buffer')),
      }))
      mocks.got.stream.mockReturnValue(new Readable({
        read() {
          this.push(null)
        },
      }))

      //* Mock globby to return some TypeScript files
      mocks.globby.mockResolvedValue(['test.ts', 'metadata.json'])
    })

    it('should handle new logo and thumbnail upload and update files', async () => {
      const mockAssets = [
        {
          type: AssetType.Logo,
          url: 'https://example.com/new-logo.png',
          location: { filePath: 'test.json', line: 1, column: 1 },
        },
        {
          type: AssetType.Thumbnail,
          url: 'https://example.com/new-thumbnail.jpg',
          location: { filePath: 'test.json', line: 2, column: 1 },
        },
      ]

      //* Mock getAssets to return our test assets
      vi.spyOn(assetsManager, 'getAssets').mockResolvedValue(mockAssets)
      //* Mock getCdnAssets to return empty array (no existing assets)
      vi.spyOn(assetsManager, 'getCdnAssets').mockResolvedValue([])

      //* Mock successful image downloads
      mocks.got.get.mockReturnValue({
        buffer: () => Promise.resolve(Buffer.from('mock-buffer')),
      } as any)

      //* Mock file content with URLs that need to be replaced
      mocks.readFile.mockImplementation((filePath: string) => {
        if (filePath.endsWith('test.ts')) {
          return Promise.resolve(`
            const logo = "https://example.com/new-logo.png"
            const thumbnail = 'https://example.com/new-thumbnail.jpg'
          `)
        }
        if (filePath.endsWith('metadata.json')) {
          return Promise.resolve(`{
            "logo": "https://example.com/new-logo.png",
            "thumbnail": "https://example.com/new-thumbnail.jpg"
          }`)
        }
        return Promise.resolve('')
      })

      const result = await assetsManager.updateCdnAssets()

      //* Verify number of changed assets (2 new uploads)
      expect(result).toBe(2)

      //* Verify upload calls were made for both assets
      expect(mocks.got).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/logo.png`,
        expect.objectContaining({ method: 'POST' }),
      )
      expect(mocks.got).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/thumbnail.jpg`,
        expect.objectContaining({ method: 'POST' }),
      )

      //* Verify FormData was used correctly
      expect(mocks.formData).toHaveBeenCalledTimes(2)
      const formInstances = mocks.formData.mock.results
      expect(formInstances[0].value._lastAppended()).toEqual([
        'file',
        expect.any(ReadStream),
        { contentType: MimeType.PNG },
      ])
      expect(formInstances[1].value._lastAppended()).toEqual([
        'file',
        expect.any(ReadStream),
        { contentType: MimeType.JPG },
      ])

      //* Verify file content updates
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test\.ts$/),
        `
            const logo = "${assetsManager.baseUrl}/logo.png"
            const thumbnail = '${assetsManager.baseUrl}/thumbnail.jpg'
          `,
        'utf-8',
      )
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/metadata\.json$/),
        `{
            "logo": "${assetsManager.baseUrl}/logo.png",
            "thumbnail": "${assetsManager.baseUrl}/thumbnail.jpg"
          }`,
        'utf-8',
      )
    })

    it('should handle updating existing assets with different extensions and update files', async () => {
      const mockAssets = [
        {
          type: AssetType.Logo,
          url: 'https://example.com/logo.jpg',
          location: { filePath: 'test.json', line: 1, column: 1 },
        },
      ]

      const mockCdnAssets: CdnAsset[] = [{
        type: AssetType.Logo as const,
        url: `${assetsManager.baseUrl}/logo.png`,
        mimeType: MimeType.PNG,
      }]

      vi.spyOn(assetsManager, 'getAssets').mockResolvedValue(mockAssets)
      vi.spyOn(assetsManager, 'getCdnAssets').mockResolvedValue(mockCdnAssets)

      mocks.got.get.mockReturnValue({
        buffer: () => Promise.resolve(Buffer.from('mock-buffer')),
      } as any)

      //* Mock file content with URLs that need to be replaced
      mocks.readFile.mockImplementation((filePath: string) => {
        if (filePath.endsWith('test.ts')) {
          return Promise.resolve(`const logo = "https://example.com/logo.jpg"`)
        }
        if (filePath.endsWith('metadata.json')) {
          return Promise.resolve(`{"logo": "https://example.com/logo.jpg"}`)
        }
        return Promise.resolve('')
      })

      const result = await assetsManager.updateCdnAssets()

      //* Verify number of changed assets (1 deletion + 1 upload)
      expect(result).toBe(2)

      //* Verify old asset is deleted and new one is uploaded
      expect(mocks.got.delete).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/logo.png`,
        expect.any(Object),
      )
      expect(mocks.got).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/logo.jpg`,
        expect.objectContaining({ method: 'POST' }),
      )

      //* Verify file content updates
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test\.ts$/),
        `const logo = "${assetsManager.baseUrl}/logo.jpg"`,
        'utf-8',
      )
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/metadata\.json$/),
        `{"logo": "${assetsManager.baseUrl}/logo.jpg"}`,
        'utf-8',
      )
    })

    it('should handle activity assets with gaps in indices and update files', async () => {
      const mockAssets = [
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/0.png`,
          location: { filePath: '0.png', line: 1, column: 1 },
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/2.png`,
          location: { filePath: '2.png', line: 2, column: 1 },
        },
      ]

      const mockCdnAssets: CdnAsset[] = [
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/0.png`,
          mimeType: MimeType.PNG,
          index: 0,
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/2.png`,
          mimeType: MimeType.PNG,
          index: 2,
        },
      ]

      vi.spyOn(assetsManager, 'getAssets').mockResolvedValue(mockAssets)
      vi.spyOn(assetsManager, 'getCdnAssets').mockResolvedValue(mockCdnAssets)

      mocks.got.get.mockReturnValue({
        buffer: () => Promise.resolve(Buffer.from('mock-buffer')),
      } as any)

      //* Mock file content with URLs that need to be replaced
      mocks.readFile.mockImplementation((filePath: string) => {
        if (filePath.endsWith('test.ts')) {
          return Promise.resolve(`
            const img1 = "${assetsManager.baseUrl}/0.png"
            const img2 = "${assetsManager.baseUrl}/2.png"
          `)
        }
        if (filePath.endsWith('metadata.json')) {
          return Promise.resolve(`{
            "images": [
              "${assetsManager.baseUrl}/0.png",
              "${assetsManager.baseUrl}/2.png"
            ]
          }`)
        }
        return Promise.resolve('')
      })

      const result = await assetsManager.updateCdnAssets()

      //* Verify number of changed assets (1 move operation)
      expect(result).toBe(1)

      //* Verify asset at index 2 is moved to index 1
      expect(mocks.got).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/1.png`,
        expect.objectContaining({ method: 'POST' }),
      )
      expect(mocks.got.delete).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/2.png`,
        expect.any(Object),
      )

      //* Verify file content updates
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test\.ts$/),
        `
            const img1 = "${assetsManager.baseUrl}/0.png"
            const img2 = "${assetsManager.baseUrl}/1.png"
          `,
        'utf-8',
      )
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/metadata\.json$/),
        `{
            "images": [
              "${assetsManager.baseUrl}/0.png",
              "${assetsManager.baseUrl}/1.png"
            ]
          }`,
        'utf-8',
      )
    })

    it('should handle deletion of unused assets and update files', async () => {
      const mockAssets = [
        {
          type: AssetType.Logo,
          url: `${assetsManager.baseUrl}/logo.png`,
          location: { filePath: 'test.json', line: 1, column: 1 },
        },
      ]

      const mockCdnAssets: CdnAsset[] = [
        {
          type: AssetType.Logo as const,
          url: `${assetsManager.baseUrl}/logo.png`,
          mimeType: MimeType.PNG,
        },
        {
          type: AssetType.Thumbnail as const,
          url: `${assetsManager.baseUrl}/thumbnail.png`,
          mimeType: MimeType.PNG,
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/0.png`,
          mimeType: MimeType.PNG,
          index: 0,
        },
      ]

      vi.spyOn(assetsManager, 'getAssets').mockResolvedValue(mockAssets)
      vi.spyOn(assetsManager, 'getCdnAssets').mockResolvedValue(mockCdnAssets)

      mocks.got.get.mockReturnValue({
        buffer: () => Promise.resolve(Buffer.from('mock-buffer')),
      } as any)

      //* Mock file content with URLs that need to be replaced
      mocks.readFile.mockImplementation((filePath: string) => {
        if (filePath.endsWith('test.ts')) {
          return Promise.resolve(`
            const logo = "${assetsManager.baseUrl}/logo.png"
            const thumbnail = "${assetsManager.baseUrl}/thumbnail.png"
            const img = "${assetsManager.baseUrl}/0.png"
          `)
        }
        if (filePath.endsWith('metadata.json')) {
          return Promise.resolve(`{
            "logo": "${assetsManager.baseUrl}/logo.png",
            "thumbnail": "${assetsManager.baseUrl}/thumbnail.png",
            "images": ["${assetsManager.baseUrl}/0.png"]
          }`)
        }
        return Promise.resolve('')
      })

      const result = await assetsManager.updateCdnAssets()

      //* Verify number of changed assets (2 deletions)
      expect(result).toBe(2)

      //* Verify unused assets are deleted
      expect(mocks.got.delete).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/thumbnail.png`,
        expect.any(Object),
      )
      expect(mocks.got.delete).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/0.png`,
        expect.any(Object),
      )

      //* No file updates should occur since we're only deleting
      expect(mocks.writeFile).not.toHaveBeenCalled()
    })

    it('should handle new activity assets upload and update files', async () => {
      const mockAssets = [
        {
          type: AssetType.ActivityAsset,
          url: 'https://example.com/new-asset.png',
          location: { filePath: 'test.json', line: 1, column: 1 },
        },
      ]

      vi.spyOn(assetsManager, 'getAssets').mockResolvedValue(mockAssets)
      vi.spyOn(assetsManager, 'getCdnAssets').mockResolvedValue([])

      mocks.got.get.mockReturnValue({
        buffer: () => Promise.resolve(Buffer.from('mock-buffer')),
      } as any)

      //* Mock file content with URLs that need to be replaced
      mocks.readFile.mockImplementation((filePath: string) => {
        if (filePath.endsWith('test.ts')) {
          return Promise.resolve(`const img = "https://example.com/new-asset.png"`)
        }
        if (filePath.endsWith('metadata.json')) {
          return Promise.resolve(`{"image": "https://example.com/new-asset.png", "version": "1.0.0"}`)
        }
        return Promise.resolve('')
      })

      const result = await assetsManager.updateCdnAssets()

      //* Verify number of changed assets (1 new upload)
      expect(result).toBe(1)

      //* Verify new activity asset is uploaded with index 0
      expect(mocks.got).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/0.png`,
        expect.objectContaining({ method: 'POST' }),
      )

      //* Verify file content updates
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/test\.ts$/),
        `const img = "${assetsManager.baseUrl}/0.png"`,
        'utf-8',
      )
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/metadata\.json$/),
        `{"image": "${assetsManager.baseUrl}/0.png", "version": "1.0.0"}`,
        'utf-8',
      )

      //* With old image as we didn't actually write it due to the mocking
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/metadata\.json$/),
        `{\n  "image": "https://example.com/new-asset.png",\n  "version": "1.0.1"\n}`,
        'utf-8',
      )
    })

    it('should not perform any uploads or file updates when assets have not changed', async () => {
      const mockAssets = [
        {
          type: AssetType.Logo,
          url: `${assetsManager.baseUrl}/logo.png`,
          location: { filePath: 'test.json', line: 1, column: 1 },
        },
        {
          type: AssetType.Thumbnail,
          url: `${assetsManager.baseUrl}/thumbnail.jpg`,
          location: { filePath: 'test.json', line: 2, column: 1 },
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/0.webp`,
          location: { filePath: 'test.ts', line: 1, column: 1 },
        },
      ]

      const mockCdnAssets: CdnAsset[] = [
        {
          type: AssetType.Logo,
          url: `${assetsManager.baseUrl}/logo.png`,
          mimeType: MimeType.PNG,
        },
        {
          type: AssetType.Thumbnail,
          url: `${assetsManager.baseUrl}/thumbnail.jpg`,
          mimeType: MimeType.JPG,
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/0.webp`,
          mimeType: MimeType.WEBP,
          index: 0,
        },
      ]

      vi.spyOn(assetsManager, 'getAssets').mockResolvedValue(mockAssets)
      vi.spyOn(assetsManager, 'getCdnAssets').mockResolvedValue(mockCdnAssets)

      //* Mock file content with existing CDN URLs
      mocks.readFile.mockImplementation((filePath: string) => {
        if (filePath.endsWith('test.ts')) {
          return Promise.resolve(`
            const logo = "${assetsManager.baseUrl}/logo.png"
            const thumbnail = "${assetsManager.baseUrl}/thumbnail.jpg"
            const img = "${assetsManager.baseUrl}/0.webp"
          `)
        }
        if (filePath.endsWith('metadata.json')) {
          return Promise.resolve(`{
            "logo": "${assetsManager.baseUrl}/logo.png",
            "thumbnail": "${assetsManager.baseUrl}/thumbnail.jpg",
            "image": "${assetsManager.baseUrl}/0.webp"
          }`)
        }
        return Promise.resolve('')
      })

      const result = await assetsManager.updateCdnAssets()

      //* Verify number of changed assets (no changes)
      expect(result).toBe(0)

      //* Verify no uploads, deletions, or file updates occurred
      expect(mocks.got).not.toHaveBeenCalled()
      expect(mocks.got.delete).not.toHaveBeenCalled()
      expect(mocks.formData).not.toHaveBeenCalled()
      expect(mocks.writeFile).not.toHaveBeenCalled()
    })
  })

  describe('deleteCdnAssets', () => {
    beforeEach(() => {
      vi.clearAllMocks()
      process.env.CDN_TOKEN = 'test-token'
    })

    it('should delete all CDN assets and return the count', async () => {
      const mockCdnAssets: CdnAsset[] = [
        {
          type: AssetType.Logo,
          url: `${assetsManager.baseUrl}/logo.png`,
          mimeType: MimeType.PNG,
        },
        {
          type: AssetType.Thumbnail,
          url: `${assetsManager.baseUrl}/thumbnail.jpg`,
          mimeType: MimeType.JPG,
        },
        {
          type: AssetType.ActivityAsset,
          url: `${assetsManager.baseUrl}/0.webp`,
          mimeType: MimeType.WEBP,
          index: 0,
        },
      ]

      //* Mock getCdnAssets to return our test assets
      vi.spyOn(assetsManager, 'getCdnAssets').mockResolvedValue(mockCdnAssets)

      const result = await assetsManager.deleteCdnAssets()

      //* Verify all assets were deleted
      expect(result).toBe(3)
      expect(mocks.got.delete).toHaveBeenCalledTimes(3)
      expect(mocks.got.delete).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/logo.png`,
        expect.any(Object),
      )
      expect(mocks.got.delete).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/thumbnail.jpg`,
        expect.any(Object),
      )
      expect(mocks.got.delete).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/0.webp`,
        expect.any(Object),
      )
    })

    it('should return 0 when no CDN assets exist', async () => {
      //* Mock getCdnAssets to return empty array
      vi.spyOn(assetsManager, 'getCdnAssets').mockResolvedValue([])

      const result = await assetsManager.deleteCdnAssets()

      //* Verify no delete calls were made
      expect(result).toBe(0)
      expect(mocks.got.delete).not.toHaveBeenCalled()
    })

    it('should handle failed deletions gracefully', async () => {
      const mockCdnAssets: CdnAsset[] = [
        {
          type: AssetType.Logo,
          url: `${assetsManager.baseUrl}/logo.png`,
          mimeType: MimeType.PNG,
        },
        {
          type: AssetType.Thumbnail,
          url: `${assetsManager.baseUrl}/thumbnail.jpg`,
          mimeType: MimeType.JPG,
        },
      ]

      //* Mock getCdnAssets to return our test assets
      vi.spyOn(assetsManager, 'getCdnAssets').mockResolvedValue(mockCdnAssets)

      //* Mock one deletion to fail
      mocks.got.delete.mockImplementation((url) => {
        if (url.toString().includes('thumbnail.jpg')) {
          return Promise.reject(new Error('Failed to delete'))
        }
        return Promise.resolve()
      })

      const result = await assetsManager.deleteCdnAssets()

      //* Verify all assets were attempted to be deleted
      expect(result).toBe(2)
      expect(mocks.got.delete).toHaveBeenCalledTimes(2)
      expect(mocks.got.delete).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/logo.png`,
        expect.any(Object),
      )
      expect(mocks.got.delete).toHaveBeenCalledWith(
        `${assetsManager.baseUrl}/thumbnail.jpg`,
        expect.any(Object),
      )
    })
  })
})

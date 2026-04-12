import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readFile: mocks.readFile,
}))

describe('dmca', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('getDmcaServices', () => {
    it('should load services correctly', async () => {
      mocks.readFile.mockResolvedValue(JSON.stringify({
        services: ['HiAnime', 'AniWatch', 'StreamEast'],
      }))

      const { getDmcaServices } = await import('./dmca.js')
      const services = await getDmcaServices()

      expect(services).toBeInstanceOf(Set)
      expect(services.size).toBe(3)
      expect(services.has('hianime')).toBe(true)
      expect(services.has('aniwatch')).toBe(true)
      expect(services.has('streameast')).toBe(true)
    })

    it('should return empty set on missing file', async () => {
      mocks.readFile.mockRejectedValue(new Error('ENOENT'))

      const { getDmcaServices } = await import('./dmca.js')
      const services = await getDmcaServices()

      expect(services).toBeInstanceOf(Set)
      expect(services.size).toBe(0)
    })

    it('should return empty set on invalid JSON', async () => {
      mocks.readFile.mockResolvedValue('not valid json{{{')

      const { getDmcaServices } = await import('./dmca.js')
      const services = await getDmcaServices()

      expect(services).toBeInstanceOf(Set)
      expect(services.size).toBe(0)
    })

    it('should cache results after first load', async () => {
      mocks.readFile.mockResolvedValue(JSON.stringify({
        services: ['HiAnime'],
      }))

      const { getDmcaServices } = await import('./dmca.js')
      await getDmcaServices()
      await getDmcaServices()

      expect(mocks.readFile).toHaveBeenCalledTimes(1)
    })
  })

  describe('isDmcaBlocked', () => {
    it('should return true for blocked service', async () => {
      const { isDmcaBlocked } = await import('./dmca.js')
      const services = new Set(['hianime', 'aniwatch'])

      expect(isDmcaBlocked('HiAnime', services)).toBe(true)
      expect(isDmcaBlocked('hianime', services)).toBe(true)
      expect(isDmcaBlocked('HIANIME', services)).toBe(true)
    })

    it('should return false for non-blocked service', async () => {
      const { isDmcaBlocked } = await import('./dmca.js')
      const services = new Set(['hianime'])

      expect(isDmcaBlocked('YouTube', services)).toBe(false)
    })
  })
})

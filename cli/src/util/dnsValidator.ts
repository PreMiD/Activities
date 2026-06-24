import { resolve as resolveDns } from 'node:dns/promises'
import { setTimeout } from 'node:timers/promises'

export interface DnsCheckResult {
  domain: string
  valid: boolean
  error?: string
  message?: string
  aRecords?: number
  aaaaRecords?: number
}

/**
 * Sanitize domain: remove protocols, paths, ports, query params
 */
export function sanitizeDomain(url: string): string {
  // Remove protocols (https://, http://, etc.)
  let domain = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')

  // Remove paths, query params, fragments
  domain = domain.split('/')[0].split('?')[0].split('#')[0]

  // Remove port numbers
  domain = domain.split(':')[0]

  // Trim whitespace
  return domain.trim()
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
  // Ignore localhost and local domains
  if (
    domain === 'localhost'
    || domain.endsWith('.localhost')
    || domain.endsWith('.local')
  ) {
    return false
  }

  // Ignore localhost IP addresses
  if (
    domain === '127.0.0.1'
    || domain.startsWith('127.')
    || domain === '::1'
    || domain === '0.0.0.0'
  ) {
    return false
  }

  // Ignore all IP addresses (IPv4 and IPv6)
  if (
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(domain)
    || /^[0-9a-f:]+$/i.test(domain)
  ) {
    return false
  }

  // Basic domain validation regex
  const domainRegex
    = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i

  return (
    domain.length > 0
    && domain.length <= 253
    && domainRegex.test(domain)
    && domain.includes('.') // Must have at least one dot
  )
}

/**
 * Check domain DNS with retry logic
 */
export async function checkDomainDns(
  domain: string,
  maxRetries = 3,
): Promise<DnsCheckResult> {
  const delays = [1000, 3000, 5000] // Progressive backoff: 1s, 3s, 5s

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check for both A and AAAA records
      const [aRecords, aaaaRecords] = await Promise.allSettled([
        resolveDns(domain, 'A'),
        resolveDns(domain, 'AAAA'),
      ])

      // Consider valid if EITHER A or AAAA records exist
      const hasARecords
        = aRecords.status === 'fulfilled' && aRecords.value.length > 0
      const hasAAAARecords
        = aaaaRecords.status === 'fulfilled' && aaaaRecords.value.length > 0

      if (hasARecords || hasAAAARecords) {
        return {
          domain,
          valid: true,
          aRecords: hasARecords ? aRecords.value.length : 0,
          aaaaRecords: hasAAAARecords ? aaaaRecords.value.length : 0,
        }
      }

      // No records found, but no error - domain exists but has no A/AAAA
      return {
        domain,
        valid: false,
        error: 'NO_RECORDS',
        message: 'Domain exists but has no A or AAAA records',
      }
    }
    catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1

      // DNS error codes
      if (error.code === 'ENOTFOUND') {
        // Domain doesn't exist - no need to retry
        return {
          domain,
          valid: false,
          error: 'ENOTFOUND',
          message: 'Domain does not exist',
        }
      }

      if (error.code === 'ENODATA') {
        // Domain exists but no records - no need to retry
        return {
          domain,
          valid: false,
          error: 'ENODATA',
          message: 'Domain exists but has no DNS records',
        }
      }

      // Timeout or temporary failure - retry with backoff
      if (
        !isLastAttempt
        && ['ETIMEOUT', 'ECONNREFUSED'].includes(error.code)
      ) {
        await setTimeout(delays[attempt])
        continue
      }

      // Unknown error or last attempt failed
      return {
        domain,
        valid: false,
        error: error.code || 'UNKNOWN',
        message: error.message,
      }
    }
  }

  // Should never reach here, but TypeScript wants a return
  return {
    domain,
    valid: false,
    error: 'UNKNOWN',
    message: 'Maximum retries exhausted',
  }
}

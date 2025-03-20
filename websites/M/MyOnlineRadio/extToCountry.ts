function getDomainExtension(url: string): string | null {
  try {
    const match = /\.([a-z0-9-]+)$/i.exec(new URL(url).hostname)
    return match ? match[1]! : null
  }
  catch {
    return 'com'
  }
}

export function extToCountry(url: string): string {
  const extension = getDomainExtension(url)
  const extensionToCountry: { [key: string]: string } = {
    hu: 'Hungary',
    ro: 'Romania',
    sk: 'Slovakia',
    de: 'Germany',
    at: 'Austria',
    it: 'Italy',
    es: 'Spain',
    fr: 'France',
    nl: 'Netherlands',
    pl: 'Poland',
    cl: 'Chile',
    ar: 'Argentina',
    mx: 'Mexico',
  }
  let country: string
  if (extension === 'com')
    country = url.includes('irish') ? 'Ireland' : 'UK'
  else country = extensionToCountry[extension!.toLowerCase()]!
  return country ? ` (${country})` : ''
}

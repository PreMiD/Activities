export function removeThemePrefix(text: string): string {
  const regex = /Tema\s?\d*\s?-\s*/i
  return text.replace(regex, '')
}

export function removeParentesisFromNumber(text: string): string {
  const regex = /^\s*\(\s*(\d+)\s*\)\s*$/
  return text.replace(regex, '$1')
}

export function isValidUUID(uuid: string): boolean {
  return /^[A-Z0-9]{8}-[A-Z0-9]{4}-4[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{12}$/i.test(uuid)
}

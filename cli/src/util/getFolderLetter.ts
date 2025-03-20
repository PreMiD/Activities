export function getFolderLetter(service: string) {
  const firstLetter = service.trim().charAt(0).toUpperCase()

  if (/[A-Z]/.test(firstLetter))
    return firstLetter
  if (/\d/.test(firstLetter))
    return '0-9'
  return '#'
}

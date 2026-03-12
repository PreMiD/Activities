export function getRealtimeEndpoint(): string | null {
  const input = document.querySelector<HTMLInputElement>('input[type=url]')

  if (!input)
    return null

  const url = new URL(input.value)

  return `${url.hostname}${url.pathname}`
}

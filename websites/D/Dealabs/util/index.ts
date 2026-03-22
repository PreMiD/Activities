export function formatSlug(slug: string | undefined): string {
  if (!slug)
    return 'Dealabs'
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

export function getMainContent(): Element {
  return document.querySelector('.js-thread-detail')
    || document.querySelector('.listLayout-threadItem')
    || document.body
}

export const presence = new Presence({
  clientId: '1456698196767277128',
})

export const activityAssets = {
  logo: 'https://i.imgur.com/Bg9ddtg.png',
}

export function formatSlug(slug: string | undefined): string {
    if (!slug) return "Dealabs";
    return slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

export function getMainContent(): Element {
  return document.querySelector('.js-thread-detail')
    || document.querySelector('.listLayout-threadItem')
    || document.body
}

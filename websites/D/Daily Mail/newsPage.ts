import { findPage } from './findPage.js'
import { ActivityAssets } from './presence.js'

function handleArticle(
  presenceData: PresenceData,
  useArticleThumbnail: boolean,
): void {
  const titleEl = document
    .querySelector('#js-article-text')
    ?.querySelector('h1')
  presenceData.buttons = [
    { label: 'Read Article', url: document.location.href },
  ]

  if (titleEl?.querySelector('.is-exclusive')) {
    presenceData.details = 'Reading Article'
    presenceData.smallImageKey = ActivityAssets.ExclIco
    presenceData.smallImageText = 'Exclusive!'
  }
  else {
    presenceData.details = 'Reading Article'
    delete presenceData.smallImageKey
  }

  if (useArticleThumbnail) {
    presenceData.largeImageKey = document
      .querySelector('[property="twitter:image"]')
      ?.getAttribute('content')
  }
  else {
    presenceData.largeImageKey = ActivityAssets.Logo
  }

  // the twitter title preview is more concise and readable
  presenceData.state = document
    .querySelector('[property="twitter:title"]')
    ?.getAttribute('content') || titleEl?.textContent?.replace('EXCLUSIVE', '')

  // authors (LEAVE THIS COMMENT PLEASE)
  /*
  const authors = Array.from(
    aBody.querySelector(".author-section").querySelectorAll("a")
  ).map(el => el.textContent);
  presenceData.state = `By ${authors.join(", ") || "unknown"}`;
  */
}

export function handleNewsPage(
  presenceData: PresenceData,
  useArticleThumbnail: boolean,
): void {
  const newsPaths = document.location.pathname
    .split('/')
    .find(e => e && e !== 'news')

  if (
    newsPaths?.includes('article-')
    || document.location.pathname.split('/')[3]?.startsWith('article-')
  ) {
    handleArticle(presenceData, useArticleThumbnail)
  }
  else {
    findPage(document.location.pathname.substring(1), presenceData)
  }
}

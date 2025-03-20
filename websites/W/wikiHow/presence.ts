const presence = new Presence({
  clientId: '630570838084812801',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/wikiHow/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const path = document.location.pathname
  const topic = document.querySelector('#section_0')
  const category = document.querySelector('#article > div.wh_block > h1')

  if (topic && topic.textContent !== '') {
    const author = document.querySelector('#sp_expert_name')
      || document.querySelector('#sp_expert_team')
    const date = document.querySelector('#expert_coauthor > p')

    return presence.setActivity({
      details: topic.textContent,
      state: `by ${
        author && author.textContent !== '' ? author.textContent : 'unknown'
      }${
        date && date.textContent !== ''
          ? ` (${date.textContent?.replace('Updated: ', '')})`
          : ''
      } `,
      largeImageKey: ActivityAssets.Logo,
      smallImageKey: ActivityAssets.Logo,
      smallImageText: decodeURIComponent(document.location.href),
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }

  if (category && category.textContent !== '') {
    return presence.setActivity({
      details: 'Viewing a category:',
      state: category.textContent,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/wikiHow/assets/logo.png',
      smallImageKey: ActivityAssets.Logo,
      smallImageText: decodeURIComponent(document.location.href),
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }

  if (path === '/index.php') {
    // Note that I (EGGSY) didn't work on this part, I don't know if it's working on the main site but I'm sure it doesn't work on Spanish version.
    const newTopic = document.querySelectorAll('.firstHeading')[0]
      ? document.querySelectorAll('.firstHeading')[0]?.textContent
      : null

    return presence.setActivity({
      details: 'Editing/Writing How to',
      state: `Topic: ${newTopic ?? 'Unknown.'} `,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/wikiHow/assets/logo.png',
      smallImageKey: ActivityAssets.Logo,
      smallImageText: decodeURIComponent(document.location.href),
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }

  if (path === '/wikiHowTo') {
    const searching = document.location.search
      .replace('?search=', '')
      .split('+')
      .join(' ')

    return presence.setActivity({
      details: 'Searching for:',
      state: `${searching[0]?.toUpperCase() + searching.slice(1).toLowerCase()}`,
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/wikiHow/assets/logo.png',
      smallImageKey: ActivityAssets.Logo,
      smallImageText: 'Searching...',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }

  return presence.setActivity({
    details: 'Viewing a page:',
    state: 'Homepage',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/wikiHow/assets/logo.png',
    smallImageKey: ActivityAssets.Logo,
    startTimestamp: Math.floor(Date.now() / 1000),
  })
})

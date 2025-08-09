const presence = new Presence({
  clientId: '503557087041683458',
})

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Emojipedia/assets/logo.png',
    name: 'Emojipedia',
  }

  if (
    document.location.href === 'https://emojipedia.org/'
    || document.location.href === 'https://emojipedia.org'
  ) {
    presenceData.details = 'Staring at the main page'
  }
  else if (document.location.hostname === 'blog.emojipedia.org') {
    if (
      document.location.href === 'https://blog.emojipedia.org/'
      || document.location.href === 'https://blog.emojipedia.org'
    ) {
      presenceData.details = 'Skimming through the blog homepage'
    }
    else {
      presenceData.details = 'Reading a blog post...'
      presenceData.state = document.querySelectorAll('.post-full-title')[0]?.textContent
    }
  }
  else if (document.location.pathname.includes('/search')) {
    presenceData.details = 'Searching for...'
    if (document.location.href.includes('/search/?q=')) {
      presenceData.state = (
        document.querySelector<HTMLInputElement>('#id_q') as HTMLInputElement
      ).value
    }
    else {
      presenceData.state = 'Nothing.. you alright there?'
    }
  }
  else {
    const categoryURLs = [
      'https://emojipedia.org/people',
      'https://emojipedia.org/nature',
      'https://emojipedia.org/food-drink',
      'https://emojipedia.org/activity',
      'https://emojipedia.org/travel-places',
      'https://emojipedia.org/symbols',
      'https://emojipedia.org/flags',
    ]
    const eventURLs = [
      'https://emojipedia.org/australia-day',
      'https://emojipedia.org/bastille-day',
      'https://emojipedia.org/birthday',
      'https://emojipedia.org/black-friday',
      'https://emojipedia.org/canada-day',
      'https://emojipedia.org/carnaval',
      'https://emojipedia.org/chinese-new-year',
      'https://emojipedia.org/christmas',
      'https://emojipedia.org/cinco-de-mayo',
      'https://emojipedia.org/coronavirus',
      'https://emojipedia.org/diwali',
      'https://emojipedia.org/dragon-boat-festival',
      'https://emojipedia.org/easter',
      'https://emojipedia.org/emoji-movie',
      'https://emojipedia.org/fall-autumn',
      'https://emojipedia.org/fathers-day',
      'https://emojipedia.org/festivus',
      'https://emojipedia.org/graduation',
      'https://emojipedia.org/guy-fawkes',
      'https://emojipedia.org/halloween',
      'https://emojipedia.org/hanukkah',
      'https://emojipedia.org/hearts',
      'https://emojipedia.org/holi',
      'https://emojipedia.org/independence-day',
      'https://emojipedia.org/mothers-day',
      'https://emojipedia.org/new-years-eve',
      'https://emojipedia.org/olypmics',
      'https://emojipedia.org/pride',
      'https://emojipedia.org/queens-birthday',
      'https://emojipedia.org/ramadan',
      'https://emojipedia.org/spring',
      'https://emojipedia.org/st-patricks-day',
      'https://emojipedia.org/spring',
      'https://emojipedia.org/summer',
      'https://emojipedia.org/super-bowl',
      'https://emojipedia.org/thanksgiving',
      'https://emojipedia.org/valentines-day',
      'https://emojipedia.org/wedding-marriage',
      'https://emojipedia.org/winter',
      'https://emojipedia.org/winter-olympics',
      'https://emojipedia.org/world-cup',
      'https://emojipedia.org/world-emoji-day',
    ]

    let bypass = false
    let isCategory = false
    let isEvent = false

    for (const categoryURL of categoryURLs) {
      if (document.location.href.includes(categoryURL)) {
        isCategory = true
        bypass = true
      }
    }

    if (bypass !== true) {
      for (const eventURL of eventURLs) {
        if (document.location.href.includes(eventURL)) {
          isEvent = true
          bypass = true
        }
      }
    }

    if (isCategory) {
      presenceData.details = 'Viewing a category...'
      presenceData.state = document.querySelectorAll('h1')[0]?.textContent
    }
    else if (isEvent) {
      presenceData.details = 'Viewing an event...'
      presenceData.state = document.querySelectorAll('h1')[0]?.textContent
    }
    else if (document.querySelectorAll('h1').length >= 1) {
      if (
        /[\u2700-\u27BF\u3299\u3297\u303D\u3030\u24C2\u203C\u2049\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u00A9\u00AE\u2122\u2139\u2600-\u26FF\u2B05\u2B06\u2B07\u2B1B\u2B1C\u2B50\u2B55\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u2934\u2935\u2190-\u21FF]|(?:\uD83C[\uDDE6-\uDDFF]){2}|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u0023-\u0039]\uFE0F?\u20E3/.test(
          document.querySelectorAll('h1')[0]?.textContent ?? '',
        )
      ) {
        presenceData.details = 'Viewing an emoji...'
        presenceData.state = document.querySelectorAll('h1')[0]?.textContent
      }
      else {
        presenceData.details = 'Viewing a page...'
        presenceData.state = document.querySelectorAll('h1')[0]?.textContent
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

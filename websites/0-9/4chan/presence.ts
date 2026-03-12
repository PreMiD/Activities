const presence = new Presence({
  clientId: '1195051461822914640',
})

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/4chan/assets/logo.png',
}

const boards: { [board: string]: string } = {
  '/3/': '3DCG',
  '/a/': 'Anime & Manga',
  '/aco/': 'Adult Cartoons',
  '/adv/': 'Advice',
  '/an/': 'Animals & Nature',
  '/asp/': 'Alternative Sports',
  '/b/': 'Random',
  '/bant/': 'International/Random',
  '/biz/': 'Business & Finance',
  '/c/': 'Anime/Cute',
  '/cgl/': 'Cosplay & EGL',
  '/ck/': 'Food & Cooking',
  '/cm/': 'Cute/Male',
  '/co/': 'Comics & Cartoons',
  '/d/': 'Hentai/Alternative',
  '/diy/': 'Do*It*Yourself',
  '/e/': 'Ecchi',
  '/f/': 'Flash',
  '/fa/': 'Fashion',
  '/fit/': 'Fitness',
  '/g/': 'Technology',
  '/gd/': 'Graphic Design',
  '/gif/': 'Adult GIF',
  '/h/': 'Hentai',
  '/hc/': 'Hardcore',
  '/hm/': 'Handsome Men',
  '/hr/': 'High Resolution',
  '/i/': 'Oekaki',
  '/ic/': 'Artwork/Critique',
  '/his/': 'History & Humanities',
  '/int/': 'International',
  '/jp/': 'Otaku Culture',
  '/k/': 'Weapons',
  '/lit/': 'Literature',
  '/lgbt/': 'LGBT',
  '/m/': 'Mecha',
  '/mlp/': 'Pony',
  '/mu/': 'Music',
  '/news/': 'Current News',
  '/n/': 'Transportation',
  '/o/': 'Auto',
  '/out/': 'Outdoors',
  '/p/': 'Photography',
  '/po/': 'Papercraft & Origami',
  '/pol/': 'Politically Incorrect',
  '/pw/': 'Professional Wrestling',
  '/qst/': 'Quests',
  '/r/': 'Adult Requests',
  '/r9k/': 'ROBOT9001',
  '/s4s/': 'Shit 4chan Says',
  '/s/': 'Sexy Beautiful Women',
  '/sci/': 'Science & Math',
  '/soc/': 'Cams & Meetups',
  '/sp/': 'Sports',
  '/t/': 'Torrents',
  '/tg/': 'Traditional Games',
  '/toy/': 'Toys',
  '/trash/': 'Off*topic',
  '/trv/': 'Travel',
  '/tv/': 'Television & Film',
  '/u/': 'Yuri',
  '/v/': 'Video Games',
  '/vg/': 'Video Game Generals',
  '/vm/': 'Video Games/Multiplayer',
  '/vmg/': 'Video Games/Mobile',
  '/vip/': 'Very Important Posts',
  '/vp/': 'Pokémon',
  '/vr/': 'Retro Games',
  '/vrpg/': 'Video Games/RPG',
  '/vst/': 'Video Games/Strategy',
  '/vt/': 'Virtual YouTubers',
  '/w/': 'Anime/Wallpapers',
  '/wg/': 'Wallpapers/General',
  '/wsg/': 'Worksafe GIF',
  '/wsr/': 'Worksafe Requests',
  '/x/': 'Paranormal',
  '/xs/': 'Extreme Sports',
  '/y/': 'Yaoi',
}
const browsingTimestamp = Math.floor(Date.now() / 1000)
const nsfwBoards = new Set([
  '/aco/',
  '/bant/',
  '/b/',
  '/d/',
  '/e/',
  '/gif/',
  '/hc/',
  '/h/',
  '/hm/',
  '/hr/',
  '/pol/',
  '/r9k/',
  '/r/',
  '/s4s/',
  '/s/',
  '/soc/',
  '/t/',
  '/u/',
  '/y/',
])

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { href, pathname } = document.location

  if (pathname === '/') {
    presenceData.details = 'Viewing the front page'
  }
  else if (pathname.startsWith('/faq')) {
    presenceData.details = 'Reading the FAQ'
  }
  else if (pathname.startsWith('/rules')) {
    presenceData.details = 'Reading the rules'
  }
  else if (pathname.startsWith('/4channews')) {
    presenceData.details = 'Viewing news posts'
  }
  else {
    let isNsfw = false
    for (const board in boards) {
      if (pathname.includes(board)) {
        isNsfw = nsfwBoards.has(board)
        if (isNsfw)
          presenceData.details = 'Browsing a board'
        else presenceData.details = `Browsing ${board} - ${boards[board]}`
        break
      }
    }

    if (pathname.includes('/thread/')) {
      if (!isNsfw) {
        const threadNum = pathname.split('/').at(-1)
        const threadSubject = document.querySelector('.subject')?.textContent

        if (await presence.getSetting('showThumbnail')) {
          const thumbnail = document.querySelector(
            `#f${threadNum} .fileThumb img`,
          )
          if (thumbnail) {
            presenceData.largeImageKey = `https:${thumbnail.getAttribute(
              'src',
            )}`
          }
        }

        presenceData.buttons = [
          {
            label: 'View Thread',
            url: href,
          },
        ]

        if (threadSubject)
          presenceData.state = `>>${threadNum} - "${threadSubject}"`
        else presenceData.state = `>>${threadNum}`
      }
      else {
        presenceData.state = 'Viewing a thread'
      }
    }
    else if (pathname.includes('/archive')) {
      presenceData.state = 'Checking the archive'
    }
  }

  presence.setActivity(presenceData)
})

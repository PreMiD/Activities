import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1028679580027977839',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Buy = 'https://cdn.rcd.gg/PreMiD/websites/S/Sofi/assets/0.png',
  Submit = 'https://cdn.rcd.gg/PreMiD/websites/S/Sofi/assets/1.png',
  Edit = 'https://cdn.rcd.gg/PreMiD/websites/S/Sofi/assets/2.png',
  Browse = 'https://cdn.rcd.gg/PreMiD/websites/S/Sofi/assets/3.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/S/Sofi/assets/logo.png',
}

presence.on('UpdateData', async () => {
  let presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Viewing Homepage',
    smallImageKey: Assets.Viewing,
    startTimestamp: browsingTimestamp,
  }
  const { host, pathname, href } = document.location
  const pages: Record<string, PresenceData> = {
    '/backgrounds': {
      details: 'Viewing Backgrounds',
      smallImageKey: Assets.Viewing,
      buttons: [
        {
          label: 'View Backgrounds',
          url: href,
        },
      ],
    },
    '/profile/background': {
      details: 'Viewing Profile Backgrounds',
      smallImageKey: Assets.Viewing,
      buttons: [
        {
          label: 'View Profile Backgrounds',
          url: href,
        },
      ],
    },
    '/frames': {
      details: 'Viewing Frames',
      smallImageKey: Assets.Viewing,
      buttons: [
        {
          label: 'View Frames',
          url: href,
        },
      ],
    },
    '/items': {
      details: 'Viewing Items',
      smallImageKey: Assets.Viewing,
      buttons: [
        {
          label: 'View Items',
          url: href,
        },
      ],
    },
    '/bump': {
      details: 'Bumping',
      smallImageKey: null,
      smallImageText: null,
      buttons: [
        {
          label: 'Wanna Bump?',
          url: href,
        },
      ],
    },
    '/team': {
      details: 'Viewing Team',
      smallImageKey: Assets.Viewing,
      buttons: [
        {
          label: 'View Sofi Team',
          url: href,
        },
      ],
    },
    '/event': {
      details: 'Viewing Event',
      smallImageKey: Assets.Viewing,
      buttons: [
        {
          label: 'View Event',
          url: href,
        },
      ],
    },
  }

  if (host === 'sofi.gg') {
    if (pathname.startsWith('/glows')) {
      const data = document.querySelector('div.flex.text-xl.lg\\:text-2xl')

      presenceData.details = 'Viewing Glows'
      presenceData.buttons = [
        {
          label: 'View Glows',
          url: href,
        },
      ]

      if (data) {
        const userTag = data.textContent?.match(/.*#\d+/g)
        if (userTag)
          presenceData.state = `Of ${userTag[0]}`
      }
    }
    else if (
      pathname.startsWith('/profile')
      && !pathname.endsWith('/background')
    ) {
      const isOwnProfile = pathname === 'profile'
      const data = document.querySelector('title')
      const title = data ? data.textContent?.replace(' Profile', '') : null

      presenceData.details = 'Viewing Profile'
      presenceData.state = isOwnProfile
        ? null
        : `Of ${title?.slice(0, title.length - 2)}`
      presenceData.buttons = [
        {
          label: isOwnProfile ? 'View Profile' : `View ${title} Profile`,
          url: href,
        },
      ]
      if (pathname.includes('/edit')) {
        presenceData.details = 'Editing Profile'
        presenceData.smallImageKey = ActivityAssets.Edit
        presenceData.buttons = [
          {
            label: 'Edit Profile',
            url: href,
          },
        ]
        delete presenceData.state
      }
    }
    else if (pathname.startsWith('/art')) {
      const data = document.querySelector(
        'div.w-full.font-inter.uppercase.font-bold.text-xl.lg\\:text-3xl.lg\\:relative.text-light-400.text-center',
      )
      presenceData.details = 'Viewing Art Gallery'
      presenceData.buttons = [
        {
          label: 'View Art Gallery',
          url: 'https://sofi.gg/art',
        },
      ]

      if (data) {
        const artName = data.textContent
        if (artName)
          presenceData.state = artName.toUpperCase()
      }

      if (pathname.includes('/submit')) {
        presenceData.details = 'Submitting Art'
        presenceData.smallImageKey = ActivityAssets.Submit
        presenceData.buttons = [
          {
            label: 'Submit Art',
            url: href,
          },
        ]
        delete presenceData.state
      }
    }

    for (const [path, data] of Object.entries(pages)) {
      if (pathname.includes(path))
        presenceData = { ...presenceData, ...data } as PresenceData
    }
  }
  else if (host === 'gems.sofi.gg') {
    if (pathname.includes('/orders'))
      return
    presenceData.details = 'Buying Gems'
    presenceData.smallImageKey = ActivityAssets.Buy
    presenceData.buttons = [
      {
        label: 'Buy Gems',
        url: href,
      },
    ]
  }
  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])

  if (privacy) {
    presenceData.details = 'Browsing...'
    presenceData.smallImageKey = ActivityAssets.Browse
    delete presenceData.smallImageText
    delete presenceData.state
    delete presenceData.buttons
  }

  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

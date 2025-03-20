const presence = new Presence({
  clientId: '920135248006754394',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const pathData = {
  user: [
    {
      name: 'supports',
      state: 'My subscriptions history',
    },
    {
      name: 'edit',
      state: 'Editing my details',
    },
  ],
  dashboard: [
    {
      name: 'overview',
      state: 'My overview',
    },
    {
      name: 'onboarding',
      state: 'Starting up',
    },
    {
      name: 'goal',
      state: 'My goal',
    },
    {
      name: 'tiers',
      state: 'My support tiers',
      paths: [
        {
          name: 'setup',
          state: 'Setting up supporter tiers...',
        },
        {
          name: 'add',
          state: 'Adding new supporter tier...',
        },
        {
          name: '*',
          state: 'Editing supporter tier...',
        },
      ],
    },
    {
      name: 'posts',
      state: 'My posts',
      paths: [
        {
          name: 'add',
          state: 'Making new post...',
        },
        {
          name: '*',
          state: 'Editing my post...',
        },
      ],
    },
    {
      name: 'vouchers',
      state: 'My vouchers',
      paths: [
        {
          name: 'add',
          state: 'Making new voucher...',
        },
        {
          name: '*',
          state: 'Editing my voucher...',
        },
      ],
    },
    {
      name: 'overlay',
      state: 'Stream overlay',
    },
    {
      name: 'supports',
      state: 'Supports history',
    },
    {
      name: 'bank',
      state: 'Payment',
    },
    {
      name: 'profile',
      state: 'Editing profile',
    },
    {
      name: 'settings',
      state: 'Settings',
    },
  ],
}
const getUserHeader = '.q-page-container.q-pb-xl.main'
const getUserHeaderHome = '.title.q-toolbar__title.ellipsis a.no-underline.text-primary.router-link-active'
// This function act like switch function but for objects Array (yea its a lil bit complicated)
function stateSetter(paths: string[], arrayPath: {
  name: string
  state: string
  paths?: {
    name?: string
    state?: string
  }[]
}[]): string {
  const result = arrayPath.find(p => p.name === paths[1])!
  return (
    result.paths?.find((p) => {
      const b: boolean = p.name === (paths[2] ?? '')
      if (!b && !!paths[2])
        return p.name === '*'
      return b
    })?.state ?? result.state
  )
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/K/KaryaKarsa/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const paths: string[] = window.location.pathname.split('/').splice(1)

  switch (paths[0]?.toLowerCase()) {
    case '':
      presenceData.details = 'Looking at the home page'
      break
    case 'feed':
      presenceData.details = 'Looking at the feeds'
      break
    case 'profile':
      presenceData.details = 'Looking at their profile'
      break
    case 'about':
    case 'terms':
      presenceData.details = 'Reading Terms of Service'
      break
    case 'dashboard':
      presenceData.details = 'Looking at the dashboard'
      presenceData.state = stateSetter(paths, pathData.dashboard)
      break
    case 'discover': {
      presenceData.details = 'Looking at the discover / search'
      const searchBar = document.querySelector<HTMLInputElement>(
        '.q-field.q-input.q-field--filled.q-field--square.q-field--float.q-validation-component input.q-field__native.q-placeholder',
      )
      if (searchBar?.value)
        presenceData.state = `Searching for "${searchBar.value}"`
      break
    }
    case 'user':
      presenceData.details = 'Looking at My detail'
      presenceData.state = stateSetter(paths, pathData.user)
      break
    default: {
      presenceData.details = 'Browsing pages'

      if (!paths[0])
        presenceData.details = 'Looking at the home page'

      // if user Looking at user page
      {
        const titleUser = document.querySelector<HTMLElement>(
          `${getUserHeader} .q-px-md.q-py-md div`,
        )
        const roleUser = document.querySelector<HTMLElement>(
          `${getUserHeader} .q-px-md.q-py-md .text-caption.text-grey-7`,
        )

        if (titleUser && roleUser) {
          presenceData.details = titleUser.textContent
          presenceData.state = roleUser.textContent
          presenceData.buttons = [
            {
              label: 'Visit Creator',
              url: window.location.href,
            },
          ]
        }
      }

      // if user Looking at user post
      {
        const titleUser = document.querySelector<HTMLElement>(getUserHeaderHome)
        const tagUser = document.querySelector<HTMLElement>(
          '#q-app > div > div > div.q-page-container.main.q-pb-xl.bordered-desktop.post-page > div.post-date.text-body2.q-px-md.q-pt-md.q-pb-sm.post-content > a',
        )
        const postTitle = document.querySelector<HTMLElement>(
          '#q-app > div > div > div.q-page-container.main.q-pb-xl.bordered-desktop.post-page > h1',
        )

        if (titleUser && tagUser && postTitle) {
          presenceData.details = `${titleUser.textContent} (${tagUser.textContent})`
          presenceData.state = postTitle.textContent
          presenceData.buttons = [
            {
              label: 'View post',
              url: window.location.href,
            },
          ]
        }
      }
    }
  }

  presence.setActivity(presenceData)
})

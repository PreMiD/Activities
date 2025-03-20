import { Assets } from 'premid'

const presence = new Presence({
  clientId: '937439130613350480',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const pathNameLocalize = [
  {
    hostname: 'universal', // English, India, Philipine
    subject: '/subject',
    question: '/question',
  },
  {
    hostname: 'brainly.co.id', // Indonesia
    subject: '/mapel',
    question: '/tugas',
  },
  {
    hostname: 'brainly.ro', // Romania
    subject: '/materie',
    question: '/tema',
  },
]
let pathName: { hostname: string, subject: string, question: string } | undefined

function setPathName() {
  if (
    document.location.hostname === 'brainly.co.id'
    || document.location.hostname === 'brainly.ro'
  ) {
    for (const [index, item] of pathNameLocalize.entries()) {
      if (document.location.hostname === item.hostname)
        pathName = pathNameLocalize[index]
    }
  }
  else {
    pathName = pathNameLocalize[0]
  }
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    details: 'Viewing an unsupported page',
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/B/Brainly/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const page = document.location.pathname
  const [time, buttons] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ])

  setPathName()
  if (page === '/') {
    presenceData.details = 'Viewing home page'
  }
  else if (page.includes('/all-questions')) {
    presenceData.details = 'Viewing all questions'
  }
  else if (pathName && page.includes(pathName.subject)) {
    presenceData.details = 'Viewing subject:'
    presenceData.state = (
      page.replace(`${pathName.subject}/`, '').charAt(0).toUpperCase()
      + page.replace(`${pathName.subject}/`, '').slice(1)
    )
      .split('_')
      .join(' ')
  }
  else if (pathName && page.includes(pathName.question)) {
    presenceData.details = 'Reading question:'
    presenceData.smallImageKey = Assets.Reading
    presenceData.state = document.title.replace(
      `- ${
        pathName.hostname.charAt(0).toUpperCase() + pathName.hostname.slice(1)
      }`,
      '',
    )
    presenceData.buttons = [
      {
        label: 'View Question',
        url: document.URL,
      },
    ]

    if (
      document.querySelector('div[role=textbox]')
      && document.querySelector('div[role=textbox]')?.innerHTML !== ''
    ) {
      presenceData.details = 'Answering question:'
      presenceData.smallImageKey = Assets.Writing
      presenceData.state = document.querySelector<HTMLDivElement>('div[role=textbox]')?.textContent
    }
  }
  else if (page.includes('/app/ask')) {
    presenceData.details = 'Searching for a question:'
    presenceData.smallImageKey = Assets.Search
    presenceData.state = document.querySelector<HTMLInputElement>('input[type=search]')?.value
  }
  else if (page.includes('/question/add')) {
    presenceData.smallImageKey = Assets.Writing
    presenceData.details = 'Writing a question:'
    presenceData.state = document.querySelector<HTMLTextAreaElement>(
      'textarea[name=task_content]',
    )?.value
  }
  else if (page.includes('/app/profile')) {
    presenceData.details = 'Viewing profile:'
    presenceData.state = document.title.replace(`- ${pathName?.hostname}`, '')
    presenceData.buttons = [
      {
        label: 'View Profile',
        url: document.URL,
      },
    ]
  }
  else if (page.includes('/users/profile')) {
    presenceData.details = 'Editing profile'
  }
  else if (page.includes('/messages')) {
    presenceData.details = 'On messages page'
  }

  if (
    document.querySelector('div.brn-attachment-grabber-container > textarea')
    && document.querySelector<HTMLTextAreaElement>(
      'div.brn-attachment-grabber-container > textarea',
    )?.value !== ''
  ) {
    presenceData.smallImageKey = Assets.Writing
    presenceData.details = 'Writing a question:'
    presenceData.state = document.querySelector<HTMLTextAreaElement>(
      'div.brn-attachment-grabber-container > textarea',
    )?.value
  }

  if (!time)
    delete presenceData.startTimestamp
  if (!buttons && presenceData.buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

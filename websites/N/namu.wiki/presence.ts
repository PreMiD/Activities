const presence = new Presence({
  clientId: '846385772688834591',
})

interface interfaceMapping {
  [key: string]: string
}

const boardTypeMapping: interfaceMapping = {
  w: 'Reading',
  acl: 'View ACl',
  diff: 'View Difference',
  history: 'View History',
  backlink: 'View Backlink',
  contribution: 'View Contribution',
  Policy: 'View Policy',
  Search: 'Searching',

  // edit
  edit: 'Editing',
  move: 'Move Document',
  delete: 'Delete Confirm',

  new_edit_request: 'Create New Edit Request',

  // discuss
  discuss: 'Dicsussing',
  thread: 'View Discuss',

  edit_request: 'Edit Request',

  // recent
  RecentDiscuss: 'View Recent Discuss',
  RecentChanges: 'View Recent Changes',

  // not used well
  NeededPages: 'View Needed Pages',
  OrphanedPages: 'View Orphaned Pages',
  UncategorizedPages: 'View Uncategorized Pages',
  OldPages: 'View Old Pages',
  ShortestPages: 'View Shortest Pages',
  LongestPages: 'View Longest Pages',
  BlockHistory: 'View Block History',
  RandomPage: 'View Random Page',
  Upload: 'Upload file',
  License: 'View License',
}
// /member/(action)
const validateMembershipUrl = /\/member\/(.+)/
const membersMapping: interfaceMapping = {
  login: 'Login',

  recover_password: 'Recover Password',
  signup: 'Sign Up',
  mypage: 'My Page',

  change_email: 'Change Email',

  change_password: 'Change Password',

  activate_otp: 'Activate OTP',
}
// /RecentChanges?logtype=(search)
const changesMapping: interfaceMapping = {
  all: 'All Changes',
  create: 'Created Documents',
  delete: 'Deleted Documents',
  move: 'Moved Documents',
  revert: 'Reverted Documents',
}
// /RecentDiscuss?logtype=(search)
const discussMapping: interfaceMapping = {

  normal_thread: 'Normal Thread',

  old_thread: 'Old Thread',

  closed_thread: 'Closed Thread',

  open_editrequest: 'Opened Edit Request',

  accepted_editrequest: 'Accepted Edit Request',

  closed_editrequest: 'Closed Edit Request',

  old_editrequest: 'Old Edit Request',
}
// /contribution/(type)/(username)/(contributeType)
// eslint-disable-next-line regexp/no-misleading-capturing-group
const validateContributeUrl = /\/contribution\/(.+)\/(.+)\/(.+)/

let currentPage = document.location.pathname
let currentTime = Date.now()
presence.on('UpdateData', async () => {
  const privacy = await presence.getSetting<boolean>('privacy')
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp')
  const path = document.location.pathname
  const params = document.location.search
  const [, action] = path.split('/')
  const details = boardTypeMapping[action!]
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/namu.wiki/assets/logo.png',
  }

  /**
   *
   * Setting Details & State
   *
   */
  presenceData.details = details ?? 'Unknown Action'

  let page: RegExpExecArray | null | string | undefined = validateContributeUrl.exec(path)
  /* View Contribute */
  if (page) {
    if (page[1] === 'author')
      page = `User: ${page[2]}`
    else page = 'IP User'
  }
  else if (validateMembershipUrl.exec(path)) {
    page = validateMembershipUrl.exec(path)
    /* View Membership */
    presenceData.details = 'Member Page'
    page = membersMapping[page![1]!]
  }
  else {
    switch (action) {
      /* Searching */
      // /Search?q=(search)
      case 'Search': {
        page = getParam(params, 'q')
        if (page.length === 0)
          page = 'Blank Query...'
        break
      }
      /* View Recent Discuss History */
      case 'RecentDiscuss': {
        page = discussMapping[getParam(params, 'logtype')]
        break
      }
      /* Recent Changes History */
      case 'RecentChanges': {
        page = changesMapping[getParam(params, 'logtype')]
        break
      }
      /* View Discuss Thread */
      case 'thread':
      case 'edit_request': {
        page = document.querySelector('h1 > a')?.textContent
        break
      }
      /* Other */
      default:
        if (details)
          page = decodeURI(path.substring(`/${action}/`.length))
        else page = null
    }
  }

  if (action === 'w') {
    presenceData.buttons = [
      { label: 'View Page', url: document.location.href },
    ]
  }
  if (page) {
    presenceData.state = page.length > 128 ? `${page.slice(0, 120)}...` : (page as string)
  }

  /**
   *
   * Login Status
   *
   */
  if (details) {
    const members = document.querySelectorAll(
      '#app > div > div > nav > ul > li > div > div > div',
    )
    if (!members[1]?.textContent?.includes('Please login!')) {
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/N/namu.wiki/assets/0.png'
      if (!privacy)
        presenceData.smallImageText = members[0]?.textContent
    }
  }

  /**
   *
   * Set Time
   *
   */
  if (currentPage !== path) {
    currentPage = path
    currentTime = ~~(Date.now() / 1000)
  }

  /**
   *
   * Apply
   *
   */
  if (!presenceData.details) {
    presence.setActivity()
  }
  else {
    if (showTimestamp)
      presenceData.startTimestamp = currentTime
    presence.setActivity(presenceData)
  }
})

/**
 * Extract parameter from url on the current page
 */
function getParam(params: string, query: string): string {
  return new URLSearchParams(params).get(query) ?? ''
}

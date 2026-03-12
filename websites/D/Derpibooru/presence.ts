const presence = new Presence({
  clientId: '611544256758153225',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/D/Derpibooru/assets/logo.png',
  }
  if (document.location.pathname === '/') {
    presenceData.details = 'Viewing the homepage'
  }
  else if (document.location.pathname.startsWith('/users/sign_in')) {
    presenceData.details = 'Logging in'
  }
  else if (document.location.pathname.startsWith('/users/sign_up')) {
    presenceData.details = 'Registering'
  }
  else if (document.location.pathname.startsWith('/store')) {
    presenceData.details = 'Browsing through the store'
  }
  else if (document.location.pathname.startsWith('/rankings')) {
    presenceData.details = 'Browsing through the rankings'
  }
  else if (document.location.pathname.startsWith('/settings')) {
    presenceData.details = 'Editing settings'
  }
  else if (document.location.pathname.startsWith('/galleries')) {
    presenceData.details = 'Browsing through the Gallerie'
  }
  else if (document.location.pathname.startsWith('/commissions')) {
    presenceData.details = 'Browsing through commissions'
  }
  else if (document.location.pathname.startsWith('/channels')) {
    presenceData.details = 'Browsing through livestreams'
  }
  else if (document.location.pathname.startsWith('/tags/ratings')) {
    presenceData.details = 'Browsing through the tag ratings'
  }
  else if (document.location.pathname.startsWith('/pages/tags')) {
    presenceData.details = 'Looking at the tag guide'
  }
  else if (document.location.pathname.startsWith('/tags/aliases')) {
    presenceData.details = 'Going through the tag aliases'
  }
  else if (document.location.pathname === '/art') {
    presenceData.details = 'Browsing through art chats'
  }
  else if (document.location.pathname.startsWith('/art/')) {
    presenceData.details = 'Reading the post:'
    presenceData.state = (
      document.querySelector('.layout--narrow h1') as HTMLElement
    ).textContent
  }
  else if (document.location.pathname.startsWith('/writing')) {
    presenceData.details = 'Browsing through Fanfictions'
  }
  else if (document.location.pathname === '/dis') {
    presenceData.details = 'Browsing through Discussions'
  }
  else if (document.location.pathname.startsWith('/dis/')) {
    presenceData.details = 'Reading the general discussion:'
    presenceData.state = (
      document.querySelector('.layout--narrow h1') as HTMLElement
    ).textContent
  }
  else if (document.location.pathname === '/generals') {
    presenceData.details = 'Looking at general posts'
  }
  else if (document.location.pathname.startsWith('/generals/')) {
    presenceData.details = 'test <work in progress>'
  }
  else if (document.location.pathname === '/pony') {
    presenceData.details = 'Browsing through pony discussion'
  }
  else if (document.location.pathname.startsWith('/pony/')) {
    presenceData.details = 'Reading the pony discussion:'
    presenceData.state = (
      document.querySelector('.layout--narrow h1') as HTMLElement
    ).textContent
  }
  else if (document.location.pathname === '/rp') {
    presenceData.details = 'Browsing through rp\'s'
  }
  else if (document.location.pathname.startsWith('/rp/')) {
    presenceData.details = 'Reading the rp chat:'
    presenceData.state = (
      document.querySelector('.layout--narrow h1') as HTMLElement
    ).textContent
  }
  else if (document.location.pathname === '/meta') {
    presenceData.details = 'Browsing through the website policy'
  }
  else if (document.location.pathname.startsWith('/meta/')) {
    presenceData.details = 'Reading the information post:'
    presenceData.state = (
      document.querySelector('.layout--narrow h1') as HTMLElement
    ).textContent
  }
  else if (document.location.pathname === '/tagging') {
    presenceData.details = 'Browsing through tagging discussions'
  }
  else if (document.location.pathname.startsWith('/tagging/')) {
    presenceData.details = 'Reading the tagging discussion:'
    presenceData.state = (
      document.querySelector('.layout--narrow h1') as HTMLElement
    ).textContent
  }
  else if (document.location.pathname === '/uppers') {
    presenceData.details = 'Browsing through uploader discussions'
  }
  else if (document.location.pathname.startsWith('/uppers/')) {
    presenceData.details = 'Reading the uploader discussion:'
    presenceData.state = (
      document.querySelector('.layout--narrow h1') as HTMLElement
    ).textContent
  }
  else if (document.location.pathname === '/forums') {
    presenceData.details = 'Browsing through the forum'
  }
  else if (document.location.pathname.startsWith('/forums')) {
    presenceData.details = 'Reading the forum post:'
    presenceData.state = (
      document.querySelector('.layout--narrow h1') as HTMLElement
    ).textContent
  }
  else if (document.location.pathname.startsWith('/activity')) {
    presenceData.details = 'Browsing recently uploaded pictures'
  }
  else if (document.location.pathname.startsWith('/lists')) {
    presenceData.details = 'Browsing through top scores'
  }
  else if (document.location.pathname.startsWith('/posts')) {
    presenceData.details = 'Browsing through global posts'
  }
  else if (document.location.pathname.startsWith('/search')) {
    presenceData.details = 'Searching something'
  }
  else if (document.location.pathname.startsWith('/filters')) {
    presenceData.details = 'Changing their filter settings'
  }
  else if (document.location.pathname.startsWith('/pages/rules')) {
    presenceData.details = 'Reading the rules'
  }
  else if (document.location.pathname.startsWith('/pages/privacy')) {
    presenceData.details = 'Reading the privacy informations'
  }
  else if (document.location.pathname.startsWith('/pages/takedowns')) {
    presenceData.details = 'Reading about takedowns'
  }
  else if (document.location.pathname.startsWith('/dnp')) {
    presenceData.details = 'Reading through the Do-Not-Post List'
  }
  else if (document.location.pathname.startsWith('/changelog')) {
    presenceData.details = 'Reading the changelog'
  }
  else if (document.location.pathname.startsWith('/pages/faq')) {
    presenceData.details = 'Reading the FAQ'
  }
  else if (document.location.pathname.startsWith('/pages/api')) {
    presenceData.details = 'Reading about the API'
  }
  else if (document.location.pathname.startsWith('/pages/shortcuts')) {
    presenceData.details = 'Reading about the keyboard shortcuts'
  }
  else if (document.location.pathname.startsWith('/pages/advertising')) {
    presenceData.details = 'Reading about their advertising'
  }
  else if (document.location.pathname.startsWith('/pages/onion')) {
    presenceData.details = 'Reading about onions'
  }
  else if (document.location.pathname.startsWith('/pages/stats')) {
    presenceData.details = 'Watching the website stats'
  }
  else if (document.location.pathname.startsWith('/pages/staff')) {
    presenceData.details = 'Looking at the staff list'
  }
  else if (document.location.pathname.startsWith('/images')) {
    if (document.location.pathname.startsWith('/images/new'))
      presenceData.details = 'uploading a new picture'
    else presenceData.details = 'Browsing through all pictures'
  }
  presence.setActivity(presenceData)
})

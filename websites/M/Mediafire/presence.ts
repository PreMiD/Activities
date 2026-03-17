import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/Mediafire/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'Mediafire',
  }
  const { pathname, href, hostname } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')
  switch (hostname) {
    case 'www.mediafire.com':
      if (pathname === '/') {
        presenceData.details = 'Viewing the home page'
      }
      else if (document.querySelector('#content > h2')?.textContent) {
        presenceData.details = document.querySelector('#content > h2')?.textContent
      }
      else if (pathname.includes('/file/')) {
        presenceData.details = document.querySelector(
          'body > main > div.content > div.center > div > div.dl-info > div.sidebar > div.apps > div > div',
        )?.textContent
      }
      else if (pathname === '/software/mobile') {
        presenceData.details = 'Mediafire Mobile Apps'
      }
      else if (pathname === '/about') {
        presenceData.details = document.querySelector(
          '#titlebar > div > h1',
        )?.textContent
      }
      else if (pathname.includes('/about/jobs')) {
        presenceData.details = document.querySelector(
          '#jobs_pics_section > div.opener > h2',
        )?.textContent
      }
      else if (pathname.includes('/advertising/')) {
        presenceData.details = document.querySelector(
          '#adInquiryWrap > h2',
        )?.textContent
      }
      else if (pathname === '/press') {
        presenceData.details = document.querySelector(
          '#content > h2.h2.mb-4',
        )?.textContent
      }
      else if (pathname.includes('/policies/')) {
        presenceData.details = document.querySelector(
          '#content > div > div > h1 > strong',
        )?.textContent
      }
      else if (pathname.includes('/policy_violation/')) {
        presenceData.details = document.querySelector(
          '#content > h2:nth-child(1)',
        )?.textContent
      }
      else if (pathname.includes('/help/')) {
        presenceData.details = 'Help'
      }
      else if (pathname.includes('/login/')) {
        presenceData.details = 'Logging in'
      }
      else if (pathname.includes('/upgrade/')) {
        presenceData.details = 'Upgrade Plans'
      }
      else if (pathname.includes('myaccount')) {
        presenceData.details = `${document
          .querySelector('[class~=\'current\']')
          ?.textContent
          ?.trim()} Settings`
      }

      if (pathname !== '/') {
        presenceData.buttons = [
          {
            label: 'Open Mediafire',
            url: href,
          },
        ]
      }
      break
    case 'app.mediafire.com':
      if (pathname.includes('/myfiles'))
        presenceData.details = 'Viewing their files'
      else if (pathname.includes('/recent'))
        presenceData.details = 'Viewing their Recent Files'
      else if (pathname.includes('/following'))
        presenceData.details = 'Viewing files shared with them'
      else if (pathname.includes('/trash'))
        presenceData.details = 'Viewing their Trashcan'
      else presenceData.details = 'Viewing their files'

      presenceData.buttons = [
        {
          label: 'Open Mediafire App',
          url: href,
        },
      ]
      break
    case 'www.mediafire.zendesk.com':
      if (pathname.includes('/articles/')) {
        presenceData.details = 'Viewing Help Article About:'
        presenceData.state = document.querySelector(
          'body > main > article > header > h1',
        )?.textContent
      }
      else {
        const search = document.querySelector<HTMLInputElement>('#query')
        if (search && !search.textContent) {
          presenceData.details = 'Helpdesk searching for:'
          presenceData.state = search.value
          presenceData.smallImageKey = Assets.Search
        }
        else {
          presenceData.details = 'Checking out the helpdesk'
        }
      }
      presenceData.buttons = [
        {
          label: 'Open Mediafire Helpdesk',
          url: href,
        },
      ]
      break
    case 'blog.mediafire.com':
      if (pathname === '/') {
        presenceData.details = 'Viewing Blog Post About:'
        presenceData.state = document.querySelector(
          '#fl-post-3434 > header > h2 > a',
        )?.textContent
      }
      presenceData.buttons = [
        {
          label: 'Open Mediafire Blog',
          url: href,
        },
      ]
      break
  }

  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

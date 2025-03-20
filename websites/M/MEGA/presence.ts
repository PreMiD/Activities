const presence = new Presence({
  clientId: '762522704128901131',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MEGA/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const [privacy, buttons] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
  ])
  const { pathname, hostname, href } = document.location

  if (privacy) {
    presenceData.details = 'Browsing'
  }
  else if (hostname === 'mega.io') {
    const menu = document.querySelector('[class=\'pages-menu submenu-link clickurl\']')
    if (pathname === '/' || pathname.includes('/startpage')) {
      presenceData.details = 'Home page'
    }
    else if (menu) {
      presenceData.details = menu.getAttribute('href')
      presenceData.buttons = [
        {
          label: 'View Features',
          url: href,
        },
      ]
    }
  }
  else if (hostname.includes('mega.nz')) {
    const menu = document.querySelector('.top-menu-item.active')
      ?? document.querySelector('.btn-myfiles.js-lpbtn.active')

    if (pathname === '/' || pathname.includes('/startpage')) {
      presenceData.details = 'Home page'
    }
    else if (pathname.includes('/file/')) {
      const extension = document.querySelector(
        '[class=\'extension\']',
      )?.textContent
      presenceData.details = `Viewing a ${extension} file`
      presenceData.state = ` (${document
        .querySelector('[class=\'file-size-block\']')
        ?.textContent
        ?.trim()}) ${
        document.querySelector('[class=\'filename\']')?.textContent
      }${extension}`
      presenceData.buttons = [
        {
          label: 'View File',
          url: href,
        },
      ]
    }
    else if (pathname.includes('/account')) {
      presenceData.details = `Viewing ${document
        .querySelector('[class=\'content-panel account active\']')
        ?.querySelector('[class*=\'active\']')
        ?.firstElementChild
        ?.textContent
        ?.trim()} Settings`
    }
    else if (pathname.includes('/fm/') && !pathname.includes('/fm/chat')) {
      const selected = document
        .querySelector('[class*="ui-selected"]')
        ?.getAttribute('title')
        ?? document
          .querySelector('[class*="data-block-view ui-selected"]')
          ?.getAttribute('title')
      if (selected) {
        const title = selected.replace(/\d* .B/g, '')
        let file = selected.replace(title, '')
        if (file)
          file = `(${file})`
        presenceData.details = 'Viewing file'
        presenceData.state = `${file} ${title}`
      }
      else if (
        !document
          .querySelector(
            '#bodyel > section.media-viewer-container.theme-dark-forced',
          )
          ?.className
          .includes('hidden')
      ) {
        presenceData.details = 'Viewing file'
        presenceData.state = document.querySelector(
          '[class=\'file-name\']',
        )?.textContent
      }
      else {
        presenceData.details = `Viewing ${
          document.querySelector('.btn-galleries.js-lpbtn.active')
            ?.textContent
            ?? document.querySelector('.btn-myfiles.js-lpbtn.active')?.textContent
            ?? 'Dashboard'
        }`
      }
    }
    else if (pathname.includes('/fm/chat')) {
      const chats = document.querySelector(
        '#fmholder > div.main-blur-block > div.fm-main.default > div.section.conversations > div > div.fm-right-files-block.in-chat > div.conversation-panels > div > div > div.chat-topic-block.chat-topic-block > div.chat-topic-info > div.chat-topic-text > span:nth-child(1) > span',
      )
      const contacts = document
        ?.querySelector('[class*="contacts-navigation"]')
        ?.querySelector('[class*="active"]')
        ?? document?.querySelector('[class*=" active groupchat public"]')
      if (chats) {
        presenceData.details = 'Viewing chat'
        presenceData.state = chats.textContent
      }
      else if (contacts) {
        presenceData.details = contacts.textContent
      }
      else {
        presenceData.details = 'Viewing All chats'
      }
    }
    else if (document.querySelector('[class*=\' ui-selected\']')) {
      const titleNode = document.querySelector('[class*=\' ui-selected\']')
        ?.childNodes[1]
      if (
        document
          .querySelector('[class*=\' ui-selected\']')
          ?.innerHTML
          .includes('folder')
      ) {
        presenceData.details = 'Viewing folder'
        presenceData.state = titleNode?.textContent
      }
      else {
        presenceData.details = 'Viewing file'
        presenceData.state = `${titleNode?.textContent} (Size: ${document
          .querySelector('[class*=\' ui-selected\']')
          ?.getAttribute('title')
          ?.replace(titleNode?.textContent ?? '', '')
          ?.trim()})`
      }
    }
    else if (
      document.querySelector('[class=\'fm-breadcrumbs-block\']')
      && document.querySelector(
        '[class="next-arrow sprite-fm-mono icon-arrow-right icon16"]',
      )
    ) {
      presenceData.details = 'Viewing contents of folder'
      presenceData.state = document
        .querySelector('[class=\'fm-breadcrumbs-block\']')
        ?.lastChild
        ?.textContent
        ?.trim()
    }
    else if (menu) {
      presenceData.details = `Viewing ${menu.textContent}`
    }
    else if (pathname === '/business') {
      presenceData.details = 'Viewing Business'
    }
  }

  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

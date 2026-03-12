const presence = new Presence({
  clientId: '863345026498428968',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Watch2Gether/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { hostname, pathname } = document.location

  if (hostname === 'w2g.tv') {
    if (pathname === '/') {
      presenceData.details = 'At Homepage'
    }
    else if (pathname.startsWith('/rooms/')) {
      const playerTime = document.querySelectorAll<HTMLSpanElement>(
        '#player-time > span',
      )
      const invite = document.querySelector<HTMLInputElement>(
        '#w2g-top-inviteurl > input',
      )
      const chatMessages = [
        ...document.querySelectorAll<HTMLDivElement>(
          'body > div.w2g-main-container.w2g-bind-layout > div.w2g-main-lower > div.w2g-main-right > div.w2g-content-right > div.w2g-menu-tab.w2g-chat.w2g-messages.w2g-panel-bottom > div.w2g-chat-messages.w2g-messages-container.w2g-scroll-vertical > div',
        ),
      ].reverse()

      let title: string | undefined

      for (const msg of chatMessages) {
        if (msg.querySelector('.w2g-chat-item-actions')) {
          const chatBubble = msg.querySelector('.w2g-chat-bubble')
          title = chatBubble?.textContent?.substring(
            0,
            chatBubble.textContent.indexOf('\n'),
          )
          break
        }
      }

      presenceData.details = `Watching ${title}`
      presenceData.state = `${
        document.querySelectorAll('div.w2g-user-name').length
      } users in the room`
      if (
        playerTime.length === 2
        && !document.querySelector(
          'div.w2g-player-menu.w2g-player > div.ui.inverted.tiny.menu > a > i.play',
        )
      ) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestamps(
          presence.timestampFromFormat(playerTime[0]?.textContent ?? ''),
          presence.timestampFromFormat(playerTime[1]?.textContent ?? ''),
        )
      }
      if (invite) {
        presenceData.buttons = [
          {
            label: 'Join Room',
            url: invite.value,
          },
        ]
      }
    }
    else if (pathname.startsWith('/users/')) {
      if (pathname.includes('edit'))
        presenceData.details = 'Editing user profile'
      else presenceData.details = 'Viewing user rooms'
    }
    else {
      switch (pathname) {
        case '/auth/sign_in': {
          presenceData.details = 'Signing In'
          break
        }
        case '/auth/sign_up': {
          presenceData.details = 'Signing Up'
          break
        }
        case '/pages/plus': {
          presenceData.details = 'Checking w2g+ plans'
          break
        }
        case '/pages/leave': {
          presenceData.details = 'Left room'
          break
        }
      }
    }
  }
  else if (hostname === 'community.w2g.tv') {
    if (pathname === '/') {
      presenceData.details = 'At Community homepage'
    }
    else if (pathname.startsWith('/t/')) {
      const title = document.querySelector('a.fancy-title')
      if (title) {
        presenceData.details = 'Looking at thread'
        presenceData.state = title.textContent
      }
    }
    else if (pathname.startsWith('/u/')) {
      const username = document.querySelector('h1.full-name')
      if (username)
        presenceData.details = `Looking at user ${username.textContent}`
    }
    else {
      presenceData.details = `Looking at ${document.title.substring(
        0,
        document.title.indexOf('-'),
      )}`
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

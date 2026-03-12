const presence = new Presence({
  clientId: '768028596035649536',
})

let roomName: string,
  inCall: boolean,
  userCount: number,
  userState: string,
  joinedRoomName: string,
  joinedRoomTimestamp: number

async function getData() {
  if (document.location.pathname.search('client/guest-wait.html') >= 0) {
    roomName = 'Guest Lobby'
    userCount = 0
    inCall = false
    userState = 'Waiting in the Guest Lobby...'
    return
  }

  if (document.querySelectorAll('h1')[0]) {
    roomName = document.querySelectorAll('h1')[0]?.textContent ?? ''

    userCount = 0

    for (const el of document.querySelectorAll('div')) {
      if (el.className.startsWith('userListColumn')) {
        userCount = Number.parseInt(
          el.querySelector('h2')?.textContent?.split('(')[1]?.split(')')[0] ?? '',
        )
      }
    }

    inCall = userCount !== null

    if (roomName && joinedRoomName !== roomName) {
      joinedRoomName = roomName
      joinedRoomTimestamp = Date.now()
    }
  }
  else {
    roomName = ''
    userCount = 0
    inCall = false
  }

  if (inCall) {
    if (await presence.getSetting<boolean>('readNotificationBar')) {
      for (const el of document.querySelectorAll('div')) {
        if (el.className.startsWith('notificationsBar')) {
          userState = el.textContent ?? ''
          inCall = false
          continue
        }
      }
    }

    for (const el of document.querySelectorAll('section')) {
      if (el.className.startsWith('actionsbar')) {
        userState = el.querySelector('i.icon-bbb-desktop')
          ? 'screen'
          : el.querySelector('i.icon-bbb-video')
            ? 'video'
            : el.querySelector('i.icon-bbb-desktop_off')
              ? 'presentation'
              : el.querySelector('i.icon-bbb-unmute')
                ? 'microphone'
                : el.querySelector('i.icon-bbb-mute')
                  ? 'muted'
                  : el.querySelector('i.icon-bbb-audio_on')
                    ? 'headphones'
                    : el.querySelector('i.icon-bbb-listen')
                      ? 'headphones'
                      : 'disconnected'
      }
    }
  }
  else {
    for (const el of document.querySelectorAll('div')) {
      if (el.className.startsWith('spinner')) {
        userState = 'Joining session...'
        continue
      }
    }
    if (document.querySelector('#room_access_code'))
      userState = 'Entering the room passcode'
    else if (document.querySelector('.form-control.join-form'))
      userState = 'Entering the name'
    else if (document.querySelector('.col-3 .loader'))
      userState = 'Waiting for the session to start...'
  }
}

setInterval(getData, 1000)

const assets = {
  logo: 'https://cdn.rcd.gg/PreMiD/websites/B/BigBlueButton/assets/logo.png',
  muted: 'https://cdn.rcd.gg/PreMiD/websites/B/BigBlueButton/assets/0.png',
  microphone: 'https://cdn.rcd.gg/PreMiD/websites/B/BigBlueButton/assets/1.png',
  disconnected: 'https://cdn.rcd.gg/PreMiD/websites/B/BigBlueButton/assets/2.png',
  headphones: 'https://cdn.rcd.gg/PreMiD/websites/B/BigBlueButton/assets/3.png',
  presentation: 'https://cdn.rcd.gg/PreMiD/websites/B/BigBlueButton/assets/4.png',
  video: 'https://cdn.rcd.gg/PreMiD/websites/B/BigBlueButton/assets/5.png',
  screen: 'https://cdn.rcd.gg/PreMiD/websites/B/BigBlueButton/assets/6.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: assets.logo,
    smallImageKey: inCall
      ? assets[userState as keyof typeof assets]
      : assets.logo,
    smallImageText: inCall
      ? userState === 'screen'
        ? 'Sharing screen...'
        : userState === 'presentation'
          ? 'Presenting...'
          : userState === 'video'
            ? 'Video call'
            : userState === 'microphone'
              ? 'Speaking...'
              : userState === 'muted'
                ? 'Muted'
                : userState === 'headphones'
                  ? 'Listening...'
                  : 'Disconnected'
      : userState,
    details: roomName ?? userState,
    state: inCall ? `${userCount} users` : roomName ? userState : null,
    startTimestamp: joinedRoomTimestamp ?? Date.now(),
  }

  if (!presenceData.details)
    delete presenceData.details
  if (!presenceData.state)
    delete presenceData.state

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

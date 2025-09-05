import { Assets } from 'premid'

const presence = new Presence({
  clientId: '664595715242197008',
})

function setPresenceData(
  presenceData: PresenceData,
  privacyMode: boolean,
  activeChatDetails?: HTMLElement,
  isLoggedIn?: boolean,
  textArea?: HTMLElement,
  messagesCount?: number,
  statusSpan?: HTMLElement,
  webVersion?: string,
): PresenceData {
  if (activeChatDetails?.textContent) {
    let status: string
    let state: string | undefined | null
    state = activeChatDetails.textContent

    if (statusSpan?.textContent?.includes('member')) {
      status = 'Chatting in a group'
    }
    else if (statusSpan?.textContent?.includes('subscriber')) {
      status = 'Viewing a broadcast'
    }
    else {
      status = 'Talking to'
      if (webVersion === 'k') {
        if (document.querySelector('.sidebar-header__subtitle')?.textContent?.includes('member')) {
          status = 'Chatting in a group'
          state = document.querySelector('.sidebar-header__title .peer-title')?.textContent
        }
      }
      else if (webVersion === 'a') {
        if (document.querySelector('.group-status')?.textContent?.includes('member')) {
          status = 'Chatting in a group'
          state = document.querySelector('#TopicListHeader .fullName')?.textContent
        }
      }
    }

    if (!privacyMode) {
      presenceData.details = `${status}:`
      presenceData.state = state
    }
    else {
      if (status === 'Talking to')
        status += ' someone'
      presenceData.details = status
    }
    presenceData.smallImageKey = textArea?.textContent && textArea.textContent.length >= 1
      ? Assets.Writing
      : Assets.Reading
    presenceData.smallImageText = textArea?.textContent && textArea.textContent.length >= 1
      ? 'Typing a message'
      : `Reading ${messagesCount} message${(messagesCount ?? 0) > 1 ? 's' : ''}`
  }
  else if (isLoggedIn) {
    presenceData.details = 'Logged in'
  }
  else {
    presenceData.details = 'Logging in...'
  }
  return presenceData
}

presence.on('UpdateData', async () => {
  const privacyMode: boolean = await presence.getSetting<boolean>('privacy') // presence settings
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Telegram/assets/logo.png',
  } // default PresenceData
  let isLoggedIn: boolean | undefined // determine if logged in or still logging in
  let activeChatDetails: HTMLElement | undefined // details of current active chat
  let textArea: HTMLElement | undefined // text area where user input message, for writing indicator
  let messagesCount: number | undefined // total message count inside active chat
  let statusSpan: HTMLElement | undefined // additional details of active chat, just below activeChatDetails, to determine if active chat is group or user
  let webVersion: string | undefined // version of Telegram Web
  const { href } = document.location
  if (href.includes('legacy=1')) {
    // Telegram Web version 0.7.0
    activeChatDetails = document.querySelector<HTMLElement>('.tg_head_peer_title') ?? undefined
    isLoggedIn = document.querySelectorAll('.im_history_not_selected_wrap')?.length > 0
    textArea = document.querySelector<HTMLElement>('div.composer_rich_textarea') ?? undefined
    messagesCount = document.querySelectorAll('div.im_message_body').length
    statusSpan = document.querySelector<HTMLElement>('.tg_head_peer_status') ?? undefined
    webVersion = 'legacy'
  }
  else if (href.includes('/k/')) {
    // Telegram WebK 2.2 (589)
    activeChatDetails = document.querySelector<HTMLElement>('.person .peer-title') ?? undefined
    isLoggedIn = (document.querySelector('.chat-background-item.is-visible')?.childElementCount ?? 0) < 1
    textArea = document.querySelector<HTMLElement>('.input-field-input-fake') ?? undefined
    messagesCount = document.querySelectorAll('.message').length
    statusSpan = document.querySelector<HTMLElement>('.person .info') ?? undefined
    webVersion = 'k'
  }
  else if (href.includes('/a/')) {
    // Telegram Web A 10.9.65
    activeChatDetails = document.querySelector<HTMLElement>('.ChatInfo .fullName') ?? undefined
    isLoggedIn = !!document.querySelector('#MiddleColumn')
    textArea = document.querySelector<HTMLElement>('#editable-message-text') ?? undefined
    messagesCount = document.querySelectorAll('.Message').length
    statusSpan = document.querySelector<HTMLElement>('span.status') ?? undefined
    webVersion = 'a'
  }
  presenceData = {
    ...presenceData,
    ...setPresenceData(
      presenceData,
      privacyMode,
      activeChatDetails,
      isLoggedIn,
      textArea,
      messagesCount,
      statusSpan,
      webVersion,
    ),
  }

  presence.setActivity(presenceData)
})

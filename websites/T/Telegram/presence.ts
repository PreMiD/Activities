import { Assets } from 'premid'

const presence = new Presence({
  clientId: '664595715242197008',
})

function setPresenceData(
  presenceData: PresenceData,
  showName: boolean,
  activeChatDetails?: HTMLElement,
  isLoggedIn?: boolean,
  textArea?: HTMLElement,
  messagesCount?: number,
  statusSpan?: HTMLElement,
): PresenceData {
  if (activeChatDetails?.textContent) {
    if (showName) {
      presenceData.details = `Talking to this ${
        statusSpan?.textContent?.includes('member') ? 'group' : 'user'
      }:`
      presenceData.state = activeChatDetails.textContent
    }
    else {
      presenceData.details = 'Talking to someone'
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
  const showName: boolean = await presence.getSetting<boolean>('name') // presence settings
  let presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Telegram/assets/logo.png',
  } // default PresenceData
  let isLoggedIn: boolean | undefined // determine if logged in or still logging in
  let activeChatDetails: HTMLElement | undefined // details of current active chat
  let textArea: HTMLElement | undefined // text area where user input message, for writing indicator
  let messagesCount: number | undefined // total message count inside active chat
  let statusSpan: HTMLElement | undefined // additional details of active chat, just below activeChatDetails, to determine if active chat is group or user
  if (document.location.href.includes('legacy=1')) {
    // Telegram Web version 0.7.0
    activeChatDetails = document.querySelector<HTMLElement>(
      'body > div.page_wrap > div:nth-child(1) > div > div > div.tg_head_main_wrap > div > div.tg_head_peer_title_wrap > a > div > span.tg_head_peer_title',
    ) ?? undefined
    isLoggedIn = document.querySelectorAll('.im_history_not_selected_wrap')?.length > 0
    textArea = document.querySelector<HTMLElement>('div.composer_rich_textarea') ?? undefined
    messagesCount = document.querySelectorAll('div.im_message_body').length
    statusSpan = document.querySelector<HTMLElement>('.tg_head_peer_status') ?? undefined
  }
  else if (document.location.href.includes('/k/')) {
    // Telegram WebK 1.2.0 (113)
    activeChatDetails = document.querySelector<HTMLElement>(
      '#column-center > div.chats-container > div.chat > div.sidebar-header > div.chat-info-container > div.chat-info > div.person > div.content > div.top > div.user-title > span.peer-title',
    ) ?? undefined
    isLoggedIn = (document.querySelector('.chat-background-item.is-visible')?.childElementCount ?? 0) < 1
    textArea = document.querySelector<HTMLElement>('.input-message-input') ?? undefined
    messagesCount = document.querySelectorAll('.message').length
    statusSpan = document.querySelector<HTMLElement>(
      'div.content > div.bottom > div.info > span.i18n',
    ) ?? undefined
  }
  else if (document.location.href.includes('/z/')) {
    // Telegram WebZ 1.35.1
    activeChatDetails = document.querySelector<HTMLElement>(
      '#MiddleColumn > div.messages-layout > div.MiddleHeader > div.Transition.slide-fade > div.Transition__slide--active > div.chat-info-wrapper > div.ChatInfo > div.info > div.title > h3',
    ) ?? undefined
    isLoggedIn = !!document.querySelector('#middle-column-bg')
    textArea = document.querySelector<HTMLElement>('#editable-message-text') ?? undefined
    messagesCount = document.querySelectorAll('.Message').length
    statusSpan = document.querySelector<HTMLElement>('span.status') ?? undefined
  }
  presenceData = {
    ...presenceData,
    ...setPresenceData(
      presenceData,
      showName,
      activeChatDetails,
      isLoggedIn,
      textArea,
      messagesCount,
      statusSpan,
    ),
  }

  presence.setActivity(presenceData)
})

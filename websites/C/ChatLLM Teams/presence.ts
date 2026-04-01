import { ActivityType, Assets } from 'premid'

const presence = new Presence({ clientId: '1485675381863219241' })

const browsingTimestamp = Math.floor(Date.now() / 1000)
// Variable to store the last known title when the sidebar is hidden
let lastKnownTitle = ''

enum ActivityAssets {
  Logo = 'https://play-lh.googleusercontent.com/O35u7LcmgKHsRpEQvHmT9ACfvDvP5S6HRIVmz-x-spUhojXIcnk0wbMEqaBSWPUJYQ?.png',
}

presence.on('UpdateData', async () => {
  const [title, timestamp] = await Promise.all([
    presence.getSetting<boolean>('title'),
    presence.getSetting<boolean>('timestamp'),
  ])

  const { href, search } = document.location
  if (!href.includes('apps.abacus.ai/chatllm')) {
    presence.clearActivity()
    return
  }
  const params = new URLSearchParams(search)
  const projectId = params.get('projectId')
  const convoId = params.get('convoId')

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    type: ActivityType.Playing,
  }

  const getTitleFromUI = () => {
    const activeChatElement = document.querySelector('div[class*=\'bg-bwleftblue/25\'] span[data-state], div[class*=\'dark:bg-bwleftblue/40\'] span[data-state]')
    if (activeChatElement?.textContent) {
      lastKnownTitle = activeChatElement.textContent.trim()
      return lastKnownTitle
    }
    const headerTitle = document.querySelector('h1, .text-xl, .font-bold')?.textContent
    if (headerTitle && !headerTitle.includes('ChatLLM'))
      return headerTitle.trim()
    return document.title.replace(` - ${lastKnownTitle}`, '').trim()
  }

  if (timestamp) {
    presenceData.startTimestamp = browsingTimestamp
  }

  if (convoId && projectId) {
    presenceData.details = 'Chatting in a project'
    presenceData.smallImageKey = Assets.Writing
    if (title)
      presenceData.state = `Project Chat: ${getTitleFromUI()}`
  }
  else if (convoId && !projectId) {
    presenceData.details = 'In a conversation'
    presenceData.smallImageKey = Assets.Writing
    if (title)
      presenceData.state = `Chat: ${getTitleFromUI()}`
  }
  else if (projectId && !convoId) {
    presenceData.details = 'Viewing a project'
    presenceData.smallImageKey = Assets.Reading
    if (title)
      presenceData.state = `Project: ${getTitleFromUI()}`
  }
  else {
    presenceData.details = 'On the home screen'
    presenceData.state = 'Exploring ChatLLM Teams'
    presenceData.smallImageKey = Assets.Search
  }

  presence.setActivity(presenceData)
})


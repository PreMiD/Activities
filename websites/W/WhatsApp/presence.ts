const presence = new Presence({
  clientId: '628019683718856714',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/WhatsApp/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const typing = document.querySelector(
    'span[class="selectable-text copyable-text"]',
  )
  const [showRecipient, showNumbers] = await Promise.all([
    presence.getSetting<boolean>('showRecipient'),
    presence.getSetting<boolean>('showNumbers'),
  ])

  let name = document
    .querySelector('.AmmtE')
    ?.querySelector('[class*="lhj4utae"]')
    ?.textContent

  if (
    name?.match(
      /^\+?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4,6}$/gm,
    )?.[0]
    && !showNumbers
  ) {
    name = ''
  }

  if (!name && !typing) {
    switch (true) {
      case !!document.querySelector('.ppled2lx'): {
        // Community tab
        presenceData.details = 'Viewing communities'
        break
      }
      case !!document.querySelector('.mrcito7c.r96muop5'): {
        // Status
        presenceData.details = 'Browsing all status updates'
        break
      }
      case !document.querySelector(
        '[data-testid="conversation-info-header"]',
      ): {
        presenceData.details = 'Browsing...'
        break
      }
      default: {
        presenceData.details = 'Texting with someone'
        presenceData.state = 'Just reading...'
        break
      }
    }
  }
  else if (document.querySelector('[role="tablist"]')) {
    // if contact windows with media/documents/etc is open
    presenceData.details = `Viewing ${document
      .querySelector('button[aria-selected="true"]')
      ?.textContent
      ?.toLowerCase()} in the chat with ${
      !showRecipient ? 'someone' : name
    }`
  }
  else if (document.querySelector('._2Ts6i._1xFRo > span > div')) {
    // If contact windows is open
    presenceData.details = `Viewing contact info of ${
      !showRecipient ? 'someone' : name
    }`
  }
  else {
    presenceData.details = `Texting with ${!showRecipient ? 'someone' : name}`
    presenceData.state = (typing?.textContent && 'Typing...') || 'Just reading...'
  }

  presence.setActivity(presenceData)
})

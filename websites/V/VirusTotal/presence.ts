const presence = new Presence({
  clientId: '650103083438702613',
})

function queryShadowText(selectors: string[]): string | undefined {
  let current: Element | Document | ShadowRoot | null = document

  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i]
    if (!current || !selector) return undefined

    const el: Element | null = current.querySelector(selector)
    if (!el) return undefined

    if (i === selectors.length - 1) {
      return el.textContent?.trim() || undefined
    }

    current = el.shadowRoot
  }

  return undefined
}

const actionLabels: Record<string, string> = {
  detection: 'Viewing detections of...',
  details: 'Viewing details of...',
  relations: 'Viewing relations of...',
  community: 'Reading comments of...',
  summary: 'Reading a summary of...',
  behavior: 'Observing the behavior of...',
}

presence.on('UpdateData', () => {
  const pathname = document.location.pathname.replace(/\/+$/, '')
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/V/VirusTotal/assets/logo.png',
  }

  switch (pathname) {
    case '/gui/home': {
      presenceData.details = 'Browsing the home page...'
      break
    }
    case '/gui/home/upload': {
      presenceData.details = 'Uploading a file...'
      break
    }
    case '/gui/home/url': {
      presenceData.details = 'Searching a URL...'
      break
    }
    case '/gui/home/search': {
      presenceData.details = 'Searching...'
      break
    }
    case '/gui/sign-in': {
      presenceData.details = 'Signing in...'
      break
    }
    case '/gui/join-us': {
      presenceData.details = 'Signing up...'
      break
    }
    case '/gui/settings': {
      presenceData.details = 'Updating their profile...'
      presenceData.state = queryShadowText([
        'body > vt-virustotal-app',
        '#toolbar',
        '#omnibarWrapper > vt-ui-account-widget',
        '#userDropdown > div.avatar-section > span',
      ])
      break
    }
    case '/gui/settings/activity': {
      presenceData.details = 'Viewing their account activity...'
      presenceData.state = queryShadowText([
        'body > vt-virustotal-app',
        '#toolbar',
        '#omnibarWrapper > vt-ui-account-widget',
        '#userDropdown > div.avatar-section > span',
      ])
      break
    }
    case '/gui/home/search/collection': {
      presenceData.details = 'Creating an IOC collection...'
      break
    }
    case '/gui/contact-us': {
      presenceData.details = 'Contacting support...'
      break
    }
    case '/gui/contact-us/support':
    case '/gui/contact-us/technical-support': {
      presenceData.details = 'Contacting for technical support...'
      break
    }
    case '/gui/contact-us/commercial': {
      presenceData.details = 'Contacting for commercial purposes...'
      break
    }
    case '/gui/contact-us/premium-services': {
      presenceData.details = 'Applying for premium services...'
      break
    }
    case '/gui/contact-us/upgrade-subscription': {
      presenceData.details = 'Upgrading their subscription...'
      break
    }
    case '/gui/contact-us/subscription': {
      presenceData.details = 'Inquiring about their subscription...'
      break
    }
    case '/gui/community-buzz': {
      presenceData.details = 'Browsing community buzz...'
      break
    }
    default: {
      if (pathname.includes('/gui/user/')) {
        const user = queryShadowText([
          'body > vt-virustotal-app',
          '#authChecker > user-view',
          '#pageWrapper > div.wrapper > vt-ui-generic-card > div:nth-child(2) > div.avatar-name > div > h3',
        ]) || pathname.split('/')[3]

        if (pathname.includes('/apikey')) {
          presenceData.details = 'Managing their API key...'
          presenceData.state = user
        }
        else if (pathname.includes('/comments')) {
          presenceData.details = user ? `Viewing ${user}'s comments...` : 'Viewing comments...'
        }
        else if (pathname.includes('/graphs')) {
          presenceData.details = user ? `Viewing ${user}'s graphs...` : 'Viewing graphs...'
        }
        else if (pathname.includes('/collections')) {
          presenceData.details = user ? `Viewing ${user}'s collections...` : 'Viewing collections...'
        }
        else {
          presenceData.details = user ? `Viewing ${user}'s profile` : 'Viewing a profile'
        }
      }
      else if (pathname.includes('/gui/top-users')) {
        presenceData.details = 'Viewing top users...'
      }
      else if (pathname.includes('/gui/domain/')) {
        const subroute = pathname.split('/').pop() || ''
        presenceData.details = actionLabels[subroute] || 'Viewing domain details...'
        presenceData.state = queryShadowText([
          'body > vt-virustotal-app',
          '#domainView',
          '#report',
          'div > header > vt-ui-domain-card',
          'vt-ui-generic-card > div:nth-child(2) > div:nth-child(1) > div.object-id > div.domain-id > span',
        ]) || pathname.split('/')[3]
      }
      else if (pathname.includes('/gui/file/')) {
        const subroute = pathname.split('/').pop() || ''
        presenceData.details = actionLabels[subroute] || 'Viewing file details...'
        presenceData.state = queryShadowText([
          'body > vt-virustotal-app',
          '#authChecker > file-view',
          '#report',
          'div > header > vt-ui-file-card',
          'vt-ui-generic-card > div:nth-child(2) > div:nth-child(1) > div.object-id > div.file-name > a',
        ]) || pathname.split('/')[3]
      }
      else if (pathname.includes('/gui/url/')) {
        const subroute = pathname.split('/').pop() || ''
        presenceData.details = actionLabels[subroute] || 'Viewing URL details...'
        presenceData.state = queryShadowText([
          'body > vt-virustotal-app',
          '#domainView',
          '#report',
          'div > header > vt-ui-domain-card',
          'vt-ui-generic-card > div:nth-child(2) > div:nth-child(1) > div.object-id > div.parent-domain > a',
        ]) || pathname.split('/')[3]
      }
      else {
        presence.clearActivity()
        return
      }
    }
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})
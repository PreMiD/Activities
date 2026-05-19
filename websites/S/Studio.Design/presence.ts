const presence = new Presence({
  clientId: '1263373102746964009',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/S/Studio.Design/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const privacy = await presence.getSetting<boolean>('privacy')
  const { pathname } = document.location

  switch (pathname) {
    // Projects
    case '/projects': {
      presenceData.details = 'Browsing Projects...'
      break
    }
    // Project Archive
    case '/projects/archive': {
      presenceData.details = 'Browsing Project Archives...'
      break
    }
    default:
      // Project Dashboard
      if (pathname.includes('/projects/') && pathname.includes('/dashboard/')) {
        // Project Name
        presenceData.details = privacy
          ? 'Project dashboard'
          : `${document?.title?.replace(
            / \| Studio(?:\.Design)?$/, // Global: Studio.Design / Japanese: Studio
            '',
          )} | Dashboard`
        // Home
        if (pathname.includes('/home')) {
          // Project Settings
          if (pathname.includes('/general'))
            presenceData.state = 'Managing Project Settings...'
          // Members
          else if (pathname.includes('/members'))
            presenceData.state = 'Managing Members...'
          // Apps
          else if (pathname.includes('/apps'))
            presenceData.state = 'Browsing Apps...'
          // Showcase
          else if (pathname.includes('/showcase'))
            presenceData.state = 'Viewing Showcase...'
          else presenceData.state = ''
        }
        // CMS
        else if (pathname.includes('/cms')) {
          presenceData.state = 'Managing CMS...'
        }
        // Forms
        else if (pathname.includes('/forms')) {
          presenceData.state = 'Viewing Forms...'
        }
        // Analytics
        else if (pathname.includes('/analytics')) {
          presenceData.state = 'Viewing Analytics...'
        }
        // Plan & Billing
        else if (pathname.includes('/plan')) {
          presenceData.state = 'Managing Plan & Billing...'
        }
      }
      // Payment
      else if (pathname.includes('/payment')) {
        presenceData.details = 'Managing Payment Settings...'
      }
      // Workspace
      else if (pathname.includes('/workspace/')) {
        presenceData.details = 'Managing Workspace...'
      }
      // Learn
      else if (pathname.includes('/learn')) {
        presenceData.details = 'Viewing Learning Resources...'
      }
      // Editor
      else if (
        pathname.includes('/projects/')
        && pathname.includes('/editor/')
      ) {
        if (privacy) {
          presenceData.details = 'Design Editor'
          presenceData.state = 'Editing Pages...'
        }
        else {
          // Base Selector
          // - English: Left panel
          // - Japanese: 左パネル
          const leftPanel = document.querySelector('[aria-label="左パネル"], [aria-label="Left panel"]')
          const tooltipSpans = leftPanel?.querySelectorAll('span.v-popper--has-tooltip')

          // Project Name
          presenceData.details = `${tooltipSpans?.[0]?.textContent ?? 'Unknown'} | Design Editor`

          // Page Title
          presenceData.state = `Editing: ${tooltipSpans?.[1]?.textContent ?? 'Unknown'}`
        }
      }
  }

  presence.setActivity(presenceData)
})

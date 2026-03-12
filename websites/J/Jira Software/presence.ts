const presence = new Presence({
  clientId: '782358522628145153', // Presence Application ID on Discord Developers.
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/J/Jira%20Software/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname

  if (document.location.hostname.match(/[a-z0-9]+\.atlassian\.net/)) {
    // If user is not creating a new issue.
    if (document.title !== 'Create issue - Jira') {
      // Projects homepage section.
      if (path === '/projects' || path === '/secure/BrowseProjects.jspa') {
        presenceData.details = 'Browsing Projects.'
      }
      else if (path.includes('/jira/software/projects/')) {
        // Project sections.
        const projectName = path
          .replace('/jira/software/projects/', '')
          .split('/')
          .shift()

        // Project Board section.
        if (path.match(/\/[a-zA-Z0-9]+\/boards\/\d$/)) {
          presenceData.details = `Viewing ${
            document.querySelector(
              '#jira-frontend > #helpPanelContainer > div:first-child > div > div[data-testid="Content"] > div:first-child > div:first-child > div:first-child > div > div:nth-child(2) > div:first-child > div:first-child > div > h1',
            )?.textContent
          }.`
          presenceData.state = `Project: ${projectName}`
        }
        else if (path.includes('/reports')) {
          // Project Report section.
          enum reportType {
            burnup = 'Analyzing Burnup report.',
            burndown = 'Analyzing Burndown report.',
            velocity = 'Analyzing Velocity report.',
            cumulative = 'Analyzing Cumulative report.',
          }

          presenceData.details = reportType[path.split('/').pop() as keyof typeof reportType]
            || 'Analyzing Reports.'
          presenceData.state = `Project: ${projectName}`
        }
        else if (path.includes('/issues/')) {
          // Project Issues section.
          const issueName = path.split('/').pop()

          if (issueName === '') {
            presenceData.details = 'Tracking Issues.'
            presenceData.state = `Project: ${projectName}`
          }
          else {
            presenceData.details = `Viewing Issue ${issueName}.`
            presenceData.state = `Project: ${projectName}`
          }
        }
        else if (path.includes('/settings/')) {
          // Project Settings section.
          // Getting user preference for showSettingsSections.
          const showSettingsSections = await presence.getSetting<boolean>(
            'showSettingsSections',
          )

          // If user set showSettingsSection = True
          if (showSettingsSections) {
            // Settings sections with no sub-links.
            if (!path.includes('/issuetypes') && !path.includes('/apps')) {
              enum settingsSection {
                details = 'Editing Details settings.',
                access = 'Editing Access settings.',
                notifications = 'Editing Notifications settings.',
                features = 'Editing Features settings.',
              }

              presenceData.details = settingsSection[
                path.split('/').pop() as keyof typeof settingsSection
              ]
              presenceData.state = `Project: ${projectName}`
            }
            else if (path.includes('/apps/')) {
              if (path.includes('/app-fields')) {
                presenceData.details = 'Editing Apps settings: App fields.'
                presenceData.state = `Project: ${projectName}`
              }
              else {
                presenceData.details = 'Editing Apps settings: Project automation.'
                presenceData.state = `Project: ${projectName}`
              }
            }
            else {
              presenceData.details = `Editing Issue type: ${
                document.querySelector(
                  '#jira-frontend > #helpPanelContainer > div > div > div[data-testid="Content"] > div:first-child > div:first-child > div > div:nth-child(2) > div > div > div:first-child > div:nth-child(3) > div > div > div:first-child > div > form > div > div > div > h1',
                )?.textContent
              }.`
              presenceData.state = `Project: ${projectName}`
            }
          }
          else {
            // If user set showSettingsSection = False
            presenceData.details = 'Editing Settings.'
            presenceData.state = `Project: ${projectName}`
          }
        }
        else {
          // Project sections with no sub-links.
          enum projectSections {
            roadmap = 'Viewing Roadmap.',
            backlog = 'Viewing Backlog.',
            code = 'Reviewing Code.',
            pages = 'Viewing Pages.',
          }

          presenceData.details = projectSections[
            path.split('/').pop() as keyof typeof projectSections
          ]
          presenceData.state = `Project: ${projectName}`
        }
      }
      else if (path.includes('/projects/')) {
        // Project Releases section, the only one with a different path.
        const projectName = path.replace('/projects/', '').split('/').pop()

        presenceData.details = 'Viewing Releases.'
        presenceData.state = `Project: ${projectName}`
      }
      else if (path === '/jira/your-work') {
        // Your work section.
        presenceData.details = 'Viewing personal Issues.'
      }
      else if (path.includes('/browse/')) {
        // Browsing Issue section.
        presenceData.details = `Viewing Issue ${path.split('/').pop()}`
      }
      else {
        switch (path) {
          case '/issues/': {
            // Advanced Issues section.
            enum issuesSection {
              'My open issues.' = -1,
              'Reported by me.' = -2,
              'Viewed recently.' = -3,
              'All issues.' = -4,
              'Open issues.' = -5,
              'Created recently.' = -6,
              'Resolved recently.' = -7,
              'Updated recently.' = -8,
              'Done issues.' = -9,
            }

            presenceData.details = 'Tracking global Issues:'
            presenceData.state = issuesSection[
              Number.parseInt(
                document.location.search.split('=', 2).pop()?.substr(0, 2) ?? '',
              )
            ] || 'Searching for an issue.'

            break
          }
          case '/secure/ManageFilters.jspa': {
            // Filters section.
            presenceData.details = 'Managing Filters.'

            break
          }
          case '/jira/dashboards': {
            // Dashboards homepage section.
            presenceData.details = 'Browsing Dashboards.'

            break
          }
          case '/secure/Dashboard.jspa': {
            // Dashboard section.
            presenceData.details = 'Viewing a Dashboard:'
            presenceData.state = document.querySelector(
              '#dashboard-content > div:first-child > div > div:first-child > h1',
            )?.textContent

            break
          }
          case '/jira/people/search': {
            // People homepage section. (yeah, path is correct, don't ask me why there is a "search", ~isladot)
            presenceData.details = 'Browsing Users.'

            break
          }
          default:
            if (path.match(/\/jira\/people\/[a-z0-9]+$/)) {
              // User profile page section.
              presenceData.details = 'Viewing a User:'
              presenceData.state = document.querySelector(
                '#jira-frontend > #helpPanelContainer > div > div > div[data-testid="Content"] > div:first-child > div > div > div > div > div:nth-child(2) > aside > div:first-child > div > div:nth-child(2) > h2',
              )?.textContent
            }
            else if (path.match(/\/jira\/people\/team\/[a-z0-9-]+$/)) {
              // Team profile page section.
              presenceData.details = 'Viewing a Team:'
              presenceData.state = document.querySelector(
                '#helpPanelContainer > div > div > div[data-testid="Content"] > div:first-child > div > div > div > div:nth-child(2) > aside > div:first-child > div > div:first-child > form > div > div > div > div',
              )?.textContent
            }
            else if (path === '/secure/ViewPersonalSettings.jspa') {
              // Personal settings section.
              presenceData.details = 'Editing Personal settings.'
            }
        }
      }
    }
    else {
      // If user is creating a new issue.
      presenceData.details = 'Creating an Issue.'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

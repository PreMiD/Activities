const presence = new Presence({
  clientId: '785263902321541181', // Presence Application ID on Discord Developers.
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

function unescapeHTML(string: string): string {
  const textarea = document.createElement('textarea')
  textarea.textContent = string
  return textarea.textContent
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LinkedIn/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname

  if (document.location.hostname === 'www.linkedin.com') {
    // Homepage.
    if (path === '/feed/') {
      presenceData.details = 'Browsing Feed.'
    }
    else if (path.includes('/feed/hashtag/')) {
      // Feed hashtag subsection.
      presenceData.details = 'Browsing Feed:'
      presenceData.state = `#${unescapeHTML(
        document
          .querySelector(
            'div.application-outlet > div.authentication-outlet > div > div > div > div > section > div > div:first-child > div > h3 > span > span:last-child',
          )
          ?.textContent
          ?.trim() ?? '',
      )}.`
    }
    else if (path.includes('/feed/')) {
      // Feed follow subsections.
      enum feedSubSection {
        'follow/' = 'Browsing suggestions.',
        'following/' = 'Viewing Following:',
        'followers/' = 'Viewing Followers.',
      }
      enum filterType {
        connection = 'Connections',
        member = 'Members',
        company = 'Companies',
        channel = 'Hashtags',
      }
      const subSection = feedSubSection[
        path.split('/feed/').pop() as keyof typeof feedSubSection
      ]

      presenceData.details = subSection
      // If the user is on following/ subsection, show the selected filter.
      if (subSection === feedSubSection['following/']) {
        presenceData.state = `Filtering by ${
          filterType[
            document.location.search
              .split('?filterType=')
              .pop()!
              .split('&')
              .shift() as keyof typeof filterType
          ] || 'All'
        }.`
      }
    }
    else if (path.includes('/mynetwork/')) {
      // My Network section & subsections.
      presenceData.details = 'Managing Network:'
      // Invitations subsection.
      if (path.includes('/invitation-manager/')) {
        presenceData.state = 'Viewing Invitations.'
      }
      // Contacts subsections.
      else if (
        path.includes('/import-contacts/')
        || path === '/mynetwork/contacts/'
      ) {
        // Contacts homepage.
        if (path === '/mynetwork/contacts/')
          presenceData.state = 'Browsing Contacts.'
        // Saved contacts.
        else if (path.endsWith('saved-contacts/'))
          presenceData.state = 'Browsing Saved contacts.'
        // Adding contacts.
        else presenceData.state = 'Adding Contacts.'
      }
      else if (path.includes('/colleagues/')) {
        // Teammates subsection.
        presenceData.state = 'Browsing Colleagues.'
      }
      // My Network subsections with same link path structure.
      else {
        enum networkSubSection {
          'connections/' = 'Browsing Connections.',
          'events/' = 'Browsing Events.',
          'newsletters/' = 'Reading Newsletters.',
        }

        presenceData.state = networkSubSection[
          path
            .split(/\/[a-z]+-[a-z]+\//)
            .pop() as keyof typeof networkSubSection
        ] || 'Homepage.'
      }
    }
    else if (path.includes('/jobs/') || path === '/my-items/saved-jobs/') {
      // Jobs section.
      // Application settings subsection.
      if (path.endsWith('application-settings/')) {
        presenceData.details = 'Editing settings:'
        presenceData.state = 'Application.'
      }
      else {
        // Others subsections.
        presenceData.details = 'Browsing Jobs:'

        // Saved Jobs subsection.
        if (path === '/my-items/saved-jobs/') {
          presenceData.state = 'Saved Jobs.'
        }
        // Searching for a Job subsection.
        else if (path === '/jobs/search/') {
          // Getting user preference for showJobsQuery.
          const showJobsQuery = await presence.getSetting<boolean>(
            'showJobsQuery',
          )

          if (showJobsQuery) {
            presenceData.state = `Searching for a "${decodeURI(
              document.location.search
                .split('keywords=')
                .pop()!
                .split('&')
                .shift()!,
            )}" position.`
          }
          else {
            presenceData.state = 'Searching for a job.'
          }
        }
        else {
          presenceData.state = 'Homepage.'
        }
        // Homepage.
      }
    }
    else if (path.includes('/interview-prep/')) {
      // Interview prep section (Jobs related section with a different path).

      presenceData.details = 'Taking an Interview Prep:'
      presenceData.state = `${unescapeHTML(
        document
          .querySelector(
            'div.application-outlet > div.authentication-outlet > main > div > section > section > header > div > div:first-child > h2',
          )
          ?.textContent
          ?.trim() ?? '',
      )}.`
    }
    else if (path.includes('/messaging/')) {
      // Messaging section.
      presenceData.details = 'Messaging:'
      // New message subsection.
      if (path === '/messaging/thread/new/') {
        presenceData.state = 'Writing a new message.'
      }
      // New group subsection.
      else if (path === '/messaging/compose-group/') {
        presenceData.state = 'Creating a new group.'
      }
      // Chats subsection.
      else {
        // Getting user preference for showChatUsername.
        const showChatUsername = await presence.getSetting<boolean>(
          'showChatUsername',
        )

        if (showChatUsername) {
          presenceData.state = `Chatting with ${unescapeHTML(
            document
              .querySelector(
                'div.application-outlet > div.authentication-outlet > #messaging > div > div > div:nth-child(2) > div:first-child > div > a > div > div > dl > dt > #thread-detail-jump-target',
              )
              ?.textContent
              ?.trim() ?? '',
          )}.`
        }
        else {
          presenceData.state = 'Chatting with someone.'
        }
      }
    }
    else if (path === '/notifications/') {
      // Notifications section.
      presenceData.details = 'Viewing Notifications.'
    }
    else if (path.match(/\/in\/[A-Za-z0-9-]+\/$/)) {
      // Profile page section.
      presenceData.details = 'Viewing a profile:'
      presenceData.state = `${document
        .querySelector(
          'div.application-outlet > div.authentication-outlet > #profile-content > div > div > div > div:nth-child(2) > main > div > section > div:nth-child(2) > div:nth-child(2) > div:first-child > ul:first-child > li:first-child',
        )
        ?.textContent
        ?.trim()}.`
    }
    else if (path.match(/\/in\/[A-Za-z0-9-]+\//)) {
      // Profile detail subsection.
      if (path.includes('/detail/')) {
        enum detailSubSection {
          'recent-activity' = 'Activities',
          'skills' = 'Skills',
          'interests' = 'Interests',
          'contact-info' = 'Contact Info',
        }
        // If the user is editing skills (the only edit related subsection with "detail" path).
        if (path === '/in/luca-biagetti/detail/skills/add/') {
          presenceData.details = 'Editing profile:'
          presenceData.state = 'Skills.'
        }
        else {
          // Actually detail subsections.
          presenceData.details = 'Viewing user details:'
          presenceData.state = `${unescapeHTML(
            path !== '/in/luca-biagetti/detail/recent-activity/'
              ? document
                .querySelector(
                  'div.application-outlet > div.authentication-outlet > #profile-content > div > div > div > div:nth-child(2) > main > div > section > div:nth-child(2) > div:nth-child(2) > div:first-child > ul:first-child > li:first-child',
                )
                ?.textContent
                ?.trim() ?? ''
              : document
                .querySelector(
                  'div.application-outlet > div.authentication-outlet > #profile-content > div > div > div > div > div:first-child > header > h1',
                )
                ?.textContent
                ?.trim()
                ?.replace('’s Activity', '') ?? '',
          )}'s ${
            detailSubSection[
              path
                .split(/\/in\/[A-Za-z0-9-]+\/detail\//)
                .pop()!
                .split('/')
                .shift() as keyof typeof detailSubSection as keyof typeof detailSubSection
            ]
          }.`
        }
      }
      else if (path.includes('/edit/')) {
        // Profile edit subsection.
        enum editSubSection {
          'intro' = 'Intro.',
          'about' = 'About.',
          'add-feed-post' = 'Posts.',
          'add-article' = 'Articles.',
          'add-link' = 'Links.',
          'position' = 'Experiences.',
          'education' = 'Education.',
          'certification' = 'Certifications.',
          'volunteer-experience' = 'Volunteer experiences.',
          'publication' = 'Publications.',
          'patent' = 'Patents.',
          'course' = 'Courses.',
          'project' = 'Projects.',
          'honor' = 'Honors & Awards.',
          'test-score' = 'Test scores.',
          'language' = 'Languages.',
          'organization' = 'Organizations.',
          'secondary-language' = 'Secondary language.',
          'contact-info' = 'Contact info.',
        }

        presenceData.details = 'Editing profile:'
        presenceData.state = editSubSection[
          path
            .split(/\/in\/[A-Za-z0-9-]+\/edit\//)
            .pop()!
            .replace('forms/', '')
            .split('/')
            .shift() as keyof typeof editSubSection
        ]
      }
    }
    else if (path.match(/\/company\/[A-Za-z0-9-]+\//)) {
      // Company page section.
      presenceData.details = 'Viewing a company:'
      presenceData.state = `${unescapeHTML(
        document
          .querySelector(
            'div.application-outlet > div.authentication-outlet > div > div:nth-child(3) > div:first-child > section > div > div > div:nth-child(2) > div:first-child > div:first-child > div:nth-child(2) > div > h1 > span',
          )
          ?.textContent
          ?.trim() ?? '',
      )}.`
    }
    else if (path.match(/\/school\/[A-Za-z0-9-]+\//)) {
      // School page section.
      presenceData.details = 'Viewing a school:'
      presenceData.state = `${unescapeHTML(
        document
          .querySelector(
            'div.application-outlet > div.authentication-outlet > div > div:nth-child(3) > div:first-child > section > div > div > div:nth-child(2) > div:first-child > div:first-child > div:nth-child(2) > div > h1 > span',
          )
          ?.textContent
          ?.trim() ?? '',
      )}.`
    }
    else if (path.startsWith('/groups/')) {
      // Groups section.
      // Group page subsection.
      if (path.match(/\/groups\/\d+\//)) {
        presenceData.details = 'Viewing a group:'
        presenceData.state = `${unescapeHTML(
          document
            .querySelector(
              'div.application-outlet > div.authentication-outlet > div > div:nth-child(2) > main > div:first-child > section > div > h1 > span',
            )
            ?.textContent
            ?.trim()
            ?.replaceAll('<!---->', '') ?? '',
        )}.`
      }
      else {
        presenceData.details = 'Browsing Groups:'
        // Requested groups subsection.
        if (path === '/groups/requests/')
          presenceData.state = 'Requested groups.'
        // Homepage.
        else presenceData.state = 'My groups.'
      }
    }
    else if (path.includes('/psettings/')) {
      // Settings section.
      presenceData.details = 'Editing settings.'
    }
    else if (path === '/my-items/') {
      // My Items section.
      presenceData.details = 'Browsing My Items.'
    }
    else if (path === '/post/new/') {
      // New Post section.
      presenceData.details = 'Writing a New Post.'
    }
    else if (path.includes('/search/results/')) {
      // Searching for something section.
      presenceData.details = 'Searching for something.'
    }
    else {
      // Others sections in "Work" category not supported atm.
      presenceData.details = 'Doing stuffs.'
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

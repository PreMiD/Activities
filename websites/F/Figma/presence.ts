const presence = new Presence({
  clientId: '768942376403075073', // Discord Client ID
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const assets = {
  'home': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/0.png',
  'house': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/1.png',
  'settings': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/2.png',
  'user': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/3.png',
  'search': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/4.png',
  'extension': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/5.png',
  'history': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/6.png',
  'coding': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/7.png',
  'layers': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/8.png',
  'help': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/9.png',
  'blog': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/10.png',
  'community': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/11.png',
  'communication': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/12.png',
  'globe': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/13.png',
  'down-arrow': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/14.png',
  'view': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/15.png',
  'group': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/16.png',
  'edit': 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/17.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Figma/assets/logo.png', // Banner
  }
  presenceData.startTimestamp = browsingTimestamp

  function figmapresence(
    nome: keyof typeof assets,
    imagetext: string,
    details: string,
    state: string,
  ) {
    presenceData.smallImageKey = assets[nome]
    presenceData.smallImageText = imagetext
    presenceData.details = details
    presenceData.state = state
  }
  function shortpresence(
    nome: keyof typeof assets,
    imagetext: string,
    details: string,
  ) {
    presenceData.smallImageKey = assets[nome] // SmallImageKey Function
    presenceData.smallImageText = imagetext // smallImageText Function
    presenceData.details = details // details Function
  }
  if (document.location.pathname === '/') {
    // Main Page

    presenceData.smallImageKey = assets.home
    presenceData.smallImageText = 'Figma'
    presenceData.details = 'Homepage'
  }
  else if (document.location.pathname.endsWith('/product/')) {
    // BLOG
    // Product in Figma Blog

    figmapresence(
      'blog',
      '"Product" | Figma Blog',
      'Viewing Product',
      'In Figma Blog...',
    )
  }
  else if (document.location.pathname.endsWith('/engineering/')) {
    // Engineering in Figma Blog

    figmapresence(
      'blog',
      '"Engineering" | Figma Blog',
      'Viewing Engineering',
      'In Figma Blog...',
    )
  }
  else if (document.location.pathname.endsWith('/editorial/')) {
    // Editorial in Figma Blog

    figmapresence(
      'blog',
      '"Editorial" | Figma Blog',
      'Viewing Editorial',
      'In Figma Blog...',
    )
  }
  else if (document.location.pathname.endsWith('/archive/')) {
    // Archive in Figma Blog

    figmapresence(
      'blog',
      '"Archive" | Figma Blog',
      'Viewing Archive',
      'In Figma Blog...',
    )
  }
  else if (document.location.pathname.startsWith('/blog/')) {
    // Blog Page

    const blogname = document.querySelector(
      '#gatsby-focus-wrapper > div > div.css-eg6erc > div.css-1b2yn3b > h1',
    )?.textContent
    if (blogname === '') {
      figmapresence('blog', 'Blog | Figma', 'In Figma Blog', '')
    }
    else {
      figmapresence(
        'blog',
        'Blog | Figma',
        `${'Viewing: ' + '"'}${blogname}"`,
        'In Figma Blog...',
      )
    }
  }
  else if (document.location.pathname.startsWith('/ui-design-tool/')) {
    // UI Design Tool

    figmapresence(
      'layers',
      'UI Design Tool | Figma',
      'In UI Design',
      'Tool Page...',
    )
  }
  else if (document.location.pathname.startsWith('/ux-design-tool/')) {
    // UX Design Tool

    figmapresence(
      'layers',
      'UI Design Tool | Figma',
      'In UX Design',
      'Tool Page...',
    )
  }
  else if (document.location.pathname.startsWith('/graphic-design-tool/')) {
    // Graphic Design Tool

    figmapresence(
      'layers',
      'Graphic Design Tool | Figma',
      'In Graphic Design',
      'Tool Page...',
    )
  }
  else if (document.location.pathname.startsWith('/wireframe-tool/')) {
    // Wireframing Tool

    figmapresence(
      'layers',
      'Wireframing Tool | Figma',
      'In Wireframing',
      'Tool Page...',
    )
  }
  else if (document.location.pathname.startsWith('/brainstorming-tool/')) {
    // Brainstorming Tool

    figmapresence(
      'layers',
      'Brainstorming Tool | Figma',
      'In Brainstorming',
      'Tool Page...',
    )
  }
  else if (document.location.pathname.startsWith('/templates/')) {
    // Templates Tool

    figmapresence(
      'layers',
      'Templates Tool | Figma',
      'In Templates',
      'Tool Page...',
    )
  }
  else if (document.location.pathname.startsWith('/remote-design/')) {
    // Remote Design Page

    figmapresence(
      'layers',
      'Remote Design Page | Figma',
      'In Remote',
      'Design Page...',
    )
  }
  else if (document.location.pathname.startsWith('/design')) {
    // Design Page

    figmapresence('layers', 'Design Page | Figma', 'In Design', 'Page...')
  }
  else if (document.location.pathname.startsWith('/events')) {
    // Events Page

    figmapresence('layers', 'Events Page | Figma', 'In Events', 'Page...')
  }
  else if (document.location.pathname.startsWith('/prototyping')) {
    // Prototyping Page

    figmapresence(
      'layers',
      'Prototyping Page | Figma',
      'In Prototyping',
      'Page...',
    )
  }
  else if (document.location.pathname.startsWith('/design-systems')) {
    // Design System Page

    figmapresence(
      'layers',
      'Design Systems Page | Figma',
      'In Design Systems',
      'Page...',
    )
  }
  else if (document.location.pathname.startsWith('/education/')) {
    // Education Page

    figmapresence(
      'layers',
      'Education Page | Figma',
      'In Education',
      'Page...',
    )
  }
  else if (document.location.pathname.startsWith('/security/')) {
    // Security Page

    figmapresence('layers', 'Security Page | Figma', 'In Security', 'Page...')
  }
  else if (document.location.pathname.startsWith('/product-integrations/')) {
    // Product Integrations Page

    figmapresence(
      'layers',
      'Product Integrations Page | Figma',
      'In Product',
      'Integrations Page...',
    )
  }
  else if (document.location.pathname.startsWith('/best-practices/')) {
    // Best Practices Page

    figmapresence(
      'layers',
      'Best Practices Page | Figma',
      'In Best',
      'Practices Page...',
    )
  }
  else if (
    document.location.pathname.startsWith('/agency-partner-program/')
  ) {
    // Agency Partner Program

    figmapresence(
      'layers',
      'Agency Partner Program | Figma',
      'Viewing Agency',
      'Partner Program...',
    )
  }
  else if (document.location.pathname.startsWith('/summary-of-policy/')) {
    // Privacy Policy Page

    figmapresence(
      'layers',
      'Privacy Policy Page | Figma',
      'In Privacy',
      'Policy Page...',
    )
  }
  else if (document.location.pathname.endsWith('api')) {
    // API Figma Page

    figmapresence('coding', 'API | Figma', 'Viewing', 'Figma API...')
  }
  else if (document.location.pathname.endsWith('embed')) {
    // Live Embed Kit

    figmapresence(
      'coding',
      'Live Embed Kit | Figma',
      'Viewing Figma',
      'Live Embed Kit...',
    )
  }
  else if (document.location.pathname.startsWith('/developers')) {
    // Developers Page

    figmapresence(
      'coding',
      'Figma Developers | Figma',
      'In Developers',
      'Page...',
    )
  }
  else if (document.location.pathname.includes('plugin-docs')) {
    // Figma Developers Docs

    figmapresence(
      'coding',
      'Figma Developers | Figma',
      `${'Viewing: ' + '"'}${
        document.querySelector(
          'body > div.navPusher > div > div.container.mainContainer > div > div.post > header > h1',
        )?.textContent
      }"`,
      'In Figma Developers...',
    )
  }
  else if (document.location.pathname.startsWith('/collaboration')) {
    // Collaboration Page

    figmapresence(
      'layers',
      'Collaboration Page | Figma',
      'In Collaboration',
      'Page...',
    )
  }
  else if (document.location.pathname.startsWith('/whats-new')) {
    // News Page

    figmapresence('layers', 'News Page | Figma', 'In News', 'Page...')
  }
  else if (document.location.pathname.startsWith('/downloads')) {
    // Download Page

    figmapresence(
      'down-arrow',
      'Download Page | Figma',
      'In Download',
      'Page...',
    )
  }
  else if (document.location.pathname.startsWith('/organization')) {
    // Organization Page

    figmapresence(
      'layers',
      'Organization Page | Figma',
      'In Organization',
      'Page...',
    )
  }
  else if (document.location.pathname.startsWith('/customers')) {
    // Customers Page

    figmapresence(
      'layers',
      'Customers Page | Figma',
      'In Customers',
      'Page...',
    )
  }
  else if (document.location.pathname.startsWith('/contact')) {
    // Contact Page

    figmapresence('layers', 'Contact Page | Figma', 'In Contact', 'Page...')
  }
  else if (document.location.pathname.startsWith('/pricing')) {
    // Pricing Page

    figmapresence('layers', 'Pricing Page | Figma', 'In Pricing', 'Page...')
  }
  else if (document.location.pathname.startsWith('/figma-vs-sketch/')) {
    // Figma Vs Sketch

    figmapresence('layers', 'Vs Page | Figma', 'Viewing Figma Vs', 'Sketch...')
  }
  else if (document.location.pathname.startsWith('/figma-vs-adobe-xd/')) {
    // Figma Vs Adobe XD

    figmapresence(
      'layers',
      'Vs Page | Figma',
      'Viewing Figma Vs',
      'Adobe XD...',
    )
  }
  else if (
    document.location.pathname.startsWith('/figma-vs-invision-studio/')
  ) {
    // Figma Vs inVision

    figmapresence(
      'layers',
      'Vs Page | Figma',
      'Viewing Figma Vs',
      'InVision...',
    )
  }
  else if (document.location.pathname.startsWith('/figma-vs-framer/')) {
    // Figma Vs Framer

    figmapresence('layers', 'Vs Page | Figma', 'Viewing Figma Vs', 'Framer...')
  }
  else if (document.location.pathname.startsWith('/sketch-alternative/')) {
    // Viewing Sketch Alternative

    figmapresence(
      'layers',
      'Sketch Alternative | Figma',
      'Viewing Sketch',
      'Alternative...',
    )
  }
  else if (document.location.pathname.includes('careers')) {
    // Careers Page

    figmapresence('layers', 'Careers Page | Figma', 'In Careers', 'Page...')
  }
  else if (document.location.href.includes('about')) {
    // About Us Page

    figmapresence('layers', 'About Us | Figma', 'In About Us', 'Page...')
  }
  else if (document.location.pathname.includes('articles')) {
    // HELP PAGE CENTER
    // Articles Page Help cennter

    const articlename = document.querySelector(
      '#article-container > article > header > h1 > span',
    )?.textContent
    figmapresence(
      'help',
      `${articlename} | Figma`,
      `${'Viewing: ' + '"'}${articlename}"`,
      'Figma Help Center',
    )
  }
  else if (
    document.location.pathname.includes('Getting-Started')
    || document.location.pathname.includes('Get-started')
  ) {
    //* Get-started Page Help center

    figmapresence(
      'help',
      'About Us | Figma',
      '"Get Started" Category',
      'Figma Help Center',
    )
  }
  else if (document.location.pathname.includes('Use-Figma')) {
    // Use-Figma Page Help center

    figmapresence(
      'help',
      'Use Figma | Figma',
      '"Use Figma" Category',
      'Figma Help Center',
    )
  }
  else if (document.location.pathname.includes('Admin')) {
    // Admin Page Help center

    figmapresence(
      'help',
      'Admin | Figma',
      '"Admin" Category',
      'Figma Help Center',
    )
  }
  else if (document.location.pathname.includes('create-team')) {
    // EDITING FILES
    // Creating Team

    figmapresence('group', 'New Team | Figma', 'Creating a', 'New Team...')
  }
  else if (document.location.pathname.includes('team')) {
    // Team page
    const teamname = document.querySelector(
      '#react-page > div > div > div:nth-child(1) > div.file_browser_view--fileBrowserPageViewContainer--1olui > div.file_browser_page_view--container--88Ioi > div.file_browser_page_view--metaContainer--33Uas > div.team_overview--metaTeamName--29dvj.org_home_view_meta_content--orgName--3XeZo.text--fontPos18--3M8-H.text--_fontBase--YWDo0',
    )?.textContent
    figmapresence(
      'group',
      `In ${teamname} | Figma`,
      `In ${teamname}`,
      'Team...',
    )
  }
  else if (document.location.pathname.includes('recent')) {
    // Recent files

    figmapresence(
      'history',
      'Recent Projects | Figma',
      'Viewing Recent',
      'Projects...',
    )
  }
  else if (document.location.pathname.includes('search')) {
    // Searching files
    const [search] = document.title.split('- Figma')
    shortpresence('search', search!, search!)
  }
  else if (document.location.pathname.endsWith('drafts')) {
    // Drafts page

    figmapresence(
      'edit',
      'Viewing Drafts | Figma',
      'Viewing Drafts ',
      'Of Projects...',
    )
  }
  else if (document.location.pathname.endsWith('deleted')) {
    // Projects Deleted

    figmapresence(
      'edit',
      'Deleted Projects | Figma',
      'Viewing Deleted ',
      'Projects...',
    )
  }
  else if (document.location.pathname.includes('add-collaborators')) {
    // Adding Collaborators

    figmapresence(
      'group',
      'Adding Collaborators | Figma',
      'Adding New',
      'Collaborators...',
    )
  }
  else if (document.location.pathname.includes('upgrade-team')) {
    // Upgrading Team

    figmapresence(
      'group',
      'Upgrading Team | Figma',
      'Upgrading',
      'The Team...',
    )
  }
  else if (
    document.location.pathname.includes('user')
    || document.location.pathname.includes('settings')
  ) {
    // User Settigns page

    figmapresence('settings', 'Settings | Figma', 'In account', 'Settings...')
  }
  else if (document.location.pathname.includes('user')) {
    // User page
    const accountname = document.querySelector(
      '#react-page > div > div > div:nth-child(1) > div.file_browser_view--fileBrowserPageViewContainer--1olui > div.file_browser_page_view--container--88Ioi > div.file_browser_page_view--metaContainer--33Uas > div > div.org_user_meta_content--userData--1PIu7 > div.org_user_meta_content--userName--2uyUU.text--fontPos18--3M8-H.text--_fontBase--YWDo0',
    )?.textContent

    if (accountname === '') {
      figmapresence('user', 'Account | Figma', 'Viewing an', 'Account...')
    }
    else {
      figmapresence(
        'user',
        `${accountname} | Figma`,
        `In ${accountname}'s`,
        'Account...',
      )
    }
  }
  else if (document.location.pathname.includes('file')) {
    // Viewing and editing files
    if (document.location.pathname.includes('community')) {
      const [filename] = document.title.split('- Figma')
      figmapresence('view', filename!, 'Viewing:', filename!)
    }
    else {
      const [filename] = document.title.split('- Figma')
      figmapresence('edit', filename!, 'Editing:', filename!)
    }
  }
  else if (document.location.pathname.includes('Community')) {
    // Community Page Help center

    figmapresence(
      'help',
      'Community | Figma',
      '"Community" Category',
      'Figma Help Center',
    )
  }
  else if (document.location.pathname.includes('More')) {
    // More Page Help center

    figmapresence(
      'help',
      'More | Figma',
      '"More" Category',
      'Figma Help Center',
    )
  }
  else if (document.location.pathname.includes('en-us')) {
    // Help center

    figmapresence(
      'help',
      'Help Center | Figma',
      'In Help Center',
      'Figma Help Center',
    )
  }
  else if (document.location.pathname.includes('@')) {
    // PROJECTS & COMMUNITY
    // Figma Users

    const username = document.querySelector(
      '#react-page > div > div > div:nth-child(1) > div.file_browser_view--tabletOptimizedFileBrowserPageViewContainer--1O5aq.file_browser_view--fileBrowserPageViewContainer--1olui > div.file_browser_page_view--tabletOptimizedContainer--2YFqY.file_browser_page_view--container--88Ioi > div > div > div:nth-child(3) > div > div.profile_resources_grid--profileDataContainer--2jkBg.text--fontPos14--3UJ36.text--_fontBase--YWDo0 > div:nth-child(1) > div.profile_resources_grid--profileDataHandle--2m2Km',
    )?.textContent

    figmapresence(
      'user',
      `${username} | Figma Community`,
      `Viewing ${
        document.querySelector(
          '#react-page > div > div > div:nth-child(1) > div.file_browser_view--tabletOptimizedFileBrowserPageViewContainer--1O5aq.file_browser_view--fileBrowserPageViewContainer--1olui > div.file_browser_page_view--tabletOptimizedContainer--2YFqY.file_browser_page_view--container--88Ioi > div > div > div:nth-child(3) > div > div.profile_resources_grid--profileDataContainer--2jkBg.text--fontPos14--3UJ36.text--_fontBase--YWDo0 > div:nth-child(1) > div.profile_resources_grid--profileDataName--_-XIm.text--fontPos24Whyte--HMiux.text--_fontBaseWhyte--e6y38',
        )?.textContent
      }'s`,
      `${'Profile' + ' ('}${username})`,
    )
  }
  else if (document.location.pathname.endsWith('icons')) {
    // Community page

    figmapresence(
      'globe',
      'Icons | Figma Community',
      'Viewing Icons',
      'In Community page...',
    )
  }
  else if (document.location.pathname.endsWith('typography')) {
    // Community page

    figmapresence(
      'globe',
      'Typography | Figma Community',
      'Viewing Typography',
      'In Community page...',
    )
  }
  else if (document.location.pathname.endsWith('mobile_design')) {
    // Community page

    figmapresence(
      'globe',
      'Mobile Design | Figma Community',
      'Viewing Mobile Design',
      'In Community page...',
    )
  }
  else if (document.location.pathname.endsWith('web_design')) {
    // Community page

    figmapresence(
      'globe',
      'Web Design | Figma Community',
      'Viewing Web Design',
      'In Community page...',
    )
  }
  else if (document.location.pathname.endsWith('ui_kits')) {
    // Community page

    figmapresence(
      'globe',
      'UI Kits | Figma Community',
      'Viewing UI Kits',
      'In Community page...',
    )
  }
  else if (document.location.pathname.endsWith('illustrations')) {
    // Community page

    figmapresence(
      'globe',
      'Illustrations | Figma Community',
      'Viewing Illustrations',
      'In Community page...',
    )
  }
  else if (document.location.pathname.endsWith('wireframes')) {
    // Community page

    figmapresence(
      'globe',
      'Wireframes | Figma Community',
      'Viewing Wireframes',
      'In Community page...',
    )
  }
  else if (document.location.pathname.endsWith('design_systems')) {
    // Community page

    figmapresence(
      'globe',
      'Design Systems | Figma Community',
      'Viewing Design Systems',
      'In Community page...',
    )
  }
  else if (document.location.pathname.includes('explore')) {
    // Exploring Figma Community

    figmapresence(
      'globe',
      'Explore | Figma Community',
      'Exploring',
      'Figma Community...',
    )
  }
  else if (document.location.pathname.includes('community')) {
    // Community page

    figmapresence('globe', 'Community | Figma', 'In Community', 'Page...')
  }
  else {
    // Generic

    figmapresence('search', 'Figma', 'Exploring ', 'Figma...')
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

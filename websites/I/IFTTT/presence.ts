import { Assets } from 'premid'

const presence = new Presence({
  clientId: '665519810054062100',
})

let oldLang: string,
  newLang: string,
  strings: Awaited<ReturnType<typeof getStrings>>

presence.on('UpdateData', async () => {
  const path = window.location.pathname.split('/').slice(1)
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/I/IFTTT/assets/logo.png',
  }

  oldLang = newLang
  newLang = await presence.getSetting<string>('lang').catch(() => 'en')
  if (!strings || oldLang !== newLang)
    strings = await getStrings(newLang)

  switch (window.location.hostname) {
    case 'ift.tt': {
      // IFTTT URL Shortener (for the Help Center)
      return presence.setActivity()
    }
    case 'help.ifttt.com': {
      // IFTTT Help Center
      switch (path[0]) {
        // Startpage
        case 'hc':
          presenceData.details = 'Help Center'

          if (path.length > 2) {
            switch (path[2]) {
              // Articles
              case 'articles':
                presenceData.state = 'Article: '
                break
                // Categories
              case 'categories':
                presenceData.state = 'Category: '
                break
                // Sections
              case 'sections':
                presenceData.state = 'Section: '
                break
                // Unknown
              default:
                presenceData.state = ''
                break
            }

            const heading = document.querySelector<HTMLHeadingElement>('h1')
            if (heading)
              presenceData.state += heading.textContent
          }
          break
          // Unknown
        default:
          return presence.setActivity()
      }

      break
    }
    case 'platform.ifttt.com': {
      // IFTTT for Businesses / Developers
      switch (path[0]) {
        // Documentation
        case 'docs': {
          const chapter = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          const section = document.querySelector<HTMLAnchorElement>(
            'a.active',
          )?.textContent

          presenceData.details = 'Documentation'
          if (chapter)
            presenceData.state = `${chapter}${section ? ` - ${section}` : ''}`
          presenceData.smallImageText = strings.reading
          presenceData.smallImageKey = Assets.Reading
          break
        }
        // Developer spotlight
        case 'blog':
          presenceData.details = 'Developer spotlight'
          if (path[1]) {
            presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          }
          break
          // Solutions
        case 'solutions':
          presenceData.details = 'Solutions'
          if (path[1]) {
            presenceData.state = document.querySelector<HTMLHeadingElement>('h3')?.textContent
          }
          break
          // Case studies
        case 'case_studies':
          presenceData.details = 'Case studies'
          if (path[1]) {
            presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          }
          break
          // Testimonials
        case 'testimonials':
          presenceData.details = 'Testimonials'
          break
          // Contact sales
        case 'contact_sales':
          presenceData.details = 'Contact sales'
          break
          // Startpage, Unknown
        default:
          return presence.setActivity()
      }

      break
    }
    case 'status.ifttt.com': {
      // IFTTT Status
      switch (path[0]) {
        // Incidents
        case 'incidents':
          presenceData.details = 'IFTTT Status - Incident Report'
          presenceData.state = document.querySelector<HTMLDivElement>(
            '.incident-name',
          )?.textContent
          break
          // Startpage, Unknown
        default: {
          let incidents: HTMLDivElement[]

          try {
            incidents = [
              ...(document.querySelector<HTMLDivElement>(
                '.unresolved-incidents',
              )?.children as unknown as HTMLDivElement[] ?? []),
            ].filter(e => e.style.display !== 'none')
          }
          catch {
            incidents = []
          }

          presenceData.details = 'IFTTT Status'
          if (incidents.length > 0)
            presenceData.state = `Unresolved incidents: ${incidents.length}`
          break
        }
      }

      break
    }
    default: {
      // Main page
      switch (path[0]) {
        // Applets
        case 'applets':
          presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          presenceData.state = `by ${
            document.querySelector<HTMLSpanElement>('.author')?.textContent
          }`
          presenceData.smallImageText = strings.browsing
          presenceData.smallImageKey = Assets.Reading
          break
          // Account settings
        case 'settings':
          presenceData.details = 'Account settings'
          break
          // Billing
        case 'billing':
          presenceData.details = 'Billing'
          break
          // My Applets
        case 'home':
        case 'my_applets':
          presenceData.details = 'My Applets'
          break
          // Creating an Applet
        case 'create':
          presenceData.details = 'Creating an Applet'
          presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          break
          // Activity
        case 'activity':
          presenceData.details = 'Activity'
          break
          // My Services
        case 'date_and_time':
        case 'email':
        case 'email_digest':
        case 'ifttt':
        case 'feed':
        case 'space':
        case 'weather':
        case 'maker_webhooks':
        case 'my_services': {
          const category = document.querySelector<HTMLHeadingElement>('h1')?.textContent

          presenceData.details = 'My Services'
          if (category)
            presenceData.state = category
          presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/I/IFTTT/assets/logo.png'
          presenceData.smallImageText = strings.browsing
          presenceData.smallImageKey = Assets.Reading
          break
        }
        // Explore, Blog entry, Search
        case 'explore':
        case 'search': {
          const search = document.querySelector<HTMLInputElement>('#search')?.value

          if (
            document.querySelector<HTMLDivElement>('.story-title')?.textContent
          ) {
            presenceData.details = 'Blog'
            presenceData.state = document.querySelector<HTMLHeadingElement>('h1')?.textContent
            presenceData.smallImageText = strings.reading
            presenceData.smallImageKey = Assets.Reading
          }
          else if (search) {
            presenceData.details = 'Searching for Applets & Services'
            presenceData.state = search
            presenceData.smallImageText = strings.search
            presenceData.smallImageKey = Assets.Search
          }
          else {
            presenceData.details = 'Exploring Applets & Services'
            presenceData.smallImageText = strings.browsing
            presenceData.smallImageKey = Assets.Reading
          }
          break
        }
        // Plans
        case 'plans':
          presenceData.details = 'Plans'
          break
          // Blog
        case 'blog':
          presenceData.details = 'Blog'
          presenceData.smallImageText = strings.reading
          presenceData.smallImageKey = Assets.Reading
          break
          // Developers
        case 'developers':
          presenceData.details = 'Developers'
          break
          // Contact
        case 'contact':
          presenceData.details = 'Contact'
          break
          // Trust & Privacy
        case 'terms':
          presenceData.details = 'Privacy Policy & Terms of Use'
          break
          // Careers
        case 'careers':
          presenceData.details = 'Careers'
          break
          // Startpage, Services, Unknown
        default:
          if (!document.querySelector<HTMLDivElement>('.brand-section'))
            return presence.setActivity()

          presenceData.details = document.querySelector<HTMLHeadingElement>('h1')?.textContent
          presenceData.state = document.querySelector<HTMLImageElement>(
            '.large-service-logo',
          )?.title
          presenceData.smallImageText = strings.browsing
          presenceData.smallImageKey = Assets.Reading
          break
      }
    }
  }

  presence.setActivity(presenceData)
})

async function getStrings(lang: string) {
  return presence.getStrings(
    {
      search: 'general.searching',
      browsing: 'general.browsing',
      reading: 'general.reading',
    },
    lang,
  )
}

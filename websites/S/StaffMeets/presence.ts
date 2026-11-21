import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1550487889195049100',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/RUDOez4.png',
}

interface JobData {
  title?: string
  org?: string
  employmentType?: string
}

const STRINGS = {
  en: {
    homeDetails: 'Exploring StaffMeets',
    homeState: 'Recruitment platform',
    homeHover: 'Homepage',
    jobsDetails: 'Browsing job offers',
    jobsState: 'Looking for talent & opportunities',
    jobsHover: 'Job directory',
    jobsSearchingDetails: 'Searching job offers',
    jobsSearchingState: (q: string) => `Looking for "${q}"`,
    jobsSearchingHover: 'Searching',
    jobOfferDetails: (t: string) => `Viewing offer: ${t}`,
    jobOfferPrivateDetails: 'Viewing a job offer',
    jobOfferPrivateState: 'Recruitment opportunity',
    jobOfferState: (org: string, type?: string) => type ? `for ${org} · ${type}` : `for ${org}`,
    jobOfferDefaultState: 'Recruitment offer',
    jobOfferHover: 'Viewing offer',
    dashboardDetails: 'Viewing Dashboard',
    dashboardState: 'Managing activities',
    dashboardHover: 'Dashboard',
    candidateDetails: 'Candidate Space',
    candidateState: 'Managing applications',
    candidateProfileDetails: 'Candidate Profile',
    candidateProfileState: 'Editing candidate profile',
    candidateAppsDetails: 'My Applications',
    candidateAppsState: 'Tracking application status',
    candidateHover: 'Candidate',
    recruiterDetails: 'Recruiter Space',
    recruiterState: 'Managing recruitment listings',
    recruiterJobsDetails: 'Managing Job Postings',
    recruiterJobsState: 'Published listings',
    recruiterAppsDetails: 'Reviewing Applicants',
    recruiterAppsState: 'Evaluating candidates',
    recruiterCreateDetails: 'New Job Posting',
    recruiterCreateState: 'Creating an announcement',
    recruiterHover: 'Recruiter',
    onboardingDetails: 'Getting Started',
    onboardingState: 'Setting up account',
    onboardingHover: 'Onboarding',
    previewDetails: 'Previewing job offer',
    previewState: 'Reviewing announcement',
    previewHover: 'Preview',
    loginDetails: 'Signing In',
    loginState: 'Connecting with Discord',
    loginHover: 'Login',
    termsDetails: 'Reading Terms of Service',
    termsState: 'Legal information',
    termsHover: 'Terms',
    privacyDetails: 'Reading Privacy Policy',
    privacyState: 'Privacy information',
    privacyHover: 'Privacy',
    cookieDetails: 'Reading Cookie Policy',
    cookieState: 'Cookie settings',
    cookieHover: 'Cookies',
    supportDetails: 'Help & Support',
    supportState: 'Support center',
    supportHover: 'Support',
    buttonViewOffer: 'View Job Offer',
    buttonBrowseJobs: 'Browse All Jobs',
    fallbackDetails: 'Exploring StaffMeets',
    fallbackState: 'Recruitment platform',
    fallbackHover: 'Browsing',
    types: {
      volunteer: 'Volunteer',
      fullTime: 'Full-time',
      partTime: 'Part-time',
      contract: 'Contract',
      internship: 'Internship',
    },
  },
  fr: {
    homeDetails: 'Découvre StaffMeets',
    homeState: 'Plateforme de recrutement',
    homeHover: 'Accueil',
    jobsDetails: 'Parcourt les offres',
    jobsState: 'À la recherche d\'opportunités',
    jobsHover: 'Catalogue des offres',
    jobsSearchingDetails: 'Recherche d\'offres',
    jobsSearchingState: (q: string) => `Recherche : "${q}"`,
    jobsSearchingHover: 'Recherche',
    jobOfferDetails: (t: string) => `Consulte : ${t}`,
    jobOfferPrivateDetails: 'Consulte une offre',
    jobOfferPrivateState: 'Opportunité de recrutement',
    jobOfferState: (org: string, type?: string) => type ? `chez ${org} · ${type}` : `chez ${org}`,
    jobOfferDefaultState: 'Offre de recrutement',
    jobOfferHover: 'Consultation d\'offre',
    dashboardDetails: 'Tableau de bord',
    dashboardState: 'Gestion des activités',
    dashboardHover: 'Dashboard',
    candidateDetails: 'Espace Candidat',
    candidateState: 'Gestion des candidatures',
    candidateProfileDetails: 'Profil Candidat',
    candidateProfileState: 'Édition du profil / CV',
    candidateAppsDetails: 'Mes Candidatures',
    candidateAppsState: 'Suivi des candidatures',
    candidateHover: 'Candidat',
    recruiterDetails: 'Espace Recruteur',
    recruiterState: 'Gestion des recrutements',
    recruiterJobsDetails: 'Gestion des Annonces',
    recruiterJobsState: 'Offres publiées',
    recruiterAppsDetails: 'Candidatures Reçues',
    recruiterAppsState: 'Examen des profils',
    recruiterCreateDetails: 'Nouvelle Annonce',
    recruiterCreateState: 'Création d\'une offre',
    recruiterHover: 'Recruteur',
    onboardingDetails: 'Configuration du compte',
    onboardingState: 'Bienvenue sur StaffMeets',
    onboardingHover: 'Bienvenue',
    previewDetails: 'Aperçu de l\'annonce',
    previewState: 'Vérification de l\'offre',
    previewHover: 'Aperçu',
    loginDetails: 'Connexion',
    loginState: 'Authentification Discord',
    loginHover: 'Connexion',
    termsDetails: 'Conditions d\'utilisation',
    termsState: 'Informations légales',
    termsHover: 'CGU',
    privacyDetails: 'Politique de confidentialité',
    privacyState: 'Protection des données',
    privacyHover: 'Confidentialité',
    cookieDetails: 'Politique des cookies',
    cookieState: 'Gestion des cookies',
    cookieHover: 'Cookies',
    supportDetails: 'Centre d\'aide',
    supportState: 'Support & FAQ',
    supportHover: 'Support',
    buttonViewOffer: 'Voir l\'offre',
    buttonBrowseJobs: 'Toutes les offres',
    fallbackDetails: 'Découvre StaffMeets',
    fallbackState: 'Plateforme de recrutement',
    fallbackHover: 'Navigation',
    types: {
      volunteer: 'Bénévolat',
      fullTime: 'Temps plein',
      partTime: 'Temps partiel',
      contract: 'Rémunéré / Contrat',
      internship: 'Stage',
    },
  },
}

function resolveLanguage(langSetting: unknown, pathname: string): 'fr' | 'en' {
  if (langSetting === 1 || langSetting === '1' || langSetting === 'Français')
    return 'fr'
  if (langSetting === 2 || langSetting === '2' || langSetting === 'English')
    return 'en'

  // Default / 0 / 'Auto': detect from path or html lang attribute
  return pathname.startsWith('/fr') || document.documentElement.lang.toLowerCase().startsWith('fr')
    ? 'fr'
    : 'en'
}

function normalizeEmploymentType(raw: string | undefined, lang: 'en' | 'fr'): string | undefined {
  if (!raw)
    return undefined

  const upper = raw.toUpperCase()
  const t = STRINGS[lang].types
  if (upper.includes('VOLUNTEER') || upper.includes('BÉNÉVOLE') || upper.includes('BENEVOLE'))
    return t.volunteer
  if (upper.includes('FULL') || upper.includes('PLEIN'))
    return t.fullTime
  if (upper.includes('PART') || upper.includes('PARTIEL'))
    return t.partTime
  if (upper.includes('CONTRACT') || upper.includes('FREELANCE') || upper.includes('RÉMUNÉRÉ') || upper.includes('REMUNERE'))
    return t.contract
  if (upper.includes('INTERN') || upper.includes('STAGE'))
    return t.internship

  return raw
}

function getJobData(lang: 'en' | 'fr'): JobData | null {
  const jsonLdScripts = document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/ld+json"]',
  )

  for (const script of jsonLdScripts) {
    try {
      const data = JSON.parse(script.textContent ?? '')
      if (data?.['@type'] === 'JobPosting') {
        const title = typeof data.title === 'string' ? data.title.trim() : undefined
        const org = typeof data.hiringOrganization?.name === 'string'
          ? data.hiringOrganization.name.trim()
          : undefined
        const employmentType = typeof data.employmentType === 'string'
          ? normalizeEmploymentType(data.employmentType, lang)
          : undefined
        if (title || org)
          return { title, org, employmentType }
      }
    }
    catch {
      // Ignore invalid JSON-LD content
    }
  }

  const h1 = document.querySelector('h1')?.textContent?.trim()
  if (h1)
    return { title: h1 }

  return null
}

function getSearchQuery(): string | null {
  const searchParam = new URLSearchParams(document.location.search).get('q')
    ?? new URLSearchParams(document.location.search).get('search')
  if (searchParam?.trim())
    return searchParam.trim()

  const searchInput = document.querySelector<HTMLInputElement>(
    'input[type="search"], input[placeholder*="search" i], input[placeholder*="recherche" i]',
  )
  if (searchInput?.value?.trim())
    return searchInput.value.trim()

  return null
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location
  const path = pathname.replace(/^\/[a-z]{2}(?:\/|$)/i, '/').replace(/\/$/, '') || '/'

  const [langSetting, privacySetting, showRoleTypeSetting, timestampSetting, buttonsSetting] = await Promise.all([
    presence.getSetting<number | string>('lang').catch(() => 0),
    presence.getSetting<boolean>('privacy').catch(() => false),
    presence.getSetting<boolean>('showRoleType').catch(() => true),
    presence.getSetting<boolean>('timestamp').catch(() => true),
    presence.getSetting<boolean>('buttons').catch(() => true),
  ])

  const chosenLang = resolveLanguage(langSetting, pathname)
  const s = STRINGS[chosenLang]
  const privacy = privacySetting ?? false
  const showRoleType = (showRoleTypeSetting ?? true) && !privacy
  const showTimestamp = timestampSetting ?? true
  const showButtons = (buttonsSetting ?? true) && !privacy

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }

  if (path === '/') {
    presenceData.details = s.homeDetails
    presenceData.state = s.homeState
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = s.homeHover
  }
  else if (path === '/jobs') {
    const query = getSearchQuery()
    if (query) {
      presenceData.details = s.jobsSearchingDetails
      presenceData.state = s.jobsSearchingState(query)
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = s.jobsSearchingHover
    }
    else {
      presenceData.details = s.jobsDetails
      presenceData.state = s.jobsState
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = s.jobsHover
    }

    if (showButtons) {
      presenceData.buttons = [
        {
          label: s.buttonBrowseJobs,
          url: document.location.href,
        },
      ]
    }
  }
  else if (path.startsWith('/jobs/')) {
    const job = getJobData(chosenLang)
    if (privacy) {
      presenceData.details = s.jobOfferPrivateDetails
      presenceData.state = s.jobOfferPrivateState
    }
    else {
      presenceData.details = job?.title ? s.jobOfferDetails(job.title) : s.jobOfferPrivateDetails
      const typeDisplay = showRoleType ? job?.employmentType : undefined
      presenceData.state = job?.org ? s.jobOfferState(job.org, typeDisplay) : s.jobOfferDefaultState

      if (showButtons) {
        presenceData.buttons = [
          {
            label: s.buttonViewOffer,
            url: document.location.href,
          },
          {
            label: s.buttonBrowseJobs,
            url: `${document.location.origin}/${chosenLang}/jobs`,
          },
        ]
      }
    }
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = s.jobOfferHover
  }
  else if (path === '/dashboard') {
    presenceData.details = s.dashboardDetails
    presenceData.state = s.dashboardState
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = s.dashboardHover
  }
  else if (path.startsWith('/candidate')) {
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = s.candidateHover
    if (path.includes('/profile')) {
      presenceData.details = s.candidateProfileDetails
      presenceData.state = s.candidateProfileState
    }
    else if (path.includes('/applications')) {
      presenceData.details = s.candidateAppsDetails
      presenceData.state = s.candidateAppsState
    }
    else {
      presenceData.details = s.candidateDetails
      presenceData.state = s.candidateState
    }
  }
  else if (path.startsWith('/recruiter')) {
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = s.recruiterHover
    if (path.includes('/jobs')) {
      presenceData.details = s.recruiterJobsDetails
      presenceData.state = s.recruiterJobsState
    }
    else if (path.includes('/applications')) {
      presenceData.details = s.recruiterAppsDetails
      presenceData.state = s.recruiterAppsState
    }
    else if (path.includes('/create') || path.includes('/new')) {
      presenceData.details = s.recruiterCreateDetails
      presenceData.state = s.recruiterCreateState
    }
    else {
      presenceData.details = s.recruiterDetails
      presenceData.state = s.recruiterState
    }
  }
  else if (path.startsWith('/onboarding')) {
    presenceData.details = s.onboardingDetails
    presenceData.state = s.onboardingState
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = s.onboardingHover
  }
  else if (path.startsWith('/preview')) {
    presenceData.details = s.previewDetails
    presenceData.state = s.previewState
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = s.previewHover
  }
  else if (path.startsWith('/login')) {
    presenceData.details = s.loginDetails
    presenceData.state = s.loginState
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = s.loginHover
  }
  else if (path.startsWith('/terms')) {
    presenceData.details = s.termsDetails
    presenceData.state = s.termsState
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = s.termsHover
  }
  else if (path.startsWith('/privacy')) {
    presenceData.details = s.privacyDetails
    presenceData.state = s.privacyState
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = s.privacyHover
  }
  else if (path.startsWith('/cookie-policy')) {
    presenceData.details = s.cookieDetails
    presenceData.state = s.cookieState
    presenceData.smallImageKey = Assets.Reading
    presenceData.smallImageText = s.cookieHover
  }
  else if (path.startsWith('/support')) {
    presenceData.details = s.supportDetails
    presenceData.state = s.supportState
    presenceData.smallImageKey = Assets.Question
    presenceData.smallImageText = s.supportHover
  }
  else {
    const heading = document.querySelector('h1')?.textContent?.trim()
    presenceData.details = heading || s.fallbackDetails
    presenceData.state = s.fallbackState
    presenceData.smallImageKey = Assets.Viewing
    presenceData.smallImageText = s.fallbackHover
  }

  if (!showTimestamp)
    delete presenceData.startTimestamp

  if (presenceData.details)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})

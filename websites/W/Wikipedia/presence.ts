const presence = new Presence({
  clientId: '609364070684033044',
})

async function getStrings() {
  return presence.getStrings(
    {
      browsing: 'general.browsing',
      readingAnArticle: 'general.readingAnArticle',
      readingArticle: 'general.readingArticle',
      viewACategoryTalkPage: 'wikipedia.viewACategoryTalkPage',
      viewADraft: 'general.viewADraft',
      viewADraftTalkPage: 'wikipedia.viewADraftTalkPage',
      viewAFile: 'general.viewAFile',
      viewAFileTalkPage: 'wikipedia.viewAFileTalkPage',
      viewAGadget: 'wikipedia.viewAGadget',
      viewAGadgetDefinitionPage: 'wikipedia.viewAGadgetDefinitionPage',
      viewAGadgetDefinitionTalkPage: 'wikipedia.viewAGadgetDefinitionTalkPage',
      viewAGadgetTalkPage: 'wikipedia.viewAGadgetTalkPage',
      viewAHelppage: 'general.viewAHelppage',
      viewAHelpTalkPage: 'wikipedia.viewAHelpTalkPage',
      viewAMedia: 'wikipedia.viewAMedia',
      viewAMediaSubtitles: 'wikipedia.viewAMediaSubtitles',
      viewAMediaSubtitlesTalkPage: 'wikipedia.viewAMediaSubtitlesTalkPage',
      viewAModule: 'general.viewAModule',
      viewAModuleTalkPage: 'wikipedia.viewAModuleTalkPage',
      viewAnEducationProgramPage: 'wikipedia.viewAnEducationProgramPage',
      viewAnEducationProgramTalkPage: 'wikipedia.viewAnEducationProgramTalkPage',
      viewAnInterface: 'wikipedia.viewAnInterface',
      viewAnInterfaceTalkPage: 'wikipedia.viewAnInterfaceTalkPage',
      viewAnUsersPage: 'wikipedia.viewAnUsersPage',
      viewAnUsersTalkPage: 'wikipedia.viewAnUsersTalkPage',
      viewAPage: 'general.viewAPage',
      viewAPortal: 'wikipedia.viewAPortal',
      viewAPortalTalkPage: 'wikipedia.viewAPortalTalkPage',
      viewAProjectPage: 'wikipedia.viewAProjectPage',
      viewAProjectTalkPage: 'wikipedia.viewAProjectTalkPage',
      viewASpecialPage: 'wikipedia.viewSpecialPage',
      viewATalkPage: 'wikipedia.viewATalkPage',
      ViewATemplate: 'general.ViewATemplate',
      viewATemplateTalkPage: 'wikipedia.viewATemplateTalkPage',
      viewATopic: 'general.viewATopic',
      viewAWikipediaBook: 'wikipedia.viewAWikipediaBook',
      viewAWikipediaBookTalkPage: 'wikipedia.viewAWikipediaBookTalkPage',
      viewCategory: 'general.viewCategory',
      viewCategoryTalkPage: 'wikipedia.viewCategoryTalkPage',
      viewDraft: 'general.viewDraft',
      viewDraftTalkPage: 'wikipedia.viewDraftTalkPage',
      viewEducationProgramPage: 'wikipedia.viewEducationProgramPage',
      viewEducationProgramTalkPage: 'wikipedia.viewEducationProgramTalkPage',
      viewFile: 'general.viewFile',
      viewFileTalkPage: 'wikipedia.viewFileTalkPage',
      viewGadget: 'wikipedia.viewGadget',
      viewGadgetDefinitionPage: 'wikipedia.viewGadgetDefinitionPage',
      viewGadgetDefinitionTalkPage: 'wikipedia.viewGadgetDefinitionTalkPage',
      viewGadgetTalkPage: 'wikipedia.viewGadgetTalkPage',
      viewHelppage: 'general.viewHelppage',
      viewHelpTalkPage: 'wikipedia.viewHelpTalkPage',
      viewHome: 'general.viewHome',
      viewInterface: 'wikipedia.viewInterface',
      viewInterfaceTalkPage: 'wikipedia.viewInterfaceTalkPage',
      viewMedia: 'wikipedia.viewMedia',
      viewMediaSubtitles: 'wikipedia.viewMediaSubtitles',
      viewMediaSubtitlesTalkPage: 'wikipedia.viewMediaSubtitlesTalkPage',
      viewModule: 'general.viewModule',
      viewModuleTalkPage: 'wikipedia.viewModuleTalkPage',
      viewPage: 'general.viewPage',
      viewPortal: 'wikipedia.viewPortal',
      viewPortalTalkPage: 'wikipedia.viewPortalTalkPage',
      viewProjectPage: 'wikipedia.viewProjectPage',
      viewProjectTalkPage: 'wikipedia.viewProjectTalkPage',
      viewSpecialPage: 'wikipedia.viewASpecialPage',
      viewTalkPage: 'wikipedia.viewTalkPage',
      ViewTemplate: 'general.ViewTemplate',
      viewTemplateTalkPage: 'wikipedia.viewTemplateTalkPage',
      viewTopic: 'general.viewTopic',
      viewUsersPage: 'wikipedia.viewUsersPage',
      viewUsersTalkPage: 'wikipedia.viewUsersTalkPage',
      viewWikipediaBook: 'wikipedia.viewWikipediaBook',
      viewWikipediaBookTalkPage: 'wikipedia.viewWikipediaBookTalkPage',
    },

  )
}
let strings: Awaited<ReturnType<typeof getStrings>>
let prevURL: string
let browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Wikipedia/assets/logo.png',
}

presence.on('UpdateData', async () => {
  const { pathname, href } = document.location
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const privacy = await presence.getSetting<number>('privacy')
  const title = document.querySelector('.mw-page-title-main,h1')?.textContent

  let details: { [index: string]: string }

  if (!prevURL)
    prevURL = href
  else if (prevURL !== href)
    browsingTimestamp = Math.floor(Date.now() / 1000)

  if (!strings) {
    strings = await getStrings()
  }

  switch (true) {
    case pathname === '':
    case pathname === '/': {
      presenceData.details = privacy === 0 || privacy === 1
        ? strings.viewHome
        : strings.browsing
      break
    }
    case privacy === 0: {
      details = {
        '-2': strings.viewMedia,
        '-1': strings.viewSpecialPage,
        '0': strings.readingArticle,
        '1': strings.viewTalkPage,
        '2': strings.viewUsersPage,
        '3': strings.viewUsersTalkPage,
        '4': strings.viewProjectPage,
        '5': strings.viewProjectTalkPage,
        '6': strings.viewFile,
        '7': strings.viewFileTalkPage,
        '8': strings.viewInterface,
        '9': strings.viewInterfaceTalkPage,
        '10': strings.ViewTemplate,
        '11': strings.viewTemplateTalkPage,
        '12': strings.viewHelppage,
        '13': strings.viewCategoryTalkPage,
        '14': strings.viewCategory,
        '15': strings.viewHelpTalkPage,
        '100': strings.viewPortal,
        '101': strings.viewPortalTalkPage,
        '118': strings.viewDraft,
        '119': strings.viewDraftTalkPage,
        '710': strings.viewMediaSubtitles,
        '711': strings.viewMediaSubtitlesTalkPage,
        '828': strings.viewModule,
        '829': strings.viewModuleTalkPage,
        '108': strings.viewWikipediaBook,
        '109': strings.viewWikipediaBookTalkPage,
        '446': strings.viewEducationProgramPage,
        '447': strings.viewEducationProgramTalkPage,
        '2300': strings.viewGadget,
        '2301': strings.viewGadgetTalkPage,
        '2302': strings.viewGadgetDefinitionPage,
        '2303': strings.viewGadgetDefinitionTalkPage,
        '2600': strings.viewTopic,
      }
      if (details) {
        presenceData.details = details[
          [...document.querySelector('body')?.classList ?? []]
            .find(v => /ns--?\d/.test(v))
            ?.split('[', 1)[0]
            ?.slice(3) ?? ''
        ] || strings.viewAPage
      }
      break
    }
    case privacy === 1:
    {
      details = {
        '-2': strings.viewAMedia,
        '-1': strings.viewASpecialPage,
        '0': strings.readingAnArticle,
        '1': strings.viewATalkPage,
        '2': strings.viewAnUsersPage,
        '3': strings.viewAnUsersTalkPage,
        '4': strings.viewAProjectPage,
        '5': strings.viewAProjectTalkPage,
        '6': strings.viewAFile,
        '7': strings.viewAFileTalkPage,
        '8': strings.viewAnInterface,
        '9': strings.viewAnInterfaceTalkPage,
        '10': strings.ViewATemplate,
        '11': strings.viewATemplateTalkPage,
        '12': strings.viewAHelppage,
        '13': strings.viewACategoryTalkPage,
        '14': strings.viewCategory,
        '15': strings.viewAHelpTalkPage,
        '100': strings.viewAPortal,
        '101': strings.viewAPortalTalkPage,
        '118': strings.viewADraft,
        '119': strings.viewADraftTalkPage,
        '710': strings.viewAMediaSubtitles,
        '711': strings.viewAMediaSubtitlesTalkPage,
        '828': strings.viewAModule,
        '829': strings.viewAModuleTalkPage,
        '108': strings.viewAWikipediaBook,
        '109': strings.viewAWikipediaBookTalkPage,
        '446': strings.viewAnEducationProgramPage,
        '447': strings.viewAnEducationProgramTalkPage,
        '2300': strings.viewAGadget,
        '2301': strings.viewAGadgetTalkPage,
        '2302': strings.viewAGadgetDefinitionPage,
        '2303': strings.viewAGadgetDefinitionTalkPage,
        '2600': strings.viewATopic,
      }
      if (details) {
        presenceData.details = details[
          [...document.querySelector('body')?.classList ?? []]
            .find(v => /ns--?\d/.test(v))
            ?.split('[', 1)[0]
            ?.slice(3) ?? ''
        ] || strings.viewAPage
      }
      break
    }
  }

  if (privacy === 0 && title)
    presenceData.state = title

  if (
    privacy === 3
    && presenceData.smallImageKey
    && presenceData.smallImageText
  ) {
    delete presenceData.smallImageText
    delete presenceData.smallImageKey
  }

  if (privacy === 3 && presenceData.smallImageKey)
    delete presenceData.smallImageKey

  if (privacy !== 0 && presenceData.state)
    delete presenceData.state

  presence.setActivity(presenceData)
})

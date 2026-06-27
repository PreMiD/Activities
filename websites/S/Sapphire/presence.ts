

const presence = new Presence({
  clientId: '678344927997853742',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.discordapp.com/avatars/678344927997853742/37e0fb2dcf8d219aa92bf02f47ea60eb.webp?size=1024',
}

/* -----------------------------------------
   LANGUAGE KEYS (en + hu)
----------------------------------------- */
const LANG = {
  en: {
    site: 'Website (Dashboard or Docs)',

    home: {
      main: 'Homepage',
      about: 'Reading about us',
      status: 'Viewing status',
      custombranding: 'Viewing custom branding subscription',
      limitincrease: 'Viewing limit increase',
      terms: 'Viewing Terms of Service',
      privacy: 'Viewing Privacy Policy',
      rightofwithdrawal: 'Viewing Right of Withdrawal',
      licenses: 'Viewing Licenses',
      legalnotice: 'Viewing Legal Notice'
    },

    dashboard: {
      main: 'Dashboard (Selecting Server)',
      module: 'Viewing dashboard module',

      modules: {
        home: 'Home',

        generalSettings: {
          main: 'General Settings',
          errorLog: 'Error Logs'
        },

        commands: {
          main: 'Commands',
          customCommands: 'Custom Commands',
          defaultCommands: 'Default Commands'
        },

        messages: {
          main: 'Messages',
          templates: 'Templates',
          components: 'Components',
          defaultMessages: 'Default Messages'
        },

        customBranding: {
          buy: 'Buy Custom Branding',
          settings: 'Custom Branding Settings'
        },

        autoModeration: {
          main: 'Auto Moderation',
          discord: 'Discord Auto Moderation',
          advanced: 'Advanced Auto Moderation'
        },

        moderation: {
          main: 'Moderation',
          cases: 'Cases',
          caseView: 'Viewing Case',
          report: 'Report System',
          customizeMessages: 'Customize Messages',
          autoActions: 'Automated Actions',
          messageHistories: 'Message Histories',
          punishSettings: 'Punishment Settings',
          immuneRoles: 'Immune Roles',
          userNotifications: 'User Notifications',
          predefinedReasons: 'Predefined Reasons',
          channelLocking: 'Channel Locking',
          privacy: 'Privacy'
        },

        socialNotifications: 'Social Notifications',

        joinRoles: 'Join Roles',

        reactionRoles: {
          messages: 'Reaction Roles Messages',
          settings: 'Reaction Roles Settings'
        },

        welcomeMessages: {
          main: 'Welcome Messages',
          join: 'Join Messages',
          leave: 'Leave Messages',
          boost: 'Boost Messages',
          role: 'Role Add Messages'
        },

        roleConnections: 'Role Connections',

        logging: {
          type: 'Logging',
          settings: 'Logging Settings'
        }
      }
    },

    docs: {
      main: 'Documentation',
      reading: 'Reading documentation',

      pages: {
        overview: 'Viewing Overview',
        gettingStarted: 'Viewing Getting Started',
        changelog: 'Viewing Changelog',
        generalsettings: 'Viewing General Settings',
        commands: 'Viewing Commands',
        messages: 'Viewing Messages',
        custombranding: 'Viewing Custom Branding',
        automoderation: 'Viewing Auto Moderation',
        moderation: 'Viewing Moderation',
        appeals: 'Viewing Appeals',
        socailnotifications: 'Viewing Social Notifications',
        joinroles: 'Viewing Join Roles',
        reactionroles: 'Viewing Reaction Roles',
        welcomemessages: 'Viewing Welcome Messages',
        roleconnections: 'Viewing Role Connections',
        logging: 'Viewing Logging',
        faq: 'Viewing FAQ',
        guildes: 'Viewing Guides',
        troubleshoot: 'Viewing Troubleshoot'
      }
    }
  },

  hu: {
    site: 'Weboldal (Kezelőfelület vagy Dokumentáció)',

    home: {
      main: 'Főoldal',
      about: 'Rólunk olvas',
      status: 'Státusz megtekintése',
      custombranding: 'Custom branding előfizetés megtekintése',
      limitincrease: 'Limit növelés megtekintése',
      terms: 'A szerződési feltételek megtekintése',
      privacy: 'Az adatvédelmi irányelvek megtekintése',
      rightofwithdrawal: 'A jogok megszerzése megtekintése',
      licenses: 'A licencek megtekintése',
      legalnotice: 'A jogi értesítés megtekintése'
    },

    dashboard: {
      main: 'Vezérlőpult (Szerver Választása)',
      module: 'Modul megtekintése',

      modules: {
        home: 'Főoldal',

        generalSettings: {
          main: 'Általános Beállítások',
          errorLog: 'Hiba Logok'
        },

        commands: {
          main: 'Parancsok',
          customCommands: 'Egyedi Parancsok',
          defaultCommands: 'Alap Parancsok'
        },

        messages: {
          main: 'Üzenetek',
          templates: 'Sablonok',
          components: 'Komponensek',
          defaultMessages: 'Alap Üzenetek'
        },

        customBranding: {
          buy: 'Custom Branding Vásárlás',
          settings: 'Custom Branding Beállítások'
        },

        autoModeration: {
          main: 'Auto Moderáció',
          discord: 'Discord Auto Moderáció',
          advanced: 'Fejlett Auto Moderáció'
        },

        moderation: {
          main: 'Moderáció',
          cases: 'Ügyek',
          caseView: 'Ügy Megtekintése',
          report: 'Report Rendszer',
          customizeMessages: 'Üzenet Testreszabása',
          autoActions: 'Automatizált Műveletek',
          messageHistories: 'Üzenet Előzmények',
          punishSettings: 'Büntetés Beállítások',
          immuneRoles: 'Immunis Rangok',
          userNotifications: 'Felhasználó Értesítések',
          predefinedReasons: 'Előre Megadott Indokok',
          channelLocking: 'Csatorna Zárolás',
          privacy: 'Moderáció: Adatvédelem'
        },

        socialNotifications: 'Média Értesítések',

        joinRoles: 'Belépési Rangok',

        reactionRoles: {
          messages: 'Reakció Rangok Üzenetek',
          settings: 'Reakció Rangok Beállítások'
        },

        welcomeMessages: {
          main: 'Üdvözlő Üzenetek',
          join: 'Belépési Üzenetek',
          leave: 'Kilépési Üzenetek',
          boost: 'Boost Üzenetek',
          role: 'Rang Hozzáadás Üzenetek'
        },

        roleConnections: 'Rang Kapcsolatok',

        logging: {
          type: 'Logolás',
          settings: 'Logolási Beállítások'
        }
      }
    },

    docs: {
      main: 'Dokumentáció',
      reading: 'Dokumentáció olvasása',

      pages: {
        overview: 'Áttekintés',
        gettingStarted: 'Elkezdés',
        changelog: 'Változásnapló',
        generalsettings: 'Általános Beállítások',
        commands: 'Parancsok',
        messages: 'Üzenetek',
        custombranding: 'Custom Branding',
        automoderation: 'Auto Moderáció',
        moderation: 'Moderáció',
        appeals: 'Fellebbezések',
        socailnotifications: 'Média Értesítések',
        joinroles: 'Belépési Rangok',
        reactionroles: 'Reakció Rangok',
        welcomemessages: 'Üdvözlő Üzenetek',
        roleconnections: 'Rang Kapcsolatok',
        logging: 'Logolás',
        faq: 'GYIK',
        guildes: 'Útmutatók',
        troubleshoot: 'Hibaelhárítás'
      }
    }
  }
} as const

/* -----------------------------------------
   TYPE DEFINITIONS
----------------------------------------- */
type LangCode = keyof typeof LANG

/* -----------------------------------------
   LANGUAGE LOADER
----------------------------------------- */
let currentLang: LangCode = 'en'

async function loadLanguage() {
  const langSetting = await presence.getSetting<number>('lang')
  currentLang = langSetting === 1 ? 'hu' : 'en'

}

/* -----------------------------------------
   MAIN PRESENCE LOGIC
----------------------------------------- */
presence.on('UpdateData', async () => {
  await loadLanguage()
  const t = LANG[currentLang]

  const { hostname, pathname, hash } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: t.site,
    startTimestamp: browsingTimestamp,
  }

  /* -----------------------------------------
     DOMAIN: MAIN SITE
  ----------------------------------------- */
  if (hostname === 'sapph.xyz') {
    if (pathname === '/' || pathname === '') {
      presenceData.state = t.home.main
    }
    else if (pathname.includes('/about')) {
      presenceData.state = t.home.about
    }
    else if (pathname.includes('/status')) {
      presenceData.state = t.home.status
    }
    else if (pathname.includes('/custom-branding')) {
      presenceData.state = t.home.custombranding
    }
    else if (pathname.includes('/limit-increase')) {
      presenceData.state = t.home.limitincrease
    }
    else if (pathname.includes('/terms')) {
      presenceData.state = t.home.terms
    }
    else if (pathname.includes('/privacy')) {
      presenceData.state = t.home.privacy
    }
    else if (pathname.includes('/right-of-withdrawal')) {
      presenceData.state = t.home.rightofwithdrawal
    }
    else if (pathname.includes('/licenses')) {
      presenceData.state = t.home.licenses
    }
    else if (pathname.includes('/legal-notice')) {
      presenceData.state = t.home.legalnotice
    }
  }

  /* -----------------------------------------
     DOMAIN: DASHBOARD
  ----------------------------------------- */
  if (hostname === 'dashboard.sapph.xyz') {
    const parts = pathname.split('/').filter(Boolean)

    const serverId = parts[0]
    const module = parts[1]
    const sub = parts[2]

    if (!serverId) {
      presenceData.state = t.dashboard.main
    }
    else if (!module) {
      presenceData.state = `${t.dashboard.main} (${serverId})`
    }
    else {
      const m = t.dashboard.modules

      switch (module) {
        case 'home':
          presenceData.state = m.home
          break

        case 'general-settings':
          presenceData.state = sub === 'error-log' ? m.generalSettings.errorLog : m.generalSettings.main
          break

        case 'commands':
          presenceData.state = sub === 'custom-commands'
            ? m.commands.customCommands
            : sub === 'default-commands'
              ? m.commands.defaultCommands
              : m.commands.main
          break

        case 'messages':
          presenceData.state = sub === 'templates'
            ? m.messages.templates
            : sub === 'components'
              ? m.messages.components
              : sub === 'default-messages'
                ? m.messages.defaultMessages
                : m.messages.main
          break

        case 'custom-branding':
          presenceData.state = sub === 'buy'
            ? m.customBranding.buy
            : sub === 'settings'
              ? m.customBranding.settings
              : m.customBranding.buy
          break

        case 'auto-moderation':
          presenceData.state = sub === 'discord'
            ? m.autoModeration.discord
            : sub === 'advanced'
              ? m.autoModeration.advanced
              : m.autoModeration.main
          break

        case 'moderation':
          if (sub === 'cases') {
            const caseId = parts[3]
            presenceData.state = caseId ? m.moderation.caseView : m.moderation.cases
          }
          else {
            presenceData.state = sub === 'report'
              ? m.moderation.report
              : sub === 'customize-messages'
                ? m.moderation.customizeMessages
                : sub === 'auto-actions'
                  ? m.moderation.autoActions
                  : sub === 'message-histories'
                    ? m.moderation.messageHistories
                    : sub === 'punish-settings'
                      ? m.moderation.punishSettings
                      : sub === 'immune-roles'
                        ? m.moderation.immuneRoles
                        : sub === 'user-notifications'
                          ? m.moderation.userNotifications
                          : sub === 'predefined-reasons'
                            ? m.moderation.predefinedReasons
                            : sub === 'channel-locking'
                              ? m.moderation.channelLocking
                              : sub === 'privacy'
                                ? m.moderation.privacy
                                : m.moderation.main
          }
          break

        case 'social-notifications':
          presenceData.state = m.socialNotifications
          break

        case 'join-roles':
          presenceData.state = m.joinRoles
          break

        case 'reaction-roles':
          presenceData.state = sub === 'messages'
            ? m.reactionRoles.messages
            : sub === 'settings'
              ? m.reactionRoles.settings
              : m.reactionRoles.messages
          break

        case 'welcome-messages':
          presenceData.state = sub === 'join'
            ? m.welcomeMessages.join
            : sub === 'leave'
              ? m.welcomeMessages.leave
              : sub === 'boost'
                ? m.welcomeMessages.boost
                : sub === 'boost'
                  ? m.welcomeMessages.boost
                  : sub === 'role'
                    ? m.welcomeMessages.role
                    : m.welcomeMessages.main
          break

        case 'role-connections':
          presenceData.state = m.roleConnections
          break

        case 'logging':
          presenceData.state = sub === 'type'
            ? m.logging.type
            : sub === 'settings'
              ? m.logging.settings
              : m.logging.type
          break

        default:
          presenceData.state = `${t.dashboard.module}: ${module}`
      }
    }
  }

  /* -----------------------------------------
     DOMAIN: DOCS
  ----------------------------------------- */
  if (hostname === 'docs.sapph.xyz') {
    const hashValue = hash.replace('/#/', '')

    if (!hashValue) {
      presenceData.state = t.docs.main
    }
    else {
      const page = t.docs.pages[hashValue as keyof typeof t.docs.pages]
      presenceData.state = page ?? t.docs.reading
    }
  }

  /* -----------------------------------------
     APPLY PRESENCE
  ----------------------------------------- */
  if (presenceData.state)
    presence.setActivity(presenceData)
  else presence.clearActivity()
})

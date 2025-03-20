import { Assets } from 'premid'

const presence = new Presence({
  clientId: '616940877042155531',
})

async function getStrings() {
  return presence.getStrings(
    {
      browse: 'general.browsing',
      writing: 'general.writing',
      reading: 'general.reading',
      channelReading: 'discord.channelReading',
      channelTyping: 'discord.channelTyping',
      dmReading: 'discord.dmReading',
      dmTyping: 'discord.dmTyping',
      dmGroupReading: 'discord.dmGroupReading',
      dmGroupTyping: 'discord.dmGroupTyping',
      friends: 'discord.friends',
      nitro: 'discord.nitro',
      voiceConnectedWith: 'discord.voiceConnectedWith',
      voiceConnectedTo: 'discord.voiceConnectedTo',
      inCall: 'general.inCall',
      calling: 'general.calling',
      settings: 'discord.settings',
      serverSettings: 'discord.serverSettings',
      invite: 'discord.invite',
      inviteServer: 'discord.inviteServer',
      buttonInvite: 'discord.buttonInvite',
      browseThrough: 'discord.browseThrough',
      download: 'discord.download',
      why: 'discord.why',
      safety: 'discord.safety',
      jobs: 'discord.jobs',
      company: 'discord.company',
      branding: 'discord.branding',
      inspiration: 'discord.inspiration',
      college: 'discord.college',
      newsroom: 'discord.newsroom',
      partner: 'discord.partner',
      verification: 'discord.verification',
      streamkit: 'discord.streamkit',
      opensource: 'discord.opensource',
      security: 'discord.security',
      moderation: 'discord.moderation',
      rpc: 'discord.rpc',
      policies: 'discord.policies',
      portal: 'discord.devs.portal',
      appsBrowse: 'discord.devs.appsBrowse',
      appsEdit: 'discord.devs.appsEdit',
      teamsBrowse: 'discord.devs.teamsBrowse',
      teamsEdit: 'discord.devs.teamsEdit',
      serversBrowse: 'discord.devs.serversBrowse',
      serversEdit: 'discord.devs.serversEdit',
      docs: 'discord.devs.docs',
      status: 'discord.status',
      view: 'general.view',
      uptime: 'general.uptimeHistory',
      incident: 'general.incidentHistory',
      viewAnIncident: 'general.viewAnIncident',
      helpCenter: 'discord.support',
      viewCategory: 'general.viewCategory',
      searchFor: 'general.searchFor',
      searching: 'general.search',
      readingArticle: 'general.readingArticle',
      blog: 'discord.blog',
      merch: 'discord.merch',
      product: 'general.viewProduct',
      collection: 'discord.merch.collection',
      viewPage: 'general.viewPage',
      shopCart: 'general.shopCart',
    },

  )
}

let browsingTimestamp = Math.floor(Date.now() / 1000)
let prevUrl = document.location.href
let strings: Awaited<ReturnType<typeof getStrings>>
let oldLang: string | null = null

enum ActivityAssets {
  DiscordBlack = 'https://cdn.rcd.gg/PreMiD/websites/D/Discord/assets/0.png',
  Discord = 'https://cdn.rcd.gg/PreMiD/websites/D/Discord/assets/1.png',
  DiscordWhite = 'https://cdn.rcd.gg/PreMiD/websites/D/Discord/assets/2.png',
}

presence.on('UpdateData', async () => {
  const [
    showBrowsing,
    showTimestamp,
    showButtons,
    showInvites,
    privacy,
    showCalls,
    newLang,
    logo,
  ] = await Promise.all([
    presence.getSetting<boolean>('browse'),
    presence.getSetting<boolean>('timestamp'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('invite'),
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('call'),
    presence.getSetting<string>('lang').catch(() => 'en'),
    presence.getSetting<number>('logo'),
  ])

  let presenceData: PresenceData = {
    largeImageKey: [ActivityAssets.DiscordWhite, ActivityAssets.Discord, ActivityAssets.DiscordBlack][logo]
      || ActivityAssets.DiscordWhite,
  }

  if (document.location.href !== prevUrl) {
    prevUrl = document.location.href
    browsingTimestamp = Math.floor(Date.now() / 1000)
  }

  if (oldLang !== newLang || !strings) {
    oldLang = newLang
    strings = await getStrings()
  }

  switch (document.location.hostname) {
    case 'discord.com': {
      const dmsTyping = Array.from(
        document.querySelectorAll('div[contenteditable=true]'),
      ).find(c =>
        Object.values(c.attributes).find(a =>
          a.textContent?.includes(document.querySelector('h3')?.textContent ?? ''),
        ),
      )?.parentElement?.children.length === 1
      const groupDm = !!document.querySelector('input[name=channel_name]')
      const dmsUserGroupName = groupDm
        ? (
            document.querySelector(
              'input[name=channel_name]',
            ) as HTMLInputElement
          )?.value || 'Undefined'
        : `${
          document.querySelector('head > title')?.textContent === 'Discord'
            ? ''
            : `@${document.querySelector('head > title')?.textContent}`
        }`
      const serverTyping = Array.from(
        document.querySelectorAll('div[contenteditable=true]'),
      ).find(c =>
        c.attributes[0]?.textContent?.includes(
          Array.from(document.querySelectorAll('h3')).find(c =>
            c.className?.includes('title'),
          )?.textContent ?? '',
        ),
      )?.parentElement?.children.length === 1
      const serverChannel = `#${
        document
          .querySelectorAll('title')[0]
          ?.textContent
          ?.split('| #')[1]
          ?.split('|')[0] || 'Undefined'
      }`
      const serverServerName = document.querySelectorAll('title')[0]?.textContent?.split('|')[2]
        || 'Undefined'
      const statics: {
        [name: string]: PresenceData
      } = {
        '/': {
          details: strings.browse,
        },
        '/channels/(\\d*)/(\\d*)/': {
          details: serverTyping
            ? strings.channelTyping
              .split('{0}')[0]
              ?.replace('{1}', serverChannel)
              .replace('{2}', serverServerName)
            : strings.channelReading
              .split('{0}')[0]
              ?.replace('{1}', serverChannel)
              .replace('{2}', serverServerName),
          state: serverTyping
            ? strings.channelTyping
              .split('{0}')[1]
              ?.replace('{1}', serverChannel)
              .replace('{2}', serverServerName)
            : strings.channelReading
              .split('{0}')[1]
              ?.replace('{1}', serverChannel)
              .replace('{2}', serverServerName),
          smallImageKey: serverTyping ? Assets.Writing : Assets.Reading,
          smallImageText: serverTyping ? strings.writing : strings.reading,
        },
        '/channels/@me/': {
          details: strings.friends,
        },
        '/channels/@me/(\\d*)/': {
          details: dmsTyping
            ? groupDm
              ? strings.dmGroupTyping
                .split('{0}')[0]
                ?.replace('{1}', dmsUserGroupName)
              : strings.dmTyping
                .split('{0}')[0]
                ?.replace('{1}', dmsUserGroupName)
            : groupDm
              ? document.querySelector('head > title')?.textContent
              === 'Discord'
                ? ''
                : strings.dmGroupReading
                  .split('{0}')[0]
                  ?.replace('{1}', dmsUserGroupName)
              : document.querySelector('head > title')?.textContent
                === 'Discord'
                ? ''
                : strings.dmReading
                  .split('{0}')[0]
                  ?.replace('{1}', dmsUserGroupName),
          state: dmsTyping
            ? groupDm
              ? strings.dmGroupTyping
                .split('{0}')[1]
                ?.replace('{1}', dmsUserGroupName)
              : strings.dmTyping
                .split('{0}')[1]
                ?.replace('{1}', dmsUserGroupName)
            : groupDm
              ? document.querySelector('head > title')?.textContent
              === 'Discord'
                ? ''
                : strings.dmGroupReading
                  .split('{0}')[1]
                  ?.replace('{1}', dmsUserGroupName)
              : document.querySelector('head > title')?.textContent
                === 'Discord'
                ? ''
                : strings.dmReading
                  .split('{0}')[1]
                  ?.replace('{1}', dmsUserGroupName),
          smallImageKey: dmsTyping ? Assets.Writing : Assets.Reading,
          smallImageText: dmsTyping ? strings.writing : strings.reading,
        },
        '/invite/(\\w*\\d*)/': {
          details: showInvites
            ? strings.invite
              .split('{0}')[0]
              ?.replace('{1}', document.URL.split('/')[4]!)
              .replace('{2}', document.title)
            : strings.inviteServer
              .split('{0}')[0]
              ?.replace('{1}', document.title),
          state: showInvites
            ? strings.invite
              .split('{0}')[1]
              ?.replace('{1}', document.URL.split('/')[4]!)
              .replace('{2}', document.title)
            : strings.inviteServer
              .split('{0}')[1]
              ?.replace('{1}', document.title),
          smallImageKey: Assets.Reading,
          buttons: showInvites
            ? [
                {
                  label: strings.buttonInvite,
                  url: document.URL,
                },
              ]
            : undefined,
        },
        '/store/': {
          details: strings.nitro,
        },
        '/nitro/': {
          details: strings.nitro,
        },
        '/download/': {
          details: strings.browseThrough,
          state: strings.download,
        },
        '/why-discord-is-different/': {
          details: strings.browseThrough,
          state: strings.why,
        },
        '/safety/': {
          details: strings.browseThrough,
          state: strings.safety,
        },
        '/jobs/': {
          details: strings.browseThrough,
          state: strings.jobs,
        },
        '/company/': {
          details: strings.browseThrough,
          state: strings.company,
        },
        '/branding/': {
          details: strings.browseThrough,
          state: strings.branding,
        },
        '/inspiration/': {
          details: strings.browseThrough,
          state: strings.inspiration,
        },
        '/college/': {
          details: strings.browseThrough,
          state: strings.college,
        },
        '/newsroom/': {
          details: strings.browseThrough,
          state: strings.newsroom,
        },
        '/partners/': {
          details: strings.browseThrough,
          state: strings.partner,
        },
        '/verification/': {
          details: strings.browseThrough,
          state: strings.verification,
        },
        '/streamkit/': {
          details: strings.browseThrough,
          state: strings.streamkit,
        },
        '/open-source/': {
          details: strings.browseThrough,
          state: strings.opensource,
        },
        '/security/': {
          details: strings.browseThrough,
          state: strings.security,
        },
        '/moderation/': {
          details: strings.browseThrough,
          state: strings.moderation,
        },
        '/rich-presence/': {
          details: strings.browseThrough,
          state: strings.rpc,
        },
        '/terms/': {
          details: strings.browseThrough,
          state: strings.policies,
        },
        '/privacy/': {
          details: strings.browseThrough,
          state: strings.policies,
        },
        '/guidelines/': {
          details: strings.browseThrough,
          state: strings.policies,
        },
        '/acknowledgements/': {
          details: strings.browseThrough,
          state: strings.policies,
        },
        '/licenses/': {
          details: strings.browseThrough,
          state: strings.policies,
        },
        '/developers/applications/': {
          details: strings.portal,
          state: strings.appsBrowse,
        },
        '/developers/applications/(\\d*)/': {
          details: strings.portal,
          state: strings.appsEdit.replace(
            '{0}',
            Array.from(document.querySelectorAll('div')).find(c =>
              c.className?.includes('appDetails'),
            )?.textContent ?? '',
          ),
          smallImageKey: Assets.Writing,
        },
        '/developers/teams/': {
          details: strings.portal,
          state: strings.teamsBrowse,
        },
        '/developers/teams/(\\d*)/': {
          details: strings.portal,
          state: strings.teamsEdit.replace(
            '{0}',
            document.querySelector('div.Select-value')?.textContent ?? '',
          ),
          smallImageKey: Assets.Writing,
        },
        '/developers/servers/': {
          details: strings.portal,
          state: strings.serversBrowse,
        },
        '/developers/servers/(\\d*)/': {
          details: strings.portal,
          state: strings.serversEdit.replace(
            '{0}',
            Array.from(document.querySelectorAll('div')).find(c =>
              c.className.includes('itemName'),
            )?.textContent ?? '',
          ),
          smallImageKey: Assets.Reading,
        },
        '/developers/docs/': {
          details: strings.portal,
          state: strings.docs,
          smallImageKey: Assets.Reading,
          smallImageText: strings.reading,
        },
      }

      if (
        showCalls
        && Array.from(document.querySelectorAll('div')).find(c =>
          c.className?.includes('rtcConnectionStatus'),
        )
      ) {
        if (privacy) {
          presenceData.details = strings.inCall
          presenceData.smallImageKey = Assets.Call
          presenceData.smallImageText = strings.calling
        }
        else {
          const connectedTo = Array.from(
            Array.from(document.querySelectorAll('div'))
              .find(c => c.className?.includes('rtcConnectionStatus'))
              ?.parentElement
              ?.querySelector('a')
              ?.children || [],
          ).find(c => c.className?.includes('channel'))
          const connectedToDm = !!(
            connectedTo?.parentElement as HTMLLinkElement
          )?.href.includes('/@me/')

          if (!connectedTo) {
            return presence.error(
              'An error occurred while stripping data off the page. Please contact Bas950 on the PreMiD Discord support server (https://discord.premid.app/), and send him a screenshot of this error. ID: connectedTo === undefined/null',
            )
          }

          presenceData.details = connectedToDm
            ? strings.voiceConnectedWith
              .split('{0}')[0]
              ?.replace('{1}', connectedTo.textContent ?? '')
            : strings.voiceConnectedTo
              .split('{0}')[0]
              ?.replace(
                '{1}',
                connectedTo.textContent?.replace(
                  ` / ${connectedTo.textContent?.split(' / ').pop()}`,
                  '',
                ) ?? '',
              )
              .replace('{2}', connectedTo.textContent?.split(' / ').pop() ?? '')
          presenceData.state = connectedToDm
            ? strings.voiceConnectedWith
              .split('{0}')[1]
              ?.replace('{1}', connectedTo.textContent ?? '')
            : strings.voiceConnectedTo
              .split('{0}')[1]
              ?.replace(
                '{1}',
                connectedTo.textContent?.replace(
                  ` / ${connectedTo.textContent?.split(' / ').pop()}`,
                  '',
                ) ?? '',
              )
              .replace('{2}', connectedTo.textContent?.split(' / ').pop() ?? '')
          presenceData.smallImageKey = Assets.Call
          presenceData.smallImageText = strings.calling
        }
        //* Normal browsing status
      }
      else if (showBrowsing) {
        if (privacy) {
          presenceData.details = strings.browse
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = strings.browse
        }
        else if (
          Array.from(document.querySelectorAll('div[aria-controls]')).find(c =>
            Object.values(c.attributes).find(
              a => a.textContent === 'My Account-tab',
            ),
          )
        ) {
          presenceData.details = strings.settings
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = strings.browse
        }
        else if (
          Array.from(document.querySelectorAll('div[aria-controls]')).find(c =>
            Object.values(c.attributes).find(
              a => a.textContent === 'OVERVIEW-tab',
            ),
          )
        ) {
          const server = Array.from(document.querySelectorAll('h1')).find(c =>
            c.className?.includes('name'),
          )?.textContent || 'Undefined'
          presenceData.details = strings.serverSettings
            .split('{0}')[0]
            ?.replace('{1}', server)
          presenceData.state = strings.serverSettings
            .split('{0}')[1]
            ?.replace('{1}', server)
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = strings.browse
        }
        else {
          for (const [k, v] of Object.entries(statics)) {
            if (
              location.href
                .replace(/\/?$/, '/')
                .replace(`https://${document.location.hostname}`, '')
                .replace('?', '/')
                .replace('=', '/')
                .match(k)
            ) {
              presenceData = { ...presenceData, ...v } as PresenceData
              if (!presenceData.smallImageKey) {
                presenceData.smallImageKey = Assets.Reading
                presenceData.smallImageText = strings.browse
              }
            }
          }
        }
      }

      break
    }
    case 'discordstatus.com': {
      const statics: {
        [name: string]: PresenceData
      } = {
        '/': {
          details: strings.status,
          state: strings.browse,
        },
        '/uptime/': {
          details: strings.status,
          state: `${strings.view} ${strings.uptime}`,
        },
        '/history/': {
          details: strings.status,
          state: `${strings.view} ${strings.incident}`,
        },
        '/incidents/': {
          details: strings.status,
          state: strings.viewAnIncident,
        },
      }
      if (showBrowsing) {
        if (privacy) {
          presenceData.details = strings.status
          presenceData.state = strings.browse
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = strings.browse
        }
        else {
          for (const [k, v] of Object.entries(statics)) {
            if (
              location.href
                .replace(/\/?$/, '/')
                .replace(`https://${document.location.hostname}`, '')
                .replace('?', '/')
                .replace('=', '/')
                .match(k)
            ) {
              presenceData = { ...presenceData, ...v } as PresenceData
              if (!presenceData.smallImageKey) {
                presenceData.smallImageKey = Assets.Reading
                presenceData.smallImageText = strings.browse
              }
            }
          }
        }
      }

      break
    }
    case 'support.discord.com': {
      const statics: {
        [name: string]: PresenceData
      } = {
        '/': {
          details: strings.helpCenter,
          state: strings.browse,
        },
        '/categories/': {
          details: strings.helpCenter,
          state: `${strings.viewCategory} ${
            document.querySelector('h1')?.textContent
          }`,
        },
        '/search/': {
          details: strings.helpCenter,
          state: `${strings.searchFor} ${
            (document.querySelector('#query') as HTMLInputElement)?.value
          }`,
          smallImageKey: Assets.Search,
          smallImageText: strings.searching,
        },
        '/articles/': {
          details: strings.helpCenter,
          state: `${strings.readingArticle} ${document
            .querySelector('h1')
            ?.textContent
            ?.trim()}`,
          smallImageKey: Assets.Reading,
          smallImageText: strings.reading,
        },
      }
      if (showBrowsing) {
        if (privacy) {
          presenceData.details = strings.helpCenter
          presenceData.state = strings.browse
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = strings.browse
        }
        else {
          for (const [k, v] of Object.entries(statics)) {
            if (
              location.href
                .replace(/\/?$/, '/')
                .replace(`https://${document.location.hostname}`, '')
                .replace('?', '/')
                .replace('=', '/')
                .match(k)
            ) {
              presenceData = { ...presenceData, ...v } as PresenceData
              if (!presenceData.smallImageKey) {
                presenceData.smallImageKey = Assets.Reading
                presenceData.smallImageText = strings.browse
              }
            }
          }
        }
      }

      break
    }
    case 'blog.discord.com': {
      const statics: {
        [name: string]: PresenceData
      } = {
        '/': {
          details: strings.blog,
          state: document.querySelector('h1')?.textContent !== 'Discord Blog'
            ? `${strings.readingArticle} ${
              document.querySelector('h1')?.textContent
            }`
            : strings.browse,
        },
        '/product-posts/': {
          details: strings.blog,
          state: `${strings.viewCategory} Product posts`,
        },
        '/company-posts/': {
          details: strings.blog,
          state: `${strings.viewCategory} Company posts`,
        },
        '/education-posts/': {
          details: strings.blog,
          state: `${strings.viewCategory} Education posts`,
        },
        '/community-posts/': {
          details: strings.blog,
          state: `${strings.viewCategory} Community posts`,
        },
        '/engineering-posts/': {
          details: strings.blog,
          state: `${strings.viewCategory} Engineering posts`,
        },
      }
      if (showBrowsing) {
        if (privacy) {
          presenceData.details = strings.blog
          presenceData.state = strings.browse
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = strings.browse
        }
        else {
          for (const [k, v] of Object.entries(statics)) {
            if (
              location.href
                .replace(/\/?$/, '/')
                .replace(`https://${document.location.hostname}`, '')
                .replace('?', '/')
                .replace('=', '/')
                .match(k)
            ) {
              presenceData = { ...presenceData, ...v } as PresenceData
              if (!presenceData.smallImageKey) {
                presenceData.smallImageKey = Assets.Reading
                presenceData.smallImageText = strings.browse
              }
            }
          }
        }
      }

      break
    }
    case 'discordmerch.com': {
      const statics: {
        [name: string]: PresenceData
      } = {
        '/': {
          details: strings.merch,
          state: strings.browse,
        },
        '/products/': {
          details: strings.merch,
          state: `${strings.product} ${
            document.querySelector('h1')?.textContent
          }`,
        },
        '/collections/': {
          details: strings.merch,
          state: `${strings.collection} ${
            document.querySelector('h1')?.textContent
          }`,
        },
        '/pages/': {
          details: strings.merch,
          state: `${strings.viewPage} ${
            document.querySelector('h1')?.textContent
          }`,
        },
        '/cart/': {
          details: strings.merch,
          state: `${strings.view} ${strings.shopCart}`,
        },
        '/search/': {
          details: strings.merch,
          state: `${strings.searchFor} ${
            (document.querySelector('input') as HTMLInputElement)?.value
          }`,
          smallImageKey: Assets.Search,
          smallImageText: strings.searching,
        },
      }
      if (showBrowsing) {
        if (privacy) {
          presenceData.details = strings.status
          presenceData.state = strings.browse
          presenceData.smallImageKey = Assets.Reading
          presenceData.smallImageText = strings.browse
        }
        else {
          for (const [k, v] of Object.entries(statics)) {
            if (
              location.href
                .replace(/\/?$/, '/')
                .replace(`https://${document.location.hostname}`, '')
                .replace('?', '/')
                .replace('=', '/')
                .match(k)
            ) {
              presenceData = { ...presenceData, ...v } as PresenceData
              if (!presenceData.smallImageKey) {
                presenceData.smallImageKey = Assets.Reading
                presenceData.smallImageText = strings.browse
              }
            }
          }
        }
      }

      break
    }
  }

  if (!presenceData.buttons?.length)
    delete presenceData.buttons
  if (!showButtons)
    delete presenceData.buttons
  if (showTimestamp)
    presenceData.startTimestamp = browsingTimestamp

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

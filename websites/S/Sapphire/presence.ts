const presence = new Presence({
  clientId: '1514205998523617280',
})

enum ActivityAssets {
  Logo = 'https://i.imgur.com/apPbYWb.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }

  const fullUrl = document.location.href

  // 1. SPECIFIC SUB-PATHS
  if (fullUrl.includes('/reaction-roles/messages')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Reaction Roles: Messages'
  }
  else if (fullUrl.includes('/reaction-roles/settings')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Reaction Roles: Settings'
  }
  else if (fullUrl.includes('/general-settings/error-log')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'General Settings: Error Log'
  }
  else if (fullUrl.includes('/general-settings/advanced-permissions')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'General Settings: Advanced Permissions'
  }
  else if (fullUrl.includes('/commands/custom-commands')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Commands: Custom Commands'
  }
  else if (fullUrl.includes('/commands/default-commands')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Commands: Default Commands'
  }
  else if (fullUrl.includes('/messages/templates')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Messages: Templates'
  }
  else if (fullUrl.includes('/messages/components')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Messages: Components'
  }
  else if (fullUrl.includes('/messages/default-messages')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Messages: Default Messages'
  }
  else if (fullUrl.includes('/mk')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Messages: Message Kits'
  }
  else if (fullUrl.includes('/custom-branding/buy')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Custom Branding'
  }
  else if (fullUrl.includes('/auto-moderation/discord')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Auto Moderation: Discord’s built-in auto moderation'
  }
  else if (fullUrl.includes('/auto-moderation/advanced')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Auto Moderation: Advanced auto moderation'
  }
  else if (fullUrl.includes('/auto-moderation/join-guard')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Auto Moderation: Join Guard'
  }
  else if (fullUrl.includes('/moderation/cases')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: Cases'
  }
  else if (fullUrl.includes('/moderation/report/customize-messages/edit-actions')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: User reports: Customize messages: Edit actions'
  }
  else if (fullUrl.includes('/moderation/report/auto-actions')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: User reports: Automated actions'
  }
  else if (fullUrl.includes('/moderation/report/customize-messages')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: User reports: Customize messages'
  }
  else if (fullUrl.includes('/moderation/report')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: User reports'
  }
  else if (fullUrl.includes('/moderation/message-histories')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: Message Histories'
  }
  else if (fullUrl.includes('/message-history')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: Viewing a message history'
  }
  else if (fullUrl.includes('/moderation/punish-settings')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: Punish settings'
  }
  else if (fullUrl.includes('/moderation/immune-roles')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: Immune roles'
  }
  else if (fullUrl.includes('/moderation/user-notifications')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: User notifications'
  }
  else if (fullUrl.includes('/moderation/predefined-reasons')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: Predefined reasons'
  }
  else if (fullUrl.includes('/moderation/channel-locking')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: Channel locking'
  }
  else if (fullUrl.includes('/moderation/privacy')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation: Privacy'
  }
  else if (fullUrl.includes('/welcome-messages/join')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Welcome Messages: Join messages'
  }
  else if (fullUrl.includes('/welcome-messages/leave')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Welcome Messages: Leave messages'
  }
  else if (fullUrl.includes('/welcome-messages/boost')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Welcome Messages: Boost messages'
  }
  else if (fullUrl.includes('/welcome-messages/role')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Welcome Messages: Role assignment messages'
  }
  else if (fullUrl.includes('/logging/types')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Logging: Types'
  }
  else if (fullUrl.includes('/logging/settings')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Logging: Settings'
  }

  // 2. DOCUMENTATION PATHS
  else if (fullUrl.includes('/#/overview')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Overview'
  }
  else if (fullUrl.includes('/#/getting-started')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Getting Started'
  }
  else if (fullUrl.includes('/#/changelog')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Changelog'
  }
  else if (fullUrl.includes('/#/generalsettings')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'General Settings'
  }
  else if (fullUrl.includes('/#/commands')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Commands'
  }
  else if (fullUrl.includes('/#/messages')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Messages'
  }
  else if (fullUrl.includes('/#/custombranding')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Custom Branding'
  }
  else if (fullUrl.includes('/#/automoderation')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Auto Moderation'
  }
  else if (fullUrl.includes('/#/moderation')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Moderation'
  }
  else if (fullUrl.includes('/#/appeals')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Appeals (appeal.gg)'
  }
  else if (fullUrl.includes('/#/socialnotifications')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Social Notifications'
  }
  else if (fullUrl.includes('/#/joinroles')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Join Roles'
  }
  else if (fullUrl.includes('/#/reactionroles')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Reaction Roles'
  }
  else if (fullUrl.includes('/#/welcomemessages')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Welcome Messages'
  }
  else if (fullUrl.includes('/#/roleconnections')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Role Connections'
  }
  else if (fullUrl.includes('/#/logging')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Logging'
  }

  // 2.2. DOCUMENTATION: GUIDES
  else if (fullUrl.includes('/#/guides/guide-to-components')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Components: Buttons & Menus'
  }
  else if (fullUrl.includes('/#/guides/roles-with-buttons')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Roles with buttons'
  }
  else if (fullUrl.includes('/#/guides/roles-with-selectmenus')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Roles with select menus'
  }
  else if (fullUrl.includes('/#/guides/messages-with-buttons')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Messages with buttons'
  }
  else if (fullUrl.includes('/#/guides/messages-with-selectmenus')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Messages with select menus'
  }
  else if (fullUrl.includes('/#/guides/link-button')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Link buttons'
  }
  else if (fullUrl.includes('/#/guides/custom-emojis-messages')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Custom emojis in messages'
  }
  else if (fullUrl.includes('/#/guides/webhook-messages')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Send messages as webhook'
  }
  else if (fullUrl.includes('/#/guides/schedule-message')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Schedule a message'
  }
  else if (fullUrl.includes('/#/guides/automate-message')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Automate a message'
  }
  else if (fullUrl.includes('/#/guides/sticky-message')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Sticky messages'
  }
  else if (fullUrl.includes('/#/guides/hyperlinks')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Hyperlinks'
  }
  else if (fullUrl.includes('/#/guides/pagination')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Pages with buttons (Pagination)'
  }
  else if (fullUrl.includes('/#/guides/copy-rename-templates')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Copying or renaming message templates'
  }
  else if (fullUrl.includes('/#/guides/join-guard')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Join Guard'
  }
  else if (fullUrl.includes('/#/guides/user-reports')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Use & setup User Reports'
  }
  else if (fullUrl.includes('/#/guides/disable-dm-notifications')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Disable DM notifications'
  }
  else if (fullUrl.includes('/#/guides/proof-with-attachments')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Attachments and case proof'
  }
  else if (fullUrl.includes('/#/guides/block-allow-links')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Block / allow links'
  }
  else if (fullUrl.includes('/#/guides/block-allow-words')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Block / allow words'
  }
  else if (fullUrl.includes('/#/guides/block-allow-invites')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Block / allow invites'
  }
  else if (fullUrl.includes('/#/guides/allow-specific-content')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Only allow specific content'
  }
  else if (fullUrl.includes('/#/guides/block-pings')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Block pings through AutoMod'
  }
  else if (fullUrl.includes('/#/guides/auto-delete-commands')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Automatically delete commands'
  }
  else if (fullUrl.includes('/#/guides/command-aliases')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Different command names'
  }
  else if (fullUrl.includes('/#/guides/register-slash-commands')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Register commands as slash commands'
  }
  else if (fullUrl.includes('/#/guides/link-case-view')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Link case views across servers'
  }
  else if (fullUrl.includes('/#/guides/changeprefix')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Change prefix'
  }
  else if (fullUrl.includes('/#/guides/ticket-workaround')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Ticket system (workaround)'
  }
  else if (fullUrl.includes('/#/guides/setup-custom-branding')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guide: Setup Custom Branding'
  }
  else if (fullUrl.includes('/#/guides')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Guides Overview'
  }

  // 2.3. DOCUMENTATION: FAQ
  else if (fullUrl.includes('/#/faq/proof-verified-proof')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: What is proof and verified proof?'
  }
  else if (fullUrl.includes('/#/faq/delete-all-delete-overflow')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Delete all / Delete overflow'
  }
  else if (fullUrl.includes('/#/faq/caseclose-unpunish')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Caseclose vs unpunish command'
  }
  else if (fullUrl.includes('/#/faq/duration-format')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: What are valid durations?'
  }
  else if (fullUrl.includes('/#/faq/condition-explanation')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: How do conditions work?'
  }
  else if (fullUrl.includes('/#/faq/create-template')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Create a template'
  }
  else if (fullUrl.includes('/#/faq/create-template-folders')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Create template folders'
  }
  else if (fullUrl.includes('/#/faq/mentions-in-messages')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: How to mention users, roles, etc. in messages?'
  }
  else if (fullUrl.includes('/#/faq/change-language')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Can I change Sapphire’s language?'
  }
  else if (fullUrl.includes('/#/faq/manager-roles')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: What are manager roles?'
  }
  else if (fullUrl.includes('/#/faq/disable-error-messages')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Can I disable error messages?'
  }
  else if (fullUrl.includes('/#/faq/logging-ignore-roles-channels')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Logging: Ignore roles / channels'
  }
  else if (fullUrl.includes('/#/faq/restore-backup')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Can I restore a backup?'
  }
  else if (fullUrl.includes('/#/faq/kick-sapphire')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Can I kick Sapphire? (CB Bot)'
  }
  else if (fullUrl.includes('/#/faq/join-sapphire-team')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ: Can I join Sapphire’s team?'
  }
  else if (fullUrl.includes('/#/faq')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'FAQ Overview'
  }

  // 2.4. DOCUMENTATION: TROUBLESHOOT
  else if (fullUrl.includes('/#/troubleshoot/no-slash-commands')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Troubleshoot: Slash commands not visible'
  }
  else if (fullUrl.includes('/#/troubleshoot/no-emoji-other-server')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Troubleshoot: Emojis from other servers don’t show up'
  }
  else if (fullUrl.includes('/#/troubleshoot/immune-user')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Troubleshoot: User is immune'
  }
  else if (fullUrl.includes('/#/troubleshoot/mute-role-not-working')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Troubleshoot: Mute role not working'
  }
  else if (fullUrl.includes('/#/troubleshoot/reaction-roles-not-working')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Troubleshoot: Reaction Roles/button/menu not working'
  }
  else if (fullUrl.includes('/#/troubleshoot/dashboard-not-loading')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Troubleshoot: Dashboard is not loading'
  }
  else if (fullUrl.includes('/#/troubleshoot/payment-issues')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Troubleshoot: Payment issues'
  }
  else if (fullUrl.includes('/#/troubleshoot')) {
    presenceData.details = 'Viewing documentation'
    presenceData.state = 'Troubleshoot overview'
  }

  // 3. STANDARD MODULES & TABS
  else if (fullUrl.includes('/general-settings')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'General Settings'
  }
  else if (fullUrl.includes('/messages')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Messages'
  }
  else if (fullUrl.includes('/reaction-roles')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Reaction Roles'
  }
  else if (fullUrl.includes('/auto-moderation')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Auto Moderation'
  }
  else if (fullUrl.includes('/moderation')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Moderation'
  }
  else if (fullUrl.includes('/social-notifications')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Social Notifications'
  }
  else if (fullUrl.includes('/join-roles')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Join Roles'
  }
  else if (fullUrl.includes('/welcome-messages')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Welcome Messages'
  }
  else if (fullUrl.includes('/role-connections')) {
    presenceData.details = 'Viewing module'
    presenceData.state = 'Role Connections'
  }
  else if (fullUrl.includes('/commands')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Commands'
  }
  else if (fullUrl.includes('/home')) {
    presenceData.details = 'Viewing dashboard tab'
    presenceData.state = 'Home'
  }

  // 4. STATIC PAGES (No Server ID in URL)
  else if (fullUrl.includes('/status')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Status'
  }
  else if (fullUrl.includes('/about')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'About'
  }
  else if (fullUrl.includes('/limit-increase')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Limit Increase'
  }
  else if (fullUrl.includes('/terms')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Terms Of Service'
  }
  else if (fullUrl.includes('/privacy')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Privacy Policy'
  }
  else if (fullUrl.includes('/right-of-withdrawal')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Right Of Withdrawal'
  }
  else if (fullUrl.includes('/licenses')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Licenses'
  }
  else if (fullUrl.includes('/legal-notice')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Legal Notice'
  }
  else if (fullUrl.includes('/custom-branding')) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Custom Branding'
  }

  // 5. HOME/ROOT FALLBACK
  else if (document.location.pathname === '/' || document.location.pathname.split('/').length === 2) {
    presenceData.details = 'Viewing page'
    presenceData.state = 'Home'
  }
  else {
    presenceData.details = 'Browsing'
    presenceData.state = 'Unknown page'
  }

  // Add a timestamp
  presenceData.startTimestamp = browsingTimestamp

  // Set or clear the activity
  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})

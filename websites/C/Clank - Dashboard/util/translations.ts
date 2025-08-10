interface Translation {
  details: string
  dashboard: string
  state: string
  sections: Record<string, string>
}

export const translations: Record<'de-DE' | 'en-US', Translation> = {
  'de-DE': {
    details: '📌 Auf der Startseite',
    dashboard: '📌 Angemeldet im Dashboard',
    state: 'Bewundert unseren Discord-Bot.. 💝',
    sections: {
      'discord-bot': 'Schaut sich das Intro an.. 👋',
      'discord-bot-features': 'Liest sich die Vorteile des Bots durch.. 💎',
      'discord-bot-tutorial': 'Begutachtet das Tutorial für Clank.. 🧵',
      'discord-bot-footer': 'Ist am Ende der Seite angekommen. 🤟',
      'dashboard-intro': 'Wird vom Dashboard begrüßt.. 🤝',
      'dashboard-contact': 'Kontaktiert das Bot-Team.. 📞',
      'dashboard-wishlist': 'Schaut sich die Wunschliste an.. 🔎',
      'dashboard-teamlist': 'Verwaltet das Server-Team.. 👥',
      'dashboard-setup': 'Richtet das Support-Forum ein.. ⚙️',
      'dashboard-themes': 'Organisiert die Support-Themen.. 📂',
      'dashboard-snippets': 'Erstellt neue Ticket-Snippets.. 📜',
      'dashboard-blocked-users': 'Verwaltet blockierte Ticke-User.. 🚫',
      'dashboard-view': 'Schaut sich aktive Events an.. 🎁',
      'dashboard-design': 'Verändert das Gewinnspiel-Design.. 🎨',
      'dashboard-channel-roles': 'Bearbeitet Kanal-& Rollen-Effekte.. 🎊',
      'dashboard-moderation-requests': 'Moderiert Entsperrungsanträge.. 🚨️',
      'dashboard-shield': 'Verwaltet aktive Schutzsysteme.. 🛡️',
      'dashboard-logs': 'Überprüft die Server-Protkolle.. 🧮',
      'dashboard-automod': 'Konfiguriert die Auto-Moderation.. 🤖',
      'dashboard-global-chat': 'Verwaltet den Globalen Chat.. 🌎',
    },
  },
  'en-US': {
    details: '📌 On the homepage',
    dashboard: '📌 Logged into the dashboard',
    state: 'Admiring our Discord bot.. 💝',
    sections: {
      'discord-bot': 'Checking out the intro.. 👋',
      'discord-bot-features': 'Reading about the bot\'s features.. 💎',
      'discord-bot-tutorial': 'Reviewing the Clank tutorial.. 🧵',
      'discord-bot-footer': 'Reached the bottom of the page. 🤟',
      'dashboard-intro': 'Being welcomed by the dashboard.. 🤝',
      'dashboard-contact': 'Contacting the bot team.. 📞',
      'dashboard-wishlist': 'Looking at the wishlist.. 🔎',
      'dashboard-teamlist': 'Managing the server team.. 👥',
      'dashboard-setup': 'Setting up the support forum.. ⚙️',
      'dashboard-themes': 'Organizing support topics.. 📂',
      'dashboard-snippets': 'Creating new ticket snippets.. 📜',
      'dashboard-blocked-users': 'Managing blocked ticket users.. 🚫',
      'dashboard-view': 'Viewing active events.. 🎁',
      'dashboard-design': 'Changing the giveaway design.. 🎨',
      'dashboard-channel-roles': 'Editing channel & role effects.. 🎊',
      'dashboard-moderation-requests': 'Moderating unban requests.. 🚨️',
      'dashboard-shield': 'Managing active protection systems.. 🛡️',
      'dashboard-logs': 'Reviewing server logs.. 🧮',
      'dashboard-automod': 'Configuring auto-moderation.. 🤖',
      'dashboard-global-chat': 'Managing the global chat.. 🌎',
    },
  },
}

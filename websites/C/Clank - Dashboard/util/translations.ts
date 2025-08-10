interface Translation {
  details: string
  state: string
  sections: Record<string, string>
}

export const translations: Record<'de-DE' | 'en-US', Translation> = {
  'de-DE': {
    details: '📌 Auf der Startseite',
    state: 'Bewundert unseren Discord-Bot.. 💝',
    sections: {
      'discord-bot': 'Schaut sich das Intro an.. 👋',
      'discord-bot-features': 'Liest sich die Vorteile des Bots durch.. 💎',
      'discord-bot-tutorial': 'Begutachtet das Tutorial für Clank.. 🧵',
      'discord-bot-footer': 'Ist am Ende der Seite angekommen. 🤟',
    },
  },
  'en-US': {
    details: '📌 On the homepage',
    state: 'Admiring our Discord bot.. 💝',
    sections: {
      'discord-bot': 'Checking out the intro.. 👋',
      'discord-bot-features': 'Reading about the bot\'s features.. 💎',
      'discord-bot-tutorial': 'Reviewing the Clank tutorial.. 🧵',
      'discord-bot-footer': 'Reached the bottom of the page. 🤟',
    },
  },
}

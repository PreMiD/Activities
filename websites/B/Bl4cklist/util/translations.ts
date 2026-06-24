interface Translation {
  details: string
  title: string
  state: string
  pages: Record<string, string>
}

export const translations: Record<'de-DE' | 'en-US', Translation> = {
  'de-DE': {
    details: '👋 Auf der Startseite',
    title: 'Durchstöbert die Webseite..',
    state: 'Ich bin etwas neugierig.. 🚀',
    pages: {
      '/discord/tech-coding/': 'Schaut sich die Coding-Features an.. 🔨',
      '/discord/community/': 'Erfährt mehr über die Community.. 💗',
      '/discord/clank-bot/': 'Sucht den besten Discord-Bot.. 🤖',
      '/contact/': 'Möchte uns kontaktieren.. 💬',
    },
  },
  'en-US': {
    details: '👋 On the Homepage',
    title: 'Browsing the website..',
    state: 'I\'m a little curious... 🚀',
    pages: {
      '/discord/tech-coding/': 'Checking out the coding features.. 🔨',
      '/discord/community/': 'Finding out more about the community.. 💗',
      '/discord/clank-bot/': 'Looking for the best Discord bot.. 🤖',
      '/contact/': 'Trying to contact us.. 💬',
    },
  },
}

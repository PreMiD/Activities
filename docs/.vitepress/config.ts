import { defineConfig } from 'vitepress'

// Define available versions
interface VersionItem {
  text: string
  link: string
  disabled?: boolean
}

const versions: VersionItem[] = [
  { text: 'v1 (Current)', link: '/' },
  { text: 'v2 (Coming Soon)', link: '#', disabled: true },
]

export default defineConfig({
  title: 'PreMiD',
  description: 'Documentation for developing PreMiD Activities',
  head: [['link', { rel: 'icon', href: 'https://cdn.rcd.gg/PreMiD.png', type: 'image/png' }]],
  themeConfig: {
    search: {
      provider: 'local',
    },
    logo: 'https://cdn.rcd.gg/PreMiD.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/v1/guide/' },
      { text: 'API Reference', link: '/v1/api/' },
      { text: 'Examples', link: '/v1/examples/' },
      {
        text: versions[0].text,
        items: [
          ...versions,
          {
            text: 'GitHub Repository',
            link: 'https://github.com/PreMiD/Activities',
          },
        ],
      },
    ],
    sidebar: {
      // v1 Sidebar
      '/v1/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/v1/guide/' },
            { text: 'Installation', link: '/v1/guide/installation' },
            { text: 'Creating Your First Activity', link: '/v1/guide/first-activity' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Activity Structure', link: '/v1/guide/structure' },
            { text: 'Metadata', link: '/v1/guide/metadata' },
            { text: 'Presence Class', link: '/v1/guide/presence-class' },
            { text: 'Settings', link: '/v1/guide/settings' },
            { text: 'Dependencies', link: '/v1/guide/dependencies' },
            { text: 'Loading Activities', link: '/v1/guide/loading-activities' },
            { text: 'Developer Tools', link: '/v1/guide/developer-tools' },
          ],
        },
        {
          text: 'Advanced Topics',
          items: [
            { text: 'iFrames', link: '/v1/guide/iframes' },
            { text: 'Slideshows', link: '/v1/guide/slideshows' },
            { text: 'Localization', link: '/v1/guide/localization' },
            { text: 'Best Practices', link: '/v1/guide/best-practices' },
            { text: 'Guidelines', link: '/v1/guide/guidelines' },
          ],
        },
        {
          text: 'Extension Features',
          items: [
            { text: 'Activity Forwarding', link: '/v1/guide/activity-forwarding' },
          ],
        },
      ],
      '/v1/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/v1/api/' },
            { text: 'Presence Class', link: '/v1/api/presence-class' },
            { text: 'PresenceData Interface', link: '/v1/api/presence-data' },
            { text: 'metadata.json Structure', link: '/v1/api/metadata-json' },
            { text: 'Slideshow Class', link: '/v1/api/slideshow' },
            { text: 'iFrame Class', link: '/v1/api/iframe' },
            { text: 'Utility Functions', link: '/v1/api/utility-functions' },
          ],
        },
      ],
      '/v1/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Activity', link: '/v1/examples/' },
            { text: 'Media Activity', link: '/v1/examples/media' },
            { text: 'Activity with Settings', link: '/v1/examples/settings' },
            { text: 'Activity with iFrames', link: '/v1/examples/iframes' },
            { text: 'Activity with Slideshow', link: '/v1/examples/slideshow' },
          ],
        },
      ],

      // v2 Sidebar (Coming Soon)
      '/v2/': [
        {
          text: 'Coming Soon',
          items: [
            { text: 'API Version 2', link: '/v2/' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/PreMiD/Activities' },
    ],
    footer: {
      message: 'Released under the MPL-2.0 License.',
      copyright: 'Copyright © 2018-present Recodive oHG',
    },
  },
})

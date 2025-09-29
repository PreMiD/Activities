import { ActivityType } from 'premid'

const presence = new Presence({
  clientId: '1422257981168291940',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.ibb.co/fYPRcCBK/test-2.png',
}

const pathStates: Record<string, string> = {
  '/': 'Homepage',
  '/ai': 'Exploring AI Section',
  '/audio': 'Browsing Audio Tools',
  '/beginners-guide': 'Reading Beginner’s Guide',
  '/developer-tools': 'Checking Developer Tools',
  '/downloading': 'Browsing Downloading Guides',
  '/educational': 'Browsing Educational Section',
  '/feedback': 'Giving Feedback',
  '/file-tools': 'Exploring File Tools',
  '/gaming-tools': 'Browsing Gaming Tools',
  '/gaming': 'Browsing Gaming Section',
  '/image-tools': 'Exploring Image Tools',
  '/internet-tools': 'Browsing Internet Tools',
  '/linux-macos': 'Browsing Linux & macOS Guides',
  '/misc': 'Exploring Miscellaneous',
  '/mobile': 'Browsing Mobile Tools',
  '/non-english': 'Browsing Non-English Guides',
  '/posts': 'Reading Posts',
  '/privacy': 'Reading Privacy Section',
  '/reading': 'Browsing Reading Section',
  '/sandbox': 'Exploring Sandbox Section',
  '/social-media-tools': 'Browsing Social Media Tools',
  '/startpage': 'Reading Start Page',
  '/storage': 'Browsing Storage Tools',
  '/system-tools': 'Exploring System Tools',
  '/text-tools': 'Browsing Text Tools',
  '/torrenting': 'Browsing Torrenting Section',
  '/unsafe': 'Browsing Unsafe Section',
  '/video-tools': 'Browsing Video Tools',
  '/video': 'Watching Videos Section',
}

presence.on('UpdateData', async () => {
  const { pathname } = document.location

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Free Media Heck Yeah',
    startTimestamp: browsingTimestamp,
    state: pathStates[pathname] || 'Browsing fmhy.net',
    type: ActivityType.Watching,
  }

  presence.setActivity(presenceData)
})

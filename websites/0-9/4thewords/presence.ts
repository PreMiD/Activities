import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1511211031706341386',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://4thewords.com/images/globalactivity/1569536977_upvote.webp',
}

presence.on('UpdateData', async () => {
  if (document.location.href.includes('app.4thewords.com')) {
    presence.setActivity({
      details: 'Writing in the Adventure World',
      state: 'Playing 4thewords',
      largeImageKey: ActivityAssets.Logo,
    });
  }
});

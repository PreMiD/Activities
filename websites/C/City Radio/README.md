# City Radio PreMiD Presence

This is the official PreMiD presence for City Radio.

## Features

- Shows current page being viewed
- Displays live radio listening status with song information
- Shows podcast playback status
- Displays show and jock information when browsing
- Customizable settings for timestamps, buttons, and song info
- Full support for all City Radio pages

## Settings

- **Show Timestamps**: Toggle elapsed time display
- **Show Buttons**: Toggle clickable buttons in Discord
- **Show Song Info When Playing**: Display current song and artist when listening to radio

## Installation

### For Users

1. Install [PreMiD](https://premid.app/) application and browser extension
2. The presence will automatically be available once submitted to PreMiD store
3. Visit [City Radio](https://cityradio.typicalmedia.net) and your status will update

### For Development

1. Clone the PreMiD presences repository:
```bash
git clone https://github.com/PreMiD/Presences
```

2. Copy the `premid` folder contents to `Presences/websites/C/City Radio/`

3. Build the presence:
```bash
cd "Presences/websites/C/City Radio"
tsc -b
```

4. Load the presence in PreMiD for testing

## Supported Pages

- **Home** - Shows browsing or listening status
- **Shows** - Browse all shows or view individual show details
- **Jocks** - Browse jocks or view jock profiles
- **Podcasts** - Browse podcasts or listen to episodes
- **TMG Content** - Read news articles and content
- **Contact** - Contact page
- **Staff Dashboard** - Staff management area (with privacy)

## Status Examples

- "Listening to Live Radio" - When playing the live stream
- "🎵 Song Title by Artist" - When a song is playing (if enabled in settings)
- "Viewing Show: Morning Show" - When viewing a show page
- "🎧 Podcast Name: Episode Title" - When playing a podcast
- "Reading News: Article Title" - When reading news

## Custom Assets

The presence uses custom image assets for different states:
- Play/Pause indicators
- Radio, Podcast, News icons
- Browse, Contact, and other state icons

All assets are hosted on Typical Media's CDN.

## Support

For issues or suggestions, contact the development team or open an issue on the PreMiD Presences repository.

## Author

- **Seehed** (Discord ID: 1030394088974991423)

## Version

Current version: 1.0.0

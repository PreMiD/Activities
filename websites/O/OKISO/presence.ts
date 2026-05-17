import { Presence, PresenceData, ActivityType, Assets, getTimestampsFromMedia } from 'premid'

// Initialize without a custom clientId to use official PreMiD Application
const presence = new Presence()
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
	Logo = 'logo',
}

presence.on('UpdateData', async () => {
	const { pathname } = document.location

	// @ts-ignore
	const presenceData: PresenceData = {
		largeImageKey: ActivityAssets.Logo,
		largeImageText: 'okiso.net',
		startTimestamp: browsingTimestamp,
		buttons: [
			{ label: 'Visit okiso.net', url: `https://okiso.net${pathname === '/' ? '' : pathname}` }
		]
	}

	// ─── Home Page ───
	if (pathname === '/') {
		// Check for Terms Modal
		const termsModal = document.querySelector('[data-premid-modal="terms"]')
		if (termsModal) {
			presenceData.details = 'Reading Content Terms'
			presenceData.state = 'Legal & Guidelines'
		} else {
			// Check for live broadcast
			const isLive = document.querySelector('[data-premid-live="true"]')
			if (isLive) {
				presenceData.details = 'Watching Live Broadcast'
				presenceData.state = '🔴 LIVE on Twitch'
				presenceData.smallImageKey = Assets.Live
				presenceData.smallImageText = 'Live'
				delete presenceData.startTimestamp
			} else {
				// Check for video playback
				const videoPlayer = document.querySelector('[data-premid-title]')
				if (videoPlayer) {
					const videoTitle = videoPlayer.getAttribute('data-premid-title')
					const paused = videoPlayer.getAttribute('data-premid-paused') === 'true'

					presenceData.details = videoTitle || 'Watching a Video'
					presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
					presenceData.smallImageText = paused ? 'Paused' : 'Playing'

					if (!paused) {
						const video = document.querySelector<HTMLVideoElement>('[data-premid-title] video')
						if (video) {
							[presenceData.startTimestamp, presenceData.endTimestamp] = getTimestampsFromMedia(video)
						}
					}

					presenceData.state = paused ? '⏸ Paused' : '▶ Playing'
				} else {
					presenceData.details = 'Browsing'
					presenceData.state = 'Home Page'
				}
			}
		}
	}
	// ─── Discography (3D Gallery) ───
	else if (pathname === '/releases') {
		presenceData.details = 'Exploring the 3D Audio Archive'
		presenceData.state = 'Interactive Discography'
	}
	// ─── Individual Release Page ───
	else if (pathname.startsWith('/releases/')) {
		const releaseEl = document.querySelector('[data-premid-release-title]')
		const releaseTitle = releaseEl?.getAttribute('data-premid-release-title')
		presenceData.details = 'Viewing Release'
		presenceData.state = releaseTitle ? `🎵 ${releaseTitle}` : 'Release Page'
	}
	// ─── Upcoming Page ───
	else if (pathname === '/upcoming') {
		presenceData.details = 'Browsing'
		presenceData.state = 'Upcoming Releases'
	}
	// ─── Fallback ───
	else {
		presenceData.details = document.title || 'Browsing'
		presenceData.state = 'okiso.net'
	}

	// ─── Global Music Player ───
	const musicContainer = document.getElementById('spotify-embed-container-data')
	const trackTitle = musicContainer?.getAttribute('data-premid-track-title')
	
	if (trackTitle) {
		const artist = musicContainer?.getAttribute('data-premid-track-artist')
		const paused = musicContainer?.getAttribute('data-premid-paused') === 'true'

		// Override the main details if they are listening to music
		presenceData.details = paused ? `Paused: ${trackTitle}` : `Listening to ${trackTitle}`
		presenceData.state = `by ${artist || 'OKISO'}`
		presenceData.smallImageKey = paused ? Assets.Pause : Assets.Play
		presenceData.smallImageText = paused ? 'Paused' : 'Playing'
		delete presenceData.startTimestamp // Remove browsing timestamp so it doesn't look like a long song
	}

	if (presenceData.details)
		presence.setActivity(presenceData)
	else
		presence.setActivity()
})
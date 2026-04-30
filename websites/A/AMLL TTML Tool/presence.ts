import { ActivityType, Assets, getTimestamps } from 'premid';

const presence = new Presence({
	clientId: "1250551199862624349"
});

enum ActivityAssets {
	Logo = "https://i.imgur.com/78zp1Xo.png",
}

const strings = presence.getStrings({
	playing: 'general.playing',
	paused: 'general.paused'
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

async function updatePresence() {
	const currentStrings = await strings;
	const presenceData: PresenceData = {
		type: ActivityType.Listening,
		largeImageKey: ActivityAssets.Logo,
		startTimestamp: browsingTimestamp
	};

	// 1. Determine Mode (Edit / Sync / Preview)
	let modeAction = "Editing";
	const modeButtons = Array.from(document.querySelectorAll('.rt-SegmentedControlItem'));
	const activeIndex = modeButtons.findIndex(btn => 
		btn.getAttribute('aria-checked') === 'true' || 
		btn.getAttribute('data-state') === 'on'
	);

	if (activeIndex === 1) {
		modeAction = "Syncing";
	} else if (activeIndex === 2) {
		modeAction = "Previewing";
	} else {
		modeAction = "Editing";
	}

	// 2. Find the current operating filename
	let filename = "Untitled";
	const ghostButtons = document.querySelectorAll('button.rt-variant-ghost.rt-Button, button.rt-Button');
	for (const btn of Array.from(ghostButtons)) {
		const text = btn.textContent || "";
		if (text.includes('.ttml') || text.includes('.lrc') || text.includes('.txt')) {
			filename = text.trim();
			break;
		}
	}

	// 3. Count lines & get current active line
	let totalLines = 0;
	let currentLineIndex = 0;
	let songTitle = "";
	let songArtist = "";

	try {
		const db = await new Promise<IDBDatabase | null>((resolve) => {
			const req = indexedDB.open("amll-autosave-db");
			req.onsuccess = (e) => resolve((e.target as any).result);
			req.onerror = () => resolve(null);
		});

		if (db) {
			const storeName = db.objectStoreNames.contains("projects") ? "projects" : (db.objectStoreNames.contains("autosave") ? "autosave" : null);
			if (storeName) {
				const results = await new Promise<any[]>((resolve) => {
					try {
						const tx = db.transaction(storeName, "readonly");
						const getReq = tx.objectStore(storeName).getAll();
						getReq.onsuccess = () => resolve(getReq.result);
						getReq.onerror = () => resolve([]);
					} catch (e) {
						resolve([]);
					}
				});

				if (results && results.length > 0) {
					results.sort((a, b) => (b.lastModified || b.timestamp || 0) - (a.lastModified || a.timestamp || 0));
					
					// Try to match current project by name
					const currentProject = results.find(r => r.name && filename.includes(r.name)) || results[0];
					const data = currentProject?.latestState || currentProject?.data;
					
					if (data) {
						totalLines = (data.lyricLines || []).filter((l: any) => !l.isBG).length;
						const metadata = data.metadata || [];
						const titleMeta = metadata.find((m: any) => m.key === 'title');
						if (titleMeta && titleMeta.value) {
							songTitle = Array.isArray(titleMeta.value) ? titleMeta.value.join(", ") : titleMeta.value;
						}
						
						const artistMeta = metadata.find((m: any) => m.key === 'artist');
						if (artistMeta && artistMeta.value) {
							songArtist = Array.isArray(artistMeta.value) ? artistMeta.value.join(", ") : artistMeta.value;
						}
					}
				}
			}
		}
	} catch (e) {
		// Ignore IDB errors
	}

	// Determine current line index from DOM
	const selectedLine = document.querySelector('div[class*="_selected_"]');
	if (selectedLine) {
		const lineNumText = selectedLine.firstChild?.textContent?.trim();
		if (lineNumText) currentLineIndex = parseInt(lineNumText);
	} else {
		// Preview mode: Look for the active line
		const activeLine = document.querySelector('div[class*="_lineActive_"]');
		if (activeLine) {
			const lineGroup = activeLine.closest('[class*="_lineGroup_"]');
			if (lineGroup && lineGroup.parentElement) {
				const siblings = Array.from(lineGroup.parentElement.children);
				currentLineIndex = siblings.indexOf(lineGroup) + 1;
			} else {
				const siblings = Array.from(activeLine.parentElement?.children || []);
				currentLineIndex = siblings.indexOf(activeLine) + 1;
			}
		}
	}

	if (totalLines === 0) {
		totalLines = document.querySelectorAll('div[class*="lyricLine_"], div[class*="lyricLineContainer"]').length;
	}

	// Setting details and state
	if (songTitle || songArtist) {
		const trackInfo = [songTitle, songArtist].filter(Boolean).join(" - ");
		presenceData.details = `Listening to ${trackInfo}`;
		filename = `[${modeAction}] ${filename}`;
	} else {
		presenceData.details = `${modeAction} lyrics`;
	}
	
	let stateStr = filename;
	if (totalLines > 0 && currentLineIndex > 0) {
		stateStr += ` | Line ${currentLineIndex} out of ${totalLines}`;
	} else if (totalLines > 0) {
		stateStr += ` | ${totalLines} lines total`;
	}
	presenceData.state = stateStr;
	presenceData.largeImageText = "AMLL TTML Tool";

	// 4. Audio playback status
	const timeLabels = Array.from(document.querySelectorAll('.rt-Text')).filter(el => 
		/^(\d+:)?\d+:\d+(\.\d+)?$/.test((el.textContent || "").trim())
	);
	
	const playPauseBtn = Array.from(document.querySelectorAll('button.rt-IconButton')).find(btn => {
		const d = btn.querySelector('svg path')?.getAttribute('d');
		return d?.startsWith('M17.22') || d?.startsWith('M5 2'); 
	});
	
	if (timeLabels.length >= 2 && playPauseBtn) {
		const parseTime = (str: string) => {
			const parts = str.split(':').map(v => parseFloat(v) || 0);
			if (parts.length === 3) {
				const [h = 0, m = 0, s = 0] = parts;
				return (h * 3600) + (m * 60) + s;
			}
			if (parts.length === 2) {
				const [m = 0, s = 0] = parts;
				return (m * 60) + s;
			}
			return parts[0] || 0;
		};

		const currentTime = parseTime(timeLabels[0]?.textContent || "0:00");
		const duration = parseTime(timeLabels[timeLabels.length - 1]?.textContent || "0:00");
		
		const path = playPauseBtn.querySelector('svg path')?.getAttribute('d');
		const isPlaying = path?.startsWith('M5 2'); 

		if (isPlaying && duration > 0) {
			presenceData.smallImageKey = Assets.Play;
			presenceData.smallImageText = currentStrings.playing;
			
			// Use the native PreMiD helper for timestamps
			const [start, end] = getTimestamps(currentTime, duration);
			presenceData.startTimestamp = start;
			presenceData.endTimestamp = end;
		} else if (!isPlaying && duration > 0) {
			presenceData.smallImageKey = Assets.Pause;
			presenceData.smallImageText = currentStrings.paused;
			delete presenceData.startTimestamp; 
		}
	} else {
		const audioEl = document.querySelector('audio');
		if (audioEl && audioEl.duration > 0 && !audioEl.paused) {
			presenceData.smallImageKey = Assets.Play;
			presenceData.smallImageText = currentStrings.playing;
			
			const [start, end] = getTimestamps(audioEl.currentTime, audioEl.duration);
			presenceData.startTimestamp = start;
			presenceData.endTimestamp = end;
		} else if (audioEl && audioEl.duration > 0 && audioEl.paused) {
			presenceData.smallImageKey = Assets.Pause;
			presenceData.smallImageText = currentStrings.paused;
			delete presenceData.startTimestamp;
		}
	}

	if (presenceData.state) {
		presence.setActivity(presenceData);
	} else {
		presence.clearActivity();
	}
}

presence.on("UpdateData", updatePresence);

// Manual trigger for responsiveness
document.addEventListener('click', () => setTimeout(updatePresence, 100));
document.addEventListener('keydown', (e) => {
	if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
		setTimeout(updatePresence, 100);
	}
});

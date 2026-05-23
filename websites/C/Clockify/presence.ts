import { Assets, StatusDisplayType } from "premid"

const presence = new Presence({
	clientId: "1468581338117308446",
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

let slideshow: Slideshow | null = null
try {
	slideshow = presence.createSlideshow()
} catch {
	// PreMiD runtime does not support createSlideshows so this catch is just for safety.
	// the presence will just fallback to single slide mode if createSlideshow is not supported
}

let oldSlideshowKey: string

function registerSlideshowKey(key: string): boolean {
	if (oldSlideshowKey === key) return false
	slideshow?.deleteAllSlides()
	oldSlideshowKey = key
	return true
}

function parseElapsedToSeconds(elapsed: string): number {
	const parts = elapsed.split(":").map(Number)
	if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!
	if (parts.length === 2) return parts[0]! * 60 + parts[1]!
	return 0
}

function secondsToHHMM(seconds: number): string {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} hours`
}

function formatDuration(raw: string): string {
	const seconds = parseElapsedToSeconds(raw)
	return isNaN(seconds) || seconds <= 0 ? raw.trim() : secondsToHHMM(seconds)
}

function sumProjectTimeToday(projectName: string, elapsedSeconds: number): string | null {
	const todayGroup = document.querySelector("entry-group")
	if (!todayGroup) return null

	let totalSeconds = elapsedSeconds

	const entries = todayGroup.querySelectorAll("time-tracker-entry, parent-tracker-entry")

	for (const entry of entries) {
		const entryProject = entry.querySelector(".cl-project-name span")?.textContent?.trim()
		if (entryProject !== projectName) continue

		const durationInput = entry.querySelector<HTMLInputElement>('[aria-label="Duration"], [aria-label="Duração"]')
		const value = durationInput?.value?.trim()
		if (value) totalSeconds += parseElapsedToSeconds(value)
	}

	return totalSeconds > 0 ? secondsToHHMM(totalSeconds) : null
}

function buildSummaryText(daily: string | null, weekly: string | null): string {
	return [
		daily ? `${daily} today` : null,
		weekly ? `${weekly} this week` : null,
	].filter(Boolean).join("  •  ")
}

presence.on("UpdateData", async () => {
	try {
		const path = document.location.pathname

		const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/E0XR3mN.png",
			startTimestamp: browsingTimestamp,
			details: "Clockify",
			state: "Browsing",
			detailsUrl: document.location.href,
			smallImageKey: Assets.Pause,
			smallImageText: "Not tracking",
		}

		const weeklyRaw = document.querySelector("approval-header .cl-h2")?.textContent?.trim()
		const weeklyFormatted = weeklyRaw ? formatDuration(weeklyRaw) : null

		const dailyRaw = document.querySelector("[data-cy='entry-header-total-duration']")?.textContent?.trim()
		const dailyFormatted = dailyRaw ? formatDuration(dailyRaw) : null

		const elapsed = document.querySelector("[stopwatch-seconds]")?.textContent?.trim()

		if (elapsed) {
			const taskDescription = document.querySelector<HTMLInputElement>(".cl-input-timetracker-main")?.title?.trim()
			const projectName = document.querySelector(".cl-project-name span")?.textContent?.trim()

			const seconds = parseElapsedToSeconds(elapsed)
			const projectTimeToday = projectName ? sumProjectTimeToday(projectName, seconds) : null
			const liveStart = seconds > 0 ? Math.floor(Date.now() / 1000) - seconds : undefined

			const sharedTracking = {
				largeImageKey: "https://i.imgur.com/E0XR3mN.png",
				detailsUrl: document.location.href,
				smallImageKey: Assets.Play,
				smallImageText: "Tracking time",
				statusDisplayType: StatusDisplayType.State,
				startTimestamp: liveStart,
			}

			const projectLine = [
				`📁 | ${projectName}`,
				projectTimeToday,
			].filter(Boolean).join("  •  ")

			const slideA: PresenceData = {
				...sharedTracking,
				details: `⏱️ | ${taskDescription ?? "Tracking time"}`,
				state: projectLine,
			}
			;(slideA as any).largeImageText = buildSummaryText(dailyFormatted, weeklyFormatted)

			const slideB: PresenceData = {
				...sharedTracking,
				details: projectLine,
				state: weeklyFormatted ? `📊 | ${weeklyFormatted} tracked this week` : undefined,
			}
			;(slideB as any).largeImageText = taskDescription ?? "Clockify"

			const contentKey = `tracking|${taskDescription}|${projectName}|${projectTimeToday}|${dailyFormatted}|${weeklyFormatted}`
			if (registerSlideshowKey(contentKey)) {
				slideshow?.addSlide("task", slideA, 5000)
				slideshow?.addSlide("totals", slideB, 5000)
			}

			presence.setActivity(slideshow ?? slideA)
			return
		}

		if (path.startsWith("/tracker")) {
			presenceData.details = "Clockify — Timer"
			presenceData.state = "No active timer"
		} else if (path.startsWith("/reports")) {
			presenceData.details = "Clockify — Reports"
			presenceData.state = dailyFormatted ? `${dailyFormatted} today` : "Reviewing reports"
			presenceData.smallImageKey = Assets.Viewing
			presenceData.smallImageText = "Viewing reports"
			;(presenceData as any).largeImageText = buildSummaryText(dailyFormatted, weeklyFormatted)
		} else if (path.startsWith("/projects")) {
			presenceData.details = "Clockify — Projects"
			presenceData.state = "Managing projects"
			presenceData.smallImageKey = Assets.Writing
			presenceData.smallImageText = "Managing projects"
		} else if (path.startsWith("/clients")) {
			presenceData.details = "Clockify — Clients"
			presenceData.state = "Viewing clients"
			presenceData.smallImageKey = Assets.Reading
			presenceData.smallImageText = "Viewing clients"
		} else if (path.startsWith("/team")) {
			presenceData.details = "Clockify — Team"
			presenceData.state = "Viewing team activity"
			presenceData.smallImageKey = Assets.Reading
			presenceData.smallImageText = "Viewing team"
		} else if (path.startsWith("/settings")) {
			presenceData.details = "Clockify — Settings"
			presenceData.state = "Configuring workspace"
			presenceData.smallImageKey = Assets.Reading
			presenceData.smallImageText = "Configuring settings"
		}

		const contentKey = `idle|${path}|${dailyFormatted}|${weeklyFormatted}`
		if (registerSlideshowKey(contentKey)) {
			slideshow?.addSlide("page", {
				largeImageKey: presenceData.largeImageKey,
				details: presenceData.details,
				state: presenceData.state,
				detailsUrl: document.location.href,
				smallImageKey: presenceData.smallImageKey,
				smallImageText: presenceData.smallImageText,
			}, 5000)

			if (dailyFormatted || weeklyFormatted) {
				slideshow?.addSlide("totals", {
					largeImageKey: "https://i.imgur.com/E0XR3mN.png",
					details: dailyFormatted ? `${dailyFormatted} today` : "Clockify",
					state: weeklyFormatted ? `${weeklyFormatted} tracked this week` : undefined,
					detailsUrl: document.location.href,
					smallImageKey: Assets.Pause,
					smallImageText: "Not tracking",
				}, 5000)
			}
		}

		presence.setActivity(slideshow ?? presenceData)
	} catch (err) {
		console.error("Clockify presence error:", err)
		presence.setActivity({
			largeImageKey: "https://i.imgur.com/E0XR3mN.png",
			details: "Clockify",
			state: "Browsing",
		})
	}
})
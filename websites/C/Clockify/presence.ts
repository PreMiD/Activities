import { Assets, StatusDisplayType, timestampFromFormat } from 'premid'

const presence = new Presence({
  clientId: '1468581338117308446',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

const slideshow = presence.createSlideshow()

let oldSlideshowKey = ''
let cachedStartTimestamp: number | undefined
let cachedStartKey: string | undefined

// Custom function needed: PreMiD's createSlideshow() does not provide built-in
// deduplication or change-detection for slide content. This function tracks key
// changes so slides are rebuilt only when the underlying data actually changes,
// preventing unnecessary flickering on every UpdateData tick.
function registerSlideshowKey(key: string): boolean {
  if (!slideshow)
    return false
  if (oldSlideshowKey === key)
    return false
  slideshow.deleteAllSlides()
  oldSlideshowKey = key
  return true
}

// Custom function needed: PreMiD does not expose a built-in formatter for
// converting raw seconds into a "HH:MM hours" display string. This formatting
// is required to present tracked time summaries in the activity state field.
function secondsToHHMM(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} hours`
}

// Custom function needed: Combines timestampFromFormat and secondsToHHMM with
// input validation in a single step. timestampFromFormat handles format parsing;
// this wrapper adds safety for raw DOM text and produces a fallback for invalid input.
function formatDuration(raw: string): string {
  const seconds = timestampFromFormat(raw)
  return Number.isNaN(seconds) || seconds <= 0 ? raw.trim() : secondsToHHMM(seconds)
}

// Custom function needed: PreMiD's Activity class provides no built-in mechanism
// for aggregating project-level tracked time from DOM entries. This function
// queries the page for today's time entries and sums durations per project,
// which is specific to Clockify's DOM structure and cannot be generalized.
function sumProjectTimeToday(projectName: string, elapsedSeconds: number): string | null {
  const todayGroup = document.querySelector('entry-group')
  if (!todayGroup)
    return null

  let totalSeconds = elapsedSeconds

  for (const entry of todayGroup.querySelectorAll('time-tracker-entry, parent-tracker-entry')) {
    const entryProject = entry.querySelector('.cl-project-name span')?.textContent?.trim()
    if (entryProject !== projectName)
      continue

    const value = entry.querySelector<HTMLInputElement>('input:not([type="hidden"])')?.value?.trim()
    if (value && /^\d{1,2}:\d{2}(?::\d{2})?$/.test(value))
      totalSeconds += timestampFromFormat(value)
  }

  return totalSeconds > 0 ? secondsToHHMM(totalSeconds) : null
}

// Custom function needed: PreMiD does not provide a helper to combine multiple
// optional metrics (daily + weekly totals) into a single label string. This
// function handles the conditional concatenation for display in largeImageText.
function buildSummaryText(daily: string | null, weekly: string | null): string | null {
  const parts = [
    daily ? `${daily} today` : null,
    weekly ? `${weekly} this week` : null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join('  •  ') : null
}

presence.on('UpdateData', async () => {
  try {
    const path = document.location.pathname

    const [showProject, showProjectTime, showDaily, showWeekly] = await Promise.all([
      presence.getSetting<boolean>('showProject').catch(() => true),
      presence.getSetting<boolean>('showProjectTime').catch(() => true),
      presence.getSetting<boolean>('showDaily').catch(() => true),
      presence.getSetting<boolean>('showWeekly').catch(() => true),
    ])

    const weeklyRaw = document.querySelector('approval-header .cl-h2')?.textContent?.trim()
    const weeklyFormatted = weeklyRaw ? formatDuration(weeklyRaw) : null

    const dailyRaw = document.querySelector('[data-cy=\'entry-header-total-duration\']')?.textContent?.trim()
    const dailyFormatted = dailyRaw ? formatDuration(dailyRaw) : null

    const elapsed = document.querySelector('[stopwatch-seconds]')?.textContent?.trim()

    if (elapsed) {
      const taskDescription = document.querySelector<HTMLInputElement>('.cl-input-timetracker-main')?.title?.trim()
      const projectName = document.querySelector('.cl-project-name span')?.textContent?.trim()

      const seconds = timestampFromFormat(elapsed)
      const projectTimeToday = projectName ? sumProjectTimeToday(projectName, seconds) : null

      const startKey = `${taskDescription}|${projectName}`
      if (cachedStartKey !== startKey) {
        cachedStartKey = startKey
        cachedStartTimestamp = seconds > 0 ? Math.floor(Date.now() / 1000) - seconds : undefined
      }

      const sharedTracking: PresenceData = {
        largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Clockify/assets/logo.png',
        detailsUrl: document.location.href,
        smallImageKey: Assets.Play,
        smallImageText: 'Tracking time',
        statusDisplayType: StatusDisplayType.State,
      }
      if (cachedStartTimestamp) {
        sharedTracking.startTimestamp = cachedStartTimestamp
      }

      const slideAState = [
        showProject && projectName ? `📁 | ${projectName}` : null,
        showProjectTime && projectTimeToday ? projectTimeToday : null,
      ].filter(Boolean).join('  •  ')

      const slideA: PresenceData = {
        ...sharedTracking,
        details: `🔴 | ${taskDescription ?? 'Tracking time'}`,
        state: slideAState || undefined,
      }
      const summaryText = buildSummaryText(
        showDaily ? dailyFormatted : null,
        showWeekly ? weeklyFormatted : null,
      )
      ;(slideA as unknown as { largeImageText: string | undefined }).largeImageText = summaryText ?? undefined

      const hasTotals = (showDaily && dailyFormatted) || (showWeekly && weeklyFormatted)
      const contentKey = `tracking|${taskDescription}|${projectName}|${projectTimeToday}|${dailyFormatted}|${weeklyFormatted}|${showProject}|${showProjectTime}|${showDaily}|${showWeekly}`

      if (hasTotals) {
        const slideBDetails = showDaily && dailyFormatted
          ? `📅 | ${dailyFormatted} tracked today`
          : (showWeekly && weeklyFormatted ? `📊 | ${weeklyFormatted} tracked this week` : '📊 | Time Summary')
        const slideBState = showDaily && showWeekly && weeklyFormatted
          ? `📊 | ${weeklyFormatted} tracked this week`
          : undefined

        const slideB: PresenceData = {
          ...sharedTracking,
          details: slideBDetails,
          state: slideBState,
        }
        ;(slideB as unknown as { largeImageText: string | undefined }).largeImageText = taskDescription ?? ((showProject && projectName) ? projectName : 'Clockify')

        if (registerSlideshowKey(contentKey)) {
          slideshow.addSlide('task', slideA, 5000)
          slideshow.addSlide('totals', slideB, 5000)
        }
      }
      else {
        if (registerSlideshowKey(contentKey)) {
          slideshow.addSlide('task', slideA, 5000)
        }
      }

      presence.setActivity(slideshow)
      return
    }

    const presenceData: PresenceData = {
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Clockify/assets/logo.png',
      startTimestamp: browsingTimestamp,
      details: 'Clockify',
      state: 'Browsing',
      detailsUrl: document.location.href,
      smallImageKey: Assets.Pause,
      smallImageText: 'Not tracking',
    }

    if (path.startsWith('/tracker')) {
      presenceData.details = '⏰ | Timer'
      presenceData.state = '📁 | No active project being tracked'
      presenceData.smallImageKey = Assets.Pause
      presenceData.smallImageText = 'Idle'
    }
    else if (path.startsWith('/reports')) {
      presenceData.details = '📊 | Reports'
      presenceData.state = showDaily && dailyFormatted ? `⏱️ | ${dailyFormatted} tracked today` : '🔍 | Reviewing reports'
      presenceData.smallImageKey = Assets.Viewing
      presenceData.smallImageText = 'Reviewing reports'
      const reportsSummary = buildSummaryText(
        showDaily ? dailyFormatted : null,
        showWeekly ? weeklyFormatted : null,
      )
      if (reportsSummary) {
        ;(presenceData as unknown as { largeImageText: string | undefined }).largeImageText = reportsSummary
      }
    }
    else if (path.startsWith('/projects')) {
      presenceData.details = showProject ? '📁 | Projects' : 'Clockify'
      presenceData.state = '⚙️ | Managing workspace projects'
      presenceData.smallImageKey = Assets.Writing
      presenceData.smallImageText = 'Managing projects'
    }
    else if (path.startsWith('/clients')) {
      presenceData.details = '👥 | Clients'
      presenceData.state = '🔍 | Viewing client information'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Viewing clients'
    }
    else if (path.startsWith('/team')) {
      presenceData.details = '🤝 | Team'
      presenceData.state = '📈 | Reviewing team activity'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Viewing team activity'
    }
    else if (path.startsWith('/settings')) {
      presenceData.details = '⚙️ | Settings'
      presenceData.state = '🛠️ | Configuring workspace'
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Configuring settings'
    }
    else {
      presenceData.details = '🌐 | Workspace'
      presenceData.state = '🔍 | Browsing Clockify'
    }

    const idleSummary = buildSummaryText(
      showDaily ? dailyFormatted : null,
      showWeekly ? weeklyFormatted : null,
    )
    if (idleSummary) {
      ;(presenceData as unknown as { largeImageText: string | undefined }).largeImageText = idleSummary
    }

    const contentKey = `idle|${path}|${dailyFormatted}|${weeklyFormatted}|${showProject}|${showProjectTime}|${showDaily}|${showWeekly}`
    if (registerSlideshowKey(contentKey)) {
      slideshow.addSlide('page', {
        largeImageKey: presenceData.largeImageKey,
        details: presenceData.details,
        state: presenceData.state,
        detailsUrl: document.location.href,
        smallImageKey: presenceData.smallImageKey,
        smallImageText: presenceData.smallImageText,
      }, 5000)

      const hasIdleTotals = (showDaily && dailyFormatted) || (showWeekly && weeklyFormatted)
      if (hasIdleTotals) {
        const totalsSlideDetails = showDaily && dailyFormatted
          ? `📅 | ${dailyFormatted} today`
          : (showWeekly && weeklyFormatted ? `📊 | ${weeklyFormatted} this week` : '📊 | Time Summary')
        const totalsSlideState = showWeekly && weeklyFormatted
          ? `📈 | ${weeklyFormatted} this week`
          : undefined

        const totalsSlide: PresenceData = {
          largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Clockify/assets/logo.png',
          details: totalsSlideDetails,
          detailsUrl: document.location.href,
          smallImageKey: Assets.Pause,
        }
        if (totalsSlideState && showDaily && dailyFormatted) {
          totalsSlide.state = totalsSlideState
        }
        slideshow.addSlide('totals', totalsSlide, 5000)
      }
    }

    presence.setActivity(slideshow)
  }
  catch (err) {
    console.error('Clockify presence error:', err)
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Clockify/assets/logo.png',
      details: '🌐 | Clockify',
      state: '🔍 | Browsing workspace',
    })
  }
})

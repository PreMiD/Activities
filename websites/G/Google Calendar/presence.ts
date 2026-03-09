const presence = new Presence({
  clientId: '671599195462959104',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

async function getStrings() {
  return presence.getStrings({
    addingCalendar: 'googlecalendar.addingCalendar',
    addingCalendarByUrl: 'googlecalendar.addingCalendarByUrl',
    birthdaysSettings: 'googlecalendar.birthdaysSettings',
    browsingCalendarEmbed: 'googlecalendar.browsingCalendarEmbed',
    browsingCalendars: 'googlecalendar.browsingCalendars',
    browsingSchedule: 'googlecalendar.browsingSchedule',
    browsingTrash: 'googlecalendar.browsingTrash',
    calendar: 'googlecalendar.calendar',
    creatingCalendar: 'googlecalendar.creatingCalendar',
    customDays: 'googlecalendar.customDays',
    customizingCalendar: 'googlecalendar.customizingCalendar',
    daySchedule: 'googlecalendar.daySchedule',
    viewingAnEvent: 'googlecalendar.viewingAnEvent',
    editingAnEvent: 'googlecalendar.editingAnEvent',
    exportingCalendar: 'googlecalendar.exportingCalendar',
    generalSettings: 'googlecalendar.generalSettings',
    home: 'general.viewHome',
    inTheSettingsOf: 'googlecalendar.inTheSettingsOf',
    monthSchedule: 'googlecalendar.monthSchedule',
    searchingEvent: 'googlecalendar.searchingEvent',
    viewingCalendar: 'googlecalendar.viewingCalendar',
    viewingScheduleOf: 'googlecalendar.viewingScheduleOf',
    weekSchedule: 'googlecalendar.weekSchedule',
    yearSchedule: 'googlecalendar.yearSchedule',
  })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Calendar/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const privacy = await presence.getSetting<boolean>('privacy')
  const strings = await getStrings()
  // eslint-disable-next-line regexp/no-unused-capturing-group
  const date = document.title?.replace(/Google[\xA0 ](Calendar|Agenda) -/, '')?.replaceAll(',', ' -')?.trim()
  const eventDialog = document.querySelector('div[role="dialog"]')

  if (document.location.pathname === '/') {
    presenceData.details = strings.home
  }
  else if (document.location.pathname.startsWith('/calendar/')) {
    if (eventDialog) {
      presenceData.details = strings.viewingAnEvent
      presenceData.state = privacy ? '' : eventDialog?.querySelector('span[role="heading"]')?.textContent || ''
    }
    else if (document.location.pathname.includes('/r/day')) {
      presenceData.details = strings.daySchedule
      presenceData.state = date
    }
    else if (document.location.pathname.includes('/r/week')) {
      presenceData.details = strings.weekSchedule
      presenceData.state = date
    }
    else if (document.location.pathname.includes('/r/month')) {
      presenceData.details = strings.monthSchedule
      presenceData.state = date
    }
    else if (document.location.pathname.includes('/r/year')) {
      presenceData.details = strings.yearSchedule;
      [, presenceData.state] = date?.split(' ') ?? []
    }
    else if (document.location.pathname.includes('/r/agenda')) {
      presenceData.details = strings.browsingSchedule
    }
    else if (document.location.pathname.includes('/r/customday')) {
      presenceData.details = strings.viewingScheduleOf
      presenceData.state = strings.customDays
    }
    else if (document.location.pathname.includes('/r/eventedit')) {
      presenceData.details = strings.editingAnEvent
      presenceData.state = privacy ? '' : document.querySelector<HTMLInputElement>('div[role="main"] input[type="text"]')?.value || ''
    }
    else if (document.location.pathname.includes('/r/search')) {
      presenceData.details = strings.searchingEvent
      const urlParams = new URLSearchParams(document.location.search)
      presenceData.state = urlParams.get('q')
    }
    else if (document.location.pathname.includes('/r/trash')) {
      presenceData.details = strings.browsingTrash
    }
    else if (document.location.pathname.includes('/r/settings/addcalendar')) {
      presenceData.details = strings.addingCalendar
    }
    else if (document.location.pathname.includes('/r/settings/createcalendar')) {
      presenceData.details = strings.creatingCalendar
    }
    else if (document.location.pathname.includes('/r/settings/browsecalendars')) {
      presenceData.details = strings.browsingCalendars
    }
    else if (document.location.pathname.includes('/r/settings/addbyurl')) {
      presenceData.details = strings.addingCalendarByUrl
    }
    else if (document.location.pathname.includes('/r/settings/export')) {
      presenceData.details = strings.exportingCalendar
      presenceData.state = strings.calendar
    }
    else if (document.location.pathname.includes('/r/settings/calendar')) {
      presenceData.details = strings.inTheSettingsOf
      presenceData.state = strings.calendar
    }
    else if (document.location.pathname.includes('/r/settings/birthdays')) {
      presenceData.details = strings.birthdaysSettings
    }
    else if (document.location.pathname.includes('/r/settings')) {
      presenceData.details = strings.generalSettings
    }
    else if (document.location.pathname?.split('/')[4] === 'embed') {
      presenceData.details = strings.browsingCalendarEmbed
      presenceData.state = document.title
    }
    else if (document.location.pathname?.split('/')[4] === 'embedhelper') {
      presenceData.details = strings.customizingCalendar
    }
    else {
      presenceData.details = strings.viewingCalendar
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

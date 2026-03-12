import { Assets } from 'premid'

const presence = new Presence({
  clientId: '937622209260826664',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let microsoft = {
  OneNoteSubtopic: 'Selecting a subtopic',
  OneNoteTitle: 'Selecting a note',
  WordStatus: 'Page ? of ?',
  PptCurrentSlide: 'Slide ? of ?',
  ExcelActiveTab: '',
}

enum ActivityAssets {
  Microsoft = 'https://cdn.rcd.gg/PreMiD/websites/M/Microsoft%20365/assets/logo.png',
}

enum OtherAssets {
  Excel = 'https://cdn.rcd.gg/PreMiD/websites/M/Microsoft%20365/assets/0.png',
  OneNote = 'https://cdn.rcd.gg/PreMiD/websites/M/Microsoft%20365/assets/1.png',
  PowerPoint = 'https://cdn.rcd.gg/PreMiD/websites/M/Microsoft%20365/assets/2.png',
  Word = 'https://cdn.rcd.gg/PreMiD/websites/M/Microsoft%20365/assets/3.png',
}

presence.on(
  'iFrameData',
  (data: unknown) => {
    microsoft = data as typeof microsoft
  },
)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Microsoft,
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname } = document.location
  const privacy = await presence.getSetting<boolean>('privacy')
  const appIcon = document.querySelector('link[rel~="icon"]')?.getAttribute('href')
  if (hostname === 'www.office.com') {
    if (
      pathname.startsWith('/launch/')
      || document.querySelector('[aria-pressed="true"]')
    ) {
      presenceData.largeImageKey = OtherAssets[
        document.querySelector('[aria-pressed="true"]')
          ?.textContent as keyof typeof OtherAssets
      ] ?? ActivityAssets.Microsoft
      presenceData.details = `Browsing ${
        document.title.split('|')[0]
      } documents`
      presenceData.smallImageKey = Assets.Reading
      presenceData.smallImageText = 'Browsing'
    }
    else if (pathname.startsWith('/search')) {
      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
      presenceData.details = 'Searching...'
      if (!privacy) {
        presenceData.details = 'Searching for:'
        presenceData.state = document.querySelector<HTMLInputElement>(
          '#ms-searchux-input-0',
        )?.value
      }
    }
  }
  else if (
    appIcon?.match(/(word)|(onenote)|(microsoft365)|(ppt)|(excel)/g)
  ) {
    const appName = appIcon
      .substring(appIcon.lastIndexOf('/') + 9)
      .replace('.ico', '')
      .toLowerCase()
      .replace('onenote', 'OneNote')
      .replace('ppt', 'PowerPoint')
      .replace('word', 'Word')
      .replace('excel', 'Excel')
    presenceData.largeImageKey = OtherAssets[appName as keyof typeof OtherAssets] ?? ActivityAssets.Microsoft
    presenceData.smallImageKey = Assets.Writing
    presenceData.smallImageText = 'Editing'
    if (appName === 'OneNote') {
      presenceData.details = 'Editing a Note'
      if (!privacy) {
        presenceData.details = `Editing ${microsoft.OneNoteTitle}`
        presenceData.state = `in ${microsoft.OneNoteSubtopic}`
      }
    }
    else if (
      appName === 'Word'
      || appName === 'Excel'
      || appName === 'PowerPoint'
    ) {
      presenceData.details = `Editing ${appName
        .replace('Word', 'a Word')
        .replace('Excel', 'an Excel')
        .replace('PowerPoint', 'a PowerPoint')} document`
      if (!privacy) {
        presenceData.details = `Editing ${
          document.querySelector('[name="fileName"]')?.getAttribute('value')
          ?? document.querySelector('title')?.textContent?.split('.')[0]
        }`
        if (appName === 'Word')
          presenceData.state = microsoft.WordStatus
        else if (appName === 'PowerPoint')
          presenceData.state = microsoft.PptCurrentSlide
        else if (appName === 'Excel' && !microsoft.ExcelActiveTab)
          presenceData.state = microsoft.ExcelActiveTab
      }
    }
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
})

const presence = new Presence({
  clientId: '959487033963843594',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Colab/assets/logo.png',
  Comment = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Colab/assets/0.png',
  Information = 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Colab/assets/1.png',
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const notebookTitle = document.querySelector<HTMLInputElement>('#doc-name')?.value
  const selected = document.querySelector('.cell.focused')
  const { pathname } = location

  if (pathname === '/diff') {
    presenceData.details = 'Viewing a diff'
    if (document.querySelector('.diff-raw[aria-checked=true]')) {
      presenceData.state = 'Raw diff'
    }
    else if (document.querySelector('.diff-inline[aria-checked=true]')) {
      const [diff1, diff2] = document.querySelectorAll('.view-zones')
      presenceData.state = `${
        diff1?.querySelector('.view-line')?.textContent
      } vs ${diff2?.querySelector('.view-line')?.textContent}`
    }
    else {
      const [diff1, diff2] = document.querySelectorAll('.view-lines')
      presenceData.state = `${
        diff1?.querySelector('.view-line')?.textContent
      } vs ${diff2?.querySelector('.view-line')?.textContent}`
    }
  }
  else if (document.querySelector('#notebook-info')) {
    presenceData.details = 'Viewing notebook info'
    presenceData.state = notebookTitle
  }
  else if (document.querySelector('.notebook-settings')) {
    presenceData.details = 'Editing Notebook Settings'
  }
  else if (document.querySelector('.colab-open-dialog')) {
    presenceData.details = 'Opening Notebook'
    presenceData.state = `From ${
      document.querySelector('.colab-open-dialog .iron-selected')?.textContent
    }`
  }
  else if (document.querySelector('#preferences-dialog')) {
    presenceData.details = 'Editing Settings'
  }
  else {
    // Editing or viewing a file
    // Checking if the user has edit permissions
    if (
      document
        .querySelector('colab-last-saved-indicator')
        ?.getAttribute('command') === 'save'
    ) {
      presenceData.details = `Viewing ${notebookTitle}`
    }
    else {
      presenceData.details = `Editing ${notebookTitle}`
    }

    // Getting the type of the selected cell
    if (selected?.classList.contains('code')) {
      presenceData.state = 'Editing code block'
    }
    else if (selected?.classList.contains('text')) {
      if (selected.classList.contains('edit'))
        presenceData.state = 'Editing text block'
      else presenceData.state = 'Viewing text block'
    }

    // Checking if the user is commenting
    if (document.querySelector('.comment-fragment.editing.focused')) {
      presenceData.smallImageKey = ActivityAssets.Comment
      presenceData.smallImageText = 'Commenting'
    }
    else {
      // Checking runtime resources
      const connectShadowRoot = document.querySelector(
        'colab-connect-button',
      )?.shadowRoot
      if (connectShadowRoot?.querySelector('#connect-button-resource-display')) {
        presenceData.smallImageKey = ActivityAssets.Information
        presenceData.smallImageText = `Ram: ${
          connectShadowRoot
            ?.querySelector('.ram')
            ?.shadowRoot
            ?.querySelector<HTMLElement>('.total > div')
            ?.style
            ?.width
        } Disk: ${
          connectShadowRoot
            ?.querySelector('.disk')
            ?.shadowRoot
            ?.querySelector<HTMLElement>('.total > div')
            ?.style
            ?.width
        }`
      }
    }
  }

  presence.setActivity(presenceData)
})

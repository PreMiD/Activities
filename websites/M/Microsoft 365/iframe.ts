const iframe = new iFrame()

iframe.on('UpdateData', async () => {
  if (
    document.querySelector(
      '#NavPaneSectionList > div.sectionList [aria-label~="Selected."]',
    )
  ) {
    iframe.send({
      OneNoteSubtopic: document.querySelector(
        '#NavPaneSectionList > div.sectionList [aria-label~="Selected."]',
      )?.textContent,
      OneNoteTitle: document.querySelector('[name="fileName"]')?.getAttribute('value')
        ?? document.querySelector('title')?.textContent?.split('.')[0],
    })
  }
  else if (
    document.querySelector(
      '#WACStatusBarContainer div[data-unique-id~="GetSlideInformation"]',
    )
  ) {
    iframe.send({
      PptCurrentSlide: document.querySelector(
        '#WACStatusBarContainer div[data-unique-id="GetSlideInformation"]',
      )?.textContent,
    })
  }
  else if (document.querySelector('li.tab-active > a')) {
    iframe.send({
      ExcelActiveTab: document.querySelector('li.tab-active > a')?.ariaLabel,
    })
  }
  else if (
    document.querySelector('#WACStatusBarContainer button:nth-child(1)')
  ) {
    // For some reason currentPage doesn't always show up so this has to be used instead, altering between totalWords and currentPage
    iframe.send({
      WordStatus: document.querySelector<HTMLButtonElement>(
        '#WACStatusBarContainer button:nth-child(1)',
      )?.ariaLabel,
    })
  }
})

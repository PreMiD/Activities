function handleFootball(page: string, presenceData: PresenceData): void {
  presenceData.state = 'Football'
  switch (page) {
    case 'results.html':
      presenceData.state += ' Results'
      break

    case 'fixtures.html':
      presenceData.state += ' Fixtures'
      break

    case 'tables.html':
      presenceData.state += ' Tables'
      break
  }
}

export function handleSport(ext: string, presenceData: PresenceData): void {
  presenceData.details = 'Browsing Sports'
  const sportCat = ext.split('/')
  // try first "most popular" method
  const title = document
    .querySelector('.sport')
    ?.querySelector('.listTitle')
    ?.textContent

  // sportCat can be 2 or 3 long
  if (sportCat[1] === 'football')
    handleFootball(sportCat[sportCat.length - 1]!, presenceData)
  else if (title)
    presenceData.state = title
  else presenceData.state = document.title.split('|')[0]?.trim()
}

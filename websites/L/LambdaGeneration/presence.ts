const presence = new Presence({
  clientId: '1018020550095945828',
})

presence.on('UpdateData', async () => {
  const splitted: string[] = window.location.pathname.substring(1).split('/')
  const subComms: Record<string, string> = {
    'half-life': 'Half-Life',
    'portal': 'Portal',
    'tf2': 'Team Fortess 2',
    'valve': 'Valve',
    'lambdageneration': 'LambdaGeneration',
    'black-mesa': 'Black Mesa',
    'sfm': 'Source Film Maker',
    'sven-co-op': 'Sven Co-op',
    'gmod': 'Garry\'s Mod',
    'csgo': 'CS:GO',
    'l4d': 'Left 4 Dead',
  }
  const page: [string, string] = ['Viewing', 'trending']
  if (window.location.hostname.includes('lambdabuilds')) {
    if (splitted[0]) {
      page[0] += ' competition:'
      page[1] = document.querySelectorAll('h1.Title')[0]?.innerHTML ?? ''
    }
    else {
      page[0] += ':'
      page[1] = 'competitions'
    }
  }
  else {
    switch (splitted.length) {
      case 1: {
        page[0] += ':'
        if (window.location.hostname.includes('lft'))
          page[1] = 'LFTs'
        else if (subComms[splitted[0]!])
          page[1] += ` in ${subComms[splitted[0]!]}`
        else if (splitted[0])
          page[1] = splitted[0]
        break
      }

      case 2:
      case 3: {
        if (splitted[0] === 'user') {
          page[0] += ' user:'
          page[1] = document.querySelectorAll(
            '.PROFILE_NAME.Title',
          )[0]?.innerHTML ?? ''
          break
        }
        else if (splitted[1] === 'post') {
          page[0] += ' post by:'
          page[1] = document.querySelectorAll(
            '.TEXT_CLIP.POST_DISPLAY_NAME.AuthorName',
          )[0]?.innerHTML ?? ''
          break
        }
        else if (splitted[0] === 'search') {
          page[0] = 'Searching for'
          if (splitted[2] === 'users')
            page[0] += ' user'

          page[0] += ':'
          page[1] = document.querySelectorAll('.Title')[0]?.innerHTML ?? ''
          break
        }
        else if (
          splitted[0]?.includes('image')
          || splitted[0]?.includes('video')
          || splitted[1]?.includes('img')
        ) {
          page[0] += ' directly:'
          page[1] = 'media'
          break
        }
        else if (subComms[splitted[0]!]) {
          page[0] += ':'
          if (!splitted[2]) {
            page[1] = `${splitted[1]} in ${subComms[splitted[0]!]}`
          }
          else {
            page[1] = `${splitted[2]} ${splitted[1]} in ${
              subComms[splitted[0]!]
            }`
          }

          break
        }
        page[0] += ':'
        page[1] = splitted[0] ?? ''
        break
      }
    }
  }

  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/LambdaGeneration/assets/logo.png',
    details: page[0],
    state: page[1],
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

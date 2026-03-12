const presence = new Presence({
  clientId: '719604498389270599',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const presenceData: PresenceData = {
  largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/M/MyBOT/assets/logo.png',
  startTimestamp: browsingTimestamp,
}

presence.on('UpdateData', () => {
  const route = document.location.pathname.split('/')

  if (!route[1]) {
    presenceData.details = 'Viendo la página principal'
  }
  else {
    switch (route[1]) {
      case 'guias': {
        presenceData.details = 'Viendo las guías'
        break
      }
      case 'guia': {
        presenceData.details = 'Viendo la guía:'
        switch (route[2]) {
          case 'mybot': {
            presenceData.state = 'MyBOT'
            break
          }
          case 'sqlite': {
            presenceData.state = 'SQLite'
            break
          }
          case 'mybot-op': {
            presenceData.state = 'MyBOT OP'
            break
          }
          default: {
            presenceData.state = route[2]
              ?.replaceAll('-', '')
              .replace(/^[a-z]/i, c => c.toUpperCase())
          }
        }

        break
      }
      case 'tools': {
        presenceData.details = 'Viendo las herramientas'
        presenceData.state = 'de desarrollo'

        break
      }
      case 'otros': {
        presenceData.details = 'Viendo otras guías'
        break
      }
      case 'logros': {
        presenceData.details = 'Viendo los logros'
        break
      }
      case 'logro': {
        presenceData.details = 'Viendo el logro:'
        presenceData.state = document.querySelector(
          '.card-title.text-bold.mb-2',
        )?.textContent

        break
      }
      case 'team': {
        if (!route[2]) {
          presenceData.details = 'Viendo al equipo'
        }
        else {
          switch (route[2]) {
            case 'roles': {
              presenceData.details = 'Viendo los roles'
              break
            }
            case 'banderas': {
              presenceData.details = 'Viendo las banderas'
              break
            }
            case 'reglas': {
              presenceData.details = 'Viendo las reglas'
              break
            }
          }
        }

        break
      }
      case 'leaderboard': {
        presenceData.details = 'Viendo el top de usuarios'
        break
      }
      case 'puntos': {
        presenceData.details = 'Viendo acciones para'
        presenceData.state = 'conseguir puntos'

        break
      }
      case 'mybotlist': {
        if (!route[2]) {
          presenceData.details = 'Viendo MyBOT List'
        }
        else if (route[2] === 'bot') {
          if (!route[3]) {
            presenceData.details = 'Viendo el bot:'
            presenceData.state = document.querySelector('.card-title')?.textContent
          }
          else if (route[3] === 'add') {
            presenceData.details = 'Añadiendo un bot'
          }
        }
        else if (route[2].startsWith('tag')) {
          presenceData.details = 'Viendo bots de:'
          presenceData.state = route[2]
            ?.split('?c=')[1]
            ?.replace(/^[a-z]/i, c => c.toUpperCase())
        }
        else if (route[2] === 'me') {
          presenceData.details = 'Viendo su perfil'
        }
        else if (route[2] === 'edit') {
          presenceData.details = 'Editando un bot'
        }

        break
      }
      case 'codes': {
        presenceData.details = 'Viendo los códigos'
        break
      }
      case 'code': {
        presenceData.details = 'Viendo el código:'
        presenceData.state = document
          .querySelector('.text-dark')
          ?.textContent
          ?.slice(2)

        break
      }
      case 'comunidad': {
        if (route[2] === 'videos') {
          presenceData.details = 'Viendo videos de la'
          presenceData.state = 'comunidad'
        }

        break
      }
      case 'publicidad': {
        presenceData.details = 'Añadiendo publicidad'
        break
      }
      case 'perfil': {
        if (!route[2])
          presenceData.details = 'Viendo su perfil'
        else if (route[2] === 'editar-perfil')
          presenceData.details = 'Editando su perfil'

        break
      }
      case 'u': {
        presenceData.details = 'Viendo el perfil de:'
        presenceData.state = document
          .querySelector('.username')
          ?.textContent
          ?.trim()

        break
      }
    }
  }

  presence.setActivity(presenceData)
})

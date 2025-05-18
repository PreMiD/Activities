import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Worldhideaway/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'World Hideaway',
  }
  const search = document.querySelector<HTMLInputElement>(
    '#masthead > div.header-search-wrap > div > form > label > input',
  )
  const { href, pathname } = document.location
  const [privacy, buttons, covers] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('covers'),
  ])
  if (privacy) {
    presenceData.details = 'Hojeada'
  }
  else {
    switch (pathname.split('/')[1]) {
      case '': {
        if (search?.value) {
          presenceData.details = 'Buscando'
          presenceData.state = search.value
          presenceData.smallImageKey = Assets.Search
        }
        else {
          presenceData.details = 'Viendo Inicio'
        }

        break
      }
      case 'register': {
        presenceData.details = 'Registro'
        break
      }
      case 'logros': {
        presenceData.details = 'Viendo logros'
        presenceData.buttons = [
          {
            label: 'Ver Logros',
            url: href,
          },
        ]
        break
      }
      case 'events': {
        presenceData.details = 'Viendo eventos'
        presenceData.buttons = [
          {
            label: 'Ver Eventos',
            url: href,
          },
        ]
        break
      }
      case 'activity': {
        presenceData.details = 'Leyendo sobre'
        presenceData.state = 'Actividad'
        presenceData.smallImageKey = Assets.Reading
        presenceData.buttons = [
          {
            label: 'Ver Actividad',
            url: href,
          },
        ]

        break
      }
      case 'topic': {
        presenceData.details = 'Viendo noticia sobre'
        presenceData.state = document.querySelector(
          '#topic-6307-replies > li.bs-item-wrap.bs-header-item.align-items-center.no-hover-effect > div > div.item-title > h1',
        )?.textContent
        presenceData.buttons = [
          {
            label: 'Ver Noticia',
            url: href,
          },
        ]
        break
      }
      case 'members': {
        if (document.querySelector('[id="members-all"]')) {
          presenceData.details = 'Viendo miembros'
          presenceData.buttons = [
            {
              label: 'Ver Miembros',
              url: href,
            },
          ]
        }
        else {
          presenceData.buttons = [
            {
              label: 'Ver Miembro',
              url: href,
            },
          ]
          presenceData.largeImageKey = document
            .querySelector('[alt*="Profile photo of"]')
            ?.getAttribute('src')
          presenceData.details = `Viendo ${
            document.querySelector(
              '#item-header-content > div > div > div.flex.align-items-center.member-title-wrap > h2',
            )?.textContent
          }'s Perfil`
        }
        break
      }
      case 'category': {
        presenceData.buttons = [
          {
            label: 'Ver Categoría',
            url: href,
          },
        ]
        presenceData.details = 'Viendo categoría'
        presenceData.state = document.querySelector(
          '#main > header > h1 > span',
        )?.textContent
        break
      }
      case 'faqs': {
        presenceData.buttons = [
          {
            label: 'Leer FAQ',
            url: href,
          },
        ]
        presenceData.details = 'Leyendo FAQ'
        presenceData.smallImageKey = Assets.Reading
        break
      }
      case 'contacto': {
        presenceData.buttons = [
          {
            label: 'Ver Contacto',
            url: href,
          },
        ]
        presenceData.details = 'Viendo contacto'
        break
      }
      default: {
        const check = document.querySelector(
          '#main > div > div > section.elementor-section.elementor-top-section.elementor-element.elementor-element-7cf6a1d.elementor-section-boxed.elementor-section-height-default.elementor-section-height-default > div > div > div > div > div > div > div > h1',
        )
        const active = document.querySelector('[aria-current="page"]')
          ?? document.querySelector('[class="current_page_item"]')

        if (check) {
          presenceData.buttons = [
            {
              label: 'Leer Articulo',
              url: href,
            },
          ]
          presenceData.details = `Leyendo ${check.textContent}`
          presenceData.smallImageKey = Assets.Reading
        }
        else if (active) {
          presenceData.buttons = [
            {
              label: 'Ver Información',
              url: href,
            },
          ]
          presenceData.details = `Viendo ${active.textContent}`
        }
        else {
          presenceData.details = 'Página no encontrada'
        }
        break
      }
    }
  }

  if (!buttons)
    delete presenceData.buttons
  if (!covers) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/W/Worldhideaway/assets/logo.png'
  }
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

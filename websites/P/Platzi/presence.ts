const presence = new Presence({
  clientId: '834628404233240628',
})
const estimatedTime = Math.floor(Date.now() / 1000)

let categoriesEventListener = false
let activeCategory = ''

function stripPlatziProfileFlags(url: string) {
  return url
    .replace('https://static.platzi.com/media/flags/', '')
    .replace('.png', '')
}
function setPresenceFromEvent(learningPath: string) {
  activeCategory = learningPath
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/P/Platzi/assets/logo.jpg',
  }
  const { pathname } = document.location
  const pathNameSplit = pathname.split('/').filter(Boolean)

  if (pathname.includes('/home')) {
    const inputValues = [
      ...document.querySelectorAll<HTMLInputElement>('.SearchBar input'),
    ]
      .map(input => input.value)
      .filter(Boolean)

    presenceData.state = 'Página de inicio'

    if (inputValues.length > 0) {
      presenceData.state = 'Página de inicio'

      if (inputValues[0]?.replace(/ /g, '') !== '') {
        presenceData.details = 'Página de inicio'
        presenceData.state = `Buscando: ${inputValues[0]}`
      }
    }
  }
  else if (pathname.includes('/blog/buscar')) {
    const input = document.querySelector<HTMLInputElement>('.Search-input')
    const blogPage = document.querySelector<HTMLElement>(
      'a.Pagination-number.is-current',
    )

    presenceData.details = 'Viendo el Blog'

    if (input?.value) {
      presenceData.state = 'Viendo el Blog'

      if (blogPage)
        presenceData.state = `Página ${blogPage.textContent}`

      if (input.value.replace(/ /g, '') !== '') {
        presenceData.state = `Buscando: ${input.value}${
          blogPage ? ` [Pagina ${blogPage.textContent}]` : ''
        }`
      }
    }
    else if (blogPage) {
      presenceData.state = `Página ${blogPage.textContent}`
    }
  }
  else if (pathname.startsWith('/blog/')) {
    presenceData.details = 'Viendo el Blog'

    if (pathNameSplit.length > 1) {
      presenceData.details = `Blog: ${
        document.querySelector<HTMLHeadingElement>('.Discussion-title h1')
          ?.textContent
      }`
      presenceData.state = `de ${
        document.querySelector<HTMLAnchorElement>('.DiscussionInfo-user a')
          ?.textContent
      } [${
        document.querySelector<HTMLSpanElement>('.DiscussionInfo span')
          ?.textContent
      } pts] ${
        document.querySelector<HTMLParagraphElement>('.DiscussionInfo-time')
          ?.textContent
      }`
      presenceData.buttons = [
        { label: 'Ver el Artículo', url: `https://platzi.com${pathname}` },
      ]
    }
  }
  else if (pathname.startsWith('/foro/')) {
    const input = document.querySelector<HTMLInputElement>(
      '.CustomSearchInput-search-input',
    )
    const forumPage = document.querySelector<HTMLAnchorElement>(
      '.Paginator-number.is-current',
    )

    presenceData.details = 'Viendo el Foro'

    if (input?.value) {
      presenceData.state = 'Viendo el Foro'

      if (forumPage)
        presenceData.state = `Página ${forumPage.textContent}`

      if (input.value.replace(/ /g, '') !== '') {
        presenceData.state = `Buscando: ${input.value}${
          forumPage ? ` [Pagina ${forumPage.textContent}]` : ''
        }`
      }
    }
    else if (forumPage) {
      presenceData.state = `Página ${forumPage.textContent}`
    }
  }
  else if (pathname.startsWith('/precios/')) {
    presenceData.state = 'Viendo los planes de compra'
  }
  else if (pathname.startsWith('/empresas/')) {
    presenceData.state = 'Viendo el plan para empresas'
  }
  else if (pathname.startsWith('/comprar/')) {
    presenceData.details = 'Comprando un plan...'
    presenceData.state = document.querySelector('.Details-name')?.textContent
  }
  else if (pathname.startsWith('/clases/notificaciones/')) {
    presenceData.details = 'Viendo sus notificaciones'

    const notificationPage = document.querySelector(
      '.Paginator-number.is-current',
    )

    if (notificationPage)
      presenceData.state = `Página ${notificationPage.textContent}`
  }
  else if (pathname.startsWith('/p/')) {
    const userFlag = document.querySelector<HTMLElement>(
      'div.ProfileHeader-username > figure > img',
    )
    const userLink = document.querySelector<HTMLAnchorElement>('.UserUrl-link')

    let finalString = ` ${
      document.querySelector<HTMLElement>('.ProfileHeader-name')?.textContent
    } `
    if (userFlag) {
      finalString += ` ${stripPlatziProfileFlags(
        userFlag.getAttribute('src') ?? '',
      )} `
    }

    finalString += ` [${
      document.querySelector<HTMLElement>('.ProfileScore-number.is-green')
        ?.textContent
    } pts] `

    if (userLink) {
      presenceData.buttons = [
        { label: 'Link personal', url: `${userLink.href}` },
      ]
    }

    presenceData.details = 'Viendo el perfil de'

    if (
      [...document.querySelectorAll('.SingleTab')].find(
        tab => tab.textContent === 'Mi Portafolio',
      )
    ) {
      presenceData.details = 'Viendo su perfil'
    }

    presenceData.state = finalString
  }
  else if (pathname === '/agenda/') {
    presenceData.state = 'Viendo la Agenda'
  }
  else if (pathname === '/live/') {
    presenceData.state = 'Viendo Platzi Live'
    presenceData.startTimestamp = estimatedTime
    presenceData.buttons = [
      { label: 'Ver Live', url: `https://platzi.com${pathname}` },
    ]
  }
  else if (pathname.includes('/clases/') && pathNameSplit.length === 2) {
    presenceData.state = `de ${
      document.querySelector<HTMLSpanElement>('.TeacherList-full-name')
        ?.textContent
    }`
    presenceData.details = document.querySelector<HTMLHeadingElement>(
      '.CourseDetail-left-title',
    )?.textContent
    presenceData.buttons = [
      {
        label: 'Ver curso',
        url: `https://platzi.com${pathname}`,
      },
    ]
  }
  else if (
    pathname.includes('/clases/')
    && pathNameSplit.length > 2
    && !pathname.includes('examen')
  ) {
    const course = document.querySelector<HTMLAnchorElement>(
      '.Header-course-info-content a',
    )
    const video = document.querySelector<HTMLVideoElement>('.vjs-tech')
    const [actualEpisode, finalEpisode] = document
      .querySelector<HTMLSpanElement>('.Header-class-title span')
      ?.textContent
      ?.split('/') ?? []

    presenceData.details = `${
      document.querySelector<HTMLHeadingElement>('.Header-class-title h1')
        ?.textContent
    } [${actualEpisode}/ ${finalEpisode}]`
    presenceData.state = `${course?.children[0]?.textContent}`
    presenceData.buttons = [
      {
        label: 'Ver Curso',
        url: `https://platzi.com${course?.getAttribute('href')}`,
      },
      { label: 'Ver Clase', url: `https://platzi.com${pathname}` },
    ]

    if (
      video
      && !Number.isNaN(video.duration)
      && document
        .querySelector<HTMLElement>('.VideoPlayer > div')
        ?.className
        .includes('vjs-playing')
    ) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    }
  }
  else if (pathname.includes('/cursos/')) {
    // NEW UI, SAME PRESENCE /CLASES/
    if (pathNameSplit.length >= 2) {
      presenceData.state = `de ${
        document.querySelector<HTMLElement>('.Hero-teacher-name strong')
          ?.textContent
      }`
      presenceData.details = document.querySelector<HTMLHeadingElement>(
        '.Hero-content-title',
      )?.textContent
    }
    else {
      presenceData.state = 'Buscando cursos...'
      presenceData.startTimestamp = estimatedTime
    }
  }
  else if (pathname.includes('/categorias/')) {
    if (pathNameSplit.length >= 2) {
      const learningPaths = document.querySelectorAll<HTMLAnchorElement>('.LearningPathItem')
      presenceData.state = document.querySelector<HTMLSpanElement>(
        '.HeroCoursesItem-title span',
      )?.textContent
      presenceData.details = activeCategory

      if (activeCategory !== '')
        presenceData.details = activeCategory

      if (!categoriesEventListener) {
        for (const learningPath of learningPaths) {
          learningPath.addEventListener('mouseover', () =>
            setPresenceFromEvent(learningPath.querySelector('h2')?.textContent ?? ''))
        }
        categoriesEventListener = true
      }
    }
  }
  else if (pathname.includes('/tutoriales/')) {
    presenceData.details = document.querySelector(
      '.Breadcrumb-desktop span:nth-child(2) a',
    )?.textContent
    presenceData.state = 'Viendo un tutorial...'
  }
  else if (pathNameSplit.includes('examen')) {
    if (pathname.includes('tomar_examen')) {
      presenceData.details = document.querySelector(
        '.ExamProgress-top-title',
      )?.textContent
      presenceData.state = `${
        document.querySelector<HTMLHeadingElement>('.QuestionSelector-title')
          ?.textContent
      } [${document
        .querySelector('.ExamProgress-top-count > span')
        ?.textContent
        ?.replace(/de /gi, '')
        ?.split(' ')
        ?.join('-')}]`
    }
    else if (pathname.includes('review')) {
      presenceData.details = document.querySelector<HTMLHeadingElement>(
        '.ExamProgress-top-title',
      )?.textContent
      presenceData.state = 'Revisando sus respuestas...'
    }
    else if (pathname.includes('resultados')) {
      const score = Number.parseFloat(
        document.querySelector('.ExamResults-score-grade')?.textContent ?? '',
      )
      presenceData.details = document.querySelector<HTMLParagraphElement>(
        '.CourseRow-title',
      )?.textContent
      presenceData.state = `Examen ${
        score >= 9 ? 'aprobado' : 'no aprobado'
      }. [${score} en ${
        document
          .querySelector('.ExamResults-score-answers')
          ?.textContent
          ?.split('/')[1]
      } preguntas]`
    }
    else {
      presenceData.details = document.querySelector<HTMLHeadingElement>(
        '.StartExamOverview-course-title',
      )?.textContent
      presenceData.state = `Empezando el examen [${
        document.querySelector<HTMLLIElement>(
          '.StartExamOverview-list-item:nth-child(2) > strong',
        )?.textContent
      }]`
    }
  }
  else if (pathname.startsWith('/direct-messages/u/soporte-platzi')) {
    presenceData.state = 'Hablando con el Soporte Platzi'
  }
  else if (pathname.startsWith('/mensajes-directos/')) {
    presenceData.state = 'Viendo sus Mensajes'
  }
  else if (pathname.startsWith('/empleos/')) {
    presenceData.state = 'Viendo la lista de Empleos'
  }
  else if (pathname.startsWith('/mi-suscripcion/beneficiario/')) {
    presenceData.state = 'Viendo su Beneficiario'
  }
  else if (pathname.startsWith('/mi-suscripcion/facturas/')) {
    presenceData.details = `Viendo sus ${
      document.querySelector<HTMLHeadingElement>('.InvoicesList-title')
        ?.textContent
    }`
    presenceData.state = `${
      document.querySelector<HTMLDivElement>('.ProfileMenu-name')?.textContent
    } [${
      document.querySelector<HTMLDivElement>('.ProfileMenu-rank')?.textContent
    }]`
  }
  else if (pathname.startsWith('/mi-suscripcion/referidos/')) {
    presenceData.state = 'Viendo sus referidos'
    presenceData.buttons = [
      {
        label: 'Referido',
        url: `${
          document.querySelector<HTMLInputElement>('#copyUrl')?.textContent
        }`,
      },
    ]
  }
  else if (pathname.startsWith('/mi--suscripcion/')) {
    presenceData.details = 'Viendo su suscripción'
    presenceData.state = `${
      document.querySelector<HTMLDivElement>('.CurrentPlan-name')?.textContent
    }`
  }

  presence.setActivity(presenceData)
})

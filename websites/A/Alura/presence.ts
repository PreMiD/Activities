import { ActivityType, Assets } from 'premid'

const presence = new Presence({
  clientId: '999738497546059907',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/0.png',
    details: 'Vendo a Alura',
    startTimestamp: browsingTimestamp,
  } as PresenceData
  const video = document.querySelector('video')

  if (
    document.location.pathname.includes('/course')
    && !document.location.pathname.includes('/courses')
    && !document.location.pathname.includes('/task')
  ) {
    presenceData.details = 'Vendo um curso'
    if (
      !document.querySelector(
        'div.container.course-header-banner-content > div > div.hreview-aggregate > h1 > strong',
      )
    ) {
      presenceData.state = document.querySelector(
        'section.task-menu-header > div > a > h2',
      )?.textContent
    }
    else {
      presenceData.state = document.querySelector(
        'div.container.course-header-banner-content > div > div.hreview-aggregate > h1 > strong',
      )?.textContent
    }

    switch (
      document
        .querySelector('a.course-header-banner-breadcrumb__category')
        ?.getAttribute('aria-label')
    ) {
      case 'Front-end': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/1.png'
        break
      }
      case 'Programação': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/2.png'
        break
      }
      case 'DevOps': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/3.png'
        break
      }
      case 'UX & Design': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/4.png'
        break
      }
      case 'Data Science': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/5.png'
        break
      }
      case 'Mobile': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/6.png'
        break
      }
      case 'Inovação & Gestão': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/7.png'
        break
      }
    }
  }
  else if (
    document.location.pathname.includes('/course')
    && document.location.pathname.includes('/task')
  ) {
    presenceData.details = document.querySelector(
      'a.task-menu-header-info-title > h2',
    )?.textContent
    presenceData.state = document.querySelector(
      'span.task-body-header-title-text',
    )?.textContent
    presenceData.smallImageKey = video?.paused ? Assets.Pause : Assets.Play
    presenceData.smallImageText = video?.paused ? 'Pausado' : 'Reproduzindo'

    delete presenceData.startTimestamp
    if (video && !video.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] = presence.getTimestampsfromMedia(video)
    }
  }
  else if (document.location.pathname.includes('/dashboard')) {
    presenceData.details = 'Vendo a dashboard'
  }
  else if (document.location.pathname.includes('/formacao')) {
    presenceData.details = 'Vendo uma formação'
    presenceData.state = document.querySelector(
      'div.formacao-header-headline > h1',
    )?.textContent

    switch (
      document.querySelector('div.formacao__info-categoria > a')?.textContent
    ) {
      case 'Front-end': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/1.png'
        break
      }
      case 'Programação': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/2.png'
        break
      }
      case 'DevOps': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/3.png'
        break
      }
      case 'UX & Design': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/4.png'
        break
      }
      case 'Data Science': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/5.png'
        break
      }
      case 'Mobile': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/6.png'
        break
      }
      case 'Inovação & Gestão': {
        presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/7.png'
        break
      }
    }
  }
  else if (document.location.pathname.includes('/courses')) {
    presenceData.details = 'Vendo meus cursos'
  }
  else if (document.location.pathname.includes('/user')) {
    if (document.querySelector('.profile-header-name')) {
      presenceData.details = 'Vendo o perfil de um usuário'
      presenceData.state = document.querySelector(
        '.profile-header-name',
      )?.textContent
    }
    else {
      if (document.location.pathname.includes('/planos-de-estudo'))
        presenceData.details = 'Vendo planos de estudo'
      else if (document.location.pathname.includes('/payments'))
        presenceData.details = 'Vendo pagamentos'
      else document.location.pathname.includes('/rank')
      presenceData.details = 'Vendo o ranking da comunidade'
    }
  }
  else if (document.location.pathname.includes('/aluraflix')) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/8.png'
    presenceData.details = 'Vendo o Aluraflix'
  }
  else if (document.location.pathname.includes('/carreirasemfronteiras')) {
    const title = document.querySelector('.podcast-header-title')
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/9.png'
    presenceData.details = 'Ouvindo o "Carreiras sem Fronteiras"'
    if (title && !document.querySelector('.--margin-left-image'))
      presenceData.state = `"${title.textContent}"`
  }
  else if (document.location.pathname.includes('/scubadev')) {
    const title = document.querySelector('.podcast-header-title')
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/10.png'
    presenceData.details = 'Ouvindo o "ScubaDev"'
    if (title && !document.querySelector('.--margin-left-image'))
      presenceData.state = `"${title.textContent}"`
  }
  else if (document.location.pathname.includes('/layerstech')) {
    const title = document.querySelector('.podcast-header-title')
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/11.png'
    presenceData.details = 'Ouvindo o "Layers.Tech"'
    if (title && !document.querySelector('.--margin-left-image'))
      presenceData.state = `"${title.textContent}"`
  }
  else if (document.location.pathname.includes('/likeaboss')) {
    const title = document.querySelector('.podcast-header-title')
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/12.png'
    presenceData.details = 'Ouvindo o "Like a Boss"'
    if (title && !document.querySelector('.--margin-left-image'))
      presenceData.state = `"${title.textContent}"`
  }
  else if (document.location.pathname.includes('/hipsterstech')) {
    const title = document.querySelector('.podcast-header-title')
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/13.png'
    presenceData.details = 'Ouvindo o "Hipsters.Tech"'
    if (title && !document.querySelector('.--margin-left-image'))
      presenceData.state = `"${title.textContent}"`
  }
  else if (document.location.pathname.includes('/cases')) {
    const title = document.querySelector('.intro__title')
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/14.png'
    presenceData.details = 'Assistindo um case'
    if (title && document.location.pathname.includes('/extra'))
      presenceData.state = `"${title.textContent}"`
  }
  else if (document.location.pathname.includes('/alura-mais')) {
    presenceData.largeImageKey = 'https://cdn.rcd.gg/PreMiD/websites/A/Alura/assets/15.png'
    presenceData.details = 'Vendo Alura+'
  }
  else if (document.location.pathname.includes('/formacoes')) {
    presenceData.details = 'Vendo formações'
  }
  else if (document.location.pathname.includes('/imersoes')) {
    presenceData.details = 'Vendo imersões'
  }
  else if (document.location.pathname.includes('/podcasts')) {
    presenceData.details = 'Vendo podcasts'
  }
  else if (document.location.pathname.includes('/recommendations')) {
    presenceData.details = 'Vendo recomendações'
  }
  else if (
    document.location.pathname.includes('/forum')
    && !document.location.pathname.includes('/topico-')
  ) {
    presenceData.details = 'Vendo fórums'
  }
  else if (
    document.location.pathname.includes('/forum')
    && document.location.pathname.includes('/topico-')
  ) {
    presenceData.details = 'Lendo um tópico no fórum'
    presenceData.state = `"${
      document.querySelector('.topic-header-container-title')?.textContent
    }"`
  }
  else if (document.location.pathname.includes('/planos-estudos-publicos')) {
    presenceData.details = 'Vendo planos de estudo públicos'
  }
  else if (document.location.pathname.includes('/points')) {
    presenceData.details = 'Vendo pontos'
  }

  if (presenceData.endTimestamp)
    presenceData.type = ActivityType.Watching
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

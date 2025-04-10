import type { IframeData } from './iframe.js'
import { ActivityType } from 'premid'

import {
  isValidUUID,
  removeParentesisFromNumber,
  removeThemePrefix,
} from './utils/index.js'

const presence = new Presence({
  clientId: '1359697490579947590',
})

enum ActivityAssets {
  Logo = 'https://imgur.com/2ooS3wz.png',
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

let iframeContent: IframeData | null = null

presence.on('iFrameData', (receivedData: IframeData) => {
  iframeContent = receivedData
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    type: ActivityType.Playing,
  }

  const [
    showStudentPage,
    showCursing,
    showDisciplines,
    showProgress,
    showContents,
    showDisciplineName,
    showTheme,
    showVisualizingExercises,
    showVisualizingWorks,
    showVisualizingAvaliations,
    showVisualizingSocioemotionalFormation,
    showVisualizingComplementaryCourses,
    showVisualizingAcademicCalendar,
    showAvaliationsRoom,
    showAvaliations,
    showExercises,
    showExerciseProgress,
    showCampus,
  ] = await Promise.all([
    presence.getSetting<boolean>('show-student-page'),
    presence.getSetting<boolean>('show-cursing'),
    presence.getSetting<boolean>('show-disciplines'),
    presence.getSetting<boolean>('show-progress'),
    presence.getSetting<boolean>('show-contents'),
    presence.getSetting<boolean>('show-discipline-name'),
    presence.getSetting<boolean>('show-theme'),
    presence.getSetting<boolean>('show-visualizing-exercises'),
    presence.getSetting<boolean>('show-visualizing-works'),
    presence.getSetting<boolean>('show-visualizing-avaliations'),
    presence.getSetting<boolean>('show-visualizing-socioemocional-formation'),
    presence.getSetting<boolean>('show-visualizing-complementary-courses'),
    presence.getSetting<boolean>('show-visualizing-academic-calendar'),
    presence.getSetting<boolean>('show-avaliations-room'),
    presence.getSetting<boolean>('show-avaliations'),
    presence.getSetting<boolean>('show-exercises'),
    presence.getSetting<boolean>('show-exercise-progress'),
    presence.getSetting<boolean>('show-campus'),
  ])

  const host = document.location.hostname

  // Estudante
  if (host === 'estudante.estacio.br' && showStudentPage) {
    presenceData.details = 'Navegando na página de estudante'

    const courseName = document.querySelector(
      'h1[data-testid=\'header-curso\']',
    )?.textContent

    if (courseName && showCursing) {
      presenceData.details = `Cursando ${courseName}`
    }

    // Disciplinas
    if (document.location.pathname.includes('/disciplinas') && showDisciplines) {
      presenceData.state = 'Visualisando disciplinas'

      const progress = document.querySelector(
        'div[role="progressbar"] > progress',
      )?.getAttribute('aria-valuenow')

      if (progress && /^\d*$/.test(progress) && showProgress) {
        presenceData.state += ` - ${progress}% concluído`
      }

      // Conteúdos
      if (document.location.pathname.includes('/conteudos')) {
        if (!showContents) {
          presenceData.state = 'Visualisando disciplina'
        }
        else {
          const disciplineName = document.querySelector(
            'main h1',
          )?.textContent

          if (disciplineName && showDisciplineName) {
            presenceData.state = `Visualizando disciplina: ${disciplineName}`
          }

          // Tema
          const paths = document.location.pathname.split('/')
          paths.shift()

          if (paths[0] === 'disciplinas'
            && paths[2] === 'conteudos'
            && paths[3]
            && isValidUUID(paths[3])) {
            const themeName = document.querySelector(
              'header[data-testid="header-modal-conteudo"] p > span',
            )?.textContent

            if (themeName && showTheme) {
              let state = removeThemePrefix(themeName)

              if (iframeContent?.topic)
                state += ` - ${iframeContent.topic}`

              presenceData.state = state
            }
            else {
              presenceData.state = 'Estudando...'
            }
          }
        }
      }

      // Exercícios
      if (document.location.pathname.includes('/exercicios')) {
        const disciplineName = document.querySelector(
          'main h1',
        )?.textContent

        if (disciplineName && showDisciplineName) {
          presenceData.state = `Visualizando exercícios: ${disciplineName}`
        }
        else if (disciplineName && !showDisciplineName) {
          presenceData.state = 'Visualizando exercícios'
        }

        if (!showVisualizingExercises)
          presenceData.state = ''
      }

      // Trabalhos
      if (document.location.pathname.includes('/trabalhos')) {
        const disciplineName = document.querySelector(
          'main h1',
        )?.textContent

        if (disciplineName && showDisciplineName) {
          presenceData.state = `Visualizando trabalhos: ${disciplineName}`
        }
        else if (disciplineName && !showDisciplineName) {
          presenceData.state = 'Visualizando trabalhos'
        }

        if (!showVisualizingWorks)
          presenceData.state = ''
      }
    }

    // Avaliações
    if (document.location.pathname.includes('/avaliacoes')) {
      presenceData.state = 'Visualisando avaliações'

      if (!showVisualizingAvaliations)
        presenceData.state = ''
    }

    // Formação socioemocional
    if (document.location.pathname.includes('/formacao-socioemocional')) {
      presenceData.state = 'Visualisando formação socioemocional'

      if (!showVisualizingSocioemotionalFormation)
        presenceData.state = ''
    }

    // Cursos complementares
    if (document.location.pathname.includes('/cursos-complementares')) {
      presenceData.state = 'Visualisando cursos complementares'

      if (!showVisualizingComplementaryCourses)
        presenceData.state = ''
    }

    // Calendário Acadêmico
    if (document.location.pathname.includes('/calendarios')) {
      presenceData.state = 'Visualisando o calendário acadêmico'

      if (!showVisualizingAcademicCalendar)
        presenceData.state = ''
    }
  }

  // Campus
  if (host === 'sia.estacio.br' && document.location.pathname.includes('/sianet')) {
    presenceData.details = 'Navegando no campus virtual'

    if (!showCampus)
      presenceData.details = ''
  }

  // Sala de avaliações
  if (host === 'estacio.saladeavaliacoes.com.br') {
    presenceData.details = 'Navegando na sala de avaliações'

    const paths = document.location.pathname.split('/')
    paths.shift()

    // Avaliação
    if (
      paths[0] === 'avaliacoes' && (paths[1]?.length || 0) >= 3
    ) {
      const disciplineName = document.querySelector(
        'div[data-testid="header"] h1',
      )?.textContent

      if (disciplineName && showDisciplineName) {
        presenceData.state = `Visualizando avaliação: ${disciplineName}`
      }
      else if (disciplineName && !showDisciplineName) {
        presenceData.state = 'Visualizando avaliação'
      }

      if (!showAvaliations) {
        presenceData.details = ''
        presenceData.state = ''
      }
    }

    // Exercício
    if (
      paths[0] === 'exercicio' && (paths[1]?.length || 0) >= 16
    ) {
      const disciplineName = document.querySelector(
        'div[data-section="section_exercicios-menu"] p',
      )?.textContent

      const answeredQuestions = document.querySelector(
        'small[data-testid="answered-questions-value"]',
      )?.textContent || '0'

      const notFilledQuestions = document.querySelector(
        'small[data-testid="not-filled-questions-value"]',
      )?.textContent || '0'

      if (disciplineName && showDisciplineName) {
        presenceData.details = `Realizando exercício: ${disciplineName}`
      }
      else if (disciplineName && !showDisciplineName) {
        presenceData.details = 'Realizando exercício'
      }

      if (answeredQuestions && notFilledQuestions) {
        const answeredStr = removeParentesisFromNumber(answeredQuestions)
        const notFilledStr = removeParentesisFromNumber(notFilledQuestions)

        if (
          (answeredStr && /^\d*$/.test(answeredStr))
          && (notFilledStr && /^\d*$/.test(notFilledStr))
        ) {
          const answered = Number.parseInt(answeredStr)
          const notFilled = Number.parseInt(notFilledStr)

          const totalQuestions = answered + notFilled
          const percentage = Math.floor((answered / totalQuestions) * 100) || 0

          const blockAnswered = '🟦'
          const blockNotFilled = '⬜'

          const blocksAnswered = blockAnswered.repeat(answered)
          const blocksNotFilled = blockNotFilled.repeat(notFilled)

          if (showExerciseProgress) {
            presenceData.state = `Perguntas respondidas: ${blocksAnswered}${blocksNotFilled} - ${percentage}%`
          }
        }
      }

      if (!showExercises) {
        presenceData.details = ''
        presenceData.state = ''
      }
    }

    if (!showAvaliationsRoom) {
      presenceData.details = ''
      presenceData.state = ''
    }
  }

  presence.setActivity(presenceData)
})

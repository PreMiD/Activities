import type { SectionState } from '../config/types.js'
import { ActivityType } from 'premid'
import { ActivityAssets, browsingTimestamp, gameNames, studySubjects, toolNames } from '../config/constants.js'
import { buildButtons, smallImageFor } from '../util/activity.js'
import { headingOr, prettify, safeDecode, textOf } from '../util/dom.js'
import { getArtwork, teacherPhotos } from '../util/images.js'
import { getPlayback, getPlaybackTimestamps, getVideo } from '../util/playback.js'
import { getAnimeTitle } from './watch.js'

/** Finds the subject name shown on a Studysto teacher or lecture page. */
export function findSubject(): string | undefined {
  const nodes = Array.from(
    document.querySelectorAll('main span, main a, main p, main h2, main li'),
  ).slice(0, 400)

  for (const node of nodes) {
    const text = textOf(node)?.toLowerCase()
    const subject = studySubjects.find(name => name.toLowerCase() === text)

    if (subject) {
      return subject
    }
  }

  return undefined
}

/** Finds the teacher's display name from a link to their page, falling back to the URL slug. */
export function findTeacher(slug: string): string {
  const link = Array.from(document.querySelectorAll('a[href]')).find((anchor) => {
    const href = safeDecode(anchor.getAttribute('href') ?? '')
    const text = textOf(anchor)

    return (
      href.startsWith(`/studysto/t/${slug}`)
      && Boolean(text)
      && (text?.length ?? 0) <= 40
      && !/back|رجوع|عودة/i.test(text ?? '')
    )
  })

  return textOf(link ?? null) ?? slug
}

/** Finds the first large https image in the main content, such as a teacher photo. */
export function findMainImage(): string | undefined {
  return Array.from(document.querySelectorAll<HTMLImageElement>('main img')).find(
    image =>
      image.src.startsWith('https:')
      && image.getBoundingClientRect().width >= 40,
  )?.src
}

/** Describes what the user is doing in a Toolsto tool, a Gamesto game or on a Studysto teacher or lecture page. */
export function getSectionState(): SectionState | undefined {
  const segments = document.location.pathname.split('/').filter(Boolean)
  const [app, second, third, fourth, fifth] = segments.map(segment =>
    safeDecode(segment),
  )
  const url = document.location.href

  if (app === 'toolsto' && second && third) {
    const categories: Record<string, string> = {
      images: 'Images',
      pdf: 'PDF',
      text: 'Text',
      developer: 'Developer',
    }

    return {
      details: `Using ${toolNames[third.toLowerCase()] ?? headingOr(prettify(third))}`,
      state: `Toolsto • ${categories[second] ?? prettify(second)}`,
      privateDetails: 'Using a tool',
      privateState: 'Toolsto',
      buttonLabel: 'Open Tool',
      url,
    }
  }

  if (
    app === 'gamesto'
    && second
    && !/^(?:browse|library|leaderboard|scores|settings)$/i.test(second)
  ) {
    return {
      details: `Playing ${gameNames[second.toLowerCase()] ?? headingOr(prettify(second))}`,
      state: 'Gamesto',
      privateDetails: 'Playing a game',
      privateState: 'Gamesto',
      buttonLabel: 'Open Game',
      url,
    }
  }

  if (app === 'studysto' && second === 'watch' && fifth) {
    const [, , rawSource = '', rawTeacher = ''] = document.location.pathname
      .split('/')
      .filter(Boolean)
    const video = getVideo()
    const [teacher, subject] = (
      textOf(document.querySelector('main a[href*="/studysto/t/"]')) ?? ''
    ).split(' · ')
    const detail = textOf(document.querySelector('main h1 ~ p'))

    return {
      details: `Watching ${headingOr('a lecture')}`,
      state: [detail, teacher, subject].filter(Boolean).join(' • ') || 'Studysto',
      privateDetails: 'Watching a lecture',
      privateState: 'Studysto',
      buttonLabel: 'Open Lecture',
      url,
      video,
      media: true,
      teacher: { source: rawSource, id: rawTeacher },
    }
  }

  if (app === 'studysto' && second === 't' && third) {
    const subject = findSubject()
    const image = getArtwork(undefined) ?? findMainImage()

    if (image && segments[2]) {
      teacherPhotos.set(segments[2], image)
    }

    return {
      details: `Studying with ${headingOr(findTeacher(third))}`,
      state: subject ? `${subject} • Studysto` : 'Studysto',
      privateDetails: 'Studying',
      privateState: 'Studysto',
      buttonLabel: 'Open Teacher',
      url,
      image,
    }
  }

  const titleKinds: Record<string, string> = {
    anisto: 'Anime',
    movisto: 'Movie',
    novelsto: 'Novel',
    booksto: 'Book',
    mangasto: 'Manga',
  }
  const kind = app ? titleKinds[app] : undefined
  const isTitlePage
    = (second === 'title' && Boolean(fourth) && !fifth)
      || (app === 'mangasto' && second === 'series' && Boolean(fourth) && !fifth)

  if (kind && third && isTitlePage) {
    return {
      details: `Viewing ${getAnimeTitle() ?? prettify(fourth ?? '')}`,
      state: `${kind} • ${prettify(third)}`,
      privateDetails: `Viewing a ${kind.toLowerCase()}`,
      privateState: kind,
      buttonLabel: 'Open Series',
      url,
      image: getArtwork(undefined),
    }
  }

  return undefined
}

/** Builds the presence shown while using a tool or game, or studying with a teacher. */
export function buildSectionActivity(section: SectionState, privacy: boolean): PresenceData {
  const playback = section.media ? getPlayback(section.video) : undefined

  return {
    type: ActivityType.Playing,
    details: privacy ? section.privateDetails : section.details,
    state: privacy ? section.privateState : section.state,
    largeImageKey: privacy
      ? ActivityAssets.Logo
      : section.image ?? ActivityAssets.Logo,
    ...smallImageFor(playback, !privacy && Boolean(section.image)),
    startTimestamp: browsingTimestamp,
    buttons: privacy
      ? buildButtons()
      : buildButtons({ label: section.buttonLabel, url: section.url }),
    ...getPlaybackTimestamps(playback),
  }
}

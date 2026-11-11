import type { RoomState } from '../config/types.js'
import { ActivityType } from 'premid'
import { ActivityAssets, browsingTimestamp } from '../config/constants.js'
import { buildButtons, distinctParts, smallImageFor } from '../util/activity.js'
import { clean, latinDigits, textOf } from '../util/dom.js'
import { getArtwork, usableImage } from '../util/images.js'
import { getPlayback, getPlaybackTimestamps, getVideo } from '../util/playback.js'

/** Whether the current page is a watch-together room at `/r/<code>`. */
export function isRoomPage(): boolean {
  return /^\/r\/[a-z0-9]{8}\/?$/i.test(document.location.pathname)
}

/** Reads the room name, show, episode, member count and player from the join card or the live room. */
export function getRoomState(): RoomState | undefined {
  const url = document.location.href
  const card = document.querySelector('section[aria-labelledby="join-title"]')

  if (card) {
    const parts = (
      textOf(card.querySelector('#join-title')?.nextElementSibling ?? null) ?? ''
    ).split(' · ')
    const count = Array.from(card.querySelectorAll('span'))
      .map(span => latinDigits(span.textContent?.trim() ?? '').match(/^(\d+)\D+\d+(?::\d{2}){1,2}$/))
      .find(Boolean)

    return {
      joined: false,
      name: textOf(card.querySelector('#join-title')),
      title: clean(parts[0]),
      episode: parts.length > 2 ? clean(parts[1]) : undefined,
      members: count?.[1] ? Number(count[1]) : undefined,
      url,
      image: usableImage(
        card.querySelector('img')?.getAttribute('src'),
        url,
      ),
    }
  }

  const heading = document.querySelector('main h1')

  if (!heading) {
    return undefined
  }

  const segments = (textOf(heading.nextElementSibling) ?? '').split(' · ')
  const crowd = latinDigits(segments[segments.length - 2] ?? '').match(/\d+/)
  const link = document.querySelector<HTMLAnchorElement>('a[href*="/title/"]')
  const video = getVideo()
  const buttons = heading.parentElement?.parentElement?.querySelectorAll('button')

  return {
    joined: true,
    hosting: (buttons?.length ?? 0) >= 3,
    name: textOf(heading),
    title: clean(link?.firstChild?.textContent),
    episode: clean(
      textOf(document.querySelector('h2[dir="auto"]'))?.split(' · ')[0],
    ),
    members: crowd ? Number(crowd[0]) : undefined,
    titleHref: link?.getAttribute('href') ?? undefined,
    url,
    image: getArtwork(video),
    video,
  }
}

/** Builds the presence shown on a watch-together room, with the member count as the party and the room's playback. */
export function buildRoomActivity(room: RoomState, privacy: boolean): PresenceData {
  const playback = room.joined ? getPlayback(room.video) : undefined
  const party = room.members
    ? { partySize: room.members, maxPartySize: 50 }
    : undefined
  const state = privacy
    ? room.hosting ? 'Hosting • Roomsto' : 'Roomsto'
    : [
        distinctParts(room.title, [room.episode, room.name]),
        room.hosting ? 'Hosting' : undefined,
        'Roomsto',
      ].filter(Boolean).join(' • ')

  return {
    type: ActivityType.Playing,
    details: privacy
      ? room.joined ? 'In a watch party' : 'Joining a watch party'
      : room.joined
        ? room.title ?? room.name ?? 'Watch party'
        : `Joining ${room.title ?? room.name ?? 'a watch party'}`,
    state,
    largeImageKey: privacy
      ? ActivityAssets.Logo
      : room.image ?? ActivityAssets.Logo,
    ...smallImageFor(playback, !privacy && Boolean(room.image)),
    ...(party && { party }),
    startTimestamp: browsingTimestamp,
    buttons: privacy
      ? buildButtons()
      : buildButtons({ label: 'Join Room', url: room.url }),
    ...getPlaybackTimestamps(playback),
  }
}

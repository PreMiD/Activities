import type { RouteContext } from '../index.js'
import { ActivityType, Assets, getTimestamps } from 'premid'
import { ActivityAssets } from '../../constants.js'
import { setMode } from '../../state/presence-state.js'

export default function watch(context: RouteContext) {
  setMode('watch')

  const parts = [context.watchingStateLabel, context.language].filter(Boolean)

  const name = !context.privacy && context.displayType === 1 ? context.animeTitle : undefined
  const presenceData: PresenceData = {
    name,
    type: ActivityType.Watching,
    largeImageKey: context.privacy ? ActivityAssets.Logo : context.poster || ActivityAssets.Logo,
    largeImageText: context.privacy ? 'Re:Anime' : context.seasonEpisodeText || 'Re:Anime',
    details: context.privacy ? 'Watching Anime' : context.animeTitle,
    smallImageKey: context.paused ? Assets.Pause : Assets.Play,
    smallImageText: context.paused ? 'Paused' : 'Watching',
  }
  if (!context.privacy)
    presenceData.state = parts.join(' | ')

  if (!context.paused && context.currentTime! > 0 && context.duration! > 0) {
    [presenceData.startTimestamp, presenceData.endTimestamp]
      = getTimestamps(context.currentTime!, context.duration!)
  }

  if (context.showButtons && !context.privacy) {
    presenceData.buttons = [
      {
        label: 'Watch Episode',
        url: context.href,
      },
      context.detailUrl
        ? {
            label: 'View Anime',
            url: context.detailUrl,
          }
        : undefined,
    ].filter(Boolean) as [ButtonData, ButtonData?]
  }

  context.presence.setActivity(presenceData)
}

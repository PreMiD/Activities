import type { RouteContext } from '../index.js'
import { Assets } from 'premid'
import { ActivityAssets } from '../../constants.js'
import { setMode } from '../../state/presence-state.js'

export default function anime(context: RouteContext) {
  setMode('detail')
  const name = !context.privacy && context.displayType === 1 ? context.animeTitle : undefined
  const presenceData: PresenceData = {
    name,
    largeImageKey: context.privacy
      ? ActivityAssets.Logo
      : context.poster || ActivityAssets.Logo,
  }
  presenceData.details = context.privacy ? 'Browsing anime' : context.animeTitle
  if (!context.privacy)
    presenceData.state = 'Viewing anime details'
  presenceData.startTimestamp = context.browsingTimestamp
  presenceData.smallImageKey = Assets.Reading
  presenceData.smallImageText = 'Reading details'

  if (context.showButtons && !context.privacy) {
    presenceData.buttons = [
      {
        label: 'View Anime',
        url: context.href,
      },
    ]
  }

  context.presence.setActivity(presenceData)
}

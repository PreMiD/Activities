import type { RouteContext } from '../index.js'
import { Assets } from 'premid'
import { ActivityAssets } from '../../constants.js'
import { setMode } from '../../state/presence-state.js'

export default function search(context: RouteContext) {
  setMode('browse')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  presenceData.details = 'Searching anime'
  if (!context.privacy)
    presenceData.state = context.searchQuery || 'Looking for something to watch'
  presenceData.startTimestamp = context.browsingTimestamp
  presenceData.smallImageKey = Assets.Search
  presenceData.smallImageText = 'Searching'

  context.presence.setActivity(presenceData)
}

import type { RouteContext } from '../index.js'
import { Assets } from 'premid'
import { ActivityAssets } from '../../constants.js'
import { setMode } from '../../state/presence-state.js'

export default function schedule(context: RouteContext) {
  setMode('browse')
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
  }
  presenceData.details = 'Viewing schedule'
  presenceData.state = 'Upcoming releases'
  presenceData.startTimestamp = context.browsingTimestamp
  presenceData.smallImageKey = Assets.Viewing
  presenceData.smallImageText = 'Browsing'

  context.presence.setActivity(presenceData)
}

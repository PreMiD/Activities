import type { RoutePresenceHandler } from './types.js'
import { s } from '../core/strings.js'
import { createPagePresence } from '../core/utils.js'
import { handleCatalogRoutes } from './handlers/catalog.js'
import { handleMiscRoutes } from './handlers/misc.js'
import { handleWatchRoutes } from './handlers/watch.js'
import { createRoutePresenceContext, finalizeRoutePresence } from './helpers.js'

const routePresenceHandlers: RoutePresenceHandler[] = [
  handleCatalogRoutes,
  handleWatchRoutes,
  handleMiscRoutes,
]

export async function buildRoutePresence(
  showTimestamp: boolean,
  showButtons: boolean,
) {
  const context = createRoutePresenceContext(showTimestamp, showButtons)

  for (const handler of routePresenceHandlers) {
    const presenceData = await handler(context)
    if (presenceData) {
      return presenceData
    }
  }

  return finalizeRoutePresence(
    context,
    createPagePresence(
      s().browseMovix,
      context.pageTitle || '',
      context.pageImage,
    ),
  )
}

import { createPagePresence } from '../core/utils.js'
import { createRoutePresenceContext, finalizeRoutePresence } from './helpers.js'
import { handleCatalogRoutes } from './handlers/catalog.js'
import { handleMiscRoutes } from './handlers/misc.js'
import { handleWatchRoutes } from './handlers/watch.js'
import type { RoutePresenceHandler } from './types.js'

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
      'Explore Movix sans carte ni boussole',
      context.pageTitle || 'Exploration en cours',
      context.pageImage,
    ),
  )
}


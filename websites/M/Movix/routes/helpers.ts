import type { RoutePresenceContext } from './types.js'
import { finalizePresence, getPageImage, getPageTitle } from '../core/utils.js'
export function createRoutePresenceContext(
  showTimestamp: boolean,
  showButtons: boolean,
): RoutePresenceContext {
  const { pathname } = document.location

  return {
    pathname,
    pageTitle: getPageTitle(),
    pageImage: getPageImage('logo'),
    contentImage: getPageImage('content'),
    showTimestamp,
    showButtons,
  }
}

export function finalizeRoutePresence(
  context: RoutePresenceContext,
  presenceData: PresenceData | null,
  options: {
    allowPageTimestamp?: boolean
  } = {},
) {
  return finalizePresence(presenceData, {
    showTimestamp: context.showTimestamp,
    showButtons: context.showButtons,
    pathname: context.pathname,
    allowPageTimestamp: options.allowPageTimestamp,
  })
}

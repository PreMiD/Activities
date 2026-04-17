export interface RoutePresenceContext {
  pathname: string
  pageTitle: string
  pageImage: string
  contentImage: string
  showTimestamp: boolean
  showButtons: boolean
}

export type RoutePresenceHandler = (
  context: RoutePresenceContext,
) => Promise<PresenceData | null> | PresenceData | null

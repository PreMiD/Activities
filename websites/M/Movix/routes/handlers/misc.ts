import type { RoutePresenceContext } from '../types.js'
import {
  ROUTE_FTV_INFO_PATTERN,
  ROUTE_LIST_PATTERN,
  ROUTE_VIP_GIFT_PATTERN,
  ROUTE_VIP_INVOICE_PATTERN,
  ROUTE_WRAPPED_PATTERN,
} from '../../core/constants.js'
import { format, s } from '../../core/strings.js'
import {
  createPagePresence,
  createSpecificPagePresence,
  firstNonEmpty,
  getMatchPart,
  getText,
  shortenId,
} from '../../core/utils.js'
import { getCinegraphContext } from '../../features/media.js'
import { finalizeRoutePresence } from '../helpers.js'

export async function handleMiscRoutes(
  context: RoutePresenceContext,
): Promise<PresenceData | null> {
  const { pathname, pageTitle, pageImage, contentImage } = context

  if (pathname === '/suggestion') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().viewSuggestions,
        pageTitle || s().suggestions,
        pageImage,
      ),
    )
  }

  if (pathname === '/extension') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().viewExtension,
        pageTitle || s().extension,
        pageImage,
      ),
    )
  }

  const listMatch = pathname.match(ROUTE_LIST_PATTERN)
  if (listMatch) {
    const listId = getMatchPart(listMatch, 1)
    const listTitle = pageTitle || format(s().listId, shortenId(listId))

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(listTitle, s().viewList, pageImage),
    )
  }

  if (pathname === '/list-catalog') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().browseLists,
        pageTitle || s().listCatalog,
        pageImage,
      ),
    )
  }

  if (pathname === '/dmca') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().viewLegal, s().dmca, pageImage),
    )
  }

  if (pathname === '/admin') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().useAdmin, s().administration, pageImage),
    )
  }

  if (pathname === '/profile-selection') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().selectProfile, '', pageImage),
    )
  }

  if (pathname === '/profile-management') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().manageProfiles, '', pageImage),
    )
  }

  if (pathname === '/wishboard') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().browseWishboard,
        pageTitle || s().communityRequests,
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard/new') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().writeRequest,
        String(firstNonEmpty(getText('h1'), s().newRequest)),
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard/my-requests') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().viewRequests,
        String(firstNonEmpty(getText('h1'), s().myRequests)),
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard/submit-link') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().submitLink,
        String(
          firstNonEmpty(getText('h2'), getText('h1'), s().linkSubmission),
        ),
        pageImage,
      ),
    )
  }

  if (pathname === '/vip') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().viewVip, '', pageImage),
    )
  }

  if (pathname === '/vip/don') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().makeDonation, '', pageImage),
    )
  }

  const vipInvoiceMatch = pathname.match(ROUTE_VIP_INVOICE_PATTERN)
  if (vipInvoiceMatch) {
    const invoiceId = getMatchPart(vipInvoiceMatch, 1)

    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().viewInvoice,
        format(s().invoiceId, shortenId(invoiceId)),
        pageImage,
      ),
    )
  }

  const vipGiftMatch = pathname.match(ROUTE_VIP_GIFT_PATTERN)
  if (vipGiftMatch) {
    const giftId = getMatchPart(vipGiftMatch, 1)

    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().viewGift,
        format(s().giftId, shortenId(giftId)),
        pageImage,
      ),
    )
  }

  if (pathname === '/about') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().viewAbout, '', pageImage),
    )
  }

  if (pathname === '/privacy') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().readPrivacy, '', pageImage),
    )
  }

  if (pathname === '/terms-of-service' || pathname === '/terms') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().readTerms, '', pageImage),
    )
  }

  if (pathname === '/cinegraph') {
    const graphContext = await getCinegraphContext(pageTitle, pageImage)

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        graphContext.title,
        graphContext.state,
        graphContext.image,
      ),
    )
  }

  if (pathname === '/settings') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().configureSettings, '', pageImage),
    )
  }

  if (pathname === '/top10') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().viewTop10, pageTitle || s().top10, pageImage),
    )
  }

  if (pathname === '/ftv') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        s().browseFtv,
        String(firstNonEmpty(getText('h2'), pageTitle, s().ftv)),
        pageImage,
      ),
    )
  }

  const ftvInfoMatch = pathname.match(ROUTE_FTV_INFO_PATTERN)
  if (ftvInfoMatch) {
    const programId = getMatchPart(ftvInfoMatch, 1)
    const programTitle = String(
      firstNonEmpty(
        getText('h1'),
        pageTitle,
        format(s().programId, shortenId(programId)),
      ),
    )

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        programTitle,
        s().viewFtvProgram,
        contentImage,
      ),
    )
  }

  const wrappedMatch = pathname.match(ROUTE_WRAPPED_PATTERN)
  if (wrappedMatch) {
    const wrappedYear = getMatchPart(wrappedMatch, 1)
    const state = wrappedYear
      ? format(s().wrappedYear, wrappedYear)
      : String(firstNonEmpty(getText('h1'), s().wrapped))

    return finalizeRoutePresence(
      context,
      createPagePresence(s().viewWrapped, state, pageImage),
    )
  }

  if (pathname === '*' || pathname === '/404') {
    return finalizeRoutePresence(
      context,
      createPagePresence(s().notFound, s().error404, pageImage),
    )
  }

  return null
}

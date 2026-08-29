import type { RoutePresenceContext } from '../types.js'
import {
  ROUTE_FTV_INFO_PATTERN,
  ROUTE_LIST_PATTERN,
  ROUTE_VIP_GIFT_PATTERN,
  ROUTE_VIP_INVOICE_PATTERN,
  ROUTE_WRAPPED_PATTERN,
} from '../../core/constants.js'
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
        'Consulte les suggestions personnalisées',
        pageTitle || 'Suggestions',
        pageImage,
      ),
    )
  }

  if (pathname === '/extension') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Consulte la page de l\'extension',
        pageTitle || 'Extension Movix',
        pageImage,
      ),
    )
  }

  const listMatch = pathname.match(ROUTE_LIST_PATTERN)
  if (listMatch) {
    const listId = getMatchPart(listMatch, 1)
    const listTitle = pageTitle || `Liste ${shortenId(listId)}`

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        listTitle,
        'Consulte une liste publique',
        pageImage,
      ),
    )
  }

  if (pathname === '/list-catalog') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Parcourt les listes publiques',
        pageTitle || 'Catalogue des listes',
        pageImage,
      ),
    )
  }

  if (pathname === '/dmca') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Consulte les informations légales', 'DMCA', pageImage),
    )
  }

  if (pathname === '/admin') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Utilise la console d\'administration',
        'Administration',
        pageImage,
      ),
    )
  }

  if (pathname === '/profile-selection') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Sélectionne un profil', '', pageImage),
    )
  }

  if (pathname === '/profile-management') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Gère ses profils', '', pageImage),
    )
  }

  if (pathname === '/wishboard') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Parcourt le Wishboard',
        pageTitle || 'Demandes de la communauté',
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard/new') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Rédige une demande Wishboard',
        String(firstNonEmpty(getText('h1'), 'Nouvelle demande')),
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard/my-requests') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Consulte ses demandes Wishboard',
        String(firstNonEmpty(getText('h1'), 'Mes demandes')),
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard/submit-link') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Soumet un lien au Wishboard',
        String(
          firstNonEmpty(getText('h2'), getText('h1'), 'Soumission de lien'),
        ),
        pageImage,
      ),
    )
  }

  if (pathname === '/vip') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Consulte l\'espace VIP', '', pageImage),
    )
  }

  if (pathname === '/vip/don') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Effectue un don VIP', '', pageImage),
    )
  }

  const vipInvoiceMatch = pathname.match(ROUTE_VIP_INVOICE_PATTERN)
  if (vipInvoiceMatch) {
    const invoiceId = getMatchPart(vipInvoiceMatch, 1)

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Consulte une facture VIP',
        `Facture ${shortenId(invoiceId)}`,
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
        'Consulte un cadeau VIP',
        `Cadeau ${shortenId(giftId)}`,
        pageImage,
      ),
    )
  }

  if (pathname === '/about') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Consulte la page À propos', '', pageImage),
    )
  }

  if (pathname === '/privacy') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Lit la politique de confidentialité', '', pageImage),
    )
  }

  if (pathname === '/terms-of-service' || pathname === '/terms') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Lit les conditions d\'utilisation', '', pageImage),
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
      createPagePresence('Configure ses préférences', '', pageImage),
    )
  }

  if (pathname === '/top10') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Consulte le top 10',
        pageTitle || 'Top 10',
        pageImage,
      ),
    )
  }

  if (pathname === '/ftv') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Parcourt France.tv',
        String(firstNonEmpty(getText('h2'), pageTitle, 'France.tv')),
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
        `Programme ${shortenId(programId)}`,
      ),
    )

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        programTitle,
        'Consulte un programme France.tv',
        contentImage,
      ),
    )
  }

  const wrappedMatch = pathname.match(ROUTE_WRAPPED_PATTERN)
  if (wrappedMatch) {
    const wrappedYear = getMatchPart(wrappedMatch, 1)
    const state = wrappedYear
      ? `Wrapped ${wrappedYear}`
      : String(firstNonEmpty(getText('h1'), 'Wrapped'))

    return finalizeRoutePresence(
      context,
      createPagePresence('Consulte son récapitulatif annuel', state, pageImage),
    )
  }

  if (pathname === '*' || pathname === '/404') {
    return finalizeRoutePresence(
      context,
      createPagePresence('Page introuvable', 'Erreur 404', pageImage),
    )
  }

  return null
}

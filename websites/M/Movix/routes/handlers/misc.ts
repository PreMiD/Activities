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
import type { RoutePresenceContext } from '../types.js'
import { finalizeRoutePresence } from '../helpers.js'

export async function handleMiscRoutes(
  context: RoutePresenceContext,
): Promise<PresenceData | null> {
  const { pathname, pageTitle, pageImage, contentImage } = context

  if (pathname === '/suggestion') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Demande au site de choisir à sa place, aveu touchant',
        pageTitle || 'Suggestions personnalisées',
        pageImage,
      ),
    )
  }

  if (pathname === '/extension') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Équipe son navigateur pour boxer les hosters relous',
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
        [
          'Liste publique inspectée avec gravité 📋',
          'Sélection passée au peigne fin 🍽️',
          'Compilation ciné dégustée comme un menu secret 🗃️',
        ],
        pageImage,
      ),
    )
  }

  if (pathname === '/list-catalog') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Parcourt les listes publiques comme un brocanteur du streaming',
        pageTitle || 'Catalogue des listes publiques',
        pageImage,
      ),
    )
  }

  if (pathname === '/dmca') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Lit la DMCA, oui ça arrive vraiment',
        'Section juridique',
        pageImage,
      ),
    )
  }

  if (pathname === '/admin') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Traîne dans l\'admin avec beaucoup trop de boutons',
        'Console admin',
        pageImage,
      ),
    )
  }

  if (pathname === '/profile-selection') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Choisit un profil comme si Netflix observait',
        'Sélection de profil',
        pageImage,
      ),
    )
  }

  if (pathname === '/profile-management') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Bidouille les profils avec une autorité discutable',
        'Gestion des profils',
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Vote sur le Wishboard comme un ministre du catalogue',
        pageTitle || 'Wishboard',
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard/new') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Dépose une requête avec l\'espoir d\'être exaucé',
        String(firstNonEmpty(getText('h1'), 'Nouvelle demande Wishboard')),
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard/my-requests') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Surveille ses requêtes comme des actions en bourse',
        String(firstNonEmpty(getText('h1'), 'Mes demandes Wishboard')),
        pageImage,
      ),
    )
  }

  if (pathname === '/wishboard/submit-link') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Soumet un lien pour sauver le catalogue à mains nues',
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
      createPagePresence(
        'Examine le VIP avec un regard de mécène stratégique',
        'Espace VIP',
        pageImage,
      ),
    )
  }

  if (pathname === '/vip/don') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Sort la carte bleue avec un panache douteux',
        'Don VIP',
        pageImage,
      ),
    )
  }

  const vipInvoiceMatch = pathname.match(ROUTE_VIP_INVOICE_PATTERN)
  if (vipInvoiceMatch) {
    const invoiceId = getMatchPart(vipInvoiceMatch, 1)

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Contemple une facture VIP, romance moderne',
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
        'Déballe un cadeau VIP sans papier brillant',
        `Cadeau ${shortenId(giftId)}`,
        pageImage,
      ),
    )
  }

  if (pathname === '/about') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Raconte l\'histoire de Movix comme une légende locale',
        pageTitle || 'À propos de Movix',
        pageImage,
      ),
    )
  }

  if (pathname === '/privacy') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Lit la politique de confidentialité avec un courage rare',
        'Politique de confidentialité',
        pageImage,
      ),
    )
  }

  if (pathname === '/terms-of-service' || pathname === '/terms') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Traverse les CGU armé d\'un café très serré',
        'Conditions d\'utilisation',
        pageImage,
      ),
    )
  }

  if (pathname === '/cinegraph') {
    const graphContext = await getCinegraphContext(pageTitle, pageImage)

    return finalizeRoutePresence(
      context,
      createSpecificPagePresence(
        graphContext.title,
        graphContext.variants,
        graphContext.image,
      ),
    )
  }

  if (pathname === '/settings') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Tripatouille les réglages jusqu\'à friser la perfection',
        'Réglages Movix',
        pageImage,
      ),
    )
  }

  if (pathname === '/top10') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Scrute le top 10 comme un analyste de canapé',
        pageTitle || 'Top 10 Movix',
        pageImage,
      ),
    )
  }

  if (pathname === '/ftv') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Fouille France.tv sans télécommande et sans honte',
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
        [
          'Fiche France.tv sous inspection 🇫🇷',
          'Programme France.tv étudié avec un sérieux républicain 📺',
          'France.tv passé au microscope télévisuel 🎬',
        ],
        contentImage,
      ),
    )
  }

  const wrappedMatch = pathname.match(ROUTE_WRAPPED_PATTERN)
  if (wrappedMatch) {
    const wrappedYear = getMatchPart(wrappedMatch, 1)
    const state = wrappedYear
      ? `Wrapped ${wrappedYear}`
      : String(firstNonEmpty(getText('h1'), 'Wrapped Movix'))

    return finalizeRoutePresence(
      context,
      createPagePresence(
        'Relit son année ciné comme un bilan existentiel',
        state,
        pageImage,
      ),
    )
  }

  if (pathname === '*' || pathname === '/404') {
    return finalizeRoutePresence(
      context,
      createPagePresence(
        'S\'est perdu dans Movix, ce qui était statistiquement évitable',
        '404 - page introuvable',
        pageImage,
      ),
    )
  }

  return null
}

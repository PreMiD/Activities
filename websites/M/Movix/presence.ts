type ActivityTypeValue = 0 | 2 | 3 | 5;

interface PresenceButton {
  label: string;
  url: string;
}

type VariantText = string | readonly string[];

interface PresenceDataLike {
  name?: string;
  type?: ActivityTypeValue;
  details?: string;
  state?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  largeImageKey?: string;
  largeImageText?: string;
  buttons?: PresenceButton[];
}

interface PresenceInstance {
  on(event: "UpdateData", callback: () => void | Promise<void>): void;
  setActivity(data: PresenceDataLike): void;
  clearActivity(): void;
  getSetting<T extends string | boolean | number>(
    settingId: string,
  ): Promise<T>;
}

declare const Presence: new (options: { clientId: string }) => PresenceInstance;

const presence = new Presence({
  clientId: "1259926474174238741",
});

const ActivityType = {
  Playing: 0,
  Listening: 2,
  Watching: 3,
  Competing: 5,
} as const;

const SITE_NAME = "Movix";
const FALLBACK_SITE_URL = "https://movix.rodeo";
const FALLBACK_LOGO = `${FALLBACK_SITE_URL}/movix.png`;

const PROVIDER_NAMES: Record<string, string> = {
  "8": "Netflix",
  "119": "Prime Video",
  "337": "Disney+",
  "338": "Marvel Studios",
  "350": "Apple TV+",
  "355": "Warner Bros",
  "356": "DC Comics",
  "384": "HBO MAX",
  "531": "Paramount+",
};

const SAFE_BUTTON_PATTERNS = [
  /^\/collection\/[^/]+$/i,
  /^\/movie\/[^/]+$/i,
  /^\/tv\/[^/]+$/i,
  /^\/download\/[^/]+\/[^/]+$/i,
  /^\/genre\/[^/]+\/[^/]+$/i,
  /^\/provider\/[^/]+\/[^/]+(?:\/[^/]+)?$/i,
  /^\/person\/[^/]+$/i,
  /^\/watchparty\/room\/[^/]+$/i,
  /^\/list\/[^/]+$/i,
  /^\/vip\/invoice\/[^/]+$/i,
  /^\/vip\/cadeau\/[^/]+$/i,
  /^\/ftv\/info\/[^/]+$/i,
  /^\/wrapped(?:\/[^/]+)?$/i,
];

const PAGE_DETAIL_VARIANTS: Array<{
  pattern: RegExp;
  variants: readonly string[];
}> = [
  {
    pattern: /^\/$/,
    variants: [
      "Patrouille sur l'accueil comme un critique payé en popcorn 🍿",
      "Scrolle l'accueil avec l'assurance d'un jury imaginaire 🎬",
      "Fouille l'accueil comme un détective du canapé 🛋️",
    ],
  },
  {
    pattern: /^\/search$/i,
    variants: [
      "Traque une pépite avec un calme purement décoratif 🔎",
      "Interroge la recherche comme un enquêteur du streaming 🕵️",
      "Lance des mots-clés avec l'énergie d'un génie fatigué 🔍",
    ],
  },
  {
    pattern: /^\/movies$/i,
    variants: [
      "Passe le catalogue films au rayon X sans diplôme officiel 🎬",
      "Inspecte les films comme un sommelier du popcorn 🍿",
      "Fouille les films avec un sérieux beaucoup trop cinématographique 🎞️",
    ],
  },
  {
    pattern: /^\/tv-shows$/i,
    variants: [
      "Collectionne les séries comme si dormir était facultatif 📺",
      "Parcourt les séries avec des ambitions de binge incontrôlables 🍿",
      "Évalue les séries comme un comité secret du canapé 📡",
    ],
  },
  {
    pattern: /^\/collections$/i,
    variants: [
      "Fouille les collections comme un archiviste sous café ☕",
      "Visite les collections avec le respect d'un conservateur dramatique 🗂️",
      "Classe des sagas dans sa tête comme si c'était son métier 📚",
    ],
  },
  {
    pattern: /^\/collection\/[^/]+$/i,
    variants: [
      "Inspecte une collection avec un sérieux presque gouvernemental 🗂️",
      "Retourne une collection comme un brocanteur du streaming 📦",
      "Examine une saga avec une passion très peu discrète 🎞️",
    ],
  },
  {
    pattern: /^\/movie\/[^/]+$/i,
    variants: [
      "Épluche une fiche film comme un jury de festival en retard 🎬",
      "Analyse un film avant le clic fatal avec beaucoup trop d'émotion 🍿",
      "Observe une fiche film comme si le réalisateur regardait 👀",
    ],
  },
  {
    pattern: /^\/tv\/[^/]+$/i,
    variants: [
      "Dissèque une fiche série comme si le binge était un sport olympique 📺",
      "Examine une série avec l'énergie d'un fan qui ne dort pas 😵",
      "Observe une fiche série comme un comité de cliffhangers 🍿",
    ],
  },
  {
    pattern: /^\/download\/(movie|tv)\/[^/]+$/i,
    variants: [
      "Prépare un plan B avec l'élégance d'un pirate en costume ⬇️",
      "Monte un plan secours comme si Internet était en grève 📦",
      "Sécurise une sortie de secours ciné avec un calme douteux 🧳",
    ],
  },
  {
    pattern: /^\/debrid$/i,
    variants: [
      "Dompte des liens capricieux avec la grâce d'un sorcier réseau 🪄",
      "Répare des liens comme un mécano du streaming 🧰",
      "Négocie avec des hosters récalcitrants à mains nues 🔧",
    ],
  },
  {
    pattern: /^\/genre\/[^/]+\/[^/]+$/i,
    variants: [
      "Trie le chaos par genre avec une autorité totalement inventée 🗂️",
      "Range les goûts du monde dans de petites cases très pratiques 🎭",
      "Organise le catalogue comme un bibliothécaire du binge 📚",
    ],
  },
  {
    pattern: /^\/roulette$/i,
    variants: [
      "Laisse le destin choisir à sa place, aveu courageux 🎲",
      "Confie sa soirée à une roulette manifestement instable 🎰",
      "Demande au hasard de prendre les commandes avec panache 🎯",
    ],
  },
  {
    pattern: /^\/provider\/[^/]+\/[^/]+(?:\/[^/]+)?$/i,
    variants: [
      "Retourne un catalogue provider comme un inspecteur trop motivé 📦",
      "Épluche un provider avec l'enthousiasme d'un auditeur secret 🕵️",
      "Passe un provider au scanner ciné sans autorisation officielle 📺",
    ],
  },
  {
    pattern: /^\/provider\/[^/]+$/i,
    variants: [
      "Espionne un provider avec une curiosité très assumée 👀",
      "Observe un provider comme si un abonnement était en jeu 💳",
      "Fait l'inventaire d'un provider avec une dignité variable 📋",
    ],
  },
  {
    pattern: /^\/auth(?:\/google)?$/i,
    variants: [
      "Négocie avec la connexion comme un diplomate en sueur 🔐",
      "Affronte l'authentification avec un courage administratif 🪪",
      "Tente de se connecter sans vexer les serveurs 🤝",
    ],
  },
  {
    pattern: /^\/(?:create-account|link-bip39\/create)$/i,
    variants: [
      "Forge un compte comme un druide numérique très appliqué ✨",
      "Crée un compte avec le sérieux d'un mage du mot de passe 🔮",
      "Ouvre un nouveau chapitre administratif en grand style 📝",
    ],
  },
  {
    pattern: /^\/(?:login-bip39|link-bip39)$/i,
    variants: [
      "Récite sa formule secrète sans éternuer 🔑",
      "Murmure une phrase magique avec un calme discutable 🧠",
      "Déverrouille son accès comme un sorcier sous pression ✨",
    ],
  },
  {
    pattern: /^\/person\/[^/]+$/i,
    variants: [
      "Épluche une filmo comme un détective du générique 🕵️",
      "Remonte une carrière plan par plan avec passion 🎭",
      "Inspecte une star comme si Cannes avait appelé 📸",
    ],
  },
  {
    pattern: /^\/profile$/i,
    variants: [
      "Range son profil puis le rerange pour le principe 👤",
      "Contemple son profil comme un PDG du canapé 🪞",
      "Ajuste son profil avec une minutie ridiculement noble ✍️",
    ],
  },
  {
    pattern: /^\/alerts$/i,
    variants: [
      "Surveille ses alertes comme une tour de contrôle du binge 🔔",
      "Attend ses alertes avec le sang-froid d'une casserole 🌡️",
      "Écoute les signaux du catalogue comme un radar humain 📡",
    ],
  },
  {
    pattern: /^\/live-tv$/i,
    variants: [
      "Zappe plus vite que la télécommande ne peut protester 📡",
      "Navigue en direct avec les réflexes d'un ninja du canapé 📺",
      "Fait du slalom entre les chaînes sans prévenir personne 🎛️",
    ],
  },
  {
    pattern: /^\/watchparty\/create$/i,
    variants: [
      "Prépare une WatchParty comme un wedding planner du popcorn 🍿",
      "Monte une WatchParty avec la sérénité d'un chef de gare 👥",
      "Assemble une soirée visionnage comme un maître de cérémonie chaotique 🎉",
    ],
  },
  {
    pattern: /^\/watchparty\/room\/[^/]+$/i,
    variants: [
      "Coordonne une WatchParty pendant que le chat part en freestyle 💬",
      "Gère une WatchParty avec l'autorité d'un roi du canapé 👑",
      "Tient une salle WatchParty comme un DJ des cliffhangers 🎚️",
    ],
  },
  {
    pattern: /^\/watchparty\/join(?:\/[^/]+)?$/i,
    variants: [
      "Essaie d'entrer dans une WatchParty sans rater le code 🚪",
      "Tente une infiltration sociale très popcorn 🍿",
      "Rejoint une WatchParty avec la discrétion d'une fanfare 🥁",
    ],
  },
  {
    pattern: /^\/watchparty\/list$/i,
    variants: [
      "Fouille les salons WatchParty comme un videur curieux 👀",
      "Parcourt les salons comme un agent immobilier du binge 🏠",
      "Cherche une WatchParty où poser son popcorn 🍿",
    ],
  },
  {
    pattern: /^\/suggestion$/i,
    variants: [
      "Demande au site de penser à sa place, aveu très honnête 🧠",
      "Réclame une idée brillante avec le panache d'un indécis 🎯",
      "Confie sa soirée à l'algorithme avec un courage rare 🤖",
    ],
  },
  {
    pattern: /^\/extension$/i,
    variants: [
      "Arme son navigateur comme un chevalier anti-hoster 🧩",
      "Équipe le navigateur pour boxer les pubs et les caprices 🥊",
      "Installe des renforts techniques avec une joie suspecte 🛠️",
    ],
  },
  {
    pattern: /^\/list\/[^/]+$/i,
    variants: [
      "Explore une liste partagée avec un jugement délicatement silencieux 📋",
      "Déguste une liste publique comme un critique bénévole 🍽️",
      "Parcourt une sélection avec la ferveur d'un collectionneur 🗃️",
    ],
  },
  {
    pattern: /^\/list-catalog$/i,
    variants: [
      "Parcourt les listes publiques comme un brocanteur du streaming 📚",
      "Inspecte des listes comme un curateur de canapé 🛋️",
      "Feuillette le catalogue des listes avec des ambitions très nobles 📖",
    ],
  },
  {
    pattern: /^\/dmca$/i,
    variants: [
      "Lit la DMCA, oui ça arrive vraiment ⚖️",
      "Affronte la paperasse juridique comme un héros discret 📜",
      "Traverse la zone légale avec un courage franchement admirable 🧾",
    ],
  },
  {
    pattern: /^\/admin$/i,
    variants: [
      "Traîne dans l'admin avec beaucoup trop de boutons 🛠️",
      "Pilote l'admin comme un capitaine légèrement dangereux 🚨",
      "Regarde l'admin droit dans les permissions 👮",
    ],
  },
  {
    pattern: /^\/profile-selection$/i,
    variants: [
      "Choisit un profil comme si toute la famille observait 👥",
      "Sélectionne un profil avec le sérieux d'un casting 🎭",
      "Hésite entre les profils comme devant un buffet 👀",
    ],
  },
  {
    pattern: /^\/profile-management$/i,
    variants: [
      "Bidouille les profils avec une autorité discutable 🧰",
      "Réorganise les profils comme un DRH du canapé 📁",
      "Jongle avec les profils en mode administrateur de salon 🛋️",
    ],
  },
  {
    pattern: /^\/wishboard$/i,
    variants: [
      "Vote sur le Wishboard comme un ministre du catalogue 🗳️",
      "Fait campagne pour ses envies avec aplomb 📣",
      "Milite pour de nouveaux contenus avec une ferveur électorale 🎤",
    ],
  },
  {
    pattern: /^\/wishboard\/new$/i,
    variants: [
      "Dépose une requête avec l'espoir d'être exaucé 🙏",
      "Rédige une demande comme un citoyen du binge modèle ✍️",
      "Soumet un souhait avec la gravité d'un traité international 📬",
    ],
  },
  {
    pattern: /^\/wishboard\/my-requests$/i,
    variants: [
      "Surveille ses requêtes comme des actions en bourse 📈",
      "Observe ses demandes avec un stress très rentable 👀",
      "Suit ses requêtes comme un trader du catalogue 💹",
    ],
  },
  {
    pattern: /^\/wishboard\/submit-link$/i,
    variants: [
      "Soumet un lien pour sauver le catalogue à mains nues 🔗",
      "Apporte du renfort au catalogue avec panache 🧷",
      "Lance un lien de secours comme un héros logistique 📡",
    ],
  },
  {
    pattern: /^\/vip$/i,
    variants: [
      "Examine le VIP avec un regard de mécène stratégique 💎",
      "Observe l'espace VIP comme un investisseur du popcorn 💸",
      "Évalue le club VIP avec un sérieux de milliardaire du canapé 🪙",
    ],
  },
  {
    pattern: /^\/vip\/don$/i,
    variants: [
      "Sort la carte bleue avec un panache douteux 💳",
      "S'avance vers le don VIP comme un noble du streaming 👑",
      "Finance le chaos audiovisuel avec élégance 💸",
    ],
  },
  {
    pattern: /^\/vip\/invoice\/[^/]+$/i,
    variants: [
      "Contemple une facture VIP, romance moderne 🧾",
      "Observe une facture comme si c'était un poème fiscal 💼",
      "Vérifie une facture VIP avec le calme d'un comptable du luxe 💎",
    ],
  },
  {
    pattern: /^\/vip\/cadeau\/[^/]+$/i,
    variants: [
      "Déballe un cadeau VIP sans papier brillant 🎁",
      "Examine un cadeau VIP avec les yeux d'un enfant premium ✨",
      "Ouvre une surprise VIP avec une noblesse discutable 🎀",
    ],
  },
  {
    pattern: /^\/about$/i,
    variants: [
      "Raconte l'histoire de Movix comme une légende locale 📖",
      "Explore les origines de Movix comme un archéologue du streaming 🏺",
      "Lit le lore de Movix avec des étoiles dans les yeux ✨",
    ],
  },
  {
    pattern: /^\/privacy$/i,
    variants: [
      "Lit la politique de confidentialité avec un courage rare 🕶️",
      "Affronte la confidentialité ligne par ligne sans trembler 🔐",
      "Traverse les règles de vie privée comme un juriste du dimanche 📜",
    ],
  },
  {
    pattern: /^\/(?:terms-of-service|terms)$/i,
    variants: [
      "Traverse les CGU armé d'un café très serré ☕",
      "Lit les conditions avec le courage d'un gladiateur du clic ⚖️",
      "Affronte la prose légale sans quitter le canapé 📜",
    ],
  },
  {
    pattern: /^\/cinegraph$/i,
    variants: [
      "Cartographie ses obsessions ciné comme un savant fou 🧠",
      "Trace des connexions ciné avec une énergie très conspirationniste 🕸️",
      "Dessine son cerveau cinéma en mode laboratoire secret 🧪",
    ],
  },
  {
    pattern: /^\/settings$/i,
    variants: [
      "Tripatouille les réglages jusqu'à friser la perfection ⚙️",
      "Ajuste les paramètres comme un horloger du binge 🛠️",
      "Cherche le réglage parfait avec une obstination admirable 🎛️",
    ],
  },
  {
    pattern: /^\/top10$/i,
    variants: [
      "Scrute le top 10 comme un analyste de canapé 🏆",
      "Observe le classement avec l'autorité d'un jury auto-proclamé 🎖️",
      "Compare les tendances comme un stratège du popcorn 📈",
    ],
  },
  {
    pattern: /^\/ftv$/i,
    variants: [
      "Fouille France.tv sans télécommande et sans honte 🇫🇷",
      "Navigue dans France.tv comme un explorateur du direct 📺",
      "Inspecte France.tv avec une curiosité très nationale 🗼",
    ],
  },
  {
    pattern: /^\/ftv\/info\/[^/]+$/i,
    variants: [
      "Inspecte une fiche France.tv avant le clic fatal 🇫🇷",
      "Analyse un programme France.tv comme un critique du service public 🎬",
      "Examine un programme France.tv avec un sérieux très républicain 📺",
    ],
  },
  {
    pattern: /^\/wrapped(?:\/[^/]+)?$/i,
    variants: [
      "Relit son année ciné comme un audit émotionnel 📊",
      "Observe son Wrapped comme un bilan existentiel premium 🪞",
      "Revit son année Movix avec des statistiques et des frissons 📈",
    ],
  },
  {
    pattern: /^(?:\*|\/404)$/i,
    variants: [
      "S'est perdu avec une assurance spectaculaire 🧭",
      "Erre dans le 404 comme un aventurier sans carte 🗺️",
      "A réussi l'exploit de se perdre sur Movix, bravo 🫡",
    ],
  },
];

const WATCH_WAITING_VARIANTS: Array<{
  pattern: RegExp;
  variants: readonly string[];
}> = [
  {
    pattern: /^\/watch\/movie\/[^/]+$/i,
    variants: [
      "cherche la bonne source sans paniquer 🍿",
      "choisit un lecteur comme un sommelier du streaming 🎬",
      "prépare le décollage du film avec gravité 🚀",
    ],
  },
  {
    pattern: /^\/watch\/tv\/[^/]+\/s\/[^/]+\/e\/[^/]+$/i,
    variants: [
      "sélectionne une source avec panique élégante 📺",
      "prépare le binge comme un ingénieur du canapé 🍿",
      "cherche le bon épisode avec une foi inébranlable 🔎",
    ],
  },
  {
    pattern: /^\/watch\/anime\/[^/]+\/season\/[^/]+\/episode\/[^/]+$/i,
    variants: [
      "cherche son épisode comme un héros secondaire 🌸",
      "prépare l'anime avec une hype difficile à cacher ✨",
      "sélectionne une source en mode arc d'introduction ⚔️",
    ],
  },
  {
    pattern: /^\/ftv\/watch\/[^/]+$/i,
    variants: [
      "cherche le bon flux avec dignité 🇫🇷",
      "accorde France.tv avec un sang-froid télévisuel 📡",
      "prépare le direct comme un régisseur du salon 🎛️",
    ],
  },
];

const WATCH_PLAYING_VARIANTS: Array<{
  pattern: RegExp;
  variants: readonly string[];
}> = [
  {
    pattern: /^\/watch\/movie\/[^/]+$/i,
    variants: [
      "lecture en cours, canapé en surchauffe 🍿",
      "film lancé, le popcorn travaille en heures sup' 🎬",
      "visionnage actif, dignité momentanément absente 🛋️",
    ],
  },
  {
    pattern: /^\/watch\/tv\/[^/]+\/s\/[^/]+\/e\/[^/]+$/i,
    variants: [
      "binge hors de contrôle 📺",
      "épisode en cours, plus personne ne dort 🍿",
      "visionnage de série avec implication totale 🧠",
    ],
  },
  {
    pattern: /^\/watch\/anime\/[^/]+\/season\/[^/]+\/episode\/[^/]+$/i,
    variants: [
      "anime en cours, théorie du fanclub activée 🌸",
      "épisode lancé, niveau de hype dangereusement élevé ⚡",
      "visionnage anime en mode ouverture dramatique 🎌",
    ],
  },
  {
    pattern: /^\/ftv\/watch\/[^/]+$/i,
    variants: [
      "programme en cours, télécommande au chômage 📺",
      "direct lancé, salon officiellement mobilisé 🇫🇷",
      "lecture France.tv active, canapé en mission 🛋️",
    ],
  },
];

const WATCH_PAUSED_VARIANTS: Array<{
  pattern: RegExp;
  variants: readonly string[];
}> = [
  {
    pattern: /^\/watch\/movie\/[^/]+$/i,
    variants: [
      "pause stratégique, le drame attend ⏸️",
      "film en pause, le popcorn reprend son souffle 🍿",
      "interruption tactique, suspense sous cloche 🎬",
    ],
  },
  {
    pattern: /^\/watch\/tv\/[^/]+\/s\/[^/]+\/e\/[^/]+$/i,
    variants: [
      "pause très dramatique ⏸️",
      "épisode en pause, cliffhanger sous surveillance 👀",
      "arrêt technique du binge, émotion intacte 📺",
    ],
  },
  {
    pattern: /^\/watch\/anime\/[^/]+\/season\/[^/]+\/episode\/[^/]+$/i,
    variants: [
      "pause technique, hype toujours intacte ⏸️",
      "anime en pause, énergie shonen conservée ⚡",
      "interruption temporaire, pouvoir de l'amitié stable 🌸",
    ],
  },
  {
    pattern: /^\/ftv\/watch\/[^/]+$/i,
    variants: [
      "pause stratégique du direct ⏸️",
      "programme en pause, personne ne touche à la télécommande 📡",
      "intermède technique à la française 🇫🇷",
    ],
  },
];

const WATCH_ENDED_VARIANTS: Array<{
  pattern: RegExp;
  variants: readonly string[];
}> = [
  {
    pattern: /^\/watch\/movie\/[^/]+$/i,
    variants: [
      "générique en vue, personne ne bouge 🎞️",
      "film terminé, silence solennel dans le salon 🛋️",
      "fin de séance, popcorn officiellement retraité 🍿",
    ],
  },
  {
    pattern: /^\/watch\/tv\/[^/]+\/s\/[^/]+\/e\/[^/]+$/i,
    variants: [
      "épisode terminé, prochain cliffhanger en approche 📺",
      "fin d'épisode, volonté personnelle en miettes 🍿",
      "générique lancé, binge toujours menaçant 🎞️",
    ],
  },
  {
    pattern: /^\/watch\/anime\/[^/]+\/season\/[^/]+\/episode\/[^/]+$/i,
    variants: [
      "épisode terminé, l'arc suivant appelle déjà 🌸",
      "fin d'épisode, niveau de hype toujours irresponsable ⚡",
      "générique lancé, fanclub intérieurement debout 🎌",
    ],
  },
  {
    pattern: /^\/ftv\/watch\/[^/]+$/i,
    variants: [
      "programme terminé, la télécommande réclame des congés 📺",
      "fin de diffusion, mission salon accomplie 🇫🇷",
      "générique France.tv détecté, calme retrouvé 🎞️",
    ],
  },
];

let lastRouteKey = "";
let lastRouteStartedAt = Date.now();

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: unknown, max = 128): string {
  const text = normalizeText(value);
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function stripSiteName(value: unknown): string {
  return normalizeText(value)
    .replace(/\s*(?:[-|:]\s*)?Movix$/i, "")
    .trim();
}

function firstNonEmpty<T>(...values: T[]): T | "" {
  for (const value of values) {
    if (normalizeText(value)) {
      return value;
    }
  }

  return "";
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function shortenId(value: string, size = 6): string {
  const text = normalizeText(value);
  return text ? text.slice(0, size).toUpperCase() : "";
}

function toAbsoluteUrl(value: string): string {
  const text = normalizeText(value);
  if (!text) return "";

  try {
    return new URL(text, document.location.origin).toString();
  } catch {
    return "";
  }
}

function isImageUrlAllowed(value: string): boolean {
  return (
    /^https:\/\//i.test(value) ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  );
}

function isButtonUrlAllowed(value: string): boolean {
  return /^https:\/\//i.test(value);
}

function getMetaContent(selector: string): string {
  const element = document.querySelector(selector) as HTMLMetaElement | null;
  return normalizeText(element?.content);
}

function getAttribute(selector: string, attribute: string): string {
  const elements = Array.from(document.querySelectorAll(selector));

  for (const element of elements) {
    const value = normalizeText(element.getAttribute(attribute));
    if (value) {
      return value;
    }
  }

  return "";
}

function getText(selector: string): string {
  const elements = Array.from(document.querySelectorAll(selector));

  for (const element of elements) {
    const text = normalizeText(
      (element as HTMLElement).innerText || element.textContent,
    );
    if (text) {
      return text;
    }
  }

  return "";
}

function findTitleAttribute(predicate: (title: string) => boolean): string {
  const elements = Array.from(document.querySelectorAll("[title]"));

  for (const element of elements) {
    const title = normalizeText(element.getAttribute("title"));
    if (title && predicate(title)) {
      return title;
    }
  }

  return "";
}

function getSearchParam(name: string): string {
  return normalizeText(new URLSearchParams(document.location.search).get(name));
}

function getMatchPart(match: RegExpMatchArray | null, index: number): string {
  return normalizeText(match?.[index]);
}

function getRouteStartedAt(): number {
  const key = `${document.location.pathname}${document.location.search}`;

  if (key !== lastRouteKey) {
    lastRouteKey = key;
    lastRouteStartedAt = Date.now();
  }

  return lastRouteStartedAt;
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function pickVariant(seed: string, variants: readonly string[]): string {
  const cleanVariants = variants
    .map((variant) => normalizeText(variant))
    .filter(Boolean);

  if (cleanVariants.length === 0) {
    return "";
  }

  return cleanVariants[hashString(seed) % cleanVariants.length] || "";
}

function findVariantsForPath(
  pathname: string,
  collection: Array<{ pattern: RegExp; variants: readonly string[] }>,
): readonly string[] | undefined {
  return collection.find((entry) => entry.pattern.test(pathname))?.variants;
}

function resolveVariantText(value: VariantText, seed: string): string {
  return Array.isArray(value) ? pickVariant(seed, value) : normalizeText(value);
}

function getPageTitle(): string {
  const title = firstNonEmpty(
    getMetaContent('meta[property="og:title"]'),
    getText("main h1"),
    getText("h1"),
    getText("main h2"),
    getText("h2"),
    document.title,
  );

  return stripSiteName(title);
}

function getPageImage(mode: "logo" | "content" = "logo"): string {
  const candidates =
    mode === "content"
      ? [
          getAttribute("video[poster]", "poster"),
          getMetaContent('meta[property="og:image"]'),
          getAttribute('img[alt="Poster"]', "src"),
          getAttribute('img[alt*="poster" i]', "src"),
          getAttribute('img[src*="tmdb.org"][src*="/w500"]', "src"),
          getAttribute('img[src*="tmdb.org"][src*="/original"]', "src"),
          FALLBACK_LOGO,
        ]
      : [getMetaContent('meta[property="og:image"]'), FALLBACK_LOGO];

  for (const candidate of candidates) {
    const absolute = toAbsoluteUrl(candidate);
    if (absolute && isImageUrlAllowed(absolute)) {
      return absolute;
    }
  }

  return FALLBACK_LOGO;
}

function getSafeButtons(
  pathname: string,
  enabled: boolean,
): Array<{ label: string; url: string }> | undefined {
  if (
    !enabled ||
    !SAFE_BUTTON_PATTERNS.some((pattern) => pattern.test(pathname))
  ) {
    return undefined;
  }

  const url = document.location.href;
  if (!isButtonUrlAllowed(url)) {
    return undefined;
  }

  return [
    {
      label: "Voir la page",
      url,
    },
  ];
}

function buildBasePresence(image?: string): PresenceDataLike {
  return {
    name: SITE_NAME,
    largeImageKey: image || getPageImage() || FALLBACK_LOGO,
  };
}

function finalizePresence(
  presenceData: PresenceDataLike | null,
  options: {
    showTimestamp: boolean;
    showButtons: boolean;
    pathname: string;
    allowPageTimestamp?: boolean;
  },
) {
  if (!presenceData) {
    return null;
  }

  presenceData.details = truncate(presenceData.details);
  presenceData.state = truncate(presenceData.state);

  if (!presenceData.details || !presenceData.state) {
    return null;
  }

  if (!presenceData.buttons) {
    const buttons = getSafeButtons(options.pathname, options.showButtons);
    if (buttons?.length) {
      presenceData.buttons = buttons;
    }
  }

  if (
    options.showTimestamp &&
    options.allowPageTimestamp !== false &&
    !presenceData.startTimestamp &&
    !presenceData.endTimestamp
  ) {
    presenceData.startTimestamp = getRouteStartedAt();
  }

  if (!presenceData.largeImageKey) {
    presenceData.largeImageKey = FALLBACK_LOGO;
  }

  return presenceData;
}

function createPagePresence(
  details: VariantText,
  state: VariantText,
  image?: string,
) {
  const presenceData = buildBasePresence(image);
  const seed = `${document.location.pathname}${document.location.search}`;
  const routeDetails = Array.isArray(details)
    ? details
    : findVariantsForPath(document.location.pathname, PAGE_DETAIL_VARIANTS) ||
      details;

  presenceData.details = resolveVariantText(routeDetails, `${seed}:details`);
  presenceData.state = resolveVariantText(state, `${seed}:state`);
  return presenceData;
}

function createWatchingPresence(options: {
  title: string;
  playingText: VariantText;
  pausedText: VariantText;
  waitingText: VariantText;
  endedText?: VariantText;
  season?: string;
  episode?: string;
  image?: string;
}) {
  const presenceData = buildBasePresence(options.image);
  const video = document.querySelector("video") as HTMLVideoElement | null;
  const season = normalizeText(options.season);
  const episode = normalizeText(options.episode);
  const prefix = season && episode ? `S${season}E${episode} - ` : "";
  const seed = `${document.location.pathname}:${options.title}:${season}:${episode}`;
  const waitingText = resolveVariantText(
    Array.isArray(options.waitingText)
      ? options.waitingText
      : findVariantsForPath(
          document.location.pathname,
          WATCH_WAITING_VARIANTS,
        ) || options.waitingText,
    `${seed}:waiting`,
  );
  const playingText = resolveVariantText(
    Array.isArray(options.playingText)
      ? options.playingText
      : findVariantsForPath(
          document.location.pathname,
          WATCH_PLAYING_VARIANTS,
        ) || options.playingText,
    `${seed}:playing`,
  );
  const pausedText = resolveVariantText(
    Array.isArray(options.pausedText)
      ? options.pausedText
      : findVariantsForPath(
          document.location.pathname,
          WATCH_PAUSED_VARIANTS,
        ) || options.pausedText,
    `${seed}:paused`,
  );
  const endedText = resolveVariantText(
    Array.isArray(options.endedText)
      ? options.endedText
      : findVariantsForPath(document.location.pathname, WATCH_ENDED_VARIANTS) ||
          options.endedText ||
          "Le générique approche, personne ne bouge",
    `${seed}:ended`,
  );

  presenceData.type = ActivityType.Watching;
  presenceData.details = options.title;
  presenceData.state = `${prefix}${waitingText}`;

  if (season && episode) {
    presenceData.largeImageText = `Season ${season}, Episode ${episode}`;
  } else {
    presenceData.largeImageText = "Lecture en cours";
  }

  if (video && Number.isFinite(video.duration) && video.duration > 0) {
    if (video.ended) {
      presenceData.state = `${prefix}${endedText}`;
    } else if (video.paused) {
      presenceData.state = `${prefix}${pausedText}`;
    } else {
      presenceData.state = `${prefix}${playingText}`;
      presenceData.startTimestamp =
        Date.now() - Math.floor(video.currentTime * 1000);
      presenceData.endTimestamp =
        Date.now() +
        Math.max(0, Math.floor((video.duration - video.currentTime) * 1000));
    }
  }

  return presenceData;
}

function getWatchTitle(fallback: string): string {
  const titleFromAttributes = findTitleAttribute((title) => {
    if (title.length < 4) return false;
    if (/ouvrir dans une nouvelle page/i.test(title)) return false;
    if (/trailer background/i.test(title)) return false;
    if (/^[-+]\d+s$/i.test(title)) return false;
    if (/^zoom [+-]$/i.test(title)) return false;
    return true;
  });

  const title = firstNonEmpty(
    getMetaContent('meta[property="og:title"]'),
    titleFromAttributes,
    getText("h3.text-lg"),
    getText("h3"),
    getText("h1"),
    document.title,
    fallback,
  );

  return stripSiteName(title) || fallback;
}

function getProviderName(providerId: string): string {
  return PROVIDER_NAMES[providerId] || `Provider ${providerId}`;
}

function buildRoutePresence(showTimestamp: boolean, showButtons: boolean) {
  const { pathname } = document.location;
  const pageTitle = getPageTitle();
  const pageImage = getPageImage("logo");
  const contentImage = getPageImage("content");

  let match: RegExpMatchArray | null = null;

  if (pathname === "/") {
    return finalizePresence(
      createPagePresence(
        "Farfouille l'accueil comme un critique sous caféine",
        "Accueil Movix",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/search") {
    const query = getSearchParam("q");

    return finalizePresence(
      createPagePresence(
        "Traque la perle rare avec un calme très relatif",
        query ? `Recherche : ${query}` : "Recherche globale",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/movies") {
    return finalizePresence(
      createPagePresence(
        "Passe le catalogue films au rayon X",
        "Catalogue films",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/tv-shows") {
    return finalizePresence(
      createPagePresence(
        "Collectionne les séries sans finir les précédentes",
        "Catalogue séries",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/collections") {
    return finalizePresence(
      createPagePresence(
        "Fouille les collections comme un conservateur insomniaque",
        pageTitle || "Collections Movix",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/collection\/([^/]+)$/i))) {
    const collectionId = getMatchPart(match, 1);

    return finalizePresence(
      createPagePresence(
        "Inspecte une collection avec un sérieux disproportionné",
        pageTitle || `Collection ${shortenId(collectionId)}`,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/movie\/([^/]+)$/i))) {
    const movieId = getMatchPart(match, 1);

    return finalizePresence(
      createPagePresence(
        "Épluche une fiche film avant le grand clic",
        pageTitle || `Film ${shortenId(movieId)}`,
        contentImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/tv\/([^/]+)$/i))) {
    const showId = getMatchPart(match, 1);

    return finalizePresence(
      createPagePresence(
        "Analyse une série comme un comité de binge-watching",
        pageTitle || `Série ${shortenId(showId)}`,
        contentImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/download\/(movie|tv)\/([^/]+)$/i))) {
    const contentType = getMatchPart(match, 1);
    const typeLabel = contentType === "movie" ? "Film" : "Série";
    const title = firstNonEmpty(
      getText("h2"),
      pageTitle,
      `${typeLabel} à télécharger`,
    );

    return finalizePresence(
      createPagePresence(
        "Prépare un plan B avec une assurance très théâtrale",
        String(title),
        contentImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/debrid") {
    const provider = getSearchParam("provider");
    const state = provider
      ? `Debrid via ${provider}`
      : "Atelier anti-liens capricieux";

    return finalizePresence(
      createPagePresence(
        "Dompte des liens récalcitrants à mains nues",
        state,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/genre\/([^/]+)\/([^/]+)$/i))) {
    const mediaType = getMatchPart(match, 1);
    const mediaLabel = mediaType === "movie" ? "Films" : "Séries";

    return finalizePresence(
      createPagePresence(
        "Trie le chaos par genre parce qu'il le peut",
        pageTitle || `${mediaLabel} par genre`,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/roulette") {
    return finalizePresence(
      createPagePresence(
        "Laisse le destin choisir quelle idée brillante",
        pageTitle || "Roulette Movix",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (
    (match = pathname.match(/^\/provider\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/i))
  ) {
    const providerId = getMatchPart(match, 1);
    const mediaType = getMatchPart(match, 2);
    const providerName = getProviderName(providerId);
    const mediaLabel = mediaType === "movies" ? "Films" : "Séries";

    return finalizePresence(
      createPagePresence(
        "Retourne un catalogue provider dans tous les sens",
        pageTitle || `${providerName} - ${mediaLabel}`,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/provider\/([^/]+)$/i))) {
    const providerId = getMatchPart(match, 1);

    return finalizePresence(
      createPagePresence(
        "Espionne un provider avec une curiosité très assumée",
        getProviderName(providerId),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/auth" || pathname === "/auth/google") {
    return finalizePresence(
      createPagePresence(
        "Négocie avec l'authentification sans perdre la face",
        "Connexion en cours",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/create-account" || pathname === "/link-bip39/create") {
    return finalizePresence(
      createPagePresence(
        "Forge un compte comme un druide numérique",
        "Création de compte",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/login-bip39" || pathname === "/link-bip39") {
    return finalizePresence(
      createPagePresence(
        "Récite sa phrase magique sans cligner des yeux",
        "Connexion BIP39",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/person\/([^/]+)$/i))) {
    const personId = getMatchPart(match, 1);

    return finalizePresence(
      createPagePresence(
        "Épluche une filmo comme un détective du générique",
        pageTitle || `Personne ${shortenId(personId)}`,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/profile") {
    return finalizePresence(
      createPagePresence(
        "Range son profil puis dérange tout à nouveau",
        "Profil utilisateur",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/alerts") {
    return finalizePresence(
      createPagePresence(
        "Surveille ses alertes comme une tour de contrôle du binge",
        pageTitle || "Mes alertes",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/live-tv") {
    const liveTitle = firstNonEmpty(
      getText("h1"),
      getText("h2"),
      pageTitle,
      "Live TV",
    );

    return finalizePresence(
      createPagePresence(
        "Zappe plus vite que la télécommande ne l'accepte",
        String(liveTitle),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/watch\/movie\/([^/]+)$/i))) {
    const title = getWatchTitle("Film mystère");

    return finalizePresence(
      createWatchingPresence({
        title,
        playingText: "lecture en cours, canapé en surchauffe",
        pausedText: "pause stratégique, le drame attend",
        waitingText: "cherche la bonne source sans paniquer",
        image: contentImage,
      }),
      { showTimestamp, showButtons, pathname, allowPageTimestamp: false },
    );
  }

  if (
    (match = pathname.match(/^\/watch\/tv\/([^/]+)\/s\/([^/]+)\/e\/([^/]+)$/i))
  ) {
    const season = getMatchPart(match, 2);
    const episode = getMatchPart(match, 3);
    const rawTitle = getWatchTitle("Série mystère");
    const title =
      rawTitle.replace(/\s*-\s*S\d+E\d+$/i, "").trim() || "Série mystère";

    return finalizePresence(
      createWatchingPresence({
        title,
        season,
        episode,
        playingText: "binge hors de contrôle",
        pausedText: "pause très dramatique",
        waitingText: "sélectionne une source avec panique élégante",
        image: contentImage,
      }),
      { showTimestamp, showButtons, pathname, allowPageTimestamp: false },
    );
  }

  if (
    (match = pathname.match(
      /^\/watch\/anime\/([^/]+)\/season\/([^/]+)\/episode\/([^/]+)$/i,
    ))
  ) {
    const season = getMatchPart(match, 2);
    const episode = getMatchPart(match, 3);
    const rawTitle = getWatchTitle("Anime mystère");
    const title =
      rawTitle.replace(/\s*-\s*S\d+E\d+$/i, "").trim() || "Anime mystère";

    return finalizePresence(
      createWatchingPresence({
        title,
        season,
        episode,
        playingText: "anime en cours, théorie du fanclub activée",
        pausedText: "pause technique, hype toujours intacte",
        waitingText: "cherche son épisode comme un héros secondaire",
        image: contentImage,
      }),
      { showTimestamp, showButtons, pathname, allowPageTimestamp: false },
    );
  }

  if (pathname === "/watchparty/create") {
    const title = firstNonEmpty(
      getText("h2"),
      getText("h1"),
      "Création de WatchParty",
    );

    return finalizePresence(
      createPagePresence(
        "Prépare une WatchParty comme un maître de cérémonie chaotique",
        String(title),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/watchparty\/room\/([^/]+)$/i))) {
    const roomId = getMatchPart(match, 1);
    const roomTitle = firstNonEmpty(
      getAttribute("h1[title]", "title"),
      getText("h1"),
      getText("h2"),
      `Salon ${shortenId(roomId)}`,
    );

    return finalizePresence(
      createPagePresence(
        "Coordonne une WatchParty pendant que le chat dérape",
        String(roomTitle),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/watchparty\/join(?:\/([^/]+))?$/i))) {
    const joinCode = getMatchPart(match, 1);
    const state = joinCode
      ? `Code ${safeDecode(joinCode).toUpperCase()}`
      : String(
          firstNonEmpty(
            getText("h2"),
            getText("h1"),
            "Rejoindre une WatchParty",
          ),
        );

    return finalizePresence(
      createPagePresence(
        "Essaie d'entrer dans une WatchParty sans rater le code",
        state,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/watchparty/list") {
    return finalizePresence(
      createPagePresence(
        "Fouille les salons WatchParty comme un videur curieux",
        String(firstNonEmpty(getText("h1"), "Liste des salons WatchParty")),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/suggestion") {
    return finalizePresence(
      createPagePresence(
        "Demande au site de choisir à sa place, aveu touchant",
        pageTitle || "Suggestions personnalisées",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/extension") {
    return finalizePresence(
      createPagePresence(
        "Équipe son navigateur pour boxer les hosters relous",
        pageTitle || "Extension Movix",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/list\/([^/]+)$/i))) {
    const listId = getMatchPart(match, 1);

    return finalizePresence(
      createPagePresence(
        "Explore une liste partagée avec un jugement silencieux",
        pageTitle || `Liste ${shortenId(listId)}`,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/list-catalog") {
    return finalizePresence(
      createPagePresence(
        "Parcourt les listes publiques comme un brocanteur du streaming",
        pageTitle || "Catalogue des listes publiques",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/dmca") {
    return finalizePresence(
      createPagePresence(
        "Lit la DMCA, oui ça arrive vraiment",
        "Section juridique",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/admin") {
    return finalizePresence(
      createPagePresence(
        "Traîne dans l'admin avec beaucoup trop de boutons",
        "Console admin",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/profile-selection") {
    return finalizePresence(
      createPagePresence(
        "Choisit un profil comme si Netflix observait",
        "Sélection de profil",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/profile-management") {
    return finalizePresence(
      createPagePresence(
        "Bidouille les profils avec une autorité discutable",
        "Gestion des profils",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/wishboard") {
    return finalizePresence(
      createPagePresence(
        "Vote sur le Wishboard comme un ministre du catalogue",
        pageTitle || "Wishboard",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/wishboard/new") {
    return finalizePresence(
      createPagePresence(
        "Dépose une requête avec l'espoir d'être exaucé",
        String(firstNonEmpty(getText("h1"), "Nouvelle demande Wishboard")),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/wishboard/my-requests") {
    return finalizePresence(
      createPagePresence(
        "Surveille ses requêtes comme des actions en bourse",
        String(firstNonEmpty(getText("h1"), "Mes demandes Wishboard")),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/wishboard/submit-link") {
    return finalizePresence(
      createPagePresence(
        "Soumet un lien pour sauver le catalogue à mains nues",
        String(
          firstNonEmpty(getText("h2"), getText("h1"), "Soumission de lien"),
        ),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/vip") {
    return finalizePresence(
      createPagePresence(
        "Examine le VIP avec un regard de mécène stratégique",
        "Espace VIP",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/vip/don") {
    return finalizePresence(
      createPagePresence(
        "Sort la carte bleue avec un panache douteux",
        "Don VIP",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/vip\/invoice\/([^/]+)$/i))) {
    const invoiceId = getMatchPart(match, 1);

    return finalizePresence(
      createPagePresence(
        "Contemple une facture VIP, romance moderne",
        `Facture ${shortenId(invoiceId)}`,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/vip\/cadeau\/([^/]+)$/i))) {
    const giftId = getMatchPart(match, 1);

    return finalizePresence(
      createPagePresence(
        "Déballe un cadeau VIP sans papier brillant",
        `Cadeau ${shortenId(giftId)}`,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/about") {
    return finalizePresence(
      createPagePresence(
        "Raconte l'histoire de Movix comme une légende locale",
        pageTitle || "À propos de Movix",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/privacy") {
    return finalizePresence(
      createPagePresence(
        "Lit la politique de confidentialité avec un courage rare",
        "Politique de confidentialité",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/terms-of-service" || pathname === "/terms") {
    return finalizePresence(
      createPagePresence(
        "Traverse les CGU armé d'un café très serré",
        "Conditions d'utilisation",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/cinegraph") {
    const graphFocus = firstNonEmpty(
      getText("h2.cinegraph-detail-title"),
      pageTitle,
      "CineGraph",
    );

    return finalizePresence(
      createPagePresence(
        "Cartographie ses obsessions ciné comme un savant fou",
        String(graphFocus),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/settings") {
    return finalizePresence(
      createPagePresence(
        "Tripatouille les réglages jusqu'à friser la perfection",
        "Réglages Movix",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/top10") {
    return finalizePresence(
      createPagePresence(
        "Scrute le top 10 comme un analyste de canapé",
        pageTitle || "Top 10 Movix",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "/ftv") {
    return finalizePresence(
      createPagePresence(
        "Fouille France.tv sans télécommande et sans honte",
        String(firstNonEmpty(getText("h2"), pageTitle, "France.tv")),
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/ftv\/info\/([^/]+)$/i))) {
    const programId = getMatchPart(match, 1);

    return finalizePresence(
      createPagePresence(
        "Inspecte une fiche France.tv avant le clic fatal",
        String(
          firstNonEmpty(
            getText("h1"),
            pageTitle,
            `Programme ${shortenId(programId)}`,
          ),
        ),
        contentImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if ((match = pathname.match(/^\/ftv\/watch\/([^/]+)$/i))) {
    const title = getWatchTitle("Programme France.tv");

    return finalizePresence(
      createWatchingPresence({
        title,
        playingText:
          "programme en cours, télécommande officiellement au chômage",
        pausedText: "pause stratégique du direct",
        waitingText: "cherche le bon flux avec dignité",
        image: contentImage,
      }),
      { showTimestamp, showButtons, pathname, allowPageTimestamp: false },
    );
  }

  if ((match = pathname.match(/^\/wrapped(?:\/([^/]+))?$/i))) {
    const wrappedYear = getMatchPart(match, 1);
    const state = wrappedYear
      ? `Wrapped ${wrappedYear}`
      : String(firstNonEmpty(getText("h1"), "Wrapped Movix"));

    return finalizePresence(
      createPagePresence(
        "Relit son année ciné comme un bilan existentiel",
        state,
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  if (pathname === "*" || pathname === "/404") {
    return finalizePresence(
      createPagePresence(
        "S'est perdu dans Movix, ce qui était statistiquement évitable",
        "404 - page introuvable",
        pageImage,
      ),
      { showTimestamp, showButtons, pathname },
    );
  }

  return finalizePresence(
    createPagePresence(
      "Explore Movix sans carte ni boussole",
      pageTitle || "Exploration en cours",
      pageImage,
    ),
    { showTimestamp, showButtons, pathname },
  );
}

async function getBooleanSetting(
  settingId: string,
  fallback: boolean,
): Promise<boolean> {
  try {
    const value = await presence.getSetting<boolean>(settingId);
    return typeof value === "boolean" ? value : fallback;
  } catch {
    return fallback;
  }
}

presence.on("UpdateData", async () => {
  const [showTimestamp, showButtons] = await Promise.all([
    getBooleanSetting("showTimestamp", true),
    getBooleanSetting("showButtons", false),
  ]);

  const presenceData = buildRoutePresence(showTimestamp, showButtons);

  if (presenceData) {
    presence.setActivity(presenceData);
  } else {
    presence.clearActivity();
  }
});

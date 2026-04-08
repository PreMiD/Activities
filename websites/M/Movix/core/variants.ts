export const PAGE_DETAIL_VARIANTS: Array<{
  pattern: RegExp
  variants: readonly string[]
}> = [
  {
    pattern: /^\/$/,
    variants: [
      'Patrouille sur l\'accueil comme un critique payé en popcorn 🍿',
      'Scrolle l\'accueil avec l\'assurance d\'un jury imaginaire 🎬',
      'Fouille l\'accueil comme un détective du canapé 🛋️',
    ],
  },
  {
    pattern: /^\/search$/i,
    variants: [
      'Traque une pépite avec un calme purement décoratif 🔎',
      'Interroge la recherche comme un enquêteur du streaming 🕵️',
      'Lance des mots-clés avec l\'énergie d\'un génie fatigué 🔍',
    ],
  },
  {
    pattern: /^\/movies$/i,
    variants: [
      'Passe le catalogue films au rayon X sans diplôme officiel 🎬',
      'Inspecte les films comme un sommelier du popcorn 🍿',
      'Fouille les films avec un sérieux beaucoup trop cinématographique 🎞️',
    ],
  },
  {
    pattern: /^\/tv-shows$/i,
    variants: [
      'Collectionne les séries comme si dormir était facultatif 📺',
      'Parcourt les séries avec des ambitions de binge incontrôlables 🍿',
      'Évalue les séries comme un comité secret du canapé 📡',
    ],
  },
  {
    pattern: /^\/collections$/i,
    variants: [
      'Fouille les collections comme un archiviste sous café ☕',
      'Visite les collections avec le respect d\'un conservateur dramatique 🗂️',
      'Classe des sagas dans sa tête comme si c\'était son métier 📚',
    ],
  },
  {
    pattern: /^\/collection\/[^/]+$/i,
    variants: [
      'Inspecte une collection avec un sérieux presque gouvernemental 🗂️',
      'Retourne une collection comme un brocanteur du streaming 📦',
      'Examine une saga avec une passion très peu discrète 🎞️',
    ],
  },
  {
    pattern: /^\/movie\/[^/]+$/i,
    variants: [
      'Épluche une fiche film comme un jury de festival en retard 🎬',
      'Analyse un film avant le clic fatal avec beaucoup trop d\'émotion 🍿',
      'Observe une fiche film comme si le réalisateur regardait 👀',
    ],
  },
  {
    pattern: /^\/tv\/[^/]+$/i,
    variants: [
      'Dissèque une fiche série comme si le binge était un sport olympique 📺',
      'Examine une série avec l\'énergie d\'un fan qui ne dort pas 😵',
      'Observe une fiche série comme un comité de cliffhangers 🍿',
    ],
  },
  {
    pattern: /^\/download\/(movie|tv)\/[^/]+$/i,
    variants: [
      'Prépare un plan B avec l\'élégance d\'un pirate en costume ⬇️',
      'Monte un plan secours comme si Internet était en grève 📦',
      'Sécurise une sortie de secours ciné avec un calme douteux 🧳',
    ],
  },
  {
    pattern: /^\/debrid$/i,
    variants: [
      'Dompte des liens capricieux avec la grâce d\'un sorcier réseau 🪄',
      'Répare des liens comme un mécano du streaming 🧰',
      'Négocie avec des hosters récalcitrants à mains nues 🔧',
    ],
  },
  {
    pattern: /^\/genre\/[^/]+\/[^/]+$/i,
    variants: [
      'Trie le chaos par genre avec une autorité totalement inventée 🗂️',
      'Range les goûts du monde dans de petites cases très pratiques 🎭',
      'Organise le catalogue comme un bibliothécaire du binge 📚',
    ],
  },
  {
    pattern: /^\/roulette$/i,
    variants: [
      'Laisse le destin choisir à sa place, aveu courageux 🎲',
      'Confie sa soirée à une roulette manifestement instable 🎰',
      'Demande au hasard de prendre les commandes avec panache 🎯',
    ],
  },
  {
    pattern: /^\/provider\/[^/]+\/[^/]+(?:\/[^/]+)?$/i,
    variants: [
      'Retourne un catalogue provider comme un inspecteur trop motivé 📦',
      'Épluche un provider avec l\'enthousiasme d\'un auditeur secret 🕵️',
      'Passe un provider au scanner ciné sans autorisation officielle 📺',
    ],
  },
  {
    pattern: /^\/provider\/[^/]+$/i,
    variants: [
      'Espionne un provider avec une curiosité très assumée 👀',
      'Observe un provider comme si un abonnement était en jeu 💳',
      'Fait l\'inventaire d\'un provider avec une dignité variable 📋',
    ],
  },
  {
    pattern: /^\/auth(?:\/google)?$/i,
    variants: [
      'Négocie avec la connexion comme un diplomate en sueur 🔐',
      'Affronte l\'authentification avec un courage administratif 🪪',
      'Tente de se connecter sans vexer les serveurs 🤝',
    ],
  },
  {
    pattern: /^\/(?:create-account|link-bip39\/create)$/i,
    variants: [
      'Forge un compte comme un druide numérique très appliqué ✨',
      'Crée un compte avec le sérieux d\'un mage du mot de passe 🔮',
      'Ouvre un nouveau chapitre administratif en grand style 📝',
    ],
  },
  {
    pattern: /^\/(?:login-bip39|link-bip39)$/i,
    variants: [
      'Récite sa formule secrète sans éternuer 🔑',
      'Murmure une phrase magique avec un calme discutable 🧠',
      'Déverrouille son accès comme un sorcier sous pression ✨',
    ],
  },
  {
    pattern: /^\/person\/[^/]+$/i,
    variants: [
      'Épluche une filmo comme un détective du générique 🕵️',
      'Remonte une carrière plan par plan avec passion 🎭',
      'Inspecte une star comme si Cannes avait appelé 📸',
    ],
  },
  {
    pattern: /^\/profile$/i,
    variants: [
      'Range son profil puis le rerange pour le principe 👤',
      'Contemple son profil comme un PDG du canapé 🪞',
      'Ajuste son profil avec une minutie ridiculement noble ✍️',
    ],
  },
  {
    pattern: /^\/alerts$/i,
    variants: [
      'Surveille ses alertes comme une tour de contrôle du binge 🔔',
      'Attend ses alertes avec le sang-froid d\'une casserole 🌡️',
      'Écoute les signaux du catalogue comme un radar humain 📡',
    ],
  },
  {
    pattern: /^\/live-tv$/i,
    variants: [
      'Zappe plus vite que la télécommande ne peut protester 📡',
      'Navigue en direct avec les réflexes d\'un ninja du canapé 📺',
      'Fait du slalom entre les chaînes sans prévenir personne 🎛️',
    ],
  },
  {
    pattern: /^\/watchparty\/create$/i,
    variants: [
      'Prépare une WatchParty comme un wedding planner du popcorn 🍿',
      'Monte une WatchParty avec la sérénité d\'un chef de gare 👥',
      'Assemble une soirée visionnage comme un maître de cérémonie chaotique 🎉',
    ],
  },
  {
    pattern: /^\/watchparty\/room\/[^/]+$/i,
    variants: [
      'Coordonne une WatchParty pendant que le chat part en freestyle 💬',
      'Gère une WatchParty avec l\'autorité d\'un roi du canapé 👑',
      'Tient une salle WatchParty comme un DJ des cliffhangers 🎚️',
    ],
  },
  {
    pattern: /^\/watchparty\/join(?:\/[^/]+)?$/i,
    variants: [
      'Essaie d\'entrer dans une WatchParty sans rater le code 🚪',
      'Tente une infiltration sociale très popcorn 🍿',
      'Rejoint une WatchParty avec la discrétion d\'une fanfare 🥁',
    ],
  },
  {
    pattern: /^\/watchparty\/list$/i,
    variants: [
      'Fouille les salons WatchParty comme un videur curieux 👀',
      'Parcourt les salons comme un agent immobilier du binge 🏠',
      'Cherche une WatchParty où poser son popcorn 🍿',
    ],
  },
  {
    pattern: /^\/suggestion$/i,
    variants: [
      'Demande au site de penser à sa place, aveu très honnête 🧠',
      'Réclame une idée brillante avec le panache d\'un indécis 🎯',
      'Confie sa soirée à l\'algorithme avec un courage rare 🤖',
    ],
  },
  {
    pattern: /^\/extension$/i,
    variants: [
      'Arme son navigateur comme un chevalier anti-hoster 🧩',
      'Équipe le navigateur pour boxer les pubs et les caprices 🥊',
      'Installe des renforts techniques avec une joie suspecte 🛠️',
    ],
  },
  {
    pattern: /^\/list\/[^/]+$/i,
    variants: [
      'Explore une liste partagée avec un jugement délicatement silencieux 📋',
      'Déguste une liste publique comme un critique bénévole 🍽️',
      'Parcourt une sélection avec la ferveur d\'un collectionneur 🗃️',
    ],
  },
  {
    pattern: /^\/list-catalog$/i,
    variants: [
      'Parcourt les listes publiques comme un brocanteur du streaming 📚',
      'Inspecte des listes comme un curateur de canapé 🛋️',
      'Feuillette le catalogue des listes avec des ambitions très nobles 📖',
    ],
  },
  {
    pattern: /^\/dmca$/i,
    variants: [
      'Lit la DMCA, oui ça arrive vraiment ⚖️',
      'Affronte la paperasse juridique comme un héros discret 📜',
      'Traverse la zone légale avec un courage franchement admirable 🧾',
    ],
  },
  {
    pattern: /^\/admin$/i,
    variants: [
      'Traîne dans l\'admin avec beaucoup trop de boutons 🛠️',
      'Pilote l\'admin comme un capitaine légèrement dangereux 🚨',
      'Regarde l\'admin droit dans les permissions 👮',
    ],
  },
  {
    pattern: /^\/profile-selection$/i,
    variants: [
      'Choisit un profil comme si toute la famille observait 👥',
      'Sélectionne un profil avec le sérieux d\'un casting 🎭',
      'Hésite entre les profils comme devant un buffet 👀',
    ],
  },
  {
    pattern: /^\/profile-management$/i,
    variants: [
      'Bidouille les profils avec une autorité discutable 🧰',
      'Réorganise les profils comme un DRH du canapé 📁',
      'Jongle avec les profils en mode administrateur de salon 🛋️',
    ],
  },
  {
    pattern: /^\/wishboard$/i,
    variants: [
      'Vote sur le Wishboard comme un ministre du catalogue 🗳️',
      'Fait campagne pour ses envies avec aplomb 📣',
      'Milite pour de nouveaux contenus avec une ferveur électorale 🎤',
    ],
  },
  {
    pattern: /^\/wishboard\/new$/i,
    variants: [
      'Dépose une requête avec l\'espoir d\'être exaucé 🙏',
      'Rédige une demande comme un citoyen du binge modèle ✍️',
      'Soumet un souhait avec la gravité d\'un traité international 📬',
    ],
  },
  {
    pattern: /^\/wishboard\/my-requests$/i,
    variants: [
      'Surveille ses requêtes comme des actions en bourse 📈',
      'Observe ses demandes avec un stress très rentable 👀',
      'Suit ses requêtes comme un trader du catalogue 💹',
    ],
  },
  {
    pattern: /^\/wishboard\/submit-link$/i,
    variants: [
      'Soumet un lien pour sauver le catalogue à mains nues 🔗',
      'Apporte du renfort au catalogue avec panache 🧷',
      'Lance un lien de secours comme un héros logistique 📡',
    ],
  },
  {
    pattern: /^\/vip$/i,
    variants: [
      'Examine le VIP avec un regard de mécène stratégique 💎',
      'Observe l\'espace VIP comme un investisseur du popcorn 💸',
      'Évalue le club VIP avec un sérieux de milliardaire du canapé 🪙',
    ],
  },
  {
    pattern: /^\/vip\/don$/i,
    variants: [
      'Sort la carte bleue avec un panache douteux 💳',
      'S\'avance vers le don VIP comme un noble du streaming 👑',
      'Finance le chaos audiovisuel avec élégance 💸',
    ],
  },
  {
    pattern: /^\/vip\/invoice\/[^/]+$/i,
    variants: [
      'Contemple une facture VIP, romance moderne 🧾',
      'Observe une facture comme si c\'était un poème fiscal 💼',
      'Vérifie une facture VIP avec le calme d\'un comptable du luxe 💎',
    ],
  },
  {
    pattern: /^\/vip\/cadeau\/[^/]+$/i,
    variants: [
      'Déballe un cadeau VIP sans papier brillant 🎁',
      'Examine un cadeau VIP avec les yeux d\'un enfant premium ✨',
      'Ouvre une surprise VIP avec une noblesse discutable 🎀',
    ],
  },
  {
    pattern: /^\/about$/i,
    variants: [
      'Raconte l\'histoire de Movix comme une légende locale 📖',
      'Explore les origines de Movix comme un archéologue du streaming 🏺',
      'Lit le lore de Movix avec des étoiles dans les yeux ✨',
    ],
  },
  {
    pattern: /^\/privacy$/i,
    variants: [
      'Lit la politique de confidentialité avec un courage rare 🕶️',
      'Affronte la confidentialité ligne par ligne sans trembler 🔐',
      'Traverse les règles de vie privée comme un juriste du dimanche 📜',
    ],
  },
  {
    pattern: /^\/(?:terms-of-service|terms)$/i,
    variants: [
      'Traverse les CGU armé d\'un café très serré ☕',
      'Lit les conditions avec le courage d\'un gladiateur du clic ⚖️',
      'Affronte la prose légale sans quitter le canapé 📜',
    ],
  },
  {
    pattern: /^\/cinegraph$/i,
    variants: [
      'Cartographie ses obsessions ciné comme un savant fou 🧠',
      'Trace des connexions ciné avec une énergie très conspirationniste 🕸️',
      'Dessine son cerveau cinéma en mode laboratoire secret 🧪',
    ],
  },
  {
    pattern: /^\/settings$/i,
    variants: [
      'Tripatouille les réglages jusqu\'à friser la perfection ⚙️',
      'Ajuste les paramètres comme un horloger du binge 🛠️',
      'Cherche le réglage parfait avec une obstination admirable 🎛️',
    ],
  },
  {
    pattern: /^\/top10$/i,
    variants: [
      'Scrute le top 10 comme un analyste de canapé 🏆',
      'Observe le classement avec l\'autorité d\'un jury auto-proclamé 🎖️',
      'Compare les tendances comme un stratège du popcorn 📈',
    ],
  },
  {
    pattern: /^\/ftv$/i,
    variants: [
      'Fouille France.tv sans télécommande et sans honte 🇫🇷',
      'Navigue dans France.tv comme un explorateur du direct 📺',
      'Inspecte France.tv avec une curiosité très nationale 🗼',
    ],
  },
  {
    pattern: /^\/ftv\/info\/[^/]+$/i,
    variants: [
      'Inspecte une fiche France.tv avant le clic fatal 🇫🇷',
      'Analyse un programme France.tv comme un critique du service public 🎬',
      'Examine un programme France.tv avec un sérieux très républicain 📺',
    ],
  },
  {
    pattern: /^\/wrapped(?:\/[^/]+)?$/i,
    variants: [
      'Relit son année ciné comme un audit émotionnel 📊',
      'Observe son Wrapped comme un bilan existentiel premium 🪞',
      'Revit son année Movix avec des statistiques et des frissons 📈',
    ],
  },
  {
    pattern: /^(?:\*|\/404)$/,
    variants: [
      'S\'est perdu avec une assurance spectaculaire 🧭',
      'Erre dans le 404 comme un aventurier sans carte 🗺️',
      'A réussi l\'exploit de se perdre sur Movix, bravo 🫡',
    ],
  },
]

export const WATCH_WAITING_VARIANTS: Array<{
  pattern: RegExp
  variants: readonly string[]
}> = [
  {
    pattern: /^\/watch\/movie\/[^/]+$/i,
    variants: [
      'cherche la bonne source sans paniquer 🍿',
      'choisit un lecteur comme un sommelier du streaming 🎬',
      'prépare le décollage du film avec gravité 🚀',
    ],
  },
  {
    pattern: /^\/watch\/tv\/[^/]+\/s\/[^/]+\/e\/[^/]+$/i,
    variants: [
      'sélectionne une source avec panique élégante 📺',
      'prépare le binge comme un ingénieur du canapé 🍿',
      'cherche le bon épisode avec une foi inébranlable 🔎',
    ],
  },
  {
    pattern: /^\/watch\/anime\/[^/]+\/season\/[^/]+\/episode\/[^/]+$/i,
    variants: [
      'cherche son épisode comme un héros secondaire 🌸',
      'prépare l\'anime avec une hype difficile à cacher ✨',
      'sélectionne une source en mode arc d\'introduction ⚔️',
    ],
  },
  {
    pattern: /^\/ftv\/watch\/[^/]+$/i,
    variants: [
      'cherche le bon flux avec dignité 🇫🇷',
      'accorde France.tv avec un sang-froid télévisuel 📡',
      'prépare le direct comme un régisseur du salon 🎛️',
    ],
  },
]

export const WATCH_PLAYING_VARIANTS: Array<{
  pattern: RegExp
  variants: readonly string[]
}> = [
  {
    pattern: /^\/watch\/movie\/[^/]+$/i,
    variants: [
      'lecture en cours, canapé en surchauffe 🍿',
      'film lancé, le popcorn travaille en heures sup\' 🎬',
      'visionnage actif, dignité momentanément absente 🛋️',
    ],
  },
  {
    pattern: /^\/watch\/tv\/[^/]+\/s\/[^/]+\/e\/[^/]+$/i,
    variants: [
      'binge hors de contrôle 📺',
      'épisode en cours, plus personne ne dort 🍿',
      'visionnage de série avec implication totale 🧠',
    ],
  },
  {
    pattern: /^\/watch\/anime\/[^/]+\/season\/[^/]+\/episode\/[^/]+$/i,
    variants: [
      'anime en cours, théorie du fanclub activée 🌸',
      'épisode lancé, niveau de hype dangereusement élevé ⚡',
      'visionnage anime en mode ouverture dramatique 🎌',
    ],
  },
  {
    pattern: /^\/ftv\/watch\/[^/]+$/i,
    variants: [
      'programme en cours, télécommande au chômage 📺',
      'direct lancé, salon officiellement mobilisé 🇫🇷',
      'lecture France.tv active, canapé en mission 🛋️',
    ],
  },
]

export const WATCH_PAUSED_VARIANTS: Array<{
  pattern: RegExp
  variants: readonly string[]
}> = [
  {
    pattern: /^\/watch\/movie\/[^/]+$/i,
    variants: [
      'pause stratégique, le drame attend ⏸️',
      'film en pause, le popcorn reprend son souffle 🍿',
      'interruption tactique, suspense sous cloche 🎬',
    ],
  },
  {
    pattern: /^\/watch\/tv\/[^/]+\/s\/[^/]+\/e\/[^/]+$/i,
    variants: [
      'pause très dramatique ⏸️',
      'épisode en pause, cliffhanger sous surveillance 👀',
      'arrêt technique du binge, émotion intacte 📺',
    ],
  },
  {
    pattern: /^\/watch\/anime\/[^/]+\/season\/[^/]+\/episode\/[^/]+$/i,
    variants: [
      'pause technique, hype toujours intacte ⏸️',
      'anime en pause, énergie shonen conservée ⚡',
      'interruption temporaire, pouvoir de l\'amitié stable 🌸',
    ],
  },
  {
    pattern: /^\/ftv\/watch\/[^/]+$/i,
    variants: [
      'pause stratégique du direct ⏸️',
      'programme en pause, personne ne touche à la télécommande 📡',
      'intermède technique à la française 🇫🇷',
    ],
  },
]

export const WATCH_ENDED_VARIANTS: Array<{
  pattern: RegExp
  variants: readonly string[]
}> = [
  {
    pattern: /^\/watch\/movie\/[^/]+$/i,
    variants: [
      'générique en vue, personne ne bouge 🎞️',
      'film terminé, silence solennel dans le salon 🛋️',
      'fin de séance, popcorn officiellement retraité 🍿',
    ],
  },
  {
    pattern: /^\/watch\/tv\/[^/]+\/s\/[^/]+\/e\/[^/]+$/i,
    variants: [
      'épisode terminé, prochain cliffhanger en approche 📺',
      'fin d\'épisode, volonté personnelle en miettes 🍿',
      'générique lancé, binge toujours menaçant 🎞️',
    ],
  },
  {
    pattern: /^\/watch\/anime\/[^/]+\/season\/[^/]+\/episode\/[^/]+$/i,
    variants: [
      'épisode terminé, l\'arc suivant appelle déjà 🌸',
      'fin d\'épisode, niveau de hype toujours irresponsable ⚡',
      'générique lancé, fanclub intérieurement debout 🎌',
    ],
  },
  {
    pattern: /^\/ftv\/watch\/[^/]+$/i,
    variants: [
      'programme terminé, la télécommande réclame des congés 📺',
      'fin de diffusion, mission salon accomplie 🇫🇷',
      'générique France.tv détecté, calme retrouvé 🎞️',
    ],
  },
]


const presence = new Presence({
  clientId: "1460363090981031997" // Client ID de MuffyBot
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = "https://i.imgur.com/mbTaZ6U.png",
  Admin = "https://i.imgur.com/mbTaZ6U.png",
  Patrol = "https://i.imgur.com/mbTaZ6U.png",
  Edit = "https://i.imgur.com/mbTaZ6U.png"
}

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    smallImageText: "Vikidia (FR)" // Valeur par défaut
  };

  const { pathname = "", hostname = "", href = "", search = "" } = document.location;
  const urlParams = new URLSearchParams(search);

  // Détection de la langue (ex: fr.vikidia.org → "FR")
  let language = "FR";
  const langMatch = hostname.match(/([a-z]{2,3})\.vikidia\.org/);
  if (langMatch && langMatch[1]) {
    language = langMatch[1].toUpperCase();
  }
  presenceData.smallImageText = `Vikidia (${language})`;

  // Fonction pour nettoyer les titres (toujours retourne une string)
  const cleanTitle = (title: string | null = ""): string => {
    if (!title) return "Inconnu";
    return decodeURIComponent(title.replace(/_/g, " "));
  };

  // Fonction pour obtenir le titre de la page (toujours retourne une string)
  const getPageTitle = (): string => {
    if (pathname.startsWith("/wiki/")) {
      return cleanTitle(pathname.replace("/wiki/", ""));
    }
    const titleParam = urlParams.get("title");
    return titleParam ? cleanTitle(titleParam) : "Accueil";
  };

  // Fonction pour obtenir l'utilisateur cible (toujours retourne une string)
  const getTargetUser = (): string => {
    const wpTarget = urlParams.get("wpTarget");
    if (wpTarget) return cleanTitle(wpTarget);
    const user = urlParams.get("user");
    if (user) return cleanTitle(user);

    const pathParts = pathname.split("/");
    if (pathParts.length > 3) {
      return cleanTitle(pathParts[pathParts.length - 1]);
    }
    return "Inconnu";
  };

  // Récupération des paramètres URL (avec valeurs par défaut)
  const action = urlParams.get("action") || "";
  const veaction = urlParams.get("veaction") || "";
  const logType = urlParams.get("type") || "";

  // ===========================================
  // ACTIONS ADMINISTRATEUR
  // ===========================================

  if (action === "delete") {
    const pageTitle = getPageTitle();
    presenceData.details = "🗑️ Supprime une page";
    presenceData.state = pageTitle;
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (action === "undelete" || pathname.includes("Special:Undelete") || pathname.includes("Spécial:Restaurer")) {
    const pageTitle = getPageTitle();
    presenceData.details = "♻️ Restaure une page";
    presenceData.state = pageTitle;
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (action === "protect" || action === "unprotect") {
    const pageTitle = getPageTitle();
    const isProtecting = action === "protect";
    presenceData.details = isProtecting ? "🛡️ Protège une page" : "🔓 Déprotège une page";
    presenceData.state = pageTitle;
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Block") || pathname.includes("Spécial:Bloquer")) {
    const targetUser = getTargetUser();
    presenceData.details = "🚫 Bloque un utilisateur";
    presenceData.state = targetUser;
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Unblock") || pathname.includes("Spécial:Débloquer")) {
    const targetUser = getTargetUser();
    presenceData.details = "✅ Débloque un utilisateur";
    presenceData.state = targetUser;
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:BlockList") || pathname.includes("Spécial:Utilisateurs_bloqués")) {
    presenceData.details = "📋 Liste des blocages";
    presenceData.state = "Consultation";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:UserRights") || pathname.includes("Spécial:Droits")) {
    const targetUser = getTargetUser();
    presenceData.details = "⚙️ Gestion des droits";
    presenceData.state = targetUser;
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (action === "revisiondelete" || action === "deleterevision") {
    const pageTitle = getPageTitle();
    presenceData.details = "🔒 Masquage de révisions";
    presenceData.state = pageTitle;
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:MergeHistory") || pathname.includes("Spécial:Fusionner")) {
    const pageTitle = getPageTitle();
    presenceData.details = "🔀 Fusion d'historiques";
    presenceData.state = pageTitle;
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Import") || pathname.includes("Spécial:Importer")) {
    presenceData.details = "📥 Import de pages";
    presenceData.state = "Importation";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Export") || pathname.includes("Spécial:Exporter")) {
    presenceData.details = "📤 Export de pages";
    presenceData.state = "Exportation";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:Nuke")) {
    const targetUser = getTargetUser();
    presenceData.details = "💣 Suppression massive";
    presenceData.state = targetUser !== "Inconnu" ? `Pages de ${targetUser}` : "Sélection";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:AbuseFilter")) {
    presenceData.details = "🛡️ Filtres anti-abus";
    const filterId = pathname.split("/").pop() || "";
    presenceData.state = filterId && !filterId.includes("AbuseFilter") ? `Filtre #${filterId}` : "Liste des filtres";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }
  else if (pathname.includes("Special:AbuseLog")) {
    presenceData.details = "📊 Journal des abus";
    presenceData.state = "Analyse des déclenchements";
    presenceData.smallImageKey = ActivityAssets.Patrol;
  }

  // ===========================================
  // ACTIONS PATROUILLEUR
  // ===========================================

  else if (action === "rollback") {
    const pageTitle = getPageTitle();
    const user = urlParams.get("from") || "Inconnu";
    presenceData.details = "🔄 Rollback";
    presenceData.state = `${pageTitle} (${cleanTitle(user)})`;
    presenceData.smallImageKey = ActivityAssets.Patrol;
  }
  else if (action === "markpatrolled") {
    const pageTitle = getPageTitle();
    presenceData.details = "✔️ Marque comme patrouillée";
    presenceData.state = pageTitle;
    presenceData.smallImageKey = ActivityAssets.Patrol;
  }
  else if (pathname.includes("Special:RecentChanges") || pathname.includes("Spécial:Modifications_récentes")) {
    const hidepatrolled = urlParams.get("hidepatrolled");
    presenceData.details = "👁️ Patrouille";
    presenceData.state = hidepatrolled === "1" ? "Non patrouillées" : "Toutes modifications";
    presenceData.smallImageKey = ActivityAssets.Patrol;
  }

  // ===========================================
  // JOURNAUX SYSTÈME
  // ===========================================

  else if (pathname.includes("Special:Log") || pathname.includes("Spécial:Journal")) {
    let logDetails = "📜 Journaux";
    let logState = "";
    if (logType === "delete" || pathname.includes("/delete")) {
      logDetails = "📜 Journal suppression";
      logState = "Suppressions et restaurations";
    }
    else if (logType === "protect" || pathname.includes("/protect")) {
      logDetails = "📜 Journal protection";
      logState = "Protections";
    }
    else if (logType === "block" || pathname.includes("/block")) {
      logDetails = "📜 Journal blocage";
      logState = "Blocages";
    }
    else if (logType === "rights" || pathname.includes("/rights")) {
      logDetails = "📜 Journal droits";
      logState = "Modifications droits";
    }
    else if (logType === "move" || pathname.includes("/move")) {
      logDetails = "📜 Journal déplacement";
      logState = "Renommages";
    }
    else if (logType === "import" || pathname.includes("/import")) {
      logDetails = "📜 Journal import";
      logState = "Importations";
    }
    else if (logType === "patrol" || pathname.includes("/patrol")) {
      logDetails = "📜 Journal patrouille";
      logState = "Pages patrouillées";
    }
    else if (logType === "abusefilter" || pathname.includes("/abusefilter")) {
      logDetails = "📜 Journal filtres";
      logState = "Filtres anti-abus";
    }
    else {
      const user = urlParams.get("user");
      const page = urlParams.get("page");
      if (user) logState = `Utilisateur: ${cleanTitle(user)}`;
      else if (page) logState = `Page: ${cleanTitle(page)}`;
      else logState = "Vue d'ensemble";
    }
    presenceData.details = logDetails;
    presenceData.state = logState;
    presenceData.smallImageKey = ActivityAssets.Admin;
  }

  // ===========================================
  // ÉDITION
  // ===========================================

  else if (action === "edit" || veaction === "edit") {
    const pageTitle = getPageTitle();
    const section = urlParams.get("section");
    presenceData.details = "✏️ Édite un article";
    presenceData.state = section ? `${pageTitle} (§${section})` : pageTitle;
    presenceData.smallImageKey = ActivityAssets.Edit;
  }

  // ===========================================
  // CONTRIBUTIONS
  // ===========================================

  else if (pathname.includes("Special:Contributions") || pathname.includes("Spécial:Contributions")) {
    const targetUser = getTargetUser();
    presenceData.details = "📝 Contributions";
    presenceData.state = targetUser !== "Inconnu" ? `de ${targetUser}` : "Sélection";
  }
  else if (pathname.includes("Special:DeletedContributions") || pathname.includes("Spécial:Contributions_supprimées")) {
    const targetUser = getTargetUser();
    presenceData.details = "🗑️ Contribs supprimées";
    presenceData.state = targetUser !== "Inconnu" ? `de ${targetUser}` : "Archives";
    presenceData.smallImageKey = ActivityAssets.Admin;
  }

  // ===========================================
  // AUTRES ACTIONS
  // ===========================================

  else if (action === "move" || pathname.includes("Special:MovePage") || pathname.includes("Spécial:Déplacer")) {
    const pageTitle = getPageTitle();
    presenceData.details = "➡️ Déplace une page";
    presenceData.state = pageTitle;
  }
  else if (action === "history") {
    const pageTitle = getPageTitle();
    presenceData.details = "📜 Historique";
    presenceData.state = pageTitle;
  }
  else if (action === "diff" || pathname.includes("Special:Diff")) {
    const pageTitle = getPageTitle();
    presenceData.details = "🔍 Comparaison";
    presenceData.state = pageTitle;
  }
  else if (pathname.includes("Special:Search") || pathname.includes("Spécial:Recherche")) {
    const searchQuery = urlParams.get("search") || "Recherche";
    presenceData.details = "🔎 Recherche";
    presenceData.state = `"${cleanTitle(searchQuery)}"`;
  }

  // ===========================================
  // PAGES SPÉCIALES MAINTENANCE
  // ===========================================

  else if (pathname.includes("Special:") || pathname.includes("Spécial:")) {
    const specialPage = pathname.split("/")[2] || "";
    if (specialPage.includes("Categories") || specialPage.includes("Catégories")) {
      presenceData.details = "📚 Liste catégories";
    }
    else if (specialPage.includes("Lonelypages") || specialPage.includes("Pages_orphelines")) {
      presenceData.details = "🔗 Pages orphelines";
      presenceData.smallImageKey = ActivityAssets.Patrol;
    }
    else if (specialPage.includes("Uncategorized") || specialPage.includes("Sans_catégorie")) {
      presenceData.details = "📋 Pages non catégorisées";
      presenceData.smallImageKey = ActivityAssets.Patrol;
    }
    else if (specialPage.includes("BrokenRedirects") || specialPage.includes("Redirections_cassées")) {
      presenceData.details = "🔗 Redirections cassées";
      presenceData.smallImageKey = ActivityAssets.Patrol;
    }
    else if (specialPage.includes("Listusers") || specialPage.includes("Utilisateurs")) {
      presenceData.details = "👥 Liste utilisateurs";
    }
    else if (specialPage.includes("Statistics") || specialPage.includes("Statistiques")) {
      presenceData.details = "📈 Statistiques";
      presenceData.state = `Vikidia (${language})`;
    }
    else {
      presenceData.details = "⚙️ Page spéciale";
      presenceData.state = cleanTitle(specialPage);
    }
  }

  // ===========================================
  // LECTURE D'ARTICLE
  // ===========================================

  else if (pathname.startsWith("/wiki/")) {
    const articleTitle = cleanTitle(pathname.replace("/wiki/", ""));
    if (articleTitle.startsWith("Catégorie:") || articleTitle.startsWith("Category:")) {
      const categoryName = articleTitle.split(":")[1] || "Inconnu";
      presenceData.details = "📁 Catégorie";
      presenceData.state = categoryName;
    }
    else if (articleTitle.startsWith("Portail:") || articleTitle.startsWith("Portal:")) {
      const portalName = articleTitle.split(":")[1] || "Inconnu";
      presenceData.details = "🌐 Portail";
      presenceData.state = portalName;
    }
    else if (articleTitle.startsWith("Vikidia:")) {
      const pageTitle = articleTitle.split(":")[1] || "Inconnu";
      presenceData.details = "📖 Page Vikidia";
      presenceData.state = pageTitle;
    }
    else if (articleTitle.startsWith("Utilisateur:") || articleTitle.startsWith("User:")) {
      const username = articleTitle.split(":")[1]?.split("/")[0] || "Inconnu";
      presenceData.details = "👤 Page utilisateur";
      presenceData.state = username;
    }
    else if (articleTitle.startsWith("Discussion:") || articleTitle.startsWith("Talk:")) {
      const discussionPage = articleTitle.split(":")[1] || "Inconnu";
      presenceData.details = "💬 Discussion";
      presenceData.state = discussionPage;
    }
    else if (articleTitle.startsWith("Modèle:") || articleTitle.startsWith("Template:")) {
      const templateName = articleTitle.split(":")[1] || "Inconnu";
      presenceData.details = "📄 Modèle";
      presenceData.state = templateName;
    }
    else {
      presenceData.details = "📖 Lit un article";
      presenceData.state = articleTitle;
      presenceData.buttons = [{ label: "Lire l'article", url: href }];
    }
  }

  // Page d'accueil
  else if (pathname === "/" || pathname === "/wiki/Vikidia:Accueil") {
    presenceData.details = "🏠 Page d'accueil";
    presenceData.state = `Vikidia (${language})`;
  }

  // Défaut
  else {
    presenceData.details = "🌍 Navigation";
    presenceData.state = `Vikidia (${language})`;
  }

  // Mise à jour de la présence
  if (presenceData.details) {
    presence.setActivity(presenceData);
  } else {
    presence.clearActivity();
  }
});

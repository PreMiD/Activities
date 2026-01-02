import { presence, activityAssets } from "./util/index.js";
import type { DealabsSettings, Resolver } from "./util/interfaces.js";

import dealResolver from "./sources/deal.js";
import discussionResolver from "./sources/discussion.js";
import groupResolver from "./sources/group.js";
import listingResolver from "./sources/listing.js";
import merchantResolver from "./sources/merchant.js";

const browsingTimestamp = Math.floor(Date.now() / 1000);

async function getStrings() {
  const fr = {
      navigating: "Navigue sur Dealabs",
      hunting: "Chasse les bons plans",
      viewDeal: "Regarde un bon plan",
      onDealabs: "Sur Dealabs",
      onForum: "Sur le forum",
      readDiscuss: "Lit une discussion",
      searchCode: "Cherche un code promo",
      viewCodes: "Voir les codes",
      browseDiscuss: "Parcourt les discussions",
      detail: "Détail",
      free: "GRATUIT",
      hiddenDeal: "Un bon plan",
      hiddenTopic: "Une discussion",
      viewPage: "Voir la page",
      exploreCat: "Explore une catégorie",
      homepage: "Sur la page d'accueil",
      forYou: "Pour vous",
      searchDeal: "Cherche un bon plan",
      newDeals: "Nouveaux deals 🕒",
      hotDeals: "Hot & Tendance 🔥",
      topDeals: "Les plus Hot 🌶️",
      searching: "Recherche",
      searchingEllipsis: "Recherche..."
  };

  const en = {
      navigating: "Browsing Dealabs",
      hunting: "Hunting for deals",
      viewDeal: "Viewing a deal",
      onDealabs: "On Dealabs",
      onForum: "On the Forum",
      readDiscuss: "Reading a discussion",
      searchCode: "Looking for a promo code",
      viewCodes: "View codes",
      browseDiscuss: "Browsing discussions",
      detail: "Detail",
      free: "FREE",
      hiddenDeal: "A deal",
      hiddenTopic: "A discussion",
      viewPage: "View page",
      exploreCat: "Browsing a category",
      homepage: "On the homepage",
      forYou: "For You",
      searchDeal: "Searching for a deal",
      newDeals: "New Deals 🕒",
      hotDeals: "Hot & Trending 🔥",
      topDeals: "Hottest Deals 🌶️",
      searching: "Searching",
      searchingEllipsis: "Searching..."
  };

  let lang = await presence.getSetting<string>("lang").catch(() => null);
  
  if (!lang) {
      lang = navigator.language.startsWith("fr") ? "fr" : "en";
  }

  return lang === "fr" ? fr : en;
}

presence.on("UpdateData", async () => {
  const settings: DealabsSettings = {
    privacyMode: await presence.getSetting("privacyMode"),
    hideDealTitles: await presence.getSetting("hideDealTitles"),
    hideDiscussionTitles: await presence.getSetting("hideDiscussionTitles"),
    hideImages: await presence.getSetting("hideImages"),
    hidePrices: await presence.getSetting("hidePrices"),
  };

  const strings = await getStrings();
  const t: any = strings; 
  const presenceData: PresenceData = {
    largeImageKey: activityAssets.logo,
    startTimestamp: browsingTimestamp,
    type: 3, // Watching
    details: strings?.navigating,
    state: strings?.hunting
  };

  const pathname = document.location.pathname;

  if (settings.privacyMode) {
     if (pathname.indexOf("/bons-plans/") !== -1 || pathname.indexOf("/codes-promo/") !== -1) {
         presenceData.details = strings?.viewDeal;
         presenceData.state = strings?.onDealabs;
     } else if (pathname.indexOf("/discussions/") !== -1 || pathname.indexOf("/groupe/") !== -1) {
         presenceData.details = strings?.onForum;
         presenceData.state = strings?.readDiscuss;
     } else {
         presenceData.details = strings?.navigating;
         presenceData.state = strings?.hunting;
     }
     presence.setActivity(presenceData);
     return;
  }

  const resolvers: Resolver[] = [
      merchantResolver,
      dealResolver,
      discussionResolver,
      groupResolver,
      listingResolver
  ];

  const activeResolver = resolvers.filter(r => r.isActive(pathname))[0];

  if (activeResolver) {
      const state = activeResolver.getState(t, settings);
      const details = activeResolver.getDetails(t, settings);
      
      if (state) presenceData.state = state;
      if (details) presenceData.details = details;

      if (!settings.hideImages && activeResolver.getLargeImage) {
          const img = activeResolver.getLargeImage();
          if (img) presenceData.largeImageKey = img;
      }

      if (activeResolver.getButtons) {
          presenceData.buttons = activeResolver.getButtons(t);
      }
      
      presenceData.smallImageKey = activityAssets.logo;
      presenceData.smallImageText = "Dealabs";
  }

  if (!presenceData.state || (typeof presenceData.state === 'string' && presenceData.state.length < 2)) {
      presenceData.state = strings?.hunting;
  }
  if (!presenceData.details || (typeof presenceData.details === 'string' && presenceData.details.length < 2)) {
      presenceData.details = strings?.onDealabs;
  }

  presence.setActivity(presenceData);
});
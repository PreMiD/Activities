import type { Resolver } from '../util/interfaces.js';
import { ActivityAssets, getText } from '../util/index.js';

const practiceResolver: Resolver = {
  isActive: (pathname) => pathname.includes('/practice'),

  getDetails: (t, doc) => {
    const activeTab = getText([
        '.game-details-tabs .cc-tab-item-active .cc-tab-item-label',
        '.game-details-tabs button[aria-selected="true"]'
    ]);
    
    if (activeTab) return activeTab;

    return t.practice_title;
  },

  getState: (t, doc) => {
    if (doc.location.pathname === '/practice') return t.menu;

    const mainTitle = getText(['h1.main-heading-title']);
    if (mainTitle) return mainTitle;

    const secondary = getText(['header.secondary-header-title', '.secondary-header-title']);
    
    if (secondary) {
        if (secondary.includes(':')) {
            return secondary.split(':')[1]?.trim();
        }
        return secondary;
    }

    return undefined;
  },

  getLargeImageKey: (t) => ActivityAssets.Logo,
  getSmallImageKey: (t) => ActivityAssets.Lessons,
  getSmallImageText: (t) => t.practice_title
};

export default practiceResolver;
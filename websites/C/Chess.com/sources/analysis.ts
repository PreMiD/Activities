import { ActivityType } from 'premid';
import type { Resolver } from '../util/interfaces.js';
import { ActivityAssets, getText, getPlayerData, formatMatch } from '../util/index.js';

const analysisResolver: Resolver = {
  isActive: (pathname) => pathname.includes('/analysis') || pathname.includes('/review'),

  getDetails: (t, doc) => {
    if (doc.location.pathname.includes('/review')) {
        return 'Game Review'; 
    }
    return t.media_analysis;
  },

  getState: (t, doc, displayFormat, hideRating) => {    
    const topNode = doc.querySelector('#player-top');
    const bottomNode = doc.querySelector('#player-bottom');

    const top = getPlayerData(topNode as ParentNode);
    const bottom = getPlayerData(bottomNode as ParentNode);

    if (bottom.name || top.name) {
         const state = formatMatch(top, bottom, displayFormat, hideRating);
         if (state) return state;
    }

    if (doc.location.pathname.includes('/review')) {
        const coachMsg = getText(['[data-cy="bot-speech-content-message"]', '.bot-speech-content-content-container']);
        if (coachMsg) {
            return coachMsg.length > 128 ? coachMsg.substring(0, 125) + '...' : coachMsg;
        }
    }

    const whiteStandard = getText(['.board-player-default-white .user-username-component']);
    const blackStandard = getText(['.board-player-default-black .user-username-component']);
    
    if (whiteStandard && blackStandard) {
        return `${whiteStandard} vs ${blackStandard}`;
    }

    return undefined;
  },

  getType: () => ActivityType.Watching,
  getButtons: (t, doc) => {
    const href = doc.location?.href;
    if (!href) return undefined;
    const cleanUrl = href.split('?')[0] || href;
    return [{ label: 'View Game', url: cleanUrl }];
  },
  
  getLargeImageKey: (t) => ActivityAssets.Logo,
  getSmallImageKey: (t) => ActivityAssets.Analysis,
  getSmallImageText: (t, doc) => {
      if (doc.location.pathname.includes('/review')) return 'Game Review';
      return t.media_analysis;
  }
};

export default analysisResolver;
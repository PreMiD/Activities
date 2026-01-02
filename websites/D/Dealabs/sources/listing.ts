import type { Resolver, DealabsSettings } from "../util/interfaces.js";

const listingResolver: Resolver = {
    isActive: (pathname: string) => {
        return pathname === "/" 
            || pathname === "/pour-vous"
            || pathname.includes("/nouveaux")
            || pathname.includes("/hot")
            || pathname.includes("/tendance")
            || pathname.includes("/top")
            || pathname.includes("/search");
    },

    getState: (t: any, settings: DealabsSettings) => {
        const path = document.location.pathname;
        if (path === "/" || path === "/pour-vous") return t.forYou;
        if (path.includes("/nouveaux")) return t.newDeals;
        if (path.includes("/top")) return t.topDeals;
        if (path.includes("/hot") || path.includes("/tendance")) return t.hotDeals;
        
        if (path.includes("/search")) {
            const urlParams = new URLSearchParams(document.location.search);
            const q = urlParams.get("q");
            return (q && !settings.hideDealTitles) ? `"${q}"` : t.searchingEllipsis;
        }
        return t.hunting;
    },

    getDetails: (t: any) => {
        const path = document.location.pathname;
        if (path === "/" || path === "/pour-vous") return t.homepage;
        if (path.includes("/search")) return t.searching;
        return t.searchDeal;
    }
};

export default listingResolver;
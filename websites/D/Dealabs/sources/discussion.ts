import type { Resolver, DealabsSettings, ButtonArray } from "../util/interfaces.js";

const discussionResolver: Resolver = {
    isActive: (pathname: string) => {
        return pathname === "/discussions" || pathname.includes("/discussions/");
    },

    getState: (t: any, settings: DealabsSettings) => {
        if (document.location.pathname === "/discussions") return t.browseDiscuss;
        
        if (settings.hideDiscussionTitles) return t.hiddenTopic;

        const h1 = document.querySelector("h1")?.textContent?.trim();
        if (h1) return h1;
        
        const metaTitle = document.querySelector('meta[property="og:title"]')?.getAttribute("content");
        return metaTitle ? ((metaTitle.split(" - Dealabs")[0] ?? metaTitle).trim()) : t.detail;
    },

    getDetails: (t: any) => {
        if (document.location.pathname === "/discussions") return t.onForum;
        return t.readDiscuss;
    },
    
    getButtons: (t: any) => {
        if (document.location.pathname === "/discussions") return undefined;
        return [{ label: t.viewPage, url: document.location.href }] as ButtonArray;
    }
};

export default discussionResolver;
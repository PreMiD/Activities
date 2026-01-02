export const presence = new Presence({
  clientId: "1456698196767277128"
});

export const activityAssets = {
  logo: "https://www.dealabs.com/assets/img/appicon_cbea2.png"
};

export function formatSlug(slug: string | undefined): string {
    if (!slug) return "Dealabs";
    return slug
      .replace(/-/g, " ")
      .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
}

export function getMainContent(): Element {
    return document.querySelector(".js-thread-detail") 
        || document.querySelector(".listLayout-threadItem") 
        || document.body;
}
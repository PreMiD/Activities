const presence = new Presence({
    clientId: "878203434468245545"
  }),
  browsingStamp = Math.floor(Date.now() / 1000);

let data: {
  writing: boolean;
  details: string;
  smallImageKey: string;
} = null;

presence.on(
  "iFrameData",
  async (recievedData: {
    writing: boolean;
    details: string;
    smallImageKey: string;
  }) => {
    data = recievedData;
  }
);

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "logo",
    startTimestamp: browsingStamp
  },
    { pathname, href, hash, search } = location,
    buttons: boolean = await presence.getSetting("buttons"),
    searchBarVisible = !!document.querySelector("ul.search-main-menu.active");

  if (searchBarVisible) {
    const searchBar = document.querySelector<HTMLInputElement>(
      "input.manga-search-field.ui-autocomplete-input"
    );
    presenceData.details = "Searching";
    if (searchBar && searchBar.value) presenceData.state = searchBar.value;
    presenceData.smallImageText = presenceData.smallImageKey = "search";
  } else if (pathname === "/") {
    if (search) {
      const results = document.querySelector<HTMLHeadingElement>("h1.h4");
      presenceData.details = "Looking at";
      if (results) presenceData.state = results.textContent;
      presenceData.smallImageText = presenceData.smallImageKey = "search";
    } else presenceData.details = "At homepage";
  } else if (pathname === "/manga/" || pathname.startsWith("/manga-genre/")) {
    const order = document.querySelector<HTMLLIElement>(
      "div.c-nav-tabs > ul > li.active"
    ),
      category = document.querySelector<HTMLHeadingElement>("h1.item-title.h4");
    presenceData.details = `Looking for ${
      pathname.startsWith("/manga-genre") && category
        ? category.textContent
        : ""
    } Mangas`;
    if (order) presenceData.state = `Ordered By ${order.textContent}`;
    presenceData.smallImageText = presenceData.smallImageKey = "looking";
  } else if (pathname.startsWith("/manga/")) {
    const title = document.querySelector<HTMLHeadingElement>(
      "div.post-title > h1"
    ),
      chapterHeading =
        document.querySelector<HTMLHeadingElement>("h1#chapter-heading");
    if (chapterHeading) {
      const [title, chapter] = chapterHeading.textContent.split("-");
      presenceData.details = `Reading ${title}`;
      if (data && data.writing) {
        presenceData.state = data.details;
        presenceData.smallImageText = presenceData.smallImageKey =
          data.smallImageKey;
      } else {
        presenceData.state = chapter;
        presenceData.smallImageText = presenceData.smallImageKey = "reading";
      }
      if (buttons) {
        presenceData.buttons = [
          { label: "Read Manga", url: href },
          {
            label: "Check Summary",
            url: href.substring(0, href.lastIndexOf("chapter"))
          }
        ];
      }
    } else {
      if (hash) {
        presenceData.details = title.textContent;
        if (data && data.writing) {
          presenceData.state = data.details;
          presenceData.smallImageText = presenceData.smallImageKey =
            data.smallImageKey;
        } else {
          presenceData.state = "Reading Commments";
          presenceData.smallImageText = presenceData.smallImageKey = "reading";
        }
        if (buttons)
          presenceData.buttons = [{ label: "See Comments", url: href }];
      } else {
        presenceData.details = "Checking Summary";
        if (title) presenceData.state = title.textContent;
        if (buttons)
          presenceData.buttons = [{ label: "Check Summary", url: href }];
      }
    }
  } else if(pathname.startsWith("/user-settings/")) {
    const tab = document.querySelector<HTMLLIElement>("li.active");
    presenceData.details = "Viewing User Settings";
    if (tab) presenceData.state = tab.textContent;
  } else if (pathname === "/legal-disclaimer/")
    presenceData.details = "Legal Disclaimer";
  else if (pathname === "/privacy-policy/")
    presenceData.details = "Privacy Policy";
  else if (pathname === "/about-us/")
    presenceData.details = "About Us";
  else if (pathname === "/contact/")
    presenceData.details = "Contact Us";

  if (!presenceData.details) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});

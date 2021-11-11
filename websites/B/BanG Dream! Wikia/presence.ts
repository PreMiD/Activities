const presence = new Presence({
  clientId: "651145049811451924"
});
presence.on("UpdateData", async () => {
  if (document.location.pathname.startsWith("/wiki/")) {
    const [page] = document.getElementsByClassName("page-header__title");
    let pageText;
    if (!page) pageText = "Unknown Page";
    else pageText = page.textContent;

    presence.setActivity({
      details: "Viewing a page...",
      state: pageText,
      largeImageKey: "logo"
    });
  }
});

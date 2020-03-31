/// @todo maybe support all the languages soon
var presence = new Presence({
  clientId: "638565041154555913",
});
presence.on("UpdateData", async () => {
  if (document.location.pathname.startsWith("/wiki/")) {
    let page = "N/A";
    try {
      page = document.getElementsByClassName("page-header__title")[0]
        .textContent;
    } finally {
    }
    let presenceData = {
      details: "Viewing a page...",
      state: page,
      largeImageKey: "logo",
    };
    presence.setActivity(presenceData);
  }
});

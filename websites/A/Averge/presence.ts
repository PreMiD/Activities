const presence1 = new Presence({
  clientId: "1328861612735598664", // Deine Client ID
}), browsingTimestamp1 = Math.floor(Date.now() / 1000);

presence1.on("UpdateData", () => {
  const presenceData: PresenceData = {
    startTimestamp: browsingTimestamp1,
    largeImageKey: "averge-eu-logo", // Dein Image-Key im PreMiD-Dashboard
  };

  const path = window.location.pathname.toLowerCase();

  if (window.location.href.startsWith("https://averge.eu")) {
    switch (path) {
      case "/":
        presenceData.details = "Durchstöbert die Startseite";
        presenceData.state = "Homepage";
        break;
      case "/about":
        presenceData.details = "Liest Über Uns";
        presenceData.state = "Erfährt mehr über das Projekt";
        break;
      case "/kontakt":
        presenceData.details = "Betrachtet die Kontaktseite";
        presenceData.state = "Bereitet eine Nachricht vor";
        break;
      case "/projektserver":
        presenceData.details = "Schaut sich den Projektserver an";
        presenceData.state = "Informiert sich";
        break;
      default:
        if (path.includes("/404"))
          presenceData.details = "Hat eine ungültige Seite gefunden";
          presenceData.state = "404 - Seite nicht gefunden";
        else
          presenceData.details = "Erforscht die Webseite";
          presenceData.state = "Stöbert durch Inhalte";
        break;
    }
  } else {
    presenceData.details = "Surft auf einer anderen Seite";
    presenceData.state = "Unbekannte Seite";
  }

  if (presenceData.details)
    presence1.setActivity(presenceData);
  else
    presence1.clearActivity();
});

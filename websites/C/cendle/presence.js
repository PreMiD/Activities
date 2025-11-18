const presence = new Presence({
  clientId: ""
});

presence.on("UpdateData", async () => {
  const url = document.location.href;

  let details = "Cendle.pl";
  let state = "Codzienna gra o zgadywaniu cen";

  if (url.includes("mode=guess")) {
    details = "Zgadnij cenę";
    state = "Próbuje zgadnąć dzisiejszy produkt";
  } else if (url.includes("mode=promo")) {
    details = "Promocja czy nie?";
    state = "Sprawdza czy produkt jest w promocji";
  } else if (url.includes("mode=compare")) {
    details = "Który produkt droższy?";
    state = "Porównuje ceny";
  } else if (url.includes("mode=sum")) {
    details = "Ile razem?";
    state = "Liczy wartość koszyka";
  }

  presence.setActivity({
    details,
    state,
    largeImageKey: "icon",
    startTimestamp: Date.now()
  });
});

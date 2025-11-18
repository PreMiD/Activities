import { Activity, PresenceData } from "@types/premid";

export default class CendleActivity extends Activity {
  async onUrl(url: URL): Promise<PresenceData | null> {
    let details = "Cendle.pl";
    let state = "Codzienna gra o zgadywaniu cen";

    const mode = url.searchParams.get("mode");

    if (mode === "guess") {
      details = "Zgadnij cenę";
      state = "Próbuje zgadnąć produkt";
    } else if (mode === "promo") {
      details = "Promocja czy nie";
      state = "Sprawdza promocję";
    } else if (mode === "compare") {
      details = "Który produkt droższy?";
      state = "Porównuje ceny";
    } else if (mode === "sum") {
      details = "Ile razem?";
      state = "Liczy wartość koszyka";
    }

    return {
      details,
      state,
      largeImageKey: "icon"
    };
  }
}

import type { PresenceData } from '@types/premid';
import { Activity } from '@types/premid';

export default class CendleActivity extends Activity {
  override async onUrl(url: URL): Promise<PresenceData | null> {
    const mode = url.searchParams.get('mode');

    let details = 'Cendle.pl';
    let state = 'Codzienna gra o zgadywaniu cen';

    switch (mode) {
      case 'guess':
        details = 'Zgadnij cenę';
        state = 'Próbuje zgadnąć produkt';
        break;

      case 'promo':
        details = 'Promocja czy nie';
        state = 'Sprawdza promocję';
        break;

      case 'compare':
        details = 'Który produkt droższy?';
        state = 'Porównuje ceny';
        break;

      case 'sum':
        details = 'Ile razem?';
        state = 'Liczy wartość koszyka';
        break;

      default:
        break;
    }

    return {
      details,
      state,
      largeImageKey: 'icon',
    };
  }
}

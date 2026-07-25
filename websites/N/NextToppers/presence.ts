// Import directly from the premid package
import { ActivityType } from 'premid';

const presence = new Presence({
  clientId: '1527271319954001940' // Replace with your actual Client ID!
});

const browsingTimestamp = Math.floor(Date.now() / 1000);
const logoUrl = 'https://play-lh.googleusercontent.com/QXszaiUECWDTaY9IMT-Ligsh8xcRRjyTXefomzW98SM5aftooi0KOv_7O0uzem8cYhyFWBiGpIrfC_zDddbz2g'; // Your image URL

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    // This will now resolve perfectly using PreMiD's official enum!
    type: ActivityType.Watching, 
    details: 'Next Toppers',
    state: 'Attending class',
    startTimestamp: browsingTimestamp,
    largeImageKey: logoUrl,        
    largeImageText: 'Next Toppers' 
  };

  presence.setActivity(presenceData);
});
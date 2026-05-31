import { ActivityType, Presence, PresenceData, getTimestamps } from 'premid';

const presence = new Presence({
  clientId: '1510631384161452142'
});

let browsingTimestamp: number = Math.floor(Date.now() / 1000);
let watchingTimestamp: number = Math.floor(Date.now() / 1000);
let wasWatching: boolean = false;

enum ActivityAssets {
  Logo = 'https://i.imgur.com/D85p25p.png'
}

presence.on('UpdateData', async () => {
  const showTimestamp = await presence.getSetting<boolean>('showTimestamp');
  const showDetails = await presence.getSetting<boolean>('showDetails');
  const currentTitle: string = document.title;

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    largeImageText: 'Oneplay'
  };

  if (currentTitle && currentTitle.includes('| Oneplay') && !currentTitle.startsWith('Hlavní') && !currentTitle.startsWith('Home')) {
    if (!wasWatching) {
      watchingTimestamp = Math.floor(Date.now() / 1000);
      wasWatching = true;
    }
    
    const cleanTitle: string = currentTitle.split('|')[0].trim();
    presenceData.type = ActivityType.Watching; 

    if (showDetails) {
      presenceData.details = cleanTitle;
      presenceData.state = 'Sleduje pořad';
    } else {
      presenceData.details = 'Sleduje Oneplay';
    }

    if (showTimestamp) {
      const video = document.querySelector<HTMLVideoElement>('video');
      const isLiveStream = !!document.querySelector('[class*="live"], [class*="stream"], [class*="zive"]');

      if (video && !isLiveStream && isFinite(video.duration)) {
        [presenceData.startTimestamp, presenceData.endTimestamp] = getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration)
        );

        if (video.paused) {
          delete presenceData.startTimestamp;
          delete presenceData.endTimestamp;
        }
      } else {
        presenceData.startTimestamp = watchingTimestamp;
      }
    }
  } else {
    if (wasWatching) {
      browsingTimestamp = Math.floor(Date.now() / 1000);
      wasWatching = false;
    }
    
    presenceData.details = 'Prohlíží nabídku';
    
    if (showTimestamp) {
      presenceData.startTimestamp = browsingTimestamp;
    }
  }

  if (presenceData.details) {
    presence.setActivity(presenceData);
  } else {
    presence.clearActivity();
  }
});
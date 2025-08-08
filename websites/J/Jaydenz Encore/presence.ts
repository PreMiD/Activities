const presence = new Presence({
  clientId: "1392106746906153073"
});

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://jaydenzkoci.github.io/assets/images/logo.png',
  };
  
  const showButtons = await presence.getSetting('useButtons');
  const showDetails = await presence.getSetting('useDetails');
  const showTime = await presence.getSetting('useTime');

  let secondaryButton: ButtonData | undefined = undefined;
  const searchInputEl = document.getElementById('searchInput') as HTMLInputElement;

  if (document.body.classList.contains('video-popup-open')) {
    const videoTitle = document.getElementById('videoTrackTitle')?.textContent;
    const videoCover = document.getElementById('videoTrackCover') as HTMLImageElement;
    
    presenceData.details = `Watching: ${videoTitle || 'A video'}`;
    
    if (showDetails) {
      const videoArtist = document.getElementById('videoTrackArtist')?.textContent;
      const songInfo = document.getElementById('videoTrackDuration')?.textContent;
      presenceData.state = `${videoArtist || 'an artist'} | ${songInfo || ''}`;
    }
    
    if (videoCover?.src) {
      presenceData.largeImageKey = videoCover.src;
    }

    const player = (window as any).player;
    if (showTime && player && typeof player.getCurrentTime === 'function') {
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      
      if (duration > 0) {
        presenceData.startTimestamp = Date.now() - (currentTime * 1000);
        presenceData.endTimestamp = presenceData.startTimestamp + (duration * 1000);
      }
    }
    const videoUrl = (window as any).player?.getVideoUrl ? (window as any).player.getVideoUrl() : null;
    if (videoUrl) {
      secondaryButton = { label: 'Watch Video', url: videoUrl };
    }
  } 
  else if (document.body.classList.contains('modal-open')) {
    const modalTitleEl = document.getElementById('modalTitle')?.textContent;
    const modalCover = document.getElementById('modalCover') as HTMLImageElement;
    
    presenceData.details = modalTitleEl || 'A track';

    if (showDetails) {
      const modalArtistEl = document.getElementById('modalArtist')?.textContent;
      const songInfo = document.getElementById('modalDuration')?.textContent;
      presenceData.state = `${modalArtistEl || 'an artist'} | ${songInfo || ''}`;
    }

    if (modalCover?.src) {
      presenceData.largeImageKey = modalCover.src;
    }

    const modalElement = document.getElementById('trackModal');
    const previewUrl = modalElement?.getAttribute('data-preview-url');
    if (previewUrl) {
      secondaryButton = { label: 'Listen to Preview', url: previewUrl };
    }
  } 
  else {
    if (searchInputEl?.value) {
      presenceData.details = "Searching for a track...";
      presenceData.state = `Query: "${searchInputEl.value}"`;
    } else {
      presenceData.details = "Browse Tracks";
      const trackCountEl = document.getElementById('trackCount');
      const trackCountText = trackCountEl?.textContent || '';
      const trackCount = trackCountText.match(/\d+/) || [0];
      presenceData.state = `Searching ${trackCount[0]} Tracks`;
    }
  }
  
  if (showButtons) {
    const baseButton: ButtonData = { label: 'View Website', url: 'https://jaydenzkoci.github.io/' };
    
    if (secondaryButton) {
      presenceData.buttons = [baseButton, secondaryButton];
    } else {
      presenceData.buttons = [baseButton];
    }
  }
  
  presence.setActivity(presenceData);
});
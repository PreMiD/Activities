const iframe = new iFrame();

iframe.on("UpdateData", () => {
  const video = document.querySelector("video");
  
  if (video && video.readyState >= 2 && !isNaN(video.duration) && video.duration > 0) {
    iframe.send({
      hasVideo: true,
      paused: video.paused,
      currentTime: video.currentTime,
      duration: video.duration
    });
  } else {
    iframe.send({ hasVideo: false });
  }
});
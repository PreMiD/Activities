const iframe = new iFrame();

iframe.on("UpdateData", () => {
  const video = document.querySelector<HTMLVideoElement>(
    "#vjs_video_1_html5_api"
  );
  if (video) {
    if (!isNaN(video.duration)) {
      iframe.send({
        iFrameVideo: true,
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused
      });
    }
  }
});

const iframe = new iFrame();

iframe.on("UpdateData", async () => {
  const video = document.querySelector("video");
  
  if (video && !isNaN(video.duration)) {
    iframe.send({
      iFrameVideoData: {
        currTime: video.currentTime,
        dur: video.duration,
        paused: video.paused
      }
    });
  }
});
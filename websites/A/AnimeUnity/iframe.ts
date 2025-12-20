// iframe.ts
const iframe = new iFrame();

iframe.on("UpdateData", async () => {
  const video = document.querySelector<HTMLVideoElement>("video");

  if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
    iframe.send({ video: null });
    return;
  }

  iframe.send({
    video: {
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused
    }
  });
});

const iframe = new iFrame();

setInterval(function () {
  if (document.location.hostname === "static.crunchyroll.com") {
    const video: HTMLVideoElement =
      document.querySelector("#player0") !== null
        ? document.querySelector("#player0")
        : document.querySelector("#player_html5_api");

    if (video !== undefined && !isNaN(video.duration)) {
      iframe.send({
        iFrameVideoData: {
          iFrameVideo: true,
          currentTime: video.currentTime,
          duration: video.duration,
          paused: video.paused
        }
      });
    }
  }
}, 100);

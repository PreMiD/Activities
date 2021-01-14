// Note: Domain not restricted because cytube allows custom urls and a boatload of supported services

const iframe = new iFrame();

let sendback: {
  audio: boolean;
  current_time: number;
  duration: number;
  paused: boolean;
  site: string;
};

function send(): void {
  iframe.send(sendback);
}

iframe.on("UpdateData", () => {
  const link = document.location;

  if (document.getElementsByTagName("video").length != 0) {
    const video: HTMLVideoElement = document.getElementsByTagName("video")[0];
    sendback = {
      audio: false,
      current_time: video.currentTime,
      duration: video.duration,
      paused: video.paused,
      site: link.href
    };
  }
  send();
});

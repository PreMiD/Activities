// iframe.ts
const iframe = new iFrame();

iframe.on("UpdateData", async () => {
  // Пытаемся найти видео элемент
  const video = document.querySelector("video");

  if (video && !isNaN(video.duration)) {
    // Отправляем данные "наверх" в основной скрипт
    iframe.send({
      duration: video.duration,
      currentTime: video.currentTime,
      paused: video.paused,
      // Можно попробовать найти название серии внутри плеера (Kodik иногда пишет его в .serial-info)
      // Но пока надежнее только время
    });
  }
});

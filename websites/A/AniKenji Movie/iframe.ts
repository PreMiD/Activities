const iframe = new iFrame()
iframe.on('UpdateData', async () => {
  let video: HTMLVideoElement | null = null
  // Tìm kiếm thẻ video theo nhiều selector khác nhau
  // Danh sách selector cho các player phổ biến
  const videoSelectors = [
    '#dogevideo_html5_api',
    '#video-player',
    '#player_container > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    '#vplayer > div > div.container.pointer-enabled > video',
    '#player > div > div.container.pointer-enabled > video',
    '#mediaplayer > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    '#vid_html5_api',
    '#myElement > div.jw-media.jw-reset > video',
    '#videojs_html5_api',
    '#myVideo > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    '#mgvideo_html5_api',
    '#player > div.jw-media.jw-reset > video',
    '#vstr > div.jw-wrapper.jw-reset > div.jw-media.jw-reset > video',
    'player-style-2',
    'streaming-sv',
    'embed',
    'm3u8',
    '.jw-video', // JW Player general class
    '#jwplayer > div.jw-wrapper > div.jw-media > video',
    '.jw-video.jw-reset',
    '.vjs-tech', // Video.js general class
    '.vp-video', // Vimeo
    // Vimeo specific selectors từ Presence.ts
    '.vp-video-wrapper .vp-video video',

    // Vimeo specific selectors hiện tại
    '.vimeo-video',
    '.vimeo-player video',
    'iframe.vimeo iframe video',

    // Youtube Stream

    '.video-stream', // Youtube Embed

    // Selector Vimeo bổ sung
    '.player-container .vp-video video',
    '.player .vp-video video',
    '.vimeo-player .vp-video video',
    '[data-player-type="vimeo"] .vp-video video',
    '[data-vimeo] video',
    '[data-vimeo-url] video',
    '.vimeo_player video',
    '.vimeo-embed video',
    'video', // Bất kỳ thẻ video nào
  ]
  // Thêm các selector cho các player phổ biến khác
  const additionalSelectors = [
    // HLS Player
    '.hls-player video',
    // Plyr
    '.plyr video',
    '.plyr__video-wrapper video',
    // Shaka Player
    '#shaka-player video',
    // Flowplayer
    '.flowplayer video',
    // Bitmovin Player
    '.bmpui-video-element',
    // Custom player selectors from common Vietnamese streaming sites
    '#playerDisplay video',
    '#player-holder video',
    '#media-player video',
    '.embed-responsive video',
    '.video-container video',
  ]
  // Gộp tất cả selector
  const allSelectors = [...videoSelectors, ...additionalSelectors]
  // Tìm video đầu tiên phù hợp với một trong các selector
  for (const selector of allSelectors) {
    const videoElement = document.querySelector<HTMLVideoElement>(selector)
    if (videoElement) {
      video = videoElement
      break
    }
  }
  // Nếu không tìm thấy bằng selector, tìm tất cả thẻ video trong iframe
  if (!video) {
    const allVideos = document.querySelectorAll('video')
    if (allVideos.length > 0) {
      // Lấy video đầu tiên được tìm thấy
      video = allVideos[0] as HTMLVideoElement
    }
  }
  // Kiểm tra nếu tìm thấy video và có thể truy cập thông tin của nó
  if (video && !Number.isNaN(video.duration)) {
    try {
      iframe.send({
        iframeVideo: {
          iFrameVideo: true,
          currTime: video.currentTime,
          dur: video.duration,
          paused: video.paused,
        },
      })
    }
    catch (e) {
      console.error('Lỗi khi gửi dữ liệu iframe:', e)
    }
  }
  else {
    // Kiểm tra xem iframe đã load xong chưa
    if (document.readyState === 'complete') {
      // Nếu không tìm thấy video, gửi thông tin rằng không có video
      iframe.send({
        iframeVideo: {
          iFrameVideo: false,
          currTime: 0,
          dur: 0,
          paused: true,
        },
      })
    }
  }
  // Thêm event listener cho video nếu tìm thấy
  if (video) {
    // Chỉ thêm event listener nếu chưa có
    if (!video.hasAttribute('data-premid-monitored')) {
      video.setAttribute('data-premid-monitored', 'true')
      // Theo dõi các sự kiện phát lại
      video.addEventListener('play', () => {
        iframe.send({
          iframeVideo: {
            iFrameVideo: true,
            currTime: video!.currentTime,
            dur: video!.duration,
            paused: false,
          },
        })
      })
      video.addEventListener('pause', () => {
        iframe.send({
          iframeVideo: {
            iFrameVideo: true,
            currTime: video!.currentTime,
            dur: video!.duration,
            paused: true,
          },
        })
      })
      video.addEventListener('timeupdate', () => {
        // Chỉ gửi cập nhật mỗi giây để tránh quá nhiều tin nhắn
        if (Math.floor(video!.currentTime) % 5 === 0) {
          iframe.send({
            iframeVideo: {
              iFrameVideo: true,
              currTime: video!.currentTime,
              dur: video!.duration,
              paused: video!.paused,
            },
          })
        }
      })
    }
  }
})

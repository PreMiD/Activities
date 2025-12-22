(function(){
  function safePost(info: any){ try{ window.parent.postMessage({ premid_embed: info }, '*') }catch(e){} }

  let lastSent: any = null

  function sanitizeImage(url: string | null){
    if (!url) return null
    try{
      url = String(url)
      if (/^data:/i.test(url)) return null
      if (/^https?:\/\//i.test(url)) return url
    }catch(e){}
    return null
  }

  function read(){
    try{
      const v = document.querySelector('video') as HTMLVideoElement | null
      const info: any = {
        title: document.title || 'Video Player',
        episode: null,
        image: null,
        duration: 0,
        currentTime: 0,
        isPlaying: false,
      }
      if (v){
        info.duration = Number.isFinite(v.duration) ? v.duration : 0
        info.currentTime = Number.isFinite(v.currentTime) ? v.currentTime : 0
        info.isPlaying = !v.paused
      }

      const imgEl = document.querySelector('img') as HTMLImageElement | null
      if (imgEl && imgEl.src) info.image = sanitizeImage(imgEl.src)

      info.currentTime = Math.round((info.currentTime || 0) * 10) / 10

      let send = false
      if (!lastSent) send = true
      else if (info.isPlaying !== lastSent.isPlaying) send = true
      else if (Math.abs((info.currentTime || 0) - (lastSent.currentTime || 0)) >= 1) send = true
      else if ((info.duration || 0) !== (lastSent.duration || 0)) send = true
      else if ((info.image || null) !== (lastSent.image || null)) send = true
      else if ((info.title || '') !== (lastSent.title || '')) send = true

      if (send){
        safePost(info)
        lastSent = info
        try{ console.debug && console.debug('iframe -> parent', info) }catch(e){}
      }
    }catch(e){
      try{ console.error && console.error('iframe read error', e) }catch(_){}
    }
  }

  setTimeout(read, 400)
  try{
    const v = document.querySelector('video') as HTMLVideoElement | null
    if (v){
      v.addEventListener('play', read)
      v.addEventListener('pause', read)
      v.addEventListener('seeking', read)
      v.addEventListener('seeked', read)
      v.addEventListener('timeupdate', ()=>{ if (v && (Math.round(v.currentTime) % 2 === 0)) read() })
    }
  }catch(e){/* ignore */}
  setInterval(read, 2500)
})();

// วางท้าย <script> หลักของ online.html (ที่เดียวกับที่ประกาศ let room, view และ let G) — 1 statement
setInterval(()=>{try{document.documentElement.dataset.ktp=JSON.stringify({online:true,view,room:room?.name||"",title:room?.song?.title||"",players:view==="game"&&G?G.players.length:(room?.players?.length||0),max:MAX_PLAYERS})}catch(e){}},1000);

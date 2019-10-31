let presence = new Presence({
    clientId: "628269030901547037"
});

const pages = {
    "/": "Ana Sayfa",
    "/haber": "Haberler",
    "/video": "Videolar",
    "/en-cok-okunanlar": "En Çok Okunan Gönderiler",
    "/en-cok-paylasilanlar": "En Çok Paylaşılan Gönderiler",
    "/en-cok-izlenenler": "En Çok İzlenilen Videolar",
    "/ara": "Bir şeyler arıyor...",
    "/uye/favorilerim": "Favorilerim",
    "/hakkimizda": "Hakkımızda",
    "/yazarlar": "Yazarlar",
    "/odullerimiz": "Ödüllerimiz",
    "/kunye": "Künye",
    "/gizlilik": "Gizlilik",
    "/iletisim": "İletişim"
},
    smallImageKey = {
        "/ara": "searching",
        "/video": "video",
        "/uye/favorilerim": "star"
    }

presence.on("UpdateData", async () => {
    let postCreated, author,
        data: { [k: string]: any } = {
            largeImageKey: "wt-logo",
            startTimestamp: Math.floor(Date.now() / 1000)
        },
        title = document.querySelector("body > div.wt-container > div.global-container.container > div.content > div.news.content-detail-page > article > div.content-title > h1") as HTMLElement,
        videoTitle = document.querySelector("body > div.wt-container > div.video-showcase > div > div.video-showcase__content__title > h1") as HTMLElement;


    if (title && title.innerHTML != "") {
        postCreated = document.querySelector("body > div.wt-container > div.global-container.container > div.content > div.news.content-detail-page > article > div.content-info.clearfix > div.content-author > time") ? document.querySelector("body > div.wt-container > div.global-container.container > div.content > div.news.content-detail-page > article > div.content-info.clearfix > div.content-author > time").innerHTML : null;
        author = document.querySelector("body > div.wt-container > div.global-container.container > div.content > div.news.content-detail-page > article > div.content-info.clearfix > div.content-author > span:nth-child(1) > a") ? document.querySelector("body > div.wt-container > div.global-container.container > div.content > div.news.content-detail-page > article > div.content-info.clearfix > div.content-author > span:nth-child(1) > a").innerHTML : null;

        data.details = `${title.innerHTML} gönderisini okuyor`
        data.state = `${postCreated ? postCreated + " - " : ""}${author ? author : ""}`
        data.smallImageKey = "post";
        data.smallImageText = "Bir gönderi okuyor..."

        presence.setActivity(data);
    } else if (!title && videoTitle && videoTitle.innerHTML != "") {
        postCreated = document.querySelector("body > div.wt-container > div.global-container.container > div.content > article > div.content-info > time") ? document.querySelector("body > div.wt-container > div.global-container.container > div.content > article > div.content-info > time").innerHTML : null;
        author = document.querySelector("body > div.wt-container > div.global-container.container > div.content > article > div.content-info > span:nth-child(1) > a") ? document.querySelector("body > div.wt-container > div.global-container.container > div.content > article > div.content-info > span:nth-child(1) > a").innerHTML : null;

        data.details = `${videoTitle.innerHTML} videosunu izliyor`
        data.state = `${postCreated ? postCreated + " - " : ""}${author ? author : ""}`
        data.smallImageKey = "video";
        data.smallImageText = "Bir video izliyor..."

        presence.setActivity(data);
    } else {
        data.details = "Geziniyor...";
        data.state = pages[document.location.pathname] || pages[document.location.pathname.slice(0, -1)] ? pages[document.location.pathname] || pages[document.location.pathname.slice(0, 1)] : "Ana Sayfa"
        smallImageKey[document.location.pathname] ? data.smallImageKey = smallImageKey[document.location.pathname] : "";

        presence.setActivity(data);
    }
});
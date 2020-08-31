const presence = new Presence({
    clientId: "749319733807153162"
});
presence.on("UpdateData", () => {
    const presenceData: PresenceData = {
        largeImageKey: "logo"
    };
  
    const browsingStamp = Math.floor(Date.now() / 1000);
    presenceData.startTimestamp = browsingStamp;
    //idk how to combine/merge consts in ts, so i just replaced pages with "window.location.pathname" shame on me :( and ik, its pathetic
    if (window.location.pathname.startsWith("/kullanici/")) {
        presenceData.details = "Bir kullanıcının profilini görüntülüyor:";
        presenceData.state = document.querySelector("body > div:nth-child(6) > div > h3").textContent;
    } else if (window.location.pathname.startsWith("/hakkimizda")) {
        presenceData.details = "Bir sayfayı görüntülüyor:";
        presenceData.state = "Hakkımızda";
    } else if (window.location.pathname.startsWith("/javascript")) {
        presenceData.details = "Bir sayfayı görüntülüyor:";
        presenceData.state = "JS Komutlar";
        presenceData.smallImageKey = "js"
    } else if (window.location.pathname.startsWith("/kod")) {
        presenceData.details = "Bir kodu görüntülüyor:";
        presenceData.state = document.querySelector("body > div.post.post-single > div.post-thumbnail > center > h1").textContent;
    } else if (window.location.pathname.startsWith("/html")) {
        presenceData.details = "Bir sayfayı görüntülüyor:";
        presenceData.state = "HTML kodları";
        presenceData.smallImageKey = "html";
    } else if (window.location.pathname.endsWith("/rapor")) {
        presenceData.details = "Bir şeyi bildiriyor...";
    } else if (window.location.pathname.endsWith("/yetersiz-rol")) {
        presenceData.details = "Erişemeyeceği bir yere erişmeye çalışıyor... 👀";
        presenceData.smallImageKey = "x";
    } else if (window.location.pathname.startsWith("/altyapi")) {
        presenceData.details = "Altyapıları görüntülüyor...";
        presenceData.smallImageKey = "alt";
    } else if (window.location.pathname.startsWith("/booster")) {
        presenceData.details = "Booster kısmını görüntülüyor...";
        presenceData.smallImageKey = "booster";
    } else if (window.location.pathname.startsWith("/yetkili")) {
        presenceData.details = "Yetkili sayfasında dolaşıyor...";
    }

    if (presenceData.details == null) {
        presence.setTrayTitle();
        presence.setActivity();
    }
    else {
        presence.setActivity(presenceData);
    }
});

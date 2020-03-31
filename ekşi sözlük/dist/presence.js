const presence = new Presence({
    clientId: "643762072626266125"
}), pages = {
    "/": "Ana Sayfa",
    "/giris": "Giriş",
    "/kayit": "Kayıt Ol",
    "/mesaj": "Mesajlar",
    "/mesaj/arsiv": "Mesajlar",
    "/kanallar": "Kanallar",
    "/takip-engellenmis": "Takip Edilenler ve Engellenenler",
    "/iletisim": "İletişim",
    "/reklam": "Reklam",
    "/sub-etha": "sub-etha",
    "/modlog": "Modlog"
};
presence.on("UpdateData", async () => {
    const page = document.location.pathname, entry = document.querySelector("#title > a > span");
    if (page.includes("/biri/")) {
        const who = document.querySelector("#user-profile-title > a");
        presence.setActivity({
            largeImageKey: "es-logo",
            details: "Biri'ne göz atıyor:",
            state: who && who.textContent ? who.textContent : "Belirsiz",
            startTimestamp: Math.floor(Date.now() / 1000)
        });
    }
    else if (page.includes("/ayarlar/")) {
        presence.setActivity({
            largeImageKey: "es-logo",
            details: "Bir sayfaya göz atıyor:",
            state: "Ayarlar",
            startTimestamp: Math.floor(Date.now() / 1000)
        });
    }
    else if (document.location.search.includes("?q=")) {
        presence.setActivity({
            largeImageKey: "es-logo",
            details: "Bir şey arıyor:",
            state: entry && entry.textContent ? entry.textContent : "Belirsiz",
            smallImageKey: "search",
            startTimestamp: Math.floor(Date.now() / 1000)
        });
    }
    else if (pages[page] || pages[page.slice(0, -1)]) {
        presence.setActivity({
            largeImageKey: "es-logo",
            details: "Bir sayfaya göz atıyor:",
            state: pages[page] || pages[page.slice(0, -1)],
            startTimestamp: Math.floor(Date.now() / 1000)
        });
    }
    else if (entry && entry.textContent != "") {
        presence.setActivity({
            largeImageKey: "es-logo",
            details: "Bir entry'e göz atıyor:",
            state: entry.textContent,
            startTimestamp: Math.floor(Date.now() / 1000)
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUMxQixRQUFRLEVBQUUsb0JBQW9CO0NBQy9CLENBQUMsRUFDRixLQUFLLEdBQUc7SUFDTixHQUFHLEVBQUUsV0FBVztJQUNoQixRQUFRLEVBQUUsT0FBTztJQUNqQixRQUFRLEVBQUUsVUFBVTtJQUNwQixRQUFRLEVBQUUsVUFBVTtJQUNwQixjQUFjLEVBQUUsVUFBVTtJQUMxQixXQUFXLEVBQUUsVUFBVTtJQUN2QixvQkFBb0IsRUFBRSxrQ0FBa0M7SUFDeEQsV0FBVyxFQUFFLFVBQVU7SUFDdkIsU0FBUyxFQUFFLFFBQVE7SUFDbkIsV0FBVyxFQUFFLFVBQVU7SUFDdkIsU0FBUyxFQUFFLFFBQVE7Q0FDcEIsQ0FBQztBQUVKLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ25DLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUNyQyxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBRXRELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUMzQixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFFOUQsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUNuQixhQUFhLEVBQUUsU0FBUztZQUN4QixPQUFPLEVBQUUscUJBQXFCO1lBQzlCLEtBQUssRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVTtZQUM1RCxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQzlDLENBQUMsQ0FBQztLQUNKO1NBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQ3JDLFFBQVEsQ0FBQyxXQUFXLENBQUM7WUFDbkIsYUFBYSxFQUFFLFNBQVM7WUFDeEIsT0FBTyxFQUFFLHlCQUF5QjtZQUNsQyxLQUFLLEVBQUUsU0FBUztZQUNoQixjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQzlDLENBQUMsQ0FBQztLQUNKO1NBQU0sSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbkQsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUNuQixhQUFhLEVBQUUsU0FBUztZQUN4QixPQUFPLEVBQUUsaUJBQWlCO1lBQzFCLEtBQUssRUFBRSxLQUFLLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsVUFBVTtZQUNsRSxhQUFhLEVBQUUsUUFBUTtZQUN2QixjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQzlDLENBQUMsQ0FBQztLQUNKO1NBQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNsRCxRQUFRLENBQUMsV0FBVyxDQUFDO1lBQ25CLGFBQWEsRUFBRSxTQUFTO1lBQ3hCLE9BQU8sRUFBRSx5QkFBeUI7WUFDbEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQzlDLENBQUMsQ0FBQztLQUNKO1NBQU0sSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLFdBQVcsSUFBSSxFQUFFLEVBQUU7UUFDM0MsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUNuQixhQUFhLEVBQUUsU0FBUztZQUN4QixPQUFPLEVBQUUseUJBQXlCO1lBQ2xDLEtBQUssRUFBRSxLQUFLLENBQUMsV0FBVztZQUN4QixjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQzlDLENBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQyxDQUFDLENBQUMifQ==
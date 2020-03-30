const presence = new Presence({
    clientId: "632914600949710868"
}), pages = {
    "/yildiz-firsatlar": "Yıldız Fırsatlar",
    "/tum-kampanyalar": "Tüm Kampanyalar",
    "/cadde": "Cadde",
    "/nasil-iade-yapilir": "Nasıl İade Yapılır?",
    "/ayagina-gelsin/hediye-ceklerim": "Hedi Çeklerim",
    "/BanaOzel/satin-aldiklarim.php": "Siparişlerim",
    "/BanaOzel/sattiklarim.php": "Sattığım Ürünler",
    "/BanaOzel/satislarim.php": "Satışlarım",
    "/hesabim/izlediklerim": "İzlediklerim",
    "/bana-ozel/mesajlarim": "Mesajlarım",
    "/BanaOzel/favorilerim.php": "Favorilerim",
    "/BanaOzel/performans_raporu.php": "Performans Raporu",
    "/BanaOzel/hesaplarim.php": "Hesap Hareketlerim",
    "/BanaOzel/ayarlarim.php": "Bilgilerim",
    "/bana-ozel/promosyonlarim": "Promosyonlarım",
    "/sepetim": "Sepetim"
};
presence.on("UpdateData", async () => {
    const page = document.location.pathname, productName = document.querySelector("#sp-title") ||
        document.querySelector("#ProductTitle > div.h1-container > h1 > span.title"), price = document.querySelector(".lastPrice") ||
        document.querySelector("#col-center > div > div.border-e3e3e3 > ul.table-ul.gray-content.border-top-e3e3e3 > li.row-li.product-detail-product-price-info-ab-variant > ul > li.col-li.gg-w-17.gg-d-17.gg-t-16.gg-m-16.posr > div:nth-child(2) > div > div.low-price.extra-price.all-price.robotobold.clear.pl8.pt5"), seller = document.querySelector("#store-page-title > div.store-name > h1");
    let data = {
        largeImageKey: "gg-logo",
        startTimestamp: Math.floor(Date.now() / 1000)
    };
    if (productName && productName.textContent != "") {
        data.details = "Bir ürüne göz atıyor:";
        data.state = `${productName.textContent}${price ? " - " + price.textContent.trim() : ""}`;
    }
    else if (pages[page] || pages[page.slice(0, -1)]) {
        data.details = "Bir sayfaya göz atıyor:";
        data.state = pages[page] || pages[page.slice(0, -1)];
    }
    else if (page.includes("/arama")) {
        data.details = "Bir şey arıyor:";
        data.state =
            document.title && document.title.includes(" - GittiGidiyor")
                ? document.title.replace(" - GittiGidiyor", "")
                : "";
        data.smallImageKey = "search";
    }
    else if (seller && seller.textContent != "") {
        data.details = "Bir mağazaya göz atıyor:";
        data.state = seller.textContent.trim();
    }
    else {
        data.details = "Bir sayfaya göz atıyor:";
        data.state = "Ana Sayfa";
    }
    if (data.details && data.state && data.details != "" && data.state != "")
        presence.setActivity(data);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUM1QixRQUFRLEVBQUUsb0JBQW9CO0NBQzlCLENBQUMsRUFDRixLQUFLLEdBQUc7SUFDUCxtQkFBbUIsRUFBRSxrQkFBa0I7SUFDdkMsa0JBQWtCLEVBQUUsaUJBQWlCO0lBQ3JDLFFBQVEsRUFBRSxPQUFPO0lBQ2pCLHFCQUFxQixFQUFFLHFCQUFxQjtJQUM1QyxpQ0FBaUMsRUFBRSxlQUFlO0lBQ2xELGdDQUFnQyxFQUFFLGNBQWM7SUFDaEQsMkJBQTJCLEVBQUUsa0JBQWtCO0lBQy9DLDBCQUEwQixFQUFFLFlBQVk7SUFDeEMsdUJBQXVCLEVBQUUsY0FBYztJQUN2Qyx1QkFBdUIsRUFBRSxZQUFZO0lBQ3JDLDJCQUEyQixFQUFFLGFBQWE7SUFDMUMsaUNBQWlDLEVBQUUsbUJBQW1CO0lBQ3RELDBCQUEwQixFQUFFLG9CQUFvQjtJQUNoRCx5QkFBeUIsRUFBRSxZQUFZO0lBQ3ZDLDJCQUEyQixFQUFFLGdCQUFnQjtJQUM3QyxVQUFVLEVBQUUsU0FBUztDQUNyQixDQUFDO0FBRUgsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDcEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQ3RDLFdBQVcsR0FDVCxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBaUI7UUFDbkQsUUFBUSxDQUFDLGFBQWEsQ0FDdEIsb0RBQW9ELENBQ3BDLEVBQ2xCLEtBQUssR0FDSCxRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBaUI7UUFDcEQsUUFBUSxDQUFDLGFBQWEsQ0FDdEIsMlJBQTJSLENBQzNRLEVBQ2xCLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUM5Qix5Q0FBeUMsQ0FDMUIsQ0FBQztJQUVsQixJQUFJLElBQUksR0FBeUI7UUFDaEMsYUFBYSxFQUFFLFNBQVM7UUFDeEIsY0FBYyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztLQUM3QyxDQUFDO0lBRUYsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLFdBQVcsSUFBSSxFQUFFLEVBQUU7UUFDakQsSUFBSSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQztRQUN2QyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsV0FBVyxDQUFDLFdBQVcsR0FDdEMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDNUMsRUFBRSxDQUFDO0tBQ0g7U0FBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBRW5ELElBQUksQ0FBQyxPQUFPLEdBQUcseUJBQXlCLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNyRDtTQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUNuQyxJQUFJLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDO1FBQ2pDLElBQUksQ0FBQyxLQUFLO1lBQ1QsUUFBUSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDM0QsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQztnQkFDL0MsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNQLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDO0tBQzlCO1NBQU0sSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLFdBQVcsSUFBSSxFQUFFLEVBQUU7UUFDOUMsSUFBSSxDQUFDLE9BQU8sR0FBRywwQkFBMEIsQ0FBQztRQUMxQyxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDdkM7U0FBTTtRQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcseUJBQXlCLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7S0FDekI7SUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDdkUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQyJ9
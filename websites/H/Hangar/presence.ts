import { Presence } from "@premid/api";

export class HangarPresence extends Presence {
    public onUpdate() {
        const title = document.title; 
        const path = window.location.pathname;
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

        // Varsayılan Logo
        const defaultLogo = "logo"; // Discord Portal'a yüklediğiniz logonun adı

        // Ana Sayfa veya Feed
        if (path === '/' || path === '/feed') {
            this.setActivity({
                state: "Ana Sayfada",
                details: "Akış'ı inceliyor",
                largeImageKey: defaultLogo,
                largeImageText: "usehangar.gg"
            });
        } 
        // Hub İnceleme (örn: /hub/lspd)
        else if (path.startsWith('/hub/')) {
            const hubName = title.split(' | ')[0] || "Bir Hub";
            this.setActivity({
                state: "Hub İnceliyor",
                details: hubName,
                largeImageKey: ogImage || defaultLogo, // PreMiD artık dış linkleri destekliyor
                largeImageText: "usehangar.gg",
                smallImageKey: defaultLogo,
                smallImageText: "Hangar"
            });
        } 
        // Kullanıcı Profili
        else if (path.startsWith('/profile/')) {
            this.setActivity({
                state: "Bir profili",
                details: "inceliyor",
                largeImageKey: defaultLogo,
                largeImageText: "usehangar.gg"
            });
        } 
        // Gönderi Okuma
        else if (path.startsWith('/post/')) {
            this.setActivity({
                state: "Bir gönderiyi",
                details: "okuyor",
                largeImageKey: defaultLogo,
                largeImageText: "usehangar.gg"
            });
        } 
        // Diğer / Bilinmeyen / Gizli Sayfalar
        else {
            this.setActivity({
                details: "Hangar'da Geziniyor",
                largeImageKey: defaultLogo,
                largeImageText: "usehangar.gg"
            });
        }
    }
}

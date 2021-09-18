const presence = new Presence({
    clientId: "888141162488143893"
}), time = Math.floor(Date.now() / 1000);
let item, item2, item3;
presence.on("UpdateData", async () => {
    const presenceData = {
        largeImageKey: "lslogo",
        smallImageKey: "lsminilogo",
        smallImageText: "leosight.cz"
    }, path = document.location.pathname;
    if (path == "/" &&
        !window.location.href.includes("artic") &&
        !window.location.href.includes("ctf") &&
        !window.location.href.includes("eco") &&
        !window.location.href.includes("guard")) {
        presenceData.details = "Prohlíží si hlavní stránku...";
        presenceData.startTimestamp = time;
    }
    else if (path == "/novinky") {
        presenceData.details = "Fórum";
        presenceData.state = "Novinky";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("clanek")) {
        item = document.querySelector("div.panel-body h2");
        item2 = document.querySelector("div.col-md-3.pull-left span.authorname");
        presenceData.details = item.innerText;
        presenceData.state = "Autor článku: " + item2.innerText;
        presenceData.startTimestamp = time;
    }
    else if (path.includes("editor/novy")) {
        presenceData.details = "Píše nový článek";
        presenceData.startTimestamp = time;
    }
    else if (path == "/forum") {
        presenceData.details = "Fórum";
        presenceData.state = "Hlavní stránka";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("/forum/") &&
        !path.includes("new") &&
        !path.includes("topic")) {
        item = document.querySelector("div.obsah.text-left h3");
        presenceData.details = "Fórum";
        presenceData.state = item.innerText;
        presenceData.startTimestamp = time;
    }
    else if (path == "/forum/new") {
        presenceData.details = "Fórum";
        presenceData.state = "Nejnovější témata";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("/forum/topic")) {
        item = document.querySelector(".text-center");
        item2 = document.querySelector("div.forum-message div.left a.pname");
        presenceData.details = item.innerText;
        presenceData.state = "Autor tématu: " + item2.innerText;
        presenceData.startTimestamp = time;
    }
    else if (path == "/forum/43") {
        presenceData.state = "Chystá se způsobit adminům deprese.";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("/newtopic")) {
        presenceData.details = "Zakládá nové téma";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("turnaje")) {
        presenceData.details = "Turnaje";
        presenceData.startTimestamp = time;
    }
    else if (path == "/donate") {
        presenceData.details = "Podpora portálu";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("/shop")) {
        presenceData.details = "Obchod";
        presenceData.startTimestamp = time;
        if (path.includes("/shop/web")) {
            presenceData.state = "Web";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("skimo")) {
            presenceData.state = "Skimo";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("asteria")) {
            presenceData.state = "Asteria";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("vip")) {
            presenceData.state = "VIP";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("akce")) {
            presenceData.state = "Akce";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("all")) {
            presenceData.state = "Vše";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("/shop/")) {
            item = document.querySelector("div.panel-body h3");
            presenceData.state = item.innerText;
            presenceData.startTimestamp = time;
        }
    }
    else if (path == "/trade") {
        presenceData.details = "Nabídky obchodu";
        presenceData.startTimestamp = time;
    }
    else if (path == "/market") {
        presenceData.details = "Tržiště";
        presenceData.startTimestamp = time;
    }
    else if (path == "/poukaz") {
        presenceData.details = "Uplatnit poukaz";
        presenceData.startTimestamp = time;
    }
    else if (path == "/vip") {
        presenceData.details = "VIP";
        presenceData.startTimestamp = time;
    }
    else if (path == "/premium") {
        presenceData.details = "PREMIUM";
        presenceData.startTimestamp = time;
    }
    else if (path == "/team") {
        presenceData.details = "Praisuje AT";
        presenceData.startTimestamp = time;
    }
    else if (path == "/statistiky") {
        presenceData.details = "Statistiky";
        presenceData.startTimestamp = time;
    }
    else if (path == "/pravidla") {
        presenceData.details = "Pravidla portálu";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("/tym")) {
        item = document.querySelector("div.obsah.text-center p");
        item2 = document.querySelector("div.obsah.text-center h2");
        if (item2.innerText == "Týmy") {
            presenceData.details = "Prohlíží si týmy";
            presenceData.startTimestamp = time;
        }
        else {
            presenceData.details = "Prohlíží si tým:";
            presenceData.state = item.innerText + " (" + item2.innerText + ")";
            presenceData.startTimestamp = time;
        }
    }
    else if (path == "/ucp") {
        presenceData.details = "Uživatelský panel";
        presenceData.startTimestamp = time;
    }
    else if (path == "/prospect") {
        presenceData.details = "Prospect";
        presenceData.startTimestamp = time;
    }
    else if (path == "/akce") {
        presenceData.details = "Komunitní akce";
        presenceData.startTimestamp = time;
    }
    else if (path == "/ankety") {
        presenceData.details = "Ankety";
        presenceData.startTimestamp = time;
    }
    else if (path == "/spoluhraci") {
        presenceData.details = "Hledám spoluhráče";
        presenceData.startTimestamp = time;
    }
    else if (path == "/herna") {
        presenceData.details = "Jsem gambler";
        presenceData.startTimestamp = time;
    }
    else if (path == "/hlasky") {
        presenceData.details = "Hlášky";
        presenceData.startTimestamp = time;
    }
    else if (path == "/ticket") {
        presenceData.details = "Tickety";
        presenceData.startTimestamp = time;
    }
    else if (path == "/logs") {
        presenceData.details = "Logy";
        presenceData.startTimestamp = time;
    }
    else if (path == "/ukoly") {
        presenceData.details = "Denní úkoly";
        presenceData.startTimestamp = time;
    }
    else if (path == "/chat") {
        presenceData.details = "Chatuje";
        presenceData.startTimestamp = time;
    }
    else if (path == "/upozorneni") {
        presenceData.details = "Upozornění";
        presenceData.startTimestamp = time;
    }
    else if (path == "/znamky") {
        presenceData.details = "Katalog známek";
        presenceData.startTimestamp = time;
    }
    else if (path == "/banlist") {
        presenceData.details = "Seznam zabanovaných uživatelů";
        presenceData.startTimestamp = time;
    }
    else if (path == "/faktury") {
        presenceData.details = "Faktury";
        presenceData.startTimestamp = time;
    }
    else if (path == "/nastaveni") {
        presenceData.details = "Nastavení účtu";
        presenceData.startTimestamp = time;
    }
    else if (path == "/dashboard") {
        presenceData.details = "Provádí adminskou magii";
        presenceData.startTimestamp = time;
    }
    else if (path == "/modlog") {
        presenceData.details = "Provádí ještě adminštější magii";
        presenceData.startTimestamp = time;
    }
    else if (path == "/kodex-at") {
        presenceData.details = "Studuje adminskou Bibli";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("/skimo")) {
        presenceData.details = "Skimo rozcestník";
        presenceData.startTimestamp = time;
        if (path.includes("postavy"))
            presenceData.state = "Moje postavy";
        else if (path.includes("/frakce")) {
            presenceData.details = "Seznam frakcí";
            if (path.includes("/frakce/")) {
                item = document.querySelectorAll("div.obsah.text-center h2")[1];
                presenceData.details = "Prohlíží si frakci";
                presenceData.state = item.innerText;
                presenceData.startTimestamp = time;
            }
        }
        else if (path.includes("/auta"))
            presenceData.state = "Seznam vozidel";
        else if (path.includes("/interiery"))
            presenceData.state = "Seznam interiérů";
        else if (path.includes("/skiny"))
            presenceData.state = "Seznam skinů";
        else if (path.includes("/radia"))
            presenceData.state = "Seznam rádií";
        else if (path.includes("/banlist"))
            presenceData.state = "Seznam banů";
    }
    else if (path == "/profil/3773") {
        presenceData.details = "Obtěžuje autora tohoto";
        presenceData.state = "RPC";
        presenceData.startTimestamp = time;
    }
    else if (path == "/profil/1") {
        presenceData.details = "Obtěžuje Ratáže.";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("uzivatele")) {
        presenceData.details = "Seznam uživatelů";
        presenceData.startTimestamp = time;
    }
    else if (path.includes("/profil/")) {
        item = document.querySelector(".on-pname");
        presenceData.details = "Prohlíží si profil uživatele:";
        presenceData.state = item.innerText;
        presenceData.startTimestamp = time;
    }
    else if (path == "/pratele") {
        presenceData.details = "Seznam přátel";
        presenceData.startTimestamp = time;
    }
    else if (path == "/avatar") {
        presenceData.details = "Nastavuje si avatar";
        presenceData.startTimestamp = time;
    }
    else if (path == "/profil") {
        presenceData.details = "Prohlíží si svůj profil";
        presenceData.startTimestamp = time;
    }
    else if (window.location.href.includes("artic")) {
        presenceData.smallImageKey = "artic";
        presenceData.smallImageText = "artic.leosight.cz";
        presenceData.details = "Artic";
        presenceData.startTimestamp = time;
        if (path == "/" || path == "") {
            presenceData.state = "Hlavní stránka";
            presenceData.startTimestamp = time;
        }
        if (path.includes("mdc.ic")) {
            presenceData.details = "Prohlíží si MDC";
            presenceData.startTimestamp = time;
            if (path == "/mdc.ic/")
                presenceData.state = "Ověření uživatele";
            if (path.includes("dashboard"))
                presenceData.state = "Hlavní stránka";
            else if (path.includes("apb"))
                presenceData.state = "APB";
            else if (path.includes("warrants"))
                presenceData.state = "Zatykače";
            else if (path.includes("osoba")) {
                presenceData.state = "Vyhledává osobu";
            }
            else if (path.includes("vozidlo")) {
                presenceData.state = "Vyhledává vozidlo";
            }
            else if (path.includes("nemovitost")) {
                presenceData.state = "Vyhledává nemovitost";
            }
            else if (path.includes("firma")) {
                presenceData.state = "Vyhledává firmu";
            }
            else if (path.includes("smazane"))
                presenceData.state = "Smazané záznamy";
            else if (path.includes("odtahy"))
                presenceData.state = "Odtažená vozidla";
            else if (path.includes("handbook"))
                presenceData.state = "Úvod příručky";
            else if (path.includes("slovnik"))
                presenceData.state = "Slovník";
            else if (path.includes("codes"))
                presenceData.state = "Kódy";
            else if (path.includes("sazebnik"))
                presenceData.state = "Sazebník trestů";
            else if (path.includes("stop"))
                presenceData.state = "Zastavovací techniky";
            else if (path.includes("law"))
                presenceData.state = "Zákon o policii";
            else if (path.includes("directive"))
                presenceData.state = "Směrnice";
            else if (path.includes("teams"))
                presenceData.state = "Hierarchie PSA";
        }
        else if (path.includes("stoongle")) {
            presenceData.details = "Stoongluje";
            presenceData.startTimestamp = time;
            if (path.includes("katalog")) {
                presenceData.state = "Katalog webů";
                presenceData.startTimestamp = time;
            }
        }
        else if (path.includes("burza.ic")) {
            presenceData.state = "Burza";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("invest.ic")) {
            presenceData.state = "CE Invest";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("hzs.ic")) {
            presenceData.state = "Hasičský záchranný sbor";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("nic.ic")) {
            presenceData.state = "IC.NIC";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("krypta.ic")) {
            presenceData.state = "Krypta - online kasíno";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("katastr.ic")) {
            presenceData.state = "Katastr nemovitostí";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("lemongate.ic")) {
            presenceData.state = "LemonGate - hlavní stránka";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("e6ftf4.lemon")) {
            presenceData.state = "LemonGate - rozcestník";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("board4.lemon")) {
            presenceData.state = "LemonGate - Board4";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("b3s4f3.lemon")) {
            presenceData.state = "LemonGate - kryptografie";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("irc4na.lemon")) {
            presenceData.state = "LemonGate - Ircana";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("1trade.lemon")) {
            presenceData.state = "LemonGate - AceTrade";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("blockchain.ic")) {
            presenceData.state = "NC Blockchain";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("nomelcoin.ic")) {
            presenceData.state = "NomelCoin";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("oilrig.ic")) {
            presenceData.state = "OilRig";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("kiwi.ic")) {
            presenceData.state = "Kiwi - internetové reklamy";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("spay.ic")) {
            presenceData.state = "SPay";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("sherwood.ic")) {
            presenceData.state = "Sherwood Corporation";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("smail.ic")) {
            presenceData.details = "Smail";
            presenceData.state = "Hlavní stránka";
            presenceData.startTimestamp = time;
            if (path.includes("prijate"))
                presenceData.state = "Přijaté";
            else if (path.includes("napsat"))
                presenceData.state = "Napsat e-mail";
            else if (path.includes("odeslane"))
                presenceData.state = "Odeslané";
            else if (path.includes("nastaveni"))
                presenceData.state = "Nastavení";
        }
        else if (path.includes("tcu.ic")) {
            presenceData.state = "Tax Compliance Unit";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("mining.ic")) {
            presenceData.state = "Těžba kryptoměn";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("vaos.ic")) {
            presenceData.state = "Veterinární a odchytová služba";
            presenceData.startTimestamp = time;
        }
        else if (path.includes("writer.ic")) {
            presenceData.state = "Writer";
            presenceData.startTimestamp = time;
        }
    }
    else if (window.location.href.includes("ctf")) {
        presenceData.smallImageKey = "ctf";
        presenceData.smallImageText = "ctf.leosight.cz";
        presenceData.details = "Leosight CTF";
        presenceData.startTimestamp = time;
        if (path.includes("login.php"))
            presenceData.state = "Přihlášení";
        else if (path.includes("index.php"))
            presenceData.state = "Odvařuje si mozek";
    }
    else if (window.location.href.includes("eco")) {
        presenceData.smallImageKey = "eco";
        presenceData.smallImageText = "eco.leosight.cz";
        presenceData.details = "Hraje Leosight ECO";
        presenceData.startTimestamp = time;
    }
    else if (window.location.href.includes("guard")) {
        presenceData.smallImageKey = "guard";
        presenceData.smallImageText = "guard.leosight.cz";
        presenceData.details = "Leosigh Guard";
        presenceData.startTimestamp = time;
        if (path == "" || path == "/")
            presenceData.state = "Seznam serverů";
        if (path.includes("hive.php"))
            presenceData.state = "LSG - Hive";
        else if (path.includes("skimose"))
            presenceData.state = "Skimo SE - API";
        else if (path.includes("dokumentace.php"))
            presenceData.state = "Skimo SE - Public API";
        else if (path.includes("servery.php"))
            presenceData.state = "LSEC ServerList";
        else if (path.includes("license.php"))
            presenceData.state = "LSG LicesnseList";
        else if (path.includes("breach.php"))
            presenceData.state = "LSG-Breach";
        else if (path.includes("prospect.php"))
            presenceData.state = "Leosight Prospect";
        else if (path.includes("/prospect/")) {
            presenceData.details = "LeoSight rádio";
            presenceData.startTimestamp = time;
            if (path.includes("radio_mobile.php"))
                presenceData.state = "Poslouchá rádio";
            else if (path.includes("radio_newsong.php"))
                presenceData.state = "Přidává novou písničku";
        }
    }
    if (presenceData.details == null) {
        presence.setTrayTitle("Provádí nespecifikovanou činnost.");
        presence.setActivity();
    }
    else {
        presence.setActivity(presenceData);
    }
});

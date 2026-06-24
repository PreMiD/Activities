const presence = new Presence({
  clientId: "1288129332455149619",
})

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = "https://cdn.discordapp.com/avatars/678344927997853742/37e0fb2dcf8d219aa92bf02f47ea60eb.webp?size=1024",
}

/* -----------------------------------------
   LANGUAGE KEYS (en + hu)
----------------------------------------- */
const LANG = {
  en: {
    site: "Sapphire",
    home: {
      main: "Homepage",
      about: "Reading about us",
      status: "Viewing status",
      custombranding: "Viewing custom branding subscription",
      limitincrease: "Viewing limit increase",
      terms: "Viewing Terms of Service",
      privacy: "Viewing Privacy Policy",
      rightofwithdrawal: "Viewing Right of Withdrawal",
      licenses: "Viewing Licenses",
      legalnotice: "Viewing Legal Notice"
    },
    dashboard: {
      main: "Dashboard (Selecting Server)",
      module: "Viewing dashboard module",
    },
    docs: {
      main: "Documentation",
      reading: "Reading documentation",
    },
  },

  hu: {
    site: "Sapphire",
    home: {
      main: "Főoldal",
      about: "Rólunk olvas",
      status: "Státusz megtekintése",
      custombranding: "Custom branding előfizetés megtekintése",
      limitincrease: "Limit növelés megtekintése",
      terms: "A szerződési feltételek megtekintése",
      privacy: "A adatvédelmi irányelvek megtekintése",
      rightofwithdrawal: "A jogok megszerzése megtekintése",
      licenses: "A licencek megtekintése",
      legalnotice: "A Jogi értesítés megtekintése"
    },
    dashboard: {
      main: "Vezérlőpult (Szerver Választása)",
      module: "Modul megtekintése",
    },
    docs: {
      main: "Dokumentáció",
      reading: "Dokumentáció olvasása",
    },
  },
} as const;

/* -----------------------------------------
   TYPE DEFINITIONS
----------------------------------------- */
type LangCode = keyof typeof LANG;

/* -----------------------------------------
   LANGUAGE LOADER
----------------------------------------- */
let currentLang: LangCode = "en";

async function loadLanguage() {
  const lang = await presence.getSetting<string>("lang").catch(() => "en")

  if (lang === "hu" || lang === "en") {
    currentLang = lang
  } else {
    currentLang = "en"
  }
}

/* -----------------------------------------
   MAIN PRESENCE LOGIC
----------------------------------------- */
presence.on("UpdateData", async () => {
  await loadLanguage();
  const t = LANG[currentLang];

  const { hostname, pathname } = document.location;

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: t.site,
    startTimestamp: browsingTimestamp,
  };

  /* -----------------------------------------
     DOMAIN-BASED LANGUAGE KEYS
  ----------------------------------------- */
  switch (hostname.replace("www.", "")) {
    case "sapph.xyz": {
      if (pathname === "/") {
        presenceData.state = t.home.main;
      } else if (pathname.includes("/about")) {
        presenceData.state = t.home.about;
      } else if (pathname.includes("/status")) {
        presenceData.state = t.home.status;
      } else if (pathname.includes("/custom-branding")) {
        presenceData.state = t.home.custombranding;
      } else if (pathname.includes("/limit-increase")) {
        presenceData.state = t.home.limitincrease;
      } else if (pathname.includes("/terms")) {
        presenceData.state = t.home.terms;
      } else if (pathname.includes("/privacy")) {
        presenceData.state = t.home.privacy;
      } else if (pathname.includes("/right-of-withdrawal")) {
        presenceData.state = t.home.rightofwithdrawal;
      } else if (pathname.includes("/licenses")) {
        presenceData.state = t.home.licenses;
      } else if (pathname.includes("/legal-notice")) {
        presenceData.state = t.home.legalnotice;
      }
    }

    case "dashboard.sapph.xyz": {
      const parts = pathname.split("/").filter(Boolean);

      // parts[0] = serverId
      // parts[1] = module
      // parts[2] = submodule (opcionális)

      const serverId = parts[0];
      const moduleName = parts[1];

      if (!serverId) {
        // Nincs server ID → főoldal
        presenceData.state = t.dashboard.main;
      } else if (!moduleName) {
        // Van server ID, de nincs modul → szerver főoldal
        presenceData.state = `${t.dashboard.main} (${serverId})`;
      } else {
        // Van server ID + modul
        presenceData.state = `${t.dashboard.module}: ${moduleName}`;
      }
    }


    case "docs.sapph.xyz": {
      if (pathname === "/") {
        presenceData.state = t.docs.main
      } else {
        presenceData.state = t.docs.reading
      }

    }
  }

  /* -----------------------------------------
     APPLY PRESENCE
  ----------------------------------------- */
  if (presenceData.state)
    presence.setActivity(presenceData)
  else
    presence.clearActivity()
})

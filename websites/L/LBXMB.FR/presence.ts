import { Assets } from "premid";

const presence = new Presence({
  clientId: "1431308308505039069",
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = "https://lbxmb.fr/lbxmb.png",
}

function getPageInfo(path: string): { details: string; state: string } {
  if (path === "/" || path === "")
    return { details: "Browsing the homepage", state: "lbxmb.fr" };

  if (path.startsWith("/dashboard")) {
    if (path === "/dashboard")
      return { details: "In the dashboard", state: "Overview" };
    if (path.includes("/users"))
      return { details: "In the dashboard", state: "User management" };
    if (path.includes("/resources"))
      return { details: "In the dashboard", state: "Resource management" };
    if (path.includes("/guides"))
      return { details: "In the dashboard", state: "Guide management" };
    if (path.includes("/orders"))
      return { details: "In the dashboard", state: "Orders" };
    if (path.includes("/reports"))
      return { details: "In the dashboard", state: "Reports" };
    if (path.includes("/maintenance"))
      return { details: "In the dashboard", state: "Maintenance" };
    if (path.includes("/sauvegardes"))
      return { details: "In the dashboard", state: "Backups" };
    return { details: "In the dashboard", state: "Administration" };
  }

  if (path.startsWith("/ressources")) {
    if (path === "/ressources")
      return { details: "Browsing resources", state: "All resources" };
    if (path.includes("/ajouter"))
      return { details: "Adding a resource", state: "New resource" };
    if (path.includes("/modifier"))
      return { details: "Editing a resource", state: "Resource editor" };
    return { details: "Viewing a resource", state: "Resource" };
  }

  if (path.startsWith("/guides")) {
    if (path === "/guides")
      return { details: "Browsing guides", state: "All guides" };
    if (path.includes("/ajouter"))
      return { details: "Writing a guide", state: "New guide" };
    if (path.includes("/modifier"))
      return { details: "Editing a guide", state: "Guide editor" };
    return { details: "Reading a guide", state: "Guide" };
  }

  if (path.startsWith("/shop") || path.startsWith("/boutique")) {
    if (path === "/shop" || path === "/boutique")
      return { details: "Browsing the shop", state: "LBXMB Shop" };
    return { details: "Viewing an item", state: "Shop" };
  }

  if (path.startsWith("/forum")) {
    if (path === "/forum")
      return { details: "On the forum", state: "Forum home" };
    if (path.includes("/thread"))
      return { details: "Reading a forum thread", state: "Forum" };
    if (path.includes("/g/"))
      return { details: "In a forum group", state: "Forum" };
    return { details: "On the forum", state: "LBXMB Forum" };
  }

  if (path.startsWith("/services")) {
    if (path.includes("/xbox") || path.includes("/pc") || path.includes("/consoles") || path.includes("/games"))
      return { details: "Browsing services", state: "Gaming services" };
    if (path.includes("/hosting"))
      return { details: "Browsing services", state: "Hosting" };
    return { details: "Browsing services", state: "LBXMB Services" };
  }

  if (path.startsWith("/mes-services"))
    return { details: "Managing services", state: "My services" };

  if (path.startsWith("/profil"))
    return { details: "Viewing a profile", state: "User profile" };

  if (path.startsWith("/parametres"))
    return { details: "In account settings", state: "Settings" };

  if (path.startsWith("/support") || path.startsWith("/tickets"))
    return { details: "Customer support", state: "Tickets" };

  if (path.startsWith("/login"))
    return { details: "Logging in", state: "Login" };

  if (path.startsWith("/vip"))
    return { details: "Viewing VIP", state: "VIP Subscription" };

  if (path.startsWith("/donate") || path.startsWith("/donateurs"))
    return { details: "Donation page", state: "Support LBXMB" };

  if (path.startsWith("/chat"))
    return { details: "In the chat", state: "LBXMB Chat" };

  if (path.startsWith("/projects"))
    return { details: "Exploring projects", state: "Projects" };

  if (path.startsWith("/discord"))
    return { details: "Viewing Discord page", state: "LBXMB Discord" };

  if (path.startsWith("/demarrer-modding"))
    return { details: "Learning to mod", state: "Getting started with modding" };

  return { details: "Browsing LBXMB.FR", state: "lbxmb.fr" };
}

presence.on("UpdateData", async () => {
  const [privacy, time, showPage, buttons] = await Promise.all([
    presence.getSetting<boolean>("privacy"),
    presence.getSetting<boolean>("time"),
    presence.getSetting<boolean>("showPage"),
    presence.getSetting<boolean>("buttons"),
  ]);

  const { pathname, href } = document.location;
  const { details, state } = getPageInfo(pathname);

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: Assets.Browsing,
    smallImageText: "LBXMB.FR",
  };

  if (privacy) {
    presenceData.details = "Browsing LBXMB.FR";
  } else {
    presenceData.details = details;
    if (showPage) presenceData.state = state;
    if (buttons) {
      presenceData.buttons = [
        {
          label: "Visit LBXMB.FR",
          url: href,
        },
      ];
    }
  }

  if (time) presenceData.startTimestamp = browsingTimestamp;

  presence.setActivity(presenceData);
});

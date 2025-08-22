const presence = new Presence({
  clientId: "1408054441252491326", // ID da sua aplicação no Discord Developer Portal
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = "https://cdn.discordapp.com/attachments/1216015811324547173/1408486395869397123/263cef731b755103d3a0..._imresizer.jpg?ex=68a9eaad&is=68a8992d&hm=5bb6a2fa9fcb9973a40190b9d1a4b1a1e727818ceedc8d01fe1e92d09177570f&.png", // Logo do EasyFun
}

presence.on("UpdateData", async () => {
  const { pathname, href } = document.location;

  // Regex para capturar o nome do jogo
  const match = pathname.match(/\/cloud-games\/([a-z0-9-]+)\.html/i);
  let gameName = null;

  if (match && match[1]) {
    gameName = match[1]
      .replace(/(-cloud.*|\.html)$/i, "")
      .split("-")
      .map((word) =>
        /^\d+$/.test(word)
          ? word
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }

  // Captura a imagem do jogo via DOM
  const gameIcon = document.querySelector('img[alt$="-icon"]')?.getAttribute("src");

  const presenceData: PresenceData = {
    largeImageKey: gameIcon ?? undefined,
    smallImageKey: ActivityAssets.Logo,
    details: gameName ? `Playing ${gameName}` : "Exploring EasyFun",
    state: gameName ? "Cloud Gaming" : "Browsing on site",
    startTimestamp: browsingTimestamp,
    buttons: gameName ? [{ label: "Play now", url: href }] : undefined,
  };

  presence.setActivity(presenceData);

  console.log("Dados enviados ao Discord:", presenceData);
});

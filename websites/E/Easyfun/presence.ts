const presence = new Presence({
  clientId: "1408054441252491326", // ID da sua aplicação no Discord Developer Portal
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = "https://images-ext-1.discordapp.net/external/MsHmFXqr9pqCkuhA3oaPcHiNkqry9xcGMHRh1hbyf7w/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1218302146995556422/263cef731b755103d3a010a8941458d7.png?format=png&quality=lossless&width=669&height=669", // Logo do EasyFun
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

const presence = new Presence({
  clientId: "1408054441252491326", // ID da sua aplicação no Discord Developer Portal
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = "https://cdn.corenexis.com/file/?serve=7296171168.png&token=a5a20b22ebb9d1f55ee01327900d4d850063d4e6ec2d71e2dccad960a41c8205.NzI5NjE3MTE2OC5wbmd8MTc1NjMyMTA0Mw==", // Logo do EasyFun
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

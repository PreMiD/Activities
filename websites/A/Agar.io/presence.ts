const presence = new Presence({
    clientId: "719974375188725770"
  }),
  gameModeMap: ItemMap = {
    ":battleroyale": "Battle Royale",
    ":experimental": "Experimental",
    ":ffa": "Free-For-All",
    ":party": "Party",
    ":teamrush": "Team Rush",
    ":teams": "Teams"
  };

interface AgarData {
  state: number;
  gameMode: string;
  nick: string;
  connecting: boolean;
}

interface ItemMap {
  [key: string]: string;
}

let gameStartTimestamp: number = null,
  agarData: AgarData = null;

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "agar"
    },
    buttons = await presence.getSetting("buttons");

  if (agarData) {
    if (agarData.connecting) {
      presenceData.details = "Connecting...";
      gameStartTimestamp = null;
    } else {
      switch (agarData.state) {
        case 0:
          presenceData.details = "Main Menu";
          gameStartTimestamp = null;
          break;
        case 1:
          if (await presence.getSetting("showName"))
            presenceData.details = `Playing as ${agarData.nick}`;
          else presenceData.details = "Playing";
          gameStartTimestamp ??= Date.now();
          break;
        case 2:
          presenceData.details = "Game Over";
          gameStartTimestamp = null;
          break;
        case 3:
          presenceData.details = "Spectating";
          gameStartTimestamp = null;
          break;
      }
      presenceData.state = gameModeMap[agarData.gameMode];
      presenceData.startTimestamp = gameStartTimestamp;

      if (buttons) {
        if (document.querySelector(".partymode-info > #code")) {
          presenceData.buttons = [
            {
              label: "Join Party",
              url: document.URL
            }
          ];
        }
      }
    }
  }

  if (presenceData.details) presence.setActivity(presenceData);
  else presence.setActivity();
});

presence.on("iFrameData", (data: AgarData) => (agarData = data));

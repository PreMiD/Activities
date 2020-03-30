var presence = new Presence({
  clientId: "691494438349832227",
});

var browsingStamp;

presence.on("UpdateData", () => {
  let data = {
    largeImageKey: "amq",
  };
  if (!navigator.language.includes("it-IT")) {
    // English
    if (document.location.pathname == "/") {
      if (document.querySelector("#gameChatPage") != null) {
        if (
          document.querySelector("#roomBrowserPage").className !=
          "gamePage text-center hidden"
        ) {
          browsingStamp = Math.floor(Date.now() / 1000);
          var lobbyNumber = document.querySelector("#rbTotalGameCount")
            .innerText;
          (data.smallImageKey = "lobby"),
            (data.smallImageText = "Rooms count: " + lobbyNumber),
            (data.details = "Browsing the game rooms"),
            (data.startTimestamp = browsingStamp);
          presence.setActivity(data);
        } else if (
          document.querySelector("#gameChatPage").className == "gamePage"
        ) {
          if (document.querySelector("#lobbyPage").className == "text-center") {
            browsingStamp = Math.floor(Date.now() / 1000);
            var lobbyName = document.querySelector("#lobbyRoomName")
              .textContent;
            (data.smallImageKey = "room"),
              (data.smallImageText = "Room: " + lobbyName),
              (data.details = "In the room:"),
              (data.state = lobbyName),
              (data.startTimestamp = browsingStamp);
            presence.setActivity(data);
          } else {
            if (
              document.querySelector("#battleRoyalPage").className ==
              "text-center"
            ) {
              var timeRemainingBR = document.querySelector("#brTimeLeft")
                .innerText;
              (data.smallImageKey = "btr"),
                (data.smallImageText = "Time remaining: " + timeRemainingBR),
                (data.details = "Choosing songs for"),
                (data.state = "battle royale mode"),
                presence.setActivity(data);
            } else {
              var totalRoundNumber = document
                .querySelector("#qpCounter")
                .innerText.replace("/", " of ");
              var actualRoundNumber = document
                .querySelector("#qpCounter")
                .innerText.split("/")[0];
              if (
                document.querySelector("#qpAnimeNameHider").className ==
                "center-text qpAnimeNameContainer hide"
              ) {
                var animeName = document.querySelector("#qpAnimeName")
                  .textContent;
                (data.smallImageKey = "headset"),
                  (data.smallImageText = "Song from: " + animeName),
                  (data.details = "Round " + actualRoundNumber + " ended"),
                  (data.state = "Song from: " + animeName),
                  presence.setActivity(data);
              } else {
                if (
                  document
                    .querySelector("#qpHiderText")
                    .textContent.startsWith("Loading")
                ) {
                  (data.smallImageKey = "gamepad"),
                    (data.smallImageText = "Loading..."),
                    (data.details = "The game is beginning"),
                    (data.state = "Loading..."),
                    presence.setActivity(data);
                } else if (
                  document.querySelector("#qpHiderText").textContent ==
                  "Answers"
                ) {
                  (data.smallImageKey = "gamepad"),
                    (data.smallImageText = "Waiting for the results..."),
                    (data.details = "Round " + actualRoundNumber + " ended"),
                    (data.state = "Waiting for the results..."),
                    presence.setActivity(data);
                } else {
                  var timeRemaining = document.querySelector("#qpHiderText")
                    .textContent;
                  (data.smallImageKey = "gamepad"),
                    (data.smallImageText =
                      "Round: " +
                      actualRoundNumber +
                      "｜Countdown: " +
                      timeRemaining);
                  (data.details = "Round: " + totalRoundNumber),
                    (data.state = "Time remaining: " + timeRemaining),
                    presence.setActivity(data);
                }
              }
            }
          }
        } else {
          browsingStamp = Math.floor(Date.now() / 1000);
          (data.smallImageKey = "menu"),
            (data.smallImageText = "In the menu..."),
            (data.details = "In the menu..."),
            (data.startTimestamp = browsingStamp);
          presence.setActivity(data);
        }
      } else {
        browsingStamp = Math.floor(Date.now() / 1000);
        (data.smallImageKey = "menu"),
          (data.smallImageText = "In the homepage..."),
          (data.details = "In the homepage..."),
          (data.startTimestamp = browsingStamp);
        presence.setActivity(data);
      }
    } else if (document.location.pathname.startsWith("/legal/tos")) {
      browsingStamp = Math.floor(Date.now() / 1000);
      (data.smallImageKey = "info"),
        (data.smallImageText = "Terms of Service"),
        (data.details = "Reading the terms of"),
        (data.state = "service"),
        (data.startTimestamp = browsingStamp);
      presence.setActivity(data);
    } else if (document.location.pathname.startsWith("/legal/privacy")) {
      browsingStamp = Math.floor(Date.now() / 1000);
      (data.smallImageKey = "info"),
        (data.smallImageText = "Privacy Police"),
        (data.details = "Reading the privacy"),
        (data.state = "police"),
        (data.startTimestamp = browsingStamp);
      presence.setActivity(data);
    } else {
      browsingStamp = Math.floor(Date.now() / 1000);
      (data.smallImageKey = "search"),
        (data.smallImageText = "Browsing..."),
        (data.details = "Browsing..."),
        (data.startTimestamp = browsingStamp);
      presence.setActivity(data);
    }
  } else {
    // Italian
    if (document.location.pathname == "/") {
      if (document.querySelector("#gameChatPage") != null) {
        if (
          document.querySelector("#roomBrowserPage").className !=
          "gamePage text-center hidden"
        ) {
          browsingStamp = Math.floor(Date.now() / 1000);
          var lobbyNumber = document.querySelector("#rbTotalGameCount")
            .innerText;
          (data.smallImageKey = "lobby"),
            (data.smallImageText = "Numero stanze: " + lobbyNumber),
            (data.details = "Naviga tra le stanze"),
            (data.state = "di gioco"),
            (data.startTimestamp = browsingStamp);
          presence.setActivity(data);
        } else if (
          document.querySelector("#gameChatPage").className == "gamePage"
        ) {
          if (document.querySelector("#lobbyPage").className == "text-center") {
            var lobbyName = document.querySelector("#lobbyRoomName")
              .textContent;
            (data.smallImageKey = "room"),
              (data.smallImageText = "Stanza: " + lobbyName),
              (data.details = "Nella stanza:"),
              (data.state = lobbyName),
              presence.setActivity(data);
          } else {
            if (
              document.querySelector("#battleRoyalPage").className ==
              "text-center"
            ) {
              var timeRemainingBR = document.querySelector("#brTimeLeft")
                .innerText;
              (data.smallImageKey = "btr"),
                (data.smallImageText = "Tempo rimanente: " + timeRemainingBR),
                (data.details = "Sceglie le canzoni per"),
                (data.state = "la battle royale"),
                presence.setActivity(data);
            } else {
              var totalRoundNumber = document
                .querySelector("#qpCounter")
                .innerText.replace("/", " di ");
              var actualRoundNumber = document
                .querySelector("#qpCounter")
                .innerText.split("/")[0];
              if (
                document.querySelector("#qpAnimeNameHider").className ==
                "center-text qpAnimeNameContainer hide"
              ) {
                var animeName = document.querySelector("#qpAnimeName")
                  .textContent;
                (data.smallImageKey = "headset"),
                  (data.smallImageText = "Canzone da: " + animeName),
                  (data.details = "Round " + actualRoundNumber + " terminato"),
                  (data.state = "Canzone da: " + animeName),
                  presence.setActivity(data);
              } else {
                if (
                  document
                    .querySelector("#qpHiderText")
                    .textContent.startsWith("Loading")
                ) {
                  (data.smallImageKey = "gamepad"),
                    (data.smallImageText = "Caricamento..."),
                    (data.details = "La partita sta per iniziare"),
                    (data.state = "Caricamento..."),
                    presence.setActivity(data);
                } else if (
                  document.querySelector("#qpHiderText").textContent ==
                  "Answers"
                ) {
                  (data.smallImageKey = "gamepad"),
                    (data.smallImageText = "Aspettando i risultati..."),
                    (data.details = "Round " + actualRoundNumber + " finito"),
                    (data.state = "Aspettando i risultati..."),
                    presence.setActivity(data);
                } else {
                  var timeRemaining = document.querySelector("#qpHiderText")
                    .textContent;
                  (data.smallImageKey = "gamepad"),
                    (data.smallImageText =
                      "Round: " +
                      actualRoundNumber +
                      "｜Tempo rimanente: " +
                      timeRemaining);
                  (data.details = "Round: " + totalRoundNumber),
                    (data.state = "Tempo rimanente: " + timeRemaining),
                    presence.setActivity(data);
                }
              }
            }
          }
        } else {
          browsingStamp = Math.floor(Date.now() / 1000);
          (data.smallImageKey = "menu"),
            (data.smallImageText = "Nel menù..."),
            (data.details = "Nel menù..."),
            (data.startTimestamp = browsingStamp);
          presence.setActivity(data);
        }
      } else {
        browsingStamp = Math.floor(Date.now() / 1000);
        (data.smallImageKey = "menu"),
          (data.smallImageText = "Nella homepage..."),
          (data.details = "Nella homepage"),
          (data.startTimestamp = browsingStamp);
        presence.setActivity(data);
      }
    } else if (document.location.pathname.startsWith("/legal/tos")) {
      browsingStamp = Math.floor(Date.now() / 1000);
      (data.smallImageKey = "info"),
        (data.smallImageText = "Termini di Servizio"),
        (data.details = "Legge i termini"),
        (data.state = "di servizio"),
        (data.startTimestamp = browsingStamp);
      presence.setActivity(data);
    } else if (document.location.pathname.startsWith("/legal/privacy")) {
      browsingStamp = Math.floor(Date.now() / 1000);
      (data.smallImageKey = "info"),
        (data.smallImageText = "Politica della Privacy"),
        (data.details = "Legge la politica della"),
        (data.state = "privacy"),
        (data.startTimestamp = browsingStamp);
      presence.setActivity(data);
    } else {
      browsingStamp = Math.floor(Date.now() / 1000);
      (data.smallImageKey = "search"),
        (data.smallImageText = "Navigando..."),
        (data.details = "Navigando..."),
        (data.startTimestamp = browsingStamp);
      presence.setActivity(data);
    }
  }
});

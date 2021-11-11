const presence = new Presence({
    clientId: "736620343279484959"
  }),
  _preStrings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused",
    browsing: "presence.activity.browsing"
  });

// Pre-declare variable
let radioStation = "",
  startTimeStamp = new Date().getTime();

presence.on("UpdateData", async () => {
  // code
  const preStrings = await _preStrings,
    state: PresenceData = {
      largeImageKey: "largeimage"
    };

  // In Radio
  if (
    (document.getElementById("stream-player") as HTMLElement).style.display ===
    "block"
  ) {
    const [codeChannel] = document
      .querySelector("a.slick-slide:nth-child(1)")
      .getAttribute("href")
      .split("/")
      .slice(-1);

    // If play
    if (document.querySelector(".icon--play-02").classList.contains("on")) {
      // This logic make timestamp can't changed.
      if (codeChannel !== radioStation) {
        radioStation = codeChannel;
        startTimeStamp = new Date().getTime();
      }

      state.details = `Listening to ${radioStation} channel.`;
      state.state = (
        document.querySelector(
          "a.slick-slide:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)"
        ) as HTMLElement
      ).textContent;
      state.smallImageKey = "spiriteplay";
      state.smallImageText = preStrings.play;
      state.startTimestamp = startTimeStamp;
    } else {
      // If pause
      if (codeChannel !== "___PAUSED___") {
        radioStation = "___PAUSED___";
        startTimeStamp = new Date().getTime();
      }

      state.details = "Paused.";
      state.state = `${codeChannel} channel.`;
      state.smallImageKey = "spiritepause";
      state.smallImageText = preStrings.pause;
    }
  } else {
    // Idling state
    state.details = "Idling";
    state.smallImageKey = "spiriteidling";
    state.smallImageText = preStrings.browsing;
  }

  presence.setActivity(state);
});

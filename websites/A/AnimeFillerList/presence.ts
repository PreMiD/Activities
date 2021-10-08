const presence = new Presence({
    clientId: "894342965772820490"
  }),
  browsingStamp = Math.floor(Date.now() / 1000);
presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
    largeImageKey: "animefillerlistlogo",
    startTimestamp: browsingStamp
  };

  if (document.location.pathname === "/") presenceData.details = "In home page...";
  else if (document.location.pathname.includes("/shows/latest-updates")) presenceData.details = "Viewing Lastest updates...";
  else if (document.location.pathname.includes("/shows/")) {
    presenceData.details = "Viewing filler list:";
    presenceData.state = document.querySelector(".Right > h1").textContent.replace("Filler List", " ");
  } else if (document.location.pathname.includes("/shows")) presenceData.details = "Browsing for anime filler list...";
  else if (document.location.pathname.includes("/search/node/")) {
    const search = document.location.pathname.split("/");
    presenceData.details = "Searching a filler list:";
    presenceData.state = search[search.length - 1].replace(/%20/g, " ");
  } else if (document.location.pathname.includes("/user/password")) presenceData.details = "Requesting a new password...";
  else if (document.location.pathname.includes("/user/register")) presenceData.details = "Creating a account...";
  else if (document.location.pathname.includes("/user/login")) presenceData.details = "Logging in...";
  else if (document.location.pathname.includes("/users/")) {
    const user = document.querySelector(".content > h1");
    presenceData.details = "Viewing a user:";
    presenceData.state = user.textContent;
    presenceData.buttons = [
      {
        label: "View User",
        url: `${document.URL}`
      }
    ];
  } else if (document.location.pathname.includes("/contact")) presenceData.details = "Contacting with the page...";
  else if (document.location.pathname.includes("/changelog")) presenceData.details = "Viewing Changelog...";
  else if (document.location.pathname.includes("/privacy-policy")) presenceData.details = "Viewing Privacy Policy...";

  if (!presenceData.details) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});

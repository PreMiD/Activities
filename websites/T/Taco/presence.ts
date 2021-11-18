const presence = new Presence({
  clientId: "722549030244057161"
});

presence.on("UpdateData", async () => {
  const data: PresenceData = {
    largeImageKey: "taco"
  };
  switch (location.pathname.split("/")[1]) {
    case "guide":
      presenceData.details = "Reading the guide";
      data.state = [
        document.querySelector(".sidebar-links > li > a.active")
          ? document.querySelector(".sidebar-links > li > a.active").textContent
          : null,
        document.querySelector(".sidebar-sub-header > a.active")
          ? document.querySelector(".sidebar-sub-header > a.active").textContent
          : null
      ]
        .filter((a) => !!a)
        .join(" ― ");
      break;
    default:
      presenceData.details = "Homepage";
      break;
  }
  presence.setActivity(data);
});

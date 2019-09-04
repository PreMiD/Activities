const presence = new Presence({
  clientId: "555834227833307146"
});

presence.on("UpdateData", async () => {
  const presenceData = await presence.getPageVariable("PreMiD_PresenceData");
  presence.setActivity(presenceData === null ? undefined : presenceData.data);
});

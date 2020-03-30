var presence = new Presence({
    clientId: "612042450785271811"
}), presenceData = {
    largeImageKey: "logo"
};
presence.on("UpdateData", async () => {
    var title = document.querySelector(".mtl.mbxxxl.xs-mts.xs-mbxs.petition-title");
    if (title !== null) {
        var votes = document.querySelector(".mbxs span strong");
        presenceData.details = title.innerText;
        presenceData.state = votes.innerText;
        presenceData.largeImageKey = "logo";
        presence.setActivity(presenceData);
    }
    else {
        var pageData = {
            details: "Browsing..",
            largeImageKey: "logo"
        };
        presence.setActivity(pageData);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUMxQixRQUFRLEVBQUUsb0JBQW9CO0NBQzlCLENBQUMsRUFDRixZQUFZLEdBQWlCO0lBQzVCLGFBQWEsRUFBRSxNQUFNO0NBQ3JCLENBQUM7QUFFSCxRQUFRLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxLQUFLLElBQUksRUFBRTtJQUNwQyxJQUFJLEtBQUssR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FDOUMsMkNBQTJDLENBQzNDLENBQUM7SUFDRixJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7UUFDbkIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3hELFlBQVksQ0FBQyxPQUFPLEdBQUksS0FBcUIsQ0FBQyxTQUFTLENBQUM7UUFDeEQsWUFBWSxDQUFDLEtBQUssR0FBSSxLQUFxQixDQUFDLFNBQVMsQ0FBQztRQUN0RCxZQUFZLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQztRQUVwQyxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ25DO1NBQU07UUFDTixJQUFJLFFBQVEsR0FBaUI7WUFDNUIsT0FBTyxFQUFFLFlBQVk7WUFDckIsYUFBYSxFQUFFLE1BQU07U0FDckIsQ0FBQztRQUNGLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDL0I7QUFDRixDQUFDLENBQUMsQ0FBQyJ9
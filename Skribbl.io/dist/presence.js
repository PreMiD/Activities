var presence = new Presence({
    clientId: "620829310399545344"
});
var elapsed = Math.floor(Date.now() / 1000);
presence.on("UpdateData", async () => {
    let data = {
        largeImageKey: "skribblio-logo"
    };
    var inGame = document.querySelector("#containerGamePlayers").textContent === ""
        ? false
        : true;
    if (inGame) {
        var round = document.querySelector("#round").textContent;
        data.details = round;
        if (elapsed == null) {
            elapsed = Math.floor(Date.now() / 1000);
        }
        data.startTimestamp = elapsed;
    }
    else {
        data.details = "Viewing the Homepage";
        elapsed = null;
    }
    presence.setActivity(data);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUMzQixRQUFRLEVBQUUsb0JBQW9CO0NBQzlCLENBQUMsQ0FBQztBQUVILElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBRTVDLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3BDLElBQUksSUFBSSxHQUFpQjtRQUN4QixhQUFhLEVBQUUsZ0JBQWdCO0tBQy9CLENBQUM7SUFDRixJQUFJLE1BQU0sR0FDVCxRQUFRLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsV0FBVyxLQUFLLEVBQUU7UUFDakUsQ0FBQyxDQUFDLEtBQUs7UUFDUCxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ1QsSUFBSSxNQUFNLEVBQUU7UUFDWCxJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUN6RCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFDcEIsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ3hDO1FBQ0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7S0FDOUI7U0FBTTtRQUNOLElBQUksQ0FBQyxPQUFPLEdBQUcsc0JBQXNCLENBQUM7UUFDdEMsT0FBTyxHQUFHLElBQUksQ0FBQztLQUNmO0lBQ0QsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixDQUFDLENBQUMsQ0FBQyJ9
const presence = new Presence({
    clientId: "636322995329302543"
}), strings = presence.getStrings({
    playing: "presence.playback.playing",
    paused: "presence.playback.paused",
    browsing: "presence.activity.browsing",
    episode: "presence.media.info.episode"
});
presence.on("UpdateData", async () => {
    let presenceData = {
        details: "Home",
        largeImageKey: "main"
    };
    if (document.location.pathname == "/home") {
        presence.setActivity(presenceData);
    }
    else if (document.location.pathname == "/buscar-projeto/anime") {
        presenceData.details = "Procurando anime...";
        presence.setActivity(presenceData);
    }
    else if (document.location.pathname.startsWith("/projeto/")) {
        let vid = document.getElementById("playerIframe");
        vid = vid.contentDocument.getElementsByTagName("video")[0];
        let anime = document.querySelectorAll(".content-heading h3")[0];
        if (document.getElementsByClassName("modal-open").length > 0) {
            if (vid && vid.currentTime > 0 && !vid.paused) {
                var { currentTime, duration } = vid;
                const start = Math.floor(Date.now() / 1000);
                presenceData.startTimestamp = start;
                presenceData.endTimestamp = Math.floor(start - currentTime + duration);
                presenceData.smallImageKey = "play";
                presenceData.smallImageText = (await strings).playing;
                let ep = document.getElementsByClassName("modal-title")[0];
                presenceData.details = anime.innerText;
                presenceData.state = `EP ${ep.innerText.substr(-2)}`;
            }
            else if (vid && vid.paused) {
                presenceData.details = anime.innerText;
                presenceData.smallImageKey = "paused";
                presenceData.smallImageText = (await strings).paused;
            }
            else {
                presenceData.details = `${anime.innerText}`;
            }
        }
        else {
            presenceData.details = `${anime.innerText}`;
        }
        presence.setActivity(presenceData);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUM1QixRQUFRLEVBQUUsb0JBQW9CO0NBQzlCLENBQUMsRUFDRixPQUFPLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztJQUM3QixPQUFPLEVBQUUsMkJBQTJCO0lBQ3BDLE1BQU0sRUFBRSwwQkFBMEI7SUFDbEMsUUFBUSxFQUFFLDRCQUE0QjtJQUN0QyxPQUFPLEVBQUUsNkJBQTZCO0NBQ3RDLENBQUMsQ0FBQztBQUVKLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3BDLElBQUksWUFBWSxHQUFpQjtRQUNoQyxPQUFPLEVBQUUsTUFBTTtRQUNmLGFBQWEsRUFBRSxNQUFNO0tBQ3JCLENBQUM7SUFDRixJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxJQUFJLE9BQU8sRUFBRTtRQUMxQyxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ25DO1NBQU0sSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSx1QkFBdUIsRUFBRTtRQUNqRSxZQUFZLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDO1FBQzdDLFFBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDbkM7U0FBTSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUM5RCxJQUFJLEdBQUcsR0FBUSxRQUFRLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3ZELEdBQUcsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELElBQUksS0FBSyxHQUFRLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJFLElBQUksUUFBUSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDN0QsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO2dCQUM5QyxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxHQUFHLEdBQUcsQ0FBQztnQkFDcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBRTVDLFlBQVksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO2dCQUNwQyxZQUFZLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLFdBQVcsR0FBRyxRQUFRLENBQUMsQ0FBQztnQkFDdkUsWUFBWSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7Z0JBQ3BDLFlBQVksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFFdEQsSUFBSSxFQUFFLEdBQVEsUUFBUSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVoRSxZQUFZLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ3ZDLFlBQVksQ0FBQyxLQUFLLEdBQUcsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDckQ7aUJBQU0sSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRTtnQkFDN0IsWUFBWSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO2dCQUN2QyxZQUFZLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztnQkFDdEMsWUFBWSxDQUFDLGNBQWMsR0FBRyxDQUFDLE1BQU0sT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO2FBQ3JEO2lCQUFNO2dCQUNOLFlBQVksQ0FBQyxPQUFPLEdBQUcsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDNUM7U0FDRDthQUFNO1lBQ04sWUFBWSxDQUFDLE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUM1QztRQUVELFFBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDbkM7QUFDRixDQUFDLENBQUMsQ0FBQyJ9
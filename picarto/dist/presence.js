var presence = new Presence({
    clientId: "630771716058120192"
}), strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
}), presenceData = {
    largeImageKey: "logo"
};
var browsingStamp = Math.floor(Date.now() / 1000);
presence.on("UpdateData", async () => {
    var video = document.querySelector("#picarto-player-1_html5_api");
    if (video !== null && !isNaN(video.duration)) {
        var title, uploader;
        title = document.querySelector(".d-flex h4");
        uploader = document.querySelector("#userbar-name .d-flex .d-inline-block");
        presenceData.details = title.innerText;
        presenceData.state = uploader.textContent;
        presenceData.largeImageKey = "logo";
        presenceData.smallImageKey = video.paused ? "pause" : "play";
        presenceData.smallImageText = video.paused
            ? (await strings).pause
            : (await strings).play;
        presenceData.startTimestamp = browsingStamp;
        presence.setTrayTitle(video.paused ? "" : title.innerText);
        if (video.paused) {
            delete presenceData.startTimestamp;
            delete presenceData.endTimestamp;
        }
        if (video && title !== null && uploader !== null) {
            presence.setActivity(presenceData, !video.paused);
        }
    }
    else {
        var pageData = {
            details: "Browsing..",
            largeImageKey: "logo"
        };
        presence.setActivity(pageData);
    }
});
function getTimestamps(videoTime, videoDuration) {
    var startTime = Date.now();
    var endTime = Math.floor(startTime / 1000) - videoTime + videoDuration;
    return [Math.floor(startTime / 1000), endTime];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUN4QixRQUFRLEVBQUUsb0JBQW9CO0NBQy9CLENBQUMsRUFDRixPQUFPLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztJQUM1QixJQUFJLEVBQUUsMkJBQTJCO0lBQ2pDLEtBQUssRUFBRSwwQkFBMEI7Q0FDbEMsQ0FBQyxFQUNGLFlBQVksR0FBaUI7SUFDM0IsYUFBYSxFQUFFLE1BQU07Q0FDdEIsQ0FBQztBQUVKLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBRWxELFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ25DLElBQUksS0FBSyxHQUFxQixRQUFRLENBQUMsYUFBYSxDQUNsRCw2QkFBNkIsQ0FDOUIsQ0FBQztJQUNGLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDNUMsSUFBSSxLQUFVLEVBQUUsUUFBYSxDQUFDO1FBRTlCLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzdDLFFBQVEsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFDM0UsWUFBWSxDQUFDLE9BQU8sR0FBSSxLQUFxQixDQUFDLFNBQVMsQ0FBQztRQUN4RCxZQUFZLENBQUMsS0FBSyxHQUFJLFFBQXdCLENBQUMsV0FBVyxDQUFDO1FBQzNELFlBQVksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO1FBQ3BDLFlBQVksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDN0QsWUFBWSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsTUFBTTtZQUN4QyxDQUFDLENBQUMsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxDQUFDLEtBQUs7WUFDdkIsQ0FBQyxDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDekIsWUFBWSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFFNUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUzRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDaEIsT0FBTyxZQUFZLENBQUMsY0FBYyxDQUFDO1lBQ25DLE9BQU8sWUFBWSxDQUFDLFlBQVksQ0FBQztTQUNsQztRQUVELElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxJQUFJLElBQUksUUFBUSxLQUFLLElBQUksRUFBRTtZQUNoRCxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNuRDtLQUNGO1NBQU07UUFDTCxJQUFJLFFBQVEsR0FBaUI7WUFDM0IsT0FBTyxFQUFFLFlBQVk7WUFDckIsYUFBYSxFQUFFLE1BQU07U0FDdEIsQ0FBQztRQUNGLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDaEM7QUFDSCxDQUFDLENBQUMsQ0FBQztBQU9ILFNBQVMsYUFBYSxDQUFDLFNBQWlCLEVBQUUsYUFBcUI7SUFDN0QsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzNCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLFNBQVMsR0FBRyxhQUFhLENBQUM7SUFDdkUsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ2pELENBQUMifQ==
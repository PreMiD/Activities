var iframe = new iFrame();
iframe.on("UpdateData", async () => {
    if (document.querySelector(".bilibili-player-video video") !== null) {
        var video = document.querySelector(".bilibili-player-video video");
        if (video != undefined && !isNaN(video.duration)) {
            var test = video.paused;
            iframe.send({
                iframe_video: {
                    iFrameVideo: true,
                    test: test,
                    currTime: video.currentTime,
                    dur: video.duration,
                    pause: test
                }
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWZyYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vaWZyYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7QUFDMUIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDakMsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLDhCQUE4QixDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ25FLElBQUksS0FBSyxHQUFxQixRQUFRLENBQUMsYUFBYSxDQUNsRCw4QkFBOEIsQ0FDL0IsQ0FBQztRQUVGLElBQUksS0FBSyxJQUFJLFNBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDaEQsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNWLFlBQVksRUFBRTtvQkFDWixXQUFXLEVBQUUsSUFBSTtvQkFDakIsSUFBSSxFQUFFLElBQUk7b0JBQ1YsUUFBUSxFQUFFLEtBQUssQ0FBQyxXQUFXO29CQUMzQixHQUFHLEVBQUUsS0FBSyxDQUFDLFFBQVE7b0JBQ25CLEtBQUssRUFBRSxJQUFJO2lCQUNaO2FBQ0YsQ0FBQyxDQUFDO1NBQ0o7S0FDRjtBQUNILENBQUMsQ0FBQyxDQUFDIn0=
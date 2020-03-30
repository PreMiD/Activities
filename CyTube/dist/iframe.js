var iframe = new iFrame();
let sendback;
iframe.on("UpdateData", () => {
    const link = document.location;
    if (document.getElementsByTagName("video").length != 0) {
        let video = document.getElementsByTagName("video")[0];
        sendback = {
            audio: false,
            current_time: video.currentTime,
            duration: video.duration,
            paused: video.paused,
            site: link.href
        };
    }
    send();
});
function send() {
    iframe.send(sendback);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWZyYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vaWZyYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLElBQUksTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7QUFFMUIsSUFBSSxRQUFRLENBQUM7QUFFYixNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUU7SUFDNUIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUUvQixJQUFJLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQ3ZELElBQUksS0FBSyxHQUFxQixRQUFRLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEUsUUFBUSxHQUFHO1lBQ1YsS0FBSyxFQUFFLEtBQUs7WUFDWixZQUFZLEVBQUUsS0FBSyxDQUFDLFdBQVc7WUFDL0IsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRO1lBQ3hCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtZQUNwQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7U0FDZixDQUFDO0tBQ0Y7SUFDRCxJQUFJLEVBQUUsQ0FBQztBQUNSLENBQUMsQ0FBQyxDQUFDO0FBQ0gsU0FBUyxJQUFJO0lBQ1osTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QixDQUFDIn0=
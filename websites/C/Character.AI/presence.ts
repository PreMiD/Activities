const presence = new Presence({
    clientId: "1061324603022114998",
}),
browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", () => {
const presenceData: PresenceData = {
    largeImageKey: "https://i.imgur.com/eIpvMGf.png",

    startTimestamp: browsingTimestamp,
};

if (document.location.pathname === "/"){
    presenceData.details = "In the Homepage";
}
else if (document.location.pathname.startsWith("/chat")) {
        presenceData.details = "Chatting with";

        let char = document
        .querySelector("head > title")
        .textContent.replace("Character.AI - ", "");
        
        let pict = document
        .querySelector("meta[property='og:image']")
        .getAttribute("content")

        presenceData.largeImageKey = `${pict.replace("80", "400")}`
        presenceData.state = `${char}`;
        presenceData.buttons = [
            { label: `Chat ${char}`, url: document.location.href },
        ]; 
             
} else if (document.location.pathname.startsWith("/feed")) {
    presenceData.details = "Browsing the feed";

} else if (document.location.pathname.startsWith("/post")) {
    presenceData.details = "Viewing a post";

} else if (document.location.pathname.startsWith("/signup")){
    presenceData.details = "Signing up";

} else if (document.location.pathname.startsWith("/character/create")){
    presenceData.details = "Creating a character";

} else if (document.location.pathname.startsWith("/chats")){
    presenceData.details = "Browsing chats";

} else if (document.location.pathname.startsWith("/community")) {
    presenceData.details = "Viewing the community tab";

} else if (document.location.pathname.startsWith("/profile")) {
    presenceData.details = "Viewing my profile";
    
}
else presenceData.details = "Browsing...";

if (presenceData.details) presence.setActivity(presenceData);
else presence.setActivity();
});
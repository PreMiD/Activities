let presence : Presence = new Presence({
    clientId: "614220272790274199"
}),
startedBrowsing : number = Math.floor(Date.now() / 1000),
presenceData : presenceData = {
    largeImageKey: "anilist_lg",
    startTimestamp: startedBrowsing
},
strings = presence.getStrings({
    "browsing": "presence.activity.browsing"
}),
path : string,
user : string,
title : string;

presence.on("UpdateData", async () => {
    path = window.location.pathname;
    if (path.includes('home')) {
        presenceData.details = (await strings).browsing;
        presenceData.state = "Home";
    } else if (path.includes('animelist')) {
        user = document.querySelector('.name').textContent;
        presenceData.details = user + "'s animelist";
        delete presenceData.state, presenceData.smallImageKey;
    } else if (path.includes('mangalist')) {
        user = document.querySelector('.name').textContent;
        presenceData.details = user + "'s mangalist";
        delete presenceData.state, presenceData.smallImageKey;
    } else if (path.includes('user')) {
        user = document.querySelector('.name').textContent;
        presenceData.details = "Viewing " + user + "'s profile";
        delete presenceData.state, presenceData.smallImageKey;
    } else if (path.includes('search')) {
        presenceData.details = "Searching for an anime";
        presenceData.state = "'" + (document.querySelector('input.el-input__inner') as HTMLInputElement).value + "'";
        presenceData.smallImageKey = "search";
        presenceData.smallImageText = "Searching";
    } else if (path.includes('anime')) {
        title = document.querySelector('div.content > h1').textContent.trim();
        presenceData.details = "Viewing an anime";
        presenceData.state = title;
        delete presenceData.smallImageKey;
    } else if (path.includes('manga')) {
        title = document.querySelector('div.content > h1').textContent.trim();
        presenceData.details = "Viewing a manga";
        presenceData.state = title;
        delete presenceData.smallImageKey;
    } else if (path.includes('forum')) {
        if (path.split('/').length > 3) {
            presenceData.details = "Reading a forum post"
            presenceData.state = "'" + document.querySelector('h1.title').textContent.trim() + "'";
        } else {
            presenceData.details = "Browsing the forum";
            delete presenceData.state;
        }
        delete presenceData.smallImageKey;
    } else if (path.includes('studio')) {
        presenceData.details = "Viewing a studio";
        presenceData.state = document.querySelector('div.container > h1').textContent;
        delete presenceData.smallImageKey;
    } else {
        presenceData.details = "Somewhere unknown"
        delete presenceData.state, presenceData.smallImageKey;
    }
    presence.setActivity(presenceData, true);
})

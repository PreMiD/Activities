var presence = new Presence({
    clientId: "644400074008297512"
});
var browsingStamp = Math.floor(Date.now() / 1000), href = new URL(document.location.href), presenceData = {
    details: "In construction",
    state: null,
    largeImageKey: "lg",
    startTimestamp: browsingStamp,
    endTimestamp: null
}, updateCallback = {
    _function: null,
    get function() {
        return this._function;
    },
    set function(parameter) {
        this._function = parameter;
    },
    get present() {
        return this._function !== null;
    }
};
(() => {
    if (href.host === "www.fandom.com") {
        if (href.pathname === "/") {
            presenceData.state = "Index";
            delete presenceData.details;
        }
        else if (href.pathname.includes("/signin")) {
            presenceData.details = "Signing in";
        }
        else if (href.pathname.includes("/register")) {
            presenceData.details = "Registering an account";
            delete presenceData.details;
        }
        else if (href.pathname.includes("/articles/")) {
            presenceData.details = "Reading an article";
            presenceData.state = document.querySelector(".article-header__title").textContent;
        }
        else if (href.pathname.includes("/topics/")) {
            presenceData.details = "Viewing a topic";
            presenceData.state = document.querySelector(".topic-header__title").firstElementChild.innerHTML;
        }
        else if (href.pathname.includes("/video")) {
            updateCallback.function = () => {
                resetData();
                presenceData.details = "Watching a video";
                presenceData.state = document.querySelector(".video-page-featured-player__title").textContent;
                try {
                    if (document
                        .querySelector(".jw-icon-playback")
                        .getAttribute("aria-label") === "Pause") {
                        let video = document.querySelector(".jw-video");
                        let timestamps = getTimestamps(Math.floor(video.currentTime), Math.floor(video.duration));
                        presenceData.startTimestamp = timestamps[0];
                        presenceData.endTimestamp = timestamps[1];
                    }
                    else {
                        delete presenceData.startTimestamp;
                        delete presenceData.endTimestamp;
                    }
                }
                catch (e) {
                    delete presenceData.startTimestamp;
                    delete presenceData.endTimestamp;
                }
                console.log(presenceData);
            };
        }
        else if (href.pathname.includes("/curated/")) {
            presenceData.details = "Viewing a curation";
            presenceData.state = document.querySelector(".card__title").textContent;
        }
        else {
            presenceData.details = "Viewing a page";
            if (href.pathname.includes("/explore"))
                presenceData.state = "Explore";
            else if (href.pathname.includes("/about"))
                presenceData.state = "About";
            else if (href.pathname.includes("/carriers"))
                presenceData.state = "Carriers";
            else if (href.pathname.includes("/terms-of-use"))
                presenceData.state = "Terms of Use";
            else if (href.pathname.includes("/privacy-policy"))
                presenceData.state = "Privacy Policy";
            else if (href.pathname.includes("/mediakit"))
                presenceData.state = "Media Kit";
            else if (href.pathname.includes("/local-sitemap"))
                presenceData.state = "Local Sitemap";
        }
    }
    else if (href.pathname.includes("/wiki/")) {
        let title, sitename, actionResult = href.searchParams.get("action") || href.searchParams.get("veaction"), titleFromURL = () => {
            let raw, lang;
            if (href.pathname.startsWith("/wiki/")) {
                raw = href.pathname.slice(6);
            }
            else {
                lang = href.pathname.split("/")[0];
                raw = href.pathname.slice(7 + lang.length);
            }
            if (raw.includes("_"))
                return raw.replace(/_/g, " ");
            else
                return raw;
        };
        try {
            title = document.querySelector(".page-header__title").innerHTML;
        }
        catch (e) {
            title = titleFromURL();
        }
        try {
            sitename = document.querySelector("meta[property='og:site_name']")
                .content;
        }
        catch (e) {
            sitename = null;
        }
        let namespaceDetails = {
            Media: "Viewing a media",
            Special: "Viewing a special page",
            Talk: "Viewing a talk page",
            User: "Viewing a user page",
            "User talk": "Viewing a user talk page",
            [sitename]: "Viewing a project page",
            [sitename + " talk"]: "Viewing a project talk page",
            File: "Viewing a file",
            "File talk": "Viewing a file talk page",
            MediaWiki: "Viewing a MediaWiki page",
            "MediaWiki talk": "Viewing a MediaWiki talk page",
            Template: "Viewing a template",
            "Template talk": "Viewing a template talk",
            Help: "Viewing a help page",
            "Help talk": "Viewing a help talk page",
            Category: "Viewing a category",
            "Category talk": "Viewing a category talk page",
            Blog: "Viewing a blog",
            "Message Wall": "Viewing a message wall",
            Thread: "Viewing a forum thread",
            Board: "Viewing a forum board",
            Topic: "Viewing a forum topic"
        };
        if (title === "Home") {
            sitename = document.querySelector("meta[property='og:title']").content;
            presenceData.state = "Home";
            delete presenceData.details;
        }
        else if (actionResult == "history" && titleFromURL) {
            presenceData.details = "Viewing revision history";
            presenceData.state = titleFromURL();
        }
        else if (actionResult == "edit" && titleFromURL) {
            if (href.searchParams.has("action"))
                title = document.querySelector("#EditPageHeader").children[2]
                    .textContent;
            presenceData.details = "Editing a wiki page";
            presenceData.state = titleFromURL();
        }
        else if (href.pathname.includes("User_blog:")) {
            if (title) {
                presenceData.details = "Reading a user blog post";
                presenceData.state =
                    title +
                        " by " +
                        document.querySelector(".page-header__blog-post-details")
                            .firstElementChild.textContent;
            }
            else {
                presenceData.details = "Viewing a user blog";
                presenceData.state = titleFromURL();
            }
        }
        else {
            if (namespaceDetails[title.split(":")[0]])
                presenceData.details = namespaceDetails[title.split(":")[0]];
            else
                presenceData.details = "Reading a wiki page";
            presenceData.state = title;
        }
        presenceData.startTimestamp = browsingStamp;
        presenceData.state += " | " + sitename;
    }
    else if (href.pathname === "/f" || href.pathname.includes("/f/")) {
        updateCallback.function = () => {
            var presenceData = {
                details: "In construction",
                state: null,
                largeImageKey: "lg",
                startTimestamp: browsingStamp
            };
            href = new URL(document.location.href);
            if (href.pathname === "/f") {
                presenceData.details = "Viewing the discussion page";
            }
            else if (href.pathname.includes("/p/")) {
                presenceData.details = "Reading an discussion post";
                presenceData.state = document.querySelector(".post__title").textContent;
            }
            else if (href.pathname.includes("/u/")) {
                presenceData.details = "Viewing a discussion user page";
                presenceData.state = document.querySelector(".user-overview__username").textContent;
            }
            cleanData();
        };
    }
    cleanData();
})();
if (updateCallback.present) {
    presence.on("UpdateData", async () => {
        updateCallback.function();
        presence.setActivity(presenceData);
    });
}
else {
    presence.on("UpdateData", async () => {
        presence.setActivity(presenceData);
    });
}
function getTimestamps(videoTime, videoDuration) {
    var startTime = Date.now();
    var endTime = Math.floor(startTime / 1000) - videoTime + videoDuration;
    return [Math.floor(startTime / 1000), endTime];
}
function resetData() {
    presenceData = {
        details: "In construction",
        state: null,
        largeImageKey: "lg",
        startTimestamp: browsingStamp,
        endTimestamp: null
    };
}
function cleanData() {
    if (presenceData.state === null)
        delete presenceData.state;
    if (presenceData.endTimestamp === null)
        delete presenceData.endTimestamp;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUMzQixRQUFRLEVBQUUsb0JBQW9CO0NBQzlCLENBQUMsQ0FBQztBQUVILElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUNoRCxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFDdEMsWUFBWSxHQUFHO0lBQ2QsT0FBTyxFQUFVLGlCQUFpQjtJQUNsQyxLQUFLLEVBQVUsSUFBSTtJQUNuQixhQUFhLEVBQVUsSUFBSTtJQUMzQixjQUFjLEVBQVUsYUFBYTtJQUNyQyxZQUFZLEVBQVUsSUFBSTtDQUMxQixFQUNELGNBQWMsR0FBRztJQUNoQixTQUFTLEVBQUUsSUFBSTtJQUNmLElBQUksUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN2QixDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsU0FBUztRQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUM1QixDQUFDO0lBQ0QsSUFBSSxPQUFPO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQztJQUNoQyxDQUFDO0NBQ0QsQ0FBQztBQUVILENBQUMsR0FBRyxFQUFFO0lBQ0wsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLGdCQUFnQixFQUFFO1FBUW5DLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxHQUFHLEVBQUU7WUFDMUIsWUFBWSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7WUFDN0IsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDO1NBQzVCO2FBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFT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
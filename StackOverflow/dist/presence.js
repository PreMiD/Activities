var presence = new Presence({
    clientId: "610123745033584651"
}), strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
});
var browsingStamp = Math.floor(Date.now() / 1000);
var title, pageNumber, jobPageNumber, usersortagsPageNumber, allPages, lastPage, jobLastPage, questionsLastPage;
presence.on("UpdateData", async () => {
    let presenceData = {
        details: "Unknown page",
        largeImageKey: "lg"
    };
    title = document.querySelector("div#question-header h1 a");
    pageNumber = document.querySelector("div.pager.fl span.page-numbers.current");
    usersortagsPageNumber = document.querySelector("div.pager.fr span.page-numbers.current");
    jobPageNumber = document.querySelector("div:nth-child(1) > div > a.job-link.selected");
    allPages = document.querySelectorAll("div.pager.fr a");
    jobLastPage = document.querySelectorAll("div.pagination a");
    questionsLastPage = document.querySelectorAll("div.pager.fl a");
    if (document.location.pathname.includes("/users") ||
        document.location.pathname.includes("/tags")) {
        lastPage = allPages[allPages.length - 2].innerText;
    }
    else if (document.location.pathname.includes("/jobs")) {
        lastPage = jobLastPage[jobLastPage.length - 2].innerText;
    }
    else if (document.location.pathname == "/questions") {
        lastPage = questionsLastPage[questionsLastPage.length - 2].innerText;
    }
    if (title && document.location.pathname.includes("/questions/")) {
        presenceData.details = "Reading a question.";
        presenceData.state = title.innerText;
        presenceData.startTimestamp = browsingStamp;
    }
    else {
        if (document.location.pathname == "/") {
            presenceData.state = "Main Page | Home";
            presenceData.startTimestamp = browsingStamp;
            delete presenceData.details;
        }
        else if (document.location.pathname == "/questions" &&
            pageNumber.innerText.length > 0) {
            var lastPageNumber = +lastPage;
            var lastquestionsPageNumber = +pageNumber.innerText;
            if (lastquestionsPageNumber > lastPageNumber) {
                console.log(lastPageNumber + " --- " + lastquestionsPageNumber);
                lastPage = pageNumber.innerText;
            }
            presenceData.details = "Browsing all the questions.";
            presenceData.state =
                "Current page: " + pageNumber.innerText + "/" + lastPage;
            presenceData.startTimestamp = browsingStamp;
        }
        else if (document.location.pathname == "/jobs") {
            let lastPageNumber = +lastPage;
            var lastjobPageNumber = +jobPageNumber.innerText;
            if (lastjobPageNumber > lastPageNumber) {
                console.log(lastPageNumber + " --- " + lastjobPageNumber);
                lastPage = jobPageNumber.innerText;
            }
            presenceData.details = "Browsing jobs.";
            presenceData.state =
                "Current page: " + jobPageNumber.innerText + "/" + lastPage;
            presenceData.startTimestamp = browsingStamp;
        }
        else if (document.location.pathname == "/users") {
            let lastPageNumber = +lastPage;
            var lastusersortagsPageNumber = +usersortagsPageNumber.innerText;
            if (lastusersortagsPageNumber > lastPageNumber) {
                console.log(lastPageNumber + " --- " + lastusersortagsPageNumber);
                lastPage = usersortagsPageNumber.innerText;
            }
            presenceData.details = "Browsing users.";
            presenceData.state =
                "Current page: " + usersortagsPageNumber.innerText + "/" + lastPage;
            presenceData.startTimestamp = browsingStamp;
        }
        else if (document.location.pathname == "/tags") {
            let lastPageNumber = +lastPage;
            let lastusersortagsPageNumber = +usersortagsPageNumber.innerText;
            if (lastusersortagsPageNumber > lastPageNumber) {
                console.log(lastPageNumber + " --- " + lastusersortagsPageNumber);
                lastPage = usersortagsPageNumber.innerText;
            }
            presenceData.details = "Browsing tags.";
            presenceData.state =
                "Current page: " + usersortagsPageNumber.innerText + "/" + lastPage;
            presenceData.startTimestamp = browsingStamp;
        }
    }
    presence.setActivity(presenceData);
});
function getTimestamps(videoTime, videoDuration) {
    var startTime = Date.now();
    var endTime = Math.floor(startTime / 1000) - videoTime + videoDuration;
    return [Math.floor(startTime / 1000), endTime];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUMxQixRQUFRLEVBQUUsb0JBQW9CO0NBQzlCLENBQUMsRUFDRixPQUFPLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztJQUM3QixJQUFJLEVBQUUsMkJBQTJCO0lBQ2pDLEtBQUssRUFBRSwwQkFBMEI7Q0FDakMsQ0FBQyxDQUFDO0FBRUosSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFFbEQsSUFBSSxLQUFVLEVBQ2IsVUFBZSxFQUNmLGFBQWtCLEVBQ2xCLHFCQUEwQixFQUMxQixRQUFhLEVBQ2IsUUFBYSxFQUNiLFdBQWdCLEVBQ2hCLGlCQUFzQixDQUFDO0FBRXhCLFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3BDLElBQUksWUFBWSxHQUFpQjtRQUNoQyxPQUFPLEVBQUUsY0FBYztRQUN2QixhQUFhLEVBQUUsSUFBSTtLQUNuQixDQUFDO0lBRUYsS0FBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUUzRCxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0lBRTlFLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQzdDLHdDQUF3QyxDQUN4QyxDQUFDO0lBRUYsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQ3JDLDhDQUE4QyxDQUM5QyxDQUFDO0lBRUYsUUFBUSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRXZELFdBQVcsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUU1RCxpQkFBaUIsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUVoRSxJQUNDLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFDN0MsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUMzQztRQUNELFFBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7S0FDbkQ7U0FBTSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUN4RCxRQUFRLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0tBQ3pEO1NBQU0sSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxZQUFZLEVBQUU7UUFDdEQsUUFBUSxHQUFHLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7S0FDckU7SUFFRCxJQUFJLEtBQUssSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7UUFDaEUsWUFBWSxDQUFDLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQztRQUU3QyxZQUFZLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFFckMsWUFBWSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7S0FDNUM7U0FBTTtRQUNOLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLElBQUksR0FBRyxFQUFFO1lBQ3RDLFlBQVksQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLENBQUM7WUFFeEMsWUFBWSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7WUFFNUMsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFDO1NBQzVCO2FBQU0sSUFDTixRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxZQUFZO1lBQzFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDOUI7WUFDRCxJQUFJLGNBQWMsR0FBVyxDQUFDLFFBQVEsQ0FBQztZQUN2QyxJQUFJLHVCQUF1QixHQUFXLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztZQUU1RCxJQUFJLHVCQUF1QixHQUFHLGNBQWMsRUFBRTtnQkFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsT0FBTyxHQUFHLHVCQUF1QixDQUFDLENBQUM7Z0JBRWhFLFFBQVEsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO2FBQ2hDO1lBRUQsWUFBWSxDQUFDLE9BQU8sR0FBRyw2QkFBNkIsQ0FBQztZQUVyRCxZQUFZLENBQUMsS0FBSztnQkFDakIsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDO1lBRTFELFlBQVksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1NBQzVDO2FBQU0sSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxPQUFPLEVBQUU7WUFDakQsSUFBSSxjQUFjLEdBQVcsQ0FBQyxRQUFRLENBQUM7WUFDdkMsSUFBSSxpQkFBaUIsR0FBVyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUM7WUFFekQsSUFBSSxpQkFBaUIsR0FBRyxjQUFjLEVBQUU7Z0JBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUUxRCxRQUFRLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQzthQUNuQztZQUVELFlBQVksQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7WUFFeEMsWUFBWSxDQUFDLEtBQUs7Z0JBQ2pCLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQztZQUU3RCxZQUFZLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztTQUM1QzthQUFNLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLElBQUksUUFBUSxFQUFFO1lBQ2xELElBQUksY0FBYyxHQUFXLENBQUMsUUFBUSxDQUFDO1lBQ3ZDLElBQUkseUJBQXlCLEdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUM7WUFFekUsSUFBSSx5QkFBeUIsR0FBRyxjQUFjLEVBQUU7Z0JBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLE9BQU8sR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO2dCQUVsRSxRQUFRLEdBQUcscUJBQXFCLENBQUMsU0FBUyxDQUFDO2FBQzNDO1lBRUQsWUFBWSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQztZQUV6QyxZQUFZLENBQUMsS0FBSztnQkFDakIsZ0JBQWdCLEdBQUcscUJBQXFCLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUM7WUFFckUsWUFBWSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7U0FDNUM7YUFBTSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxJQUFJLE9BQU8sRUFBRTtZQUNqRCxJQUFJLGNBQWMsR0FBVyxDQUFDLFFBQVEsQ0FBQztZQUN2QyxJQUFJLHlCQUF5QixHQUFXLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDO1lBRXpFLElBQUkseUJBQXlCLEdBQUcsY0FBYyxFQUFFO2dCQUMvQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxPQUFPLEdBQUcseUJBQXlCLENBQUMsQ0FBQztnQkFFbEUsUUFBUSxHQUFHLHFCQUFxQixDQUFDLFNBQVMsQ0FBQzthQUMzQztZQUVELFlBQVksQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLENBQUM7WUFFeEMsWUFBWSxDQUFDLEtBQUs7Z0JBQ2pCLGdCQUFnQixHQUFHLHFCQUFxQixDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDO1lBRXJFLFlBQVksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO1NBQzVDO0tBQ0Q7SUFFRCxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLENBQUMsQ0FBQyxDQUFDO0FBT0gsU0FBUyxhQUFhLENBQUMsU0FBaUIsRUFBRSxhQUFxQjtJQUM5RCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDM0IsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsU0FBUyxHQUFHLGFBQWEsQ0FBQztJQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDaEQsQ0FBQyJ9
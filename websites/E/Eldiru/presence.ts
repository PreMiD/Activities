var eldiru = new Presence({
    clientId: "798139973240225812"
  });
  
  var browsingStamp = Math.floor(Date.now() / 1000);
  
  var course: any;
  var sub: any;
  
  eldiru.on("UpdateData", async () => {
    const presenceData: PresenceData = {
      largeImageKey: "logo"
    };
  
    if (document.location.hostname == "eldiru.unsoed.ac.id") {
      if (document.location.pathname == "/") {
        presenceData.startTimestamp = browsingStamp;
        presenceData.details = "Viewing homepage";
      } else if (document.location.pathname.includes("/login")) {
        presenceData.startTimestamp = browsingStamp;
        presenceData.details = "Viewing login page";
      } else if (document.location.pathname.includes("/my")) {
        presenceData.startTimestamp = browsingStamp;
        presenceData.details = "Viewing dashboard";
      } else if (document.location.pathname.includes("/course/")) {
        presenceData.startTimestamp = browsingStamp;
        course = document.querySelector(
          "#page-course-view-topics > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1"
        );
        presenceData.details = "Viewing course:";
        presenceData.state = course.innerText;
      } else if (document.location.pathname.includes("/mod/attendance/")) {
        presenceData.startTimestamp = browsingStamp;
        course = document.querySelector(
          "#page-mod-attendance-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1"
        );
        if (
          document.querySelector(
            "#page-mod-attendance-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          ) !== null
        ){
          sub = document.querySelector(
            "#page-mod-attendance-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          );
          presenceData.details = "Viewing " + sub.innerText;
        } else {
        presenceData.details = "Viewing attendance:";
        }
        presenceData.state = course.innerText;
      } else if (document.location.pathname.includes("/mod/forum/")) {
        presenceData.startTimestamp = browsingStamp;
        course = document.querySelector(
          "#page-mod-forum-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1"
        );
        if (
          document.querySelector(
            "#page-mod-forum-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          ) !== null
        ){
          sub = document.querySelector(
            "#page-mod-forum-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          );
          presenceData.details = "Viewing " + sub.innerText;
        } else {
        presenceData.details = "Viewing forum:";
        }
        presenceData.state = course.innerText;
      } else if (document.location.pathname.includes("/mod/page/")) {
        presenceData.startTimestamp = browsingStamp;
        course = document.querySelector(
          "#page-mod-page-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1"
        );
        if (
          document.querySelector(
            "#page-mod-page-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          ) !== null
        ){
          sub = document.querySelector(
            "#page-mod-page-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          );
          presenceData.details = "Viewing " + sub.innerText;
        } else {
        presenceData.details = "Viewing page:";
        }
        presenceData.state = course.innerText;
      } else if (document.location.pathname.includes("/mod/assign/")) {
        presenceData.startTimestamp = browsingStamp;
        course = document.querySelector(
          "#page-mod-assign-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1"
        );
        if (
          document.querySelector(
            "#page-mod-assign-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          ) !== null
        ){
          sub = document.querySelector(
            "#page-mod-assign-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          );
          presenceData.details = "Viewing " + sub.innerText;
        } else {
        presenceData.details = "Viewing assignment:";
        }
        presenceData.state = course.innerText;
      } else if (document.location.pathname.includes("/mod/quiz/")) {
        presenceData.startTimestamp = browsingStamp;
        course = document.querySelector(
          "#page-mod-quiz-view > div#page-wrapper > div#page > div#learningcontent > header#page-header > div.col-12 > div.card > div.card-body > div.d-flex > div.mr-auto > a > div.page-context-header > div.page-header-headings > h1"
        );
        if (
          document.querySelector(
            "#page-mod-quiz-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          ) !== null
        ){
          sub = document.querySelector(
            "#page-mod-quiz-view > div#page-wrapper > div#page > div#learningcontent > div#page-content > div#region-main-box > section#region-main > div > h2"
          );
          presenceData.details = "Viewing " + sub.innerText;
        } else {
        presenceData.details = "Viewing quiz:";
        }
        presenceData.state = course.innerText;
      }
  
    if (presenceData.details == null) {
      eldiru.setTrayTitle();
      eldiru.setActivity();
    } else {
      eldiru.setActivity(presenceData);
    }
  }
});
  
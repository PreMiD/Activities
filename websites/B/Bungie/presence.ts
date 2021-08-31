const presence = new Presence({
    clientId: "711393222252822539"
  }),
  browsingStamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "logo",
      startTimestamp: browsingStamp
    },
    path = document.location.pathname;
  if (
    window.location.hostname === "bungie.net" ||
    window.location.hostname === "www.bungie.net"
  )
    presenceData.details = "Viewing the Bungie.net Homepage";
  else if (window.location.hostname === "comics.bungie.net")
    presenceData.details = "Readig Destiny Comics";

  if (path === "/7/en/Destiny/NewLight")
    presenceData.details = "Looking at Destiny Two NewLight";
  else if (path === "/7/en/Destiny/Shadowkeep")
    presenceData.details = "Checking out Destiny Two Shadowkeep";
  else if (path === "/7/en/Destiny/Forsaken")
    presenceData.details = "Checking out Destiny Two Forsaken";
  else if (path === "/7/en/Seasons/SeasonOfTheWorthy")
    presenceData.details = "Checking out Destiny Two Season of the Worthy";
  else if (path === "/7/en/Seasons/SeasonOfDawn")
    presenceData.details = "Checking out Destiny Two Season of Dawn";
  else if (path === "/7/en/Seasons/SeasonOfTheUndying")
    presenceData.details = "Checking out Destiny Two Season of the Undying";
  else if (path.includes("/en/Explore/Detail/News/")) {
    const title = document.querySelector("#article-container > h1").innerHTML;

    presenceData.details = `Reading ${title}`;
  } else if (path === "/en/News")
    presenceData.details = "Cheking out news from Bungie";
  else if (path === "/en/ClanV2/Chat") {
    const titleSix = document.querySelector(
      "#clanSideBar > div.container-left.customScroll.customScrollOff > a > div.compact-clanidentity-containter > div.clanNameContainer > h2"
    ).innerHTML;

    presenceData.details = `Looking at thier clan:  ${titleSix
      .replace("<span>", "")
      .replace("</span>", "")}`;
  } else if (path.includes("/en/Forums/Topics")) {
    const titleThirteen = document.querySelector("head > title");

    presenceData.details = `Looking at ${titleThirteen.innerHTML}`;
  } else if (path.includes("/en/Forums/Post/")) {
    const titleFourteen = document.querySelector(
        "#topicPost > div > div.threadMeta > div > div > div.authorMeta > a"
      ),
      titleTwo = document.querySelector(
        "#topicPost > div > div.threadMeta > div > h1"
      );

    presenceData.details = `Looking at: ${titleTwo.innerHTML}By: ${titleFourteen.innerHTML}`;
  } else if (path.includes("/en/ClanV2/MyClans"))
    presenceData.details = "Looking at the clans they are apart of";
  else if (path.includes("/en/ClanV2/Index")) {
    const titleSeven = document.querySelector(
      "#mainContent > div.darkThemeContent.grid.full-screen > div > div.container_bodyContent.customScroll > div.header > div.clanIdentity > h1"
    );

    presenceData.details = `Concerding joining clan ${titleSeven}`;
  } else if (path.includes("/en/ClanV2/Fireteam"))
    presenceData.details = "Checking out the available fireteams";
  else if (path.includes("/en/ClanV2/PublicFireteam")) {
    const titleNine = document.querySelector(
      "#clan-container > div > div > div > div > div.activity-header > h2"
    );

    presenceData.details = `Interested in in fireteam ${titleNine.innerHTML}`;
  } else if (path.includes("en/Groups/SuggestedGroups"))
    presenceData.details = "Looking at the groups Bungie suggested to them";
  else if (path.includes("en/Groups/MyGroups"))
    presenceData.details = "Searching for groups";
  else if (path.includes("en/Groups/Popular"))
    presenceData.details = "Looking at the groups they're apart of";
  else if (path.includes("/en/Groups/Search"))
    presenceData.details = "Searching for groups";
  else if (path.includes("/en/Groups/Chat")) {
    const titleTen = document.querySelector("#groupName");

    presenceData.details = `Interested/Joined group ${titleTen.innerHTML}`;
  } else if (path.includes("/en/Community/Creations"))
    presenceData.details = "Looking at the creations the community made";
  else if (path.includes("/en/Community/Detail")) {
    const titleEleven = document.querySelector(
        "#mainContent > div.community-detail-header > div > div > div.community-details.flex > div.title"
      ),
      titleTwelve = document.querySelector(
        "#mainContent > div.community-detail-header > div > div > div.community-meta > span:nth-child(1) > a"
      );

    presenceData.details = `Looking at ${titleEleven.innerHTML} By: ${titleTwelve.innerHTML}`;
  } else if (path === "/en/Help")
    presenceData.details = "Getting help from Bungie";
  else if (path === "/en/Support")
    presenceData.details = "Getting help from Bungie";
  else if (path.includes("/en/Help/Index")) {
    const titleFifteen = document.querySelector("#searchValue");

    presenceData.details = `Helpful ${titleFifteen.innerHTML}`;
  } else if (path.includes("/en/Help/Article/")) {
    const titleSeventeen = document.querySelector(
      "#mainContent > div.content_main > div.container_help.grid > div.container_helpContent.grid-col-9.grid-col-9-medium.grid-col-12-mobile > div.content_help > div > div.HelpItemTitle"
    );

    presenceData.details = `Reading ${titleSeventeen.innerHTML}`;
  } else if (path.includes("/en/guide/destiny2")) {
    const titleEighteen = document.querySelector(
      "#guide-container > div.header > h1"
    );

    presenceData.details = `Reading ${titleEighteen.innerHTML}`;
  } else if (path.includes("/en/Help/Troubleshoot")) {
    const titleNinteen = document.querySelector(
      "#mainContent > div.content_main > div.container_help.grid > div.container_helpContent.grid-col-9.grid-col-9-medium.grid-col-12-mobile > div.troubleshootStep > h3"
    );

    presenceData.details = `Reading ${titleNinteen.innerHTML}`;
  } else if (path.includes("/en/Support/Troubleshoot")) {
    const titleTwenty = document.querySelector(
      "#mainContent > div.content_main > div.container_help.grid > div.container_helpContent.grid-col-9.grid-col-9-medium.grid-col-12-mobile > div.troubleshootStep > h3"
    );

    presenceData.details = `Reading ${titleTwenty.innerHTML}`;
  }
  if (!presenceData.details) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});

// Fixed & improved by Unpainful 💻🔥
import { ActivityType, Assets } from "premid";

const presence = new Presence({ clientId: "1125405319594512404" });
const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = "https://cdn.rcd.gg/PreMiD/websites/K/Kick/assets/logo.png",
}

presence.on("UpdateData", async () => {
  const { pathname, hostname, href } = document.location;
  const videoEl = document.querySelector<HTMLVideoElement>("video");
  const pathArr = pathname.split("/");
  const { details, smallImageKey, largeImageKey, state, buttons } = getPageData(
    pathArr[1]!,
    pathArr[2]!,
    pathArr[3]!,
    hostname,
    href
  )!;

  const presenceData: PresenceData = {
    largeImageKey: largeImageKey || ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    details,
  } as PresenceData;

  if (buttons) presenceData.buttons = buttons;
  if (smallImageKey) presenceData.smallImageKey = smallImageKey;
  if (state) presenceData.state = state;

  if (videoEl?.duration && presenceData.smallImageKey !== Assets.Viewing) {
    presenceData.smallImageKey = videoEl.paused ? Assets.Pause : Assets.Play;
    presenceData.smallImageText = videoEl.paused ? "Paused" : "Playing";
    if (!videoEl.paused) {
      [presenceData.startTimestamp, presenceData.endTimestamp] =
        presence.getTimestampsfromMedia(videoEl);
    }
  }

  if (!(await presence.getSetting<boolean>("details"))) {
    presenceData.details = "Browsing Kick...";
    delete presenceData.state;
    presenceData.largeImageKey = ActivityAssets.Logo;
    delete presenceData.smallImageKey;
    delete presenceData.buttons;
  }

  if (await presence.getSetting<boolean>("logo"))
    presenceData.largeImageKey = ActivityAssets.Logo;

  if (
    presenceData.smallImageKey === Assets.Play ||
    presenceData.smallImageKey === Assets.Pause ||
    presenceData.smallImageKey === Assets.Viewing
  ) {
    presenceData.type = ActivityType.Watching;
  }

  if (details) presence.setActivity(presenceData);
});

function getPageData(
  page: string,
  pageDetail: string,
  title: string,
  hostname: string,
  url: string
): {
  details?: string;
  smallImageKey?: string;
  largeImageKey?: string;
  state?: string;
  buttons?: [ButtonData, ButtonData?];
} | undefined {
  switch (hostname) {
    case "kick.com": {
      switch (page) {
        case "":
          return { details: "Viewing home...", smallImageKey: Assets.Search };
        case "categories": {
          const activeMainCategory = document.querySelector(
            "a.category-tile-active"
          )?.textContent;
          let state = "";
          let largeImageKey = "";

          if (activeMainCategory) {
            state = activeMainCategory;
            const imageElement = document.querySelector(
              'a.category-tile-active [src$=".gif"]'
            )!;
            const newSrc = imageElement.getAttribute("src")!.replace(
              ".gif",
              ".png"
            );
            imageElement.setAttribute("src", newSrc);
            largeImageKey = newSrc;
          }

          if (pageDetail && title) {
            state += ` > ${formatText(pageDetail)} > ${formatText(title)}`;
            largeImageKey =
              document.querySelector<HTMLImageElement>("div.h-full > img")?.src ??
              "";
          }
          return {
            details: "Viewing categories...",
            state,
            largeImageKey,
            smallImageKey: Assets.Search,
          };
        }
        case "following":
          return {
            details: "Viewing following...",
            state: `${
              document.querySelector(".\\!border-primary\\/100")?.textContent
            } section`,
            smallImageKey: Assets.Search,
          };
        case "dashboard": {
          let state = document.querySelector(
            ".router-link-active .item-title"
          )?.textContent;
          const isContentExpanded = document.querySelector(
            ".content-expanded .item-title"
          );

          if (isContentExpanded) {
            state = `${isContentExpanded.textContent} > ${
              document.querySelector(
                ".content-expanded .router-link-active .item-title"
              )?.textContent
            }`;
          }

          return {
            details: `Viewing ${formatText(page)}...`,
            state: state ?? undefined,
            smallImageKey: Assets.Viewing,
          };
        }
        case "transactions":
          return {
            details: `Viewing ${formatText(page)}...`,
            state: formatText(pageDetail),
          };
        case "community-guidelines":
        case "dmca-policy":
        case "privacy-policy":
        case "terms-of-service":
          return {
            details: `Reading ${formatText(page)}...`,
            smallImageKey: Assets.Reading,
          };
        default: {
          const streamer = document.querySelector(
            ".stream-username,#channel-username"
          )?.textContent;
          const titleEl = document.querySelector("title")?.textContent;

          if (streamer && titleEl?.includes("Live")) {
            let smallImageKey = "";
            let state = "";
            let buttons: [ButtonData, ButtonData?];

            if (document.querySelector(".odometer-value")) {
              state = `Watching: ${streamer}`;
              smallImageKey = Assets.Live;
              buttons = [{ label: "Watch Stream", url }];
            } else {
              state = `Viewing: ${streamer}`;
              smallImageKey = Assets.Viewing;
              buttons = [{ label: "View Streamer", url }];
            }

            return {
              details:
                JSON.parse(
                  document.querySelectorAll('[type="application/ld+json"]')?.[1]
                    ?.textContent ?? ""
                )?.broadcastOfEvent?.name ?? "Unknown title",
              state,
              largeImageKey: document.querySelector<HTMLImageElement>(
                ".owner-avatar img"
              )?.src,
              smallImageKey,
              buttons,
            };
          } else if (streamer && titleEl?.includes("VOD")) {
            return {
              details: document.querySelector<HTMLMetaElement>(
                'meta[name="description"]'
              )?.content,
              state:
                document.querySelector("#channel-username")?.textContent ??
                undefined,
              largeImageKey: document.querySelector<HTMLImageElement>(
                ".owner-avatar img"
              )?.src,
              buttons: [{ label: "Watch Stream VOD", url }],
            };
          } else {
            return { details: "Browsing Kick..." };
          }
        }
      }
    }
    case "help.kick.com": {
      const topic = document.querySelector("header.text-2xl")?.textContent;
      switch (pageDetail) {
        case "collections":
          return {
            details: topic ?? "Unknown title",
            state: "Searching resource category...",
            smallImageKey: Assets.Search,
          };
        case "articles":
          return {
            details: topic ?? "Unknown title",
            state: "Reading article...",
            smallImageKey: Assets.Reading,
          };
        default:
          return { details: "Browsing Kick Help..." };
      }
    }
  }
}

function formatText(text: string) {
  return text
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match: string) => match.toUpperCase())
    .replace(/%C2%A0$/, "");
}

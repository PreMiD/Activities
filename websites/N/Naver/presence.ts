const presence = new Presence({
  clientId: "825307070584586250",
  injectOnComplete: true
}),
  getServiceName = (url = document.location.hostname) => {
    switch(true){
      case !!url.match(/tv[.]naver[.]([a-z0-9]+)/):
        return "NAVER_TV";
      case !!url.match(/comic[.]naver[.]([a-z0-9]+)/):
        return "NAVER_WEBTOON";
      case !!url.match(/now[.]naver[.]([a-z0-9]+)/):
        return "NAVER_NOW";
      case !!url.match(/papago[.]naver[.]([a-z0-9]+)/):
        return "NAVER_PAPAGO";
      case !!url.match(/blog[.]naver[.]([a-z0-9]+)/):
        return "NAVER_BLOG"
      case !!url.match(/([a-z]+)[.]naver[.]([a-z0-9]+)/):
        return "NAVER";
      default:
        break;
    }
  },
  data: {
    isChecked: boolean,
    service: string,
    papagoLangs: Map<string, {
      code: string,
      name: string
    }>,
    settings?: {
      id: string,
      delete?: boolean,
      data: Array<string>
    }[],
    presence: {
      [key: string]: {
        env?: boolean,
        service: "NAVER" | "NAVER_PAPAGO" | "NAVER_NOW" | "NAVER_WEBTOON" | "NAVER_TV" | "NAVER_BLOG" | "ANY",
        setPresenceData?: Function,
        data?: {
          [key in keyof PresenceData]: {
            setTo?: unknown
            if?: {
              s: {
                k: unknown,
                v: unknown,
                then?: {
                  v?: unknown,
                  delete?: boolean
                },
                else?: {
                  v?: unknown,
                  delete?: boolean
                }
              }
              else?: {
                k: unknown,
                v: unknown,
                then?: {
                  v?: unknown,
                  delete?: boolean
                },
                else?: {
                  v?: unknown,
                  delete?: boolean
                }
              }[]
            }
          }
        }
      }
    }
  } = {
    isChecked: false,
    service: null,
    papagoLangs: new Map(),
    presence: null
  },

  getLanguage = async (langCode: string) => {
    if (!langCode) return "Choosing";

    if (langCode === "auto") return "Detecting";
    if (data.papagoLangs.has(langCode)) return data.papagoLangs.get(langCode).name;

    const baseURL = "https://restcountries.eu/rest/v2/lang",
    LangData: {
      languages: {
        name: string
      }[]
    }[] = await (await fetch(`${baseURL}/${langCode}`)).json();

    data.papagoLangs.set(langCode, {
      code: langCode,
      name: LangData[0].languages[0].name
    });

    return data.papagoLangs.get(langCode).name;
  };

let video: HTMLVideoElement,
    blog: string;

presence.on("iFrameData", (data: { blog: string}) => {
    blog = data.blog;
});

presence.on("UpdateData", async () => {

    if (!data.isChecked){
      data.service = getServiceName();
      data.isChecked = true;
    }

    const ghtEnv: { 
      sPageName: string,
      sChannelName: string
    } = await presence.getPageletiable("ghtEnv"),

    presenceData: PresenceData = {
      largeImageKey: data.service?.toLowerCase(),
      details: "Browsing...",
      smallImageKey: `${data.service.toLowerCase()}_browse`
    };
      
    const getImageOrTimestamp = (video: HTMLVideoElement, type: "starts" | "ends" | "imageKey" | "imageText") => {
      const timestamps = presence.getTimestamps(video?.currentTime, video?.duration),
      tempData: {
        start: number,
        end: number,
        key: string,
        text: string
      } = {
        start: timestamps[0],
        end: timestamps[1],
        key: `${data.service.toLowerCase()}_play`,
        text: "Playing"
      };

      if (video?.paused) {
        delete tempData.start;
        delete tempData.end;

        tempData.key = `${data.service.toLowerCase()}_pause`;
        tempData.text = "Paused";
      }

      if (type === "starts") return tempData.start;
      else if (type === "ends") return tempData.end;
      else if (type === "imageKey") return tempData.key;
      else if (type === "imageText") return tempData.text;
    }

    data.settings = [{
      id: "buttons",
      delete: true,
      data: ["buttons"]
    }];

    data.presence = {
      "/v/([0-9]+)": {
        service: "NAVER_TV",
        setPresenceData(){
          if (!!document.querySelector<HTMLElement>('div.ad_info_area')?.offsetParent){
            presenceData.details = "Currently watching an ad";
          
            presenceData.startTimestamp = <number> getImageOrTimestamp(document.querySelector('[data-role="videoEl"]'), "starts");
            presenceData.endTimestamp = <number> getImageOrTimestamp(document.querySelector('[data-role="videoEl"]'), "ends");

            presenceData.smallImageKey = <string> getImageOrTimestamp(document.querySelector('[data-role="videoEl"]'), "imageKey");
            presenceData.smallImageText = <string> getImageOrTimestamp(document.querySelector('[data-role="videoEl"]'), "imageText");
          } else {
            presenceData.details = document.querySelector('h3._clipTitle')?.textContent;
            presenceData.state = document.querySelector('div.ch_tit')?.textContent.trim();

            presenceData.startTimestamp = <number> getImageOrTimestamp(document.querySelector("video"), "starts");
            presenceData.endTimestamp = <number> getImageOrTimestamp(document.querySelector("video"), "ends");

            presenceData.smallImageKey = <string> getImageOrTimestamp(document.querySelector("video"), "imageKey");
            presenceData.smallImageText = <string> getImageOrTimestamp(document.querySelector("video"), "imageText");

            presenceData.buttons = [
              {
                url: document.baseURI,
                label: "Watch Video"
              },
              {
                url: document.querySelector<HTMLAnchorElement>('div.ch_tit > a')?.href,
                label: "View Channel"
              }
            ];
          }
        }
      },
      "channel": {
        env: true,
        service: "NAVER",
        data: {
          details: {
            setTo: "Viewing channel:"
          },
          state: {
            setTo: ghtEnv?.sChannelName
          },
          buttons: {
            setTo: [{
              url: document.baseURI,
              label: "View Channel"
            }]
          }
        }
      },
      "webnovel/list": {
        service: "ANY",
        data: {
          details: {
            setTo: "Viewing novel:"
          },
          state: {
            setTo: document.querySelector('h2.book_title')?.textContent
          },
          buttons: {
            setTo: [{
              label: "View Novel",
              url: document.baseURI
            }]
          }
        }
      },
      "/webtoon/list": {
        service: "NAVER_WEBTOON",
        data: {
          details: {
            setTo: "Viewing comic:"
          },
          state: {
            setTo: document.querySelector("div.detail > h2")?.textContent.replace(
              document.querySelector("div.detail > h2 > span")?.textContent, "").trim()
          },
          buttons: {
            setTo: [{
              label: "View Comic",
              url: document.baseURI
            }]
          }
        }
      },
      "/webtoon/detail": {
        service: "NAVER_WEBTOON",
        data: {
          details: {
            setTo: (document.querySelector<HTMLMetaElement>('[property="og:title"]')?.content.split(" - ")||[])[0]
          },
          state: {
            setTo: (document.querySelector<HTMLMetaElement>('[property="og:title"]')?.content.split(" - ")||[])[1]
          },
          buttons: {
            setTo: [{
              url: document.baseURI,
              label: "Read Episode"
            }]
          },
          smallImageKey: {
            setTo: `${data.service.toLowerCase()}_book`
          }
        }
      },
      "/webnovel/detail": {
        service: "ANY",
        data: {
          details: {
            setTo: document.querySelector("#menuFloatingLayer > a")?.textContent
          },
          state: {
            setTo: document.querySelector("#topVolumeList")?.textContent
          },
          buttons: {
            setTo: [{
              url: document.baseURI,
              label: "Read Episode"
            }]
          },
          smallImageKey: {
            setTo: `${data.service.toLowerCase()}_book`
          }
        }
      },
      "/read": {
        service: "NAVER",
        data: {
          details: {
            setTo: "Reading article:"
          },
          state: {
            setTo: document.querySelector('h2.end_tit')?.textContent
          },
          buttons: {
            setTo: [{
              url: document.baseURI,
              label: "Read Article"
            }]
          },
          smallImageKey: {
            setTo: `${data.service.toLowerCase()}_book`
          }
        }
      },
      "/player/([0-9]+)": {
        service: "NAVER_NOW",
        data: {
          details: {
            if: {
              s: {
                k: !!document.querySelector('[class="badge_live"]'),
                v: true,
                then: { 
                  v: (document.querySelector('[class="flow_text flow_text1"]')
                      || document.querySelector('[class="episode_title"]'))?.textContent 
                },
                else: {
                  v: "Viewing show:"
                }
              }
            }
          },
          state: {
            if: {
              s: {
                k: !!document.querySelector('[class="badge_live"]'),
                v: true,
                then: { 
                  v: "• LIVE" 
                },
                else: { 
                  v: document.querySelector('[class="show_title"]')?.textContent 
                }
              }
            }
          },
          buttons: {
            setTo: [{
              label: !!document.querySelector('[class="badge_live"]') ? "Watch Stream" : "View Show",
              url: document.baseURI
            }]
          },
          smallImageKey: {
            if: {
              s: {
                k: !!document.querySelector('[class="badge_live"]'),
                v: true,
                then: {
                  v: `${data.service.toLowerCase()}_live`
                }
              }
            }
          }
        }
      },
      "/show/([0-9]+)": {
        service: "NAVER_NOW",
        setPresenceData(){
          if (document.location.hash === "#highlight" && !!document.querySelector('[data-inview="true"]')){
            const video = document.querySelector<HTMLVideoElement>(
              '[data-inview="true"] > div.video_wrap > a > video'
              ) || document.querySelector('[id="video_wrap"] > video');

            presenceData.details = document.querySelector('[data-inview="true"] > div.text_wrap > a.title')?.textContent;
            presenceData.state = "• HIGHLIGHT";

            presenceData.startTimestamp = <number> getImageOrTimestamp(video, "starts");
            presenceData.endTimestamp = <number> getImageOrTimestamp(video, "ends");
              
            presenceData.smallImageKey = <string> getImageOrTimestamp(video, "imageKey");
            presenceData.smallImageText = <string> getImageOrTimestamp(video, "imageText");

            presenceData.buttons = [{
              url: document.baseURI,
              label: "Watch Video"
            }];
          } else {
            presenceData.details = "Viewing show:";
            presenceData.state = document.querySelector<HTMLImageElement>('[class="logo_show"]')?.alt;

            presenceData.buttons = [{
              url: document.baseURI,
              label: "View Show"
            }];
          }
        },
      },
      "/website": {
        service: "NAVER_PAPAGO",
        data: {
          details: {
            setTo: "Translating: Website"
          },
          state: {
            setTo: `From: ${
              await getLanguage((new URLSearchParams(location.search)).get('source'))} - To: ${
              await getLanguage((new URLSearchParams(location.search)).get('target'))}`
          },
          smallImageKey: {
            setTo: `${data.service.toLowerCase()}_language`
          }
        }
      },
      "/": {
        service: "NAVER_PAPAGO",
        data: {
          details: {
            setTo: `Translating from: ${
              await getLanguage((new URLSearchParams(location.search)).get('sk'))}`
          },
          state: {
            setTo: `To: ${await getLanguage((new URLSearchParams(location.search)).get('tk'))}`
          },
          smallImageKey: {
            setTo: `${data.service.toLowerCase()}_language`
          }
        }
      },
      "/search.naver": {
        service: "NAVER",
        data:  {
          details: {
            setTo: "Searching for:"
          },
          state: {
            setTo: (new URLSearchParams(document.location.search)).get("query") || "Something"
          }
        }
      },
      "/([a-z])": {
        service: "NAVER_BLOG",
        data: {
          details: {
            setTo: "Reading blog of:"
          },
          state: {
            setTo: blog
          },
          buttons: {
            setTo: [{
              url: document.baseURI,
              label: "Read Blog"
            }]  
          }
        }
      }
    };

    for (const [k, v] of Object.entries(data.presence)){
      if ((document.location.pathname.match(k) && (data.service === v.service || v.service === "ANY") && !v.env) || (v.env && k === ghtEnv?.sPageName)){
        if (v.setPresenceData) { 
          v.setPresenceData();
          break;
        }
        for (const [key, todo] of Object.entries(v.data)){
          if (!todo.if && todo.setTo) presenceData[<"state"> key] = <string> todo.setTo;
          else if (todo.if) {
              if (todo.if.s.k === todo.if.s.v){
                if (!todo.if.s.then.delete) presenceData[<"state"> key] = <string> todo.if.s.then.v;
                else delete presenceData[<"state"> key];
              } else if (todo.if.s.else){
                if (!todo.if.s.else.delete) presenceData[<"state"> key] = <string> todo.if.s.else.v;
                else delete presenceData[<"state"> key];
              } else if (todo.if.else){
                for (const elseStatement of Object.values(todo.if.else)){
                  if (elseStatement.k === elseStatement.v){
                    if (!elseStatement.then.delete) presenceData[<"state"> key] = <string> elseStatement.then.v;
                    else delete presenceData[<"state"> key];
                    break;
                  } else if (elseStatement.else){ 
                    if (!elseStatement.else.delete) presenceData[<"state"> key] = <string> elseStatement.else.v;
                    else delete presenceData[<"state"> key];
                    break;
                  }
              }
            }
          }
        }
        break;
      }
    }

    if (data.settings){
      for (const setting of data.settings){
        if(!(await presence.getSetting(setting.id))){
          if (setting.delete) setting.data.forEach(x => {
              delete presenceData[<"state"> x];
          })
        }
      }
    }

    presence.setActivity(presenceData);
});
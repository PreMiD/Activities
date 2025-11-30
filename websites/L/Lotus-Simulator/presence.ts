import { Assets } from 'premid'

const presence = new Presence({
  clientId: '1439639102302453780',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets { // Other default assets can be found at index.d.ts
  Logo = 'https://www.lotus-simulator.de/images/styleLogo-b96c81edc0cb1a248146b1a0ba23f6cd052f7704.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    //smallImageKey: Assets.Play,
  }

  if(document.URL.startsWith("https://docs")) {
    let categorie = "";

    if(document.location.pathname.includes("rust")) {
      categorie = "Rust"
    } else if(document.location.pathname.includes("plugin-api")) {
      categorie = "Plugin-API"
    } else if(document.location.pathname.includes("lotus-sc")) {
      categorie = "Lotus-SC"
    } else if(document.location.pathname.includes("wasm")) {
      categorie = "wasm"
    } else if(document.location.pathname.includes("reference")) {
      categorie = "Reference"
    } else {
      categorie = "General"
    }

    presenceData.details = "Viewing in " + categorie

    presenceData.state = document.querySelector(
          'h1#_top.astro-j6tvhyss',
        )?.textContent
  } else {
    presenceData.details = "Viewing page:"
    if (document.location.pathname.startsWith("/forum")) {
      presenceData.state = 'Forum'

      if(document.location.href.includes("board")) {
        if(!document.querySelector(
            'h1.contentTitle',
          )?.textContent.startsWith("LOTUS-Simulator") || !document.querySelector(
            'h1.contentTitle',
          )?.textContent.startsWith("Forum")) {
            
            presenceData.details = "Viewing posts in"
            
            presenceData.state = document.querySelector(
                'h1.contentTitle',
              )?.textContent
        }
      }
      
      if(document.location.href.includes("thread")) {
        presenceData.details = "Viewing replies in"
        
        presenceData.state = document.querySelector(
            'h1.contentTitle',
          )?.textContent
      }

      if(document.location.href.includes("unread-thread-list")) {
        presenceData.details = "Checking for unread"
        presenceData.state = "posts"
      }

    } else if (document.location.pathname.startsWith("/gallery")) {
      presenceData.state = 'Images'

      if (document.location.pathname.startsWith("/gallery/index.php")) {
        if(document.location.href.includes("my-image-list")) {
          presenceData.details = "Checking own"
          presenceData.state = "images"
        } else if(document.location.href.includes("image-add")) {
          presenceData.state = "Upload a photo or gif"
        } else {

          presenceData.details = "Viewing"

          presenceData.state =  document.querySelector(
            'h1.contentTitle',
          )?.textContent + 

          " by " + 

          document.querySelector(
            'a#wcf1.userLink',
          )?.textContent 

          const postHeaderElement = document.querySelector(
            '.messageGroupContentHeader'
          );

          presenceData.largeImageKey = postHeaderElement?.querySelector(
            'img.userAvatarImage',
          )?.getAttribute('src');

          presenceData.buttons = [
            {
              label: "Open Post",
              url: document.URL
            }
          ]
        }
      }
    } else if (document.location.pathname.startsWith("/lexikon")) {
      presenceData.state = 'Lexicon'


       if(!document.querySelector(
            'h1.contentTitle',
          )?.textContent.startsWith("Lexikon")) {
            presenceData.details = "Reading in Lexicon "
            
            presenceData.state = document.querySelector(
                  'h1.contentTitle',
                )?.textContent
            }
    } else if (document.location.pathname.startsWith("/roadmap")) {
      presenceData.state = 'Roadmap'
    } else if (document.location.pathname.startsWith("/known-bugs")) {
      presenceData.state = 'Known Bugs'
    } else if (document.location.pathname.startsWith("/recent-changes")) {
        presenceData.state = 'Recent Updates'
    } else if (document.location.pathname.startsWith("/blog")) {
        presenceData.details = ""
        presenceData.state = 'Viewing all Blog posts'

        if(!document.querySelector(
            'h1.contentTitle',
          )?.textContent.startsWith("Lexikon")) {
            presenceData.details = "Reading Blog post "
            
            presenceData.state = document.querySelector(
                  'h1.contentTitle',
                )?.textContent
            }
    } else if (document.location.pathname.startsWith("/filebase")) {
        presenceData.state = 'Filebase'

        if(document.location.href.includes("?filebase")) {
            presenceData.details = "Viewing filebase posts in"
            
            presenceData.state = document.querySelector(
                  'h1.contentTitle',
                )?.textContent
        }

        if(document.location.href.includes("entry")) {
            presenceData.details = "Viewing filebase post by " + document.querySelector(
            'a#wcf1.userLink',
          )?.textContent + ":"
            
            presenceData.state = document.querySelector(
                  'h1.contentTitle',
                )?.textContent



          presenceData.largeImageKey = document.querySelector(
              '.filebasePreviewImage img'
          )?.getAttribute('src');

          presenceData.buttons = [
            {
              label: "Open Post",
              url: document.URL
            }
          ]
        }
    } else {
      presenceData.state = 'Viewing Home Page'
    }
  }

  presence.setActivity(presenceData)
})
const presence = new Presence({
  clientId: '941798064694378557',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/logo.png',
  Mspa = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/0.png',
  Ryan = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/1.png',
  Hellajeff = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/2.png',
  Meat = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/3.png',
  Candy = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/4.png',
  Prologue = 'https://cdn.rcd.gg/PreMiD/websites/H/Homestuck/assets/5.png',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const pathArr = pathname.split('/')
  switch (pathArr[1]) {
    case '':
      presenceData.details = 'Viewing home page'
      break

    case 'stories':
      presenceData.details = 'Viewing stories'
      break

    case 'jailbreak':
      presenceData.details = 'Reading Jailbreak'
      presenceData.smallImageKey = ActivityAssets.Mspa
      if (!pathArr[2])
        presenceData.state = 'Page 1 of 134'
      else presenceData.state = `Page ${pathArr[2]} of 134`

      presenceData.smallImageText = document.querySelector('h2')?.textContent
      presenceData.buttons = [
        {
          label: 'Read Along',
          url: `https://www.homestuck.com${pathname}`,
        },
      ]
      break

    case 'bard-quest':
      presenceData.details = 'Reading Bard Quest'
      presenceData.smallImageKey = ActivityAssets.Mspa
      if (!pathArr[2])
        presenceData.state = 'Page 1 of 47'
      else presenceData.state = `Page ${pathArr[2]} of 47`

      presenceData.smallImageText = document.querySelector('h2')?.textContent
      presenceData.buttons = [
        {
          label: 'Read Along',
          url: `https://www.homestuck.com${pathname}`,
        },
      ]
      break

    case 'problem-sleuth':
      presenceData.details = 'Reading Problem Sleuth'
      presenceData.smallImageKey = ActivityAssets.Mspa
      if (!pathArr[2])
        presenceData.state = 'Page 1 of 1674'
      else presenceData.state = `Page ${pathArr[2]} of 1674`

      presenceData.smallImageText = document.querySelector('h2')?.textContent
      presenceData.buttons = [
        {
          label: 'Read Along',
          url: `https://www.homestuck.com${pathname}`,
        },
      ]
      break

    case 'ryanquest':
      presenceData.details = 'Reading Ryanquest'
      presenceData.smallImageKey = ActivityAssets.Ryan
      if (!pathArr[2])
        presenceData.state = 'Page 1 of 15'
      else presenceData.state = `Page ${pathArr[2]} of 15`

      presenceData.smallImageText = document.querySelector('h2')?.textContent
      presenceData.buttons = [
        {
          label: 'Read Along',
          url: `https://www.homestuck.com${pathname}`,
        },
      ]
      break

    case 'sweet-bro-and-hella-jeff':
      presenceData.details = 'Reading Sweet Bro and Hella Jeff'
      presenceData.smallImageKey = ActivityAssets.Hellajeff
      if (!pathArr[2])
        presenceData.state = 'Page 1 of 54'
      else presenceData.state = `Page ${pathArr[2]} of 54`

      presenceData.smallImageText = 'I WARNED YOU ABOUT STAIRS BRO!!!!'
      presenceData.buttons = [
        {
          label: 'Read Along',
          url: `https://www.homestuck.com${pathname}`,
        },
      ]
      break

    case 'beta':
      presenceData.details = 'Reading Homestuck (BETA)'
      presenceData.smallImageKey = ActivityAssets.Mspa
      if (!pathArr[2])
        presenceData.state = 'Page 1 of 8'
      else presenceData.state = `Page ${pathArr[2]} of 8`

      presenceData.smallImageText = document.querySelector('h2')?.textContent
      presenceData.buttons = [
        {
          label: 'Read Along',
          url: `https://www.homestuck.com${pathname}`,
        },
      ]
      break

    case 'story':
      presenceData.details = 'Reading Homestuck'
      presenceData.smallImageKey = ActivityAssets.Mspa
      if (!pathArr[2])
        presenceData.state = 'Page 1 of 8130'
      else presenceData.state = `Page ${pathArr[2]} of 8130`

      if (document.querySelector('h2')) {
        presenceData.smallImageText = document.querySelector('h2')?.textContent
      }
      else {
        presenceData.smallImageText = document.querySelector('title')?.textContent
      }
      presenceData.buttons = [
        {
          label: 'Read Along',
          url: `https://www.homestuck.com${pathname}`,
        },
      ]
      break

    case 'epilogues':
      presenceData.details = 'Reading The Homestuck Epilogues'
      presenceData.state = 'Viewing select screen'
      presenceData.smallImageKey = ActivityAssets.Prologue
      presenceData.smallImageText = 'Making the choice'
      switch (pathArr[2]) {
        case 'prologue':
          if (!pathArr[3]) {
            presenceData.state = 'Viewing epilogue content'
          }
          else {
            presenceData.state = `Prologue Chapter ${pathArr[3]} of 3`
            presenceData.buttons = [
              {
                label: 'Read Along',
                url: `https://www.homestuck.com${pathname}`,
              },
            ]
          }
          presenceData.smallImageText = 'It starts with a crack.'
          break
        case 'meat':
          presenceData.state = `Meat Chapter ${pathArr[3]} of 44`
          presenceData.smallImageKey = ActivityAssets.Meat
          presenceData.smallImageText = 'Meat was definitely the right choice, you think, as grease drips down your chin.'
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: `https://www.homestuck.com${pathname}`,
            },
          ]
          break
        case 'candy':
          presenceData.state = `Candy Chapter ${pathArr[3]} of 41`
          presenceData.smallImageKey = ActivityAssets.Candy
          presenceData.smallImageText = 'Candy was definitely the right choice, John thinks, as he munches thoughtfully on a strawberry swirl mint.'
          presenceData.buttons = [
            {
              label: 'Read Along',
              url: `https://www.homestuck.com${pathname}`,
            },
          ]
          break
      }
      break

    case 'contacts':
      presenceData.details = 'Viewing contact information'
      break

    case 'credits':
      presenceData.details = 'Viewing credits'
      switch (pathArr[2]) {
        case 'art':
          presenceData.details = 'Viewing art credits'
          break
        case 'sound':
          presenceData.details = 'Viewing sound credits'
          break
      }
      break

    case 'extras':
      if (!pathArr[2]) {
        presenceData.details = 'Viewing extra 1 of 40'
        presenceData.smallImageKey = ActivityAssets.Mspa
        presenceData.smallImageText = document.querySelector('h2')?.textContent
      }
      else if (pathArr[2] === 'list') {
        presenceData.details = 'Viewing extras list'
      }
      else {
        presenceData.details = `Viewing extra ${pathArr[2]} of 40`
        presenceData.smallImageKey = ActivityAssets.Mspa
        if (document.querySelector('h2')!.textContent!.length <= 128) {
          presenceData.smallImageText = document.querySelector('h2')!.textContent
        }
        else {
          presenceData.smallImageText = `${document
            .querySelector('h2')
            ?.textContent
            ?.substring(0, 124)}...`
        }
      }
      break

    case 'faqs':
    case 'faqs#Q1':
    case 'faqs#Q2':
    case 'faqs#Q3':
    case 'faqs#Q4':
    case 'faqs#Q6':
    case 'faqs#Q7':
    case 'faqs#Q7_5':
    case 'faqs#Q8':
      presenceData.details = 'Viewing FAQ'
      switch (pathArr[2]) {
        case 'science':
        case 'science#Q1':
        case 'science#Q2':
        case 'science#Q3':
        case 'science#Q4':
        case 'science#Q5':
        case 'science#Q6':
        case 'science#Q7':
          presenceData.details = 'Viewing science FAQ'
          break
      }
      break

    case 'images':
      presenceData.details = 'Viewing an image'
      break

    case 'info-games':
      presenceData.details = 'Viewing game information'
      break

    case 'info-more':
      presenceData.details = 'Viewing more information'
      break

    case 'info-shop':
      presenceData.details = 'Viewing shop information'
      break

    case 'info-story':
      presenceData.details = 'Viewing Homestuck information'
      break

    case 'log':
      switch (pathArr[2]) {
        case 'jailbreak':
          presenceData.details = 'Viewing Jailbreak adventure log'
          break
        case 'bard-quest':
          presenceData.details = 'Viewing Bard Quest adventure log'
          break
        case 'problem-sleuth':
          presenceData.details = 'Viewing Problem Sleuth adventure log'
          break
        case 'story':
          presenceData.details = 'Viewing Homestuck adventure log'
          break
        case 'epilogues':
          presenceData.details = 'Viewing The Homestuck Epilogues adventure log'
          break
      }
      break

    case 'map':
      switch (pathArr[2]) {
        case 'problem-sleuth':
          presenceData.details = 'Viewing Problem Sleuth adventure map'
          break
        case 'story':
          presenceData.details = 'Viewing Homestuck adventure map'
          break
      }
      break

    case 'news':
      presenceData.details = 'Viewing news'
      break

    case 'privacy':
    case 'privacy#ccpa':
    case 'privacy#tools':
    case 'privacy#choices':
    case 'privacy#how-we-use':
      presenceData.details = 'Viewing privacy policy'
      break

    default:
      presenceData.details = 'Viewing an unsupported page'
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

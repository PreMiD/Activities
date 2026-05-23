const presence = new Presence({
  clientId: '1026195572354449428',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

let characterCreatorMenu: string[] = ['species']

setInterval(() => {
  if (document.location.pathname === '/') {
    characterCreatorMenu = [
      ...document.querySelectorAll<HTMLDivElement>('#menuA, #menuB, #menuC'),
    ].map((menu) => {
      return [...menu.children]
        .find((listItem) => {
          return getComputedStyle(listItem).backgroundImage !== 'none'
        })
        ?.querySelector('span')
        ?.textContent
        ?.trim()
        .toLowerCase() ?? ''
    })
  }
}, 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/H/Hero%20Forge/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname } = document.location
  const [, path] = pathname.split('/')

  switch (path ?? '') {
    case '': {
      if (
        document.querySelector<HTMLImageElement>(
          '[src=\'/static/svg/bug-white.svg\']',
        )
      ) {
        presenceData.details = 'Creating a bug report'
      }
      else if (document.querySelector('[class*=\'characterFolder\']')) {
        presenceData.details = 'Viewing their characters'
      }
      else {
        const characterName = document
          .querySelector<HTMLDivElement>(
            'img[src^=\'/static/svg/character-menu/\'] + div',
          )
          ?.textContent
          ?.match(/^(.*?)\*?$/)?.[1]
        const chosenItemContainer = document.querySelector<HTMLSpanElement>(
          '#view span[style*=\'/static/svg/item-selected.svg\']',
        )
        const chosenItemImage = chosenItemContainer?.querySelector<HTMLImageElement>('img[alt]')
        const chosenItemName = chosenItemImage?.alt.match(/^(.*?) Add Part$/)?.[1]

        let mainState = ''
        let subState = ''
        presenceData.details = `Modifying Character: ${characterName}`
        switch (characterCreatorMenu[0]) {
          case 'species': {
            mainState = 'Species'
            if (chosenItemContainer) {
              subState = `${
                /Female_thumb/.test(chosenItemImage?.src ?? '') ? 'Female' : 'Male'
              } ${
                chosenItemContainer?.parentElement?.nextElementSibling?.textContent
              }`
            }
            break
          }
          case 'head':
          case 'gear':
          case 'stage': {
            switch (characterCreatorMenu[0]) {
              case 'head': {
                mainState = 'facial features'
                break
              }
              case 'gear': {
                mainState = 'gear'
                break
              }
              case 'stage': {
                mainState = 'stage'
                break
              }
            }
            if (chosenItemContainer)
              subState = `${characterCreatorMenu[1]} - ${chosenItemName}`
            else subState = characterCreatorMenu[1]!
            break
          }
          case 'body': {
            mainState = 'Body Features'
            if (characterCreatorMenu[1] === 'measure')
              subState = 'Measurements'
            else if (chosenItemContainer)
              subState = `${characterCreatorMenu[1]} - ${chosenItemName}`
            else subState = characterCreatorMenu[1]!
            break
          }
          case 'clothing': {
            mainState = 'Clothing'
            if (characterCreatorMenu[1] === 'outfit')
              subState = 'Outfit'
            else if (chosenItemContainer)
              subState = `${characterCreatorMenu[1]} - ${chosenItemName}`
            else subState = characterCreatorMenu[1]!
            break
          }
          case 'pose': {
            mainState = 'Pose'
            switch (characterCreatorMenu[1]) {
              case 'body':
              case 'face': {
                if (chosenItemContainer)
                  subState = `${characterCreatorMenu[1]} - ${chosenItemName}`
                else subState = characterCreatorMenu[1]
                break
              }
              case 'eyes': {
                subState = 'eyes'
                break
              }
              case 'advanced': {
                subState = 'Advanced'
                break
              }
            }
            break
          }
          case 'color': {
            mainState = 'Color'
            switch (characterCreatorMenu[1]) {
              case 'body':
              case 'theme': {
                subState = characterCreatorMenu[1]
                break
              }
              case 'decals': {
                if (chosenItemContainer)
                  subState = `decals - ${chosenItemName}`
                else subState = 'decals'
                break
              }
              case 'paints':
              case 'mix': {
                const selectedPaintIcon = document.querySelector<HTMLImageElement>(
                  '[src*=\'/static/svg/tools/paint-selection.svg\']',
                )
                if (selectedPaintIcon) {
                  subState = `${characterCreatorMenu[1]} - ${
                    (
                      selectedPaintIcon.previousElementSibling as HTMLImageElement
                    ).alt
                  }`
                }
                else {
                  subState = characterCreatorMenu[1]
                }
                break
              }
            }
            break
          }
          case 'booth': {
            mainState = 'Booth'
            break
          }
          case 'buy': {
            mainState = 'Buying Items'
            switch (characterCreatorMenu[1]) {
              case 'mini': {
                const selectedMini = document.querySelector<HTMLDivElement>(
                  '#view [class*=name]',
                )
                if (selectedMini)
                  subState = `${characterCreatorMenu[1]} - ${selectedMini.textContent}`
                else subState = characterCreatorMenu[1]
                break
              }
              case 'packs': {
                const selectedPack = document.querySelector<HTMLDivElement>(
                  '#view [class*=displayLabel]',
                )
                if (selectedPack)
                  subState = `${characterCreatorMenu[1]} - ${selectedPack.textContent}`
                else subState = characterCreatorMenu[1]
                break
              }
              case 'dice': {
                subState = 'dice'
                break
              }
              case 'gift cards': {
                subState = 'gift cards'
                break
              }
              case 'digital credits': {
                subState = 'digital credits'
                break
              }
            }
            break
          }
        }
        if (subState) {
          presenceData.state = `${mainState[0]?.toUpperCase()}${mainState.slice(
            1,
          )}: ${subState[0]?.toUpperCase()}${subState.slice(1)}`
        }
        else {
          presenceData.state = `${mainState[0]?.toUpperCase()}${mainState.slice(
            1,
          )}`
        }
      }
      break
    }
    case 'account': {
      presenceData.details = 'Managing account settings'
      presenceData.state = document.querySelector<HTMLAnchorElement>(
        '[class*=sidenavContainer] [class*=itemActive]',
      )?.textContent
      break
    }
    case 'cart': {
      presenceData.details = 'Viewing cart'
      break
    }
    case 'intro': {
      presenceData.details = 'Browsing'
      presenceData.state = 'Sample characters and introduction'
      break
    }
    case 'media-request': {
      presenceData.details = 'Creating a media request'
      presenceData.state = document.querySelector<HTMLLabelElement>(
        '#issue_choices input:checked + label',
      )?.textContent
      break
    }
    case 'suggest': {
      presenceData.details = 'Suggesting a feature'
      break
    }
    default: {
      if (path?.startsWith('load_config')) {
        presenceData.details = 'Loading character'
      }
      else {
        presenceData.details = 'Browsing'
        presenceData.state = document.title.match(
          /^(.*?)(?: \| Hero Forge®)?$/,
        )?.[1]
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

import { Assets } from 'premid'

const presence = new Presence({ clientId: '1196469492310618142' })
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Icon = 'https://cdn.rcd.gg/PreMiD/websites/E/Emberspark%20Games/assets/logo.png',
  DesolationIcon = 'https://cdn.rcd.gg/PreMiD/websites/E/Emberspark%20Games/assets/0.png',
  ConsumerCatalog = 'https://cdn.rcd.gg/PreMiD/websites/E/Emberspark%20Games/assets/1.png',
}

presence.on('UpdateData', async () => {
  const currentPath = document.location.pathname.toLowerCase().split('/')
  const presenceData: PresenceData = {
    smallImageKey: Assets.Viewing,
    smallImageText: 'Viewing...',
    startTimestamp: browsingTimestamp,
  }

  if (!currentPath[1]) {
    presenceData.details = 'Emberspark Games'
    presenceData.largeImageKey = ActivityAssets.Icon
    presenceData.state = 'Viewing the home page'
  }
  else if (currentPath[1] === 'desolation') {
    presenceData.details = 'Portal 2: Desolation mod'
    presenceData.largeImageKey = ActivityAssets.DesolationIcon
    presenceData.buttons = [
      {
        label: 'View the mod page',
        url: 'https://emberspark.games/desolation',
      },
    ]
    if (!currentPath[2] || currentPath[2] === 'about') {
      presenceData.state = 'Viewing the about page'
    }
    else {
      switch (currentPath[2]) {
        case 'news': {
          presenceData.state = 'Viewing the changelog page'
          presenceData.smallImageText = 'Viewing all the posts...'
          if (currentPath[3]) {
            presenceData.smallImageText = 'Viewing a changelog post...'
            const newsHeadline = document
              .querySelector('.newsHeadline')
              ?.textContent
              ?.toLowerCase()
            if (newsHeadline)
              presenceData.state = `Viewing the changelog from ${newsHeadline}`
          }

          break
        }
        case 'media': {
          presenceData.state = 'Viewing the media page'

          break
        }
        case 'catalog': {
          presenceData.details = 'Portal 2: Desolation mod - Catalog'
          presenceData.state = 'In the test subject waiting area'
          presenceData.smallImageKey = ActivityAssets.ConsumerCatalog
          presenceData.smallImageText = 'Sitting in the waiting area...'
          presenceData.buttons = [
            {
              label: 'View the catalogue',
              url: 'https://emberspark.games/desolation/catalog',
            },
          ]

          if (
            document
              .querySelector('#catalogue-container')
              ?.classList
              ?.contains('scroll-in')
          ) {
            if (
              !document.querySelector('#PreMiD-EmbersparkGames-presence-script')
            ) {
              const script = document.createElement('script')
              script.id = 'PreMiD-EmbersparkGames-presence-script'
              script.innerHTML = `
                const pageNumber = document.createElement("span");
                pageNumber.id = "pageNumber";
                pageNumber.style.display = "none";
                pageNumber.textContent = $("#catalogue").turn("page");
                document.body.appendChild(pageNumber);

                let currentPageNumber = pageNumber.textContent;

                setInterval(() => {
                  const newPageNumber = $("#catalogue").turn("page");
                  if (newPageNumber !== currentPageNumber) {
                    pageNumber.textContent = newPageNumber;
                    currentPageNumber = newPageNumber;
                  }
                }, 1000);
              `
              document.head.appendChild(script)
            }

            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = 'Reading the catalogue...'
            presenceData.state = `Reading the catalogue, currently on the ${getNumberSuffix(
              Number.parseInt(document.querySelector('#pageNumber')?.textContent ?? '0'),
            )} page`
          }

          break
        }
        case 'gallery': {
          presenceData.state = 'Viewing the gallery page'
          presenceData.smallImageText = 'Viewing all the images...'

          const activeImage = document.querySelector(
            '.splide__slide.is-active.is-visible',
          )
          if (
            getComputedStyle(document.querySelector('#fullScreenContainer')!)
              .transform === 'matrix(1, 0, 0, 1, 0, 0)'
              && activeImage
          ) {
            presenceData.details = 'Portal 2: Desolation mod - Gallery'
            presenceData.smallImageText = 'Viewing an image...'
            presenceData.state = `Viewing the ${getNumberSuffix(
              Number.parseInt(
                activeImage.id
                  .split('-')[2]
                  ?.split('slide')[1]
                  ?.replace(/^0+/, '') ?? '',
              ),
            )} image`
          }

          break
        }
        case 'team': {
          presenceData.state = 'Viewing the list of our team members'

          break
        }
        case 'faq': {
          presenceData.state = 'Viewing the FAQ page'
          presenceData.smallImageText = 'Viewing all the questions...'
          const activeQuestion = document.querySelector('.collapsible.active')
          if (activeQuestion) {
            presenceData.smallImageKey = Assets.Question
            presenceData.smallImageText = 'Reading a question...'
            presenceData.state = `Reading: "${
              activeQuestion.querySelector('h1')?.textContent
            }"`
          }

          break
        }
      }
    }
  }

  presence.setActivity(presenceData)
})

function getNumberSuffix(number: number): string {
  switch (number) {
    case 1: {
      return `${number}st`
    }
    case 2: {
      return `${number}nd`
    }
    case 3: {
      return `${number}rd`
    }
    default: {
      return `${number}th`
    }
  }
}

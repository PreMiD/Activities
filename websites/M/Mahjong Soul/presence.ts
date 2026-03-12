import { ActivityType, Assets } from 'premid'
import {
  GameScreenType,
  getAccountInfo,
  getAchievementInfo,
  getBasicGameInfo,
  getGachaInfo,
  getGameType,
  getHandEndInfo,
  getHomeScreenType,
  getPlayerInfo,
  getWaitingRoomInfo,
  HomeScreenType,
  isInGame,
} from './game_variables.js'
import {
  browsingTimestamp,
  getPositionString,
  getWindString,
  presence,
  registerSlideshowKey,
  registerTimestampUpdate,
  slideshow,
  SLIDESHOW_TIMEOUT,
  squareImage,
} from './util.js'

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/M/Mahjong%20Soul/assets/logo.jpeg',
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
    name: 'Mahjong Soul',
    type: ActivityType.Playing,
  } as PresenceData
  const { hostname, pathname, protocol, href } = document.location
  const pathList = pathname.split('/').filter(Boolean)

  let usesSlideshow = false
  if (
    hostname === 'mahjongsoul.yo-star.com'
    || hostname === 'mahjongsoul.com'
  ) {
    switch (pathList[0]) {
      case 'news': {
        if (pathList[1]) {
          presenceData.details = 'Reading a news article'
          presenceData.state = document.querySelector<HTMLSpanElement>('.title-text')
          presenceData.buttons = [{ label: 'Read Article', url: href }]
        }
        else {
          presenceData.details = 'Browsing news articles'
        }

        break
      }
      case 'characters': {
        const name = document.querySelector<HTMLSpanElement>('.name')
        const images = document.querySelectorAll<HTMLImageElement>('.avatarBox img')
        presenceData.details = 'Viewing a character'
        presenceData.state = name
        presenceData.smallImageText = document.querySelector<HTMLParagraphElement>('.lines')
        registerSlideshowKey(`characters-${name?.textContent}`)
        usesSlideshow = true
        for (const image of images) {
          slideshow.addSlide(
            image.src,
            {
              ...presenceData,
              smallImageKey: image,
            },
            SLIDESHOW_TIMEOUT,
          )
        }
        break
      }
      case 'manga': {
        if (pathList[1]) {
          const isSpecial = pathList[2] === '2'
          presenceData.details = `Reading a ${
            isSpecial ? 'special manga' : 'manga'
          } episode`
          presenceData.state = `Episode ${
            isSpecial ? pathList[1] : +pathList[1] - 1
          }`
          presenceData.buttons = [{ label: 'Read Manga', url: href }]
        }
        else {
          presenceData.details = 'Browsing manga'
          presenceData.state = document.querySelector('.menu.active')
        }
        break
      }
      case 'wallpapers': {
        const popup = document.querySelector<HTMLDivElement>(
          '.wallpapersPopup-wrap.active',
        )
        if (popup) {
          presenceData.details = 'Viewing a wallpaper'
          presenceData.state = `${
            popup.querySelector<HTMLSpanElement>('.title')?.textContent
          } - ${
            popup.querySelector<HTMLParagraphElement>('.text')?.textContent
          }`
          presenceData.largeImageKey = await squareImage(
            popup.querySelector('img')!,
          )
          presenceData.buttons = [
            {
              label: 'View Wallpaper',
              url: document.querySelector<HTMLAnchorElement>('.content a'),
            },
          ]
        }
        else {
          const wallpapers = [
            ...document.querySelector<HTMLDivElement>('.wallpapers-list')
              ?.children ?? [],
          ]
          presenceData.details = 'Browsing wallpapers'
          registerSlideshowKey(
            `wallpapers-${
              document.querySelector<HTMLLIElement>(
                '.ant-pagination-item-active',
              )?.textContent
            }`,
          )
          usesSlideshow = true
          for (const wallpaper of wallpapers) {
            const title = wallpaper.querySelector<HTMLDivElement>('.wallpapers-title')
            const tempData: PresenceData = {
              ...presenceData,
              smallImageKey: await squareImage(
                wallpaper.querySelector('img')!,
              ),
              smallImageText: title,
            }
            slideshow.addSlide(title?.textContent ?? '', tempData, SLIDESHOW_TIMEOUT)
          }
        }
        break
      }
      case 'birthday': {
        const popup = document.querySelector<HTMLDivElement>(
          '.birthdayPopup-wrap.active',
        )
        if (popup) {
          const title = popup.querySelector<HTMLSpanElement>('.title')
          const images = popup.querySelectorAll<HTMLImageElement>('.content img')
          presenceData.details = 'Viewing a birthday present'
          presenceData.state = title
          registerSlideshowKey(`birthday-popup-${title?.textContent}`)
          usesSlideshow = true
          for (const image of images) {
            slideshow.addSlide(
              image.src,
              {
                ...presenceData,
                smallImageKey: image,
              },
              SLIDESHOW_TIMEOUT,
            )
          }
        }
        else {
          const wallpapers = [
            ...document.querySelector<HTMLDivElement>('.birthday-list')
              ?.children ?? [],
          ]
          presenceData.details = 'Browsing birthday arts'
          registerSlideshowKey(
            `birthday-${
              document.querySelector<HTMLLIElement>(
                '.ant-pagination-item-active',
              )?.textContent
            }`,
          )
          usesSlideshow = true
          for (const wallpaper of wallpapers) {
            const title = wallpaper.querySelector<HTMLDivElement>('.birthday-title')
            const tempData: PresenceData = {
              ...presenceData,
              smallImageKey: await squareImage(
                wallpaper.querySelector('img')!,
              ),
              smallImageText: title,
            }
            slideshow.addSlide(title?.textContent ?? '', tempData, SLIDESHOW_TIMEOUT)
          }
        }
        break
      }
      case 'faq': {
        presenceData.details = 'Viewing the FAQ'
        break
      }
      default: {
        presenceData.details = 'Browsing'
      }
    }
  }
  else {
    const { nickname, coppers, signature } = await getAccountInfo()
    if (await isInGame()) {
      registerTimestampUpdate('game')
      const gameType = await getGameType()
      const {
        playerIndex,
        activePlayerIndex,
        honbaCount,
        roundCount,
        windIndex,
        tilesLeft,
        gameEndResult,
      } = await getBasicGameInfo()
      const { playerSeat, playerName, playerScore } = await getPlayerInfo(
        playerIndex,
      )
      presenceData.type = ActivityType.Competing
      presenceData.smallImageKey = Assets.Question
      presenceData.smallImageText = `${playerName} - ${playerScore} points`
      presenceData.details = `${getWindString(windIndex)} ${
        roundCount + 1
      } | ${honbaCount} honba | ${tilesLeft} tiles left`
      switch (gameType) {
        case GameScreenType.GameEnd: {
          const { players } = gameEndResult!
          const winner = players[0]!
          const playerPosition = players.indexOf(
            players.find(p => p.seat === playerSeat)!,
          )
          const { playerName: winnerName } = await getPlayerInfo(winner.seat)
          presenceData.state = 'Viewing end of game results'
          presenceData.largeImageText = `${winnerName} won the game (${
            winner.part_point_1
          }) | ${playerName} placed ${playerPosition + 1}${getPositionString(
            playerPosition + 1,
          )} (${playerScore})`
          break
        }
        case GameScreenType.DrawEnd: {
          presenceData.state = 'Hand ended in a draw'
          break
        }
        case GameScreenType.HandEnd: {
          const { handScore, seat } = await getHandEndInfo()
          const { playerName: winnerName } = await getPlayerInfo(seat)
          presenceData.state = 'Viewing winning hand results'
          presenceData.largeImageText = `${winnerName} won the hand | Value: ${handScore}`
          break
        }
        case GameScreenType.OtherTurn: {
          const { playerName: activePlayerName } = await getPlayerInfo(
            activePlayerIndex,
          )
          presenceData.state = `Waiting for ${activePlayerName} to do their turn`
          break
        }
        case GameScreenType.PlayerTurn: {
          presenceData.state = 'Taking their turn'
          break
        }
        default: {
          presenceData.details = 'Loading...'
        }
      }
      // If using older extension, Competing type is not used, so shift the details a bit
      // As a side effect, the round information is lost.
      if (+presence.getExtensionVersion() < 260) {
        presenceData.details = presenceData.state
        presenceData.state = presenceData.largeImageText
      }
    }
    else {
      registerTimestampUpdate('home')
      const homePageType = await getHomeScreenType()
      switch (homePageType) {
        case HomeScreenType.LoggingIn: {
          presenceData.details = 'Logging in'
          break
        }
        case HomeScreenType.Achievement: {
          const {
            totalCountString,
            bronzeAchievementCount,
            silverAchievementCount,
            goldAchievementCount,
          } = await getAchievementInfo()
          presenceData.details = 'Viewing their achievements'
          presenceData.state = totalCountString
          presenceData.smallImageKey = Assets.Question
          presenceData.smallImageText = `${bronzeAchievementCount} Bronze | ${silverAchievementCount} Silver | ${goldAchievementCount} Gold`
          break
        }
        case HomeScreenType.RoomLobby: {
          const showInviteButton = await presence.getSetting<boolean>(
            'show_invite',
          )
          const { roomId, mode, maxPlayers, currentPlayers } = await getWaitingRoomInfo()
          presenceData.details = 'In a room'
          presenceData.state = `${mode} | ${currentPlayers}/${maxPlayers} players`
          if (showInviteButton) {
            presenceData.buttons = [
              {
                label: 'Join Room',
                url: `${protocol}//${hostname}/?room=${roomId}`,
              },
            ]
          }
          break
        }
        case HomeScreenType.Dorm: {
          presenceData.details = 'Viewing their characters'
          break
        }
        case HomeScreenType.FriendlyQueue: {
          presenceData.details = 'In a friendly match queue'
          break
        }
        case HomeScreenType.TournamentQueue: {
          presenceData.details = 'In a tournament queue'
          break
        }
        case HomeScreenType.RankedQueue: {
          presenceData.details = 'In a ranked queue'
          break
        }
        case HomeScreenType.Gacha: {
          const gachaName = await getGachaInfo()
          presenceData.details = 'Viewing the gacha'
          presenceData.state = gachaName
          break
        }
        case HomeScreenType.Home: {
          presenceData.details = 'Viewing the home screen'
          presenceData.state = `${coppers} coppers`
          presenceData.smallImageKey = Assets.Question
          presenceData.smallImageText = `${nickname} - "${signature}"`
          break
        }
        case HomeScreenType.PlayerInfo: {
          presenceData.details = 'Viewing their statistics'
          break
        }
        case HomeScreenType.CreateRoom: {
          presenceData.details = 'Creating a room'
          break
        }
        case HomeScreenType.Rules: {
          presenceData.details = 'Viewing yakus and rules'
          break
        }
        case HomeScreenType.Shop: {
          presenceData.details = 'Viewing the shop'
          break
        }
        default: {
          presenceData.details = 'Loading...'
        }
      }
    }
  }

  if (usesSlideshow)
    presence.setActivity(slideshow)
  else presence.setActivity(presenceData)
})

const presence = new Presence({
  clientId: '662634921914925056',
})

let login

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Guilded.gg/assets/logo.png',
  }

  if (document.location.pathname === '/') {
    login = document.querySelector(
      '.GuildedText-container.GuildedText-container-type-heading1',
    ) !== null
    if (login) {
      presenceData.details = 'Logging in to'
      presenceData.state = 'Guilded.gg'
    }
    else {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'Guilded Main Page'
    }
  }
  if (document.location.pathname.includes('/chat/')) {
    presenceData.details = 'Chating With'
    presenceData.state = document.querySelector(
      '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.LayerContext-container > div.LayerContext-layer-item-wrapper > div > div > div.LayerContext-layer-item-wrapper > div > div.ScreenHeader-container.ScreenHeader-container-desktop.ChannelHeader-container > div.SkeletonPlaceholder-container.ScreenHeader-name',
    )?.textContent
  }
  else if (document.location.pathname.includes('/teams')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Guilded Teams'
  }
  else if (document.location.pathname.includes('/matchmaking')) {
    login = document.querySelector(
      '.MultiStageFlow-progress-bar.MultiStageProgressBar-container',
    ) !== null
    if (login) {
      presenceData.details = 'Making A Scrim For'
      presenceData.state = document.querySelector(
        '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.LayerContext-container > div > div > div.MatchmakingPageV2-scrim-content > div > div > div > div.ScrimFinderTeamLabel-container.ScrimFinderTeamLabel-container-sm.FindScrimFlow-team-label > div > h1',
      )?.textContent
    }
    else {
      presenceData.details = 'Viewing Page:'
      presenceData.state = 'Guilded Scrims'
    }
  }
  else if (document.location.pathname.includes('/find/team')) {
    presenceData.details = 'Finding Team'
    presenceData.state = `Looking At ${
      document.querySelector(
        '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.LayerContext-container > div > div > div.IconNavMenu-container.PlayerLfgPortal-menu > div.TeamFinder-container > div > div.VoteSwiperList-container.VoteSwiperList-container-type-lfg.VoteSwiperList-container-desktop > div.VoteSwiperItem-container.VoteSwiperList-item-wrapper.VoteSwiperList-item-0.ClickAndDragControl-container.ClickAndDragControl-container-grab > div > div > div.TeamCardV2-container.TeamCardV2-container-layout-horizontal.TeamCardV2-container-no-interact.TeamCardV2-container-with-games.TeamListingCard-alias-card > div.TeamCardV2-content > div.TeamCardV2-header.TeamCardHeader-container.TeamCardHeader-container-layout-horizontal > div.TeamCardHeader-team-name-wrapper > h2',
      )?.textContent
    }`
  }
  else if (document.location.pathname.includes('/find/team/status')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Teams Status'
  }
  else if (document.location.pathname.includes('/explore/players/')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Guilded Find Players'
  }
  else if (document.location.pathname.includes('/groups/')) {
    if (
      document.querySelector(
        '.InputControllerWrapper-container.InputControllerWrapper-container-grid.InputControllerWrapper-container-2-columns.RadiosField-panel-inputs.RadiosField-layout-horizontal',
      ) !== null
    ) {
      presenceData.details = 'Creating Channel In'
      presenceData.state = document.querySelector(
        '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.WebAppSidebar-container.WebAppV2-sidebar > div > div > div.TeamNavHeaderV3-container.TeamPageNavV3-header > div.TeamNavHeaderV3-content > div > div.SkeletonPlaceholder-container.TeamNavHeaderV3-team-name > h2',
      )?.textContent
    }
    else if (
      document.querySelector(
        '.StatusContext-container.OptionsMenu-option-content',
      ) !== null
    ) {
      presenceData.details = 'Editing'
      presenceData.state = document.querySelector(
        '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.OverlayStackProvider-container > div.PortalTarget-container.OverlayStackProvider-portal-target > span > div.StatusContext-container.Overlay-status-context > div > div.StatusContext-container.ModalV2-modal-content.ModalV2-modal-content-scrollable > div > div > div > div.OptionsMenu-options-control > div.DesktopOptionsControl-container.OptionsMenu-desktop-options-control > div > div > div.DesktopOptionsControlOptionHeader-container > div',
      )?.textContent
    }
    else if (
      document.querySelector(
        '.StatusContext-container.ModalV2-modal-content.ModalV2-modal-content-scrollable',
      ) !== null
    ) {
      presenceData.details = 'Editing Status To'
      presenceData.state = document.querySelector(
        '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.OverlayStackProvider-container > div.PortalTarget-container.OverlayStackProvider-portal-target > span > div.StatusContext-container.Overlay-status-context > div > div.StatusContext-container.ModalV2-modal-content.ModalV2-modal-content-scrollable > div > div > div.Editor-container.Editor-container-type-reaction.UserStatusOverlay-editor > div > div.needsclick.SlateEditor-editor.SlateEditor-editor-has-max-height > div > span > span > span',
      )?.textContent
    }
    else {
      presenceData.details = 'Viewing Group:'
      presenceData.state = document.querySelector(
        '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.WebAppSidebar-container.WebAppV2-sidebar > div > div > div.TeamNavHeaderV3-container.TeamPageNavV3-header > div.TeamNavHeaderV3-content > div > div.SkeletonPlaceholder-container.TeamNavHeaderV3-team-name > h2',
      )?.textContent
    }
  }
  else if (document.location.pathname.includes('/profile/')) {
    const priceEls = document.querySelectorAll(
      '.GH1-container.UserProfileName-name',
    )
    for (const priceEl of priceEls) {
      presenceData.details = 'Viewing a profile:'
      presenceData.state = priceEl.textContent
    }
  }
  else if (document.location.pathname.includes('/games')) {
    presenceData.details = 'Viewing Page:'
    presenceData.state = 'Game Directory'
  }
  else if (document.location.pathname.includes('/overview')) {
    presenceData.details = 'Overviewing'
    presenceData.state = document.querySelector(
      '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.LayerContext-container > div.LayerContext-layer-item-wrapper > div > div > div.LayerContext-container > div > div > div.TeamPageContent-content > div.TeamPlaqueV2-container.TeamPlaqueV2-container-desktop.TeamPageContent-team-plaque > div.SkeletonPlaceholder-container.TeamPlaqueV2-name-placeholder > h1',
    )?.textContent
  }
  else if (document.location.pathname.includes('/members')) {
    presenceData.details = 'Viewing Members In'
    presenceData.state = document.querySelector(
      '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.WebAppSidebar-container.WebAppV2-sidebar > div > div > div.TeamNavHeaderV3-container.TeamPageNavV3-header > div.TeamNavHeaderV3-content > div > div.SkeletonPlaceholder-container.TeamNavHeaderV3-team-name > h2',
    )?.textContent
  }
  else if (document.location.pathname.includes('/recruitment')) {
    presenceData.details = 'Viewing Team Aplications In'
    presenceData.state = document.querySelector(
      '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.WebAppSidebar-container.WebAppV2-sidebar > div > div > div.TeamNavHeaderV3-container.TeamPageNavV3-header > div.TeamNavHeaderV3-content > div > div.SkeletonPlaceholder-container.TeamNavHeaderV3-team-name > h2',
    )?.textContent
  }
  else if (document.location.pathname.includes('/audit')) {
    presenceData.details = 'Viewing Audit Logs In'
    presenceData.state = document.querySelector(
      '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.WebAppSidebar-container.WebAppV2-sidebar > div > div > div.TeamNavHeaderV3-container.TeamPageNavV3-header > div.TeamNavHeaderV3-content > div > div.SkeletonPlaceholder-container.TeamNavHeaderV3-team-name > h2',
    )?.textContent
  }
  else if (document.location.pathname.includes('/matches')) {
    presenceData.details = 'Viewing Matches In'
    presenceData.state = document.querySelector(
      '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.WebAppSidebar-container.WebAppV2-sidebar > div > div > div.TeamNavHeaderV3-container.TeamPageNavV3-header > div.TeamNavHeaderV3-content > div > div.SkeletonPlaceholder-container.TeamNavHeaderV3-team-name > h2',
    )?.textContent
  }
  else if (document.location.pathname.includes('/insights')) {
    presenceData.details = 'Viewing Team Stats In'
    presenceData.state = document.querySelector(
      '#app > div > div.ReorderPortalContext-container > div.GameContext-container.GameContext-container-no-game.AppV2-game-context > div.StatusContext-container.AppV2-container > div > div.WebAppSidebar-container.WebAppV2-sidebar > div > div > div.TeamNavHeaderV3-container.TeamPageNavV3-header > div.TeamNavHeaderV3-content > div > div.SkeletonPlaceholder-container.TeamNavHeaderV3-team-name > h2',
    )?.textContent
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

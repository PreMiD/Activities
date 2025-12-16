import { ActivityType, Assets, StatusDisplayType } from 'premid'
import { LogoBlackBg, LogoRemovedBg, LogoWhiteBg } from './constants.js'
import { RythmDataGetter } from './dataGetter.js'
import { updateSongTimesTamps } from './utils.js'

const presence = new Presence({
  clientId: '463151177836658699',
})

const dataGetter = new RythmDataGetter()

// ----------------------
// Basic color types
// ----------------------

type RGB = [number, number, number]
type HSL = [number, number, number] // [h, s, l]

type ColorKey
  = | 'pink'
    | 'lightPink'
    | 'yellow'
    | 'lilac'
    | 'purple'
    | 'darkPurple'
    | 'red'
    | 'orange'
    | 'cyan'
    | 'green'
    | 'grey'
    | 'white'

type LogoBackground
  = | typeof LogoBlackBg
    | typeof LogoWhiteBg
    | typeof LogoRemovedBg

const logoBackgroundMap: Record<number, LogoBackground> = {
  0: LogoBlackBg,
  1: LogoWhiteBg,
  2: LogoRemovedBg,
}

function getLogoBackground(bgIdSetting: number): LogoBackground {
  return logoBackgroundMap[bgIdSetting] ?? LogoBlackBg
}

interface ButtonBgLogo { playing: string, paused: string }

function getButtonBgLogo(background: LogoBackground): readonly ButtonBgLogo[] {
  return [
    { playing: background.LogoPlaying, paused: background.LogoPaused }, // default
    { playing: background.LogoPlayingPink, paused: background.LogoPausedPink },
    { playing: background.LogoPlayingLightPink, paused: background.LogoPausedLightPink },
    { playing: background.LogoPlayingYellow, paused: background.LogoPausedYellow },
    { playing: background.LogoPlayingLilac, paused: background.LogoPausedLilac },
    { playing: background.LogoPlayingPurple, paused: background.LogoPausedPurple },
    { playing: background.LogoPlayingDarkPurple, paused: background.LogoPausedDarkPurple },
    { playing: background.LogoPlayingRed, paused: background.LogoPausedRed },
    { playing: background.LogoPlayingOrange, paused: background.LogoPausedOrange },
    { playing: background.LogoPlayingCyan, paused: background.LogoPausedCyan },
    { playing: background.LogoPlayingGreen, paused: background.LogoPausedGreen },
    { playing: background.LogoPlayingGrey, paused: background.LogoPausedGrey },
    { playing: background.LogoPlayingWhite, paused: background.LogoPausedWhite },
  ] as const
}

// ----------------------
// Conversions and helpers
// ----------------------

// Convert RGB (0-255) to HSL (h 0-360, s/l 0-100)
function rgbToHsl([r, g, b]: RGB): HSL {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h *= 60
  }

  return [h, s * 100, l * 100]
}

// ----------------------
// Color rule HSL
// ----------------------

function getColorKeyFromHsl(rgb: RGB): ColorKey {
  const [h, s, l] = rgbToHsl(rgb)

  // grey and white
  if (s < 10) {
    return l > 80 ? 'white' : 'grey'
  }

  if (h >= 345 || h < 15) {
    return 'red'
  }

  if (h >= 15 && h < 45) {
    return 'orange'
  }

  if (h >= 45 && h < 75) {
    return 'yellow'
  }

  if (h >= 75 && h < 165) {
    return 'green'
  }

  if (h >= 165 && h < 210) {
    return 'cyan'
  }

  if (h >= 210 && h < 260) {
    return 'purple'
  }

  // 260–300:  (darkPurple / lilac / purple)
  if (h >= 260 && h < 300) {
    if (l < 40)
      return 'darkPurple'
    if (l > 70)
      return 'lilac'
    return 'purple'
  }

  // 300–345: (pink / lightPink)
  if (h >= 300 && h < 345) {
    if (l > 70)
      return 'lightPink'
    return 'pink'
  }

  return 'red'
}

// ----------------------
// Parsing de cor CSS
// ----------------------

function parseCssColorToRgb(color: string): RGB | null {
  if (!color)
    return null

  const normalized = color.trim().toLowerCase()

  const rgbMatch = normalized.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    return [
      Number(rgbMatch[1]),
      Number(rgbMatch[2]),
      Number(rgbMatch[3]),
    ]
  }

  const hexMatch = normalized.match(/^#([0-9a-f]{6})$/)
  if (!hexMatch) {
    return null
  }

  const hex = hexMatch[1]!
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ]
}

// ----------------------
// Auto logo by track color
// ----------------------

function pickLogoFromTheme(
  background: LogoBackground,
  key: ColorKey,
  isPlaying: boolean,
): string {
  switch (key) {
    case 'pink':
      return isPlaying ? background.LogoPlayingPink : background.LogoPausedPink

    case 'lightPink':
      return isPlaying ? background.LogoPlayingLightPink : background.LogoPausedLightPink

    case 'yellow':
      return isPlaying ? background.LogoPlayingYellow : background.LogoPausedYellow

    case 'lilac':
      return isPlaying ? background.LogoPlayingLilac : background.LogoPausedLilac

    case 'purple':
      return isPlaying ? background.LogoPlayingPurple : background.LogoPausedPurple

    case 'darkPurple':
      return isPlaying ? background.LogoPlayingDarkPurple : background.LogoPausedDarkPurple

    case 'red':
      return isPlaying ? background.LogoPlayingRed : background.LogoPausedRed

    case 'orange':
      return isPlaying ? background.LogoPlayingOrange : background.LogoPausedOrange

    case 'cyan':
      return isPlaying ? background.LogoPlayingCyan : background.LogoPausedCyan

    case 'green':
      return isPlaying ? background.LogoPlayingGreen : background.LogoPausedGreen

    case 'grey':
      return isPlaying ? background.LogoPlayingGrey : background.LogoPausedGrey

    case 'white':
      return isPlaying ? background.LogoPlayingWhite : background.LogoPausedWhite

    default:
      // fallback paranoico
      return isPlaying ? background.LogoPlaying : background.LogoPaused
  }
}

function getLogoByColor(
  buttonTypeColor: number,
  isPlaying: boolean,
  autoLogo: string,
  palette: readonly ButtonBgLogo[],
): string {
  if (buttonTypeColor === 1) {
    return autoLogo
  }

  const rawIndex
    = buttonTypeColor <= 0
      ? 0
      : buttonTypeColor >= 2
        ? buttonTypeColor - 1
        : 0

  const maxIndex = palette.length - 1
  const index
    = rawIndex < 0 || rawIndex > maxIndex
      ? 0
      : rawIndex

  const color = palette[index] ?? palette[0]!
  return isPlaying ? color.playing : color.paused
}

// ----------------------
// Manual color palette for the button
// ----------------------

function getAutoLogoFromColor(
  rawColor: string | undefined,
  isPlaying: boolean,
  background: LogoBackground,
): string {
  const fallback = isPlaying ? background.LogoPlaying : background.LogoPaused

  if (!rawColor) {
    return fallback
  }

  const rgb = parseCssColorToRgb(rawColor)
  if (!rgb) {
    return fallback
  }

  const key = getColorKeyFromHsl(rgb)
  return pickLogoFromTheme(background, key, isPlaying)
}

// ----------------------
// Presence main loop
// ----------------------

presence.on('UpdateData', async () => {
  const mediaData = dataGetter.getMediaData()
  const repeatMode = mediaData.repeatMode
  const trackColor = mediaData.trackColor

  const hidePaused = await presence.getSetting<boolean>('hidePaused')
  const privacyMode = await presence.getSetting<boolean>('privacy')
  const largeImage = await presence.getSetting<number>('largeImage')
  const hideTimesTamps = await presence.getSetting<boolean>('timesTamps')
  const displayType = await presence.getSetting<number>('displayType')
  const buttonType = await presence.getSetting<number>('buttonType')
  const buttonTypeColor = await presence.getSetting<number>('buttonTypeColor')
  const hideRepeat = await presence.getSetting<boolean>('hideRepeat')
  const buttonBgSetting = await presence.getSetting<number>('buttonBgColor')

  const isPlaying = dataGetter.isPlaying()

  const currentLogoBackground = getLogoBackground(buttonBgSetting)
  const buttonBgPalette = getButtonBgLogo(currentLogoBackground)

  const strings = await presence.getStrings({
    playing: 'general.playing',
    paused: 'general.paused',
    repeat: 'general.repeat',
  })

  const showRepeatIcon
    = !hideRepeat
      && repeatMode === 'on'
      && isPlaying

  const smallImageText
    = showRepeatIcon
      ? strings.repeat
      : isPlaying
        ? strings.playing
        : strings.paused

  const autoLogo = getAutoLogoFromColor(
    trackColor,
    isPlaying,
    currentLogoBackground,
  )

  const buttonStyle
    = buttonType === 0
      ? (showRepeatIcon
          ? Assets.Repeat
          : isPlaying
            ? Assets.Play
            : Assets.Pause)
      : buttonType === 1
        ? (showRepeatIcon
            ? Assets.Repeat
            : getLogoByColor(buttonTypeColor, isPlaying, autoLogo, buttonBgPalette)
          )
        : buttonType === 2
          ? (showRepeatIcon
              ? Assets.Repeat
              : getLogoByColor(buttonTypeColor, false, autoLogo, buttonBgPalette)
            )
          : (showRepeatIcon
              ? Assets.Repeat
              : getLogoByColor(buttonTypeColor, true, autoLogo, buttonBgPalette)
            )

  const largeImageStyle
    = largeImage === 0
      ? mediaData.artwork
      : largeImage === 1
        ? getLogoByColor(buttonTypeColor, isPlaying, autoLogo, buttonBgPalette)
        : largeImage === 2
          ? getLogoByColor(buttonTypeColor, false, autoLogo, buttonBgPalette)
          : getLogoByColor(buttonTypeColor, true, autoLogo, buttonBgPalette)

  const stateText
    = displayType === 0
      ? StatusDisplayType.Details ?? undefined
      : displayType === 1
        ? StatusDisplayType.State ?? undefined
        : StatusDisplayType.Name

  // nothing playing or no title → clear presence
  if (mediaData.playbackState === 'none' || !mediaData.title || privacyMode) {
    return presence.clearActivity()
  }

  if (hidePaused && mediaData.playbackState === 'paused') {
    return presence.clearActivity()
  }

  const presenceData: PresenceData = {
    type: ActivityType.Listening,
    largeImageKey: largeImageStyle,
    smallImageKey: buttonStyle,
    smallImageText,
    details: mediaData.title,
    detailsUrl: mediaData.trackUrl,
    state: mediaData.artist,
    stateUrl: mediaData.artistUrl,
    largeImageUrl: mediaData.trackUrl,
    statusDisplayType: stateText,
  }

  if (isPlaying && !hideTimesTamps) {
    const [start, end] = updateSongTimesTamps(dataGetter)

    if (start !== 0 && end !== 0) {
      presenceData.startTimestamp = start
      presenceData.endTimestamp = end
    }
  }

  return presence.setActivity(presenceData)
})

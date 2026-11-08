const buttonId = 'pmd-animevietsub-privacy'
const styleId = 'pmd-animevietsub-privacy-style'

const controlBarSelectors = [
  '.vjs-control-bar',
  '.jw-controlbar .jw-button-container',
  '.plyr__controls',
  '.dplayer-icons-right',
  '.art-control-right',
  '.media-control-right-panel',
  '.mejs__controls',
  '.shaka-controls-button-panel',
]

const settingsControlSelectors = [
  '.vjs-settings-button',
  '.jw-icon-settings',
  '[data-plyr="settings"]',
  '.dplayer-setting',
  '.art-control-setting',
  '.media-control-button[data-settings]',
  '.mejs__settings-button',
  '.shaka-overflow-menu-button',
  '[aria-label*="Settings"]',
  '[title*="Settings"]',
  '[aria-label*="Cài đặt"]',
  '[title*="Cài đặt"]',
]

const pictureInPictureControlSelectors = [
  '.vjs-picture-in-picture-control',
  '.jw-icon-pip',
  '[data-plyr="pip"]',
  '.dplayer-pip-icon',
  '.art-control-pip',
  '.media-control-button[data-pip]',
  '.mejs__picture-in-picture-button',
  '.shaka-pip-button',
  '[aria-label*="Picture in Picture"]',
  '[aria-label*="Picture-in-Picture"]',
  '[title*="Picture in Picture"]',
  '[title*="Picture-in-Picture"]',
]

const actionControlClass = /(?:^|[-_])(?:settings?|picture|pip|fullscreen|quality|captions?|subtitles?|overflow|menu)(?:$|[-_])/i

const eyeIcon = `
  <svg data-private="false" aria-hidden="true" viewBox="0 0 576 512">
    <path fill="currentColor" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7a32 32 0 0 0 0 24.6C17.3 304 48.6 356 95.4 399.4 142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1a32 32 0 0 0 0-24.6C558.7 208 527.4 156 480.6 112.6 433.5 68.8 368.8 32 288 32Zm0 336a112 112 0 1 1 0-224 112 112 0 0 1 0 224Z"/>
  </svg>
  <svg data-private="true" aria-hidden="true" viewBox="0 0 640 512">
    <path fill="currentColor" d="M38.8 5.1A24 24 0 0 0 9.2 42.9l592 464a24 24 0 1 0 29.6-37.8L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4a32 32 0 0 0 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1Zm184.3 144.4A143.4 143.4 0 0 1 320 112a144 144 0 0 1 126.6 212.7L408 294.5a96 96 0 0 0-84-134.4c-5.8-.2-9.2 6.1-7.4 11.7a64 64 0 0 1-3.3 48.6l-90.2-70.9ZM373 389.9A144 144 0 0 1 176 256c0-6.9.5-13.6 1.4-20.2l-94.3-74.3C60.3 191.2 44 220.8 34.5 243.7a32 32 0 0 0 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9Z"/>
  </svg>`

function ensureStyles(document: Document): void {
  if (document.getElementById(styleId))
    return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .pmd-avs-privacy-host { position: relative !important; }
    .pmd-avs-privacy-button {
      align-items: center; box-sizing: border-box; color: inherit; cursor: pointer;
      display: inline-flex; justify-content: center; position: relative;
    }
    .pmd-avs-privacy-button:focus-visible { outline: 2px solid #fff; outline-offset: -3px; }
    .pmd-avs-privacy-button svg {
      display: none; height: 100%; pointer-events: none; transform: scale(.6); width: 100%;
    }
    .pmd-avs-privacy-button[aria-pressed="false"] svg[data-private="false"],
    .pmd-avs-privacy-button[aria-pressed="true"] svg[data-private="true"] { display: block; }
    .pmd-avs-privacy-button--fallback {
      background: rgba(0, 0, 0, .58); border: 0; border-radius: 3px; bottom: 8px;
      color: #fff; height: 36px; padding: 7px; position: absolute; right: 48px;
      width: 40px; z-index: 2147483646;
    }
    .pmd-avs-privacy-button--fallback svg { height: 22px; transform: none; width: 22px; }
  `
  document.head?.append(style)
}

function getPlayerHost(video: HTMLVideoElement): HTMLElement | null {
  return video.closest<HTMLElement>(
    '.video-js, .jwplayer, .plyr, .dplayer, .artplayer-app, .media-player, .mejs__container, .shaka-video-container, [class*="player"], [id*="player"]',
  ) ?? video.parentElement
}

function getControlBar(document: Document, host: HTMLElement | null): HTMLElement | null {
  for (const selector of controlBarSelectors) {
    const controls = host?.querySelector<HTMLElement>(selector)
      ?? document.querySelector<HTMLElement>(selector)
    if (controls)
      return controls
  }
  return null
}

function findControl(
  controls: HTMLElement,
  selectors: string[],
): HTMLElement | null {
  for (const selector of selectors) {
    const control = controls.querySelector<HTMLElement>(selector)
    if (control)
      return control
  }
  return null
}

function getDirectControl(
  controls: HTMLElement,
  control: HTMLElement | null,
): HTMLElement | null {
  while (control?.parentElement && control.parentElement !== controls)
    control = control.parentElement
  return control?.parentElement === controls ? control : null
}

function mountPrivacyButton(
  controls: HTMLElement | null,
  mount: HTMLElement,
  button: HTMLButtonElement,
): HTMLElement | null {
  if (!controls) {
    if (button.parentElement !== mount)
      mount.append(button)
    return null
  }

  const settingsControl = findControl(controls, settingsControlSelectors)
  const pictureInPictureControl = findControl(
    controls,
    pictureInPictureControlSelectors,
  )
  const settings = getDirectControl(controls, settingsControl)
  const pictureInPicture = getDirectControl(controls, pictureInPictureControl)
  const nativeControl = settingsControl ?? pictureInPictureControl

  if (pictureInPicture) {
    if (button.parentElement !== controls
      || button.nextElementSibling !== pictureInPicture) {
      controls.insertBefore(button, pictureInPicture)
    }
    return nativeControl
  }

  const nextControl = settings?.nextElementSibling
  if (nextControl && nextControl !== button)
    controls.insertBefore(button, nextControl)
  else if (button.parentElement !== controls)
    controls.append(button)
  return nativeControl
}

function syncPrivacyButtonAppearance(
  button: HTMLButtonElement,
  nativeControl: HTMLElement | null,
): void {
  const nativeClasses = nativeControl?.className
    .split(/\s+/)
    .filter(className => className && !actionControlClass.test(className))
    ?? []

  button.className = [...new Set([
    ...nativeClasses,
    'pmd-avs-privacy-button',
  ])].join(' ')
}

export function setPrivacyButtonState(button: HTMLButtonElement, privateMode: boolean): void {
  const label = 'Chế độ riêng tư'

  button.ariaPressed = String(privateMode)
  button.ariaLabel = label
  button.title = label
}

export function removePrivacyButton(document: Document): void {
  document.getElementById(buttonId)?.remove()
}

export function ensurePrivacyButton(
  document: Document,
  privateMode: boolean,
  onToggle: () => void,
): HTMLButtonElement | null {
  const video = document.querySelector<HTMLVideoElement>('video')
  if (!video)
    return null

  ensureStyles(document)
  const host = getPlayerHost(video)
  const controls = getControlBar(document, host)
  const mount = controls ?? host
  if (!mount)
    return null

  host?.classList.add('pmd-avs-privacy-host')
  let button = document.getElementById(buttonId) as HTMLButtonElement | null
  if (!button) {
    button = document.createElement('button')
    button.id = buttonId
    button.type = 'button'
    button.innerHTML = eyeIcon
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      onToggle()
    })
  }

  const nativeControl = mountPrivacyButton(controls, mount, button)
  syncPrivacyButtonAppearance(button, nativeControl)
  button.classList.toggle('pmd-avs-privacy-button--fallback', !nativeControl)
  setPrivacyButtonState(button, privateMode)
  return button
}

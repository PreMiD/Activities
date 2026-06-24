export default async function getSettings(presence: Presence) {
  const [privacy, buttons, ads, pause, playback] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('buttons'),
    presence.getSetting<boolean>('ads'),
    presence.getSetting<boolean>('pause'),
    presence.getSetting<boolean>('playback'),
  ])
  return {
    privacy,
    buttons,
    ads,
    pause,
    playback,
  }
}

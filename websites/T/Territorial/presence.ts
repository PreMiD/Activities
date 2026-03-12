/* eslint-disable no-cond-assign */
const presence = new Presence({
  clientId: '503557087041683458',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/T/Territorial/assets/logo.png',
    startTimestamp: browsingTimestamp,
    name: 'Territorial',
  }
  const { href } = document.location
  const buttons = await presence.getSetting<boolean>('buttons')
  const context = document
    .querySelector<HTMLCanvasElement>('#canvasA')!
    .getContext('2d')!
  let tryOne: number | undefined
  const start = context.getImageData(100, 550, 400, 60).data[0]
  if (start === 57 || start === 27 || start === 45) {
    tryOne = Number(context.getImageData(810, 140, 400, 60).data[0])
    tryOne === 55
      ? (presenceData.details = 'Viewing clans leaderboard')
      : tryOne === 4
        ? (presenceData.details = 'Viewing players leaderboard')
        : context.getImageData(810, 80, 400, 60).data[0] === 68
          ? (presenceData.details = 'Viewing clans leaderboard')
          : (tryOne = context.getImageData(780, 160, 400, 60).data[0]) === 254
            || tryOne === 8
              ? (presenceData.details = 'Viewing emoji menu')
              : (tryOne = context.getImageData(1380, 60, 400, 60).data[0]) === 8
                || tryOne === 56
                  ? (presenceData.details = 'Viewing options')
                  : (tryOne = context.getImageData(1400, 80, 400, 60).data[0]) === 94
                    || tryOne === 46
                      ? (presenceData.details = 'Viewing options')
                      : (tryOne = context.getImageData(500, 220, 400, 60).data[0]) === 14
                        || tryOne === 6
                          ? (presenceData.details = 'Viewing color options')
                          : (tryOne = context.getImageData(500, 60, 400, 60).data[0]) === 14
                            || tryOne === 6
                              ? (presenceData.details = 'Viewing color options')
                              : (presenceData.details = 'Viewing main menu')

    presenceData.buttons = [{ label: 'View Menu', url: href }]
  }
  else if (
    context.getImageData(1020, 540, 400, 60).data[0] === 255
    || context.getImageData(1116, 502, 400, 60).data[0] === 255
  ) {
    presenceData.details = 'The game has ended'
  }
  else {
    presenceData.details = 'Playing the game'
    presenceData.buttons = [{ label: 'Play', url: href }]
  }
  if (!buttons)
    delete presenceData.buttons
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

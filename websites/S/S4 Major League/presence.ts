const presence = new Presence({
  clientId: '1557799759455191184',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  presence.setActivity({
    largeImageKey: 'https://s4ml.club/favicon.png',
    details: 'Playing Major League on Xero',
    state: 'www.s4ml.club',
    startTimestamp: browsingTimestamp,
    buttons: [
      {
        label: 'Join S4ML',
        url: 'https://s4ml.club',
      },
    ],
  })
})

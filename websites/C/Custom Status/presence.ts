const presence = new Presence({
  clientId: '673651706139246612',
})

presence.on('UpdateData', () => {
  if (
    document.querySelector('#__nuxt')?.classList?.contains('presence') === false
  )
    document.querySelector('#__nuxt')?.classList.add('presence')

  const objectElement = document.querySelector('#object')

  if (
    Object.keys(JSON.parse(objectElement?.textContent ?? '{}')).length > 0
    && JSON.parse(objectElement?.textContent ?? '{}').details
    && JSON.parse(objectElement?.textContent ?? '{}').largeImageKey
  ) {
    presence.setActivity(JSON.parse(objectElement?.textContent ?? '{}'))
  }
  else {
    presence.setActivity()
  }
})

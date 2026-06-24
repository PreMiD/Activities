const presence = new Presence({
  clientId: '928068375031214170',
})
const timer = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/G/Google%20Keep/assets/logo.png',
    startTimestamp: timer,
  }
  const { hash } = document.location
  const id = hash.split('/')[1]
  const privacy = await presence.getSetting<boolean>('privacy')

  const noteName = Array.from(
    document.querySelectorAll<HTMLDivElement>('div[contenteditable="true"][role="textbox"]'),
  ).find(div => div.style.display !== 'none')
  ?? document.querySelector('body > div.VIpgJd-TUo6Hb.XKSfm-L9AdLc.eo9XGd > div > div.IZ65Hb-TBnied.zTETae-h1U9Be-hxXJme > div.IZ65Hb-s2gQvd > div.IZ65Hb-r4nke-haAclf > div.notranslate.IZ65Hb-YPqjbf.fmcmS-x3Eknd.vIzZGf-r4nke-YPqjbf')

  presenceData.details = 'Viewing Homepage'
  presenceData.state = 'Notes'

  switch (hash) {
    case `#LIST/${id}`: {
      if (!privacy) {
        presenceData.details = 'Reading Tasks:'
        if (noteName?.textContent)
          presenceData.state = noteName.textContent
        else
          presenceData.state = 'Untitled List'
      }
      else {
        presenceData.details = 'Reading Tasks'
        delete presenceData.state
      }

      break
    }
    case `#NOTE/${id}`: {
      if (!privacy) {
        presenceData.details = 'Reading a Note:'
        if (noteName?.textContent)
          presenceData.state = noteName.textContent
        else
          presenceData.state = 'Untitled Note'
      }
      else {
        presenceData.details = 'Reading a Note'
        delete presenceData.state
      }

      break
    }
    case '#search':
    case `#search/${id}`: {
      presenceData.details = 'Search'
      delete presenceData.state

      break
    }
    case '#reminders': {
      presenceData.details = 'Viewing reminders'
      delete presenceData.state

      break
    }
    case `#label/${id}`: {
      if (!privacy && id) {
        presenceData.details = 'Viewing a label:'
        presenceData.state = decodeURIComponent(id)
      }
      else {
        presenceData.details = 'Viewing a label'
        delete presenceData.state
      }

      break
    }
    case '#archive': {
      presenceData.details = 'Viewing the archive'
      delete presenceData.state

      break
    }
    case '#trash': {
      presenceData.details = 'Viewing the trash'
      delete presenceData.state

      break
    }
  }

  if (!presenceData.details)
    presence.setActivity()
  else presence.setActivity(presenceData)
})

const presence = new Presence({
  clientId: '798449961691250709',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/Q/Quora/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }

  if (document.location.hostname.match(/[A-Za-z]+\.quora\.com/)) {
    if (document.location.hostname.match(/[A-Za-z]{4,}\.quora\.com/)) {
      const taxonomy = document.querySelector(
        '#mainContent > div.q-flex.qu-alignItems--center.qu-flexWrap--wrap > div > span > span > a > span > span > span',
      )?.textContent
      presenceData.details = 'Viewing space:'
      presenceData.state = taxonomy
    }
    else {
      switch (document.location.pathname) {
        case '/': {
          presenceData.details = 'Viewing homepage'
          break
        }
        case '/notifications': {
          presenceData.details = 'Viewing notifications'
          break
        }
        case '/following': {
          presenceData.details = 'Viewing feed'
          break
        }
        case '/answer': {
          presenceData.details = 'Viewing questions to be answered'
          break
        }
        case '/answer/requests': {
          presenceData.details = 'Viewing answer requests'
          break
        }
        case '/answer/answer_later': {
          presenceData.details = 'Viewing answer drafts'
          break
        }
        default:
          if (document.location.pathname.includes('/topic/')) {
            const taxonomy = document.querySelector(
              '#mainContent > div:nth-child(1) > div > div > div.q-flex.qu-flexDirection--column.qu-justifyContent--space-around.qu-ml--medium > div.CssComponent-sc-1oskqb9-0.EditWrapper___StyledCssComponent-sc-6vsimt-0.feqBgP > div > div.q-box.qu-display--inline-block > div > span > span > span > span',
            )?.textContent
            presenceData.details = 'Viewing topic:'
            presenceData.state = taxonomy
          }
          else if (document.location.pathname.includes('/profile/')) {
            const account = document.querySelector(
              '#mainContent > div.q-flex.qu-flexDirection--column > div > div.q-flex.qu-flexDirection--column > div.q-flex.qu-alignItems--flex-start.qu-justifyContent--space-between > div.CssComponent-sc-1oskqb9-0.EditWrapper___StyledCssComponent-sc-6vsimt-0.feqBgP > div > div.q-box.qu-display--inline-block > div > div > div > div > span',
            )?.textContent
            presenceData.details = 'Viewing profile:'
            presenceData.state = account
          }
          else if (
            document.location.pathname.match(/^\/[A-Za-z0-9%-]+\/answer\//)
          ) {
            const question = document.querySelector(
              '#mainContent > div > div.q-box.qu-borderAll.qu-borderRadius--small.qu-borderColor--raised.qu-boxShadow--small.qu-bg--raised > div.q-box.qu-pt--medium.qu-px--medium.qu-pb--tiny > div.q-box.qu-mb--medium.qu-mt--small > div > span > span > a > div > div > div > div > span > span',
            )?.textContent
            const account = document.querySelector(
              '#mainContent > div > div.q-box.qu-borderAll.qu-borderRadius--small.qu-borderColor--raised.qu-boxShadow--small.qu-bg--raised > div.q-box.qu-pt--medium.qu-px--medium.qu-pb--tiny > div.q-box.qu-mb--small > div > div > div.q-box.qu-alignSelf--center.qu-flex--auto > div.q-text.qu-dynamicFontSize--regular.qu-truncateLines--3.qu-passColorToLinks > span > span.CssComponent-sc-1oskqb9-0.AbstractSeparatedItems___StyledCssComponent-sc-46kfvf-0.bxBZxD > span.q-text.qu-bold > div > div > div > div > div > a > div > span',
            )?.textContent
            presenceData.details = `Viewing ${account}'s answer for:`
            presenceData.state = question
          }
          else if (document.location.pathname.match(/^\/[A-Z0-9%-]+/i)) {
            const question = document.querySelector(
              '#mainContent > div.q-box.qu-borderBottom > div > div.q-text.qu-dynamicFontSize--xlarge.qu-bold.qu-color--gray_dark_dim.qu-passColorToLinks.qu-lineHeight--regular > span > span > div > div > div > span > span',
            )?.textContent
            presenceData.details = 'Viewing question:'
            presenceData.state = question
          }
      }
    }

    if (!presenceData.details)
      presence.setActivity()
    else presence.setActivity(presenceData)
  }
})

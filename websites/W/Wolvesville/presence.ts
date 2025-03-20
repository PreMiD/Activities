const presence = new Presence({
  clientId: '888429594120716328',
})
const startedTime = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  WovHeroes = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/1.png',
  WovBlog = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/2.png',
  Vouchers = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/3.png',
  WovText = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/4.png',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/5.png',
  WovNoBg = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/6.png',
  WovWhite = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/7.png',
  Online = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/8.png',
  Invisible = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/9.png',
  Dnd = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/10.png',
  LetsPlay = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/11.png',
  Heart = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/12.png',
  Skull = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/13.png',
  Stopwatch = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/14.png',
  Popcorn = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/15.png',
  Friends = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/16.png',
}

presence.on('UpdateData', async () => {
  const [
    privacyMode,
    clanTag,
    privacyChat,
    showStatus,
    invisiblePrivacy,
    showTimestamp,
    logo,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('clanTag'),
    presence.getSetting<boolean>('privacyChat'),
    presence.getSetting<boolean>('showStatus'),
    presence.getSetting<boolean>('invisiblePrivacy'),
    presence.getSetting<boolean>('showTimestamp'),
    presence.getSetting<number>('logo'),
  ])
  const logoArr = [ActivityAssets.Logo, ActivityAssets.WovWhite, ActivityAssets.WovNoBg, ActivityAssets.WovText]
  const presenceData: PresenceData = {
    largeImageKey: logoArr[logo] || ActivityAssets.Logo,
  }

  if (showTimestamp)
    presenceData.startTimestamp = startedTime

  // Wolvesville Blog
  if (document.location.href.includes('blog.wolvesville.com')) {
    presenceData.smallImageKey = ActivityAssets.WovBlog
    presenceData.smallImageText = 'Development Blog'
    if (
      document.location.pathname === '/'
      || document.location.pathname.startsWith('/page')
    ) {
      presenceData.details = 'Development Blog'
      presenceData.state = 'Browsing posts'
    }
    else if (document.querySelector('.post-title')) {
      if (!privacyMode) {
        presenceData.details = 'Reading a blog post:'
        presenceData.state = document.querySelector('.post-title')?.textContent
        presenceData.buttons = [
          {
            label: 'Read Post',
            url: document.URL,
          },
        ]
      }
      else {
        presenceData.state = 'Reading a blog post'
      }
    }

    // Legal
  }
  else if (document.location.href.includes('legal.wolvesville.com')) {
    presenceData.details = 'Legal'
    if (document.location.pathname.includes('tos'))
      presenceData.state = 'Reading the Terms of Service'
    else if (document.location.pathname.includes('privacy-policy'))
      presenceData.state = 'Reading the Privacy Policy'
    else presenceData.state = 'Reading the imprint'

    // Wolvesvile Heroes
  }
  else if (document.location.href.includes('heroes.wolvesville.com')) {
    presenceData.details = 'Wolvesville Heroes'
    presenceData.state = 'Home page'
    presenceData.smallImageKey = ActivityAssets.WovHeroes
    presenceData.smallImageText = 'Wolvesville Heroes'

    if (document.location.pathname.includes('overview')) {
      presenceData.state = 'Overview'
    }
    else if (document.location.pathname.includes('applications')) {
      presenceData.state = 'Applications'
    }
    else if (document.location.pathname.includes('updates')) {
      presenceData.state = 'Updates'
    }
    else if (
      document.location.href.includes('list?role')
      || document.location.href.includes('list.html?role')
    ) {
      if (!privacyMode) {
        presenceData.state = `Viewing the ${document
          .querySelector('#staff_member_name')
          ?.textContent
          ?.trim()} role`
      }
      else {
        presenceData.state = 'Viewing a role'
      }
    }
    else if (
      document.location.href.includes('list?member')
      || document.location.href.includes('list.html?member')
    ) {
      if (!privacyMode) {
        presenceData.state = `Viewing ${
          document.querySelector('#staff_member_name')?.textContent
        }`
      }
      else {
        presenceData.state = 'Viewing a member'
      }
    }

    // Voting Gallery
  }
  else if (document.location.href.includes('voting.wolvesville.com')) {
    presenceData.details = 'Voting Gallery'

    const submissionView = document.querySelector('.css-757v71')

    if (submissionView) {
      if (!privacyMode) {
        presenceData.state = `Viewing submission by ${submissionView.textContent}`
        presenceData.largeImageKey = document.querySelector<HTMLImageElement>('.css-seerqf')?.src
      }
      else {
        presenceData.state = 'Viewing a submission'
      }
    }
    else {
      presenceData.state = 'Browsing...'
    }

    // App info page
  }
  else if (document.location.href.includes('app.wolvesville.com')) {
    presenceData.details = 'Viewing the app page'
  }
  // Vouchers
  else if (document.location.href.includes('vouchers.wolvesville.com')) {
    presenceData.details = 'Redeeming a code'
    presenceData.smallImageKey = ActivityAssets.Vouchers
    presenceData.smallImageText = 'Redeem'

    // Game
  }
  else if (document.location.href.includes('wolvesville.com')) {
    const root = document.querySelector('#root')
    // Get player status
    const status = document.querySelector(
      'div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-173mn98.r-19u6a5r.r-12zb1j4.r-1inuy60',
    )
    || (document.querySelector(
      'div.css-1dbjc4n.r-1awozwy.r-1p0dtai.r-1777fci.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af',
    )
    && document.querySelector(
      'div.css-1dbjc4n.r-1awozwy.r-knv0ih.r-633pao.r-417010 > div.css-1dbjc4n.r-1awozwy.r-lrvibr.r-13qz1uu',
    ))
      ? document.querySelector(
        'div.css-1dbjc4n.r-18u37iz > div.css-1dbjc4n.r-173mn98.r-19u6a5r.r-12zb1j4.r-1inuy60',
      )
      ?? document.querySelector(
        'div.css-1dbjc4n.r-13awgt0.r-eqz5dr.r-1x0uki6.r-xd6kpl.r-1ss6j8a.r-1qortcd > div > div.css-1dbjc4n.r-1pz39u2.r-13awgt0.r-18u37iz > div.css-1dbjc4n',
      )
      : null

    if (status?.querySelector('div > div')?.textContent === '') {
      root?.setAttribute('premid-status', 'lets_play')
    }
    else if (
      status
        ?.querySelector('div')
        ?.getAttribute('style')
        ?.includes('rgb(244, 67, 54)')
    ) {
      root?.setAttribute('premid-status', 'dnd')
    }
    else if (
      status
        ?.querySelector('div')
        ?.getAttribute('style')
        ?.includes('rgb(158, 158, 158)')
    ) {
      root?.setAttribute('premid-status', 'invisible')
    }
    else if (status) {
      root?.setAttribute('premid-status', 'online')
    }

    if (
      document.querySelector(
        'div.css-1dbjc4n.r-18u37iz.r-1777fci.r-zd98yo.r-1n7yuxj > div.css-1dbjc4n.r-66fd6s.r-z2wwpe.r-18u37iz.r-1w6e6rj.r-1777fci.r-1l7z4oj.r-gu0qjt.r-85oauj.r-95jzfe',
      )
    ) {
      presenceData.details = 'Loading Wolvesville...'
    }

    if (
      document.querySelector(
        'div.css-1dbjc4n.r-z2wwpe.r-13awgt0.r-1dhrvg0.r-169s5xo.r-hvns9x.r-1pcd2l5',
      )
      && !document.querySelector(
        'div.css-1dbjc4n.r-1awozwy.r-1p0dtai.r-18u37iz.r-u8s1d.r-e1k2in.r-ipm5af',
      )
    ) {
      presenceData.details = 'At the login page'
      root?.removeAttribute('premid-username')
      root?.removeAttribute('premid-clantag')
      root?.removeAttribute('premid-status')
    }

    // Menu
    if (
      document.querySelector(
        'div.css-1dbjc4n.r-1awozwy.r-1p0dtai.r-18u37iz.r-u8s1d.r-e1k2in.r-ipm5af',
      )
    ) {
      presenceData.details = 'At the main menu'

      root?.removeAttribute('premid-friends')

      // Save username
      if (
        document.querySelectorAll(
          'div.css-901oao.r-jwli3a.r-ubezar.r-5oul0u',
        )[0]?.textContent
        && document
          .querySelectorAll('div.css-901oao.r-jwli3a.r-ubezar.r-5oul0u')[0]
          ?.textContent
          ?.includes('|')
      ) {
        root?.setAttribute(
          'premid-clantag',
          document
            .querySelectorAll('div.css-901oao.r-jwli3a.r-ubezar.r-5oul0u')[0]
            ?.textContent
            ?.split('|')[0] ?? '',
        )
        root?.setAttribute(
          'premid-username',
          document
            .querySelectorAll('div.css-901oao.r-jwli3a.r-ubezar.r-5oul0u')[0]
            ?.textContent
            ?.split('|')[1] ?? '',
        )
      }
      else if (
        document.querySelectorAll(
          'div.css-901oao.r-jwli3a.r-ubezar.r-5oul0u',
        )[0]?.textContent
      ) {
        root?.setAttribute(
          'premid-username',
          document.querySelectorAll(
            'div.css-901oao.r-jwli3a.r-ubezar.r-5oul0u',
          )[0]?.textContent ?? '',
        )
      }

      if (
        !(
          invisiblePrivacy && root?.getAttribute('premid-status') === 'invisible'
        )
        && !privacyMode
      ) {
        if (!clanTag && root?.hasAttribute('premid-clantag')) {
          presenceData.state = `${root?.getAttribute(
            'premid-clantag',
          )}|${root?.getAttribute('premid-username')}`
        }
        else {
          presenceData.state = `${root?.getAttribute('premid-username')}`
        }
      }

      if (!privacyMode && showStatus) {
        if (root?.getAttribute('premid-status') === 'lets_play') {
          presenceData.smallImageKey = ActivityAssets.LetsPlay
          presenceData.smallImageText = 'Let\'s Play'
        }
        else if (root?.getAttribute('premid-status') === 'online') {
          presenceData.smallImageKey = ActivityAssets.Online
          presenceData.smallImageText = 'Online'
        }
        else if (root?.getAttribute('premid-status') === 'dnd') {
          presenceData.smallImageKey = ActivityAssets.Dnd
          presenceData.smallImageText = 'Do Not Disturb'
        }
      }

      if (!privacyMode) {
        if (
          document.querySelector(
            'div.css-1dbjc4n.r-1p0dtai.r-qdtdgp.r-u8s1d.r-1ro7rbe.r-ipm5af > div.css-1dbjc4n.r-1p0dtai.r-1d2f490.r-u8s1d.r-ipm5af > div.css-1dbjc4n.r-13awgt0 > div.css-1dbjc4n.r-13awgt0.r-wk8lta > div.css-1dbjc4n.r-led734.r-1p0dtai.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af',
          )
        ) {
          presenceData.state = 'Clan chat'
        }
        else if (
          document.querySelector(
            'div.css-1dbjc4n.r-1p0dtai.r-qdtdgp.r-u8s1d.r-1ro7rbe.r-ipm5af > div.css-1dbjc4n.r-1p0dtai.r-1d2f490.r-u8s1d.r-ipm5af > div.css-1dbjc4n.r-1pi2tsx.r-13qz1uu > div.css-1dbjc4n.r-led734.r-1p0dtai.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af',
          )
        ) {
          if (!privacyChat) {
            presenceData.state = `Chatting with ${
              document.querySelector(
                'div.css-1dbjc4n.r-19u6a5r > div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-f1odvy > div.css-901oao.r-jwli3a.r-1x35g6.r-vw2c0b',
              )?.textContent
            }`
          }
          else {
            presenceData.state = 'Chatting with a friend'
          }
        }
        else if (document.querySelector('iframe[title=\'Mentor Chat\']')) {
          presenceData.state = 'Mentor chat'
        }
        else if (
          document.querySelector(
            'div.css-1dbjc4n.r-150rngu.r-1niwhzg.r-13awgt0.r-eqz5dr.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1lxl8vk.r-11yh6sk.r-1rnoaur.r-1sncvnh.r-13qz1uu',
          )
        ) {
          presenceData.state = 'Settings'
        }
        else if (
          document.querySelector(
            'div.css-1dbjc4n.r-1kihuf0.r-1mlwlqe.r-1d2f490.r-1udh08x.r-zchlnj > div.css-1dbjc4n.r-1niwhzg.r-vvn4in.r-u6sd8q.r-ehq7j7.r-1p0dtai.r-1pi2tsx.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af.r-13qz1uu.r-1wyyakw',
          )
        ) {
          presenceData.state = 'Wheel of fortune'
        }
        else if (
          document.querySelector('div.css-1dbjc4n.r-13awgt0.r-zd98yo.r-13qz1uu')
        ) {
          // check if viewing their clan or another one
          if (
            document.querySelector(
              'div.css-1dbjc4n.r-1xfd6ze.r-13awgt0.r-1pi2tsx.r-1udh08x',
            )
          ) {
            // viewing a clan
            if (document.querySelector('div.r-1i10wst.r-1kfrs79')) {
              presenceData.state = `Viewing clan: ${
                document.querySelector('div.r-1i10wst.r-1kfrs79')?.textContent
              }`
              // searching for a clan
            }
            else if (
              document
                .querySelector(
                  'div.r-cdmcib.r-13awgt0.r-88pszg.r-1uu6nss > input',
                )
                ?.getAttribute('value')
            ) {
              presenceData.state = 'Searching for clans'
            }
            else {
              presenceData.state = 'Browsing clans'
            }
          }
          else {
            presenceData.state = `Viewing their clan: ${
              document.querySelector('div.r-1i10wst.r-1kfrs79')?.textContent
            }`
          }
        }
        else if (
          document.querySelector(
            'div.css-1dbjc4n.r-150rngu.r-eqz5dr.r-16y2uox.r-1wbh5a2.r-11yh6sk.r-1rnoaur.r-2eszeu.r-1sncvnh > div.css-1dbjc4n > div.css-1dbjc4n > div.css-1dbjc4n.r-13qz1uu > div.css-1dbjc4n.r-z2wwpe.r-nsbfu8.r-13qz1uu > div.css-1dbjc4n.r-1awozwy.r-13awgt0.r-18u37iz.r-1777fci',
          )
        ) {
          presenceData.state = 'Upgrading a role card'
        }
        else if (
          document.querySelector(
            'div.css-1dbjc4n.r-1kihuf0.r-z2wwpe.r-13awgt0.r-1ifxtd0.r-sb58tz.r-13qz1uu > div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1777fci',
          )
        ) {
          const tabs = document.querySelectorAll(
            'div.css-1dbjc4n.r-1loqt21.r-13awgt0.r-1777fci.r-1otgn73.r-lrvibr',
          )
          for (const [index, value] of tabs.entries()) {
            if (
              value.querySelector(
                'div.css-1dbjc4n > div.css-901oao.r-qctebb.r-1i10wst.r-1vr29t4.r-1w50u8q.r-q4m81j',
              )
              || !value.querySelector(
                'div.css-1dbjc4n > div.css-901oao.r-wnl269.r-1i10wst.r-1vr29t4.r-1w50u8q.r-q4m81j',
              )
            ) {
              switch (index) {
                case 0:
                  presenceData.state = 'Viewing roles'
                  break
                case 1:
                  presenceData.state = 'Viewing role cards'
                  break
                case 2:
                  presenceData.state = 'Viewing role setups'
                  break
              }
            }
          }
        }
        else if (
          document.querySelector(
            'div.css-1dbjc4n.r-8o21a9.r-12vffkv.r-u8s1d.r-13qz1uu.r-1g40b8q',
          )
        ) {
          presenceData.state = 'Opening loot boxes'
        }
        else if (
          document.querySelector(
            'div.css-1dbjc4n.r-1awozwy.r-18u37iz.r-1w6e6rj.r-1777fci.r-1guathk',
          )
        ) {
          presenceData.state = 'Shop'
        }
        else if (
          document.querySelector(
            'div.css-1dbjc4n.r-kdyh1x.r-eqz5dr.r-1pi2tsx.r-a2tzq0.r-1ybube5',
          )
        ) {
          presenceData.state = 'Inventory'
        }
      }
    }

    if (
      document.querySelector(
        'div.css-1dbjc4n.r-18u37iz.r-1777fci.r-p1pxzi.r-1u936jj.r-1a6n0ax',
      )
    ) {
      presenceData.details = 'Browsing custom games'
      if (
        !(
          invisiblePrivacy && root?.getAttribute('premid-status') === 'invisible'
        )
        && !privacyMode
      ) {
        if (!clanTag && root?.hasAttribute('premid-clantag')) {
          presenceData.state = `${root.getAttribute(
            'premid-clantag',
          )}|${root.getAttribute('premid-username')}`
        }
        else {
          presenceData.state = `${root?.getAttribute('premid-username')}`
        }
      }
    }

    // Lobby
    if (
      document.querySelector(
        'div.css-1dbjc4n.r-13awgt0.r-gy4na3.r-wk8lta > div.css-1dbjc4n.r-1awozwy.r-led734.r-vu3uv8.r-18u37iz.r-ur6pnr.r-13qz1uu.r-136ojw6',
      )
      ?? document.querySelector(
        'div.css-1dbjc4n.r-13awgt0.r-wk8lta > div.css-1dbjc4n.r-1awozwy.r-led734.r-vu3uv8.r-18u37iz.r-ur6pnr.r-13qz1uu.r-136ojw6',
      )
    ) {
      document.querySelector('div.css-1dbjc4n.r-1awozwy.r-173mn98.r-18u37iz')
        ? (presenceData.details = 'In a friends lobby')
        : (presenceData.details = 'In a custom game lobby')

      if (!privacyMode) {
        if (
          !document.querySelector(
            'div.css-1dbjc4n.r-1awozwy.r-1p0dtai.r-1777fci.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af.r-1pozq62 > div.css-1dbjc4n.r-1awozwy.r-1777fci > div.css-1dbjc4n.r-17bb2tj.r-1muvv40.r-127358a.r-1ldzwu0.r-1r8g8re.r-1acpoxo',
          )
        ) {
          const playerCountLobby = document.querySelector(
            'div.css-1dbjc4n.r-led734.r-1pi2tsx.r-wk8lta > div.css-1dbjc4n.r-150rngu.r-eqz5dr.r-16y2uox.r-1wbh5a2.r-11yh6sk.r-1rnoaur.r-1sncvnh > div > div',
          )?.childElementCount

          if (playerCountLobby === 1)
            presenceData.state = `${playerCountLobby} player`
          else presenceData.state = `${playerCountLobby} players`

          if (presenceData.details.includes('friends') && playerCountLobby && playerCountLobby > 1)
            root?.setAttribute('premid-friends', 'true')
          else root?.removeAttribute('premid-friends')
        }
        else {
          presenceData.state = 'Loading...'
        }
      }
      presenceData.smallImageText = 'Lobby'
      presenceData.smallImageKey = ActivityAssets.Friends
    }

    // In game
    if (
      document.querySelector(
        'div.css-1dbjc4n.r-1xfd6ze.r-d045u9.r-13awgt0.r-edyy15',
      )
    ) {
      if (
        !document.querySelector(
          'div.css-1dbjc4n.r-1awozwy.r-1777fci > div.css-1dbjc4n.r-17bb2tj.r-1muvv40.r-127358a.r-1ldzwu0.r-1r8g8re.r-1acpoxo',
        )
      ) {
        // Pre game lobby
        if (
          document
            .querySelector(
              'div.css-1dbjc4n.r-150rngu.r-18u37iz.r-16y2uox.r-1wbh5a2.r-lltvgl.r-buy8e9.r-1sncvnh',
            )
            ?.innerHTML
            .includes('')
        ) {
          presenceData.details = 'In pre-game lobby'
          presenceData.smallImageKey = ActivityAssets.Stopwatch
          presenceData.smallImageText = 'Waiting'
          if (!privacyMode) {
            const playerCountPreGame = document.querySelector(
              'div.css-1dbjc4n.r-1p0dtai > div > div.css-1dbjc4n.r-led734.r-1pi2tsx.r-wk8lta > div.css-1dbjc4n.r-150rngu.r-eqz5dr.r-16y2uox.r-1wbh5a2.r-11yh6sk.r-1rnoaur.r-1sncvnh > div > div',
            )?.childElementCount

            if (playerCountPreGame === 1)
              presenceData.state = `${playerCountPreGame} player`
            else presenceData.state = `${playerCountPreGame} players`
          }
        }
        else {
          // Playing
          let playerState: string | null | undefined

          presenceData.details = 'In a game'

          if (!privacyMode && root?.getAttribute('premid-friends') === 'true')
            presenceData.details += ' with friends'

          const spectatorList = document.querySelectorAll(
            'div.css-1dbjc4n.r-150rngu.r-eqz5dr.r-16y2uox.r-1wbh5a2.r-3z64tn.r-11yh6sk.r-1rnoaur.r-1sncvnh.r-13qz1uu:nth-last-child(1) > div > div > div > div > div.css-1dbjc4n.r-13awgt0.r-18u37iz.r-1jkjb.r-1d4mawv > div:nth-child(2)',
          )

          for (const spectator of spectatorList) {
            if (
              spectator.textContent?.replace('|', '')
              === root?.getAttribute('premid-username')
              || spectator
                .getAttribute('style')
                ?.includes('color: rgb(236, 64, 122)')
                || spectator
                  .getAttribute('style')
                  ?.includes('color: rgb(255, 64, 129)')
            ) {
              playerState = 'Spectator'
              presenceData.smallImageKey = ActivityAssets.Popcorn
              presenceData.smallImageText = playerState
              if (privacyMode)
                presenceData.details = 'Spectating a game'
            }
          }
          // Player
          if (!privacyMode) {
            const playerList = document.querySelectorAll(
              'div.css-1dbjc4n.r-led734.r-1pi2tsx.r-gy4na3.r-wk8lta > div.css-1dbjc4n.r-150rngu.r-eqz5dr.r-16y2uox.r-1wbh5a2.r-11yh6sk.r-1rnoaur.r-1sncvnh > div > div > div > div > div.css-1dbjc4n.r-13awgt0.r-18u37iz.r-1jkjb.r-1d4mawv > div:nth-child(2)',
            )
            for (const player of playerList) {
              if (
                (player.textContent?.replace('|', '')
                  === root?.getAttribute('premid-username')
                  || player
                    .getAttribute('style')
                    ?.includes('color: rgb(236, 64, 122)')
                    || player
                      .getAttribute('style')
                      ?.includes('color: rgb(255, 64, 129)'))
                    && player.getAttribute('style')?.includes('line-through')
              ) {
                playerState = 'Dead'
                presenceData.smallImageKey = ActivityAssets.Skull
              }
              else if (
                player.textContent?.replace('|', '')
                === root?.getAttribute('premid-username')
                || player
                  .getAttribute('style')
                  ?.includes('color: rgb(236, 64, 122)')
                  || player
                    .getAttribute('style')
                    ?.includes('color: rgb(255, 64, 129)')
              ) {
                playerState = 'Alive'
                presenceData.smallImageKey = ActivityAssets.Heart
              }
            }
            presenceData.smallImageText = playerState
          }

          // Game Over
          if (
            document.querySelector(
              'div.css-1dbjc4n.r-1p0dtai.r-1loqt21.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af.r-1otgn73.r-lrvibr.r-1pwx3x0 > div.css-1dbjc4n.r-1awozwy.r-1pi2tsx.r-1777fci.r-13qz1uu > div.css-1dbjc4n.r-6dt33c.r-13qz1uu',
            )
          ) {
            presenceData.details = 'Game over'

            if (playerState !== 'Spectator') {
              playerState = document
                .querySelector(
                  'div.css-1dbjc4n.r-13awgt0.r-1mlwlqe.r-uvuy5l.r-1udh08x.r-417010 > div.css-1dbjc4n.r-1niwhzg.r-vvn4in.r-u6sd8q.r-x3cy2q.r-1p0dtai.r-1pi2tsx.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af.r-13qz1uu.r-1wyyakw',
                )
                ?.getAttribute('style')
                ?.includes('banner_defeat_middle')
                ? 'Defeat'
                : 'Victory'
            }
          }

          // Player count
          if (!privacyMode) {
            const playerCount = document.querySelectorAll(
              'div.css-1dbjc4n.r-obd0qt.r-1p6tffz.r-17s6mgv.r-l4djrs.r-5kp9u6.r-12vffkv.r-u8s1d.r-1xce0ei.r-1s3egr7',
            )?.length
            const aliveCount = playerCount
              - (
                document
                  .querySelector(
                    'div.css-1dbjc4n.r-led734.r-1pi2tsx.r-wk8lta > div.css-1dbjc4n.r-150rngu.r-eqz5dr.r-16y2uox.r-1wbh5a2.r-11yh6sk.r-1rnoaur.r-1sncvnh',
                  )
                  ?.innerHTML
                  .match(/text-decoration-line: line-through/g)
                  || []
              ).length
              / 2

            presenceData.state = ''
            if (playerState)
              presenceData.state = `${playerState} - `

            presenceData.state += aliveCount === 1
              ? `${aliveCount}/${playerCount} player left`
              : `${aliveCount}/${playerCount} players left`
          }
        }
      }
      else {
        presenceData.details = 'In pre-game lobby'
        privacyMode || (presenceData.state = 'Loading...')
      }
    }
    if (
    // Role wheel
      document.querySelector(
        'div.css-1dbjc4n.r-1awozwy.r-1p0dtai.r-6koalj.r-eqz5dr.r-1777fci.r-1d2f490.r-u8s1d.r-zchlnj.r-ipm5af.r-1pozq62',
      )
      // Picking base or advanced role
      || document.querySelector(
        'div.css-1dbjc4n.r-1awozwy.r-1xfd6ze.r-eqz5dr.r-edyy15.r-1dye5f7',
      )
    ) {
      presenceData.details = 'Game is starting...'
      presenceData.state = 'Getting a role'
      presenceData.smallImageText = 'Waiting'
      presenceData.smallImageKey = 'https://cdn.rcd.gg/PreMiD/websites/W/Wolvesville/assets/0.gif'
    }

    if (
      !(
        invisiblePrivacy && root?.getAttribute('premid-status') === 'invisible'
      )
      && !privacyMode
    ) {
      if (!clanTag && root?.hasAttribute('premid-clantag')) {
        presenceData.smallImageText += ` (${root.getAttribute(
          'premid-clantag',
        )}|${root.getAttribute('premid-username')})`
      }
      else {
        presenceData.smallImageText += ` (${root?.getAttribute(
          'premid-username',
        )})`
      }
    }
  }
  presence.setActivity(presenceData)
})

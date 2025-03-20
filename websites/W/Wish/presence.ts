const presence = new Presence({
  clientId: '633005889619755038',
})

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/W/Wish/assets/logo.png',
  }
  const itemsetting = await presence.getSetting<boolean>('items')
  const languagesetting = await presence.getSetting<string>('language')
  let itemsite = null
  let itemdesc

  // _________________________________________________________________________________________________________________________ Product item
  if (
    document.querySelector('#related-products-scroll-container > div') === null
  ) {
    // Ask for item-site
    itemsite = false
  }
  else {
    itemsite = true
  }

  if (itemsetting === true && itemsite === true) {
    // Ask for Settings
    // ------- important line -------
    itemdesc = document.querySelector(
      '#related-products-scroll-container > div > div > div.ProductContainer__ProductMainSection-sc-1vbd28u-1.dXQSMR > div.ProductContainer__RightColumn-sc-1vbd28u-3.cgensx > div > div.PurchaseContainer__UpperWrapper-sc-1qlezk8-1.gwTXit > h1',
    )?.textContent
    // ------------------------------
    itemdesc = `${itemdesc?.substring(0, itemdesc.length / 2)}...`
  }
  else if (languagesetting === '0') {
    itemdesc = 'Watching an item...'
  }
  else if (languagesetting === '1') {
    itemdesc = 'Beobachtet ein Produkt...'
  }
  // ___________________________________________________________________________________________________________________________

  if (document.location.pathname === '/') {
    if (languagesetting === '0') {
      presenceData.details = 'Browsing in mainpage...'
      presence.setActivity(presenceData)
    }
    else if (languagesetting === '1') {
      presenceData.details = 'Stöbert durch'
      presenceData.state = 'die Startseite...'
      presence.setActivity(presenceData)
    }
  }
  else if (document.location.pathname === '/wishlist') {
    const nameuser = document.querySelector(
      '#react-app > div > div.TabBarWrapper__Wrapper-sc-1p5ocnd-0.wZbPl > div.FlexScrollContainer__FlexGrandparent-o9gi86-0.jXFTEW > div > div > div.NavPanel__Wrapper-sc-1uxerbb-0.kFfmiE > div.NavPanel__Name-sc-1uxerbb-1.kHdhxC',
    )?.textContent

    if (languagesetting === '0') {
      presenceData.details = 'Browsing thought Wishlist'
      presenceData.state = `${nameuser}'s Wishlist`
      presence.setActivity(presenceData)
    }
    else if (languagesetting === '1') {
      presenceData.details = 'Störbert durch Wunschliste'
      presenceData.state = `${nameuser}'s Wunschliste`
      presence.setActivity(presenceData)
    }
  }
  else if (document.location.pathname.includes('/wishlist/')) {
    const wishlist = document.querySelector(
      '#react-app > div > div.TabBarWrapper__Wrapper-sc-1p5ocnd-0.fjpSHM > div.TabBarWrapper__MainRowContainer-sc-1p5ocnd-1.idAkGy > div.Feed__FeedWrapper-sc-10q7yh-0.fiGIea > div.Feed__FeedHeader-sc-10q7yh-1.gOYbXb > h1',
    )?.textContent

    if (languagesetting === '0') {
      presenceData.details = 'Browsing thought Wishlist'
      presenceData.state = wishlist
      presence.setActivity(presenceData)
    }
    else if (languagesetting === '1') {
      presenceData.details = 'Stöbert durch Wunschliste'
      presenceData.state = wishlist
      presence.setActivity(presenceData)
    }
  }
  else if (document.location.pathname.includes('/product/')) {
    if (languagesetting === '0') {
      presenceData.details = 'Viewing product'
      presenceData.state = itemdesc
      presence.setActivity(presenceData)
    }
    else if (languagesetting === '1') {
      presenceData.details = 'Schaut auf ein Produkt'
      presenceData.state = itemdesc
      presence.setActivity(presenceData)
    }
  }
  else {
    switch (document.location.pathname) {
      case '/cart': {
        if (languagesetting === '0') {
          presenceData.details = 'Viewing cart...'
          presenceData.state = 'Someone have Promocodes?'
          presence.setActivity(presenceData)
        }
        else if (languagesetting === '1') {
          presenceData.details = 'Schaut in Warenkorb'
          presenceData.state = 'Hat jemand Promocodes?'
          presence.setActivity(presenceData)
        }

        break
      }
      case '/notifications': {
        if (languagesetting === '0') {
          presenceData.details = 'Looking for Notifications'
          presenceData.state = 'Many deals today owo'
          presence.setActivity(presenceData)
        }
        else if (languagesetting === '1') {
          presenceData.details = 'Schaut nach Nachrichten'
          presenceData.state = 'So viele Deals owo'
          presence.setActivity(presenceData)
        }

        break
      }
      case '/refer': {
        const code = document.querySelector(
          '#react-app > div > div.TabBarWrapper__Wrapper-sc-1p5ocnd-0.wZbPl > div.ReferralPage__MainWrapper-zs6pzr-0.bDMHGd > div.ReferralPage__ContentWrapper-zs6pzr-2.cHgkEg > div.ReferralPage__CodeSectionWrapper-zs6pzr-8.eOMTZS > div.ReferralPage__CodeBoxWrapper-zs6pzr-10.eoklod > div.ReferralPage__CodeBox-zs6pzr-14.bupEiO',
        )?.textContent

        if (languagesetting === '0') {
          presenceData.details = 'Looking for new Customers'
          presenceData.state = `50% discount > Code: ${code}`
          presence.setActivity(presenceData)
        }
        else if (languagesetting === '1') {
          presenceData.details = 'Sucht neue Kunden'
          presenceData.state = `50% Rabatt > Code: ${code}`
          presence.setActivity(presenceData)
        }

        break
      }
      default:
        if (document.location.pathname.includes('/transaction/')) {
          if (languagesetting === '0') {
            presenceData.details = 'Viewing transactions...'
            presenceData.state = 'Waiting for a product'
            presence.setActivity(presenceData)
          }
          else if (languagesetting === '1') {
            presenceData.details = 'Schaut auf Bestellungen'
            presenceData.state = 'Wartet auf ein Produkt'
            presence.setActivity(presenceData)
          }
        }
        else if (document.location.pathname === '/profile') {
          const name2 = document.querySelector(
            '#react-app > div > div.TabBarWrapper__Wrapper-sc-1p5ocnd-0.wZbPl > div.FlexScrollContainer__FlexGrandparent-o9gi86-0.jXFTEW > div > div > div.NavPanel__Wrapper-sc-1uxerbb-0.kFfmiE > div.NavPanel__Name-sc-1uxerbb-1.kHdhxC',
          )?.textContent

          if (languagesetting === '0') {
            presenceData.details = 'Viewing profile'
            presenceData.state = name2
            presence.setActivity(presenceData)
          }
          else if (languagesetting === '1') {
            presenceData.details = 'Schaut auf ein Profil'
            presenceData.state = name2
            presence.setActivity(presenceData)
          }
        }
        else if (document.location.pathname.includes('/merchant/')) {
          const shop = document.querySelector(
            '#react-app > div > div.TabBarWrapper__Wrapper-sc-1p5ocnd-0.fjpSHM > div.TabBarWrapper__MainRowContainer-sc-1p5ocnd-1.idAkGy > div.MerchantPage__Wrapper-sc-1nxlnue-0.doABiZ > div.MerchantPage__HeaderWrapper-sc-1nxlnue-1.gYkbZT > div > div > h1',
          )?.textContent

          if (languagesetting === '0') {
            presenceData.details = 'Viewing shop'
            presenceData.state = shop
            presence.setActivity(presenceData)
          }
          else if (languagesetting === '1') {
            presenceData.details = 'Stöbert durch Shop'
            presenceData.state = shop
            presence.setActivity(presenceData)
          }
        }
        else {
          switch (document.location.pathname) {
            case '/feed/tabbed_feed_latest': {
              if (languagesetting === '0') {
                presenceData.details = 'Viewing popular Feed...'
                presence.setActivity(presenceData)
              }
              else if (languagesetting === '1') {
                presenceData.details = 'Stöbert durch'
                presenceData.state = 'Populär Feed'
                presence.setActivity(presenceData)
              }
              if (document.location.pathname.includes('/product/')) {
                presenceData.details = 'Viewing product'
                presenceData.state = document.querySelector(
                  '#react-app > div > div.modal-root.BaseModal__ModalContainer-sc-188teto-4.bFHXBY > div > div > div > div > div.ProductContainer__ProductMainSection-sc-1vbd28u-1.fYThRf > div.ProductContainer__RightColumn-sc-1vbd28u-3.ewTgOn > div > div.PurchaseContainer__UpperWrapper-sc-1qlezk8-1.jEnuPa > h1',
                )?.textContent
                presence.setActivity(presenceData)
              }
              // ----------------------------------------------------------

              break
            }
            case '/feed/pickup__tab': {
              if (languagesetting === '0') {
                presenceData.details = 'Viewing local Feed...'
                presence.setActivity(presenceData)
              }
              else if (languagesetting === '1') {
                presenceData.details = 'Stöbert durch'
                presenceData.details = 'Lokal Feed'
                presence.setActivity(presenceData)
              }
              if (document.location.pathname.includes('/product/')) {
                presenceData.details = 'Viewing product'
                presenceData.state = itemdesc
                presence.setActivity(presenceData)
              }
              // -------------------------------------------------------------

              break
            }
            case '/feed/blitz_buy__tab': {
              if (languagesetting === '0') {
                presenceData.details = 'Wheel of Fortune'
                presenceData.state = 'Try your Luck!'
                presence.setActivity(presenceData)
              }
              else if (languagesetting === '1') {
                presenceData.details = 'Glücksrat'
                presenceData.state = 'Versuche dein Glück'
                presence.setActivity(presenceData)
              }
              if (document.location.pathname.includes('/product/')) {
                presenceData.details = 'Viewing product'
                presenceData.state = itemdesc
                presence.setActivity(presenceData)
              }
              // ---------------------------------------------------------------

              break
            }
            case '/feed/express__tab': {
              if (languagesetting === '0') {
                presenceData.details = 'Viewing express Feed...'
                presence.setActivity(presenceData)
              }
              else if (languagesetting === '1') {
                presenceData.details = 'Stöbert durch'
                presenceData.state = 'Express Feed'
                presence.setActivity(presenceData)
              }
              if (document.location.pathname.includes('/product/')) {
                presenceData.details = 'Viewing product'
                presenceData.state = itemdesc
                presence.setActivity(presenceData)
              }
              // ------------------------------------------------------------------

              break
            }
            case '/feed/recently_viewed__tab': {
              if (languagesetting === '0') {
                presenceData.details = 'Look at'
                presenceData.state = 'recently seen products'
                presence.setActivity(presenceData)
              }
              else if (languagesetting === '1') {
                presenceData.details = 'Schaut auf'
                presenceData.state = 'kürzlich gesehene Produkte'
                presence.setActivity(presenceData)
              }
              if (document.location.pathname.includes('/product/')) {
                presenceData.details = 'Viewing product'
                presenceData.state = itemdesc
                presence.setActivity(presenceData)
              }
              // --------------------------------------------------------------

              break
            }
            default:
              if (document.location.pathname.includes('/feed/tag_')) {
                const tag = document.querySelector(
                  '#react-app > div > div.TabBarWrapper__Wrapper-sc-1p5ocnd-0.fjpSHM > div.TabBar__Wrapper-sc-1vadptt-0.bTjdiW > div > div > div > h1',
                )?.textContent

                if (languagesetting === '0') {
                  presenceData.details = 'Viewing for'
                  presenceData.state = tag
                  presence.setActivity(presenceData)
                }
                else if (languagesetting === '1') {
                  presenceData.details = 'Stöbert durch'
                  presenceData.state = tag
                  presence.setActivity(presenceData)
                }
                if (document.location.pathname.includes('/product/')) {
                  presenceData.details = 'Viewing product'
                  presenceData.state = document.querySelector(
                    '#react-app > div > div.modal-root.BaseModal__ModalContainer-sc-188teto-4.bFHXBY > div > div > div > div > div.ProductContainer__ProductMainSection-sc-1vbd28u-1.fYThRf > div.ProductContainer__RightColumn-sc-1vbd28u-3.ewTgOn > div > div.PurchaseContainer__UpperWrapper-sc-1qlezk8-1.jEnuPa > h1',
                  )?.textContent
                  presence.setActivity(presenceData)
                }
              }
              else {
                presence.setActivity()
              }
          }
        }
    }
  }
})

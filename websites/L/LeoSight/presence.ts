const presence = new Presence({
  clientId: '888141162488143893',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/L/LeoSight/assets/logo.png',
  Lsminilogo = 'https://cdn.rcd.gg/PreMiD/websites/L/LeoSight/assets/0.png',
  Artic = 'https://cdn.rcd.gg/PreMiD/websites/L/LeoSight/assets/1.png',
  Ctf = 'https://cdn.rcd.gg/PreMiD/websites/L/LeoSight/assets/2.png',
  Eco = 'https://cdn.rcd.gg/PreMiD/websites/L/LeoSight/assets/3.png',
  Guard = 'https://cdn.rcd.gg/PreMiD/websites/L/LeoSight/assets/4.png',
}

let item, item2
presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    smallImageKey: ActivityAssets.Lsminilogo,
    smallImageText: 'leosight.cz',
    startTimestamp: browsingTimestamp,
  }
  const path = document.location.pathname
  if (
    path === '/'
    && !window.location.href.includes('artic')
    && !window.location.href.includes('ctf')
    && !window.location.href.includes('eco')
    && !window.location.href.includes('guard')
  ) {
    presenceData.details = 'Prohlíží si hlavní stránku...'
  }
  else if (path === '/novinky') {
    presenceData.details = 'Fórum'
    presenceData.state = 'Novinky'
  }
  else if (path.includes('registrace')) {
    presenceData.details = 'Registrace'
  }
  else if (path.includes('podminky-uziti')) {
    presenceData.details = 'Podmínky užití'
  }
  else if (path.includes('ochrana-osobnich-udaju')) {
    presenceData.details = 'GDPR'
  }
  else if (path.includes('clanek')) {
    item = document.querySelector('div.panel-body h2') as HTMLElement
    item2 = document.querySelector(
      'div.col-md-3.pull-left span.authorname',
    ) as HTMLElement
    presenceData.details = item.textContent
    presenceData.state = `Autor článku: ${item2.textContent}`
  }
  else if (path.includes('editor/novy')) {
    presenceData.details = 'Píše nový článek'
  }
  else if (path === '/forum') {
    presenceData.details = 'Fórum'
    presenceData.state = 'Hlavní stránka'
  }
  else if (
    path.includes('/forum/')
    && !path.includes('new')
    && !path.includes('topic')
  ) {
    item = document.querySelector('div.obsah.text-left h3') as HTMLElement
    presenceData.details = 'Fórum'
    presenceData.state = item.textContent
  }
  else if (path === '/forum/new') {
    presenceData.details = 'Fórum'
    presenceData.state = 'Nejnovější témata'
  }
  else if (path.includes('/forum/topic')) {
    item = document.querySelector('.text-center') as HTMLElement
    item2 = document.querySelector(
      'div.forum-message div.left a.pname',
    ) as HTMLElement
    presenceData.details = item.textContent
    presenceData.state = `Autor tématu: ${item2.textContent}`
  }
  else if (path === '/forum/43') {
    presenceData.state = 'Chystá se způsobit adminům deprese.'
  }
  else if (path.includes('/newtopic')) {
    presenceData.details = 'Zakládá nové téma'
  }
  else if (path.includes('turnaje')) {
    presenceData.details = 'Turnaje'
  }
  else if (path === '/donate') {
    presenceData.details = 'Podpora portálu'
  }
  else if (path.includes('/shop')) {
    presenceData.details = 'Obchod'
    if (path.includes('/shop/web')) {
      presenceData.state = 'Web'
    }
    else if (path.includes('skimo')) {
      presenceData.state = 'Skimo'
    }
    else if (path.includes('asteria')) {
      presenceData.state = 'Asteria'
    }
    else if (path.includes('vip')) {
      presenceData.state = 'VIP'
    }
    else if (path.includes('akce')) {
      presenceData.state = 'Akce'
    }
    else if (path.includes('all')) {
      presenceData.state = 'Vše'
    }
    else if (path.includes('/shop/')) {
      item = document.querySelector('div.panel-body h3') as HTMLElement
      presenceData.state = item.textContent
    }
  }
  else {
    switch (path) {
      case '/trade': {
        presenceData.details = 'Nabídky obchodu'
        break
      }
      case '/market': {
        presenceData.details = 'Tržiště'
        break
      }
      case '/poukaz': {
        presenceData.details = 'Uplatnit poukaz'
        break
      }
      case '/vip': {
        presenceData.details = 'VIP'
        break
      }
      case '/premium': {
        presenceData.details = 'PREMIUM'
        break
      }
      case '/team': {
        presenceData.details = 'Admin-Team'
        break
      }
      case '/statistiky': {
        presenceData.details = 'Statistiky'
        break
      }
      case '/pravidla': {
        presenceData.details = 'Pravidla portálu'
        break
      }
      default:
        if (path.includes('/tym')) {
          item = document.querySelector(
            'div.obsah.text-center p',
          ) as HTMLElement
          item2 = document.querySelector(
            'div.obsah.text-center h2',
          ) as HTMLElement
          if (item2.textContent === 'Týmy') {
            presenceData.details = 'Prohlíží si týmy'
          }
          else {
            presenceData.details = 'Prohlíží si tým:'
            presenceData.state = `${item.textContent} (${item2.textContent})`
          }
        }
        else {
          switch (path) {
            case '/ucp': {
              presenceData.details = 'Uživatelský panel'
              break
            }
            case '/prospect': {
              presenceData.details = 'Prospect'
              break
            }
            case '/akce': {
              presenceData.details = 'Komunitní akce'
              break
            }
            case '/ankety': {
              presenceData.details = 'Ankety'
              break
            }
            case '/spoluhraci': {
              presenceData.details = 'Hledám spoluhráče'
              break
            }
            case '/herna': {
              presenceData.details = 'Jsem gambler'
              break
            }
            case '/hlasky': {
              presenceData.details = 'Hlášky'
              break
            }
            case '/ticket': {
              presenceData.details = 'Tickety'
              break
            }
            case '/logs': {
              presenceData.details = 'Logy'
              break
            }
            case '/ukoly': {
              presenceData.details = 'Denní úkoly'
              break
            }
            case '/rychlobitva': {
              presenceData.details = 'Rychlobitva!'
              break
            }
            case '/rychlobitva/karty': {
              presenceData.details = 'Seznam karet Rychlobitvy'
              break
            }
            case '/advent': {
              presenceData.details = 'Adventní kalendář'
              break
            }
            case '/chat': {
              presenceData.details = 'Chatuje'
              break
            }
            case '/upozorneni': {
              presenceData.details = 'Upozornění'
              break
            }
            case '/znamky': {
              presenceData.details = 'Katalog známek'
              break
            }
            case '/banlist': {
              presenceData.details = 'Seznam zabanovaných uživatelů'
              break
            }
            case '/faktury': {
              presenceData.details = 'Faktury'
              break
            }
            case '/nastaveni': {
              presenceData.details = 'Nastavení účtu'
              break
            }
            case '/dashboard': {
              presenceData.details = 'Provádí adminskou magii'
              break
            }
            case '/modlog': {
              presenceData.details = 'Provádí ještě adminštější magii'
              break
            }
            case '/kodex-at': {
              presenceData.details = 'Studuje adminskou Bibli'
              break
            }
            default:
              if (path.includes('/skimo')) {
                presenceData.details = 'Skimo rozcestník'
                if (path.includes('postavy')) {
                  presenceData.state = 'Moje postavy'
                }
                else if (path.includes('/frakce')) {
                  presenceData.details = 'Seznam frakcí'
                  if (path.includes('/frakce/')) {
                    item = document.querySelectorAll(
                      'div.obsah.text-center h2',
                    )[1] as HTMLElement
                    presenceData.details = 'Prohlíží si frakci'
                    presenceData.state = item.textContent
                  }
                }
                else if (path.includes('/auta')) {
                  presenceData.state = 'Seznam vozidel'
                }
                else if (path.includes('/interiery')) {
                  presenceData.state = 'Seznam interiérů'
                }
                else if (path.includes('/skiny')) {
                  presenceData.state = 'Seznam skinů'
                }
                else if (path.includes('/radia')) {
                  presenceData.state = 'Seznam rádií'
                }
                else if (path.includes('/banlist')) {
                  presenceData.state = 'Seznam banů'
                }
              }
              else if (path === '/profil/3773') {
                presenceData.details = 'Obtěžuje autora tohoto'
                presenceData.state = 'RPC'
              }
              else if (path === '/profil/1') {
                presenceData.details = 'Obtěžuje Ratáže.'
              }
              else if (path.includes('uzivatele')) {
                presenceData.details = 'Seznam uživatelů'
              }
              else if (path.includes('/profil/')) {
                item = document.querySelector('.on-pname') as HTMLElement
                presenceData.details = 'Prohlíží si profil uživatele:'
                presenceData.state = item.textContent
              }
              else {
                switch (path) {
                  case '/pratele': {
                    presenceData.details = 'Seznam přátel'
                    break
                  }
                  case '/avatar': {
                    presenceData.details = 'Nastavuje si avatar'
                    break
                  }
                  case '/profil': {
                    presenceData.details = 'Prohlíží si svůj profil'
                    break
                  }
                  default:
                    if (window.location.href.includes('artic')) {
                      presenceData.smallImageKey = ActivityAssets.Artic
                      presenceData.smallImageText = 'artic.leosight.cz'
                      presenceData.details = 'Artic'
                      if (path === '/' || path === '')
                        presenceData.state = 'Hlavní stránka'
                      if (path.includes('mdc.ic')) {
                        presenceData.details = 'Prohlíží si MDC'

                        if (path === '/mdc.ic/')
                          presenceData.state = 'Ověření uživatele'

                        if (path.includes('dashboard'))
                          presenceData.state = 'Hlavní stránka'
                        else if (path.includes('apb'))
                          presenceData.state = 'APB'
                        else if (path.includes('warrants'))
                          presenceData.state = 'Zatykače'
                        else if (path.includes('osoba'))
                          presenceData.state = 'Vyhledává osobu'
                        else if (path.includes('vozidlo'))
                          presenceData.state = 'Vyhledává vozidlo'
                        else if (path.includes('nemovitost'))
                          presenceData.state = 'Vyhledává nemovitost'
                        else if (path.includes('firma'))
                          presenceData.state = 'Vyhledává firmu'
                        else if (path.includes('smazane'))
                          presenceData.state = 'Smazané záznamy'
                        else if (path.includes('odtahy'))
                          presenceData.state = 'Odtažená vozidla'
                        else if (path.includes('handbook'))
                          presenceData.state = 'Úvod příručky'
                        else if (path.includes('slovnik'))
                          presenceData.state = 'Slovník'
                        else if (path.includes('codes'))
                          presenceData.state = 'Kódy'
                        else if (path.includes('sazebnik'))
                          presenceData.state = 'Sazebník trestů'
                        else if (path.includes('stop'))
                          presenceData.state = 'Zastavovací techniky'
                        else if (path.includes('law'))
                          presenceData.state = 'Zákon o policii'
                        else if (path.includes('directive'))
                          presenceData.state = 'Směrnice'
                        else if (path.includes('teams'))
                          presenceData.state = 'Hierarchie PSA'
                      }
                      else if (path.includes('stoongle')) {
                        presenceData.details = 'Stoongluje'
                        if (path.includes('katalog'))
                          presenceData.state = 'Katalog webů'
                        else if (path.includes('burza.ic'))
                          presenceData.state = 'Burza'
                        else if (path.includes('invest.ic'))
                          presenceData.state = 'CE Invest'
                        else if (path.includes('hzs.ic'))
                          presenceData.state = 'Hasičský záchranný sbor'
                        else if (path.includes('nic.ic'))
                          presenceData.state = 'IC.NIC'
                        else if (path.includes('garver.ic'))
                          presenceData.state = 'Garver Auction House'
                        else if (path.includes('sanwave.ic'))
                          presenceData.state = 'SanWave'
                        else if (path.includes('antares.ic'))
                          presenceData.state = 'ANTARES'
                        else if (path.includes('belleville.ic'))
                          presenceData.state = 'Belleville'
                        else if (path.includes('krypta.ic'))
                          presenceData.state = 'Krypta - online kasíno'
                        else if (path.includes('katastr.ic'))
                          presenceData.state = 'Katastr nemovitostí'
                        else if (path.includes('lemongate.ic'))
                          presenceData.state = 'LemonGate - hlavní stránka'
                        else if (path.includes('e6ftf4.lemon'))
                          presenceData.state = 'LemonGate - rozcestník'
                        else if (path.includes('board4.lemon'))
                          presenceData.state = 'LemonGate - Board4'
                        else if (path.includes('b3s4f3.lemon'))
                          presenceData.state = 'LemonGate - kryptografie'
                        else if (path.includes('irc4na.lemon'))
                          presenceData.state = 'LemonGate - Ircana'
                        else if (path.includes('1trade.lemon'))
                          presenceData.state = 'LemonGate - AceTrade'
                        else if (path.includes('blockchain.ic'))
                          presenceData.state = 'NC Blockchain'
                        else if (path.includes('nomelcoin.ic'))
                          presenceData.state = 'NomelCoin'
                        else if (path.includes('oilrig.ic'))
                          presenceData.state = 'OilRig'
                        else if (path.includes('kiwi.ic'))
                          presenceData.state = 'Kiwi - internetové reklamy'
                        else if (path.includes('spay.ic'))
                          presenceData.state = 'SPay'
                        else if (path.includes('sherwood.ic'))
                          presenceData.state = 'Sherwood Corporation'
                      }
                      else if (path.includes('smail.ic')) {
                        presenceData.details = 'Smail'
                        presenceData.state = 'Hlavní stránka'
                        if (path.includes('prijate'))
                          presenceData.state = 'Přijaté'
                        else if (path.includes('napsat'))
                          presenceData.state = 'Napsat e-mail'
                        else if (path.includes('odeslane'))
                          presenceData.state = 'Odeslané'
                        else if (path.includes('nastaveni'))
                          presenceData.state = 'Nastavení'
                      }
                      else if (path.includes('tcu.ic')) {
                        presenceData.state = 'Tax Compliance Unit'
                      }
                      else if (path.includes('mining.ic')) {
                        presenceData.state = 'Těžba kryptoměn'
                      }
                      else if (path.includes('vaos.ic')) {
                        presenceData.state = 'Veterinární a odchytová služba'
                      }
                      else if (path.includes('writer.ic')) {
                        presenceData.state = 'Writer'
                      }
                      else if (path.includes('post.ic/')) {
                        presenceData.details = 'Post'
                        presenceData.state = 'Doručené'
                        if (path.includes('sent'))
                          presenceData.state = 'Odeslané'
                        else if (path.includes('read'))
                          presenceData.state = 'Čte e-mail'
                      }
                      else if (path.includes('iris.ic/')) {
                        presenceData.details = 'Iris'
                        if (path === '/iris.ic/' || path === '/iris.ic') {
                          presenceData.state = 'Hlavní stránka'
                        }
                        else if (path.includes('settings')) {
                          presenceData.state = 'Nastavení'
                        }
                        else if (path.includes('ic/box')) {
                          presenceData.state = 'Schránka'
                        }
                        else if (path.includes('chat')) {
                          presenceData.state = 'Chat'
                        }
                        else if (path.includes('hashtag')) {
                          if (
                            path === '/iris.ic/hashtag'
                            || path === '/iris.ic/hashtag/'
                          ) {
                            presenceData.state = 'Hashtagy'
                          }
                          else if (path.includes('/hashtag/')) {
                            presenceData.details = 'Iris - Hashtagy'
                            item = path.replace('/iris.ic/hashtag/', '')
                            presenceData.state = `#${item}`
                          }
                        }
                        else if (
                          path.includes('iris.ic/')
                          && path !== 'iris.ic/'
                          && !path.includes('/users')
                        ) {
                          presenceData.details = 'Iris uživatelský profil:'
                          if (!path.includes('www')) {
                            item = path.replace('/iris.ic/', '')
                            presenceData.state = `@${item}`
                          }
                          else if (path.includes('www')) {
                            item = path.replace('/www/iris.ic/', '')
                            item = item.replace('.php', '')
                            presenceData.state = `@${item}`
                          }
                        }
                        else if (path.includes('users')) {
                          presenceData.state = 'Seznam uživatelů'
                        }
                      }
                    }
                    else if (window.location.href.includes('ctf')) {
                      presenceData.smallImageKey = ActivityAssets.Ctf
                      presenceData.smallImageText = 'ctf.leosight.cz'
                      presenceData.details = 'Leosight CTF'
                      if (path.includes('login.php'))
                        presenceData.state = 'Přihlášení'
                      else if (path.includes('index.php'))
                        presenceData.state = 'Odvařuje si mozek'
                    }
                    else if (window.location.href.includes('eco')) {
                      presenceData.smallImageKey = ActivityAssets.Eco
                      presenceData.smallImageText = 'eco.leosight.cz'
                      presenceData.details = 'Hraje Leosight ECO'
                    }
                    else if (window.location.href.includes('guard')) {
                      presenceData.smallImageKey = ActivityAssets.Guard
                      presenceData.smallImageText = 'guard.leosight.cz'
                      presenceData.details = 'Leosigh Guard'
                      if (path === '' || path === '/')
                        presenceData.state = 'Seznam serverů'
                      if (path.includes('hive.php')) {
                        presenceData.state = 'LSG - Hive'
                      }
                      else if (path.includes('skimose')) {
                        presenceData.state = 'Skimo SE - API'
                      }
                      else if (path.includes('dokumentace.php')) {
                        presenceData.state = 'Skimo SE - Public API'
                      }
                      else if (path.includes('servery.php')) {
                        presenceData.state = 'LSEC ServerList'
                      }
                      else if (path.includes('license.php')) {
                        presenceData.state = 'LSG LicesnseList'
                      }
                      else if (path.includes('breach.php')) {
                        presenceData.state = 'LSG-Breach'
                      }
                      else if (path.includes('prospect.php')) {
                        presenceData.state = 'Leosight Prospect'
                      }
                      else if (path.includes('/prospect/')) {
                        presenceData.details = 'LeoSight rádio'
                        if (path.includes('radio_mobile.php'))
                          presenceData.state = 'Poslouchá rádio'
                        else if (path.includes('radio_newsong.php'))
                          presenceData.state = 'Přidává novou písničku'
                      }
                    }
                }
              }
          }
        }
    }
  }
  presence.setActivity(presenceData)
})

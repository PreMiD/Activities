import { Assets } from 'premid'

const presence = new Presence({
  clientId: '837833278777065503',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)

/**
 * Replaces "-" with " ", optional first letter of every word in uppercase (the first letter will be always uppercase)
 * @param input Input replacing "-" with " "; First letter always uppercase
 * @param everyFirstLetterUppercase If true, first letter of each word is capitalized
 * @returns {string} The input with "-" replaced with " " and the first letter of each word capitalized
// (false) "terms-of-service" -> "Terms of service"; (true) "rift-s" -> "Rift S"
 */
function splitOnDashes(input: string, everyFirstLetterUppercase = false): string {
  return input
    .split('-')
    .map((s, i) =>
      i === 0 || everyFirstLetterUppercase
        ? s.charAt(0).toUpperCase() + s.slice(1)
        : s,
    )
    .join(' ')
}

function isInViewport(ele: HTMLElement) {
  if (!ele)
    return false

  const bounding = ele.getBoundingClientRect()

  return (
    bounding.top >= 0
    && bounding.left >= 0
    && bounding.right
    <= (window.innerWidth || document.documentElement.clientWidth)
    && bounding.bottom
    <= (window.innerHeight || document.documentElement.clientHeight)
  )
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/O/Oculus/assets/logo.jpg',
    startTimestamp: browsingTimestamp,
  }
  const hostName = document.location.hostname.replace('www.', '')
  const path = window.location.pathname.split('/').slice(1)
  const setting = {
    showButtons: await presence.getSetting<boolean>('buttons'),
    showTimestamp: await presence.getSetting<boolean>('timestamp'),
    showCartTotal: await presence.getSetting<boolean>('shop_total'),
  }

  switch (hostName) {
    // Support pages
    case 'support.oculus.com': {
      presenceData.details = 'Viewing Support Page:'
      if (path[0] === '' || !path[0]) {
        presenceData.state = 'Home'
      }
      else {
        // Gets the biggest title of page
        const article = document.querySelector('h1')?.textContent
          || document.querySelector('h2')?.textContent
          || document.querySelector('h4')?.textContent
        if (article) {
          presenceData.state = article.length > 128 ? `${article.slice(0, 125)}...` : article
          presenceData.buttons = [
            {
              label: 'Open Article',
              url: `https://${hostName}/${path[0]}`,
            },
          ]
        }
        else {
          presenceData.state = 'Unknown Article'
        }
      }
      break
    }

    case 'secure.oculus.com': {
      presenceData.details = 'Oculus Account'

      if (path[0] === 'my' && path[1] === 'profile')
        presenceData.state = 'Profile'
      else if (path[0] === 'my' && path[1] === 'orders')
        presenceData.state = 'Orders'
      else if (path[0] === 'my' && path[1] === 'subscriptions')
        presenceData.state = 'Subscriptions'
      else if (path[0] === 'my' && path[1] === 'quest')
        presenceData.state = 'Quest Experiences'
      else if (path[0] === 'my' && path[1] === 'rift')
        presenceData.state = 'Rift Experiences'
      else if (path[0] === 'my' && path[1] === 'gear-vr-go')
        presenceData.state = 'Gear VR and Oculus Go Experiences'
      else if (path[0] === 'my' && path[1] === 'payment-methods')
        presenceData.state = 'Payment methods'
      else if (path[0] === 'my' && path[1] === 'devices')
        presenceData.state = 'Devices'
      else if (path[0] === 'my' && path[1] === 'security')
        presenceData.state = 'Security'
      else if (path[0] === 'my' && path[1] === 'friends')
        presenceData.state = 'Friends'
      else if (path[0] === 'my' && path[1] === 'notifications')
        presenceData.state = 'Notification Settings'
      else if (path[0] === 'my' && path[1] === 'emails')
        presenceData.state = 'Email Preferences'
      else if (path[0] === 'my' && path[1] === 'privacy')
        presenceData.state = 'Privacy Center'
      else if (path[0] === 'my' && path[1] === 'linked-accounts')
        presenceData.state = 'Facebook Settings'
      else if (path[0] === 'my' && path[1] === 'preview-apps')
        presenceData.state = 'Preview apps'
      else if (path[0] === 'my' && path[1] === 'authorized-organizations')
        presenceData.state = 'Authorized organizations'
      else if (path[0] === 'my' && path[1] === 'places')
        presenceData.state = 'Places'
      else presenceData.state = 'Other'

      break
    }

    // Main pages
    case 'oculus.com': {
      // Hompage
      if (path[0] === '' || !path[0]) {
        presenceData.details = 'Viewing Homepage'
      }
      else {
        switch (path[0]) {
          case 'legal': {
            presenceData.smallImageKey = Assets.Reading
            presenceData.smallImageText = 'Reading'
            presenceData.details = splitOnDashes(path[1]!, false)
            break
          }

          // Specific headsets
          case 'quest':
          case 'quest-2':
          case 'go':
          case 'rift':
          case 'rift-s': {
            presenceData.details = 'Viewing Product:'
            presenceData.state = splitOnDashes(path[0])

            if (
              isInViewport(
                document.querySelector(
                  'h2.rbpbduva.slrhy5ou.sw32xbbe.jma5w017.pvc73czq.dos3uok6.bsc86jdp.sj117cy1.e5fbeixf.o5uldogj.c7pcq5cm.i13o4lny.l4s1jwut.thcaz4uc.tcjo4660.mm8y8im2.mnbq7hy4',
                )!,
              )
              || isInViewport(
                document.querySelector(
                  '.b52kj89e.sq39p0kj.rbj7b54s.pjumf6uq.a0585srg.i92ihv9n.baw4mjhw.ptamchqq.j0w2kb1n.i2wm47ke.qol2cro8.okr54ooa.klsajntx.rd0pab4s.oq0i6scd.ayos5gsh.h21vdxyh.og1bctnk.crbex1nj.plgazb4k.tr6l6ww2.e7vbqoz9.r49rl50p.q8abdh1i.tcghoajs.cp4ljrx1.a0avu08k.anf3k8p9.q2mnpuig.nqouel9a.k5dtgqef.aawx349i',
                )!,
              )
              || isInViewport(
                document.querySelector('div > div.a5eizvf9.rm933jvs')!,
              )
            ) {
              presenceData.details = 'Reading Reviews of:'
            }
            else if (path[1]) {
              presenceData.details = `Product - ${splitOnDashes(path[0])}`
              presenceData.state = document.querySelector(
                'h1.rbpbduva.slrhy5ou.sw32xbbe.tssb32rf.q8m3c5hr.sjvld55j.h2xm5abc.t2genh0f.aiyvpu16.d29ffpmv.ecv66445.mm8y8im2.i7qx9w64.rhjqn6gv.p5bjl15m.rz0v8pod.mnbq7hy4',
              )?.textContent || 'Unknown'
            }

            presenceData.buttons = [
              {
                label: 'View Product',
                url: `https://${hostName}/${path[0]}`,
              },
            ]
            break
          }
          case 'accessories': {
            presenceData.details = path[1] === 'quest-2'
              || path[1] === 'quest'
              || path[1] === 'rift-s'
              || path[1] === 'rift'
              || path[1] === 'go'
              ? 'Viewing Accessories for:'
              : 'Viewing Accessory:'
            presenceData.state = splitOnDashes(path[1]!)

            if (
              path[1] !== 'quest-2'
              && path[1] !== 'quest'
              && path[1] !== 'rift-s'
              && path[1] !== 'rift'
              && path[1] !== 'go'
            ) {
              presenceData.buttons = [
                {
                  label: 'View Accessory',
                  url: `https://${hostName}/accessories/${path[1]}`,
                },
              ]
            }

            break
          }
          case 'cart': {
            if (setting.showCartTotal) {
              presenceData.details = 'Shop - Cart'
              presenceData.state = `Total: ${
                document.querySelectorAll(
                  'div.alzwoclg.sl27f92c > span.rbpbduva.slrhy5ou.ozgaokry.oti77mm6.ghiirjs1.mm8y8im2.i7qx9w64.rhjqn6gv.p5bjl15m.rz0v8pod.mnbq7hy4',
                )[1]?.textContent || '$0'
              }`
            }
            else {
              presenceData.details = 'Viewing Page'
              presenceData.state = 'Cart'
            }
            break
          }
          case 'checkout': {
            if (setting.showCartTotal) {
              presenceData.details = 'Shop - Checkout'
              presenceData.state = `Total: ${
                document.querySelector(
                  '.rbpbduva.ku1pdt15.ttdjqg0v.oz5golib.nd8uflda.i7qx9w64.rhjqn6gv',
                )?.textContent || '$0'
              }`
            }
            else {
              presenceData.details = 'Viewing Page'
              presenceData.state = 'Checkout'
            }
            break
          }
          case 'compare': {
            const headset = {
              left: document.querySelector<HTMLSelectElement>('div._9erd select._9ere')!,
              right: document.querySelectorAll<HTMLSelectElement>('div._9erd select._9ere')[1]!,
            }

            presenceData.details = 'Comparing Headsets:'
            presenceData.state = `${
              headset.left?.options[headset.left.selectedIndex]?.text
              || 'Unknown'
            } x ${
              headset.right?.options[headset.right.selectedIndex]?.text
              || 'Unknown'
            }`

            break
          }
          case 'vr-for-good': {
            if (path[1] === 'stories' && path[2]) {
              presenceData.details = 'VR for Good - Story:'
              presenceData.state = document.querySelector(
                'h1._2e90._2e93._2e94.article-hero__title',
              )?.textContent || splitOnDashes(path[2])

              presenceData.buttons = [
                {
                  label: 'Read Story',
                  url: `https://${hostName}/vr-for-good/stories/${path[2]}`,
                },
              ]
            }
            else {
              presenceData.details = 'Viewing Page:'
              presenceData.state = 'VR for Good'
            }

            break
          }
          case 'safety-center': {
            presenceData.details = 'Viewing Safety Center'
            if (path[1])
              presenceData.state = `For ${splitOnDashes(path[1])}`
            break
          }

          // Blogs
          case 'blog': {
            // All blogs
            if (!path[1]) {
              presenceData.details = 'Viewing all Blogs'
            }
            // Viewing a blog
            else {
              presenceData.details = 'Reading Blog:'
              let blog = document.querySelector('#blog-heading')?.textContent
              if (blog && blog.length > 128)
                blog = `${blog.slice(0, 125)}...`
              presenceData.state = blog ?? 'Unknown Blog'
              presenceData.buttons = [
                {
                  label: 'Read Blog Post',
                  url: `https://${hostName}/${path[0]}/${path[1]}`,
                },
              ]
            }
            break
          }

          // Store pages
          case 'experiences': {
            if (
              !path[1]
              || path[1] === 'gaming'
              || path[1] === 'fitness'
              || path[1] === 'entertainment'
            ) {
              if (path[1]) {
                presenceData.details = 'Viewing Experience:'
                presenceData.state = splitOnDashes(path[1])

                presenceData.buttons = [
                  {
                    label: 'View Experience',
                    url: `https://${hostName}/experiences/${path[1]}`,
                  },
                ]
              }
              else {
                presenceData.details = 'Viewing Experiences'
              }

              break
            }
            else {
              presenceData.details = `Store for ${splitOnDashes(path[1])}`

              presenceData.buttons = [
                {
                  label: 'View Store',
                  url: `https://${hostName}/${path[0]}`,
                },
              ]

              // Store home page
              if (path[2] === '' || !path[2]) {
                presenceData.state = 'Home'
              }
              // Section aka showcases
              else {
                switch (path[2]) {
                  case 'section': {
                    presenceData.details = `Store for ${splitOnDashes(
                      path[1],
                    )} - Showcase`
                    presenceData.state = document.querySelectorAll('.section-header__title')[0]
                      ?.textContent ?? 'Loading...'

                    presenceData.buttons.push({
                      label: 'View Showcase',
                      url: `https://${hostName}/${path[0]}/${path[1]}/${path[2]}/${path[3]}`,
                    })

                    // Developer posts

                    break
                  }
                  case 'developer-post': {
                    const title = document.querySelector('._9cq4')?.textContent
                      ?? 'Unknown'

                    presenceData.state = `Dev-Post: ${
                      title.length > 118 ? `${title.slice(0, 115)}...` : title
                    }`

                    presenceData.buttons.push({
                      label: 'Read Dev-Post',
                      url: `https://${hostName}/${path[0]}/${path[1]}/${path[2]}/${path[3]}`,
                    })

                    // Searching

                    break
                  }
                  case 'search': {
                    presenceData.details = `Store for ${splitOnDashes(
                      path[1],
                    )} - Search`
                    presenceData.state = document.querySelector('.disco-search__query')
                      ?.textContent ?? 'Unknown'

                    // Bundles

                    break
                  }
                  default:
                    if (
                      document.querySelector(
                        'div.bundle-detail-page__description > h1',
                      )?.textContent
                    ) {
                      presenceData.details = `Store for ${splitOnDashes(
                        path[1],
                      )} - Bundle`
                      presenceData.state = document.querySelector(
                        'div.bundle-detail-page__description > h1',
                      )?.textContent ?? 'Loading...'

                      presenceData.buttons.push({
                        label: 'View bundle',
                        url: `https://${hostName}/${path[0]}/${path[1]}/${path[2]}`,
                      })

                      // Games
                    }
                    else {
                      presenceData.details = `Store for ${splitOnDashes(
                        path[1],
                      )} - Game`
                      presenceData.state = document.querySelectorAll('.app-description__title')[0]
                        ?.textContent ?? 'Loading...'

                      presenceData.buttons.push({
                        label: 'View Game',
                        url: `https://${hostName}/${path[0]}/${path[1]}/${path[2]}`,
                      })
                    }
                }
              }

              break
            }
          }
          case 'research': {
            presenceData.details = 'Viewing Page:'
            presenceData.state = 'Research'

            presenceData.buttons = [
              {
                label: 'View Page',
                url: `https://${hostName}/${path[0]}`,
              },
            ]

            break
          }
          case 'careers': {
            presenceData.details = 'Viewing Page:'
            presenceData.state = 'Career'

            presenceData.buttons = [
              {
                label: 'View Page',
                url: `https://${hostName}/${path[0]}`,
              },
            ]

            break
          }
          case 'holiday': {
            presenceData.details = 'Viewing Page:'
            presenceData.state = document.querySelector(
              'h1.rbpbduva.p00k3eym.s2xhriuh.lvqykqo5.se9zvvl8.m98qiilh.dlvx4kqw',
            )?.textContent ?? 'Holiday deal'

            presenceData.buttons = [
              {
                label: 'View Page',
                url: `https://${hostName}/${path[0]}`,
              },
            ]

            break
          }
          case 'referrals': {
            presenceData.details = 'Viewing Page:'
            presenceData.state = 'Referrals'

            break
          }
          default: {
            presenceData.details = 'Viewing Page:'
            presenceData.state = 'Unknown Page'

            break
          }
        }
      }

      break
    }
  }

  if (!presenceData.details) {
    presence.setActivity()
  }
  else {
    // Delete button(s) / timestamp relating to the setting
    if (presenceData.buttons && !setting.showButtons)
      delete presenceData.buttons
    if (!setting.showTimestamp)
      delete presenceData.startTimestamp
    presence.setActivity(presenceData)
  }
})

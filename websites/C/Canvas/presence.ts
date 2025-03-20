const presence = new Presence({
  clientId: '1023383174027415572',
})
const browsingTimestamp = Math.floor(Date.now() / 1000)
const canvasDataFunctions = {
  announcement: (
    presenceData: PresenceData,
    category: string,
    isPrivate: boolean,
  ) => {
    return (presenceData.details = applyPrivacy(
      'Viewing announcements',
      category,
      isPrivate,
    ))
  },
  discussion: (
    presenceData: PresenceData,
    category: string,
    discussionPath: string[],
    isPrivate: boolean,
  ) => {
    switch (discussionPath[0] ?? '') {
      case '': {
        presenceData.details = applyPrivacy(
          'Viewing discussions',
          category,
          isPrivate,
        )
        break
      }
      case 'new': {
        presenceData.details = applyPrivacy(
          `Creating a new ${
            getNavigationPath()[1] === 'Announcements'
              ? 'announcement'
              : 'discussion'
          }`,
          category,
          isPrivate,
        )
        if (!isPrivate) {
          presenceData.state = document.querySelector<HTMLInputElement>(
            '#discussion-title',
          )?.value
        }
        break
      }
      default: {
        if (discussionPath[1] === 'edit') {
          presenceData.details = applyPrivacy(
            `Editing a ${
              getNavigationPath()[1] === 'Announcements'
                ? 'announcement'
                : 'discussion'
            }`,
            category,
            isPrivate,
          )
          if (!isPrivate) {
            presenceData.state = document.querySelector<HTMLInputElement>(
              '#discussion-title',
            )?.value
          }
        }
        else {
          presenceData.details = applyPrivacy(
            `Viewing a ${
              getNavigationPath()[1] === 'Announcements'
                ? 'announcement'
                : 'discussion'
            }`,
            category,
            isPrivate,
          )
          if (!isPrivate) {
            presenceData.state = document.querySelector<HTMLHeadingElement>(
              '.discussion-title',
            )?.textContent
          }
        }
      }
    }
  },
  pages: (
    presenceData: PresenceData,
    category: string,
    pagesPath: string[],
    isPrivate: boolean,
  ) => {
    if (pagesPath[0]) {
      if (pagesPath[1] === 'edit') {
        presenceData.details = applyPrivacy(
          'Editing a page',
          category,
          isPrivate,
        )
        if (!isPrivate) {
          presenceData.state = document.querySelector<HTMLInputElement>('#title')?.value
        }
      }
      else {
        presenceData.details = applyPrivacy(
          'Viewing a page',
          category,
          isPrivate,
        )
        if (!isPrivate) {
          presenceData.state = document.querySelector<HTMLHeadingElement>(
            '.page-title',
          )?.textContent
        }
      }
    }
    else {
      const titleInput = document.querySelector<HTMLInputElement>('#title')
      if (titleInput) {
        presenceData.details = applyPrivacy(
          'Creating a page',
          category,
          isPrivate,
        )
        if (!isPrivate)
          presenceData.state = titleInput.value
      }
      else {
        presenceData.details = applyPrivacy(
          'Viewing pages',
          category,
          isPrivate,
        )
      }
    }
  },
  files: (
    presenceData: PresenceData,
    category: string | null = null,
    isPrivate: boolean,
  ) => {
    if (category) {
      presenceData.details = applyPrivacy(
        'Browsing files',
        category,
        isPrivate,
      )
    }
    else {
      presenceData.details = 'Browsing files'
    }
    if (!isPrivate) {
      presenceData.state = document.querySelector<HTMLAnchorElement>(
        '#breadcrumbs>ul>li+li:last-of-type a',
      )?.textContent
    }
  },
  collaborations: (
    presenceData: PresenceData,
    category: string,
    isPrivate: boolean,
  ) => {
    if (
      document.querySelector<HTMLFormElement>('#new_collaboration')?.style.display !== 'none'
    ) {
      presenceData.details = applyPrivacy(
        'Creating a collaboration',
        category,
        isPrivate,
      )
      if (!isPrivate) {
        presenceData.state = document.querySelector<HTMLSelectElement>(
          '#collaboration_collaboration_type',
        )?.value
      }
    }
    else if (
      document.querySelector<HTMLFormElement>('.edit_collaboration')
    ) {
      presenceData.details = applyPrivacy(
        'Editing a collaboration',
        category,
        isPrivate,
      )
      if (!isPrivate) {
        presenceData.state = document.querySelector<HTMLInputElement>(
          '[name=\'collaboration[title]\']',
        )?.value
      }
    }
    else {
      presenceData.details = applyPrivacy(
        'Browsing collaborations',
        category,
        isPrivate,
      )
    }
  },
  conferences: (
    presenceData: PresenceData,
    category: string,
    isPrivate: boolean,
  ) => {
    const conferenceInput = document.querySelector<HTMLSelectElement>(
      '#web_conference_conference_type',
    )
    if (conferenceInput) {
      presenceData.details = applyPrivacy(
        `${conferenceInput.disabled ? 'Editing' : 'Creating'} a conference`,
        category,
        isPrivate,
      )
      if (!isPrivate) {
        presenceData.state = document.querySelector<HTMLInputElement>(
          '#web_conference_title',
        )?.value
      }
    }
    else {
      presenceData.details = applyPrivacy(
        'Browsing conferences',
        category,
        isPrivate,
      )
    }
  },
  people: (
    presenceData: PresenceData,
    category: string,
    isPrivate: boolean,
  ) => {
    presenceData.details = applyPrivacy(
      'Browsing members',
      category,
      isPrivate,
    )
  },
  profile: (presenceData: PresenceData, isPrivate: boolean) => {
    presenceData.details = 'Viewing a user\'s profile'
    if (!isPrivate) {
      presenceData.state = document
        .querySelector<HTMLHeadingElement>('h2')
        ?.textContent
        ?.trim()
      presenceData.smallImageKey = getComputedStyle(
        document.querySelector<HTMLAnchorElement>('.avatar')!,
      )?.backgroundImage?.match(/url\("(.+)"\)/)?.[1]
    }
  },
}

function applyPrivacy(input: string, detail: string, isPrivate: boolean) {
  return isPrivate ? input : `${input} for ${detail}`
}

function getNavigationPath(): string[] {
  return [...(document.querySelector('#breadcrumbs > ul')?.children ?? [])]
    .slice(1)
    .map((li) => {
      return li?.textContent ?? ''
    })
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/C/Canvas/assets/logo.png',
    startTimestamp: browsingTimestamp,
  }
  const { pathname, hostname, search } = document.location
  const pathSplit = pathname.split('/').filter(val => val)
  const privacyMode = await presence.getSetting<boolean>('privacyMode')

  if (hostname === 'www.canvas.net') {
    switch (pathSplit[0] ?? '') {
      case '': {
        presenceData.details = 'Browsing catalog'
        break
      }
      case 'browse': {
        presenceData.details = 'Browsing course details'
        presenceData.state = document.querySelector<HTMLHeadingElement>('.h1')?.textContent
        break
      }
      case 'courses': {
        presenceData.details = 'Enrolling in a course'
        presenceData.state = document.querySelector<HTMLSpanElement>(
          'h2 > span',
        )?.lastChild?.textContent
        break
      }
      case 'dashboard': {
        presenceData.details = 'Viewing their dashboard'
        break
      }
      case 'order_items': {
        presenceData.details = 'Viewing their purchase history'
        break
      }
    }
  }
  else {
    // All other canvas domains
    const navigationPath = getNavigationPath()
    const topPath = navigationPath[navigationPath.length - 1]
    const firstPath = navigationPath[0]
    switch (pathSplit[0] ?? '') {
      case '': {
        presenceData.details = 'Viewing dashboard'
        break
      }
      case 'about': {
        canvasDataFunctions.profile(presenceData, privacyMode)
        break
      }
      case 'account_notifications': {
        presenceData.details = 'Viewing global notifications'
        break
      }
      case 'calendar': {
        presenceData.details = 'Viewing calendar'
        presenceData.state = document.querySelector<HTMLSpanElement>(
          '.navigation_title_text',
        )?.textContent
        break
      }
      case 'conversations': {
        const conversationInput = document.querySelector<HTMLInputElement>(
          '#compose-message-subject',
        )
        if (conversationInput) {
          presenceData.details = 'Composing a message'
          presenceData.state = conversationInput.value
        }
        else {
          presenceData.details = 'Viewing messages'
        }
        break
      }
      case 'courses': {
        if (pathSplit[1]) {
          switch (pathSplit[2] ?? '') {
            case '': {
              if (privacyMode) {
                presenceData.details = 'Viewing a course'
              }
              else {
                presenceData.details = 'Viewing course'
                presenceData.state = firstPath
              }
              break
            }
            case 'announcements': {
              canvasDataFunctions.announcement(
                presenceData,
                `course: ${firstPath}`,
                privacyMode,
              )
              break
            }
            case 'assignments': {
              switch (pathSplit[3] ?? '') {
                case '': {
                  presenceData.details = applyPrivacy(
                    'Viewing assignments',
                    `course: ${firstPath}`,
                    privacyMode,
                  )
                  break
                }
                case 'new': {
                  presenceData.details = applyPrivacy(
                    'Creating an assignment',
                    `course: ${firstPath}`,
                    privacyMode,
                  )
                  if (!privacyMode) {
                    presenceData.state = document.querySelector<HTMLInputElement>(
                      '#assignment_name',
                    )?.value
                  }
                  break
                }
                case 'syllabus': {
                  if (
                    document.querySelector<HTMLIFrameElement>(
                      '#course_syllabus_body_ifr',
                    )
                  ) {
                    presenceData.details = applyPrivacy(
                      'Editing syllabus',
                      `course: ${firstPath}`,
                      privacyMode,
                    )
                  }
                  else {
                    presenceData.details = applyPrivacy(
                      'Viewing syllabus',
                      `course: ${firstPath}`,
                      privacyMode,
                    )
                  }
                  break
                }
                default: {
                  switch (pathSplit[4]) {
                    case 'edit': {
                      presenceData.details = applyPrivacy(
                        'Editing an assignment',
                        `course: ${firstPath}`,
                        privacyMode,
                      )
                      if (!privacyMode) {
                        presenceData.state = document.querySelector<HTMLInputElement>(
                          '#assignment_name',
                        )?.value
                      }
                      break
                    }
                    case 'submissions': {
                      presenceData.details = applyPrivacy(
                        'Viewing submissions for an assignment',
                        `course: ${firstPath}`,
                        privacyMode,
                      )
                      if (!privacyMode)
                        presenceData.state = navigationPath[2]
                      break
                    }
                    case 'peer_reviews': {
                      presenceData.details = applyPrivacy(
                        'Viewing peer reviews for an assignment',
                        `course: ${firstPath}`,
                        privacyMode,
                      )
                      if (!privacyMode)
                        presenceData.state = topPath
                      break
                    }
                    default: {
                      presenceData.details = applyPrivacy(
                        'Viewing assignment',
                        `course: ${firstPath}`,
                        privacyMode,
                      )
                      if (!privacyMode)
                        presenceData.state = topPath
                    }
                  }
                }
              }
              break
            }
            case 'collaborations': {
              canvasDataFunctions.collaborations(
                presenceData,
                `course: ${firstPath}`,
                privacyMode,
              )
              break
            }
            case 'conferences': {
              canvasDataFunctions.conferences(
                presenceData,
                `course: ${firstPath}`,
                privacyMode,
              )
              break
            }
            case 'discussion_topics': {
              canvasDataFunctions.discussion(
                presenceData,
                `course: ${firstPath}`,
                pathSplit.slice(3),
                privacyMode,
              )
              break
            }
            case 'external_tools': {
              if (privacyMode) {
                presenceData.details = 'Viewing external tools for a course'
              }
              else {
                presenceData.details = `Viewing course: ${firstPath}`
                presenceData.state = topPath
              }
              break
            }
            case 'files': {
              canvasDataFunctions.files(
                presenceData,
                `course: ${firstPath}`,
                privacyMode,
              )
              break
            }
            case 'gradebook': {
              switch (pathSplit[3]) {
                case 'history': {
                  presenceData.details = applyPrivacy(
                    'Viewing grade history',
                    `course: ${firstPath}`,
                    privacyMode,
                  )
                  break
                }
                case 'speed_grader': {
                  presenceData.details = applyPrivacy(
                    'Grading an assignment',
                    `course: ${
                      document.querySelector<HTMLAnchorElement>(
                        '#context_title',
                      )?.textContent
                    }`,
                    privacyMode,
                  )
                  if (!privacyMode) {
                    presenceData.state = document.querySelector<HTMLHeadingElement>(
                      '.assignmentDetails__Title',
                    )?.textContent
                  }
                  break
                }
                default: {
                  presenceData.details = applyPrivacy(
                    'Viewing gradebook',
                    `course: ${firstPath}`,
                    privacyMode,
                  )
                }
              }
              break
            }
            case 'grades': {
              if (pathSplit[3]) {
                presenceData.details = applyPrivacy(
                  'Viewing student grades',
                  `course: ${firstPath}`,
                  privacyMode,
                )
                if (!privacyMode)
                  presenceData.state = topPath
              }
              else {
                presenceData.details = applyPrivacy(
                  'Viewing grades',
                  `course: ${firstPath}`,
                  privacyMode,
                )
              }
              break
            }
            case 'groups': {
              presenceData.details = applyPrivacy(
                'Viewing groups',
                `course: ${firstPath}`,
                privacyMode,
              )
              break
            }
            case 'modules': {
              if (pathSplit[3] === 'progressions') {
                presenceData.details = applyPrivacy(
                  'Viewing module progression',
                  `course: ${firstPath}`,
                  privacyMode,
                )
              }
              else {
                presenceData.details = applyPrivacy(
                  'Viewing modules',
                  `course: ${firstPath}`,
                  privacyMode,
                )
              }
              break
            }
            case 'outcomes': {
              const createOutcomeModal = document.querySelector<HTMLSpanElement>(
                '[data-testid=\'createOutcomeModal\']',
              )
              const editOutcomeInput = document.querySelector<HTMLInputElement>(
                '[data-testid=\'name-input\']',
              )
              if (createOutcomeModal) {
                presenceData.details = applyPrivacy(
                  'Creating an outcome',
                  `course: ${firstPath}`,
                  privacyMode,
                )
                if (!privacyMode) {
                  presenceData.state = createOutcomeModal?.querySelector<HTMLInputElement>(
                    'input',
                  )?.value
                }
              }
              else if (editOutcomeInput) {
                presenceData.details = applyPrivacy(
                  'Editing an outcome',
                  `course: ${firstPath}`,
                  privacyMode,
                )
                if (!privacyMode)
                  presenceData.state = editOutcomeInput.value
              }
              else {
                presenceData.details = applyPrivacy(
                  'Viewing outcomes',
                  `course: ${firstPath}`,
                  privacyMode,
                )
              }
              break
            }
            case 'pages': {
              canvasDataFunctions.pages(
                presenceData,
                `course: ${firstPath}`,
                pathSplit.slice(3),
                privacyMode,
              )
              break
            }
            case 'quizzes': {
              if (pathSplit[3]) {
                switch (pathSplit[4] ?? '') {
                  case '': {
                    presenceData.details = applyPrivacy(
                      'Viewing a quiz',
                      `course: ${firstPath}`,
                      privacyMode,
                    )
                    if (!privacyMode)
                      presenceData.state = topPath
                    break
                  }
                  case 'edit': {
                    presenceData.details = applyPrivacy(
                      'Editing a quiz',
                      `course: ${firstPath}`,
                      privacyMode,
                    )
                    if (!privacyMode)
                      presenceData.state = topPath
                    break
                  }
                  case 'history': {
                    presenceData.details = applyPrivacy(
                      'Viewing an attempt for a quiz',
                      /* in */ `course: ${firstPath}`,
                      privacyMode,
                    )
                    if (!privacyMode) {
                      presenceData.state = `${navigationPath[2]} - Attempt ${
                        document
                          .querySelector<HTMLAnchorElement>(
                            '.quiz_version.selected',
                          )
                          ?.textContent
                          ?.match(/(\d+):/)?.[1]
                      }`
                    }
                    break
                  }
                  case 'moderate': {
                    presenceData.details = applyPrivacy(
                      'Moderating a quiz',
                      `course: ${firstPath}`,
                      privacyMode,
                    )
                    if (!privacyMode)
                      presenceData.state = navigationPath[2]
                    break
                  }
                  case 'statistics': {
                    presenceData.details = applyPrivacy(
                      'Viewing statistics for a quiz',
                      /* in */ `course: ${firstPath}`,
                      privacyMode,
                    )
                    if (!privacyMode)
                      presenceData.state = navigationPath[2]
                    break
                  }
                  case 'submissions': {
                    presenceData.details = applyPrivacy(
                      'Viewing quiz log',
                      `course: ${firstPath}`,
                      privacyMode,
                    )
                    if (!privacyMode)
                      presenceData.state = `${navigationPath[2]} - ${navigationPath[3]}`
                    break
                  }
                  case 'take': {
                    presenceData.details = applyPrivacy(
                      'Taking a quiz',
                      `course: ${firstPath}`,
                      privacyMode,
                    )
                    const currentQuestion = document.querySelector(
                      '.current_question i',
                    )
                    const timeElapsedType = document
                      .querySelector<HTMLSpanElement>('.time_header')
                      ?.textContent
                      ?.match(/(Running|Elapsed)/i)?.[1]
                    const [, years, months, days, hours, minutes, seconds] = document
                      .querySelector<HTMLDivElement>('.time_running')!.textContent!.match(
                      /(?:([\d,]+) Years?, )?(?:(\d+) Months?, )?(?:(\d+) Days?, )?(?:(\d+) Hours?, )?(?:(\d+) Minutes?, )?(\d+) Seconds?/,
                    )!.map(x => (x ? +x.replaceAll(',', '') : 0)) as [number, number, number, number, number, number, number]
                    const timeElapsed = new Date()
                    const daySeconds = seconds + minutes * 60 + hours * 3600 + days * 86400
                    if (timeElapsedType === 'Running') {
                      timeElapsed.setFullYear(
                        timeElapsed.getFullYear() + years,
                      )
                      timeElapsed.setMonth(
                        (timeElapsed.getMonth() + 1 + months) % 12,
                      )
                      if (timeElapsed.getMonth() + 1 + months > 12)
                        timeElapsed.setFullYear(timeElapsed.getFullYear() + 1)
                      timeElapsed.setTime(
                        timeElapsed.getTime() + daySeconds * 1000,
                      )
                      presenceData.startTimestamp = Math.floor(
                        Date.now() / 1000,
                      )
                      presenceData.endTimestamp = Math.floor(
                        timeElapsed.getTime() / 1000,
                      )
                    }
                    else {
                      timeElapsed.setFullYear(
                        timeElapsed.getFullYear() - years,
                      )
                      timeElapsed.setMonth(
                        12 - ((timeElapsed.getMonth() + 1 - months) % 12),
                      )
                      if (timeElapsed.getMonth() + 1 - months < 0)
                        timeElapsed.setFullYear(timeElapsed.getFullYear() - 1)
                      timeElapsed.setTime(
                        timeElapsed.getTime() - daySeconds * 1000,
                      )
                      presenceData.startTimestamp = Math.floor(
                        timeElapsed.getTime() / 1000,
                      )
                    }
                    if (!privacyMode) {
                      presenceData.state = currentQuestion
                        ? `${topPath} - ${currentQuestion.nextSibling?.textContent}`
                        : topPath
                    }
                    break
                  }
                }
              }
              else {
                presenceData.details = applyPrivacy(
                  'Viewing quizzes',
                  `course: ${firstPath}`,
                  privacyMode,
                )
              }
              break
            }
            case 'rubrics': {
              if (document.querySelector<HTMLDivElement>('#rubric_new')) {
                presenceData.details = applyPrivacy(
                  `${pathSplit[3] ? 'Editing' : 'Creating'} a rubric`,
                  `course: ${firstPath}`,
                  privacyMode,
                )
                if (!privacyMode) {
                  presenceData.state = document.querySelector<HTMLInputElement>(
                    '#rubric-title',
                  )?.value
                }
              }
              else if (pathSplit[3]) {
                presenceData.details = applyPrivacy(
                  'Viewing rubric',
                  `course: ${firstPath}`,
                  privacyMode,
                )
                if (!privacyMode)
                  presenceData.state = topPath
              }
              else {
                presenceData.details = applyPrivacy(
                  'Viewing rubrics',
                  `course: ${firstPath}`,
                  privacyMode,
                )
              }
              break
            }
            case 'settings': {
              presenceData.details = applyPrivacy(
                'Managing settings',
                `course: ${firstPath}`,
                privacyMode,
              )
              if (!privacyMode) {
                presenceData.state = document.querySelector<HTMLLIElement>(
                  '.ui-tabs-active',
                )?.textContent
              }
              break
            }
            case 'users': {
              if (pathSplit[3]) {
                canvasDataFunctions.profile(presenceData, privacyMode)
              }
              else {
                canvasDataFunctions.people(
                  presenceData,
                  `course: ${firstPath}`,
                  privacyMode,
                )
              }
              break
            }
          }
        }
        else {
          presenceData.details = 'Browsing all courses'
        }
        break
      }
      case 'files': {
        canvasDataFunctions.files(presenceData, null, privacyMode)
        break
      }
      case 'groups': {
        if (pathSplit[1]) {
          presenceData.details = 'Viewing a group'
          switch (pathSplit[2] ?? '') {
            case '': {
              if (!privacyMode)
                presenceData.state = topPath
              break
            }
            case 'announcements': {
              canvasDataFunctions.announcement(
                presenceData,
                `group: ${firstPath}`,
                privacyMode,
              )
              break
            }
            case 'pages': {
              canvasDataFunctions.pages(
                presenceData,
                `group: ${firstPath}`,
                pathSplit.slice(3),
                privacyMode,
              )
              break
            }
            case 'discussion_topics': {
              canvasDataFunctions.discussion(
                presenceData,
                `group: ${firstPath}`,
                pathSplit.slice(3),
                privacyMode,
              )
              break
            }
            case 'files': {
              canvasDataFunctions.files(
                presenceData,
                `group: ${firstPath}`,
                privacyMode,
              )
              break
            }
            case 'collaborations': {
              canvasDataFunctions.collaborations(
                presenceData,
                `group: ${firstPath}`,
                privacyMode,
              )
              break
            }
            case 'conferences': {
              canvasDataFunctions.conferences(
                presenceData,
                `group: ${firstPath}`,
                privacyMode,
              )
              break
            }
            case 'users': {
              if (pathSplit[3]) {
                canvasDataFunctions.profile(presenceData, privacyMode)
              }
              else {
                canvasDataFunctions.people(
                  presenceData,
                  `group: ${firstPath}`,
                  privacyMode,
                )
              }
              break
            }
          }
        }
        else {
          presenceData.details = 'Viewing groups'
        }
        break
      }
      case 'profile': {
        switch (pathSplit[1] ?? '') {
          case '': {
            const profileNameInput = document.querySelector<HTMLInputElement>('#name_input')
            if (profileNameInput) {
              presenceData.details = 'Editing profile'
              if (!privacyMode)
                presenceData.state = profileNameInput.value
            }
            else {
              canvasDataFunctions.profile(presenceData, privacyMode)
            }
            break
          }
          case 'communication': {
            presenceData.details = 'Managing notification settings'
            break
          }
          case 'content_shares': {
            presenceData.details = 'Viewing shared content'
            break
          }
          case 'settings': {
            presenceData.details = 'Editing profile settings'
            break
          }
          case 'qr_mobile_login': {
            presenceData.details = 'Viewing QR code'
            break
          }
        }
        break
      }
      case 'search': {
        switch (pathSplit[1]) {
          case 'all_courses': {
            presenceData.details = 'Searching all courses'
            presenceData.state = new URLSearchParams(search).get('search')
            break
          }
          case 'rubrics': {
            presenceData.details = 'Searching rubrics'
            break
          }
        }
        break
      }
      default: {
        presenceData.details = 'Browsing'
        if (!privacyMode) {
          presenceData.state = document.querySelector<HTMLHeadingElement>('h2')?.textContent
            ?? document.title
        }
      }
    }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

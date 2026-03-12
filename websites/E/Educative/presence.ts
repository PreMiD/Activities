const presence = new Presence({
  clientId: '876055665091678228',
})
const time = Math.floor(Date.now() / 1000)
function pathStartsWith(path: string): boolean {
  return document.location.pathname.startsWith(path)
}
function isInCourse(): boolean {
  return !!document.location.pathname.match(
    /\/courses\/[\w-]+\/[\w-]+/g,
  )
}

let courseName: string | null | undefined,
  chapterName: string | null | undefined,
  courseCompletion: string | null | undefined

function setCourseInfo() {
  // Sets course info from page
  if (pathStartsWith('/courses')) {
    if (isInCourse()) {
      courseName = document.querySelectorAll('h4')[0]?.textContent;
      [courseCompletion] = document
        .querySelectorAll('.whitespace-pre-wrap')[0]
        ?.querySelectorAll('span')[0]
        ?.textContent
        ?.split('%') ?? []
      const [lessonEl] = document
        .querySelectorAll('.bePFDW')[0]
        ?.querySelectorAll('span') ?? []
      const lesson = lessonEl?.textContent
      const chapter = lessonEl
        ?.closest('.CollectionSidebarCategory-sc-15b6owa-0')
        ?.querySelectorAll('h5')[0]
        ?.textContent ?? ''
      chapterName = chapter + lesson && chapter ? ' - ' : `${lesson}`
    }
    else {
      courseName = document.querySelectorAll('h1')[0]?.textContent
    }
  }
}

setInterval(setCourseInfo, 2000)

const assets = {
  number_7: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/0.png',
  number_3: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/1.png',
  number_1: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/2.png',
  number_0: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/3.png',
  number_6: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/4.png',
  number_2: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/5.png',
  number_4: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/6.png',
  number_5: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/7.png',
  number_8: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/8.png',
  number_18: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/9.png',
  number_10: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/10.png',
  number_11: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/11.png',
  number_14: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/12.png',
  number_16: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/13.png',
  number_13: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/14.png',
  number_12: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/15.png',
  number_24: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/16.png',
  number_21: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/17.png',
  number_17: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/18.png',
  number_15: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/19.png',
  number_25: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/20.png',
  number_9: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/21.png',
  number_22: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/22.png',
  number_27: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/23.png',
  number_19: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/24.png',
  number_33: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/25.png',
  number_41: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/26.png',
  number_34: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/27.png',
  number_31: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/28.png',
  number_42: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/29.png',
  number_45: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/30.png',
  number_44: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/31.png',
  number_37: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/32.png',
  number_40: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/33.png',
  number_43: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/34.png',
  number_47: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/35.png',
  number_51: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/36.png',
  number_32: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/37.png',
  number_49: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/38.png',
  number_54: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/39.png',
  number_56: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/40.png',
  number_59: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/41.png',
  number_61: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/42.png',
  number_60: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/43.png',
  number_55: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/44.png',
  number_57: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/45.png',
  number_52: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/46.png',
  number_64: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/47.png',
  number_66: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/48.png',
  number_67: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/49.png',
  number_100: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/50.png',
  number_23: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/51.png',
  number_35: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/52.png',
  number_26: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/53.png',
  number_20: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/54.png',
  number_28: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/55.png',
  number_46: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/56.png',
  number_73: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/57.png',
  number_62: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/58.png',
  number_75: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/59.png',
  number_38: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/60.png',
  number_74: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/61.png',
  number_48: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/62.png',
  number_72: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/63.png',
  number_36: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/64.png',
  number_77: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/65.png',
  number_29: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/66.png',
  number_39: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/67.png',
  number_78: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/68.png',
  number_79: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/69.png',
  number_71: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/70.png',
  number_81: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/71.png',
  number_30: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/72.png',
  number_76: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/73.png',
  number_87: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/74.png',
  number_70: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/75.png',
  number_91: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/76.png',
  number_84: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/77.png',
  number_94: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/78.png',
  number_88: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/79.png',
  number_58: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/80.png',
  number_63: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/81.png',
  number_82: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/82.png',
  number_69: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/83.png',
  number_50: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/84.png',
  number_97: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/85.png',
  number_99: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/86.png',
  number_80: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/87.png',
  number_86: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/88.png',
  number_53: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/89.png',
  number_85: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/90.png',
  number_92: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/91.png',
  number_95: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/92.png',
  number_98: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/93.png',
  number_93: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/94.png',
  number_90: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/95.png',
  number_65: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/96.png',
  number_68: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/97.png',
  number_96: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/98.png',
  number_83: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/99.png',
  number_89: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/100.png',
}

presence.on('UpdateData', () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/E/Educative/assets/logo.png',
    startTimestamp: time,
  }

  if (pathStartsWith('/courses')) {
    presenceData.details = courseName
    if (isInCourse()) {
      presenceData.details = courseName || 'Learning'
      presenceData.state = chapterName
      presenceData.smallImageKey = assets[`number_${courseCompletion}` as keyof typeof assets]
      presenceData.smallImageText = `${courseCompletion}% Complete`
    }
    else {
      presenceData.state = 'Viewing course'
    }
  }
  else if (pathStartsWith('/explore')) {
    presenceData.details = 'Exploring courses'
  }
  else if (pathStartsWith('/mycourses')) {
    presenceData.details = 'My courses'
  }
  else if (pathStartsWith('/learn')) {
    presenceData.details = 'Browsing homepage'
  }
  else if (pathStartsWith('/paths')) {
    presenceData.details = 'Exploring paths'
  }
  else if (pathStartsWith('/certificates')) {
    presenceData.details = 'Browsing certificates'
  }
  else {
    presenceData.details = 'Idle'
  }

  if (!presenceData.details) {
    presenceData.details = presenceData.state
    delete presenceData.state
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

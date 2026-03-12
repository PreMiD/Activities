const presence = new Presence({
  clientId: '1019291803322679456',
})

function pathHas(pathName: string): boolean {
  return document.location.pathname.toLowerCase().includes(pathName)
}

const routes = {
  'conspects': 'Просматривает конспект',
  'account': 'Настраивает профиль',
  'externship': 'Просматривает программу обучения',
  'calendar': 'Смотрит календарь занятий',
  'daily-plan': 'Смотрит план занятий',
  'objectives': 'Просматривает задания',
  'progress': 'Просматривает успеваемость',
  'dashboard': 'Просматривает курсы',
} as const

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/F/Foxford/assets/logo.jpg',
  }

  switch (true) {
    case location.pathname.split('/').pop()! in routes:
      presenceData.details = routes[
        location.pathname.split('/').pop() as unknown as keyof typeof routes
      ]
      break
    case pathHas('groups'):
      presenceData.details = 'Просматривает урок'
      break
    case pathHas('courses'):
      presenceData.state = document.querySelector(
        '.Header_title__G-XGe',
      )?.textContent
      presenceData.details = 'Просматривает курс'
      break
    case pathHas('users'):
      presenceData.details = 'Просматривает профиль'
      presenceData.buttons = [
        {
          label: 'Перейти',
          url: document.location.href,
        },
      ]
      break
    case pathHas('tasks'):
      presenceData.details = 'Решает задачи'
      presenceData.buttons = [
        {
          label: 'Перейти',
          url: document.location.href,
        },
      ]
      break
    default:
      presenceData.details = 'Просматривает разделы сайта'
      break
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

export default function handler(
  pathList: string[],
  presenceData: PresenceData,
): void {
  const mainPage = pathList[0] ?? 'index.htm'
  switch (mainPage) {
    case 'index.htm': {
      presenceData.details = 'Viewing the PPC page'
      break
    }
    case 'overview.htm': {
      presenceData.details = 'Reading the PPC overview'
      break
    }
    case 'features.htm': {
      presenceData.details = 'Reading about the PPC features'
      break
    }
    default:
      if (mainPage.startsWith('gallery')) {
        presenceData.details = 'Viewing the PPC gallery'
      }
      else {
        switch (mainPage) {
          case 'devices.htm': {
            presenceData.details = 'Viewing PPC system information'
            break
          }
          case 'downloads.htm': {
            presenceData.details = 'Viewing PPC downloads'
            break
          }
          case 'support.htm': {
            presenceData.details = 'Viewing PPC support resources'
            break
          }
        }
      }
  }
}

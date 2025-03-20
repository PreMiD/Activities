export default function handler(
  pathList: string[],
  presenceData: PresenceData,
): void {
  const mainPage = pathList[0] ?? 'index.htm'
  if (mainPage === 'index.htm')
    presenceData.details = 'Viewing the PPC page'
  else if (mainPage === 'intro.htm')
    presenceData.details = 'Reading the PPC overview'
  else if (mainPage.startsWith('features'))
    presenceData.details = 'Reading about the PPC features'
  else if (mainPage.startsWith('gallery'))
    presenceData.details = 'Viewing the PPC gallery'
  else if (mainPage === 'systeminfo.htm')
    presenceData.details = 'Viewing PPC system information'
  else if (mainPage.startsWith('downloads'))
    presenceData.details = 'Viewing PPC downloads'
  else if (mainPage === 'support01.htm')
    presenceData.details = 'Viewing PPC support resources'
}

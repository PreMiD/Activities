import { ActivityAssets } from './presence.js'

enum SubPages {
  dashboard = '',
  classes = 'classes',
  designs = 'designs',
  collections = 'collections',
  tutorials = 'tutorials',
  challenges = 'challenges',
  bin = 'bin',
}

function handleDesigns(subsubpage: string, presenceData: PresenceData): void {
  switch (subsubpage) {
    case '3d': {
      presenceData.details = 'Viewing 3D designs'
      presenceData.smallImageKey = ActivityAssets.ThreeDIco
      presenceData.smallImageText = '3D'
      break
    }
    case 'circuits': {
      presenceData.details = 'Viewing circuits'
      presenceData.smallImageKey = ActivityAssets.CircuitIco
      presenceData.smallImageText = 'circuit'
      break
    }
    case 'codeblocks': {
      presenceData.details = 'Viewing codeblocks'
      presenceData.smallImageKey = ActivityAssets.CodeblockIco
      presenceData.smallImageText = 'code'
      break
    }
    case 'bin': {
      presenceData.details = 'Viewing Trash Can'
      presenceData.smallImageKey = ActivityAssets.TrashCanIco
      presenceData.smallImageText = 'trash'
      break
    }
  }
}

export function selectDashboardPage(
  presenceData: PresenceData,
  subpage: string,
  subsubpage?: string,
): void {
  switch (subpage) {
    case SubPages.dashboard:
      presenceData.details = 'In Dashboard'
      break

    case SubPages.classes:
      presenceData.details = 'Viewing Classes'
      break

    case SubPages.designs:
      handleDesigns(subsubpage ?? '', presenceData)
      break

    case SubPages.collections:
      presenceData.details = 'Viewing Collections'
      break

    case SubPages.tutorials:
      presenceData.details = 'Viewing Tutorials'
      break

    case SubPages.challenges:
      presenceData.details = 'Viewing Challenges'
      break

    case SubPages.bin:
      presenceData.details = 'Viewing Trash Can'
      break
  }
}

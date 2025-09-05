import type { NotebookLMSettings } from '../types.js'
import { Utils } from '../utils.js'

export class RouteHandlers {
  public static handleNotebookPage(presenceData: PresenceData, settings: NotebookLMSettings): void {
    const notebookName = Utils.getNotebookName()

    if (settings?.showNotebookName && notebookName && notebookName.toLowerCase() !== 'untitled notebook') {
      presenceData.details = `Notebook: ${notebookName}`
    }
    else {
      presenceData.details = 'Working on a notebook'
    }
  }

  public static handleHomePage(presenceData: PresenceData): void {
    presenceData.details = 'On the homepage'
  }

  public static handleDefaultPage(presenceData: PresenceData): void {
    presenceData.details = 'Page Displaying...'
  }
}

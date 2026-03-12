import { Assets } from 'premid'

export class RouteHandlers {
  public static handleHomePage(presenceData: PresenceData): void {
    presenceData.details = 'On the homepage'
  }

  public static handleSearchPage(
    presenceData: PresenceData,
    search: string,
  ): void {
    const queryParams = new URLSearchParams(search)
    const searchQuery = queryParams.get('search')

    if (searchQuery) {
      const decodedQuery = searchQuery.replace(/\+/g, ' ')

      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching'
      presenceData.details = `Searching for '${decodedQuery}'`
    }
    else {
      this.handleDefaultPage(presenceData)
    }
  }

  public static handleTagsPage(
    presenceData: PresenceData,
    search: string,
  ): void {
    const queryParams = new URLSearchParams(search)
    const tagsQuery = queryParams.get('tags')

    if (tagsQuery) {
      const decodedTags = tagsQuery.replace(/\+/g, ' ')

      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Browsing Tags'
      presenceData.details = `Exploring '${decodedTags}' tag`
    }
    else {
      this.handleDefaultPage(presenceData)
    }
  }

  public static handleSearchwithTagsPage(
    presenceData: PresenceData,
    search: string,
  ): void {
    const queryParams = new URLSearchParams(search)
    const searchQuery = queryParams.get('search')
    const tagsQuery = queryParams.get('tags')

    if (searchQuery && tagsQuery) {
      const decodedSearch = searchQuery.replace(/\+/g, ' ')
      const decodedTags = tagsQuery.replace(/\+/g, ' ')

      presenceData.smallImageKey = Assets.Search
      presenceData.smallImageText = 'Searching with Tags'
      presenceData.details = `Searching for '${decodedSearch}' in '${decodedTags}' tag`
    }
    else {
      this.handleDefaultPage(presenceData)
    }
  }

  public static handleChatPage(
    presenceData: PresenceData,
  ): void {
    let characterName: string | undefined

    const nameElement = document.querySelector<HTMLSpanElement>(
      'aside[class*="border-l"] span.text-muted-foreground',
    )
    characterName = nameElement?.textContent?.trim()

    if (!characterName) {
      const pageTitle = document.title.trim()

      const patterns: RegExp[] = [
        /^Chat with (.+)$/, // English
        /^Chatten mit (.+)$/, // German
        /^「(.+)」とチャットする$/, // Japanese
        /^Converse com (.+)$/, // Portuguese
        /^Chatear con (.+)$/, // Spanish
        /^与(.+)聊天$/, // Chinese
        /^Chatta con (.+)$/, // Italian
        /^Discuter avec (.+)$/, // French
        /^Чат с (.+)$/, // Russian
        /^Obrolan dengan (.+)$/, // Indonesian
        /^الدردشة مع (.+)$/, // Arabic
        /^พูดคุยกับ (.+)$/, // Thai
        /^Trò chuyện với (.+)$/, // Vietnamese
        /^Makipag-chat kay (.+)$/, // Filipino/Tagalog
      ]

      for (const regex of patterns) {
        const match = pageTitle.match(regex)
        if (match && match[1]) {
          characterName = match[1].trim()
          break
        }
      }
    }

    if (characterName) {
      presenceData.details = `Chatting with ${characterName}`
    }
    else {
      presenceData.details = 'Chatting'
    }
  }

  public static handleDefaultPage(presenceData: PresenceData): void {
    presenceData.details = 'Page Displaying...'
  }
}

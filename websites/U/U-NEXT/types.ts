export interface Root {
  webfrontTitleStage: {
    id: string
    titleName: string
    rate: number
    userRate: number
    productionYear: string
    country: string
    catchphrase: string
    attractions: string
    story: string
    check: string
    seriesCode: string
    seriesName: string
    publicStartDate: string
    displayPublicEndDate: string
    restrictedCode: string
    copyright: string
    mainGenreId: string
    bookmarkStatus: boolean
    thumbnail: {
      standard: string
      secondary: string
      __typename: string
    }
    mainGenreName: string
    isNew: boolean
    exclusive: {
      typeCode: unknown
      isOnlyOn: boolean
      __typename: string
    }
    isOriginal: boolean
    lastEpisode: string
    updateOfWeek: number
    nextUpdateDateTime: string
    productLineupCodeList: string[]
    hasMultiprice: boolean
    minimumPrice: number
    paymentBadgeList: unknown[]
    nfreeBadge: string
    hasDub: boolean
    hasSubtitle: boolean
    saleText: string
    keyEpisodes: {
      current: {
        id: string
        interruption: number
        duration: number
        completeFlag: boolean
        displayDurationText: string
        existsRelatedEpisode: boolean
        playButtonName: string
        purchaseEpisodeLimitday: string
        saleTypeCode: string
        productLineupCodeList: string[]
        hasPackRights: boolean
        __typename: string
      }
      latest: unknown
      __typename: string
    }
    publicMainEpisodeCount: number
    comingSoonMainEpisodeCount: number
    missingAlertText: string
    sakuhinNotices: unknown[]
    hasPackRights: boolean
    __typename: string
  }
  webfrontTitleTitleEpisodes: {
    episodes: {
      id: string
      episodeName: string
      purchaseEpisodeLimitday: string
      thumbnail: {
        standard: string
        __typename: string
      }
      duration: number
      displayNo: string
      interruption: number
      completeFlag: boolean
      saleTypeCode: string
      introduction: string
      saleText: string
      episodeNotices: unknown[]
      isNew: boolean
      hasPackRights: boolean
      minimumPrice: number
      hasMultiplePrices: boolean
      productLineupCodeList: string[]
      isPurchased: boolean
      __typename: string
    }[]
    pageInfo: {
      page: number
      pages: number
      pageSize: number
      results: number
      __typename: string
    }
    __typename: string
  }
}

export interface LiveRoot {
  webfrontGetLive: {
    id: string
    name: string
    description: string
    attractions: string
    copyright: string
    note: string
    viewableDeviceText: string
    displayLiveMinute: number
    venue: string
    location: string
    deliveryStartDateTime: string
    deliveryEndDateTime: string
    displaySaleEndDateTime: unknown
    performanceStartDateTime: string
    isOnlyOn: boolean
    saleTypeCode: string
    allowsTimeshiftedPlayback: boolean
    timeshiftedPlaybackAllowedUntil: unknown
    paymentBadgeList: {
      id: string
      name: string
      code: string
      __typename: string
    }[]
    subContentList: {
      typeCode: string
      publicStartDateTime: string
      publicEndDateTime: string
      __typename: string
    }[]
    notices: {
      id: string
      typeCode: string
      publicStartDateTime: string
      thumbnail: {
        standard: string
        secondary: string
        __typename: string
      }
      __typename: string
    }[]
    tickets: unknown[]
    purchased: boolean
    productLineupCodeList: string[]
    hasPackRights: boolean
    testLiveId: string
    credits: {
      personNameCode: string
      personName: string
      characterName: string
      castTypeName: string
      personCode: string
      __typename: string
    }[]
    caution: string
    announcements: unknown[]
    __typename: string
  }
}

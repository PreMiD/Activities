interface SubsectionInfo {
  subsectionTitle: string
  template?: string
  format?: string
  customMsg?: string
  subsections?: [
    {
      template: string
      format: string
      pages: { subsectionTitle: string, href: string }[]
    },
  ]
}

// Define the type for the object containing the mappings
interface ByHrefMap {
  [url: string]: SubsectionInfo
}

export const byHref: ByHrefMap = {
  'auhome/index.html': {
    subsectionTitle: 'Australia',
  },
  'games/daily-crossword': {
    subsectionTitle: 'Games',
    customMsg: 'Playing games!',
  },
  'for-you/index.html': {
    subsectionTitle: 'For You',
    customMsg: 'Browsing personalized feed',
  },
  'femail/fashionfinder/index.html': {
    subsectionTitle: 'Fashion Finder',
    customMsg: 'Browsing fashion',
  },
  'news/mostread/index.html': {
    subsectionTitle: 'Most read',
  },
  'home/latest/index.html#{any(SECTS)}': {
    subsectionTitle: '{any(SECTS)}',
  },
  'news/royals/index.html': {
    subsectionTitle: 'Royals',
    customMsg: 'Browsing Royal News',
  },
  'video/index.html': {
    template: '.vjs-title-text',
    subsectionTitle: 'Video',
  },
  'news/joe-biden/index.html': {
    subsectionTitle: 'Joe Biden',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'news/donald_trump/index.html': {
    subsectionTitle: 'Donald Trump',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'news/us-economy/index.html': {
    subsectionTitle: 'Economy',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'news/king-charles-iii/index.html': {
    subsectionTitle: 'King Charles III',
    template: '.topicHeaderTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'news/prince_harry/index.html': {
    subsectionTitle: 'Prince Harry',
    template: '.topicHeaderTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'tvshowbiz/taylor_swift/index.html': {
    subsectionTitle: 'Taylor Swift',
    template: '.tvshowbiz > .topicHeaderTitle',
    format: '{NAME[]}',
  },
  'tvshowbiz/kim_kardashian/index.html': {
    subsectionTitle: 'Kim Kardashian',
    template: '.tvshowbiz > .topicHeaderTitle',
    format: '{NAME[]}',
  },
  'news/prince-andrew/index.html': {
    subsectionTitle: 'Prince Andrew',
    template: '.tvshowbiz > .topicHeaderTitle',
    format: '{NAME[]}',
  },
  'tvshowbiz/jeremy-renner/index.html': {
    subsectionTitle: 'Jeremy Renner',
    template: '.tvshowbiz > .topicHeaderTitle',
    format: 'Trending {NAME[]} News',
  },
  'tvshowbiz/tiktok/index.html': {
    subsectionTitle: 'TikTok',
    template: '.tvshowbiz > .topicHeaderTitle',
    format: 'Trending {NAME[]} News',
  },
  'tvshowbiz/meghan-markle/index.html': {
    subsectionTitle: 'Meghan Markle',
    template: '.topicHeaderTitle',
    format: '{NAME}',
  },
  'news/kate_middleton/index.html': {
    subsectionTitle: 'Kate Middleton',
    template: '.topicHeaderTitle',
    format: '{NAME}',
  },
  'news/prince_william/index.html': {
    subsectionTitle: 'Prince William',
    template: '.topicHeaderTitle',
    format: '{NAME}',
  },
  'news/camilla-parker-bowles-duchess-of-cornwall/index.html': {
    subsectionTitle: 'The Queen Consort',
    template: '.topicHeaderTitle',
    format: '{NAME}',
  },
  'sport': {
    subsectionTitle: 'Sports',
    subsections: [
      {
        template: '.sport > .listTitle',
        format: 'TRENDING {NAME[]} NEWS',
        pages: [
          {
            subsectionTitle: 'Premier League',
            href: 'sport/premierleague/index.html',
          },
          {
            subsectionTitle: 'MLS',
            href: 'sport/major-league-soccer/index.html',
          },
          {
            subsectionTitle: 'Super Bowl',
            href: 'sport/super_bowl/index.html',
          },
          { subsectionTitle: 'NBA', href: 'sport/nba/index.html' },
          { subsectionTitle: 'MLB', href: 'sport/mlb/index.html' },
        ],
      },
    ],
  },
  'sport/wwe/index.html': {
    subsectionTitle: 'WWE',
    template: '.sport > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'sport/football/index.html': {
    subsectionTitle: 'Soccer',
  },
  'sport/nfl/index.html': {
    subsectionTitle: 'NFL',
  },
  'sport/nhl/index.html': {
    subsectionTitle: 'NHL',
  },
  'sport/boxing/index.html': {
    subsectionTitle: 'Boxing',
  },
  'sport/mma/index.html': {
    subsectionTitle: 'MMA',
  },
  'sport/golf/index.html': {
    subsectionTitle: 'Golf',
  },
  'sport/tennis/index.html': {
    subsectionTitle: 'Tennis',
  },
  'sport/formulaone/index.html': {
    subsectionTitle: 'F1',
  },
  'sport/othersports/index.html': {
    subsectionTitle: 'More',
  },
  'news/coronavirus/index.html': {
    subsectionTitle: 'Covid-19',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'health/flu/index.html': {
    subsectionTitle: 'Flu',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'health/rsv/index.html': {
    subsectionTitle: 'RSV',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'health/monkeypox/index.html': {
    subsectionTitle: 'Monkeypox',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'health/dementia/index.html': {
    subsectionTitle: 'Dementia',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'news/cancer/index.html': {
    subsectionTitle: 'Cancer',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'news/weight_loss/index.html': {
    subsectionTitle: 'Weight Loss',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'news/centers-for-disease-control-and-prevention-cdc/index.html': {
    subsectionTitle: 'CDC',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'news/world-health-organization/index.html': {
    subsectionTitle: 'WHO',
    template: '.news > .listTitle',
    format: 'TRENDING {NAME[]} NEWS',
  },
  'news/us-politics/index.html': {
    subsectionTitle: '',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'sciencetech/nasa/index.html': {
    subsectionTitle: 'NASA',
    template: '.sciencetech > .listTitle',
    format: 'TRENDING {COMPANYNAME} NEWS',
  },
  'sciencetech/index.html': {
    subsectionTitle: 'SCIENCE',
    template: 'USETITLE',
  },
  'sciencetech/apple/index.html': {
    subsectionTitle: 'Apple',
    template: '.sciencetech > .listTitle',
    format: 'TRENDING {COMPANYNAME} NEWS',
  },
  'sciencetech/twitter/index.html': {
    subsectionTitle: 'Twitter',
    template: '.sciencetech > .listTitle',
    format: 'TRENDING {COMPANYNAME} NEWS',
  },
  'news/russia-ukraine-conflict/index.html': {
    subsectionTitle: 'Russia-Ukraine',
    template: '.news > listTitle',
    format: 'TRENDING {NAME} NEWS',
  },
  'news/bryan-kohberger/index.html': {
    subsectionTitle: 'Bryan Kohberger',
    template: '.news > listTitle',
    format: 'TRENDING {NAME} NEWS',
  },
  'wellness-us/index.html': {
    subsectionTitle: '',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'yourmoney/retirement/index.html': {
    subsectionTitle: 'Retirement',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'yourmoney/consumer/index.html': {
    subsectionTitle: 'Consumer',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'yourmoney/savings/index.html': {
    subsectionTitle: 'Savings',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'yourmoney/cars/index.html': {
    subsectionTitle: 'Cars',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'yourmoney/property/index.html': {
    subsectionTitle: 'Property',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'tvshowbiz/index.html': {
    subsectionTitle: 'U.K. Showbiz',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'health/diets/index.html': {
    subsectionTitle: 'Diet',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'news/worldnews/index.html': {
    subsectionTitle: 'World News',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'home/weather/index.html': {
    subsectionTitle: 'UK Forecast',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'home/weatherlocation/{LOC-DATA}': {
    subsectionTitle: 'UK Forecast',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'travel/escape/index.html': {
    subsectionTitle: 'Escape',
    template: 'USETITLE',
    format: '{NAME} | Daily Mail Online',
  },
  'travel/destinations/index.html': {
    subsectionTitle: 'Destinations',
    template: 'OTHER',
  },
  'travel/holidaytypes/index.html': {
    subsectionTitle: 'Holiday Types',
    template: 'OTHER',
  },
  'travel/travelreviews/index.html': {
    subsectionTitle: 'Expert Reviews',
    template: 'OTHER',
  },
  'travel/travelreviewshub/celebrity-travel.html': {
    subsectionTitle: 'Celebrity Travel',
    template: 'OTHER',
  },
}

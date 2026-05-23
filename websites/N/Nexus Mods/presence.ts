import { Assets } from 'premid'

const presence = new Presence({
  clientId: '503557087041683458',
})

let presenceData: PresenceData

/**
 * Checks whether the provided name is a valid game against a list of pathname
 * identifiers of games. Retrieved from https://api.nexusmods.com/v1/games.json,
 * doesn't get changed enough to warrant dynamic checking.
 *
 * @param {string} name The name of the game to check.
 * @returns {boolean} True if the game is valid, false otherwise.
 */
function isValidGame(name: string): boolean {
  const validGames = [
    'morrowind',
    'oblivion',
    'shadowrunreturns',
    'skyrim',
    'fallout3',
    'newvegas',
    'dragonage',
    'dragonage2',
    'witcher',
    'xcom',
    'witcher2',
    'xrebirth',
    'worldoftanks',
    'grimrock',
    'darksouls',
    'fallenenchantress',
    'farcry3',
    'chivalry',
    'dungeondefenders',
    'neverwinter',
    'mountandblade',
    'mbwarband',
    'mbwithfireandsword',
    'minecraft',
    'warcraft3',
    'left4dead2',
    'kotor2',
    'masseffect3',
    'sinsofasolarempire',
    'saintsrow4',
    'stateofdecay',
    'fasterthanlight',
    'kotor',
    'starbound',
    'deusex',
    'masseffect',
    'gta4',
    'thief2',
    'zootycoon2',
    'mafia2',
    'savagexr',
    'masseffect2',
    'halo',
    'jurassicparkopgen',
    'soulreaver',
    'torchlight2',
    'gamedevtycoon',
    'battlefield2',
    'batmanarkhamorigins',
    'kerbalspaceprogram',
    'maddennfl08',
    'blackandwhite2',
    'x3terranconflict',
    'justcause2',
    'disciples3',
    'towns',
    'thesims3',
    'dmcdevilmaycry',
    'crysis',
    'rememberme',
    'rpgmakervxace',
    'teamfortress2',
    'jadeempire',
    'eurotrucksimulator2',
    '3089',
    'droxoperative',
    'risen',
    'crysiswarhead',
    'halflife2',
    'crusaderkings2',
    'borderlands',
    'mystonlineuru',
    'doom3',
    'arxfatalis',
    'thief3',
    'naruto3',
    'batmanarkhamcity',
    'startrekvoyagereliteforce',
    'cncgenerals',
    'cataclysmdarkdaysahead',
    'elderscrollsonline',
    'menofwar',
    'borderlands2',
    'fallout2',
    'southparkthestickoftruth',
    'rimworld',
    'arma3',
    'vampirebloodlines',
    'rodina',
    'residentevil4',
    'warthunder',
    'starwarsempireatwar',
    'sacred',
    'tabletopsimulator',
    'civilization4colonization',
    'darksouls2',
    'planetexplorers',
    'mightandmagicx',
    'fallenenchantresslegendaryheroes',
    'ageofmythologyee',
    'dynastywarriors8',
    'spaceengineers',
    'xenonauts',
    'watchdogs',
    'dungeonsiege1',
    'spintires',
    'insurgency',
    'terraria',
    'fallouttactics',
    'assettocorsa',
    'wizard101',
    'divinityoriginalsin',
    'carmageddonreincarnation',
    'piratesofthecaribbean',
    'projectzomboid',
    'warhammer40kchaosgate',
    'medieval2totalwar',
    'spore',
    'tug',
    'voidexpanse',
    'banished',
    'ageofempires',
    'devilmaycry3',
    'narutorevolution',
    'thesims4',
    'fableanniversary',
    'payday2',
    'wasteland2',
    'thelegendofkorra',
    'darkmessiahofmightandmagic',
    'gothic',
    'legendofgrimrock2',
    'endlesslegend',
    'siryouarebeinghunted',
    'neoscavenger',
    'liveforspeed',
    'legomarvelsuperheroes',
    'acepatrol',
    'kenshi',
    'dragonageinquisition',
    'assassinscreed',
    'deadstate',
    'metalgearsolidvgz',
    'rainbowsixvegas2',
    'farcry4',
    'salt',
    'baldursgate2ee',
    'evilgenius',
    'finalfantasy7',
    'worldofwarplanes',
    'gta3',
    'dyinglight',
    'gruntz',
    'darkestdungeon',
    'dishonored',
    'finalfantasy3',
    'saintsrow3',
    'civilizationbeyondearth',
    'voiddestroyer',
    'rollercoastertycoon2',
    'pillarsofeternity',
    'battlefront2',
    'borderlandspresequel',
    'cnctiberiansun',
    'dragonballxenoverse',
    'lifeistrange',
    'mitsurugikamuihikae',
    'spelunky',
    'deadoralive5',
    'gta5',
    'ageofempires3',
    'spacerangersawarapart',
    'spellforce1',
    'forceunleashed2',
    'dawnofwar2retribution',
    'wwe2k15',
    'tesarena',
    'finalfantasy14',
    'witcher3',
    'galacticcivilizations3',
    'gtasanandreas',
    'risen3',
    'daggerfall',
    'dcsworld',
    'devilmaycry4',
    'farmingsimulator2015',
    'sacred2',
    'showtime',
    'sorcererking',
    'starpointgemini2',
    'victoria2',
    '7daystodie',
    'batmanarkhamknight',
    'assassinscreedrogue',
    'metalgearsolidvtpp',
    'redfactionguerilla',
    'shadowrundragonfall',
    'shadowrunhongkong',
    'bigpharma',
    'madmax',
    'ageofwonders3',
    'delver',
    'maxpayne3',
    'fallout4',
    'doom2',
    'finalfantasy5',
    'fortresscraftevolved',
    'risen2',
    'robinhood',
    'subnautica',
    'sunlesssea',
    'thesecretofmonkeyisland',
    'amnesia',
    'blockland',
    'grimdawn',
    'sims2',
    'guiltygearxrd',
    'haloonline',
    'lethalleague',
    'starwarstheoldrepublic',
    'undertale',
    'bioshock',
    'hitmanbloodmoney',
    'psychonauts',
    'civilisationv',
    'theguild2renaissance',
    'dragonsdogma',
    'bloodandgoldcaribbean',
    'dragonquestheroes',
    'oriandtheblindforest',
    'unturned',
    'Transcendence',
    'bladeandsoul',
    'simcitysocieties',
    'xcom2',
    'americantrucksimulator',
    'totalannihalation',
    'narutoultimateninjastorm4',
    'thebindingofisaacrebirth',
    'farcryprimal',
    'tropico5',
    'alienisolation',
    'stardewvalley',
    'wwe2k16',
    'needforspeed2016',
    'startrekonline',
    'startrekbridgecommmander',
    'deadpool',
    'factorio',
    'gothic3',
    'planetbase',
    'streetfighterv',
    'stalkerclearsky',
    'tomclancysthedivision',
    'legostarwarsthecompletesaga',
    'starwarsbattlefront2015',
    'doom',
    'spidermanshattereddimensions',
    'darksouls3',
    'nexusthejupiterincident',
    'fableIII',
    'warhammer40000dawnofwar',
    'halflife',
    'masteroforionconquerthestars',
    'ageofempires2hd',
    'emperorbattlefordune',
    'worldinconflict',
    'unrealtournament3',
    'unrealtournament',
    'trackmaniaunited',
    'trackmanianations',
    'thesims',
    'supremecommander',
    'starwarsbattlefront',
    'prey',
    'fear',
    'flightsimulatorx',
    'grandtheftautovicecity',
    'jointoperationstyphoonrising',
    'left4dead',
    'operationflashpoint',
    'dayofdefeatsource',
    'deusexinvisiblewar',
    'startrekeliteforceII',
    'fear2projectorigin',
    'counterstrikeconditionzero',
    'civilizationiv',
    'callofdutyworldatwar',
    'blackandwhite',
    'battlefieldvietnam',
    'quake4',
    'lordoftheringsonlineshadowsofangmar',
    'themovies',
    'lordoftheringsbattleformiddleearth2',
    'operationflashpointresistance',
    'aliensvspredator2',
    'callofdutyunitedoffensive',
    'halo2',
    'returntocastlewolfenstein',
    'startrekstarfleetcommand3',
    'unrealtournament2003',
    'companyofheroes',
    'startreklegacy',
    'counterstrikesource',
    'callofduty',
    'worldofwarcraft',
    'callofduty2',
    'battlefield1942',
    'unrealtournament2004',
    'medalofhonor',
    'neverwinter2',
    'finalfantasyxx2hdremaster',
    'empyriongalacticsurvival',
    'europauniversalisiv',
    'deadisland',
    'joypony',
    'farcry2',
    'commandandconquerrenegade',
    'stalkercallofpripyat',
    'stalkershadowofchernobyl',
    'soldieroffortune2',
    'startrekarmada2',
    'callofdutyblackops2',
    'thiefthedarkproject',
    'thebannersaga',
    'motocrossmadness2',
    'fonlineashesofphoenix',
    'sidmeiersacepatrolpacificskies',
    'systemshock2',
    'ubersoldier2',
    'prisonarchitect',
    'samuraiwarriors2',
    'burnoutparadise',
    'stellaris',
    'melodysescape',
    'rage',
    'thebannersaga2',
    'nomanssky',
    'falloutshelter',
    'thesaboteur',
    'ridersoficarus',
    'deadspace',
    'divinityoriginalsin2',
    'leagueoflegends',
    'rpgmakermv',
    'duelyst',
    'deadrising',
    'civilisationvi',
    'battlebrothers',
    'freecol',
    'sakuradungeon',
    'shadowwarrior2',
    'southparkrally',
    'skyrimspecialedition',
    'stonehearth',
    'farmingsimulator2013',
    'tyranny',
    'residentevil6',
    'helgatelondon',
    'armacoldwarassault',
    'middleearthshadowofmordor',
    'starcrawlers',
    'heroesofmightandmagicv',
    'starwarsjediknightjediacademy',
    'breakingwheel',
    'strongholdcrusader2',
    'counterstrike16',
    'osirisnewdawn',
    'thelongdark',
    'stalkercallofchernobyl',
    'doorkickers',
    'dungeonlordssteamedition',
    'spellforce2',
    'assassinscreedii',
    'diablo',
    'thebookofunwrittentales',
    'escapefrompleasureplanet',
    'grandiaIIanniversaryedition',
    'doom1993',
    'sidmeierspirates',
    'totalwarshogun2',
    'berserkandthebandofthehawk',
    'halcyon6starbasecommander',
    'butcher',
    'ultimatemarvelvscapcom3',
    'masseffectandromeda',
    'rugbyleaguelive3',
    'streetfighteriv',
    'ghostreconwildlands',
    'castlevanialordsofshadow',
    'orcsmustdie2',
    'talesofberseria',
    'space',
    'baldursgate',
    'offworldtradingcompany',
    'justcause3',
    'pornostudiotycoon',
    'nierautomata',
    'finalfantasy9',
    'prey2017',
    'mirrorsedgecatalyst',
    'astroneer',
    'deusexhumanrevolution',
    'privateergeminigold',
    'titanquestanniversaryedition',
    'divinityoriginalsinenhancededition',
    'gothic2',
    'overwatch',
    'hotrodamericanstreetdrag',
    'icewinddale2',
    'kopanitoallstarssoccer',
    'monopoly',
    'saltandsanctuary',
    'csgo',
    'dungeonsiegeii',
    'heartsofironiv',
    'lifeisfeudal',
    'lordsofthefallen',
    'vermintide',
    'sonicmania',
    'endlessspace2',
    'mountandbladevikingconquest',
    'prehistorickingdom',
    'jaggedalliance2',
    'monacowhatsyoursismine',
    'sonicadventuredx',
    'batmanarkhamasylum',
    'finalfantasy13',
    'lifeisstrangebeforethestorm',
    'sniperghostwarrior',
    'tekken7',
    'starpointgeminiwarlords',
    'elex',
    'hacklastrecode',
    'assassinscreedorigins',
    'battlechasersnightwar',
    'mafia',
    'pavlov',
    'sphinxandthecursedmummy',
    'planttycoon',
    'hacknet',
    'spectromancer',
    'istaria',
    'riseofthetombraider',
    'thewalkingdead',
    'spaceengine',
    'darkandlight',
    'colonysurvival',
    'starwarsbattlefront22017',
    'alendadoheroi',
    'blazbluecentralfiction',
    'empiretotalwar',
    'garrysmod',
    'halocustomedition',
    'mesozoica',
    'mugen',
    'spacecolony',
    'spellforce3',
    'starcitizen',
    'turok2',
    'twoworlds',
    'legothehobbit',
    'handoffate2',
    'metro2033',
    'endlesssky',
    'site',
    'kingdomcomedeliverance',
    'dungeonbuilder',
    'finalfantasy12',
    'stationeers',
    'dokidokiliteratureclub',
    'metalgearsurvive',
    'mytimeatportia',
    'vermintide2',
    'intothebreach',
    'empireearth',
    'paintthetownred',
    'twoworldstwo',
    'finalfantasy15',
    'slaythespire',
    'survivingmars',
    'testdriveunlimited2',
    'farcry5',
    'conanexiles',
    'ahatintime',
    'contagion',
    'ysviii',
    'tombraider2',
    'softwareinc',
    'trove',
    'battletech',
    'swordcoastlegends',
    'pcbuildingsimulator',
    'pillarsofeternity2',
    'darksiders2deathinitiveedition',
    'pulsarlostcolony',
    'warlordsbattlecry2',
    'warlordsbattlecry3',
    'needforspeedpayback',
    'deusexmankinddivided',
    'oxygennotincluded',
    'themercuryman',
    'mnmh7',
    'mechwarrior4',
    'mortalkombat9',
    'footballmanager2018',
    'beamngdrive',
    'gunsgoreandcannoli2',
    'darksoulsremastered',
    'stateofdecay2',
    'totalwarwarhammer2',
    'auroradusksteamage',
    'kingdomsofamalurreckoning',
    'vampyr',
    'blazbluecrosstagbattle',
    'rugbychallenge3',
    'watchdogs2',
    'vampireredemption',
    'wurmunlimited',
    'supersmashbroswiiu',
    'spellforce2demonsofthepast',
    'crashbandicootnsanetrilogy',
    'bayonetta',
    'deadspace2',
    'hawx2',
    'shiningresonancerefrain',
    'spellforce2masterofwar',
    'middleearthshadowofwar',
    'terratech',
    'brawlhalla',
    'metrolastlightredux',
    'redfactionarmageddon',
    'warhammer40000gladiusrelicsofwar',
    'sniperghostwarrior3',
    'metro2033redux',
    'metrolastlight',
    'necropolis',
    'objectsinspace',
    'scpcontainmentbreach',
    'hitmanabsolution',
    'titanfall2',
    'splintercellconviction',
    'callofdutyinfinitewarfare',
    'monsterhunterworld',
    'xmenoriginswolverine',
    'redfactionguerrillaremarstered',
    'hexenii',
    'demonsage',
    'beatsaber',
    'fateextella',
    'callofdutywwii',
    'dyinglightbadblood',
    'riseofindustry',
    'shenmue',
    'shenmue2',
    'twopointhospital',
    'divinityoriginalsin2definitiveedition',
    'enclave',
    'jurassicworldevolution',
    'zoneoftheendersthe2ndrunnermars',
    'spellforceplatinumedition',
    'ysmemoriesofcelceta',
    'shadowofthetombraider',
    'skyrimnintendoswitch',
    'thebardstaleivbarrowsdeep',
    'starcontrolorigins',
    'dragonquestxi',
    'gpbikes',
    'inazumaelevengostrikers2013',
    'mysummercar',
    'legorockraiders',
    'theatheawakening',
    'pathfinderkingmaker',
    'battlefieldbadcompany2',
    'assassinscreedodyssey',
    'fifa18',
    'battlefield1',
    'generationzero',
    'assassinscreedunity',
    'carmechanicsimulator2018',
    'warriorsorochi4',
    'soulcaliburvi',
    'fallout76',
    'kingsbountydarkside',
    'footballmanager2019',
    'legostarwarsthevideogame',
    'ultimatespiderman',
    'dominions4',
    'pathofexile',
    'x4foundations',
    'blockscape',
    'justcause4',
    'hades',
    'fallout',
    'aragami',
    'starsector',
    'starwarsepisode1racer',
    'edgeofeternity',
    'bladeandsorcery',
    'galacticcivilizations2',
    'farmingsimulator19',
    'gardenpaws',
    'yakuza0',
    'talesofglory',
    'farmingsimulator17',
    'mafia3',
    'fellsealarbitersmark',
    'xplane11',
    'onimushawarlords',
    'kingdomtwocrowns',
    'graveyardkeeper',
    'hollowknight',
    'thebannersaga3',
    'superpower2',
    'assassinscreedrevelations',
    'finalfantasy8',
    'residentevil22019',
    'maddennfl19',
    'Desolate',
    'ashofgodsredemption',
    'subnauticabelowzero',
    'supermarioodyssey',
    'hexenbeyondheretic',
    'anthem',
    'thepurringquest',
    'wargroove',
    'bloodborne',
    'transformersdevastation',
    'supremecommander2',
    'thecuriousexpedition',
    'driversanfrancisco',
    'dontstarvetogether',
    'deadspace3',
    'hardtime',
    'farcrynewdawn',
    'quake2',
    'mightandmagicviii',
    'metroexodus',
    'pes2019',
    'secretofmana',
    'enderal',
    'wrcfiaworldrallychampionship',
    'phantomdoctrine',
    'thesurge',
    'battlefieldv',
    'thegenesisproject',
    'residentevilbiohazardhdremaster',
    'dawnofman',
    'devilmaycry5',
    'theamazingspiderman2',
    'bleed',
    'nioh',
    'derailvalley',
    'cuphead',
    'cavesofqud',
    'eastshade',
    'residentevil5goldedition',
    'tomclancysthedivision2',
    'sekiro',
    'astroximperium',
    'myexboyfriendthespacetyrant',
    'jumpforce',
    'slimerancher',
    'assassinscreediiiremastered',
    'outward',
    'residentevil0biohazard0hdremaster',
    'borderlandsgotyenhanced',
    'hereticshadowoftheserpentriders',
    'acecombat7skiesunknown',
    'killerisdead',
    'sunsetoverdrive',
    'turokdinosaurhunter',
    'darksiderswarmasterededition',
    'metalgearrisingrevengeance',
    'commandandconquer3tiberiumwars',
    'syndicatewars',
    'deathroadtocanada',
    'theevilwithin',
    'wwe2k19',
    'weedcraftinc',
    'laracroftandtheguardianoflight',
    'onewayheroics',
    'haydee',
    'clonedroneinthedangerzone',
    'metroidprime2echoesgamecube',
    'invisibleinc',
    'crysis2',
    'halflifesource',
    'thea2theshattering',
    'erannorthreborn',
    'mortalkombat11',
    'shovelknight',
    'ellerosorigins',
    'crysis3',
    'commandandconquer3kaneswrath',
    'residentevil1996',
    'anno1800',
    'manhunt',
    'yakuzakiwami2',
    'tombraider2013',
    'hitman2',
    'unreal2theawakening',
    'aplaguetaleinnocence',
    'skyrimplaystation4',
    'fallout4playstation4',
    'saintsrow2',
    'staxel',
    'rysesonofrome',
    'gigantic',
    'outlast',
    'sonicadventure2',
    'wolfensteintheoldblood',
    'wolfensteintheneworder',
    'stormworksbuildandrescue',
    'spellforce3soulharvest',
    'creatures',
    'creatures2',
    'creatures3',
    'totalwarthreekingdoms',
    'gridautosport',
    'lobotomycorporation',
    'fifa19',
    'wargamereddragon',
    'pathologic2',
    'cryofall',
    'bloodstainedritualofthenight',
    'yakuzakiwami',
    'thesinkingcity',
    'ultimatefishingsimulator',
    'needforspeedmostwanted2005',
    'battlefleetgothicarmada2',
    'zombieshooter2',
    'ageofcivilizations2',
    'cultistsimulator',
    'needforspeedworld',
    'celeste',
    'endcyclevs',
    'fortheking',
    'motorsportmanager',
    'totalwarrome2',
    'battlegrounds3',
    'shatteredtaleoftheforgottenking',
    'wrc5',
    'assassinscreedsyndicate',
    'callofdutyadvancedwarfare',
    'gloomhaven',
    'wrc7',
    'heroesofmightandmagiciii',
    'residentevil21998',
    'mightandmightvi',
    'lightningreturnsfinalfantasy13',
    'satisfactory',
    'enslavedodysseytothewest',
    'warsandwarriorsjoanofarc',
    'ballisticng',
    'dishonored2',
    'strandeddeep',
    'theevilwithin2',
    'rebelgalaxyoutlaw',
    'holdfastnationsatwar',
    'ageofwondersplanetfall',
    'daggerfallunity',
    'remnantfromtheashes',
    'ascepticsguidetomagic',
    'oninaki',
    'underrailexpedition',
    'control',
    'blairwitch',
    'monstersanctuary',
    'ninjablade',
    'openttd',
    'hiveswapfriendsim',
    'spyroreignitedtrilogy',
    'clivebarkersjericho',
    'shortesttriptoearth',
    'greedfall',
    'finalfantasy8remastered',
    'demonssouls',
    'blasphemous',
    'wizardry8',
    'mordhau',
    'maddennfl20',
    'borderlands3',
    'devilshunt',
    'thesurge2',
    'stronghold2',
    'greenhell',
    'shadowsawakening',
    'halothemasterchiefcollection',
    'codevein',
    'wrc8',
    'darkwood',
    'rebelgalaxy',
    'thepunisher',
    'lovethyselfahoratiostory',
    'huntshowdown',
    'recoredefinitiveedition',
    'warsaw',
    'cubeworld',
    'trine4thenightmareprince',
    'valfaris',
    'assassinscreedivblackflag',
    'residentevil5',
    'mechandmercsblacktalons',
    'azure',
    'fantasygeneral2',
    'reddeadredemption2',
    'discoelysium',
    'ghostreconbreakpoint',
    'legendofzeldabreathofthewild',
    'theouterworlds',
    'starwarsrepubliccommando',
    'splintercellblacklist',
    'darksiders3',
    'noita',
    'tombraiderlegend',
    'untitledgoosegame',
    'roguelands',
    'warhammer40000spacemarine',
    'callofdutymodernwarfare',
    'thetechnomancer',
    'themasterplan',
    'dirt3',
    'wildermyth',
    'mechwarrioronline',
    'starwarsjedifallenorder',
    'condemnedcriminalorigins',
    'terminatorresistance',
    'deadrising3',
    'yanderesimulator',
    'osu',
    'legendofzeldatwilightprincess',
    'uboat',
    'gun',
    'flatoutultimatecarnage',
    'warhammer40000dawnofwarII',
    'needforspeedheat',
    'bioshockinfinite',
    'shenmue3',
    'keplerth',
    'ageofempires2definitiveedition',
    'citiesskylines',
    'talesofsymphonia',
    'ambersairline7wonders',
    'planetzoo',
    'mechwarrior5mercenaries',
    'darksidersgenesis',
    'phoenixpoint',
    'transportfever2',
    'runeii',
    'shadowman',
    'thetownoflight',
    'bloonstd5',
    'racedrivergrid',
    'neonchrome',
    'freemanguerrillawarfare',
    'undermine',
    'boneworks',
    'sinsofthefathers20thanniversaryedition',
    'killingfloor',
    'overload',
    'portal2',
    'outerwilds',
    'omertacityofgangsters',
    'terminatorsalvation',
    'blackmesa',
    'residentevil7',
    'lowmagicage',
    'session',
    'howtosurvive2',
    'atomrpg',
    'zumadeluxe',
    'castlevaniaanniversarycollection',
    'howtosurvive',
    'sdgundamggenerationcrossrays',
    'legobatman',
    'toukiden2',
    'thiswarofmine',
    'residentevilrevelations',
    'dragonballzkakarot',
    'vanquish',
    'kingsbountythelegend',
    'dragonballxenoverse2',
    'nimbatusthespacedroneconstructor',
    'prototype',
    'heroesandgenerals',
    'callofcthulhudarkcornersoftheearth',
    'singularity',
    '2dark',
    'houseparty',
    'soldiersheroesofworldwar2',
    'vikingswolvesofmidgard',
    'callofjuarezgunslinger',
    'laracroftgo',
    'thehuntercallofthewild',
    'lethalleagueblaze',
    'rage2',
    'wolcenlordsofmayhem',
    'metalunit',
    'plagueincevolved',
    'mountandblade2bannerlord',
  ]
  return validGames.includes(name)
}

/**
 * Since Nexus Mods is relatively RESTful, we can easily re-use some basic logic to
 * retrieve valid presence data. This function translates the URL pathname from a
 * RESTful game URL to an updated presenceData instance.
 *
 * @param {Array} path The current location pathname split by "/".
 * @param {object} presenceData The current instance of the presence data.
 * @param {string} pageTitle The appropriate parsed <h1> element of the page.
 * @param {string} gameTitle The appropriate parsed game title element of the page.
 * @param {string} typeUrl The URL pathname of the resource to categorize.
 * @param {string} typeSingle A readable singular identifier of the resource for display.
 * @param {string} typePlural A readable plural identifier of the resource for display.
 * @returns {object} The updated instance of presence data.
 */
function getCategorizedPresenceData(
  path: string[],
  presenceData: PresenceData,
  pageTitle: string,
  gameTitle: string,
  typeUrl: string,
  typeSingle: string,
  typePlural: string,
): PresenceData {
  if (
    path.length > 3
    && path[0] !== ''
    && path[1] === typeUrl
    && path[2] === 'categories'
    && Number.parseInt(path[3]!)
  ) {
    // Example: /game/mods/categories/1
    presenceData.details = `${gameTitle} - Viewing ${typeSingle} category`
    presenceData.state = pageTitle
  }
  else if (
    path.length > 3
    && path[0] !== ''
    && path[1] === typeUrl
    && path[2] === 'categories'
    && path[3] !== ''
  ) {
    // Example: /game/mods/categories/random
    presenceData.details = `${gameTitle} - Browsing ${typeSingle} categories`
    presenceData.state = pageTitle
  }
  else if (
    path.length > 2
    && path[0] !== ''
    && path[1] === typeUrl
    && path[2] === 'categories'
  ) {
    // Example: /game/mods/categories
    presenceData.details = `${gameTitle} - Browsing ${typeSingle} categories`
  }
  else if (
    path.length > 2
    && path[0] !== ''
    && path[1] === typeUrl
    && path[2] === 'add'
  ) {
    // Example: /game/mods/add
    presenceData.details = `${gameTitle} - Uploading a new ${typeSingle}`
    presenceData.smallImageKey = Assets.Writing
  }
  else if (
    path.length > 2
    && path[0] !== ''
    && path[1] === typeUrl
    && path[2] !== 'categories'
    && Number.parseInt(path[2]!)
  ) {
    // Example: /game/mods/1
    presenceData.details = `${gameTitle} - Viewing ${typeSingle}`
    presenceData.state = pageTitle
  }
  else if (
    path.length > 2
    && path[0] !== ''
    && path[1] === typeUrl
    && path[2] !== 'categories'
    && path[2] !== ''
  ) {
    // Example: /game/mods/random
    presenceData.details = `${gameTitle} - Browsing ${typePlural}`
    presenceData.state = pageTitle
  }
  else if (path.length > 1 && path[0] !== '' && path[1] === typeUrl) {
    // Example: /game/mods
    presenceData.details = `${gameTitle} - Browsing ${typePlural}`
  }
  else {
    // Fallback
    presenceData.details = `${gameTitle} - Browsing page`
  }

  return presenceData
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

presence.on('UpdateData', () => {
  const path = window.location.pathname.split('/').slice(1)
  presenceData = {
    largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/N/Nexus%20Mods/assets/logo.png',
    smallImageKey: Assets.Reading,
    startTimestamp: browsingTimestamp,
    name: 'Nexus Mods',
  }

  // Main entry point
  switch (window.location.host.split('.')[0]) {
    case 'help':
      // Domain: https://help.nexusmods.com/
      // Explicitely don't do anything due to privacy being a possible concern.
      presenceData.details = 'Browsing support page'
      break
    case 'users':
      // Domain: https://users.nexusmods.com/
      // Explicitely don't do anything due to privacy being a possible concern.
      presenceData.details = 'Editing user account'
      break
    case 'wiki': {
      // Domain: https://wiki.nexusmods.com/
      let wikiTitle
      try {
        wikiTitle = document.querySelector('#firstHeading')?.textContent

        if (wikiTitle && Number.parseInt(wikiTitle) > 128)
          wikiTitle = `${wikiTitle.substring(0, 125)}...`
      }
      catch {
        wikiTitle = 'Unknown page'
      }

      presenceData.details = 'Reading wiki'
      presenceData.state = wikiTitle
      break
    }
    case 'forums': {
      // Domain: https://forums.nexusmods.com/
      let forumTitle
      try {
        forumTitle = document
          .querySelectorAll('title')[0]
          ?.textContent
          ?.replace(' - The Nexus Forums', '')
          .replace('The Nexus Forums', '')

        if (forumTitle === '')
          forumTitle = 'Home'
        else if (forumTitle && Number.parseInt(forumTitle) > 128)
          forumTitle = `${forumTitle.substring(0, 125)}...`
      }
      catch {
        forumTitle = 'Unknown page'
      }

      presenceData.details = 'Browsing forums'
      presenceData.state = forumTitle
      break
    }
    default: {
      // Domain: https://www.nexusmods.com/ (with fallback in place)
      // Get game title if available.
      let gameTitle
      try {
        gameTitle = document.querySelectorAll('.game-name')[0]?.textContent ?? ''

        if (gameTitle && Number.parseInt(gameTitle) > 128)
          gameTitle = `${gameTitle.substring(0, 125)}...`
      }
      catch {
        gameTitle = 'Unknown game'
      }

      // Get page title if available.
      let pageTitle: string
      try {
        pageTitle = document.querySelectorAll('H1')[0]?.textContent ?? ''

        if (pageTitle && Number.parseInt(pageTitle) > 128)
          pageTitle = `${pageTitle.substring(0, 125)}...`
      }
      catch {
        pageTitle = 'Unknown page'
      }

      // www. entry point
      if (path.length > 0 && isValidGame(path[0]!)) {
        // Games
        if (path.length > 1 && path[1] !== '') {
          switch (path[1]) {
            case 'mods':
              presenceData = getCategorizedPresenceData(
                path,
                presenceData,
                pageTitle,
                gameTitle,
                'mods',
                'mod',
                'mods',
              )
              break

            case 'media':
              presenceData = getCategorizedPresenceData(
                path,
                presenceData,
                pageTitle,
                gameTitle,
                'media',
                'media',
                'media',
              )
              break

            case 'images':
              presenceData = getCategorizedPresenceData(
                path,
                presenceData,
                pageTitle,
                gameTitle,
                'images',
                'image',
                'images',
              )
              break

            case 'videos':
              presenceData = getCategorizedPresenceData(
                path,
                presenceData,
                pageTitle,
                gameTitle,
                'videos',
                'video',
                'videos',
              )
              break

            default:
              presenceData.details = `${gameTitle} - Browsing page`
              break
          }
        }
        else {
          presenceData.details = `${gameTitle} - Browsing home`
        }
      }
      else if (path.length > 0 && path[0] !== '') {
        // Subpages
        switch (path[0]) {
          case 'about':
            presenceData.details = 'Browsing about'
            break

          case 'news': {
            if (path.length > 1 && Number.parseInt(path[1]!)) {
              presenceData.details = 'Reading a news article'
              presenceData.state = pageTitle
            }
            else {
              presenceData.details = 'Browsing news'
            }

            break
          }
          case 'mods': {
            if (path.length > 1 && path[1] === 'add') {
              presenceData.details = 'Uploading a new mod'
              presenceData.smallImageKey = Assets.Writing
            }
            else {
              presenceData.details = 'Browsing mods'
            }

            break
          }
          case 'media':
            presenceData.details = 'Browsing media'
            break

          case 'images': {
            if (path.length > 1 && path[1] === 'add') {
              presenceData.details = 'Uploading a new image'
              presenceData.smallImageKey = Assets.Writing
            }
            else {
              presenceData.details = 'Browsing images'
            }

            break
          }

          case 'videos': {
            if (path.length > 1 && path[1] === 'add') {
              presenceData.details = 'Uploading a new video'
              presenceData.smallImageKey = Assets.Writing
            }
            else {
              presenceData.details = 'Browsing videos'
            }

            break
          }
          case 'games':
            presenceData.details = 'Browsing games'
            break

          default:
            presenceData.details = 'Browsing page'
            break
        }
      }
      else {
        // Homepage
        presenceData.details = 'Browsing home'
      }
      break
    }
  }

  // Set presence.
  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.setActivity()
})

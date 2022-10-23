const presence = new Presence({
	clientId: "638118757453004820",
});

interface Game {
	name: string;
	logo: string;
}

interface GamePlayerState {
	playerName?: string;
	username?: string;
	playerInfo?: {
		username?: string;
	};
	state?: string;
	status?: string;
	kind?: string;
	category?: string;
	prompt?: {
		text?: string;
		html?: string;
	};
	entryId?: string;
	choiceId?: string;
	responseKey?: string;
	placeholder?: string;
	choiceType?: string;
	classes?: string[];
	[x: string]: unknown;
}

interface GameInfoState {
	name?: string;
}

interface GameCallbackParams {
	playerState: GamePlayerState;
	infoState: GameInfoState;
	tag: string;
}

let gamePlayerState: GamePlayerState = {
		playerName: null,
		state: null,
		username: null,
	},
	gamePlayerInfoState: GameInfoState = {
		name: null,
	},
	game: Game,
	browsingTimestamp = Math.round(Date.now() / 1000),
	gametag: string;

const uploadedFiles: Record<string, string> = {};
async function uploadFile(url: string, defaultImage: string): Promise<string> {
	if (uploadedFiles[url]) return uploadedFiles[url];
	uploadedFiles[url] = defaultImage;

	try {
		const data = await fetch(url).then(res => res.blob()),
			resultURL = await fetch("https://bashupload.com/", {
				method: "POST",
				body: data,
			})
				.then(res => res.text())
				.then(text => text.match(/https(.*)/)?.[0]);

		presence.info(resultURL);
		uploadedFiles[url] = resultURL;
		return resultURL;
	} catch (err) {
		presence.error(err);
		return url;
	}
}

if (window.location.hostname === "jackbox.tv") {
	setInterval(async () => {
		const playerStateLogs = await presence.getLogs(
			/recv <- .*?("key": "(bc:customer|player|info):[a-z0-9-]+",)/s
		);
		if (playerStateLogs.length > 0) {
			let updatedMainState = false,
				updatedInfoState = false;
			for (
				let i = playerStateLogs.length - 1;
				!(updatedInfoState && updatedMainState) &&
				i >= playerStateLogs.length - 6 &&
				i >= 0;
				i--
			) {
				const latestLog = playerStateLogs[i];
				if (/recv <- .*?"entities": {\n/s.test(latestLog)) {
					if (!updatedMainState) {
						gamePlayerState = JSON.parse(latestLog.slice(8)).result.entities[
							latestLog.match(
								/"key": "((?:bc:customer|player):(?:[a-z0-9-]+))",/s
							)[1]
						][1].val;
					}
					if (!updatedInfoState) {
						gamePlayerInfoState =
							JSON.parse(latestLog.slice(8)).result.entities[
								latestLog.match(/"key": "(info:\d+)",/s)?.[1]
							]?.[1].val ?? {};
					}
					updatedInfoState = true;
					updatedMainState = true;
				} else if (
					/recv <- .*?"key": "((?:bc:customer|player):(?:[a-z0-9-]+))",/s.test(
						latestLog
					)
				) {
					if (!updatedMainState) {
						gamePlayerState = JSON.parse(latestLog.slice(8)).result.val;
						updatedMainState = true;
					}
				} else if (
					/recv <- .*?"key": "info:\d+",/s.test(latestLog) &&
					!updatedInfoState
				) {
					gamePlayerInfoState = JSON.parse(latestLog.slice(8)).result.val;
					updatedInfoState = true;
				}
			}
		}
		if (!game) {
			type JackboxStorageLetiable = {
				tag: string;
			};
			const { tag } = await presence.getPageletiable<JackboxStorageLetiable>(
				'tv"]["storage'
			);
			gametag = tag;
			if (tag && tag !== "@connect") {
				game = Games[tag];
				browsingTimestamp = Math.round(Date.now() / 1000);
				if (!game) game = Games.unknown;
			}
		}
	}, 2000);
}

const Games: Record<string, Game> = {
	// Party Pack 6
	pushthebutton: {
		name: "Push the Button",
		logo: "https://i.imgur.com/OhgGmMQ.png",
	},
	jokeboat: {
		name: "Joke Boat",
		logo: "https://i.imgur.com/Cih6bqA.png",
	},
	rolemodels: {
		name: "Role Models",
		logo: "https://i.imgur.com/Utg6Fow.png",
	},
	triviadeath2: {
		name: "Trivia Murder Party 2",
		logo: "https://i.imgur.com/9MmGVGD.png",
	},
	ridictionary: {
		name: "Dictionarium",
		logo: "https://i.imgur.com/8S0aSTw.png",
	},
	// Party Pack 7
	quiplash3: {
		name: "Quiplash 3",
		logo: "https://i.imgur.com/Jds4R56.png",
	},
	"jackbox-talks": {
		name: "Talking Points",
		logo: "https://i.imgur.com/8Amy9Di.png",
	},
	"blanky-blank": {
		name: "Blather 'Round",
		logo: "https://i.imgur.com/qLW2Fft.png",
	},
	everyday: {
		name: "The Devils and the Details",
		logo: "https://i.imgur.com/dcJq65O.png",
	},
	worldchamps: {
		name: "Champ'd Up",
		logo: "https://i.imgur.com/KnAS7yD.png",
	},
	// Party Pack 8
	"the-wheel": {
		name: "The Wheel of Enormous Proportions",
		logo: "https://i.imgur.com/KnAS7yD.png",
	},
	"murder-detectives": {
		name: "Weapons Drawn",
		logo: "https://i.imgur.com/yRXmXbf.png",
	},
	"apply-yourself": {
		name: "Job Job",
		logo: "https://i.imgur.com/FfZYRGL.png",
	},
	"drawful-animate": {
		name: "Drawful Animate",
		logo: "https://i.imgur.com/7QPiNMv.png",
	},
	"survey-bomb": {
		name: "The Poll Mine",
		logo: "https://i.imgur.com/o4aaUox.png",
	},
	// Party Pack 9
	fourbage: {
		name: "Fibbage 4",
		logo: "https://i.imgur.com/DnqcuUX.png",
	},
	lineup: {
		name: "Quixort",
		logo: "https://i.imgur.com/zqzsySL.png",
	},
	"range-game": {
		name: "Nonsensory",
		logo: "https://i.imgur.com/JH3JgaM.png",
	},
	"antique-freak": {
		name: "Junktopia",
		logo: "https://i.imgur.com/5vqvCuK.png",
	},
	htmf: {
		name: "Roomerang",
		logo: "https://i.imgur.com/jZAqMNf.png",
	},
};

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/SXfEdnL.png",
		},
		[useName, useTime, useDetails] = await Promise.all([
			presence.getSetting<boolean>("useName"),
			presence.getSetting<boolean>("useTime"),
			presence.getSetting<boolean>("useDetails"),
		]),
		{ href, hostname, pathname, search } = window.location,
		pathSplit = pathname.split("/").slice(1);

	if (useTime) presenceData.startTimestamp = browsingTimestamp;

	switch (hostname) {
		case "jackbox.tv": {
			if (game) {
				const { name, logo } = game;
				presenceData.largeImageKey = logo;
				presenceData.details = `Playing ${name}`;
				if (useName) {
					const { playerName, username, playerInfo } = gamePlayerState,
						realUsername =
							playerName ??
							username ??
							playerInfo?.username ??
							gamePlayerInfoState.name;
					if (realUsername) {
						if (useDetails) presenceData.details += ` as ${realUsername}`;
						else presenceData.state = `as ${realUsername}`;
					}
				}
				if (useDetails) {
					switch (game) {
						// Party Pack 6
						case Games.pushthebutton: {
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "SuspicionVote": {
									presenceData.state = "Voting on who seems suspicious";
									break;
								}
								case "Probe": {
									presenceData.state = "Probing their fellow players";
									break;
								}
								case "Draw": {
									presenceData.state = "In the Drawing Quarters";
									break;
								}
								case "AnalyzePlayer": {
									presenceData.state =
										"Using the bioscanner - describing glyphs";
									break;
								}
								case "AnalysisReport": {
									presenceData.state = "Using the bioscanner - reading report";
									break;
								}
								case "MakeSingleChoice": {
									const { choiceType, gameInfo, prompt } = gamePlayerState,
										{ activeTest } = gameInfo as {
											activeTest: string;
										};
									if (choiceType) {
										switch (choiceType) {
											case "TutorialOptOut": {
												presenceData.state =
													"Choosing whether to skip the tutorial";
												break;
											}
											case "ConfirmedIdentity": {
												presenceData.state = "Confirming their identity";
												break;
											}
										}
									} else if (activeTest) {
										if (activeTest === "Push The Button")
											presenceData.state = "Accusing players";
										else presenceData.state = `Taking the ${activeTest} test`;
									} else {
										const html = prompt?.html;
										if (
											html ===
											"You are the Captain.  What test would you like to perform?"
										) {
											presenceData.state = "Choosing a test to perform";
											break;
										} else if (
											/^Select <strong>.*?<\/strong> to Test!$/.test(html)
										) {
											presenceData.state = "Choosing players to test";
											break;
										}
									}
									break;
								}
								case "EnterSingleText": {
									const { activeTest } = gamePlayerState.gameInfo as {
										activeTest: string;
									};
									if (activeTest)
										presenceData.state = `Taking the ${activeTest} test`;
									break;
								}
								case "GameOver": {
									presenceData.state = `Viewing results - ${gamePlayerState.winningRole}s won`;
								}
							}
							break;
						}
						case Games.jokeboat: {
							const icon =
								document.querySelector<HTMLDivElement>("#playericon");
							if (icon) {
								presenceData.smallImageKey =
									getComputedStyle(icon).backgroundImage.match(
										/^url\("(.*)"\)$/
									)?.[1];
							}
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "MakeSingleChoice": {
									const { choiceId } = gamePlayerState;
									if (choiceId === "ChooseCatchphrase")
										presenceData.state = "Choosing a catchphrase";
									else if (choiceId.startsWith("Skip"))
										presenceData.state = "Watching a tutorial";
									else if (choiceId.startsWith("ChooseSetup"))
										presenceData.state = "Choosing a joke setup";
									else if (choiceId.startsWith("ChooseTopic"))
										presenceData.state = "Choosing a topic for the joke";
									else if (choiceId.startsWith("ChooseAuthorReady"))
										presenceData.state = "Choosing how to tell the joke";
									else if (choiceId === "ChooseJoke")
										presenceData.state = "Voting on a joke";
									else if (choiceId === "ChoosePunchUpJoke")
										presenceData.state = "Choosing a joke to one-up";
									break;
								}
								case "EnterSingleText": {
									const { entryId, placeholder } = gamePlayerState;
									if (entryId.startsWith("Topic"))
										presenceData.state = `Entering a topic (${placeholder})`;
									else if (entryId.startsWith("Punchline"))
										presenceData.state = "Creating a punchline";
									else if (entryId === "PunchedUpLine")
										presenceData.state = "One-upping a joke";
									break;
								}
							}
							break;
						}
						case Games.rolemodels: {
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "Camera": {
									presenceData.state = "Taking a photo of themselves";
									break;
								}
								case "Draw": {
									presenceData.state = "Drawing a portrait of themselves";
									break;
								}
								case "MakeSingleChoice": {
									switch (gamePlayerState.choiceType) {
										case "SkipTutorial": {
											presenceData.state = "Watching the tutorial";
											break;
										}
										case "Prompt": {
											presenceData.state = "Choosing a category";
											break;
										}
										case "TagResolution": {
											presenceData.state = "Resolving a role conflict";
											break;
										}
										case "RoleModelsChoice": {
											presenceData.state = "Choosing the role that fits best";
											break;
										}
									}
									break;
								}
								case "Sortable": {
									presenceData.state = "Assigning roles to players";
									break;
								}
								case "EnterSingleText": {
									presenceData.state = "Answering a prompt";
									break;
								}
							}
							break;
						}
						case Games.triviadeath2: {
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "MakeSingleChoice": {
									if (gamePlayerState.roundType === "FinalRound")
										presenceData.state = "Answering the final trivia questions";
									else {
										switch (gamePlayerState.choiceType) {
											case "SkipTutorial": {
												presenceData.state = "Watching the intro";
												break;
											}
											case "Question": {
												presenceData.state = "Answering trivia";
												break;
											}
											case "Rule": {
												presenceData.state = "Playing a rule game";
												break;
											}
											case "PostGameChoice": {
												presenceData.state = "Choosing a post-game option";
												break;
											}
											default: {
												presenceData.state = "Playing a death game";
											}
										}
									}
									break;
								}
								case "EnterSingleText": {
									const { entryId } = gamePlayerState;
									if (entryId.startsWith("MindMeld")) {
										presenceData.state = "Playing the mind meld game";
										break;
									} else if (entryId === "CreatePassword") {
										presenceData.state =
											"Creating a password for the password game";
										break;
									} else if (entryId === "Quiplash") {
										presenceData.state = `Playing Quiplash - ${gamePlayerState.prompt.html}`;
										break;
									} else presenceData.state = "Playing a text death game";
									break;
								}
								case "Draw": {
									presenceData.state = "Playing a drawing death game";
									break;
								}
							}
							break;
						}
						case Games.ridictionary: {
							presenceData.smallImageKey = getComputedStyle(
								document.querySelector<HTMLDivElement>("#playericon")
							).backgroundImage.match(/^url\("(.*)"\)$/)[1];
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "MakeSingleChoice": {
									switch (gamePlayerState.choiceType) {
										case "ChooseGameType": {
											presenceData.state = "Choosing a game type";
											break;
										}
										case "ChooseDefinition": {
											presenceData.state = `Voting for a definition of ${
												gamePlayerState.prompt.html.match(
													/<div>(.*?)<\/div>$/
												)[1]
											}`;
											break;
										}
										case "LikeDefinition": {
											presenceData.state = "Liking definitions";
											break;
										}
										case "ChooseSynonym": {
											presenceData.state = `Voting for a synonym of ${
												gamePlayerState.prompt.html.match(
													/<font.*?>(.*?)(?:: )?<\/font>$/
												)[1]
											}`;
											break;
										}
										case "LikeSynonym": {
											presenceData.state = "Liking synonyms";
											break;
										}
										case "LikeSentence": {
											presenceData.state = "Liking sentences";
											break;
										}
										case "ChooseSentence": {
											presenceData.state = `Voting for a sentence with ${
												gamePlayerState.prompt.html.match(
													/<div>(.*?)<\/div>$/
												)[1]
											}`;
											break;
										}
									}
									break;
								}
								case "EnterSingleText": {
									switch (gamePlayerState.entryId) {
										case "Definition": {
											presenceData.state = `Creating a definition for ${
												gamePlayerState.prompt.html.match(
													/<font.*?>(.*?)<\/font>/
												)[1]
											}`;
											break;
										}
										case "Synonym": {
											presenceData.state = `Creating a synonym for ${
												gamePlayerState.prompt.html.match(
													/<font.*?>(.*?)(?:: )?<\/font>/
												)[1]
											}`;
											break;
										}
										case "Sentence": {
											presenceData.state = `Creating a sentence using ${gamePlayerState.word}`;
											break;
										}
									}
								}
							}
							break;
						}
						// Party Pack 7
						case Games.quiplash3: {
							presenceData.smallImageKey = getComputedStyle(
								document.querySelector<HTMLDivElement>("#playericon")
							).backgroundImage.match(/^url\("(.*)"\)$/)?.[1];
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "EnterSingleText": {
									presenceData.state = "Answering a prompt";
									break;
								}
								case "MakeSingleChoice": {
									presenceData.state = "Voting for their favorite answer";
									break;
								}
								case "EnterTextList": {
									presenceData.state = "Answering a Thriplash prompt";
									break;
								}
								default: {
									if (gamePlayerState.validActions) {
										switch (
											(gamePlayerState.validActions as string[]).join(",")
										) {
											case "toggle-visibility,new,load,exit": {
												presenceData.state = "In the Custom Content menu";
												break;
											}
											case "title,close": {
												presenceData.state = "Naming a custom Quiplash episode";
												break;
											}
											case "add,toggle-visibility,close":
											case "add,remove,toggle-visibility,done": {
												presenceData.state =
													"Adding prompts to a custom Quiplash episode";
												break;
											}
											case "submit,unlock,toggle-visibility,play,remove-content,episodes": {
												presenceData.state =
													"Viewing a custom Quiplash episode";
												break;
											}
										}
									}
								}
							}
							break;
						}
						case Games["jackbox-talks"]: {
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "Camera": {
									presenceData.state = "Taking a profile picture";
									break;
								}
								case "EnterSingleText": {
									const { entryId } = gamePlayerState;
									if (entryId.startsWith("prompt"))
										presenceData.state = "Creating topics";
									else if (entryId === "WriteQuote")
										presenceData.state = "Writing a quote about the talk";
									else if (entryId === "NameAward")
										presenceData.state = "Naming an award";
									break;
								}
								case "Awards": {
									presenceData.state = "Giving out their award";
									break;
								}
								case "MakeSingleChoice": {
									const { classes, choices, prompt } = gamePlayerState;
									if (
										prompt.html === "PICK THE TITLE OF THE TALK YOU WILL GIVE"
									)
										presenceData.state = "Choosing a talk title";
									else {
										switch (classes[0]) {
											case "SkipTutorial": {
												presenceData.state = "Watching the tutorial";
												break;
											}
											case "Presenter": {
												if (prompt.html.startsWith("RATE HOW WELL "))
													presenceData.state = "Rating their assistant";
												else if (prompt.text === "THANK YOU.") {
													presenceData.state =
														"Presenting their talk - thank you";
												} else {
													presenceData.state =
														"Presenting their talk - preparation";
												}
												break;
											}
											case "Assistant": {
												if (
													prompt.html ===
													"PICK THE BEST PICTURE TO REPRESENT THE TALK"
												) {
													presenceData.state =
														"Choosing a picture for the talk";
												} else presenceData.state = "Assisting their presenter";
												break;
											}
											default: {
												if (
													(choices as { className: string }[])[0].className ===
													"voteUp"
												)
													presenceData.state = "Reacting to the speech";
											}
										}
									}
									break;
								}
								case "Draw": {
									presenceData.state = "Presenting their talk - slide";
									break;
								}
							}
							break;
						}
						case Games["blanky-blank"]: {
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "MakeSingleChoice": {
									switch (gamePlayerState.choiceType) {
										case "skipTutorial": {
											presenceData.state = "Watching the tutorial";
											break;
										}
										case "password": {
											presenceData.state = "Choosing a prompt";
											break;
										}
									}
									break;
								}
								case "MakeSentence": {
									switch ((gamePlayerState.sentence as { type: string }).type) {
										case "writing": {
											presenceData.state = "Crafting initial sentence";
											break;
										}
										case "call": {
											presenceData.state = "Crafting a sentence";
											break;
										}
										case "response": {
											presenceData.state =
												"Crafting a sentence using players' guesses";
											break;
										}
										case "mybad": {
											presenceData.state =
												"Deciding if they should have known the answer";
											break;
										}
									}
									break;
								}
								case "EnterSingleText": {
									presenceData.state = "Guessing the object";
									break;
								}
							}
							break;
						}
						case Games.everyday: {
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "MakeSingleChoice": {
									switch (gamePlayerState.choiceId) {
										case "ChangeCharacter": {
											presenceData.state = "Choosing a character";
											break;
										}
										default: {
											if (gamePlayerState.choiceType === "SkipIntro")
												presenceData.state = "Watching the intro";
											else if (gamePlayerState.choiceType === "ShowTutorial") {
												presenceData.state =
													"Deciding if they want to watch the tutorial";
											}
										}
									}
									break;
								}
								case "CancelerMechanic": {
									presenceData.state =
										"Blocking a member from their selfish task";
									break;
								}
								case "TaskList": {
									presenceData.state = "Choosing a task";
									break;
								}
								case "NothingMechanic": {
									presenceData.state = "Doing nothing";
									break;
								}
								case "ScrubMechanic": {
									presenceData.state = "Scrubbing something";
									break;
								}
								case "RotateMechanic": {
									presenceData.state = "Rotating something";
									break;
								}
								case "TapMechanic": {
									presenceData.state = "Tapping something";
									break;
								}
								case "SwipeMechanic": {
									presenceData.state = "Swiping something";
									break;
								}
								case "TravelMechanicParticipant": {
									presenceData.state = "Travelling as a passenger";
									break;
								}
								case "TravelMechanicCaptain": {
									presenceData.state = "Travelling as the driver";
									break;
								}
								case "PhoneMechanic": {
									presenceData.state = "Calling someone";
									break;
								}
								case "DialogMechanic": {
									presenceData.state = "Talking to someone";
									break;
								}
								case "SearchMechanicCaptain":
								case "SearchMechanicParticipant": {
									presenceData.state = "Searching for something";
									break;
								}
								case "TextMechanicParticipant": {
									presenceData.state = "Writing a text";
									break;
								}
								case "TextMechanicCaptain": {
									presenceData.state = "Reading a text";
									break;
								}
								case "InstructionsMechanicCaptain": {
									presenceData.state = "Following instructions";
									break;
								}
								case "InstructionsMechanicParticipant": {
									presenceData.state = "Giving instructions";
									break;
								}
								case "HoldMechanic": {
									presenceData.state = "Holding something";
									break;
								}
							}
							break;
						}
						case Games.worldchamps: {
							presenceData.smallImageKey = getComputedStyle(
								document.querySelector("#playericon")
							).backgroundImage.match(/^url\("(.*)"\)$/)?.[1];
							switch (gamePlayerState.state) {
								case "Lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "MakeSingleChoice": {
									const { choiceId } = gamePlayerState;
									if (choiceId) {
										if (choiceId.startsWith("FlipChoice"))
											presenceData.state = "Flipping their character";
									} else if (
										gamePlayerState.prompt.html?.startsWith("Who is <br>")
									)
										presenceData.state = "Voting for the best champion";
									else if (
										gamePlayerState.prompt.html?.startsWith(
											"Swap your character or keep it in<br>"
										)
									) {
										presenceData.state =
											"Choosing whether to swap their character";
									} else presenceData.state = "Watching the tutorial";
									break;
								}
								case "Draw": {
									const { entryId } = gamePlayerState;
									if (entryId.startsWith("champion")) {
										presenceData.state = "Drawing a champion";
										break;
									} else if (entryId.startsWith("challenger")) {
										const imageLink =
											document.querySelector<HTMLImageElement>(
												".imageData"
											)?.src;
										if (imageLink) {
											presenceData.largeImageKey = await uploadFile(
												imageLink,
												logo
											);
										}
										presenceData.state = "Drawing a challenger";
										break;
									}
									break;
								}
							}
							break;
						}
						// Party Pack 8
						case Games["the-wheel"]: {
							switch (gamePlayerState.kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "waiting": {
									presenceData.state = "Waiting";
									break;
								}
								case "singleTextEntry": {
									if (gamePlayerState.category === "askTheWheel") {
										presenceData.state = `Asking the wheel a question - '${
											document.querySelector<HTMLTextAreaElement>(
												".input-box textarea"
											).value
										}'`;
									} else presenceData.state = "Answering a question";
									break;
								}
								case "choices": {
									if (gamePlayerState.category === "skip-intro")
										presenceData.state = "Watching the tutorial";
									break;
								}
								case "tappingList": {
									presenceData.state = "Selecting answers";
									break;
								}
								case "matching": {
									const [a, b] = gamePlayerState.headers as string[];
									presenceData.state = `Matching ${a} to ${b}`;
									break;
								}
								case "placeSlices": {
									presenceData.state = "Placing slices";
									break;
								}
								case "spin": {
									presenceData.state = "Spinning the wheel";
									break;
								}
								case "numeric": {
									presenceData.state = `Answering a numeric question - "${gamePlayerState.prompt}"`;
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
								case "typingList": {
									presenceData.state = "Typing answers";
									break;
								}
								case "guessing": {
									presenceData.state = "Guessing what the wheel is thinking of";
									break;
								}
								case "tappingRapid": {
									presenceData.state = "Tapping rapidly";
									break;
								}
								case "choosePlayers": {
									presenceData.state = "Choosing players";
									break;
								}
								case "chooseSlices": {
									presenceData.state = "Choosing slices";
									break;
								}
							}
							break;
						}
						case Games["murder-detectives"]: {
							const icon =
									document.querySelector<HTMLDivElement>(".header.avatar"),
								{ kind, prompt } = gamePlayerState;
							if (icon) {
								presenceData.smallImageKey = getComputedStyle(
									icon,
									":after"
								).backgroundImage.match(/^url\("(.*)"\)$/)?.[1];
							}
							switch (kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "choosing": {
									if (prompt === "Which case do you want to investigate?")
										presenceData.state = "Choosing a case to investigate";
									else if (
										prompt ===
											"[header]WRONG[/header][section]Try again in 5 seconds...[/section]" ||
										prompt === "Choose a guest to target." ||
										(prompt as string).startsWith(
											"Guess which detective brought "
										)
									)
										presenceData.state = "Murdering guests";
									else if (
										(prompt as string).startsWith("Who do you think murdered ")
									)
										presenceData.state = "Deciding on the culprit";
									break;
								}
								case "drawing": {
									presenceData.state = "Drawing their weapon clue";
									break;
								}
								case "inspecting": {
									presenceData.state = "Inspecting the killing weapons";
									break;
								}
								case "writing": {
									presenceData.state = "Inviting accomplices";
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
								default: {
									presenceData.state = "Waiting";
								}
							}
							break;
						}
						case Games["apply-yourself"]: {
							switch (gamePlayerState.kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "Logo": {
									presenceData.state = "Waiting";
									break;
								}
								case "writing": {
									presenceData.state = "Writing a response";
									break;
								}
								case "voting": {
									presenceData.state = "Voting for a response";
									break;
								}
								case "magnets": {
									presenceData.state = "Answering a prompt using magnets";
									break;
								}
								case "resumagnets": {
									presenceData.state = "Filling out their resumé using magnets";
									break;
								}
								case "done": {
									presenceData.state = "Waiting for others to finish";
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
							}
							break;
						}
						case Games["drawful-animate"]: {
							switch (gamePlayerState.kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "waiting": {
									presenceData.state = "Waiting";
									break;
								}
								case "drawing": {
									if (gamePlayerState.prompt === "an animation of yourself")
										presenceData.state = "Drawing an animation of themselves";
									else presenceData.state = "Drawing an animation";
									break;
								}
								case "writing": {
									presenceData.state = "Guessing the original prompt";
									break;
								}
								case "liking": {
									presenceData.state = "Awarding likes to other's guesses";
									break;
								}
								case "choosing": {
									presenceData.state = "Looking for the true prompt";
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
								case "ugc": {
									presenceData.state = "Creating a custom game";
									break;
								}
							}
							break;
						}
						case Games["survey-bomb"]: {
							switch (gamePlayerState.kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "waiting": {
									presenceData.state = "Waiting";
									break;
								}
								case "choices": {
									presenceData.state = "Selecting a door";
									break;
								}
								case "survey": {
									presenceData.state = "Completing survey";
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
							}
							break;
						}
						// Party Pack 9
						case Games.fourbage: {
							switch (gamePlayerState.kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "waiting": {
									presenceData.state = "Waiting";
									break;
								}
								case "choosing": {
									switch (gamePlayerState.context) {
										case "pick-category": {
											presenceData.state = "Choosing a category";
											break;
										}
										case "pick-truth": {
											presenceData.state = "Looking for the truth";
											break;
										}
										case "pick-likes": {
											presenceData.state = "Awarding likes to other's answers";
											break;
										}
										case "final-round-1":
										case "final-round-2": {
											presenceData.state =
												"Looking for the truth - Final Round";
											break;
										}
									}
									break;
								}
								case "writing": {
									presenceData.state = "Writing lies";
									break;
								}
								case "voting": {
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
							}
							break;
						}
						case Games.lineup: {
							switch (gamePlayerState.kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "choices": {
									presenceData.state = "Selecting a topic to sort";
									break;
								}
								case "falling": {
									presenceData.state = "Sorting an item";
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
								default: {
									presenceData.state = "Waiting";
								}
							}
							break;
						}
						case Games["range-game"]: {
							switch (gamePlayerState.kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
								case "drawing": {
									presenceData.state = "Drawing a picture";
									break;
								}
								case "guess": {
									presenceData.state = "Guessing the value in the range";
									break;
								}
								case "postGuess": {
									presenceData.state = "Waiting for other players to guess";
									break;
								}
								case "singleTextEntry": {
									presenceData.state = "Answering a prompt";
									break;
								}
								case "choices": {
									if (gamePlayerState.category === "walkthrough")
										presenceData.state = "Watching the tutorial";
									else presenceData.state = "Making a choice";
									break;
								}
								default: {
									presenceData.state = "Waiting";
								}
							}
							break;
						}
						case Games["antique-freak"]: {
							const { prompt, kind, responseKey } = gamePlayerState;
							switch (kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
								case "ranking": {
									presenceData.state = "Ranking items";
									break;
								}
								case "choosing": {
									if (responseKey.startsWith("skip"))
										presenceData.state = "Watching the tutorial";
									else if (responseKey.startsWith("shopping"))
										presenceData.state = "Shopping for an item";
									else if (responseKey.startsWith("presentationChoice")) {
										if (prompt === "Ready to present?")
											presenceData.state = "Preparing to present";
										else presenceData.state = "Presenting their item";
									} else if (responseKey.startsWith("reaction"))
										presenceData.state = "Reacting to an item";
									else if (responseKey.startsWith("voting"))
										presenceData.state = "Voting on a collection";
									break;
								}
								case "fact": {
									presenceData.state = "Creating facts about an item";
									break;
								}
								case "writing": {
									if (prompt === "This piece is entitled:")
										presenceData.state = "Naming their item";
									else if (
										prompt ===
										'Your two items are part of a collection called "[blank][/blank]"'
									)
										presenceData.state = "Naming their collection";
									break;
								}
								case "waiting": {
									presenceData.state = "Waiting";
									break;
								}
							}
							break;
						}
						case Games.htmf: {
							presenceData.smallImageKey =
								document.querySelector<HTMLImageElement>(".avatar > img")?.src;
							switch (gamePlayerState.kind) {
								case "lobby": {
									presenceData.state = "Waiting in lobby";
									break;
								}
								case "postGame": {
									presenceData.state = "Viewing the results";
									break;
								}
								case "eliminating": {
									presenceData.state = "Voting to eliminate a player";
									break;
								}
								case "choosing": {
									if (gamePlayerState.prompt === "")
										presenceData.state = "Voting for a response";
									else if (gamePlayerState.round === "firestarter")
										presenceData.state = "Choosing a player to burn";
									else if (gamePlayerState.round === "finale")
										presenceData.state = "Deciding who should win";
									break;
								}
								case "waiting": {
									presenceData.state = "Waiting";
									break;
								}
								case "writing": {
									if (gamePlayerState.isGoodbye)
										presenceData.state = "Writing a goodbye message";
									else {
										switch (gamePlayerState.round) {
											case "intro": {
												presenceData.state = "Writing an introduction";
												break;
											}
											case "connection": {
												presenceData.state = "Writing about a connection";
												break;
											}
											case "quickie": {
												presenceData.state = "Writing an anonymous response";
												break;
											}
											case "firestarter": {
												presenceData.state = "Writing a dramatic response";
												break;
											}
											case "finale": {
												presenceData.state =
													"Writing a response for the finale";
												break;
											}
											case "": {
												presenceData.state = "Writing a victory speech";
												break;
											}
											default: {
												presenceData.state = "Writing a response";
											}
										}
									}
									break;
								}
							}
							break;
						}
					}
				}
			} else presenceData.details = "Idle";
			break;
		}
		case "games.jackbox.tv": {
			presenceData.details = "Looking at a past game";
			presenceData.state = document.title;
			presenceData.largeImageKey = document.querySelector<HTMLImageElement>(
				"[class*=-artifact] .image"
			).src;
			presenceData.buttons = [
				{
					label: "View Game",
					url: href,
				},
			];
			break;
		}
		case "www.jackboxgames.com": {
			switch (pathSplit[0] ?? "") {
				case "": {
					presenceData.details = "Browsing home page";
					break;
				}
				case "author": {
					presenceData.details = "Browsing blog posts by author";
					presenceData.state = document
						.querySelector("h1")
						.textContent.match(/Author: (.*)/i)[1];
					break;
				}
				case "blog": {
					presenceData.details = "Browsing blog posts";
					break;
				}
				case "category": {
					presenceData.details = "Browsing blog category";
					presenceData.state = document
						.querySelector("h1")
						.textContent.match(/Category: (.*)/i)[1];
					break;
				}
				case "games": {
					presenceData.details = "Browsing games";
					break;
				}
				case "tag": {
					presenceData.details = "Browsing blog posts by tag";
					presenceData.state = document
						.querySelector("h1")
						.textContent.match(/Tag: (.*)/i)[1];
					break;
				}
				default: {
					if (/^\/\d{4}(\/\d{2})?(\/\d{2})?\/$/.test(pathname)) {
						presenceData.details = "Browsing blog posts by date";
						presenceData.state = document.querySelector("h1").textContent;
					} else if (
						document.body.getAttribute("itemtype") === "http://schema.org/Blog"
					) {
						presenceData.details = "Reading an article";
						presenceData.state = document.querySelector("h1").textContent;
						presenceData.buttons = [
							{
								label: "Read Article",
								url: href,
							},
						];
					} else {
						presenceData.details = "Browsing";
						presenceData.state = document.title.match(
							/^(.*?)( - Jackbox Games)?$/
						)[1];
					}
				}
			}
			break;
		}
		case "shop.jackboxgames.com": {
			switch (pathSplit[0] ?? "") {
				case "": {
					presenceData.details = "Browsing store";
					break;
				}
				case "cart": {
					presenceData.details = "Viewing cart";
					break;
				}
				case "collections": {
					if (pathSplit[1]) {
						if (pathSplit.includes("products")) {
							presenceData.details = "Viewing a product";
							presenceData.state = document.querySelector("h1").textContent;
						} else {
							presenceData.details = "Browsing collection";
							presenceData.state = document.querySelector("h1").textContent;
						}
					} else presenceData.details = "Browsing collections";
					break;
				}
				case "products": {
					if (pathSplit[1]) {
						presenceData.details = "Viewing a product";
						presenceData.state = document.querySelector("h1").textContent;
					} else presenceData.details = "Browsing collections";
					break;
				}
				case "search": {
					presenceData.details = "Searching store";
					presenceData.state = new URLSearchParams(search).get("q");
					break;
				}
			}
			break;
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

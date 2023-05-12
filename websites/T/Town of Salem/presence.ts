const presence = new Presence({
	clientId: "754771926857285782",
});

enum Assets {
	Play = "https://i.imgur.com/q57RJjs.png",
	Pause = "https://i.imgur.com/mcEXiZk.png",
	Stop = "https://i.imgur.com/aLYu3Af.png",
	Search = "https://i.imgur.com/B7FxcD4.png",
	Question = "https://i.imgur.com/pIIJniP.png",
	Live = "https://i.imgur.com/0HVm46z.png",
	Reading = "https://i.imgur.com/5m10TTT.png",
	Writing = "https://i.imgur.com/Pa00qZh.png",
	Call = "https://i.imgur.com/PFdbnIf.png",
	Vcall = "https://i.imgur.com/6wG9ZvM.png",
	Downloading = "https://i.imgur.com/ryrDrz4.png",
	Uploading = "https://i.imgur.com/SwNDR5U.png",
	Repeat = "https://i.imgur.com/Ikh95KU.png",
	RepeatOne = "https://i.imgur.com/wh885z3.png",
	Premiere = "https://i.imgur.com/Zf8FSUR.png",
	PremiereLive = "https://i.imgur.com/yC4j9Lg.png",
	Viewing = "https://i.imgur.com/fpZutq6.png",
}

enum Assets {
	Day = "https://i.imgur.com/HfHbMyP.png",
	Discussion = "https://i.imgur.com/jPqjrgn.png",
	Night = "https://i.imgur.com/20YDTvV.png",
	Voting = "https://i.imgur.com/QONtFlc.png",
	Judgement = "https://i.imgur.com/6VbV24O.png",
	Defense = "https://i.imgur.com/bsl0JU0.png",
	Logo = "https://i.imgur.com/y7VYTQK.jpg",
}

enum GameState {
	Night = "night",
	Day = "day",
	End = "end",
	AfterGame = "afterGame",
	PreGame = "preGame",
}

enum GameType {
	Classic = "Classic",
	Ranked = "Ranked",
}

interface GameData {
	scene: string;
	page: string;
	day: number;
	gameMode: string;
	state: GameState;
}

interface Log {
	content: string;
	id: number;
}

const gameTypeNames: Record<string, string> = {
		RankedPractice: "Ranked Practice",
		RapidMode: "Custom Rapid Mode",
		DraculasPalace: "Dracula's Palace",
		ClassicTownTraitor: "Town Traitor",
		CovenClassic: "Classic Coven",
		CovenRankedPractice: "Coven Ranked Practice",
		CovenMafia: "Mafia Returns",
		CovenCustom: "Custom Coven",
		CovenTownTraitor: "Coven Town Traitor",
		CovenAllAny: "Coven All Any",
		AllAny: "All Any",
	},
	oldState: GameData = {
		scene: "BigLogin",
		page: "",
		day: 1,
		gameMode: GameType.Classic,
		state: GameState.Day,
	},
	currentState = Object.assign({}, oldState);

let elapsed = Math.round(Date.now() / 1000),
	lastId: number = null;

function handleLog(log: string) {
	if (
		log.startsWith("Switched to ") ||
		log.startsWith("Switched additively to")
	) {
		const scene = log
			.match(/^Switched(?: additively)? to(?: scene)? (.*) Scene/m)[1]
			.trim();
		currentState.scene = scene;
		if (scene === "BigPreGame") currentState.state = GameState.PreGame;
	} else if (log.startsWith("Entered HomeSceneController.ShowView()")) {
		currentState.page = log
			.match(
				/^Entered HomeSceneController.ShowView\(\) - View passed in: (.*)$/m
			)[1]
			.trim();
	} else if (log.startsWith("Entered ")) {
		switch (log.match(/^Entered (.*)$/m)[1].trim()) {
			case "HandleStartRanked": {
				currentState.scene = "BigLobby";
				currentState.gameMode = GameType.Ranked;
				break;
			}
			case "HandleOnLeaveRankedQueue": {
				currentState.scene = "BigHome";
				currentState.gameMode = GameType.Classic;
				break;
			}
		}
	} else if (log.startsWith("Creating lobby:"))
		currentState.gameMode = log.match(/^Creating lobby: (.*?) \|/)[1];
	else if (/\[Network\] <color=.*?>\[Received\] <b>/.test(log)) {
		const action = log.match(
			/\[Network\] <color=.*?>\[Received\] <b>(.*?)<\/b>/
		)[1];
		switch (action) {
			case "PickNames":
			case "RoleAndPosition": {
				currentState.page = action;
				currentState.state = GameState.PreGame;
				break;
			}
			case "StartFirstDay": {
				currentState.day = 1;
				currentState.state = GameState.Day;
				currentState.page = "StartDiscussion";
				break;
			}
			case "StartDay": {
				currentState.day++;
				currentState.state = GameState.Day;
				currentState.page = "";
				break;
			}
			case "StartNight": {
				currentState.state = GameState.Night;
				currentState.page = "";
				break;
			}
			case "FullMoonNight":
			case "StartDiscussion":
			case "StartDefense":
			case "StartJudgement":
			case "StartVoting":
			case "WhoDiedAndHow": {
				currentState.page = action;
				break;
			}
			case "SomeoneHasWon": {
				currentState.state = GameState.End;
				break;
			}
		}
	}
}

/**
 * Overwrites the default console.log to be able to read the logs.
 * Built-in readLogs causes performance problems, as hundreds of logs can be created in half a second.
 * It is also hard to determine which logs have not been read yet.
 */
const injectedLoggerScript = document.createElement("script");
injectedLoggerScript.type = "text/javascript";
injectedLoggerScript.textContent = `
{
	let counter = 0;
	console.stdlog = console.log.bind(console);
	console.logs = [];
	console.log = function() {
		const log = arguments[0];
		if (/^Switched |^Entered |^Creating |\\[Network\\] <color=.*?>\\[Received\\] <b>/.test(log)) {
			console.logs.push({
				content: log,
				id: counter,
			});
			counter++;
			if (counter > 10000) counter = 0;
		}
		while (console.logs.length > 100) console.logs.shift();
		console.stdlog.apply(console, arguments);
	};
}
`;
document.head.appendChild(injectedLoggerScript);

setInterval(async () => {
	const logs: Log[] = await presence.getPageletiable('console"]["logs');
	let lastUnreadLogIndex = 0;
	for (let i = logs.length - 1; i >= 0; i--) {
		if (logs[i].id === lastId) {
			lastUnreadLogIndex = i + 1;
			break;
		}
	}
	for (let i = lastUnreadLogIndex; i < logs.length; i++)
		handleLog(logs[i].content);
	if (logs.length > 0) lastId = logs[logs.length - 1].id;
}, 1000);

presence.on("UpdateData", () => {
	const presenceData: PresenceData = {
		largeImageKey: Assets.Logo,
	};

	if (window.location.pathname !== "/TownOfSalem/") {
		presenceData.details = "Browsing BlankMediaGames";
		presenceData.state = document.title;
		presenceData.startTimestamp = elapsed;
	} else {
		if (oldState.scene !== currentState.scene)
			elapsed = Math.round(Date.now() / 1000);
		presenceData.startTimestamp = elapsed;
		Object.assign(oldState, currentState);
		switch (currentState.scene) {
			case "BigLogin": {
				presenceData.details = "Logging in";
				break;
			}
			case "BigHome": {
				switch (currentState.page) {
					case "GameModeSelect": {
						presenceData.details = "Selecting Game Mode";
						break;
					}
					case "Customization": {
						presenceData.details = "Customizing Character";
						break;
					}
					case "Party": {
						presenceData.details = "In a Party";
						break;
					}
					default: {
						presenceData.details = "Browsing Main Menu";
						presenceData.state = currentState.page;
					}
				}
				break;
			}
			case "BigLobby": {
				presenceData.details = "Waiting in a Lobby";
				presenceData.state =
					gameTypeNames[currentState.gameMode] ?? currentState.gameMode;
				break;
			}
			case "BigPreGame": {
				presenceData.details = "Loading Game";
				presenceData.state =
					gameTypeNames[currentState.gameMode] ?? currentState.gameMode;
				break;
			}
			case "BigGame": {
				presenceData.details = `Playing a ${
					gameTypeNames[currentState.gameMode] ?? currentState.gameMode
				} Game`;
				switch (currentState.state) {
					case GameState.PreGame: {
						switch (currentState.page) {
							case "PickNames": {
								presenceData.state = "Choosing Names";
								break;
							}
							case "RoleAndPosition": {
								presenceData.state = "Getting a Role";
								break;
							}
						}
						break;
					}
					case GameState.Day: {
						presenceData.smallImageKey = Assets.Day;
						switch (currentState.page) {
							case "StartDiscussion": {
								presenceData.state = `Discussion | Day ${currentState.day}`;
								presenceData.smallImageKey = Assets.Discussion;
								break;
							}
							case "StartVoting": {
								presenceData.state = `Voting | Day ${currentState.day}`;
								presenceData.smallImageKey = Assets.Voting;
								break;
							}
							case "WhoDiedAndHow": {
								presenceData.state = `Viewing a Death | Day ${currentState.day}`;
								break;
							}
							case "StartDefense": {
								presenceData.state = `Defense | Day ${currentState.day}`;
								presenceData.smallImageKey = Assets.Defense;
								break;
							}
							case "StartJudgement": {
								presenceData.state = `Judgement | Day ${currentState.day}`;
								presenceData.smallImageKey = Assets.Judgement;
								break;
							}
							default: {
								presenceData.state = `Day ${currentState.day}`;
							}
						}
						break;
					}
					case GameState.Night: {
						presenceData.smallImageKey = Assets.Night;
						if (currentState.page === "FullMoonNight")
							presenceData.state = `Night ${currentState.day} (Full Moon)`;
						else presenceData.state = `Night ${currentState.day}`;
						break;
					}
					case GameState.End: {
						presenceData.state = "Viewing End Screen";
						break;
					}
				}
				break;
			}
			case "BigEndGame": {
				presenceData.details = `Playing a ${
					gameTypeNames[currentState.gameMode] ?? currentState.gameMode
				} Game`;
				presenceData.state = "Viewing After Game Screen";
				break;
			}
		}
	}

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

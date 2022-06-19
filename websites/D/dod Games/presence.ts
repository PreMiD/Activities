const presence = new Presence({
	clientId: "937393073539911730"
});

let isInGame = false,
	timeStarted = Date.now();

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "logo",
	};

	let playerName = document.querySelector("#component_top_right_loginasname_text").textContent;
	let urls = document.querySelectorAll("#topBarDownLink");
	let openRooms = 0;

	for (const url of urls) {
		if (url.textContent.includes("&room=")) openRooms++;

		// Draw It
		if (url.textContent.includes("game=drawit&room=")) {
			presenceData.details = "Παίζει Ζωγράφισέ Το";
			presenceData.startTimestamp = timeStarted;
			if (!isInGame) {
				timeStarted = Date.now();
				isInGame = true;
			}

			let round = document.querySelector("#round b").textContent;
			round = round.replaceAll(" ", "");
			const scores = document.querySelectorAll("#playersContainer .player");
			for (let i = 0; i < scores.length; i++) {
				if (scores[i].querySelector(".name").textContent == playerName) {
					if (
						(document.querySelector("#drawtools") as HTMLElement).style
							.display !== "none"
					) {
						presenceData.smallImageKey = "molivaki";
						presenceData.smallImageText = "Ζωγραφίζει";
					}
					const position = parseInt(scores[i].getAttribute("index"));
					presenceData.state = `Σκορ: ${scores[i].querySelector(".score").textContent} | Γύρος: ${round} | Θέση #${position+1}/${scores.length}`;
					presenceData.startTimestamp = timeStarted;
				}
			}
			if (scores.length < 10) {
				presenceData.buttons = [
					{
						label: "Join Game",
						url: url.textContent
					}
				];
			}
			break;
		}

		// Quiz
		else if (url.textContent.includes("game=quiz&room=")) {
			presenceData.details = "Παίζει Κουίζ";
			if (!isInGame) {
				timeStarted = Date.now();
				isInGame = true;
			}
			presenceData.buttons = [
				{
					label: "Join Game",
					url: url.textContent
				}
			];

			let round = parseInt(document.querySelector("#countRound").textContent) || "-";
			let scores = document.querySelectorAll("#playersContainer .numberAndPlayerContainer");
			for (let i = 0; i < scores.length; i++){
				if (scores[i].querySelector(".quiz_playerName").textContent == playerName) {
					let position = parseInt(scores[i].querySelector(".quiz_playerNumber").textContent);
					presenceData.state = `Σκορ: ${scores[i].querySelector(".quiz_playerPoints").textContent} | Γύρος: ${round} | Θέση #${position}/${scores.length}`;
				}
			}
			break;
		}

		// Αγωνία
		else if (url.textContent.includes("game=agonia&room=")) {
			const elo = document.querySelector(".mytr").getAttribute("elo");
			const nPlayers = parseInt(
				document.querySelector("#agonia_content").className.match(/\d+/g)[0]
			);
			presenceData.details = `Παίζει Αγωνία | 💪🏻 ${elo}`;
			presenceData.startTimestamp = timeStarted;
			if (!isInGame) {
				timeStarted = Date.now();
				isInGame = true;
			}

			const playerClassNames = [
					"agonia_player1",
					"agonia_player2",
					"agonia_player3",
					"agonia_player4"
				],
				state: { [key: string]: any } = {};
			for (const playerClassName of playerClassNames) {
				const player = document.querySelector(`#${playerClassName}`);
				if (player) {
					const playerName = player.querySelector(".gnh_name").textContent;
					if (playerName) {
						state[playerName] = {
							score: player.querySelector(".gnh_score_text").textContent,
							winner: false
						};
					}
				}
			}
			if (
				document.querySelector("#gameover_content").parentElement.style
					.display !== "none"
			) {
				const gameOverClassNames = [
					"gameover_user1",
					"gameover_user2",
					"gameover_user3",
					"gameover_user4"
				];
				for (const gameOverClassName of gameOverClassNames) {
					const player = document.querySelector(`#${gameOverClassName}`);
					if (
						player &&
						(player.querySelector(".gameover_userphotowin") as HTMLElement).style.display !== "none"
					) {
						const winnerName = player.getAttribute("shownname");
						if (winnerName in state) state[winnerName].winner = true;
					}
				}
			}
			let stateString = "";
			for (const key in state) {
				const value = state[key];
				stateString += `${value.winner ? " 🏆 " : ""}${key}: ${value.score} – `;
			}
			if (Object.keys(state).length === nPlayers)
				presenceData.state = stateString.substring(0, stateString.length - 3);
			else {
				presenceData.state = `${Object.keys(state).length}/${nPlayers} παίκτες...`;
				presenceData.buttons = [
					{
						label: "Join Game",
						url: url.textContent
					}
				];
			}
			break;
		}

		// Tichu
		else if (url.textContent.includes("game=tichu&room=")) {
			const elo = document.querySelector(".mytr").getAttribute("elo");
			presenceData.details = `Παίζει Tichu | 💪🏻 ${elo}`;
			if (!isInGame) {
				timeStarted = Date.now();
				isInGame = true;
			}

			const teamPlayers: string[] = [],
				opPlayers: string[] = [],
				playerState: { [key: string]: any } = {},
				bot = document.querySelector("#nickholder_bottom .playerName").textContent,
				up = document.querySelector("#nickholder_up .playerName").textContent,
				left = document.querySelector("#nickholder_left .playerName").textContent,
				right = document.querySelector("#nickholder_right .playerName").textContent;

			if (bot) playerState.bot = { name: bot, bet: null };
			else if (up) playerState.up = { name: up, bet: null };
			else if (left) playerState.left = { name: left, bet: null };
			else if (right) playerState.right = { name: right, bet: null };

			for (const pos of ["up", "left", "right"]) {
				if (!(pos in playerState)) continue;
				const betElement = document.querySelector(`#nickholder_${pos} #tichugrand`) as HTMLElement;
				if (betElement.style.display !== "none")
					playerState[pos].bet = betElement.className;
			}

			let betElement = document.querySelector("#btnTichuToggle") as HTMLElement;
			if (betElement.style.display !== "none") playerState.bot.bet = "tichu";

			betElement = document.querySelector("#btnGrandToggle") as HTMLElement;
			if (betElement.style.display !== "none") playerState.bot.bet = "grand";

			for (const pos in playerState) {
				const player = playerState[pos];
				(["bot", "up"].includes(pos) ? teamPlayers : opPlayers).push(
					`${player.bet === "tichu" ? "🟠" : player.bet === "grand" ? "🔴" : ""}${player.name}`
				);
			}

			const myTeamScore = document.querySelector("#txtMyTeamScore").textContent;
			const opTeamScore = document.querySelector("#txtOpTeamScore").textContent;

			presenceData.startTimestamp = timeStarted;
			if (teamPlayers.length === 2 && opPlayers.length === 2) {
				presenceData.state = `(${teamPlayers[0]}, ${teamPlayers[1]}) ${myTeamScore} - ${opTeamScore} (${opPlayers[0]}, ${opPlayers[1]})`;	
			} else {
				presenceData.state = `${teamPlayers.length + opPlayers.length}/4 παίκτες...`;
				presenceData.buttons = [
					{
						label: "Join Game",
						url: url.textContent
					}
				];
			}
			break;
		}
	}
	if (!openRooms) isInGame = false;
	if (isInGame) presence.setActivity(presenceData);
	else presence.setActivity();
});

const presence = new Presence({
		clientId: "1016991973531451502",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

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

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null;

async function getStrings() {
	return presence.getStrings(
		{
			pause: "general.paused",
			play: "general.playing",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}

presence.on("UpdateData", async () => {
	const playback =
			!!document.querySelector("#title") ||
			(document.querySelectorAll("video").length &&
				document.querySelectorAll("video")[0].className !== "previewVideo"),
		{ pathname, href } = document.location,
		[newLang, buttons] = await Promise.all([
			presence.getSetting<string>("lang").catch(() => "en"),
			presence.getSetting<boolean>("buttons"),
		]),
		splitPath = pathname.split("/"),
		presenceData: PresenceData = {
			largeImageKey: "https://i.imgur.com/trQFagl.jpeg",
			startTimestamp: browsingTimestamp,
		};

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	if (!playback) {
		switch (splitPath[1]) {
			case "anime-bo":
			case "anime-sap-chieu":
			case "anime-le":
			case "danh-sach":
			case "hoat-hinh-trung-quoc": {
				presenceData.details = "Đang chọn phim";
				presenceData.buttons = [
					{
						label: "Xem Phim",
						url: href,
					},
				];
				break;
			}
			case "": {
				presenceData.details = "Đang xem trang chủ...";
				break;
			}
			case "tim-kiem": {
				presenceData.details = "Đang tìm kiếm...";
				break;
			}
			case "the-laoi": {
				presenceData.details = "Đang chọn thể loại phim";
				break;
			}
			case "tu-phim": {
				presenceData.details = "Đang xem danh sách đã lưu trong hộp phim";
				break;
			}
			case "season": {
				presenceData.details = "Đang chọn mùa phim";
				presenceData.buttons = [
					{
						label: "Xem Phần",
						url: href,
					},
				];
				break;
			}
			case "bang-xep-hang": {
				presenceData.details = "Đang xem bảng xếp hạng anime";
				break;
			}
			case "phim": {
				presenceData.details = `Định xem phim ${
					document.querySelector<HTMLAnchorElement>(".Title").textContent
				}`;
				presenceData.buttons = [
					{
						label: "Xem Phim",
						url: href,
					},
				];
				break;
			}
			case "quen-mat-khau.html": {
				presenceData.details = "Đang bị quên mật khẩu kek.";
				break;
			}
			case "/lich-chieu-phim.html": {
				presenceData.details = "Đang xem lịch chiếu anime";
				break;
			}
			case "anime":
			case "account": {
				switch (splitPath[2]) {
					case "info": {
						presenceData.details = "Đang xem profile...";
						break;
					}
					case "login": {
						presenceData.details = "Đang đăng nhập...";
						break;
					}
					case "register": {
						presenceData.details = "Đang đăng ký...";
						break;
					}
					case "library": {
						presenceData.details = "Đang xem thử viện alime";
						presenceData.buttons = [
							{
								label: "Xem Thư Viện Anime",
								url: href,
							},
						];
						break;
					}
				}
				break;
			}
			default: {
				presenceData.details = "Đang xem trang chủ...";
				break;
			}
		}
	} else {
		const [video] = document.querySelectorAll("video");

		if (!isNaN(video?.duration)) {
			delete presenceData.startTimestamp;
			const [titleArrOne] = (
				document.querySelectorAll(".Title")
					? document.querySelector(".Title").textContent
					: "Không tìm thấy còn cặc - Tập ?"
			).split(" - ");
			presenceData.smallImageKey = video.paused ? "pause" : "play";
			presenceData.smallImageText = video.paused ? strings.pause : strings.play;
			presenceData.endTimestamp = presence.getTimestamps(
				Math.floor(video.currentTime),
				Math.floor(video.duration)
			)[1];

			presenceData.details = `Đang xem: ${titleArrOne} `;
			presenceData.state = `Tập: ${
				document.querySelector<HTMLAnchorElement>(".episode.playing")
					.textContent
			}`;
			presenceData.buttons = [
				{
					label: "Xem Phim",
					url: href,
				},
			];
			if (video.paused) delete presenceData.endTimestamp;
		}
	}
	if (!buttons) delete presenceData.buttons;
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

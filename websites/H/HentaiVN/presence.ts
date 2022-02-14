const presence = new Presence({
		clientId: "942782020055089192"
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);
let page = "1",
	keyword,
	namekey,
	doukey,
	charkey,
	keystr,
	largebox;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
		largeImageKey: "logo",
		startTimestamp: browsingTimestamp
	};

	if (new URLSearchParams(window.location.search).has("key")) {
		presenceData.details = "Đang tìm kiếm:";
		presenceData.state = document.querySelector("input").value;
		presenceData.smallImageKey = "search";
	} else if (document.location.pathname === "/") {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = "Đang duyệt trang chủ";
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "surf";
	} else if (document.location.pathname.startsWith("/tacgia=")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = `Đang xem danh sách truyện của tác giả ${document
			.querySelectorAll("span[itemprop='name']")[2]
			.textContent.trim()}`;
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "list";
	} else if (document.location.pathname.startsWith("/char=")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = `Đang xem danh sách truyện có nhân vật ${document
			.querySelectorAll("span[itemprop='name']")[2]
			.textContent.trim()}`;
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "list";
	} else if (document.location.pathname.startsWith("/doujin=")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = `Đang xem danh sách truyện là doujin ${document
			.querySelectorAll("span[itemprop='name']")[2]
			.textContent.trim()}`;
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "list";
	} else if (document.location.pathname.startsWith("/dang-tien-hanh.html")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = "Đang xem danh sách truyện Đang tiến hành";
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "list";
	} else if (document.location.pathname.startsWith("/danh-sach.html")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = "Đang xem danh sách truyện";
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "list";
	} else if (document.location.pathname.startsWith("/chap-moi.html")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = "Đang xem danh sách truyện Có chap mới";
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "list";
	} else if (document.location.pathname.startsWith("/nhom-dich.html")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = "Đang xem danh sách nhóm dịch";
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "list";
	} else if (document.location.pathname.startsWith("/da-hoan-thanh.html")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = "Đang xem danh sách truyện Đã hoàn thành";
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "list";
	} else if (document.location.pathname.startsWith("/top-member.php")) {
		presenceData.details = "Đang xem Bảng xếp hạng thành viên";
		presenceData.smallImageKey = "top";
	} else if (document.location.pathname.startsWith("/top-waifu-tuan.php")) {
		presenceData.details = "Đang xem Bảng xếp hạng Waifu Tuần";
		presenceData.smallImageKey = "top";
	} else if (document.location.pathname.startsWith("/top-waifu.php")) {
		presenceData.details = "Đang xem Bảng xếp hạng Waifu";
		presenceData.smallImageKey = "top";
	} else if (document.location.pathname.startsWith("/top-waifu-idol.php")) {
		presenceData.details = "Đang xem Bảng xếp hạng Waifu Idol";
		presenceData.smallImageKey = "top";
	} else if (document.location.pathname.startsWith("/forum/user-")) {
		presenceData.details = "Đang xem tường Forum thành viên";
		presenceData.state = document
			.querySelector("h1[itemprop='name']")
			.textContent.trim();
		presenceData.smallImageKey = "tuongfr";
		presenceData.buttons = [
			{
				label: `Xem tường ${document
					.querySelector("h1[itemprop='name']")
					.textContent.trim()}`,
				url: document.URL
			}
		];
	} else if (document.location.pathname.startsWith("/user-")) {
		presenceData.details = "Đang xem tường Truyện thành viên";
		presenceData.state = document.querySelector("h2").textContent.trim();
		presenceData.smallImageKey = "tuongtr";
		presenceData.buttons = [
			{
				label: `Xem tường ${document.querySelector("h2").textContent.trim()}`,
				url: document.URL
			}
		];
	} else if (document.location.pathname.startsWith("/forum/edit_pass.php")) {
		presenceData.details = "Đang đổi mật khẩu...";
		presenceData.smallImageKey = "pass";
	} else if (document.location.pathname.startsWith("/avatar/profile.php")) {
		presenceData.details = "Đang đổi thông tin tài khoản...";
		presenceData.smallImageKey = "info";
	} else if (document.location.pathname.startsWith("/forum/edit_chuky.php")) {
		presenceData.details = "Đang đổi chữ kí...";
		presenceData.smallImageKey = "chuky";
	} else if (document.location.pathname.startsWith("/forum/edit_avatar.php")) {
		presenceData.details = "Đang đổi avatar...";
		presenceData.smallImageKey = "avt";
	} else if (document.location.pathname.startsWith("/forum/reply.php")) {
		presenceData.details = "Đang xem trả lời bình luận trong Forum...";
		presenceData.smallImageKey = "bell";
	} else if (document.location.pathname.startsWith("/inbox.php")) {
		if (document.location.search.includes("user")) {
			presenceData.details = document
				.querySelector("div[class='bar-title']")
				.textContent.trim();
			presenceData.smallImageKey = "chater";
		} else {
			if (document.location.search.includes("page"))
				page = new URLSearchParams(document.location.search).get("page");

			presenceData.details = "Đang xem danh sách tin nhắn";
			presenceData.state = `Trang ${page}`;
			presenceData.smallImageKey = "chat";
		}
	} else if (document.location.pathname.startsWith("/forum/donate.php")) {
		presenceData.details = `Đang ${document
			.querySelector("title")
			.textContent.trim()}`;
		presenceData.smallImageKey = "donate";
	} else if (document.location.pathname.startsWith("/forum/yen.php")) {
		presenceData.details = `Đang chuyển tiền cho thành viên ${document
			.querySelector("b")
			.textContent.trim()}`;
		presenceData.smallImageKey = "money";
	} else if (
		!document.location.pathname.startsWith("/forum/t") &&
		document.location.pathname.includes("-xem-truyen-")
	) {
		presenceData.details = `Đang đọc truyện "${document
			.querySelectorAll("span[itemprop='name']")[2]
			.textContent.trim()}"`;
		presenceData.state = document
			.querySelectorAll("span[itemprop='name']")[3]
			.textContent.trim();
		presenceData.smallImageKey = "doc";
		presenceData.buttons = [
			{
				label: "Đọc cùng",
				url: document.URL
			}
		];
	} else if (
		!document.location.pathname.startsWith("/forum/t") &&
		document.location.pathname.includes("-doc-truyen-")
	) {
		presenceData.details = `Đang xem thông tin truyện "${document
			.querySelectorAll("span[itemprop='name']")[2]
			.textContent.trim()}"`;
		presenceData.buttons = [
			{
				label: "Xem truyện",
				url: document.URL
			}
		];
		presenceData.smallImageKey = "xem";
	} else if (document.location.pathname.startsWith("/forum/t")) {
		presenceData.details = `Đang xem topic "${document
			.querySelectorAll("span[itemprop='name']")[3]
			.textContent.trim()}"`;
		presenceData.buttons = [
			{
				label: "Xem topic",
				url: document.URL
			}
		];
		presenceData.smallImageKey = "xem";
	} else if (document.location.pathname.startsWith("/g/")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = `Đang xem danh sách truyện của nhóm "${document
			.querySelectorAll("span[itemprop='name']")[2]
			.textContent.trim()}"`;
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "list";
	} else if (document.location.pathname === "/forum/") {
		presenceData.details = "Đang duyệt forum";
		presenceData.smallImageKey = "surf";
	} else if (document.location.pathname.startsWith("/forum/f")) {
		presenceData.details = `Đang duyệt box ${document
			.querySelectorAll("b")[0]
			.textContent.trim()}`;
		presenceData.smallImageKey = "surf";
	} else if (document.location.pathname.startsWith("/forum/c")) {
		largebox = document.querySelector("title").textContent.trim();
		largebox = largebox.substring(0, largebox.indexOf("-"));
		presenceData.details = `Đang duyệt danh mục ${largebox}`;
		presenceData.smallImageKey = "surf";
	} else if (document.location.pathname.startsWith("/forum/search-plus.php")) {
		presenceData.details = "Đang tìm kiếm truyện nâng cao";
		presenceData.smallImageKey = "search";
		if (document.location.search.includes("search")) {
			keyword = new URLSearchParams(document.location.search);
			namekey = keyword.get("name");
			doukey = keyword.get("dou");
			charkey = keyword.get("char");
			if (namekey.length === 0) namekey = "Trống";

			if (doukey.length === 0) doukey = "Trống";

			if (charkey.length === 0) charkey = "Trống";

			keystr = new URLSearchParams(document.location.search).getAll("tag[]");
			type keytest = {
				[key: string]: string;
			};
			const keynum: keytest = {
				3: "3D Hentai",
				5: "Action",
				116: "Adult",
				203: "Adventure",
				20: "Ahegao",
				21: "Anal",
				249: "Angel",
				131: "Ảnh động",
				127: "Animal",
				22: "Animal girl",
				279: "Áo Dài",
				277: "Apron",
				115: "Artist CG",
				130: "Based Game",
				257: "BBM",
				251: "BBW",
				24: "BDSM",
				25: "Bestiality",
				133: "Big Ass",
				23: "Big Boobs",
				32: "Big Penis",
				267: "Blackmail",
				27: "Bloomers",
				28: "BlowJobs",
				29: "Body Swap",
				30: "Bodysuit",
				254: "Bondage",
				33: "Breast Sucking",
				248: "BreastJobs",
				31: "Brocon",
				242: "Brother",
				241: "Business Suit",
				39: "Catgirls",
				101: "Che ít",
				129: "Che nhiều",
				34: "Cheating",
				35: "Chikan",
				271: "Chinese Dress",
				100: "Có che",
				36: "Comedy",
				120: "Comic",
				210: "Condom",
				38: "Cosplay",
				2: "Cousin",
				275: "Crotch Tatto",
				269: "Cunniligus",
				40: "Dark Skin",
				262: "Daughter",
				268: "Deepthroat",
				132: "Demon",
				212: "DemonGirl",
				104: "Devil",
				105: "DevilGirl",
				253: "Dirty",
				41: "Dirty Old Man",
				260: "DogGirl",
				42: "Double Penetrantion",
				44: "Doujinshi",
				4: "Drama",
				43: "Drug",
				45: "Ecchi",
				245: "Elder Sister",
				125: "Elf",
				46: "Exhibitionism",
				123: "Fantasy",
				243: "Father",
				47: "Femdom",
				48: "Fingering",
				108: "Footjob",
				259: "Foxgirls",
				37: "Full Color",
				202: "Furry",
				50: "Futanari",
				51: "GangBang",
				206: "Garter Belts",
				52: "Gender Bender",
				106: "Ghost",
				56: "Glasses",
				264: "Gothic Lolita",
				53: "Group",
				55: "Guro",
				247: "Hairy",
				57: "Handjob",
				58: "Harem",
				102: "HentaiVN",
				80: "Historical",
				122: "Horror",
				59: "Housewife",
				60: "Humiliation",
				61: "Idol",
				244: "Imoutp",
				62: "Incest",
				26: "Incest (Côn Trùng)",
				280: "Isekai",
				99: "Không che",
				110: "Kimono",
				265: "Kuudere",
				63: "Lolicon",
				64: "Maids",
				273: "Manhua",
				114: "Manhwa",
				65: "Masturbation",
				119: "Mature",
				124: "Miko",
				126: "Milf",
				121: "Mind Break",
				113: "Mind Control",
				263: "Mizugi",
				66: "Monster",
				67: "Monstegirl",
				103: "Mother",
				205: "Nakadashi",
				1: "Netori",
				201: "Non-hen",
				68: "NTR",
				272: "Nun",
				69: "Nurse",
				211: "Old Man",
				71: "Oneshot",
				70: "Oral",
				209: "Osananajimi",
				72: "Paizuri",
				204: "Pantyhose",
				276: "Ponytail",
				73: "Pregnant",
				98: "Rape",
				258: "Rimjob",
				117: "Romance",
				207: "Ryona",
				134: "Scat",
				74: "School Uniform",
				75: "SchoolGir",
				87: "Series",
				88: "Sex Toys",
				246: "Shimapan",
				118: "Short Hentai",
				77: "Shota",
				76: "Shoujo",
				79: "Siscon",
				78: "Sister",
				82: "Slave",
				213: "Sleeping",
				84: "Small Boobs",
				278: "Son",
				83: "Sports",
				81: "Stockings",
				85: "Supernatural",
				250: "Sweating",
				86: "Swimsuit",
				266: "Tall Girl",
				91: "Teacher",
				89: "Tentacles",
				109: "Time Stop",
				90: "Tomboy",
				252: "Tracksuit",
				256: "Transformation",
				92: "Trap",
				274: "Truyện Việt",
				111: "Tsundere",
				93: "Twins",
				261: "Twintails",
				107: "Vampire",
				208: "Vanilla",
				95: "Virgin",
				270: "Webtoon",
				94: "X-ray",
				112: "Yandere",
				96: "Yaoi",
				97: "Yuri",
				128: "Zombie"
			};
			keystr = keystr
				.toString()
				.replace(
					/\b(?:3|5|116|203|20|21|249|131|127|22|279|277|115|130|257|251|24|25|133|23|32|267|27|28|29|30|254|33|248|31|242|241|39|101|129|34|35|271|100|36|120|210|38|2|275|269|40|262|268|132|212|104|105|253|41|260|42|44|4|43|45|245|125|46|123|243|47|48|108|259|37|202|50|51|206|52|106|56|264|53|55|247|57|58|102|80|122|59|60|61|244|62|26|280|99|110|265|63|64|273|114|65|119|124|126|121|113|263|66|67|103|205|1|201|68|272|69|211|71|70|209|72|204|276|73|98|258|117|207|134|74|75|87|88|246|118|77|76|79|78|82|213|84|278|83|81|85|250|86|266|91|89|109|90|252|256|92|274|111|93|261|107|208|95|270|94|112|96|97|128)\b/gi,
					matched => keynum[matched]
				);
			presenceData.state = `Từ khóa: ${namekey} - Doujin: ${doukey} - Nhân vật: ${charkey} - Thể loại: ${keystr}`;
		} else presenceData.state = "Đang nhập dữ liệu tìm kiếm...";
	} else if (document.location.pathname.startsWith("/forum/nhan_tin.php")) {
		presenceData.details = "Đang nhắn tin...";
		presenceData.state = document.querySelector("h3").textContent.trim();
		presenceData.smallImageKey = "chater";
	} else if (document.location.pathname.startsWith("/forum/mail.php")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = "Đang xem hộp thư...";
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "chat";
	} else if (document.location.pathname.startsWith("/forum/free-market.php")) {
		presenceData.details = "Đang lướt chợ tự do...";
		presenceData.smallImageKey = "shop";
	} else if (document.location.pathname.startsWith("/forum/shop.php")) {
		presenceData.details = "Đang lướt shop...";
		presenceData.smallImageKey = "shop";
	} else if (document.location.pathname.startsWith("/forum/user_item.php")) {
		presenceData.details = "Đang xem kho đồ cá nhân...";
		presenceData.smallImageKey = "kho";
	} else if (
		document.location.pathname.startsWith("/forum/search_member.php")
	) {
		presenceData.details = "Đang tìm kiếm thành viên...";
		presenceData.smallImageKey = "search";
	} else if (document.location.pathname.startsWith("/forum/member.php")) {
		presenceData.details = "Đang xem danh sách thành viên...";
		presenceData.smallImageKey = "surf";
	} else if (document.location.pathname.startsWith("/admin/admin.php")) {
		presenceData.details = "Trong trang quản trị truyện...";
		presenceData.smallImageKey = "up";
	} else if (document.location.pathname.startsWith("/bookmark-list.php")) {
		if (document.location.search.includes("page"))
			page = new URLSearchParams(document.location.search).get("page");

		presenceData.details = "Đang xem danh sách truyện đang theo dõi";
		presenceData.state = `Trang ${page}`;
		presenceData.smallImageKey = "mark";
	} else if (document.location.pathname.startsWith("/forum/huyhieu.php")) {
		presenceData.details = "Đang xem phòng trưng bày huy hiệu";
		presenceData.smallImageKey = "huyhieu";
	} else if (document.location.pathname.startsWith("/forum/my_waifu.php")) {
		presenceData.details = "Đang xem danh sách waifu cá nhân";
		presenceData.smallImageKey = "waifu";
	} else if (document.location.pathname.startsWith("/forum/home_waifu.php")) {
		presenceData.details = "Đang lướt shop nhà waifu...";
		presenceData.smallImageKey = "shop";
	} else if (document.location.pathname.startsWith("/register.php")) {
		presenceData.details = "Đang đăng ký tài khoản...";
		presenceData.smallImageKey = "notlog";
	} else if (document.location.pathname.startsWith("/login.php")) {
		presenceData.details = "Đang đăng nhập...";
		presenceData.smallImageKey = "notlog";
	} else if (document.location.pathname.startsWith("/forgot-password.php")) {
		presenceData.details = "Đang lấy lại mật khẩu...";
		presenceData.smallImageKey = "notlog";
	} else if (document.location.pathname.startsWith("/notification-reply.php")) {
		presenceData.details = "Đang xem trả lời bình luận trong cổng truyện...";
		presenceData.smallImageKey = "chater";
	} else if (
		document.location.pathname.startsWith("/notification-comment.php")
	) {
		presenceData.details = "Đang xem bình luận trong cổng truyện...";
		presenceData.smallImageKey = "bell";
	} else if (document.location.pathname.startsWith("/forum/new_topic.php")) {
		presenceData.details = "Đang tạo chủ đề mới...";
		presenceData.smallImageKey = "topic";
	}
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});

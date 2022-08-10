/* eslint-disable quotes */

const presence = new Presence({
		clientId: '1006869424441131109',
	}),
	browsingTimestamp: number = Math.floor(Date.now() / 1000),
	presenceData: PresenceData = {
		largeImageKey: 'ns',
		startTimestamp: browsingTimestamp,
	};

/**
 * Get full nation name of the logged in user.
 * @returns {Promise<string|null>} Nation full name (ex. "America, United States of") or null if not logged in.
 * @see https://www.nationstates.net/pages/api.html#nationapi
 */
async function fetchSelfNationName (): Promise<string | null> {
	// Check if user is logged in
	if (document.body.id !== 'loggedin') return null;

	// Get ID of the logged in user
	const username: string = document.body.getAttribute('data-nname');
	if (!username) return null;

	// Fetch nation data using NationStates API
	const nationdata = await fetch(
		`https://www.nationstates.net/cgi-bin/api.cgi?nation=${username}&q=name+type&v=2`
	);
	if (!nationdata.ok) return null;

	// Parse nation name and classification
	const nationparsed = new DOMParser().parseFromString(
			await nationdata.text(),
			'text/html'
		),
		nationname = nationparsed.querySelector('NAME').textContent,
		nationtype = `${nationparsed.querySelector('TYPE').textContent} of`,
		displayFull: boolean = await presence.getSetting('displayFull');

	if (nationname.length + nationtype.length + 2 <= 128 && displayFull)
		return `${nationname}, ${nationtype}`;
	else if (nationname.length <= 128) return nationname;
	else return null;
}

/**
 * Get the (short) name of a nation.
 * @param id Nation ID
 * @returns {Promise<string|null>} Nation name or null if not found.
 * @see https://www.nationstates.net/pages/api.html#nationapi
 */
async function fetchNationName (id: string): Promise<string | null> {
	// Fetch nation data using NationStates API
	const nationdata = await fetch(
		`https://www.nationstates.net/cgi-bin/api.cgi?nation=${id}&q=name&v=2`
	);
	if (!nationdata.ok) return null;

	// Parse nation name
	const nationname = new DOMParser()
		.parseFromString(await nationdata.text(), 'text/html')
		.querySelector('NAME').textContent;

	if (nationname.length + 16 <= 128) return nationname;
	else return `${nationname.substring(0, 128 - 17)}…`;
}

/**
 * Get the name of a region.
 * @param id Region ID
 * @returns {Promise<string|null>} Region name or null if not found.
 * @see https://www.nationstates.net/pages/api.html#regionapi
 */
async function fetchRegionName (id: string): Promise<string | null> {
	// Fetch region data using NationStates API
	const regiondata = await fetch(
		`https://www.nationstates.net/cgi-bin/api.cgi?region=${id}&q=name&v=2`
	);
	if (!regiondata.ok) return null;

	// Parse region name
	const regionname = new DOMParser()
		.parseFromString(await regiondata.text(), 'text/html')
		.querySelector('NAME').textContent;

	if (regionname.length + 16 <= 128) return regionname;
	else return `${regionname.substring(0, 128 - 17)}…`;
}

/**
 * Update all presence data (with interval of 10 seconds).
 * @returns {Promise<void>}
 */
async function updatePresenceData (): Promise<void> {
	// Main website (nationstates.net)
	if (document.location.hostname === 'www.nationstates.net') {
		// Set presence details to the logged in nation name (leave blank if not logged in)
		presenceData.details = await fetchSelfNationName();
		// Set presence state to the current page
		const page = window.location.pathname.toLowerCase();
		if (page.startsWith('/page=dilemmas')) {
			// Browsing issues
			presenceData.state = 'Addressing Issues';
			presenceData.smallImageKey = 'person_white';
			presenceData.smallImageText = 'Issues';
		} else if (page.startsWith('/page=show_dilemma')) {
			// Issue (viewing)
			const issuename = document
				.querySelector('#content')
				?.querySelector('.dpaper4')?.textContent;
			if (issuename) {
				presenceData.state = `Issue: ${
					issuename.length > 128 - 7
						? `${issuename.substring(0, 128 - 7)}…'`
						: issuename
				}`;
			} else presenceData.state = 'Addressing Issues';
			presenceData.smallImageKey = 'person_white';
			presenceData.smallImageText = 'Issues';
		} else if (page.startsWith('/page=enact_dilemma')) {
			// Issue (resolved)
			const issuename = document
				.querySelector('#dlegislationtext')
				?.querySelector('p.dtitle')?.textContent;
			if (issuename) {
				presenceData.state = `Issue: ${
					issuename.length > 128 - 7
						? `${issuename.substring(0, 128 - 7)}…'`
						: issuename
				}`;
			} else presenceData.state = 'Addressing Issues';
			presenceData.smallImageKey = 'person_white';
			presenceData.smallImageText = 'Issues';
		} else if (
			page.startsWith('/page=telegram') ||
			page.startsWith('/page=tg') ||
			page.startsWith('/page=compose_telegram') ||
			page.startsWith('/page=notice') ||
			page.startsWith('/page=subscriptions')
		) {
			// Telegrams
			presenceData.state = 'Reading Telegrams';
			presenceData.smallImageKey = 'envelope_white';
			presenceData.smallImageText = 'Telegrams';
		} else if (
			page.startsWith('/page=settings') ||
			page.startsWith('/page=banners') ||
			page.startsWith('/page=upload_flag')
		) {
			// Settings
			presenceData.state = 'Tweaking the Nation';
			presenceData.smallImageKey = null;
		} else if (page.startsWith('/page=create_nation')) {
			// Nation creation
			presenceData.state = 'Declaring a New Nation';
			presenceData.smallImageKey = 'flag_white';
			presenceData.smallImageText = 'My Nation';
		} else if (
			page.startsWith('/page=ga') ||
			page.startsWith('/page=un_proposal/council=1') ||
			page.startsWith('/page=wa_past_resolutions/council=1')
		) {
			// General Assembly
			presenceData.state = 'Attending the General Assembly';
			presenceData.smallImageKey = 'wa_white';
			presenceData.smallImageText = 'World Assembly';
		} else if (
			page.startsWith('/page=sa') ||
			page.startsWith('/page=un_proposal/council=2') ||
			page.startsWith('/page=wa_past_resolutions/council=2')
		) {
			// Security Council
			presenceData.state = 'Attending the Security Council';
			presenceData.smallImageKey = 'wa_white';
			presenceData.smallImageText = 'World Assembly';
		} else if (
			page.startsWith('/page=wa') ||
			page.startsWith('/page=un') ||
			page.startsWith('/page=list_un')
		) {
			// World Assembly
			presenceData.state = 'Attending the World Assembly';
			presenceData.smallImageKey = 'wa_white';
			presenceData.smallImageText = 'World Assembly';
		} else if (page.startsWith('/nation=')) {
			// Nation page

			const nationid: string = page.match(/(?<=\/nation=)\w+/gi)[0];
			if (nationid === document.body.getAttribute('data-nname')) {
				// Self nation page
				presenceData.state = 'Viewing Nation';
				presenceData.smallImageKey = 'flag_white';
				presenceData.smallImageText = 'My Nation';
			} else {
				// Other nation page
				presenceData.state = `Viewing Nation: ${await fetchNationName(
					nationid
				)}`;
				presenceData.smallImageKey = 'globe_white';
				presenceData.smallImageText = 'World';
			}
		} else if (page.startsWith('/region=')) {
			// Region page
			presenceData.state = `Viewing Region: ${await fetchRegionName(
				page.match(/(?<=\/region=)\w+/gi)[0]
			)}`;
			presenceData.smallImageKey = 'globe_white';
			presenceData.smallImageText = 'World';
		} else if (page.startsWith('/page=dispatches')) {
			// Dispatches
			presenceData.state = 'Browsing Dispatches';
			presenceData.smallImageKey = 'news_white';
			presenceData.smallImageText = 'Dispatches';
		} else if (page.startsWith('/page=news')) {
			// News
			presenceData.state = 'Reading News';
			presenceData.smallImageKey = 'news_white';
			presenceData.smallImageText = 'News';
		} else if (page.startsWith('/page=dispatch')) {
			// Reading a dispatch
			presenceData.smallImageKey = 'news_white';
			presenceData.smallImageText = 'Dispatches';
			let title = document
				.querySelector('#content')
				?.querySelector('.dispatch')
				?.querySelector('h2')?.textContent;
			if (title && title.length > 1) {
				if (title.length > 128 - 18) title = `${title.substring(0, 128 - 19)}…`;
				presenceData.state = `Reading Dispatch: ${title}`;
			} else presenceData.state = 'Reading a Dispatch';
		} else if (page.startsWith('/page=create_dispatch')) {
			// Writing a dispatch
			presenceData.state = 'Writing Dispatch';
			presenceData.smallImageKey = 'news_white';
			presenceData.smallImageText = 'Dispatches';
		} else if (
			page.startsWith('/page=store') ||
			page.startsWith('/page=cart') ||
			page.startsWith('/page=orders')
		) {
			// Store
			presenceData.state = 'Browsing the Store';
			presenceData.smallImageKey = 'gift_white';
			presenceData.smallImageText = 'Store';
		} else {
			// Other
			presenceData.state = 'Browsing';
			presenceData.smallImageKey = null;
		}
	} else if (document.location.hostname === 'forum.nationstates.net') {
		// Forums (forum.nationstates.net)
		presenceData.details = 'Browsing Forums';
		presenceData.smallImageKey = 'forum_white';
		presenceData.smallImageText = 'Forums';
		const { title } = document;
		if (title.startsWith('NationStates • View')) {
			const topicsearch = title.match(/(?<=nationstates\s•\sview\s).+/gi);
			if (topicsearch) {
				let topic = topicsearch[0];
				topic = topic.charAt(0).toUpperCase() + topic.slice(1);
				if (topic.length > 128) topic = `${topic.substring(0, 128)}…`;
				presenceData.state = topic;
			}
		}
	} else {
		presenceData.state = null;
		presenceData.details = null;
	}
}
setInterval(updatePresenceData, 10000);

presence.on('UpdateData', async () => {
	if (presenceData.state || presenceData.details)
		presence.setActivity(presenceData);
});

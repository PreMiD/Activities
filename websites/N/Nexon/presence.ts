import { Assets } from 'premid';

const presence = new Presence({
	clientId: '1235934849085345877',
});

let prevURL: string,
	browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets { // Other default assets can be found at index.d.ts
	AirlinesLogo = 'https://i.imgur.com/qzVtg9J.png',
	Logo = 'https://i.imgur.com/wlrkuSA.jpeg',
}

presence.on('UpdateData', async () => {
	const { pathname, hostname, href } = document.location,
		presenceData: PresenceData = {
			largeImageKey: hostname?.includes('airlines')
				? ActivityAssets.AirlinesLogo
				: ActivityAssets.Logo,
			startTimestamp: browsingTimestamp,
		},
		[buttons, showCover] = await Promise.all([
			presence.getSetting('buttons'),
			presence.getSetting('cover'),
		]);

	if (!prevURL) prevURL = href;
	else if (prevURL !== href) browsingTimestamp = Math.floor(Date.now() / 1000);

	switch (hostname) {
		case 'nexonlogistics.com': {
			switch (true) {
				case pathname === '/': {
					presenceData.state = 'Viewing the homepage';
					break;
				}
				case pathname === '/about.html': {
					presenceData.state = 'Viewing the about section';
					break;
				}
				case pathname === '/team.html': {
					presenceData.state = 'Viewing the team';
					break;
				}
				case pathname === '/rules.html': {
					presenceData.state = 'Reading the rules';
					presenceData.smallImageKey = Assets.Reading;
					presenceData.buttons = [{ label: 'Read The Rules', url: href }];
					break;
				}
				case pathname === '/gallery.html': {
					const totalPages = document.querySelectorAll('.btn.log.gray');
					presenceData.state = `Viewing the gallery - Page ${document.querySelector('.btn.log.active')?.textContent}/${totalPages[totalPages.length - 1]?.textContent}`;
					presenceData.buttons = [{ label: 'View Images', url: href }];
					break;
				}
				case pathname === '/convoy.html': {
					presenceData.state = 'Viewing all events';
					presenceData.buttons = [{ label: 'View All Events', url: href }];
					break;
				}
				case pathname.includes('/events/'): {
					presenceData.details = 'Nexon logistics - Viewing event:';
					presenceData.state = document.querySelector('.wel')?.textContent;
					presenceData.buttons = [{ label: 'View Event', url: href }];
					break;
				}
				case pathname === '/news.html': {
					presenceData.state = `Viewing all news`;
					presenceData.buttons = [
						{ label: 'View All News Articles', url: href },
					];
					break;
				}
				case pathname.includes('/news/'): {
					presenceData.details = 'Nexon logistics - Reading news article about';
					presenceData.state =
						document.querySelector('.text-uppercase')?.textContent;
					presenceData.smallImageKey = Assets.Reading;
					presenceData.smallImageText = `Published by: ${document.querySelector('strong')?.textContent}`;
					presenceData.buttons = [{ label: 'Read News Article', url: href }];
				}
			}
			if (!presenceData.details) presenceData.details = 'Nexon logistics';
			break;
		}
		case 'shop.nexonlogistics.com': {
			switch (true) {
				case pathname === '/index.html':
				case pathname === '/': {
					presenceData.details = "Nexon logistics' shop";
					presenceData.state = 'Viewing the homepage';
					break;
				}
				case pathname === '/product.html': {
					presenceData.details = "Nexon logistics' shop";
					presenceData.state = 'Viewing all products';
					break;
				}
				case pathname === '/contact.html': {
					presenceData.details = "Nexon logistics' shop";
					presenceData.state = 'Viewing the contact page';
					break;
				}
				case !!document.querySelector('.product_section'): {
					presenceData.details = "Nexon logistics' shop - Viewing product";
					presenceData.state =
						document.querySelector('.product_section')?.textContent;
					presenceData.buttons = [{ label: 'View Product', url: href }];
					presenceData.largeImageKey =
						document.querySelector<HTMLImageElement>('[alt="IMG-PRODUCT"]')
							?.src ?? ActivityAssets.Logo;
					break;
				}
				case !!document.querySelector('.text-uppercase'):
					{
						presenceData.details = "Nexon Logistics' shop";
						presenceData.state = `Reading the ${document
							.querySelector('.text-uppercase')
							?.textContent?.toLowerCase()}`;
						presenceData.smallImageKey = Assets.Reading;
					}
					break;
			}
		}
		case 'hub.nexonlogistics.com': {
			switch (true) {
				case !!document.querySelector('.menu-item.active'): {
					presenceData.state = `Viewing ${document.querySelector('.menu-item.active')?.textContent}`;
					break;
				}
				case pathname === '/banners': {
					presenceData.state = 'Viewing all banners';
					break;
				}
				case pathname.includes('/profile/'): {
					presenceData.details =
						"Nexon logistics' driverhub - Viewing profile of:";
					presenceData.state =
						document.querySelector('.user-info')?.textContent;
					presenceData.largeImageKey =
						document
							.querySelector<HTMLImageElement>('.user-avatar-section')
							?.querySelector('img')?.src ?? ActivityAssets.Logo;
					break;
				}
				case pathname.includes('/jobs/'): {
					presenceData.details = "Nexon logistics' driverhub - Viewing job:";
					presenceData.state = document
						.querySelector('title')
						?.textContent?.split(' |')?.[0];
					presenceData.largeImageKey =
						document
							.querySelector<HTMLImageElement>('.user-avatar-section')
							?.querySelector('img')?.src ?? ActivityAssets.Logo;
				}
			}
			if (!presenceData.details)
				presenceData.details = "Nexon logistics' driverhub";
			break;
		}
		case 'map.nexonlogistics.com': {
			switch (true) {
				case pathname === '/': {
					presenceData.state = 'Viewing all maps';
					break;
				}
				case pathname.includes('/ets2'): {
					presenceData.state = 'Viewing the euro truck simulator 2 map';
					break;
				}
				case pathname.includes('/ats'): {
					presenceData.state = 'Viewing the american truck simulator map';
					break;
				}
				case pathname.includes('/tmp'): {
					presenceData.state = 'Viewing the truckers mp map';
					break;
				}
				case pathname.includes('/ets2promods'): {
					presenceData.state = 'Viewing the promods map';
					break;
				}
				case pathname.includes('/atspromods'): {
					presenceData.state = 'Viewing the canadian promods map';
					break;
				}
			}
			if (!presenceData.details) presenceData.details = 'Nexon logistics';
			break;
		}
		case 'nexonairlines.com': {
			switch (true) {
				case !!document.querySelector('.active'): {
					presenceData.state = `Viewing ${document
						.querySelector('.active')
						?.textContent?.toLowerCase()}`;
					break;
				}
				case pathname === '/': {
					presenceData.state = 'Viewing the homepage';
					break;
				}
				case pathname === '/about.html': {
					presenceData.state = 'Viewing the about section';
					break;
				}
				case pathname === '/register.html': {
					presenceData.state = 'Viewing the registration form';
					break;
				}
			}
			if (!presenceData.details) presenceData.details = 'Nexon airlines';
			break;
		}
		case 'map.nexonairlines.com': {
			break;
		}
	}
	if (!buttons && presenceData.buttons) delete presenceData.buttons;
	if (
		!showCover &&
		!ActivityAssets[presenceData.largeImageKey as keyof typeof ActivityAssets]
	) {
		presenceData.largeImageKey = hostname.includes('airlines')
			? ActivityAssets.AirlinesLogo
			: ActivityAssets.Logo;
	}
	presence.setActivity(presenceData);
});

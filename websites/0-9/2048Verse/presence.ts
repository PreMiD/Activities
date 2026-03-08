const presence = new Presence({
  clientId: '939893158777618432',
});
const browsingTimestamp = Math.floor(Date.now() / 1000);

enum ActivityAssets {
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/0-9/2048Verse/assets/logo.png',
};

presence.on('UpdateData', async () => {
  const [time, buttons] = await Promise.all([
    presence.getSetting<boolean>('time'),
    presence.getSetting<boolean>('buttons'),
  ]);
  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    startTimestamp: browsingTimestamp,
  };
  const { pathname, href } = document.location;
  const board = document.querySelector('.board');
  let gridSize = "";
  if (board) {
    const computedStyle = window.getComputedStyle(board);
    gridSize = `${computedStyle.getPropertyValue('--board-height')}x${
      computedStyle.getPropertyValue('--board-width')}`;
  }
  if (pathname.split('/')[1] === 'leaderboard') {
    let leaderboardType;
    const variant = pathname.split('/')[2];
    switch (pathname.split('/')[3]) {
      case 'all': {
        leaderboardType = 'All Time';
        break;
      }
      case 'day': {
        leaderboardType = 'Today';
        break;
      }
      case 'week': {
        leaderboardType = 'Week';
        break;
      }
    }
    presenceData.details = 'Viewing leaderboard';
    presenceData.state = `${variant} ${leaderboardType}`;
  }
  else if (pathname.split('/')[1] === 'user') {
    presenceData.details = 'Viewing profile';
    presenceData.state = pathname.split('/')[2];
    presenceData.buttons = [{ label: 'View Profile', url: href }];
  }
  else if (pathname.split('/')[1] === 'replay') {
    presenceData.details = `Watching replay ${gridSize}`;
    presenceData.state = `Score ${
      document.querySelector('#SCORE .info-value')?.textContent
    }`;
  }
  else if (pathname.split('/')[1] === 'p') {
    presenceData.details = `Practicing ${gridSize}`;
  }
  else if (pathname.split('/')[1] === 'lessons') {
    presenceData.details = 'Browsing lessons';
  }
  else if (pathname.split('/')[1] === 'settings') {
    presenceData.details = 'Changing settings';
  }
  else if (board) {
    presenceData.details = `Playing ${gridSize}`;

    presenceData.state = `Score ${
        document.querySelector('#SCORE .info-value')?.textContent
    } Best ${document.querySelector('#BEST .info-value')?.textContent}`;
  }

  if (!time)
    delete presenceData.startTimestamp;

  if (!buttons && presenceData.buttons)
    delete presenceData.buttons;

  presence.setActivity(presenceData);
});

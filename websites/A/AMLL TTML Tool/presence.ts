const presence = new Presence({
  clientId: '1430013369792073810'
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

const ActivityAssets = {
  Logo: 'https://i.imgur.com/uJCrE0J.png'
};

const modeTextMap: Record<string, string> = {
  'Edit Mode': 'Editing lyrics',
  'Sync Mode': 'Syncing lyrics',
  'Preview Mode': 'Previewing lyrics'
};

function updatePresence() {
  const { pathname } = document.location;

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: 'Using AMLL TTML Tool',
    startTimestamp: browsingTimestamp
  };

  if (pathname === '/amll-ttml-tool-english/' || pathname === '/') {
    const input = document.querySelector<HTMLInputElement>('.rt-TextFieldInput');
    if (input && input.value.trim() !== '') {
      presenceData.details = `File: ${input.value.trim()}`;
    }

    const activeButton = document.querySelector<HTMLButtonElement>('.rt-SegmentedControlItem[data-state="on"]');
    if (activeButton) {
      const modeLabel = activeButton.querySelector<HTMLSpanElement>('.rt-SegmentedControlItemLabelActive')?.textContent?.trim();
      if (modeLabel && modeTextMap[modeLabel]) {
        presenceData.state = modeTextMap[modeLabel];
      } else {
        presenceData.state = 'On the main page';
      }
    }
  }

  presence.setActivity(presenceData);
}

presence.on('UpdateData', updatePresence);

document.querySelectorAll('.rt-SegmentedControlItem').forEach(btn => {
  btn.addEventListener('click', updatePresence);
});

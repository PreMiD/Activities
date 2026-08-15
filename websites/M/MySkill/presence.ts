const presence = new Presence({
    clientId: '1538130215195381790' // Tetap pakai ID aplikasi dari web Discord Developer
});

const browsingTimestamp = Math.floor(Date.now() / 1000);

presence.on('UpdateData', async () => {
    const courseElement = document.querySelector('h1.chakra-heading');
    const courseTitle = courseElement?.textContent;

    if (courseTitle) {
        const presenceData: PresenceData = {
            largeImageKey: 'https://i.imgur.com/oRZP3Px.png', // <-- Masukkan link direct Imgur di sini
            startTimestamp: browsingTimestamp,
            details: `Belajar: ${courseTitle}`,
            state: 'MySkill E-Learning'
        };
        presence.setActivity(presenceData);
    } else {
        presence.setActivity();
    }
});
function getElementByXPath(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

module.exports = async function () {
    const titleElement = getElementByXPath('//*[@id="root"]/div/div/div[1]/div/h1');
    const animeTitle = titleElement ? titleElement.innerText.trim() : 'Watching anime';

    const episodeElement = getElementByXPath('//*[@id="root"]/div/div/div[1]/div/div/span[4]');
    const episodeTitle = episodeElement ? episodeElement.innerText.trim() : '';

    const video = document.querySelector('video');

    let startTimestamp = null;
    let endTimestamp = null;

    if (video) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        const now = Date.now();

        startTimestamp = now - currentTime * 1000;
        endTimestamp = now + (duration - currentTime) * 1000;
    }

    return {
        details: `Watching ${animeTitle}`,
        state: episodeTitle ? `Episode ${episodeTitle}` : '',
        largeImageKey: 'hikari',
        largeImageText: 'Hikari.gg',
        startTimestamp,
        endTimestamp
    };
};
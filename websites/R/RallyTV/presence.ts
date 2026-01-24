(async () => {
  console.log("PreMiD: Rally.TV Presence Script Loaded");

  const presence = new Presence("1464394386170446077");
  let lastTitle = "";

  // This function handles the scraping and updating
  const updatePresence = () => {
    const liveContainer = document.querySelector(".live");
    const titleElement = liveContainer?.querySelector("p span");
    
    let fullTitle = titleElement ? titleElement.textContent.trim() : "Browsing Events";
    fullTitle = fullTitle.replace(/^['"]+|['"]+$/g, "");

    if (fullTitle !== lastTitle) {
      const parts = fullTitle.split("|").map(p => p.trim());
      let detailsText = parts[0];
      let stateText = parts[1] || "";

      if (parts.length === 1) {
        detailsText = fullTitle;
        stateText = ""; 
      }

      const presenceData = {
        type: 3, // "Watching"
        details: detailsText,
        state: stateText,
        largeImageKey: "logo"
      };

      console.log(`PreMiD: Auto-Updating -> ${detailsText}`);
      presence.setActivity(presenceData);
      lastTitle = fullTitle;
    }
  };

  // Run immediately on load
  updatePresence();

  // Check every 10 seconds for changes (Live card jumps, etc.)
  setInterval(updatePresence, 10000);
})();

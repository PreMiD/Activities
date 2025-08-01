// --- State Management Variables ---
let currentChapterId: string | null = null;
let chapterStartTimestamp: number | null = null;
let mangaTitleCache: string | null = null;
let chapterNumberCache: string | null = null;
let chapterTitleCache: string | null = null;
let totalPagesCache: number | null = null;

const presence = new Presence({
  clientId: '1400869648680878271'
});


//Stop showing activity while not reading
presence.on('UpdateData', async () => {
  try {
    const { pathname } = window.location;
    const pathParts = pathname.split('/');
    
    if (pathParts[1] !== 'chapter') {

      if (currentChapterId !== null) {
        presence.setActivity();
        
        // Reset all variables to ensure a clean state.
        currentChapterId = null;
        mangaTitleCache = null;
        totalPagesCache = null;
        chapterStartTimestamp = null;
        chapterNumberCache = null;
        chapterTitleCache = null;
      }
      return; //Stop the function
    }
    
    
    
    const newChapterId = pathParts[2];
    const currentPage = pathParts[3] || '1';

    if (!newChapterId) {
      if (currentChapterId !== null) {
        presence.setActivity();
        currentChapterId = null;
        mangaTitleCache = null;
        totalPagesCache = null;
        chapterStartTimestamp = null;
        chapterNumberCache = null;
        chapterTitleCache = null;
      }
      return;
    }

    // --- Timer and API Logic ---
    if (newChapterId !== currentChapterId) {
      currentChapterId = newChapterId;
      chapterStartTimestamp = Math.floor(Date.now() / 1000);
      
      const chapterResponse = await fetch(`https://api.mangadex.org/chapter/${currentChapterId}?includes[]=manga`, {
        headers: {
          'Referer': 'https://mangadex.org/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      
      const chapterData = await chapterResponse.json();

      if (chapterData.result === 'ok' && chapterData.data) {
        const mangaRelationship = chapterData.data.relationships.find((rel: { type: string }) => rel.type === 'manga');
        if (mangaRelationship && mangaRelationship.attributes) {
          mangaTitleCache = mangaRelationship.attributes.title.en || Object.values(mangaRelationship.attributes.title)[0];
          totalPagesCache = chapterData.data.attributes.pages;
          chapterNumberCache = chapterData.data.attributes.chapter;
          chapterTitleCache = chapterData.data.attributes.title;
        }
      }
    }

    // --- Presence Update Logic ---
    if (mangaTitleCache && totalPagesCache && chapterStartTimestamp && chapterNumberCache) {
      const detailsText = `${mangaTitleCache}  — Page ${currentPage} / ${totalPagesCache}`;
      const stateText = `Ch. ${chapterNumberCache}${chapterTitleCache ? `: ${chapterTitleCache}` : ''}`;

      const presenceData: PresenceData = {
        largeImageKey: 'logo',
        details: detailsText,
        state: stateText,
        startTimestamp: chapterStartTimestamp
      };

      presence.setActivity(presenceData);
    }

  } catch (error) {
    console.error('PreMiD: A critical error occurred:', error);
  }
});
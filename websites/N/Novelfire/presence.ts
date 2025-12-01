import { ActivityType } from 'premid';

const presence = new Presence({
  clientId: '1445066378527772684'
});

let browsingTimestamp = Number(window.sessionStorage.getItem('novelfire_start_time'));  

if (!browsingTimestamp) {
  browsingTimestamp = Math.floor(Date.now() / 1000);
  window.sessionStorage.setItem('novelfire_start_time', browsingTimestamp.toString());
}


async function fetchCover(bookUrl: string): Promise<string | null> {
  // If we already found it before, return the saved one immediately
  if (window.localStorage.getItem(bookUrl)) return window.localStorage.getItem(bookUrl);
  console.log(bookUrl)

  try {
    // 1. Fetch the HTML of the book info page
    const response = await fetch(bookUrl);
    const htmlText = await response.text();

    // 2. Parse the text into a fake HTML document we can search
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // 3. Find the image using the selector you found earlier
    const coverImg = doc.querySelector('.cover img') || doc.querySelector('.cover');
    
    if (coverImg) {
      let src = coverImg.getAttribute('data-src') || coverImg.getAttribute('src');
      
      // Fix relative URLs
      if (src && src.startsWith('/')) {
        src = document.location.origin + src;
      }
      
      // Save to cache and return
      if (src && src.startsWith('http') && !src.includes('data:image')) {
        window.localStorage.setItem(bookUrl, src);
        return src;
      }
    }
  } catch (e) {
    console.error('PreMiD: Could not fetch cover', e);
  }
  return null;
}

presence.on('UpdateData', async () => {
  const presenceData: PresenceData = {
    largeImageKey: 'https://snipboard.io/vogSIZ.jpg',
    startTimestamp: browsingTimestamp,
    name: 'Novelfire',
    type: ActivityType.Watching,
  };

  const { pathname, href, origin } = window.location;
  
  const [buttons] = await Promise.all([
    presence.getSetting<boolean>('buttons'),
  ])

  // --Web Pages--

  // 1. Search Page
  if (pathname === '/search' ) {
      const searchInput = document.querySelector<HTMLInputElement>('#inputContent')
      presenceData.details = 'Searching...';
      if (searchInput && searchInput.value) {
      presenceData.state = `Query: ${searchInput.value}`;
    }
      presenceData.largeImageKey = 'https://snipboard.io/vogSIZ.jpg';
  }

  // 2. Homepage
  else if (pathname === '/' || pathname === '/home') {
      presenceData.details = 'Home';
      presenceData.state = 'Browsing the homepage';
  }
  
  // 3. Rankings Page
  else if (pathname === '/ranking' || pathname.includes('/ranking/')) {
      presenceData.details = 'Rankings';
      presenceData.state = 'Viewing Novel Rankings';
  }
  
  // 4. Members List
  else if (pathname === '/user/member-list') {
      const searchInput = document.querySelector<HTMLInputElement>('input[name="keyword"]')
      if (searchInput && searchInput?.value) {
      presenceData.details = 'Members List';
      presenceData.state = `Searching For Member: ${searchInput.value}`;
      }
      else {
      presenceData.details = 'Members List';
      presenceData.state = 'Viewing Members List';
    } 
  }

  // 5. Latest Novel releases
  else if (pathname === '/latest-release-novels') {
      presenceData.details = 'Latest Releases';
      presenceData.state = 'Viewing Latest Releases';
  }

  // 6. Advanced Search Page
  else if (pathname === '/search-adv') {
      presenceData.details = 'Searching...';
      presenceData.state = 'Searching for Novels';
  }

  // 7. Profile Page
  else if (pathname === '/account/profile' || pathname === '/account/comments' || pathname === '/account/history' || pathname === '/account/reviews') {
      presenceData.details = 'Profile';
      presenceData.state = 'Viewing His Profile';

      const avatar = document.querySelector('#avatarimg')

      if (avatar){
        const src = avatar?.getAttribute('data-src') || avatar?.getAttribute('src')
        if (src) {presenceData.largeImageKey = src}
      }
      
      if (buttons) {
              presenceData.buttons = [{ label: 'View Profile', url: href }];
          }
  }

  // 8. Library
  else if (pathname === '/account/library') {
      presenceData.details = 'Library';
      presenceData.state = 'Viewing His Library';

      const avatar = document.querySelector('#avatarimg')

      if (avatar){
        const src = avatar?.getAttribute('data-src') || avatar?.getAttribute('src')
        if (src) {presenceData.largeImageKey = src}
      }
      
      if (buttons) {
              presenceData.buttons = [{ label: 'View Profile', url: href }];
          }
  }
  
  // 9. Inbox
  else if (pathname === '/account/inbox') {
      presenceData.details = 'Inbox';
      presenceData.state = 'Checking His Inbox';

      const avatar = document.querySelector('#avatarimg')

      if (avatar){
        const src = avatar?.getAttribute('data-src') || avatar?.getAttribute('src')
        if (src) {presenceData.largeImageKey = src}
      }
      
      if (buttons) {
              presenceData.buttons = [{ label: 'View Profile', url: href }];
          }
  }

  // 10. User Page
  else if (pathname.includes('/user/')) {
      const Username = document.querySelector('[class="title"]')?.textContent?.trim();
      presenceData.details = 'Profile';
      presenceData.state = 'Viewing User: ' + Username;

      const avatar = document.querySelector('#avatarimg')

      if (avatar){
        const src = avatar?.getAttribute('data-src') || avatar?.getAttribute('src')
        if (src) {presenceData.largeImageKey = src}
      }
      
      if (buttons) {
              presenceData.buttons = [{ label: 'View Profile', url: href }];
          }
  }

  // 11. Chapter Page
  else if (document.querySelector('[class="chapter-title"]')) {
      const chapterName = document.querySelector('[class="chapter-title"]')?.textContent?.trim();
      const bookName = document.querySelector('[class="booktitle"]')?.textContent?.trim();

      if (chapterName) {
          presenceData.details = bookName || 'Reading Novel';
          presenceData.state = chapterName;
          
          const parts = pathname.split('/'); 
          // parts = ["", "book", "shadow-slave", "chapter-1"]
          // We want to keep up to "shadow-slave" (index 0, 1, 2)
          const bookUrlPath = parts.slice(0, 3).join('/'); // /book/shadow-slave
          const fullBookUrl = origin + bookUrlPath;

          
          // Check cache or fetch in background
          // Note: Since fetch is async, it might take 1 tick to show up. That's normal.
          const bgCover = await fetchCover(fullBookUrl);
          if (bgCover) {
            presenceData.largeImageKey = bgCover;
          }

          if (buttons) {
              presenceData.buttons = [{ label: 'Read Chapter', url: href }];
          }
      }
  }

  // 12. Book Info
  else if (pathname.includes('/book/')) {
      const title = document.querySelector('[class="novel-title text2row"]')?.textContent?.trim();
      presenceData.details = 'Viewing Book';
      presenceData.state = title || 'Unknown Title';

      const coverImg = document.querySelector('.cover img') || document.querySelector('.cover');
      
      if (coverImg) {
          let src = coverImg.getAttribute('data-src') || coverImg.getAttribute('src');
          if (src && src.startsWith('/')) src = origin + src;
          
          if (src && src.startsWith('http') && !src.includes('data:image')) {
            presenceData.largeImageKey = src;
            
            const cacheKey = origin + pathname;
            if (!window.localStorage.getItem(cacheKey)) {
                window.localStorage.setItem(cacheKey, src);
              }

          }
      }

      if (buttons) {
          presenceData.buttons = [{ label: 'View Book', url: href }];
      }
  }

  // 13. Genre Page
  else if (pathname.includes('genre')) {
    presenceData.details = 'Viewing Novels with Genre'
    const a = pathname.split('/');
    const state = a.slice(0, 2).join('').replace('genre-','').replace('-',' ');
    presenceData.state = 
    String(state).charAt(0).toUpperCase() + String(state).slice(1)
    
    if (buttons) {
              presenceData.buttons = [{ label: 'Browse Genre', url: href }];
          }
  }

  if (presenceData.details)
    presence.setActivity(presenceData)
  else presence.clearActivity();
});
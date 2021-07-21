const presence = new Presence({
  clientId: "860298084512038964"
}),

 browsingStamp = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  const data: PresenceData = {
    largeImageKey: "mangaworld_logo_dark"
  },

  /* Query dell'URI - URI query */
   paramsString = decodeURIComponent(document.location.search)
    .replace("?", "")
    .replace(/-/g, " "),
   searchParams = new URLSearchParams(paramsString);

  /* Homepage */
  if (document.location.pathname === "/") {
    data.smallImageKey = "home";
    data.smallImageText = "Homepage";
    data.details = "Nella homepage";
  }

  /* Preferiti - Bookmarks*/
  else if (document.location.href.includes("/bookmarks/")) {
    data.smallImageKey = "bookmark";
    data.smallImageText = "Preferiti";
    data.details = "Sfogliando i preferiti";
    let filter;

    if (document.location.href.endsWith("RE-READING")) 
      filter = "In rilettura";
     else if (document.location.href.endsWith("COMPLETED")) 
      filter = "Completati";
     else if (document.location.href.endsWith("ON_HOLD")) 
      filter = "In pausa";
     else if (document.location.href.endsWith("PLAN_TO_READ")) 
      filter = "Da leggere";
     else if (document.location.href.endsWith("DROPPED")) 
      filter = "Droppati";
     else if (document.location.href.endsWith("READING")) 
      filter = "In lettura";
    
    data.state = filter;
  }

  /* ----- ARCHIVIO - ARCHIVE ----- */
  /* Ricerca per nome - Search by name */
  else if (document.location.href.includes("keyword=")) {
    const keyword = searchParams.get("keyword");
    data.smallImageKey = "search";
    data.smallImageText = "Ricerca";
    data.details = "Cercando:";
    data.state = `"${keyword}"`;
  }
  /* Ricerca per autore - Search by author */
  else if (document.location.href.includes("author=")) {
    const author = searchParams.get("author");
    data.smallImageKey = "pen";
    data.smallImageText = "Ricerca per autore";
    data.details = "Sfogliando i contenuti dell'autore:";
    data.state = author;
  } 
  /* Ricerca per artista - Search by artist */
  else if (document.location.href.includes("artist=")) {
    const artist = searchParams.get("artist");
    data.smallImageKey = "brush";
    data.smallImageText = "Ricerca per artista";
    data.details = "Sfogliando i contenuti dell'artista:";
    data.state = artist;
  } 
  /* Ricerca per genere - Search by genre */
  else if (document.location.href.includes("genre=")) {
    const rawgenre = searchParams.get("genre"),
     words = rawgenre.split(" ");
    for (let i = 0; i < words.length; i++) 
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    
    const genre = words.join(" ");

    data.smallImageKey = "tags";
    data.smallImageText = "Ricerca per genere";
    data.details = "Sfogliando i contenuti del genere:";
    data.state = genre;
  }
  /* Ricerca per anno - Search by year of release */
  else if (document.location.href.includes("year=")) {
    const year = searchParams.get("year");
    data.smallImageKey = "calendar2";
    data.smallImageText = "Ricerca per anno";
    data.details = "Sfogliando i contenuti dell'anno:";
    data.state = year;
  }
  /* Ricerca per stato - Search by status */
  else if (document.location.href.includes("status=")) {
    const statusQuery = searchParams.get("status");
    data.smallImageKey = "slash";
    data.smallImageText = "Ricerca per stato";
    data.details = "Sfogliando i contenuti:";
    let status;

    if (statusQuery === "dropped") 
      status = "Droppati";
     else if (statusQuery === "ongoing") 
      status = "In corso d'opera";
     else if (statusQuery === "completed") 
      status = "Finiti";
     else if (statusQuery === "paused") 
      status = "In pausa";
     else if (statusQuery === "canceled") 
      status = "Cancellati";
    
    data.state = status;
  }
  /* Ricerca per tipo - Search by type/format */
  else if (document.location.href.includes("type=")) {
    const rawtype = searchParams.get("type"),
     type = rawtype[0].toUpperCase() + rawtype.substring(1);

    data.smallImageKey = "file3";
    data.smallImageText = "Ricerca per formato";
    data.details = "Sfogliando i contenuti in formato:";
    data.state = type;
  }
  /* Ricerca per ordinamento - Order by */
  else if (document.location.href.includes("sort=")) {
    const sortQuery = searchParams.get("sort");
    data.smallImageKey = "sort";
    data.smallImageText = "Ricerca per ordinamento";
    data.details = "Sfogliando i contenuti:";
    let query;

    if (sortQuery === "a z") 
      query = "Ordinati dalla A alla Z";
     else if (sortQuery === "z a") 
      query = "Ordinati dalla Z alla A";
     else if (sortQuery === "most_read") 
      query = "Più letti";
     else if (sortQuery === "less_read") 
      query = "Meno letti";
     else if (sortQuery === "newest") 
      query = "Più recenti";
     else if (sortQuery === "oldest") 
      query = "Meno recenti";
    
    data.state = query;
  }
  /* Pagina principale - Main page */
  else if (document.location.href.includes("archive")) {
    data.smallImageKey = "archive";
    data.smallImageText = "Archivio";
    data.details = "Nell'archivio";
    data.state = "Sfogliando...";
  }

  /* ----- LETTURA - READING ----- */
  else if (document.location.href.includes("/manga/")) {
    /* Nell'e-reader - In the e-reader */
    if (document.location.href.includes("/read/")) {
      const [ mangaName ] = document.title
        .replace(" Scan ITA - MangaWorld", "")
        .replace(" Oneshot", "")
        .split("Capitolo"),
      
       [ , chapter0n ] = document.title
        .replace(" Scan ITA - MangaWorld", "")
        .split("Capitolo"),

       [ , , , , , , page ] = document.location.pathname
        .split("/"),
      
       chapterInt = parseInt(chapter0n, 10);

      let chapter = chapter0n;

      if (chapterInt < 10) 
        chapter = chapter0n.replace("0", "");
      
      let chapterString = "Capitolo";
      if (chapter0n === undefined) {
        chapterString = "Oneshot",
         chapter = "";
      }

      data.smallImageKey = "book3";
      data.smallImageText = mangaName;
      data.details = `Leggendo: ${mangaName}`;
      data.state = `${chapterString + chapter} | Pagina ${page}`;
      data.buttons = [
        {
          label: "Leggilo anche tu!",
          url: document.location.href.replace(/.$/,"1")
        }
      ];
    } 
    /* Nella pagina principale del manga - In the manga's main page */
    else {
      const pageName = document.title
        .replace(" Scan ITA - MangaWorld", "");
      data.smallImageKey = "eye";
      data.smallImageText = pageName;
      data.details = "Visitando la pagina di:";
      data.state = pageName;
    }
  }
  /* In qualunque altra pagina - In any other page */
  else {
    const pageName = document.title
      .replace("MangaWorld - ", "");
      data.smallImageKey = "eye";
      data.smallImageText = `"${pageName}"`;
      data.details = "Visitando la pagina:";
      data.state = `"${pageName}"`;
  }
  if (data.details !== null) {
    data.startTimestamp = browsingStamp;
    presence.setActivity(data);
  }
});
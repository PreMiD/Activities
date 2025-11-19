const presence = new Presence({
  clientId: '1434608019207098408',
})

interface Strings {
  viewingHomepage: string
  viewingOnAir: string
  viewingSchedule: string
  viewingPrograms: string
  viewingProgram: string
  hostedBy: string
  viewingHighlights: string
  viewingEpisodes: string
  viewingHosts: string
  viewingHost: string
  viewingFrequencies: string
  viewingFrequenciesIn: string
  viewingNewsletter: string
  viewingApp: string
  viewingContact: string
  viewingWebradios: string
  viewingWebradio: string
  viewingRankings: string
  viewingTop30: string
  viewingDeejayParade: string
  viewingPodcasts: string
  viewingPodcast: string
  viewingTopics: string
  viewingTopic: string
  viewingTag: string
  watchingTV: string
  liveFrom: string
  viewingStore: string
  shoppingFor: string
  viewingLegalNotes: string
  viewingRegulations: string
  viewingTDM: string
  readingCookiePolicy: string
  readingPrivacyPolicy: string
  readingAccessibility: string
  viewingProfile: string
}

const strings: { [key: string]: Strings } = {
  ar: { viewingHomepage: 'عرض الصفحة الرئيسية', viewingOnAir: 'عرض جدول البث المباشر', viewingSchedule: 'التصفح خلال الجدول', viewingPrograms: 'التصفح خلال البرامج', viewingProgram: 'عرض البرنامج', hostedBy: 'يقدمه', viewingHighlights: 'عرض النقاط البارزة', viewingEpisodes: 'عرض الحلقات', viewingHosts: 'عرض المقدمين في فريق دي جاي', viewingHost: 'عرض المقدم', viewingFrequencies: 'عرض الترددات', viewingFrequenciesIn: 'عرض الترددات في', viewingNewsletter: 'عرض قائمة النشرة الإخبارية', viewingApp: 'عرض تطبيق دي جاي', viewingContact: 'عرض صفحة الاتصال', viewingWebradios: 'التصفح خلال الإذاعات عبر الإنترنت', viewingWebradio: 'عرض الإذاعة عبر الإنترنت', viewingRankings: 'عرض التصنيفات', viewingTop30: 'عرض Top 30', viewingDeejayParade: 'عرض موكب دي جاي', viewingPodcasts: 'عرض البودكاست', viewingPodcast: 'عرض البودكاست', viewingTopics: 'عرض المواضيع', viewingTopic: 'عرض الموضوع', viewingTag: 'عرض الوسم', watchingTV: 'مشاهدة قناة دي جاي التلفزيونية', liveFrom: 'بث مباشر من', viewingStore: 'عرض متجر دي جاي', shoppingFor: 'التسوق لمنتجات دي جاي', viewingLegalNotes: 'عرض الملاحظات القانونية', viewingRegulations: 'عرض اللوائح', viewingTDM: 'عرض TDM Reserve', readingCookiePolicy: 'قراءة سياسة الكوكيز', readingPrivacyPolicy: 'قراءة سياسة الخصوصية', readingAccessibility: 'قراءة بيان accessibility', viewingProfile: 'عرض ملف المستخدم' },
  bg: { viewingHomepage: 'Преглед на началната страница', viewingOnAir: 'Преглед на ефирното разписание', viewingSchedule: 'Преглед на графика', viewingPrograms: 'Преглед на програмите', viewingProgram: 'Преглед на програма', hostedBy: 'Водещ', viewingHighlights: 'Преглед на акценти', viewingEpisodes: 'Преглед на епизоди', viewingHosts: 'Преглед на водещите в екипа на DeeJay', viewingHost: 'Преглед на водещ', viewingFrequencies: 'Преглед на честоти', viewingFrequenciesIn: 'Преглед на честоти в', viewingNewsletter: 'Преглед на бюлетина', viewingApp: 'Преглед на приложението DeeJay', viewingContact: 'Преглед на страницата за контакт', viewingWebradios: 'Преглед на уеб радиа', viewingWebradio: 'Преглед на уеб радио', viewingRankings: 'Преглед на класации', viewingTop30: 'Преглед на Top 30', viewingDeejayParade: 'Преглед на DeeJay Parade', viewingPodcasts: 'Преглед на подкасти', viewingPodcast: 'Преглед на подкаст', viewingTopics: 'Преглед на теми', viewingTopic: 'Преглед на тема', viewingTag: 'Преглед на таг', watchingTV: 'Гледане на DeeJay TV', liveFrom: 'НА ЖИВО от', viewingStore: 'Преглед на магазина на DeeJay', shoppingFor: 'Пазаруване на стоки от DeeJay', viewingLegalNotes: 'Преглед на правни бележки', viewingRegulations: 'Преглед на правила', viewingTDM: 'Преглед на TDM Reserve', readingCookiePolicy: 'Четене на политика за бисквитки', readingPrivacyPolicy: 'Четене на политика за поверителност', readingAccessibility: 'Четене на декларация за достъпност', viewingProfile: 'Преглед на потребителския профил' },
  bn: { viewingHomepage: 'হোমপেজ দেখা হচ্ছে', viewingOnAir: 'অন-এয়ার সময়সূচী দেখা হচ্ছে', viewingSchedule: 'সময়সূচী স্ক্রল করা হচ্ছে', viewingPrograms: 'প্রোগ্রাম স্ক্রল করা হচ্ছে', viewingProgram: 'প্রোগ্রাম দেখা হচ্ছে', hostedBy: 'হোস্টেড বাই', viewingHighlights: 'হাইলাইটস দেখা হচ্ছে', viewingEpisodes: 'এপিসোড দেখা হচ্ছে', viewingHosts: 'ডিজে টিমে হোস্ট দেখা হচ্ছে', viewingHost: 'হোস্ট দেখা হচ্ছে', viewingFrequencies: 'ফ্রিকোয়েন্সি দেখা হচ্ছে', viewingFrequenciesIn: 'ফ্রিকোয়েন্সি দেখা হচ্ছে', viewingNewsletter: 'নিউজলেটার মেনু দেখা হচ্ছে', viewingApp: 'ডিজে অ্যাপ দেখা হচ্ছে', viewingContact: 'যোগাযোগের পাতা দেখা হচ্ছে', viewingWebradios: 'ওয়েবরেডিও স্ক্রল করা হচ্ছে', viewingWebradio: 'ওয়েবরেডিও দেখা হচ্ছে', viewingRankings: 'র‍্যাঙ্কিং দেখা হচ্ছে', viewingTop30: 'টপ ৩০ দেখা হচ্ছে', viewingDeejayParade: 'ডিজে প্যারেড দেখা হচ্ছে', viewingPodcasts: 'পডকাস্ট দেখা হচ্ছে', viewingPodcast: 'পডকাস্ট দেখা হচ্ছে', viewingTopics: 'বিষয় দেখা হচ্ছে', viewingTopic: 'বিষয় দেখা হচ্ছে', viewingTag: 'ট্যাগ দেখা হচ্ছে', watchingTV: 'ডিজে টিভি দেখা হচ্ছে', liveFrom: 'লাইভ থেকে', viewingStore: 'ডিজে স্টোর দেখা হচ্ছে', shoppingFor: 'ডিজে মার্চেন্ডাইজ কেনাকাটা', viewingLegalNotes: 'আইনি নোট দেখা হচ্ছে', viewingRegulations: 'বিধি দেখা হচ্ছে', viewingTDM: 'TDM রিজার্ভ দেখা হচ্ছে', readingCookiePolicy: 'কুকি নীতি পড়া হচ্ছে', readingPrivacyPolicy: 'গোপনীয়তা নীতি পড়া হচ্ছে', readingAccessibility: 'অ্যাক্সেসিবিলিটি স্টেটমেন্ট পড়া হচ্ছে', viewingProfile: 'ব্যবহারকারীর প্রোফাইল দেখা হচ্ছে' },
  cs: { viewingHomepage: 'Prohlížení domovské stránky', viewingOnAir: 'Prohlížení vysílacího programu', viewingSchedule: 'Procházení programu', viewingPrograms: 'Procházení programů', viewingProgram: 'Prohlížení programu', hostedBy: 'Moderuje', viewingHighlights: 'Prohlížení highlightů', viewingEpisodes: 'Prohlížení epizod', viewingHosts: 'Prohlížení moderátorů v týmu DeeJay', viewingHost: 'Prohlížení moderátora', viewingFrequencies: 'Prohlížení frekvencí', viewingFrequenciesIn: 'Prohlížení frekvencí v', viewingNewsletter: 'Prohlížení menu newsletteru', viewingApp: 'Prohlížení aplikace DeeJay', viewingContact: 'Prohlížení kontaktní stránky', viewingWebradios: 'Procházení webových rádií', viewingWebradio: 'Prohlížení webového rádia', viewingRankings: 'Prohlížení žebříčků', viewingTop30: 'Prohlížení Top 30', viewingDeejayParade: 'Prohlížení DeeJay Parade', viewingPodcasts: 'Prohlížení podcastů', viewingPodcast: 'Prohlížení podcastu', viewingTopics: 'Prohlížení témat', viewingTopic: 'Prohlížení tématu', viewingTag: 'Prohlížení štítku', watchingTV: 'Sledování DeeJay TV', liveFrom: 'ŽIVĚ z', viewingStore: 'Prohlížení obchodu DeeJay', shoppingFor: 'Nákup zboží DeeJay', viewingLegalNotes: 'Prohlížení právních poznámek', viewingRegulations: 'Prohlížení předpisů', viewingTDM: 'Prohlížení TDM Reserve', readingCookiePolicy: 'Čtení zásad cookies', readingPrivacyPolicy: 'Čtení zásad ochrany osobních údajů', readingAccessibility: 'Čtení prohlášení o přístupnosti', viewingProfile: 'Prohlížení uživatelského profilu' },
  da: { viewingHomepage: 'Se startside', viewingOnAir: 'Se sendeskema', viewingSchedule: 'Ruller gennem sendeskemaet', viewingPrograms: 'Ruller gennem programmer', viewingProgram: 'Se program', hostedBy: 'Vært af', viewingHighlights: 'Se højdepunkter', viewingEpisodes: 'Se episoder', viewingHosts: 'Se værter i DeeJay-holdet', viewingHost: 'Se vært', viewingFrequencies: 'Se frekvenser', viewingFrequenciesIn: 'Se frekvenser i', viewingNewsletter: 'Se nyhedsbrevsmenu', viewingApp: 'Se DeeJay-appen', viewingContact: 'Se kontaktside', viewingWebradios: 'Ruller gennem webradioer', viewingWebradio: 'Se webradio', viewingRankings: 'Se ranglister', viewingTop30: 'Se Top 30', viewingDeejayParade: 'Se DeeJay Parade', viewingPodcasts: 'Se podcasts', viewingPodcast: 'Se en podcast', viewingTopics: 'Se emner', viewingTopic: 'Se emne', viewingTag: 'Se tag', watchingTV: 'Se DeeJay TV', liveFrom: 'LIVE fra', viewingStore: 'Se DeeJay-butikken', shoppingFor: 'Shopper efter DeeJay merchandise', viewingLegalNotes: 'Se juridiske noter', viewingRegulations: 'Se regler', viewingTDM: 'Se TDM Reserve', readingCookiePolicy: 'Læser cookiepolitik', readingPrivacyPolicy: 'Læser privatlivspolitik', readingAccessibility: 'Læser tilgængelighedserklæring', viewingProfile: 'Se brugerprofil' },
  de: { viewingHomepage: 'Betrachtet die Startseite', viewingOnAir: 'Betrachtet den On-Air-Sendeplan', viewingSchedule: 'Durchsucht den Sendeplan', viewingPrograms: 'Durchsucht die Programme', viewingProgram: 'Betrachtet das Programm', hostedBy: 'Moderiert von', viewingHighlights: 'Betrachtet Highlights', viewingEpisodes: 'Betrachtet Episoden', viewingHosts: 'Betrachtet Moderatoren im DeeJay Team', viewingHost: 'Betrachtet Moderator', viewingFrequencies: 'Betrachtet Frequenzen', viewingFrequenciesIn: 'Betrachtet Frequenzen in', viewingNewsletter: 'Betrachtet Newsletter-Menü', viewingApp: 'Betrachtet die DeeJay App', viewingContact: 'Betrachtet Kontaktseite', viewingWebradios: 'Durchsucht Webradios', viewingWebradio: 'Betrachtet Webradio', viewingRankings: 'Betrachtet Ranglisten', viewingTop30: 'Betrachtet Top 30', viewingDeejayParade: 'Betrachtet DeeJay Parade', viewingPodcasts: 'Betrachtet Podcasts', viewingPodcast: 'Betrachtet einen Podcast', viewingTopics: 'Betrachtet Themen', viewingTopic: 'Betrachtet Thema', viewingTag: 'Betrachtet Tag', watchingTV: 'Schaut DeeJay TV', liveFrom: 'LIVE von', viewingStore: 'Betrachtet den DeeJay Store', shoppingFor: 'Einkauft für DeeJay Merchandise', viewingLegalNotes: 'Betrachtet rechtliche Hinweise', viewingRegulations: 'Betrachtet Vorschriften', viewingTDM: 'Betrachtet TDM-Reserve', readingCookiePolicy: 'Liest Cookie-Richtlinie', readingPrivacyPolicy: 'Liest Datenschutzrichtlinie', readingAccessibility: 'Liest Barrierefreiheitserklärung', viewingProfile: 'Betrachtet Benutzerprofil' },
  el: { viewingHomepage: 'Προβολή αρχικής σελίδας', viewingOnAir: 'Προβολή προγράμματος ζωντανής μετάδοσης', viewingSchedule: 'Περιήγηση στο πρόγραμμα', viewingPrograms: 'Περιήγηση στα προγράμματα', viewingProgram: 'Προβολή προγράμματος', hostedBy: 'Παρουσιαστής', viewingHighlights: 'Προβολή επισημάνσεων', viewingEpisodes: 'Προβολή επεισοδίων', viewingHosts: 'Προβολή παρουσιαστών στην ομάδα DeeJay', viewingHost: 'Προβολή παρουσιαστή', viewingFrequencies: 'Προβολή συχνοτήτων', viewingFrequenciesIn: 'Προβολή συχνοτήτων σε', viewingNewsletter: 'Προβολή μενού ενημερωτικού δελτίου', viewingApp: 'Προβολή της εφαρμογής DeeJay', viewingContact: 'Προβολή σελίδας επικοινωνίας', viewingWebradios: 'Περιήγηση στους webradios', viewingWebradio: 'Προβολή webradio', viewingRankings: 'Προβολή κατατάξεων', viewingTop30: 'Προβολή Top 30', viewingDeejayParade: 'Προβολή DeeJay Parade', viewingPodcasts: 'Προβολή podcasts', viewingPodcast: 'Προβολή podcast', viewingTopics: 'Προβολή θεμάτων', viewingTopic: 'Προβολή θέματος', viewingTag: 'Προβολή ετικέτας', watchingTV: 'Παρακολούθηση DeeJay TV', liveFrom: 'ΖΩΝΤΑΝΑ από', viewingStore: 'Προβολή καταστήματος DeeJay', shoppingFor: 'Ψώνια για εμπορεύματα DeeJay', viewingLegalNotes: 'Προβολή νομικών σημειώσεων', viewingRegulations: 'Προβολή κανονισμών', viewingTDM: 'Προβολή TDM Reserve', readingCookiePolicy: 'Ανάγνωση πολιτικής cookies', readingPrivacyPolicy: 'Ανάγνωση πολιτικής απορρήτου', readingAccessibility: 'Ανάγνωση δήλωσης προσβασιμότητας', viewingProfile: 'Προβολή προφίλ χρήστη' },
  en: { viewingHomepage: 'Viewing the homepage', viewingOnAir: 'Viewing On Air Schedule', viewingSchedule: 'Scrolling through the schedule', viewingPrograms: 'Scrolling through programs', viewingProgram: 'Viewing program', hostedBy: 'Hosted by', viewingHighlights: 'Viewing Highlights', viewingEpisodes: 'Viewing Episodes', viewingHosts: 'Viewing Hosts in DeeJay Team', viewingHost: 'Viewing Host', viewingFrequencies: 'Viewing frequencies', viewingFrequenciesIn: 'Viewing frequencies in', viewingNewsletter: 'Viewing Newsletter Menu', viewingApp: 'Viewing the DeeJay App', viewingContact: 'Viewing contact page', viewingWebradios: 'Scrolling through webradios', viewingWebradio: 'Viewing webradio', viewingRankings: 'Viewing rankings', viewingTop30: 'Viewing Top 30', viewingDeejayParade: 'Viewing DeeJay Parade', viewingPodcasts: 'Viewing Podcasts', viewingPodcast: 'Viewing a Podcast', viewingTopics: 'Viewing Topics', viewingTopic: 'Viewing topic', viewingTag: 'Viewing tag', watchingTV: 'Watching DeeJay TV', liveFrom: 'LIVE from', viewingStore: 'Viewing the DeeJay Store', shoppingFor: 'Shopping for DeeJay merchandise', viewingLegalNotes: 'Viewing Legal Notes', viewingRegulations: 'Viewing Regulations', viewingTDM: 'Viewing TDM Reserve', readingCookiePolicy: 'Reading Cookie Policy', readingPrivacyPolicy: 'Reading Privacy Policy', readingAccessibility: 'Reading Accessibility Statement', viewingProfile: 'Viewing user profile' },
  es: { viewingHomepage: 'Viendo la página de inicio', viewingOnAir: 'Viendo la programación en vivo', viewingSchedule: 'Desplazándose por la programación', viewingPrograms: 'Desplazándose por los programas', viewingProgram: 'Viendo el programa', hostedBy: 'Presentado por', viewingHighlights: 'Viendo los destacados', viewingEpisodes: 'Viendo los episodios', viewingHosts: 'Viendo los presentadores del equipo DeeJay', viewingHost: 'Viendo al presentador', viewingFrequencies: 'Viendo las frecuencias', viewingFrequenciesIn: 'Viendo frecuencias en', viewingNewsletter: 'Viendo el menú del boletín', viewingApp: 'Viendo la aplicación DeeJay', viewingContact: 'Viendo la página de contacto', viewingWebradios: 'Desplazándose por las webradios', viewingWebradio: 'Viendo la webradio', viewingRankings: 'Viendo las clasificaciones', viewingTop30: 'Viendo el Top 30', viewingDeejayParade: 'Viendo la DeeJay Parade', viewingPodcasts: 'Viendo los podcasts', viewingPodcast: 'Viendo un podcast', viewingTopics: 'Viendo los temas', viewingTopic: 'Viendo el tema', viewingTag: 'Viendo la etiqueta', watchingTV: 'Viendo DeeJay TV', liveFrom: 'EN VIVO desde', viewingStore: 'Viendo la tienda DeeJay', shoppingFor: 'Comprando merchandising de DeeJay', viewingLegalNotes: 'Viendo las notas legales', viewingRegulations: 'Viendo los reglamentos', viewingTDM: 'Viendo TDM Reserve', readingCookiePolicy: 'Leyendo la política de cookies', readingPrivacyPolicy: 'Leyendo la política de privacidad', readingAccessibility: 'Leyendo la declaración de accesibilidad', viewingProfile: 'Viendo el perfil de usuario' },
  et: { viewingHomepage: 'Avalehe vaatamine', viewingOnAir: 'Otse-eetris oleva graafiku vaatamine', viewingSchedule: 'Grafiku kerimine', viewingPrograms: 'Programmide kerimine', viewingProgram: 'Programmi vaatamine', hostedBy: 'Saatejuht', viewingHighlights: 'Esiletõstetud sisu vaatamine', viewingEpisodes: 'Osade vaatamine', viewingHosts: 'DeeJay meeskonna saatejuhtide vaatamine', viewingHost: 'Saatejuhi vaatamine', viewingFrequencies: 'Sageduste vaatamine', viewingFrequenciesIn: 'Sageduste vaatamine riigis', viewingNewsletter: 'Uudiskirja menüü vaatamine', viewingApp: 'DeeJay rakenduse vaatamine', viewingContact: 'Kontaktlehe vaatamine', viewingWebradios: 'Veebiraadiootide kerimine', viewingWebradio: 'Veebiraadio vaatamine', viewingRankings: 'Edetabelite vaatamine', viewingTop30: 'Top 30 vaatamine', viewingDeejayParade: 'DeeJay Parade\'i vaatamine', viewingPodcasts: 'Podcastide vaatamine', viewingPodcast: 'Podcasti vaatamine', viewingTopics: 'Teemade vaatamine', viewingTopic: 'Teema vaatamine', viewingTag: 'Sildi vaatamine', watchingTV: 'DeeJay TV vaatamine', liveFrom: 'OTSE ülekanne', viewingStore: 'DeeJay poe vaatamine', shoppingFor: 'DeeJay kaubade ostmine', viewingLegalNotes: 'Juristiidiste märkuste vaatamine', viewingRegulations: 'Eeskirjade vaatamine', viewingTDM: 'TDM Reserve\'i vaatamine', readingCookiePolicy: 'Küpsiste poliitika lugemine', readingPrivacyPolicy: 'Privaatsuspoliitika lugemine', readingAccessibility: 'Juurdepääsetavusavalduse lugemine', viewingProfile: 'Kasutajaprofiili vaatamine' },
  fa: { viewingHomepage: 'مشاهده صفحه اصلی', viewingOnAir: 'مشاهده برنامه زمانی پخش زنده', viewingSchedule: 'پیمایش در برنامه زمانی', viewingPrograms: 'پیمایش در برنامه ها', viewingProgram: 'مشاهده برنامه', hostedBy: 'مجری', viewingHighlights: 'مشاهده هایلایت ها', viewingEpisodes: 'مشاهده اپیزودها', viewingHosts: 'مشاهده مجریان در تیم دی جی', viewingHost: 'مشاهده مجری', viewingFrequencies: 'مشاهده فرکانس ها', viewingFrequenciesIn: 'مشاهده فرکانس ها در', viewingNewsletter: 'مشاهده منوی خبرنامه', viewingApp: 'مشاهده اپلیکیشن دی جی', viewingContact: 'مشاهده صفحه تماس', viewingWebradios: 'پیمایش در وب رادیوها', viewingWebradio: 'مشاهده وب رادیو', viewingRankings: 'مشاهده رتبه بندی ها', viewingTop30: 'مشاهده 30 مورد برتر', viewingDeejayParade: 'مشاهده دی جی پاراد', viewingPodcasts: 'مشاهده پادکست ها', viewingPodcast: 'مشاهده یک پادکست', viewingTopics: 'مشاهده موضوعات', viewingTopic: 'مشاهده موضوع', viewingTag: 'مشاهده تگ', watchingTV: 'تماشای دی جی تی وی', liveFrom: 'پخش زنده از', viewingStore: 'مشاهده فروشگاه دی جی', shoppingFor: 'خرید محصولات دی جی', viewingLegalNotes: 'مشاهده یادداشت های حقوقی', viewingRegulations: 'مشاهده مقررات', viewingTDM: 'مشاهده TDM رزرو', readingCookiePolicy: 'خواندن سیاست کوکی', readingPrivacyPolicy: 'خواندن سیاست حفظ حریم خصوصی', readingAccessibility: 'خواندن بیانیه دسترسی', viewingProfile: 'مشاهده پروفایل کاربر' },
  fi: { viewingHomepage: 'Katsotaan etusivua', viewingOnAir: 'Katsotaan lähetysohjelmaa', viewingSchedule: 'Selataan ohjelmistoa', viewingPrograms: 'Selataan ohjelmia', viewingProgram: 'Katsotaan ohjelmaa', hostedBy: 'Isäntänä', viewingHighlights: 'Katsotaan kohokohtia', viewingEpisodes: 'Katsotaan jaksoja', viewingHosts: 'Katsotaan DeeJay-tiimin isäntiä', viewingHost: 'Katsotaan isäntää', viewingFrequencies: 'Katsotaan taajuuksia', viewingFrequenciesIn: 'Katsotaan taajuuksia maassa', viewingNewsletter: 'Katsotaan uutiskirjevalikkoa', viewingApp: 'Katsotaan DeeJay-sovellusta', viewingContact: 'Katsotaan yhteyssivua', viewingWebradios: 'Selataan verkkoradioita', viewingWebradio: 'Katsotaan verkkoradioita', viewingRankings: 'Katsotaan sijoituksia', viewingTop30: 'Katsotaan Top 30', viewingDeejayParade: 'Katsotaan DeeJay Paradea', viewingPodcasts: 'Katsotaan podcast-eja', viewingPodcast: 'Katsotaan podcastia', viewingTopics: 'Katsotaan aiheita', viewingTopic: 'Katsotaan aihetta', viewingTag: 'Katsotaan tagia', watchingTV: 'Katsotaan DeeJay TV:tä', liveFrom: 'LIVE läheys', viewingStore: 'Katsotaan DeeJay-kauppaa', shoppingFor: 'Ostetaan DeeJay-tuotteita', viewingLegalNotes: 'Katsotaan oikeudellisia huomautuksia', viewingRegulations: 'Katsotaan määräyksiä', viewingTDM: 'Katsotaan TDM Reserveä', readingCookiePolicy: 'Luetaan evästekäytäntöä', readingPrivacyPolicy: 'Luetaan tietosuojakäytäntöä', readingAccessibility: 'Luetaan saavutettavuuslausuntoa', viewingProfile: 'Katsotaan käyttäjäprofiilia' },
  fil: { viewingHomepage: 'Tingnan ang homepage', viewingOnAir: 'Tingnan ang On Air Schedule', viewingSchedule: 'Nag-scroll sa schedule', viewingPrograms: 'Nag-scroll sa mga program', viewingProgram: 'Tingnan ang program', hostedBy: 'Hosted by', viewingHighlights: 'Tingnan ang Mga Highlight', viewingEpisodes: 'Tingnan ang Mga Episode', viewingHosts: 'Tingnan ang Mga Host sa DeeJay Team', viewingHost: 'Tingnan ang Host', viewingFrequencies: 'Tingnan ang mga frequency', viewingFrequenciesIn: 'Tingnan ang mga frequency sa', viewingNewsletter: 'Tingnan ang Menu ng Newsletter', viewingApp: 'Tingnan ang DeeJay App', viewingContact: 'Tingnan ang contact page', viewingWebradios: 'Nag-scroll sa mga webradio', viewingWebradio: 'Tingnan ang webradio', viewingRankings: 'Tingnan ang mga ranking', viewingTop30: 'Tingnan ang Top 30', viewingDeejayParade: 'Tingnan ang DeeJay Parade', viewingPodcasts: 'Tingnan ang Mga Podcast', viewingPodcast: 'Tingnan ang isang Podcast', viewingTopics: 'Tingnan ang Mga Paksa', viewingTopic: 'Tingnan ang paksa', viewingTag: 'Tingnan ang tag', watchingTV: 'Nanood ng DeeJay TV', liveFrom: 'LIVE from', viewingStore: 'Tingnan ang DeeJay Store', shoppingFor: 'Namimili ng DeeJay merchandise', viewingLegalNotes: 'Tingnan ang Legal Notes', viewingRegulations: 'Tingnan ang Mga Regulasyon', viewingTDM: 'Tingnan ang TDM Reserve', readingCookiePolicy: 'Pagbabasa ng Cookie Policy', readingPrivacyPolicy: 'Pagbabasa ng Privacy Policy', readingAccessibility: 'Pagbabasa ng Accessibility Statement', viewingProfile: 'Tingnan ang user profile' },
  fr: { viewingHomepage: 'Consultation de la page d\'accueil', viewingOnAir: 'Consultation du programme en direct', viewingSchedule: 'Parcours du programme', viewingPrograms: 'Parcours des programmes', viewingProgram: 'Consultation du programme', hostedBy: 'Animé par', viewingHighlights: 'Consultation des highlights', viewingEpisodes: 'Consultation des épisodes', viewingHosts: 'Consultation des animateurs de l\'équipe DeeJay', viewingHost: 'Consultation de l\'animateur', viewingFrequencies: 'Consultation des fréquences', viewingFrequenciesIn: 'Consultation des fréquences en', viewingNewsletter: 'Consultation du menu Newsletter', viewingApp: 'Consultation de l\'application DeeJay', viewingContact: 'Consultation de la page de contact', viewingWebradios: 'Parcours des webradios', viewingWebradio: 'Consultation de la webradio', viewingRankings: 'Consultation des classements', viewingTop30: 'Consultation du Top 30', viewingDeejayParade: 'Consultation de la DeeJay Parade', viewingPodcasts: 'Consultation des podcasts', viewingPodcast: 'Consultation d\'un podcast', viewingTopics: 'Consultation des sujets', viewingTopic: 'Consultation du sujet', viewingTag: 'Consultation du tag', watchingTV: 'Regarde DeeJay TV', liveFrom: 'EN DIRECT de', viewingStore: 'Consultation du DeeJay Store', shoppingFor: 'Achète des produits DeeJay', viewingLegalNotes: 'Consultation des notes légales', viewingRegulations: 'Consultation des règlements', viewingTDM: 'Consultation de la réserve TDM', readingCookiePolicy: 'Lit la politique des cookies', readingPrivacyPolicy: 'Lit la politique de confidentialité', readingAccessibility: 'Lit la déclaration d\'accessibilité', viewingProfile: 'Consultation du profil utilisateur' },
  ga: { viewingHomepage: 'Ag féachaint ar an leathanach baile', viewingOnAir: 'Ag féachaint ar an Sceideal Beo', viewingSchedule: 'Ag scrolláil tríd an sceideal', viewingPrograms: 'Ag scrolláil trí chláir', viewingProgram: 'Ag féachaint ar chlár', hostedBy: 'Óstáil ag', viewingHighlights: 'Ag féachaint ar na Pointí Speisialta', viewingEpisodes: 'Ag féachaint ar Eipeasóidí', viewingHosts: 'Ag féachaint ar Óstaigh i bhFoireann DeeJay', viewingHost: 'Ag féachaint ar Óstach', viewingFrequencies: 'Ag féachaint ar mhinicíochtaí', viewingFrequenciesIn: 'Ag féachaint ar mhinicíochtaí i', viewingNewsletter: 'Ag féachaint ar Mhenú Nuachtlitir', viewingApp: 'Ag féachaint ar an Aip DeeJay', viewingContact: 'Ag féachaint ar an leathanach teagmhála', viewingWebradios: 'Ag scrolláil trí ghreasáin raidió', viewingWebradio: 'Ag féachaint ar ghreasánraidió', viewingRankings: 'Ag féachaint ar rátálacha', viewingTop30: 'Ag féachaint ar an Top 30', viewingDeejayParade: 'Ag féachaint ar DeeJay Parade', viewingPodcasts: 'Ag féachaint ar Podchraoltaí', viewingPodcast: 'Ag féachaint ar podchraol', viewingTopics: 'Ag féachaint ar Ábhair', viewingTopic: 'Ag féachaint ar ábhar', viewingTag: 'Ag féachaint ar chlib', watchingTV: 'Ag féachaint ar DeeJay TV', liveFrom: 'BEO ó', viewingStore: 'Ag féachaint ar Siopa DeeJay', shoppingFor: 'Ag siopadóireacht le haghaidh earraí DeeJay', viewingLegalNotes: 'Ag féachaint ar Nótaí Dlíthiúla', viewingRegulations: 'Ag féachaint ar Rialacháin', viewingTDM: 'Ag féachaint ar TDM Reserve', readingCookiePolicy: 'Ag léamh Polasaí Fianán', readingPrivacyPolicy: 'Ag léamh Polasaí Príobháideachais', readingAccessibility: 'Ag léamh Ráiteas Inrochtana', viewingProfile: 'Ag féachaint ar phróifíl úsáideora' },
  he: { viewingHomepage: 'צופה בדף הבית', viewingOnAir: 'צופה בלוח השידורים', viewingSchedule: 'גולל through the schedule', viewingPrograms: 'גולל through programs', viewingProgram: 'צופה בתוכנית', hostedBy: 'מארח', viewingHighlights: 'צופה בהיילייטס', viewingEpisodes: 'צופה בפרקים', viewingHosts: 'צופה במנחים בצוות DeeJay', viewingHost: 'צופה במנחה', viewingFrequencies: 'צופה בתדרים', viewingFrequenciesIn: 'צופה בתדרים ב', viewingNewsletter: 'צופה בתפריט הניוזלטר', viewingApp: 'צופה באפליקציית DeeJay', viewingContact: 'צופה בדף יצירת קשר', viewingWebradios: 'גולל through webradios', viewingWebradio: 'צופה ב-webradio', viewingRankings: 'צופה בדירוגים', viewingTop30: 'צופה ב-Top 30', viewingDeejayParade: 'צופה ב-DeeJay Parade', viewingPodcasts: 'צופה בפודקאסטים', viewingPodcast: 'צופה בפודקאסט', viewingTopics: 'צופה בנושאים', viewingTopic: 'צופה בנושא', viewingTag: 'צופה בתג', watchingTV: 'צופה ב-DeeJay TV', liveFrom: 'LIVE from', viewingStore: 'צופה בחנות DeeJay', shoppingFor: 'קונה מרצ\'נדייז של DeeJay', viewingLegalNotes: 'צופה בהערות משפטיות', viewingRegulations: 'צופה בתקנות', viewingTDM: 'צופה ב-TDM Reserve', readingCookiePolicy: 'קורא מדיניות קובצי Cookie', readingPrivacyPolicy: 'קורא מדיניות פרטיות', readingAccessibility: 'קורא הצהרת נגישות', viewingProfile: 'צופה בפרופיל המשתמש' },
  hi: { viewingHomepage: 'होमपेज देख रहे हैं', viewingOnAir: 'ऑन एयर शेड्यूल देख रहे हैं', viewingSchedule: 'शेड्यूल स्क्रॉल कर रहे हैं', viewingPrograms: 'प्रोग्राम स्क्रॉल कर रहे हैं', viewingProgram: 'प्रोग्राम देख रहे हैं', hostedBy: 'होस्टेड बाय', viewingHighlights: 'हाइलाइट्स देख रहे हैं', viewingEpisodes: 'एपिसोड देख रहे हैं', viewingHosts: 'डीजे टीम में होस्ट्स देख रहे हैं', viewingHost: 'होस्ट देख रहे हैं', viewingFrequencies: 'फ्रीक्वेंसी देख रहे हैं', viewingFrequenciesIn: 'फ्रीक्वेंसी देख रहे हैं', viewingNewsletter: 'न्यूज़लेटर मेनू देख रहे हैं', viewingApp: 'डीजे ऐप देख रहे हैं', viewingContact: 'संपर्क पृष्ठ देख रहे हैं', viewingWebradios: 'वेबरेडियो स्क्रॉल कर रहे हैं', viewingWebradio: 'वेबरेडियो देख रहे हैं', viewingRankings: 'रैंकिंग देख रहे हैं', viewingTop30: 'टॉप 30 देख रहे हैं', viewingDeejayParade: 'डीजे परेड देख रहे हैं', viewingPodcasts: 'पॉडकास्ट देख रहे हैं', viewingPodcast: 'पॉडकास्ट देख रहे हैं', viewingTopics: 'विषय देख रहे हैं', viewingTopic: 'विषय देख रहे हैं', viewingTag: 'टैग देख रहे हैं', watchingTV: 'डीजे टीवी देख रहे हैं', liveFrom: 'लाइव from', viewingStore: 'डीजे स्टोर देख रहे हैं', shoppingFor: 'डीजे मर्चेंडाइज की खरीदारी', viewingLegalNotes: 'लीगल नोट्स देख रहे हैं', viewingRegulations: 'नियम देख रहे हैं', viewingTDM: 'TDM रिज़र्व देख रहे हैं', readingCookiePolicy: 'कुकी पॉलिसी पढ़ रहे हैं', readingPrivacyPolicy: 'प्राइवेसी पॉलिसी पढ़ रहे हैं', readingAccessibility: 'एक्सेसिबिलिटी स्टेटमेंट पढ़ रहे हैं', viewingProfile: 'यूजर प्रोफाइल देख रहे हैं' },
  hr: { viewingHomepage: 'Pregled početne stranice', viewingOnAir: 'Pregled rasporeda emitiranja', viewingSchedule: 'Pregledavanje rasporeda', viewingPrograms: 'Pregledavanje programa', viewingProgram: 'Pregled programa', hostedBy: 'Voditelj', viewingHighlights: 'Pregled istaknutih sadržaja', viewingEpisodes: 'Pregled epizoda', viewingHosts: 'Pregled voditelja u DeeJay timu', viewingHost: 'Pregled voditelja', viewingFrequencies: 'Pregled frekvencija', viewingFrequenciesIn: 'Pregled frekvencija u', viewingNewsletter: 'Pregled izbornika newslettera', viewingApp: 'Pregled DeeJay aplikacije', viewingContact: 'Pregled kontakt stranice', viewingWebradios: 'Pregledavanje web radija', viewingWebradio: 'Pregled web radija', viewingRankings: 'Pregled ljestvica', viewingTop30: 'Pregled Top 30', viewingDeejayParade: 'Pregled DeeJay Parade', viewingPodcasts: 'Pregled podcasta', viewingPodcast: 'Pregled podcasta', viewingTopics: 'Pregled tema', viewingTopic: 'Pregled teme', viewingTag: 'Pregled oznake', watchingTV: 'Gledanje DeeJay TV', liveFrom: 'UŽIVO iz', viewingStore: 'Pregled DeeJay trgovine', shoppingFor: 'Kupovina DeeJay robe', viewingLegalNotes: 'Pregled pravnih napomena', viewingRegulations: 'Pregled propisa', viewingTDM: 'Pregled TDM Reserve', readingCookiePolicy: 'Čitanje politike kolačića', readingPrivacyPolicy: 'Čitanje politike privatnosti', readingAccessibility: 'Čitanje izjave o pristupačnosti', viewingProfile: 'Pregled korisničkog profila' },
  hu: { viewingHomepage: 'Kezdőlap megtekintése', viewingOnAir: 'Műsorújság megtekintése', viewingSchedule: 'Menetrend böngészése', viewingPrograms: 'Műsorok böngészése', viewingProgram: 'Műsor megtekintése', hostedBy: 'Műsorvezető', viewingHighlights: 'Kiemelések megtekintése', viewingEpisodes: 'Epizódok megtekintése', viewingHosts: 'Műsorvezetők megtekintése a DeeJay csapatban', viewingHost: 'Műsorvezető megtekintése', viewingFrequencies: 'Frekvenciák megtekintése', viewingFrequenciesIn: 'Frekvenciák megtekintése itt', viewingNewsletter: 'Hírlevél menü megtekintése', viewingApp: 'DeeJay alkalmazás megtekintése', viewingContact: 'Kapcsolati oldal megtekintése', viewingWebradios: 'Webrádiók böngészése', viewingWebradio: 'Webrádió megtekintése', viewingRankings: 'Ranglisták megtekintése', viewingTop30: 'Top 30 megtekintése', viewingDeejayParade: 'DeeJay Parade megtekintése', viewingPodcasts: 'Podcastek megtekintése', viewingPodcast: 'Podcast megtekintése', viewingTopics: 'Témakörök megtekintése', viewingTopic: 'Téma megtekintése', viewingTag: 'Címke megtekintése', watchingTV: 'DeeJay TV nézése', liveFrom: 'ÉLŐBEN innen', viewingStore: 'DeeJay bolt megtekintése', shoppingFor: 'DeeJay termékek vásárlása', viewingLegalNotes: 'Jogi megjegyzések megtekintése', viewingRegulations: 'Szabályzatok megtekintése', viewingTDM: 'TDM Reserve megtekintése', readingCookiePolicy: 'Cookie szabályzat olvasása', readingPrivacyPolicy: 'Adatvédelmi irányelvek olvasása', readingAccessibility: 'Akadálymentesítési nyilatkozat olvasása', viewingProfile: 'Felhasználói profil megtekintése' },
  id: { viewingHomepage: 'Melihat beranda', viewingOnAir: 'Melihat Jadwal On Air', viewingSchedule: 'Menelusuri jadwal', viewingPrograms: 'Menelusuri program', viewingProgram: 'Melihat program', hostedBy: 'Dipandu oleh', viewingHighlights: 'Melihat Highlight', viewingEpisodes: 'Melihat Episode', viewingHosts: 'Melihat Host di Tim DeeJay', viewingHost: 'Melihat Host', viewingFrequencies: 'Melihat frekuensi', viewingFrequenciesIn: 'Melihat frekuensi di', viewingNewsletter: 'Melihat Menu Newsletter', viewingApp: 'Melihat Aplikasi DeeJay', viewingContact: 'Melihat halaman kontak', viewingWebradios: 'Menelusuri webradio', viewingWebradio: 'Melihat webradio', viewingRankings: 'Melihat peringkat', viewingTop30: 'Melihat Top 30', viewingDeejayParade: 'Melihat DeeJay Parade', viewingPodcasts: 'Melihat Podcast', viewingPodcast: 'Melihat Podcast', viewingTopics: 'Melihat Topik', viewingTopic: 'Melihat topik', viewingTag: 'Melihat tag', watchingTV: 'Menonton DeeJay TV', liveFrom: 'LIVE dari', viewingStore: 'Melihat Toko DeeJay', shoppingFor: 'Berbelanja merchandise DeeJay', viewingLegalNotes: 'Melihat Catatan Hukum', viewingRegulations: 'Melihat Regulasi', viewingTDM: 'Melihat TDM Reserve', readingCookiePolicy: 'Membaca Kebijakan Cookie', readingPrivacyPolicy: 'Membaca Kebijakan Privasi', readingAccessibility: 'Membaca Pernyataan Aksesibilitas', viewingProfile: 'Melihat profil pengguna' },
  is: { viewingHomepage: 'Skoðar heimasíðu', viewingOnAir: 'Skoðar beinan útsendingaráætlun', viewingSchedule: 'Flettir í gegnum áætlun', viewingPrograms: 'Flettir í gegnum prógram', viewingProgram: 'Skoðar prógram', hostedBy: 'Gestgjafi', viewingHighlights: 'Skoðar hápunkt', viewingEpisodes: 'Skoðar þætti', viewingHosts: 'Skoðar gestgjafa í DeeJay teymi', viewingHost: 'Skoðar gestgjafa', viewingFrequencies: 'Skoðar tíðni', viewingFrequenciesIn: 'Skoðar tíðni í', viewingNewsletter: 'Skoðar fréttabréfamát', viewingApp: 'Skoðar DeeJay forrit', viewingContact: 'Skoðar hafðarsamband síðu', viewingWebradios: 'Flettir í gegnum vefsjónvarp', viewingWebradio: 'Skoðar vefsjónvarp', viewingRankings: 'Skoðar röðun', viewingTop30: 'Skoðar Top 30', viewingDeejayParade: 'Skoðar DeeJay Parade', viewingPodcasts: 'Skoðar hlaðvarp', viewingPodcast: 'Skoðar hlaðvarp', viewingTopics: 'Skoðar efni', viewingTopic: 'Skoðar efni', viewingTag: 'Skoðar tag', watchingTV: 'Horfir á DeeJay TV', liveFrom: 'LIVE frá', viewingStore: 'Skoðar DeeJay verslun', shoppingFor: 'Verslar fyrir DeeJay vörumerki', viewingLegalNotes: 'Skoðar löglegar athugasemdir', viewingRegulations: 'Skoðar reglur', viewingTDM: 'Skoðar TDM Reserve', readingCookiePolicy: 'Lesur vefkökustefnu', readingPrivacyPolicy: 'Lesur persónuverndarstefnu', readingAccessibility: 'Lesur aðgengisyfirlýsingu', viewingProfile: 'Skoðar notandaprofil' },
  it: { viewingHomepage: 'Visualizzazione della homepage', viewingOnAir: 'Visualizzazione del palinsesto in onda', viewingSchedule: 'Sfogliando il palinsesto', viewingPrograms: 'Sfogliando i programmi', viewingProgram: 'Visualizzazione del programma', hostedBy: 'Condotto da', viewingHighlights: 'Visualizzazione degli highlights', viewingEpisodes: 'Visualizzazione delle puntate', viewingHosts: 'Visualizzazione dei conduttori del Team DeeJay', viewingHost: 'Visualizzazione del conduttore', viewingFrequencies: 'Visualizzazione delle frequenze', viewingFrequenciesIn: 'Visualizzazione delle frequenze in', viewingNewsletter: 'Visualizzazione del menu Newsletter', viewingApp: 'Visualizzazione dell\'App DeeJay', viewingContact: 'Visualizzazione della pagina dei contatti', viewingWebradios: 'Sfogliando le webradio', viewingWebradio: 'Visualizzazione della webradio', viewingRankings: 'Visualizzazione delle classifiche', viewingTop30: 'Visualizzazione della Top 30', viewingDeejayParade: 'Visualizzazione della DeeJay Parade', viewingPodcasts: 'Visualizzazione dei podcast', viewingPodcast: 'Visualizzazione di un podcast', viewingTopics: 'Visualizzazione degli argomenti', viewingTopic: 'Visualizzazione dell\'argomento', viewingTag: 'Visualizzazione del tag', watchingTV: 'Guardando DeeJay TV', liveFrom: 'LIVE da', viewingStore: 'Visualizzazione del DeeJay Store', shoppingFor: 'Shopping per merchandise DeeJay', viewingLegalNotes: 'Visualizzazione delle note legali', viewingRegulations: 'Visualizzazione dei regolamenti', viewingTDM: 'Visualizzazione della riserva TDM', readingCookiePolicy: 'Lettura della Cookie Policy', readingPrivacyPolicy: 'Lettura della Privacy Policy', readingAccessibility: 'Lettura della dichiarazione di accessibilità', viewingProfile: 'Visualizzazione del profilo utente' },
  ja: { viewingHomepage: 'ホームページを表示中', viewingOnAir: 'オンエアスケジュールを表示中', viewingSchedule: 'スケジュールをスクロール中', viewingPrograms: 'プログラムをスクロール中', viewingProgram: 'プログラムを表示中', hostedBy: 'ホスト', viewingHighlights: 'ハイライトを表示中', viewingEpisodes: 'エピソードを表示中', viewingHosts: 'DeeJayチームのホストを表示中', viewingHost: 'ホストを表示中', viewingFrequencies: '周波数を表示中', viewingFrequenciesIn: '周波数を表示中', viewingNewsletter: 'ニュースレターメニューを表示中', viewingApp: 'DeeJayアプリを表示中', viewingContact: 'お問い合わせページを表示中', viewingWebradios: 'ウェブラジオをスクロール中', viewingWebradio: 'ウェブラジオを表示中', viewingRankings: 'ランキングを表示中', viewingTop30: 'トップ30を表示中', viewingDeejayParade: 'DeeJayパレードを表示中', viewingPodcasts: 'ポッドキャストを表示中', viewingPodcast: 'ポッドキャストを表示中', viewingTopics: 'トピックを表示中', viewingTopic: 'トピックを表示中', viewingTag: 'タグを表示中', watchingTV: 'DeeJay TVを視聴中', liveFrom: 'ライブ配信', viewingStore: 'DeeJayストアを表示中', shoppingFor: 'DeeJayの商品を購入中', viewingLegalNotes: '法的注意事項を表示中', viewingRegulations: '規制を表示中', viewingTDM: 'TDMリザーブを表示中', readingCookiePolicy: 'Cookieポリシーを読取中', readingPrivacyPolicy: 'プライバシーポリシーを読取中', readingAccessibility: 'アクセシビリティステートメントを読取中', viewingProfile: 'ユーザープロフィールを表示中' },
  jv: { viewingHomepage: 'Ndelok kaca utama', viewingOnAir: 'Ndelok jadwal On Air', viewingSchedule: 'Nggulung jadwal', viewingPrograms: 'Nggulung program', viewingProgram: 'Ndelok program', hostedBy: 'Dipandu dening', viewingHighlights: 'Ndelok Highlight', viewingEpisodes: 'Ndelok Episode', viewingHosts: 'Ndelok Host ing Tim DeeJay', viewingHost: 'Ndelok Host', viewingFrequencies: 'Ndelok frekuensi', viewingFrequenciesIn: 'Ndelok frekuensi ing', viewingNewsletter: 'Ndelok Menu Newsletter', viewingApp: 'Ndelok Aplikasi DeeJay', viewingContact: 'Ndelok kaca kontak', viewingWebradios: 'Nggulung webradio', viewingWebradio: 'Ndelok webradio', viewingRankings: 'Ndelok peringkat', viewingTop30: 'Ndelok Top 30', viewingDeejayParade: 'Ndelok DeeJay Parade', viewingPodcasts: 'Ndelok Podcast', viewingPodcast: 'Ndelok Podcast', viewingTopics: 'Ndelok Topik', viewingTopic: 'Ndelok topik', viewingTag: 'Ndelok tag', watchingTV: 'Nonton DeeJay TV', liveFrom: 'LIVE saka', viewingStore: 'Ndelok Toko DeeJay', shoppingFor: 'Blandhang barang dagangan DeeJay', viewingLegalNotes: 'Ndelok Catetan Hukum', viewingRegulations: 'Ndelok Regulasi', viewingTDM: 'Ndelok TDM Reserve', readingCookiePolicy: 'Maca Kebijakan Cookie', readingPrivacyPolicy: 'Maca Kebijakan Privasi', readingAccessibility: 'Maca Pernyataan Aksesibilitas', viewingProfile: 'Ndelok profil pangguna' },
  ko: { viewingHomepage: '홈페이지 보는 중', viewingOnAir: '온에어 스케줄 보는 중', viewingSchedule: '스케줄 스크롤 중', viewingPrograms: '프로그램 스크롤 중', viewingProgram: '프로그램 보는 중', hostedBy: '진행', viewingHighlights: '하이라이트 보는 중', viewingEpisodes: '에피소드 보는 중', viewingHosts: '디제이 팀 호스트 보는 중', viewingHost: '호스트 보는 중', viewingFrequencies: '주파수 보는 중', viewingFrequenciesIn: '주파수 보는 중', viewingNewsletter: '뉴스레터 메뉴 보는 중', viewingApp: '디제이 앱 보는 중', viewingContact: '연락처 페이지 보는 중', viewingWebradios: '웹라디오 스크롤 중', viewingWebradio: '웹라디오 보는 중', viewingRankings: '순위 보는 중', viewingTop30: '톱 30 보는 중', viewingDeejayParade: '디제이 퍼레이드 보는 중', viewingPodcasts: '팟캐스트 보는 중', viewingPodcast: '팟캐스트 보는 중', viewingTopics: '주제 보는 중', viewingTopic: '주제 보는 중', viewingTag: '태그 보는 중', watchingTV: '디제이 TV 시청 중', liveFrom: '라이브 from', viewingStore: '디제이 스토어 보는 중', shoppingFor: '디제이 상품 쇼핑 중', viewingLegalNotes: '법적 고지 사항 보는 중', viewingRegulations: '규정 보는 중', viewingTDM: 'TDM 예비 보는 중', readingCookiePolicy: '쿠키 정책 읽는 중', readingPrivacyPolicy: '개인정보 처리방침 읽는 중', readingAccessibility: '접근성 선언문 읽는 중', viewingProfile: '사용자 프로필 보는 중' },
  lt: { viewingHomepage: 'Peržiūri pagrindinį puslapį', viewingOnAir: 'Peržiūri tiesioginės transliacijos tvarkaraštį', viewingSchedule: 'Slenka per tvarkaraštį', viewingPrograms: 'Slenka per programas', viewingProgram: 'Peržiūri programą', hostedBy: 'Vedėjas', viewingHighlights: 'Peržiūri akcentus', viewingEpisodes: 'Peržiūri epizodus', viewingHosts: 'Peržiūri vedėjus DeeJay komandoje', viewingHost: 'Peržiūri vedėją', viewingFrequencies: 'Peržiūri dažnius', viewingFrequenciesIn: 'Peržiūri dažnius', viewingNewsletter: 'Peržiūri naujienlaiškio meniu', viewingApp: 'Peržiūri DeeJay programėlę', viewingContact: 'Peržiūri kontaktinį puslapį', viewingWebradios: 'Slenka per internetinius radijus', viewingWebradio: 'Peržiūri internetinį radiją', viewingRankings: 'Peržiūri reitingus', viewingTop30: 'Peržiūri Top 30', viewingDeejayParade: 'Peržiūri DeeJay Parade', viewingPodcasts: 'Peržiūri podcast\'us', viewingPodcast: 'Peržiūri podcast\'ą', viewingTopics: 'Peržiūri temas', viewingTopic: 'Peržiūri temą', viewingTag: 'Peržiūri žymę', watchingTV: 'Žiūri DeeJay TV', liveFrom: 'TIESIOGIAI iš', viewingStore: 'Peržiūri DeeJay parduotuvę', shoppingFor: 'Pirkinėja DeeJay prekes', viewingLegalNotes: 'Peržiūri teisinės pastabas', viewingRegulations: 'Peržiūri reglamentus', viewingTDM: 'Peržiūri TDM Reserve', readingCookiePolicy: 'Skaito slapukų politiką', readingPrivacyPolicy: 'Skaito privatumo politiką', readingAccessibility: 'Skaito prieinamumo pareiškimą', viewingProfile: 'Peržiūri vartotojo profilį' },
  lv: { viewingHomepage: 'Skatās mājaslapu', viewingOnAir: 'Skatās tiešraides grafiku', viewingSchedule: 'Ritina grafiku', viewingPrograms: 'Ritina programmas', viewingProgram: 'Skatās programmu', hostedBy: 'Vada', viewingHighlights: 'Skatās izceltos notikumus', viewingEpisodes: 'Skatās epizodes', viewingHosts: 'Skatās vadītājus DeeJay komandā', viewingHost: 'Skatās vadītāju', viewingFrequencies: 'Skatās frekvences', viewingFrequenciesIn: 'Skatās frekvences', viewingNewsletter: 'Skatās biļetēnu izvēlni', viewingApp: 'Skatās DeeJay lietotni', viewingContact: 'Skatās kontaktu lapu', viewingWebradios: 'Ritina tīmekļa radio', viewingWebradio: 'Skatās tīmekļa radio', viewingRankings: 'Skatās rangojumus', viewingTop30: 'Skatās Top 30', viewingDeejayParade: 'Skatās DeeJay Parade', viewingPodcasts: 'Skatās podcastus', viewingPodcast: 'Skatās podcast', viewingTopics: 'Skatās tēmas', viewingTopic: 'Skatās tēmu', viewingTag: 'Skatās tagu', watchingTV: 'Skatās DeeJay TV', liveFrom: 'TIEŠRAIDĒ no', viewingStore: 'Skatās DeeJay veikalu', shoppingFor: 'Pērk DeeJay preces', viewingLegalNotes: 'Skatās juridiskās piezīmes', viewingRegulations: 'Skatās noteikumus', viewingTDM: 'Skatās TDM Reserve', readingCookiePolicy: 'Lasīs sīkdatņu politiku', readingPrivacyPolicy: 'Lasīs privātuma politiku', readingAccessibility: 'Lasīs pieejamības paziņojumu', viewingProfile: 'Skatās lietotāja profilu' },
  ms: { viewingHomepage: 'Melihat halaman utama', viewingOnAir: 'Melihat Jadual On Air', viewingSchedule: 'Menelusuri jadual', viewingPrograms: 'Menelusuri program', viewingProgram: 'Melihat program', hostedBy: 'Dianjurkan oleh', viewingHighlights: 'Melihat Highlight', viewingEpisodes: 'Melihat Episod', viewingHosts: 'Melihat Hos dalam Pasukan DeeJay', viewingHost: 'Melihat Hos', viewingFrequencies: 'Melihat frekuensi', viewingFrequenciesIn: 'Melihat frekuensi di', viewingNewsletter: 'Melihat Menu Newsletter', viewingApp: 'Melihat Aplikasi DeeJay', viewingContact: 'Melihat halaman hubungan', viewingWebradios: 'Menelusuri webradio', viewingWebradio: 'Melihat webradio', viewingRankings: 'Melihat kedudukan', viewingTop30: 'Melihat Top 30', viewingDeejayParade: 'Melihat DeeJay Parade', viewingPodcasts: 'Melihat Podcast', viewingPodcast: 'Melihat Podcast', viewingTopics: 'Melihat Topik', viewingTopic: 'Melihat topik', viewingTag: 'Melihat tag', watchingTV: 'Menonton DeeJay TV', liveFrom: 'LIVE dari', viewingStore: 'Melihat Kedai DeeJay', shoppingFor: 'Membeli-belah barangan DeeJay', viewingLegalNotes: 'Melihat Nota Undang-undang', viewingRegulations: 'Melihat Peraturan', viewingTDM: 'Melihat TDM Reserve', readingCookiePolicy: 'Membaca Dasar Kuki', readingPrivacyPolicy: 'Membaca Dasar Privasi', readingAccessibility: 'Membaca Penyata Kebolehcapaian', viewingProfile: 'Melihat profil pengguna' },
  no: { viewingHomepage: 'Ser på hjemmesiden', viewingOnAir: 'Ser på sendingplanen', viewingSchedule: 'Ruller gjennom timeplanen', viewingPrograms: 'Ruller gjennom programmer', viewingProgram: 'Ser på program', hostedBy: 'Vert', viewingHighlights: 'Ser på høydepunkter', viewingEpisodes: 'Ser på episoder', viewingHosts: 'Ser på verter i DeeJay-teamet', viewingHost: 'Ser på vert', viewingFrequencies: 'Ser på frekvenser', viewingFrequenciesIn: 'Ser på frekvenser i', viewingNewsletter: 'Ser på nyhetsbrevmenyen', viewingApp: 'Ser på DeeJay-appen', viewingContact: 'Ser på kontaktsiden', viewingWebradios: 'Ruller gjennom webradioer', viewingWebradio: 'Ser på webradio', viewingRankings: 'Ser på rangeringer', viewingTop30: 'Ser på Top 30', viewingDeejayParade: 'Ser på DeeJay Parade', viewingPodcasts: 'Ser på podkaster', viewingPodcast: 'Ser på en podcast', viewingTopics: 'Ser på emner', viewingTopic: 'Ser på emne', viewingTag: 'Ser på stikkord', watchingTV: 'Ser på DeeJay TV', liveFrom: 'DIREKTE fra', viewingStore: 'Ser på DeeJay-butikken', shoppingFor: 'Handler etter DeeJay-merchandise', viewingLegalNotes: 'Ser på juridiske merknader', viewingRegulations: 'Ser på forskrifter', viewingTDM: 'Ser på TDM Reserve', readingCookiePolicy: 'Leser informasjonskapselpolitikk', readingPrivacyPolicy: 'Leser personvernregler', readingAccessibility: 'Leser tilgjengelighetserklæring', viewingProfile: 'Ser på brukerprofil' },
  ro: { viewingHomepage: 'Vizualizare pagină de start', viewingOnAir: 'Vizualizare program difuzare', viewingSchedule: 'Derulare program', viewingPrograms: 'Derulare programe', viewingProgram: 'Vizualizare program', hostedBy: 'Găzduit de', viewingHighlights: 'Vizualizare highlight-uri', viewingEpisodes: 'Vizualizare episoade', viewingHosts: 'Vizualizare prezentatori în echipa DeeJay', viewingHost: 'Vizualizare prezentator', viewingFrequencies: 'Vizualizare frecvențe', viewingFrequenciesIn: 'Vizualizare frecvențe în', viewingNewsletter: 'Vizualizare meniu newsletter', viewingApp: 'Vizualizare aplicația DeeJay', viewingContact: 'Vizualizare pagină contact', viewingWebradios: 'Derulare webradio-uri', viewingWebradio: 'Vizualizare webradio', viewingRankings: 'Vizualizare clasamente', viewingTop30: 'Vizualizare Top 30', viewingDeejayParade: 'Vizualizare DeeJay Parade', viewingPodcasts: 'Vizualizare podcast-uri', viewingPodcast: 'Vizualizare podcast', viewingTopics: 'Vizualizare subiecte', viewingTopic: 'Vizualizare subiect', viewingTag: 'Vizualizare etichetă', watchingTV: 'Vizionare DeeJay TV', liveFrom: 'LIVE din', viewingStore: 'Vizualizare magazin DeeJay', shoppingFor: 'Cumpărături pentru mărfuri DeeJay', viewingLegalNotes: 'Vizualizare note legale', viewingRegulations: 'Vizualizare reglementări', viewingTDM: 'Vizualizare TDM Reserve', readingCookiePolicy: 'Citire politică cookie-uri', readingPrivacyPolicy: 'Citire politică de confidențialitate', readingAccessibility: 'Citire declarație de accesibilitate', viewingProfile: 'Vizualizare profil utilizator' },
  sk: { viewingHomepage: 'Prezeranie domovskej stránky', viewingOnAir: 'Prezeranie vysielacieho programu', viewingSchedule: 'Prechádzanie programu', viewingPrograms: 'Prechádzanie programov', viewingProgram: 'Prezeranie programu', hostedBy: 'Moderuje', viewingHighlights: 'Prezeranie highlightov', viewingEpisodes: 'Prezeranie epizód', viewingHosts: 'Prezeranie moderátorov v tíme DeeJay', viewingHost: 'Prezeranie moderátora', viewingFrequencies: 'Prezeranie frekvencií', viewingFrequenciesIn: 'Prezeranie frekvencií v', viewingNewsletter: 'Prezeranie menu newsletteru', viewingApp: 'Prezeranie aplikácie DeeJay', viewingContact: 'Prezeranie kontaktnej stránky', viewingWebradios: 'Prechádzanie webových rádií', viewingWebradio: 'Prezeranie webového rádia', viewingRankings: 'Prezeranie rebríčkov', viewingTop30: 'Prezeranie Top 30', viewingDeejayParade: 'Prezeranie DeeJay Parade', viewingPodcasts: 'Prezeranie podcastov', viewingPodcast: 'Prezeranie podcastu', viewingTopics: 'Prezeranie tém', viewingTopic: 'Prezeranie témy', viewingTag: 'Prezeranie štítku', watchingTV: 'Sledovanie DeeJay TV', liveFrom: 'NAŽIVO z', viewingStore: 'Prezeranie obchodu DeeJay', shoppingFor: 'Nákup tovaru DeeJay', viewingLegalNotes: 'Prezeranie právnych poznámok', viewingRegulations: 'Prezeranie predpisov', viewingTDM: 'Prezeranie TDM Reserve', readingCookiePolicy: 'Čítanie politiky cookies', readingPrivacyPolicy: 'Čítanie politiky ochrany osobných údajov', readingAccessibility: 'Čítanie vyhlásenia o prístupnosti', viewingProfile: 'Prezeranie používateľského profilu' },
  sl: { viewingHomepage: 'Ogled začetne strani', viewingOnAir: 'Ogled sporeda v živo', viewingSchedule: 'Drsenje po sporedu', viewingPrograms: 'Drsenje po programih', viewingProgram: 'Ogled programa', hostedBy: 'Voditelj', viewingHighlights: 'Ogled poudarkov', viewingEpisodes: 'Ogled epizod', viewingHosts: 'Ogled voditeljev v ekipi DeeJay', viewingHost: 'Ogled voditelja', viewingFrequencies: 'Ogled frekvenc', viewingFrequenciesIn: 'Ogled frekvenc v', viewingNewsletter: 'Ogled menija novice', viewingApp: 'Ogled aplikacije DeeJay', viewingContact: 'Ogled stika strani', viewingWebradios: 'Drsenje po spletnih radijih', viewingWebradio: 'Ogled spletnega radia', viewingRankings: 'Ogled lestvic', viewingTop30: 'Ogled Top 30', viewingDeejayParade: 'Ogled DeeJay Parade', viewingPodcasts: 'Ogled podcastov', viewingPodcast: 'Ogled podcasta', viewingTopics: 'Ogled tem', viewingTopic: 'Ogled teme', viewingTag: 'Ogled oznake', watchingTV: 'Gledanje DeeJay TV', liveFrom: 'V ŽIVO iz', viewingStore: 'Ogled trgovine DeeJay', shoppingFor: 'Nakupovanje blaga DeeJay', viewingLegalNotes: 'Ogled pravnih opomb', viewingRegulations: 'Ogled predpisov', viewingTDM: 'Ogled TDM Reserve', readingCookiePolicy: 'Branje politike piškotkov', readingPrivacyPolicy: 'Branje politike zasebnosti', readingAccessibility: 'Branje izjave o dostopnosti', viewingProfile: 'Ogled uporabniškega profila' },
  sv: { viewingHomepage: 'Visar hemsidan', viewingOnAir: 'Visar sändningstabellen', viewingSchedule: 'Rullar genom schemat', viewingPrograms: 'Rullar genom programmen', viewingProgram: 'Visar program', hostedBy: 'Värd', viewingHighlights: 'Visar höjdpunkter', viewingEpisodes: 'Visar avsnitt', viewingHosts: 'Visar värdar i DeeJay-teamet', viewingHost: 'Visar värd', viewingFrequencies: 'Visar frekvenser', viewingFrequenciesIn: 'Visar frekvenser i', viewingNewsletter: 'Visar nyhetsbrevmenyn', viewingApp: 'Visar DeeJay-appen', viewingContact: 'Visar kontaktsidan', viewingWebradios: 'Rullar genom webbradioer', viewingWebradio: 'Visar webbradio', viewingRankings: 'Visar rankinglistor', viewingTop30: 'Visar Top 30', viewingDeejayParade: 'Visar DeeJay Parade', viewingPodcasts: 'Visar podcast', viewingPodcast: 'Visar en podcast', viewingTopics: 'Visar ämnen', viewingTopic: 'Visar ämne', viewingTag: 'Visar tagg', watchingTV: 'Tittar på DeeJay TV', liveFrom: 'LIVE från', viewingStore: 'Visar DeeJay-butiken', shoppingFor: 'Handlar DeeJay-merchandise', viewingLegalNotes: 'Visar juridiska anmärkningar', viewingRegulations: 'Visar föreskrifter', viewingTDM: 'Visar TDM Reserve', readingCookiePolicy: 'Läser cookiepolicy', readingPrivacyPolicy: 'Läser integritetspolicy', readingAccessibility: 'Läser tillgänglighetsuttalande', viewingProfile: 'Visar användarprofil' },
  th: { viewingHomepage: 'กำลังดูหน้าแรก', viewingOnAir: 'กำลังดูตารางออกอากาศ', viewingSchedule: 'กำลังเลื่อนตารางออกอากาศ', viewingPrograms: 'กำลังเลื่อนรายการ', viewingProgram: 'กำลังดุรายการ', hostedBy: 'ดำเนินรายการโดย', viewingHighlights: 'กำลังดูไฮไลท์', viewingEpisodes: 'กำลังดูตอน', viewingHosts: 'กำลังดูผู้ดำเนินรายการในทีมดีเจ', viewingHost: 'กำลังดูผู้ดำเนินรายการ', viewingFrequencies: 'กำลังดูความถี่', viewingFrequenciesIn: 'กำลังดูความถี่ใน', viewingNewsletter: 'กำลังดูเมนูจดหมายข่าว', viewingApp: 'กำลังดูแอปดีเจ', viewingContact: 'กำลังดูหน้าติดต่อ', viewingWebradios: 'กำลังเลื่อนเว็บวิทยุ', viewingWebradio: 'กำลังดูเว็บวิทยุ', viewingRankings: 'กำลังดูการจัดอันดับ', viewingTop30: 'กำลังดู Top 30', viewingDeejayParade: 'กำลังดูดีเจพาเหรด', viewingPodcasts: 'กำลังดูพอดแคสต์', viewingPodcast: 'กำลังดูพอดแคสต์', viewingTopics: 'กำลังดูหัวข้อ', viewingTopic: 'กำลังดูหัวข้อ', viewingTag: 'กำลังดูแท็ก', watchingTV: 'กำลังดูดีเจทีวี', liveFrom: 'ถ่ายทอดสดจาก', viewingStore: 'กำลังดูร้านค้าดีเจ', shoppingFor: 'กำลังซื้อสินค้าดีเจ', viewingLegalNotes: 'กำลังดูหมายเหตุทางกฎหมาย', viewingRegulations: 'กำลังดูข้อบังคับ', viewingTDM: 'กำลังดู TDM Reserve', readingCookiePolicy: 'กำลังอ่านนโยบายคุกกี้', readingPrivacyPolicy: 'กำลังอ่านนโยบายความเป็นส่วนตัว', readingAccessibility: 'กำลังอ่านคำแถลงการเข้าถึง', viewingProfile: 'กำลังดูโปรไฟล์ผู้ใช้' },
  tr: { viewingHomepage: 'Ana sayfayı görüntülüyor', viewingOnAir: 'Yayın Akışı\'nı görüntülüyor', viewingSchedule: 'Programı kaydırıyor', viewingPrograms: 'Programları kaydırıyor', viewingProgram: 'Programı görüntülüyor', hostedBy: 'Sunucu', viewingHighlights: 'Öne Çıkanlar\'ı görüntülüyor', viewingEpisodes: 'Bölümleri görüntülüyor', viewingHosts: 'DeeJay Ekibi\'ndeki sunucuları görüntülüyor', viewingHost: 'Sunucuyu görüntülüyor', viewingFrequencies: 'Frekansları görüntülüyor', viewingFrequenciesIn: 'Frekansları görüntülüyor', viewingNewsletter: 'Bülten Menüsü\'nü görüntülüyor', viewingApp: 'DeeJay Uygulaması\'nı görüntülüyor', viewingContact: 'İletişim sayfasını görüntülüyor', viewingWebradios: 'Web radyolarını kaydırıyor', viewingWebradio: 'Web radyosunu görüntülüyor', viewingRankings: 'Sıralamaları görüntülüyor', viewingTop30: 'Top 30\'u görüntülüyor', viewingDeejayParade: 'Deejay Parade\'i görüntülüyor', viewingPodcasts: 'Podcast\'leri görüntülüyor', viewingPodcast: 'Bir podcast görüntülüyor', viewingTopics: 'Konuları görüntülüyor', viewingTopic: 'Konuyu görüntülüyor', viewingTag: 'Etiketi görüntülüyor', watchingTV: 'Deejay TV izliyor', liveFrom: 'CANLI yayın', viewingStore: 'Deejay Mağazası\'nı görüntülüyor', shoppingFor: 'Deejay ürünleri alışverişi', viewingLegalNotes: 'Yasal Notlar\'ı görüntülüyor', viewingRegulations: 'Yönetmelikleri görüntülüyor', viewingTDM: 'TDM Reserve\'ü görüntülüyor', readingCookiePolicy: 'Çerez Politikası\'nı okuyor', readingPrivacyPolicy: 'Gizlilik Politikası\'nı okuyor', readingAccessibility: 'Erişilebilirlik Beyanı\'nı okuyor', viewingProfile: 'Kullanıcı profilini görüntülüyor' },
  vi: { viewingHomepage: 'Đang xem trang chủ', viewingOnAir: 'Đang xem lịch phát sóng', viewingSchedule: 'Đang cuộn lịch phát sóng', viewingPrograms: 'Đang cuộn chương trình', viewingProgram: 'Đang xem chương trình', hostedBy: 'Được dẫn bởi', viewingHighlights: 'Đang xem điểm nổi bật', viewingEpisodes: 'Đang xem tập', viewingHosts: 'Đang xem Người dẫn trong đội DeeJay', viewingHost: 'Đang xem Người dẫn', viewingFrequencies: 'Đang xem tần số', viewingFrequenciesIn: 'Đang xem tần số tại', viewingNewsletter: 'Đang xem menu bản tin', viewingApp: 'Đang xem ứng dụng DeeJay', viewingContact: 'Đang xem trang liên hệ', viewingWebradios: 'Đang cuộn webradio', viewingWebradio: 'Đang xem webradio', viewingRankings: 'Đang xem bảng xếp hạng', viewingTop30: 'Đang xem Top 30', viewingDeejayParade: 'Đang xem DeeJay Parade', viewingPodcasts: 'Đang xem podcast', viewingPodcast: 'Đang xem một podcast', viewingTopics: 'Đang xem chủ đề', viewingTopic: 'Đang xem chủ đề', viewingTag: 'Đang xem thẻ', watchingTV: 'Đang xem DeeJay TV', liveFrom: 'TRỰC TIẾP từ', viewingStore: 'Đang xem cửa hàng DeeJay', shoppingFor: 'Đang mua sắm hàng hóa DeeJay', viewingLegalNotes: 'Đang xem ghi chú pháp lý', viewingRegulations: 'Đang xem quy định', viewingTDM: 'Đang xem TDM Reserve', readingCookiePolicy: 'Đang đọc chính sách cookie', readingPrivacyPolicy: 'Đang đọc chính sách bảo mật', readingAccessibility: 'Đang đọc tuyên bố về khả năng tiếp cận', viewingProfile: 'Đang xem hồ sơ người dùng' },
}

async function getStrings(): Promise<Strings> {
  const lang = await presence.getSetting<string>('lang').catch(() => 'en')
  return strings[lang]! || strings.en
}

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/GtIwyQT.png',
}

presence.on('UpdateData', async () => {
  const { pathname, hostname } = document.location
  const stringsData = await getStrings()
  const showTimestamps = await presence.getSetting<boolean>('timestamps').catch(() => true)

  const presenceData: PresenceData = {
    largeImageKey: ActivityAssets.Logo,
    details: '',
    startTimestamp: showTimestamps ? browsingTimestamp : undefined,
  }

  if (pathname === '/') {
    presenceData.details = 'DEEJAY'
    presenceData.state = stringsData.viewingHomepage
  }
  else if (pathname.includes('/on-air')) {
    presenceData.details = stringsData.viewingOnAir
  }
  else if (pathname.includes('/alexa')) {
    presenceData.details = stringsData.viewingApp
  }
  else if (pathname.includes('/palinsesto')) {
    presenceData.details = stringsData.viewingSchedule
  }
  else if (pathname.includes('/programmi')) {
    presenceData.details = stringsData.viewingPrograms
    presenceData.state = 'deejay.it/programmi'

    const programs = [
      { path: '/deejay-chiama-italia', name: 'Deejay Chiama Italia', hosts: 'Linus e Nicola Savino' },
      { path: '/chiamate-roma-triuno-triuno/', name: 'Chiamate Roma Triuno Triuno', hosts: 'Trio Medusa' },
      { path: '/il-volo-del-mattino', name: 'Il Volo Del Mattino', hosts: 'Fabio Volo' },
      { path: '/pinocchio', name: 'Pinocchio', hosts: 'Diego Passoni, La Pina, Valentina Ricci' },
      { path: '/catteland', name: 'Catteland', hosts: 'Alessandro Cattelan' },
      { path: '/summer-camp', name: 'Summer Camp', hosts: 'Aladyn, Federico Russo, Francesco Quarna, Nikki' },
      { path: '/say-waaad', name: 'Say Waaad?', hosts: 'Wad' },
      { path: '/gianluca-gazzoli', name: 'Gazzology', hosts: 'Gianluca Gazzoli' },
      { path: '/pecchia-damiani', name: 'Pecchia e Damiani', hosts: 'Davide Damiani e Federico Pecchia' },
      { path: '/006', name: '006', hosts: 'Umberto e Damiano' },
      { path: '/andrea-e-michele', name: 'Andy e Mike', hosts: 'Andrea Marchesi e Michele Mainardi' },
      { path: '/diego-passoni', name: 'Diego Passoni', hosts: 'Diego Passoni' },
      { path: '/vic-e-marisa', name: 'Vic e Marisa', hosts: 'Marisa Passera e Vic' },
      { path: '/ciao-belli', name: 'Ciao Belli', hosts: 'Dj Angelo e Roberto Ferrari' },
      { path: '/chiacchiericcio', name: 'Chiacchiericcio', hosts: 'Chiara Galeazzi e Francesco Lancia' },
      { path: '/dee-notte', name: 'Dee Notte', hosts: 'Gianluca Vitiello e Nicola Vitiello' },
      { path: '/radar', name: 'Radar', hosts: 'Carlotta Multari e Francesco Quarna' },
      { path: '/deejay-training-center', name: 'Deejay Training Center', hosts: '' },
      { path: '/florencia', name: '¡Hola Deejay!', hosts: 'Florencia' },
      { path: '/legend', name: 'Legend', hosts: 'Aladyn e Alex Farolfi' },
      { path: '/rudy-e-laura', name: 'Rudy e Laura', hosts: 'Laura Antonini e Rudy Zerbi' },
      { path: '/la-bomba', name: 'La Bomba', hosts: 'Luciana Littizzetto e Vic' },
      { path: '/gibi-show', name: 'GiBi Show', hosts: 'Guido Bagatta' },
      { path: '/animal-house', name: 'Animal House', hosts: 'Dunia Rahwan e Paolo Menegatti' },
      { path: '/deejay-football-club', name: 'Deejay Football Club', hosts: 'Fabio Caressa e Ivan Zazzaroni' },
      { path: '/deejay-on-the-road', name: 'Deejay On The Road', hosts: 'Frank' },
      { path: '/deejay-time-stories', name: 'Deejay Time Stories', hosts: 'Albertino' },
      { path: '/deejay-parade', name: 'Deejay Parade', hosts: 'Albertino' },
      { path: '/deejay-time', name: 'Deejay Time', hosts: '' },
      { path: '/il-boss-del-weekend', name: 'Il Boss Del Weekend', hosts: 'Daniele Bossari' },
      { path: '/no-spoiler', name: 'No Spoiler', hosts: 'Antonio Visca' },
      { path: '/sunday-morning', name: 'Sunday Morning', hosts: '' },
    ]

    for (const program of programs) {
      if (pathname.includes(program.path)) {
        presenceData.details = `${stringsData.viewingProgram}: ${program.name}`
        if (program.hosts) {
          presenceData.state = `${stringsData.hostedBy}: ${program.hosts}`
        }
        break
      }
    }
  }
  else if (pathname.includes('/highlights')) {
    presenceData.details = stringsData.viewingHighlights
  }
  else if (pathname.includes('/puntate')) {
    presenceData.details = stringsData.viewingEpisodes
  }
  else if (pathname.includes('/conduttori')) {
    presenceData.details = stringsData.viewingHosts

    const hosts = [
      { path: '/linus', name: 'Linus', desc: '30 ottobre 1957, Foligno (PG). è la data di nascita "anagrafica" di Pasquale Di Molfetta, in arte Linus. 18 aprile 1976, Milano. è la data di nascita "radiofonica", il debutto, assolutamente...' },
      { path: '/albertino', name: 'Albertino', desc: 'Alberto Di Molfetta è nato a Paderno Dugnano (MI) il 7 Agosto 1962. Il suo debutto radiofonico avviene nel 1978 a Radio Music, una piccola emittente dell\'hinterland milanese che qualche tem...' },
      { path: '/alessandro-cattelan', name: 'Alessandro Cattelan', desc: 'Alessandro Cattelan nasce a Tortona l\' 11 Maggio 1980. Poi non fa niente di particolarmente interessante ( a parte giocare a calcio ) fino al 2001, anno in cui inizia a condurre il suo prim...' },
      { path: '/alessandro-prisco', name: 'Alessandro Prisco', desc: 'La prima a capire che la pigrizia non sarebbe stata tra le sue "qualità " fu sua madre, costretta al parto in un afoso pomeriggio di fine agosto con oltre due settimane di anticipo. "Esci!",...' },
      { path: '/andrea', name: 'Andrea Marchesi', desc: 'Andrea Marchesi (Cremona, 30 novembre 1973) fa il suo esordio radiofonico nel 1993 in una radio locale di Cremona, Studioradio, dove conduce il programma dance del pomeriggio "House-Party"...' },
      { path: '/antonio-visca', name: 'Antonio Visca', desc: 'Antonio Visca (Alessandria, 19 Gennaio 1975) si divide da sempre tra le sue grandi passioni: radio e tv. E ultimamente anche podcast! Dopo la Laurea in Economia Aziendale ha lavorato a Disne...' },
      { path: '/chiara-galeazzi', name: 'Chiara Galeazzi', desc: 'Chiara Galeazzi è nata a Milano nel 3 dicembre 1986. Nel 2010 ha iniziato a lavorare da VICE Italia dove è rimasta cinque anni come magazine editor, host di reportage e presentatrice del pro...' },
      { path: '/claudio-lauretta', name: 'Claudio Lauretta', desc: 'Imitatore, attore e comico visto a Striscia la Notizia, Markette, Zelig, Chiambretti Night, Glob, Quelli che il calcio, Italia\'s Got Talent, Le Iene e Colorado. Camaleontico e trasformista,...' },
      { path: '/daniele-bossari', name: 'Daniele Bossari', desc: '2018 Conduce Chi ha paura del buio? (Italia1) 2017 Vincitore del GF VIP (Canale5) 2016 - 2009 conduce il programma di prima serata Mistero (Italia1) 2016 - 2013 presenta i Radio Italia Live...' },
      { path: '/davide-damiani', name: 'Davide Damiani', desc: 'Davide Damiani nasce a Pistoia il 5 febbraio 1988. Dopo diversi anni da animatore nei villaggi turistici, decide di fermarsi per studiare teatro a Milano. La radio arriva nel 2017 con la par...' },
      { path: '/diego', name: 'Diego Passoni', desc: 'Sono nato a Monza il 21 Settembre del 1976. Conquisto un glorioso e inaccessibile diploma in ragioneria, dopo il quale, spinto da un viscerale istinto filantropo, mi iscrivo a Scienze dell\'...' },
      { path: '/dj-angelo', name: 'Dj Angelo', desc: 'Comincia la sua attività  presso i banchi dell\'Istituto Tecnico Martino Bassi di Seregno ma, subito dopo (all\'età  di 6 anni), si accorge che di Ragioneria non ne capisce niente. Dalla "matu...' },
      { path: '/dunia-rahwan', name: 'Dunia Rahwan', desc: 'Su Instagram: @dunia_animalara Nata e cresciuta a Milano, classe 1978, fin da piccolissima manifesta un amore incondizionato per gli animali e, di conseguenza, per la natura. Cresciuta con...' },
      { path: '/fabio-caressa', name: 'Fabio Caressa', desc: 'Fabio Caressa (Roma, 18 aprile 1967) è un giornalista, conduttore televisivo e telecronista sportivo italiano. Inizia a lavorare in televisione nel 1986 presso Canale 66, emittente locale ro...' },
      { path: '/fabio-volo', name: 'Fabio Volo', desc: 'Fabio Bonetti, in arte Fabio Volo, nasce il 23 giugno 1972. 1996 Claudio Cecchetto gli propone di lavorare come speaker a Radio Capital. 1997 Match Music gli propone un contratto per il prog...' },
      { path: '/federico-russo', name: 'Federico Russo', desc: 'Federico Russo nasce a Firenze alle quattro e venti del pomeriggio del 22 dicembre 1980. Frequenta il liceo classico e la spunta liscio liscio con un fiero 60/100 alla maturità . Negli anni d...' },
      { path: '/federico-pecchia', name: 'Federico Pecchia', desc: 'Federico Pecchia nasce a Piombino (LI) il 4 marzo 1991. Fin da piccolo coltiva quella che è la sua pià¹ grande passione: stare su un palco, cosà¬ studia recitazione e improvvisazione teatrale...' },
      { path: '/florencia', name: 'Florencia', desc: 'Florencia Di Stefano-Abichain, argentina d\'origine, veronese d\'adozione, gira l\'Europa prima di approdare a Milano. Ora vive a Milano e lavora come speaker radiofonica, conduttrice, autri...' },
      { path: '/francesco-quarna', name: 'Francesco Quarna', desc: 'Francesco Quarna, DJ e vignaiolo, è in diretta a Summer Camp, con Nikki e Federico Russo da lunedà¬ a venerdà¬ alle 15 su Radio DEEJAY. Nato il 30 ottobre 1980 a Varallo (VC), all\'ombra del M...' },
      { path: '/francesco-lancia', name: 'Francesco Lancia', desc: 'Francesco Lancia nasce a Terni nel 1981. Abbandona l\'idea di mettere a frutto la sudata laurea con lode in informatica poco dopo averla presa per dedicarsi al mondo della scrittura comica,...' },
      { path: '/frank', name: 'Frank', desc: 'Francesco "Frank" Lotta nasce a Grottaglie il 26 agosto 1978. Ha passato tutta la sua adolescenza in Puglia. Collabora con Radio Lattemiele Taranto fino al 2002, in qualità  di programmatore...' },
      { path: '/gianluca-gazzoli', name: 'Gianluca Gazzoli', desc: 'Gianluca Gazzoli nasce il 18/08/1988, è un conduttore radiofonico e televisivo, un videomaker e narratore di storie. Tra i nuovi volti del mondo dello spettacolo e di una nuova generazione d...' },
      { path: '/gianluca-vitiello', name: 'Gianluca Vitiello', desc: 'Gianluca Vitiello nasce a C. Mare di Stabia in provincia di Napoli nel luglio del 1976. Cancro ascendente Cancro. Si interessa di tutti i fenomeni legati alle culture urbane e metropolitane...' },
      { path: '/guido-bagatta', name: 'Guido Bagatta', desc: 'Guido Bagatta (Milano, 24 maggio 1960) è un giornalista, conduttore televisivo e conduttore radiofonico italiano. Dopo aver studiato inglese e lettere negli Stati Uniti d\'America presso l\'...' },
      { path: '/ivan-zazzaroni', name: 'Ivan Zazzaroni', desc: 'Claudio Cerasa, il Foglio: "Baggio, Pantani, Zazza e riga al centro. Ivan Zazzaroni è riuscito a diventare uno dei giornalisti sportivi pià¹ famosi d\'Italia senza aver avuto il bisogno di in...' },
      { path: '/la-pina', name: 'La Pina', desc: 'Nasce a Firenze il 20 giugno del 1970, nel 1973 si trasferisce con i genitori a Milano. Qui dopo la scuola dell\'obbligo si iscrive all\'ITSOS (Istituto Tecnico Statale a Ordinamento Special...' },
      { path: '/laura-antonini', name: 'Laura Antonini', desc: 'Sono nata a Bologna ma cresciuta a Roma dove vivo attualmente, dopo una parentesi milanese durata otto anni, per amore della mia radio preferita. Pensavo di fare la traduttrice nella vita, m...' },
      { path: '/luciana-littizzetto', name: 'Luciana Littizzetto', desc: 'Attrice e autrice, Luciana Littizzetto è nata a Torino, la città  in cui vive. Diplomata al Conservatorio in pianoforte nel 1984, si è laureata in Lettere alla facoltà  di Magistero nel 1990,...' },
      { path: '/marisa-passera', name: 'Marisa Passera', desc: 'Una mattina presto, nella vecchia casa della Pina, la sede di Varese, quella con il telefono in corridoio e la tappezzeria marrone psichedelica, è arrivata una telefonata che diceva: ma tu l...' },
      { path: '/michele', name: 'Michele Mainardi', desc: 'Andrea Marchesi (30 novembre 1973) e Michele Mainardi (17 maggio 1973) si sono conosciuti all\'età  di 14 anni sui banchi di scuola del Liceo Scientifico G.Aselli di Cremona , città  dove entr...' },
      { path: '/matteo-curti', name: 'Matteo Curti', desc: 'Matteo Curti è un autore radiofonico, televisivo, videomaker e fotografo nato a Roma nel 1975. Dopo una lunga gavetta nelle radio locali e una serie di incarichi che spaziavano dalla riparaz...' },
      { path: '/mauro-miclini', name: 'Mauro Miclini', desc: 'Mauro Miclini nasce a Darfo Boario Terme (BS) . All\' inizio degli anni \'80 comincia le prime esperienze radiofoniche a Radio Adamello, dove si occupa della regia e della selezione musicale...' },
      { path: '/nicola-savino', name: 'Nicola Savino', desc: 'Nicola Savino nasce a Lucca il 14 novembre 1967. Inizia a lavorare nel 1984 nella piccola emittente locale: Radio sandonato. Nei 5 anni successivi, in cui si divide tra radio e discoteche, c...' },
      { path: '/nicola-vitiello', name: 'Nicola Vitiello', desc: '300 Premi Fedeltà  vinti!!! Sarà  stato questo a fare letteralmente innamorare Nicola di Radio Deejay? E\' iniziata proprio in questo modo, a 15 anni, la sua avventura radiofonica: da ascoltat...' },
      { path: '/nikki', name: 'Nikki', desc: 'Fabrizio Lavoro in arte Nikki, nasce a Foggia il 7/7/1971. Nikki, che significa diario in giapponese (è stato anche un movimento letterario nipponico), nasce artisticamente come chitarrista-...' },
      { path: '/paolo-menegatti', name: 'Paolo Menegatti', desc: 'Nato a Milano il 23/03/73, monzese d\'adozione. Il fatto che metà  del suo cognome sia formato dalla parola "gatti" potrebbe sembrare un segno del destino. Sono proprio i gatti le prime "best...' },
      { path: '/roberto-ferrari', name: 'Roberto Ferrari', desc: 'Roberto Ferrari è nato a Milano il 13 Giugno 1965 e fin da giovanissimo ha una grandissima passione per la radio. Frequenta la scuola di perito elettronico e proprio durante gli studi, utili...' },
      { path: '/rudy-zerbi', name: 'Rudy Zerbi', desc: 'Nasce il 3 febbraio 1969 a Lodi e si trasferisce a Santa Margherita Ligure. Decide di seguire la propria passione per la musica, diventando innanzitutto disc jockey alla discoteca Covo di No...' },
      { path: '/trio-medusa', name: 'Trio Medusa', desc: 'La loro storia, raccontata in prima persona plurale nel libro "Culattoni e raccomandati", ha inizio quando in giovane età  frequentano tutti e tre la stessa località  di mare per le vacanze es...' },
      { path: '/umberto-e-damiano', name: 'Umberto e Damiano', desc: 'Umberto Muscetta e Damiano Paolacci crescono a Fiumicino a pochi passi dal celebre aeroporto romano. Amici già  dai tempi di Schule, all\'età  di 16 anni formano il duo comico "Umberto e Damia...' },
      { path: '/valentina-ricci', name: 'Valentina Ricci', desc: 'Valentina nasce e vive alla periferia ovest di Milano. Studentessa modello, fino alle medie, colleziona una serie di insuccessi scolastici che passando dal raggiungimento della maturità  clas...' },
      { path: '/vic', name: 'Vic', desc: 'Nato a Monza (MI) il 29 dicembre 1972, inizia da piccole radio locali, riuscendo a finire ragioneria, iscrivendosi poi a legge. Nel 2000 Canale 5 presenta la prima edizione del Grande Fratel...' },
      { path: '/wad', name: 'Wad', desc: 'Radio personality, giornalista e scrittore. àˆ considerato una delle figure pià¹ influenti nel settore "urban" italiano. Conduce Say Waaad!?! su Radio DEEJAY, suonando e raccontando il "nuovo"...' },
    ]

    for (const host of hosts) {
      if (pathname.includes(host.path)) {
        presenceData.details = `${stringsData.viewingHost}: ${host.name}`
        presenceData.state = host.desc
        break
      }
    }
  }
  else if (pathname.includes('/frequenze')) {
    presenceData.details = stringsData.viewingFrequencies

    const regions = [
      'abruzzo',
      'basilicata',
      'calabria',
      'campania',
      'emilia-romagna',
      'friuli-venezia-giulia',
      'lazio',
      'liguria',
      'lombardia',
      'marche',
      'molise',
      'piemonte',
      'puglia',
      'sardegna',
      'sicilia',
      'toscana',
      'trentino-alto-adige',
      'umbria',
      'valle-daosta',
      'veneto',
    ]

    for (const region of regions) {
      if (pathname.includes(region)) {
        presenceData.details = `${stringsData.viewingFrequenciesIn}: ${region.charAt(0).toUpperCase() + region.slice(1).replace(/-/g, ' ')}`
        break
      }
    }
  }
  else if (pathname.includes('/clp/accounts/sites/deejay/www/newsletter.php')) {
    presenceData.details = stringsData.viewingNewsletter
  }
  else if (pathname.includes('/app-ios-e-android')) {
    presenceData.details = stringsData.viewingApp
  }
  else if (pathname.includes('/contatti')) {
    presenceData.details = stringsData.viewingContact
  }
  else if (pathname.includes('/webradio')) {
    presenceData.details = stringsData.viewingWebradios

    const webradios = [
      { path: '/01', name: 'Deejay 80' },
      { path: '/02', name: 'Deejay Time' },
      { path: '/03', name: 'Deejay Tropical Pizza' },
      { path: '/04', name: 'Deejay One Two One Two' },
      { path: '/05', name: 'Radio Linetti' },
      { path: '/06', name: 'Deejay 30 Songs' },
      { path: '/07', name: 'Deejay Suona Italia' },
      { path: '/08', name: 'Deejay Gasolina' },
      { path: '/09', name: 'Deejay On The Road' },
      { path: '/10', name: 'Deejay One Love' },
    ]

    for (const webradio of webradios) {
      if (pathname.includes(webradio.path)) {
        presenceData.details = `${stringsData.viewingWebradio}: ${webradio.name}`
        break
      }
    }
  }
  else if (pathname.includes('/classifiche')) {
    presenceData.details = stringsData.viewingRankings

    if (pathname.includes('/30-songs')) {
      presenceData.details = stringsData.viewingTop30
    }
    else if (pathname.includes('/deejay-parade')) {
      presenceData.details = stringsData.viewingDeejayParade
    }
  }
  else if (pathname.includes('/podcast')) {
    presenceData.details = stringsData.viewingPodcasts
  }
  else if (pathname.includes('/podcast')) {
    presenceData.details = stringsData.viewingPodcast
  }
  else if (pathname.includes('/argomenti')) {
    presenceData.details = stringsData.viewingTopics

    if (pathname.includes('/news')) {
      presenceData.details = `${stringsData.viewingTopic}: News`
    }
    else if (pathname.includes('/deejay-consiglia')) {
      presenceData.details = `${stringsData.viewingTopic}: Deejay Consiglia`
    }
    else if (pathname.includes('/argomenti/regolamenti')) {
      presenceData.details = stringsData.viewingRegulations
    }
  }
  else if (pathname.includes('/tag')) {
    const tags = [
      { path: '/radio', name: 'Radio' },
      { path: '/musica', name: 'Musica' },
      { path: '/sport', name: 'Sport' },
      { path: '/personaggi', name: 'Personaggi' },
      { path: '/cinema', name: 'Cinema' },
      { path: '/lifestyle', name: 'Lifestyle' },
    ]

    for (const tag of tags) {
      if (pathname.includes(tag.path)) {
        presenceData.details = `${stringsData.viewingTag}: ${tag.name}`
        break
      }
    }
  }
  else if (pathname.includes('/tv')) {
    presenceData.details = stringsData.watchingTV
    presenceData.state = `${stringsData.liveFrom} deejay.it/tv`
  }
  else if (hostname.includes('store.deejay.it')) {
    presenceData.details = stringsData.viewingStore
    presenceData.state = stringsData.shoppingFor
  }
  else if (pathname.includes('/note-legali')) {
    presenceData.details = stringsData.viewingLegalNotes
  }
  else if (pathname.includes('/corporate/tdm/elemedia/')) {
    presenceData.details = stringsData.viewingTDM
  }
  else if (pathname.includes('/corporate/privacy/deejay/cookie-policy.html')) {
    presenceData.details = stringsData.readingCookiePolicy
  }
  else if (pathname.includes('/corporate/privacy/privacy.html')) {
    presenceData.details = stringsData.readingPrivacyPolicy
  }
  else if (pathname.includes('/corporate/dichiarazione-accessibilita/deejay/')) {
    presenceData.details = stringsData.readingAccessibility
  }
  else if (pathname.includes('/clp/accounts/sites/deejay/www/profile.php')) {
    presenceData.details = stringsData.viewingProfile
  }

  if (presenceData.details) {
    presence.setActivity(presenceData)
  }
  else {
    presence.clearActivity()
  }
})

export enum Images {
  AnimatedLogo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/1.gif',
  AnimetedLogo2 = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/2.gif',
  Logo = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/logo.png',
  LogoNoBg = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/3.png',
  SettingsICO = 'https://cdn.rcd.gg/PreMiD/websites/A/Anizium/assets/0.png',
}

export interface AniziumSettings {
  privacy: boolean
  showButtons: boolean
  showPosters: boolean
  logoType: number
  showTimestamp: boolean
  watchingDetails: string
  watchingState: string
}

export interface IframeData {
  duration: number
  currentTime: number
  paused: boolean
}

export const GenreMap: Record<string, string> = {
  2263: 'Video Oyunları',
  59517: 'Politik',
  38454: 'Vampir',
  46190: 'Ajan',
  72405: 'Dedektif',
  38932: 'Reenkarnasyon',
  21923: 'Şehir Macerası',
  90158: 'Bilim Kurgu',
  30302: 'Uzay',
  25731: 'Spor',
  75150: 'Sanat',
  8159: 'Tarih',
  41359: 'Strateji Oyunları',
  84484: 'Ödüllü Animeler',
  33458: 'Hayatta Kalma',
  40034: 'Askeri',
  88689: 'Dövüş Sanatları',
  17263: 'Ecchi',
  73510: 'Harem',
  82742: 'Büyü ve Kılıç',
  43306: 'Mitoloji',
  81980: 'Aşk Üçgeni',
  7628: 'Korku',
  78746: 'Gizem',
  34953: 'Iyashikei',
  11860: 'Doğaüstü',
  54464: 'Aile ve Çocuk',
  57593: 'Gerilim',
  92619: 'Karanlık Fantastik',
  29049: 'Psikolojik',
  14837: 'Gençlik Hikayesi',
  79793: 'Vahşet',
  66407: 'Türkçe Dublaj',
  79741: 'İngilizce Dublaj',
  15055: 'Çoklu Alt Yazı',
  73505: 'Okul',
  43261: 'Fantastik',
  57282: 'Dram',
  40561: 'Absürt Komedi',
  33359: 'Zaman Yolculuğu',
  59624: 'Romantizm',
  53897: 'Çete',
  4088: 'Suç',
  50737: 'Parodi',
  40838: 'Kara Mizah',
  47450: 'Komedi',
  47202: 'Yaşamdan Kesitler',
  98901: 'Shojo',
  94032: 'Shounen',
  87910: 'Seinen',
  21846: 'Meka',
  23813: 'Isekai',
  5263: 'Macera',
  19214: 'Süper Güçler',
  63917: 'Samuray',
  62263: 'Aksiyon',
}

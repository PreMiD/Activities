import { ActivityType, Assets, StatusDisplayType } from 'premid'

const presence = new Presence({
  clientId: '1443855259536461928',
})

const browsingTimestamp = Math.floor(Date.now() / 1000)

enum ActivityAssets {
  Logo = 'https://i.imgur.com/Lph77V5.png',
}

interface DataJembatanSonora {
  adaLagu: boolean
  sedangPutar: boolean
  mode: 'lagu' | 'video'
  perangkat: string
  judul: string
  artis: string
  album: string
  sampul: string
  sampulStatis: string
  sampulGif: string
  posisi: number
  durasi: number
  urlLagu: string
  urlArtis: string
  urlAlbum: string
  halamanJudul: string
  halamanRinci: string
}

function logoPublikAktif(): string {
  const { origin, hostname } = document.location
  if (/([a-z0-9-]+\.)*(sonora\.web\.id|muhammadzakizn\.com)$/i.test(hostname)) {
    return `${origin}/ikon/ikon-512.png`
  }
  return ActivityAssets.Logo
}

function bacaJembatanDom(): DataJembatanSonora | null {
  const el = document.querySelector<HTMLElement>('#sonora-premid-bridge')
  if (!el) return null
  const d = el.dataset
  const logoDefault = logoPublikAktif()
  return {
    adaLagu: d.adaLagu === '1',
    sedangPutar: d.sedangPutar === '1',
    mode: d.mode === 'video' ? 'video' : 'lagu',
    perangkat: d.perangkat || 'web',
    judul: d.judul || '',
    artis: d.artis || '',
    album: d.album || '',
    sampul: d.sampul || logoDefault,
    sampulStatis: d.sampulStatis || d.sampul || logoDefault,
    sampulGif: d.sampulGif || '',
    posisi: Number(d.posisi) || 0,
    durasi: Number(d.durasi) || 0,
    urlLagu: d.urlLagu || '',
    urlArtis: d.urlArtis || '',
    urlAlbum: d.urlAlbum || '',
    halamanJudul: d.halamanJudul || 'Menjelajahi SONORA',
    halamanRinci: d.halamanRinci || 'Pemutar musik web',
  }
}

presence.on('UpdateData', async () => {
  const [
    privacy,
    showBrowsing,
    showCover,
    showAnimatedCover,
    showTimestamps,
    showButtons,
    statusDisplayType,
  ] = await Promise.all([
    presence.getSetting<boolean>('privacy'),
    presence.getSetting<boolean>('showBrowsing'),
    presence.getSetting<boolean>('showCover'),
    presence.getSetting<boolean>('showAnimatedCover'),
    presence.getSetting<boolean>('showTimestamps'),
    presence.getSetting<boolean>('showButtons'),
    presence.getSetting<number>('statusDisplayType'),
  ])

  const { pathname, href } = document.location
  const logoDefault = logoPublikAktif()

  if (pathname.startsWith('/login') || pathname.startsWith('/error')) {
    presence.clearActivity()
    return
  }

  if (privacy) {
    presence.setActivity({
      type: ActivityType.Listening,
      largeImageKey: logoDefault,
      details: 'Mendengarkan musik di SONORA',
    })
    return
  }

  const jembatan = bacaJembatanDom()

  if (jembatan && jembatan.adaLagu) {
    const adalahVideo = jembatan.mode === 'video'
    const petaStatusDisplay: Record<number, StatusDisplayType> = {
      0: StatusDisplayType.Name,
      1: StatusDisplayType.State,
      2: StatusDisplayType.Details,
    }

    const labelPerangkat =
      jembatan.perangkat === 'discord'
        ? 'Voice Discord'
        : jembatan.perangkat === 'connect'
          ? 'SONORA Connect'
          : jembatan.perangkat === 'lan'
            ? 'Smart TV / Cast'
            : 'Pemutar Web'

    const sampulTerpilih = !showCover
      ? logoDefault
      : showAnimatedCover && jembatan.sampulGif
        ? jembatan.sampulGif
        : jembatan.sampulStatis || logoDefault

    const teksAlbumBersih = jembatan.album.trim()

    const presenceData: PresenceData = {
      type: adalahVideo ? ActivityType.Watching : ActivityType.Listening,
      stateDisplayType: petaStatusDisplay[statusDisplayType] ?? StatusDisplayType.Name,
      details: jembatan.judul,
      state: jembatan.artis || 'Artis',
      largeImageKey: sampulTerpilih,
      smallImageKey: jembatan.sedangPutar ? Assets.Play : Assets.Pause,
      smallImageText: jembatan.sedangPutar
        ? `Memutar • ${labelPerangkat}`
        : `Dijeda • ${labelPerangkat}`,
    }

    if (teksAlbumBersih) {
      presenceData.largeImageText = teksAlbumBersih
    } else if (adalahVideo) {
      presenceData.largeImageText = 'Video Musik Resmi'
    } else if (!jembatan.sedangPutar) {
      presenceData.largeImageText = 'Dijeda'
    }

    if (jembatan.urlAlbum) {
      presenceData.detailsUrl = jembatan.urlAlbum
    }
    if (jembatan.urlArtis) {
      presenceData.stateUrl = jembatan.urlArtis
    }

    if (showTimestamps && jembatan.sedangPutar && jembatan.durasi > 0) {
      const sekarang = Date.now()
      presenceData.startTimestamp = Math.round(sekarang - jembatan.posisi * 1000)
      presenceData.endTimestamp = Math.round(
        sekarang + Math.max(0, jembatan.durasi - jembatan.posisi) * 1000,
      )
    }

    if (showButtons) {
      const tombol: [ButtonData, ButtonData?] = [] as unknown as [ButtonData, ButtonData?]
      if (jembatan.urlAlbum && !jembatan.urlAlbum.endsWith('/player')) {
        tombol.push({
          label: adalahVideo ? 'Tonton Video' : 'Buka Album',
          url: jembatan.urlAlbum,
        })
      }
      if (jembatan.urlArtis && !jembatan.urlArtis.endsWith('/player')) {
        tombol.push({
          label: 'Lihat Artis',
          url: jembatan.urlArtis,
        })
      }
      if (tombol.length > 0) {
        presenceData.buttons = tombol
      }
    }

    presence.setActivity(presenceData)
    return
  }

  if (showBrowsing) {
    const presenceData: PresenceData = {
      type: ActivityType.Listening,
      largeImageKey: logoDefault,
      largeImageText: 'Pemutar Musik Web',
      smallImageKey: Assets.Reading,
      smallImageText: 'Menjelajahi SONORA',
      details: jembatan?.halamanJudul || 'Menjelajahi SONORA',
      state: jembatan?.halamanRinci || 'Pemutar musik web',
      startTimestamp: browsingTimestamp,
    }

    if (
      showButtons &&
      pathname.startsWith('/player/') &&
      pathname !== '/player/' &&
      !pathname.startsWith('/player/pengaturan')
    ) {
      presenceData.buttons = [
        {
          label: 'Buka Laman di SONORA',
          url: href,
        },
      ]
    }

    presence.setActivity(presenceData)
    return
  }

  presence.clearActivity()
})

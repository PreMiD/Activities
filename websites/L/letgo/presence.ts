import { Assets } from 'premid'

const presence = new Presence({
  clientId: '707123244397887548',
})
const pages: {
  [name: string]: string
} = {
  '/chat': 'Mesjalar',
  '/about-letgo': 'Letgo Hakkında',
  '/careers': 'Insan Kaynakları',
  '/download-app': 'Uygulamayı Indir',
  '/help': 'Yardım',
  '/safety': 'Güvenlik Önerileri',
  '/terms-and-conditions': 'Şartlar ve Gizlilik',
  '/privacy': 'Gizlilik Politikası',
}
presence.on('UpdateData', async () => {
  const page = document.location.pathname
  const searchingFor = document.querySelector(
    '#app > main > div.sc-fzqARJ.ezHzMZ > div > div.sc-fzqARJ.eYJPYt > div.sc-fzqARJ.jzDIJt > h1',
  )
  || document.querySelector(
    '#app > main > div:nth-child(2) > header > div > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.fucrvt > div.sc-fzqARJ.fSfVHK.sc-fzoYkl.fucrvt > div > div.sc-fzqNJr.dxscoE > form > div > div > div.sc-fzqKxP.ifYmcU > div > input',
  )
  const category = document.querySelector(
    '#app > main > div.sc-fzqARJ.ezHzMZ > div > div.sc-fzqARJ.eYJPYt > div.sc-fzqARJ.crtzxj.sc-fzoYkl.jCSvNr > div > div.sc-fzoLag.euRBHm > div > div:nth-child(1) > div > div > span > span',
  )
  || document.querySelector(
    '#app > main > div:nth-child(2) > header > div > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.fucrvt > div.sc-fzqNJr.dxscoE > div > button > div > div > span',
  )
  if (page.includes('/c/') && category && category.textContent !== '') {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/letgo/assets/logo.png',
      details: 'Bir kategoriyi inceliyor:',
      state: category.textContent?.trim() || 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (
    page.includes('?searchTerm')
    || (searchingFor && searchingFor.textContent !== '')
  ) {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/letgo/assets/logo.png',
      details: 'Bir şey arıyor:',
      state: searchingFor && searchingFor.textContent
        ? searchingFor.textContent
        : 'Belirsiz',
      smallImageKey: Assets.Search,
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (page.includes('/i/')) {
    const stuff = document.querySelector(
      '#app > main > div.Productstyles__ProductPageContent-sc-1qzhqka-52.jsQDxm > div.Productstyles__TopWrapper-sc-1qzhqka-36.eHTCol > div.sc-pbIaG.gtBEDe.Productstyles__TopContainer-sc-1qzhqka-1.ivkLwB > div.sc-fzoyAV.givzfL > div:nth-child(2) > div > div.sc-fzplWN.kgWKKg > h1',
    )
    || document.querySelector(
      '#app > main > div.Productstyles__ProductPageContent-sc-1qzhqka-52.jsQDxm > div.Productstyles__TopWrapper-sc-1qzhqka-36.eHTCol > div.sc-pbIaG.gtBEDe.Productstyles__TopContainer-sc-1qzhqka-1.ivkLwB > div.sc-fzoyAV.givzfL > div:nth-child(2) > div > div.sc-fzplWN.kgWKKg > h1',
    )
    const price = document.querySelector(
      '#app > main > div.Productstyles__ProductPageContent-sc-1qzhqka-52.jsQDxm > div.Productstyles__TopWrapper-sc-1qzhqka-36.eHTCol > div.sc-pbIaG.gtBEDe.Productstyles__TopContainer-sc-1qzhqka-1.ivkLwB > div.sc-fzoyAV.givzfL > div:nth-child(2) > div > div.sc-fzoyAV.givzfL > div.sc-fzqNJr.ProductDetailsstyle__PriceCol-sc-1id69g1-0.dgwOkY > div > span',
    )

    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/letgo/assets/logo.png',
      details: 'Bir ilanı inceliyor:',
      state: stuff && stuff.textContent !== ''
        ? `${stuff.textContent?.trim()} ${
          price && price.textContent !== ''
            ? `(${price.textContent?.trim().split(' ')[0]} TL)`
            : ''
        }`
        : 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (page.includes('/u/')) {
    const user = document.querySelector(
      '#app > main > div.sc-fzoyAV.Profilestyles__Wrapper-sc-17oc9jl-1.iGTcta > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.hEPffI.ProfileInfostyles__ContainerBox-is6738-1.cYAoIp > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.bICSaT.ProfileInfostyles__UserInfoWrapper-is6738-4.kWwlKm > div:nth-child(1) > div.sc-fzplWN.gKVHhl > h2',
    )
    || document.querySelector(
      '#app > main > div.sc-pbIaG.gtBEDe > div > div > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.kUkghz.ProfileInfostyles__ContainerBox-is6738-1.cYAoIp > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.cpfWDL > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.eTDXj.ProfileInfostyles__UserDataWrapper-is6738-2.jeNnEm > div.sc-fzplWN.dMbFMh > h1',
    )
    || document.querySelector(
      '#app > main > div.sc-qPlga.fsImDA > div > div > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.kUkghz.ProfileInfostyles__ContainerBox-is6738-1.cYAoIp > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.cpfWDL > div.sc-fzqARJ.kWvyBH.sc-fzoYkl.eTDXj.ProfileInfostyles__UserDataWrapper-is6738-2.jeNnEm > div.sc-fzplWN.dMbFMh > h1',
    )
    let username
    if (user && user.textContent)
      username = user.textContent.trim()
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/letgo/assets/logo.png',
      details: 'Bir kullanıcı profili inceliyor:',
      state: username || 'Belirsiz',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else if (pages[page] || pages[page.slice(0, -1)]) {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/letgo/assets/logo.png',
      details: 'Bir sayfaya göz atıyor:',
      state: pages[page] || pages[page.slice(0, -1)],
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
  else {
    presence.setActivity({
      largeImageKey: 'https://cdn.rcd.gg/PreMiD/websites/L/letgo/assets/logo.png',
      details: 'Bir sayfaya göz atıyor:',
      state: 'Ana Sayfa',
      startTimestamp: Math.floor(Date.now() / 1000),
    })
  }
})

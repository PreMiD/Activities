export function makePossessive(name: string): string {
  return name.endsWith('s') ? `${name}'` : `${name}'s`
}

export function deEsser(word: string): string {
  return word.endsWith('s') ? word.slice(0, -1) : word
}

export function giveArticle(word: string): string {
  return `${
    ['a', 'e', 'i', 'o', 'u'].some(vowel =>
      word.toLowerCase().startsWith(vowel),
    )
      ? 'an'
      : 'a'
  } ${word}`
}

export function makeProgressBar(
  value: number,
  maxValue: number,
  size: number,
  color?: string,
): string {
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.floor((value / maxValue) * 100)),
  )
  const completedSquares = Math.floor((progressPercentage * size) / 100)

  return `${(
    {
      owl: '🟩',
      bee: '🟨',
      fox: '🟨',
      cosmos: '🟦',
    }[color ?? ''] ?? '🟩'
  ).repeat(completedSquares)}${'⬛'.repeat(
    size - completedSquares,
  )} ${progressPercentage}%`
}
// have to define because outdated ts version
type TDecompressionStream = GenericTransformStream
type TCompressionFormat = 'deflate' | 'deflate-raw' | 'gzip'

declare const DecompressionStream: {
  prototype: TDecompressionStream
  new (format: TCompressionFormat): TDecompressionStream
}

export async function decompressGzip(
  base64GzipString: string,
): Promise<string> {
  const bytes = Uint8Array.from(atob(base64GzipString), c => c.charCodeAt(0))
  const stream = new DecompressionStream('gzip')
  const writer = stream.writable.getWriter()
  writer.write(bytes)
  writer.close()
  return new Response(stream.readable)
    .arrayBuffer()
    .then((arrayBuffer) => {
      return new TextDecoder().decode(arrayBuffer)
    })
}

type obj = Record<string, unknown>
export function updateUndefinedKeys(obj1: obj, obj2: obj): void {
  for (const key of Object.keys(obj2)) {
    if (Object.prototype.hasOwnProperty.call(obj2, key) && !obj1[key])
      obj1[key] = obj2[key]
  }
}

export const assets: Record<string, string> = {
  lang_tlh: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/3.png',
  lang_tr: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/4.png',
  lang_uk: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/5.png',
  lang_vi: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/6.png',
  lang_yi: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/7.png',
  lang_zh: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/8.png',
  lang_zu: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/9.png',
  lang_ar: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/10.png',
  lang_ca: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/11.png',
  lang_cs: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/12.png',
  lang_cy: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/13.png',
  lang_da: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/14.png',
  lang_de: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/15.png',
  lang_el: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/16.png',
  lang_eo: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/17.png',
  lang_es: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/18.png',
  lang_fr: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/19.png',
  lang_ga: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/20.png',
  lang_gd: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/21.png',
  lang_he: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/22.png',
  lang_hi: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/23.png',
  lang_hu: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/24.png',
  lang_hv: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/25.png',
  lang_hw: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/26.png',
  lang_it: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/27.png',
  lang_ja: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/28.png',
  lang_la: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/29.png',
  lang_nv: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/30.png',
  lang_pl: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/31.png',
  lang_ro: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/32.png',
  lang_ru: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/33.png',
  lang_sw: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/34.png',
  lang_th: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/35.png',
  lang_en: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/36.png',
  lang_fi: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/37.png',
  lang_gn: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/38.png',
  lang_ht: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/39.png',
  lang_id: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/40.png',
  lang_ko: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/41.png',
  lang_pt: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/42.png',
  lang_sv: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/43.png',
  lang_nl: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/44.png',
  lang_no: 'https://cdn.rcd.gg/PreMiD/websites/D/Duolingo/assets/45.png',
}

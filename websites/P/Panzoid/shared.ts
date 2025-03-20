export enum Icons {
  Discord = 'https://cdn.rcd.gg/PreMiD/websites/P/Panzoid/assets/logo.webp',
  Legacy = 'https://cdn.rcd.gg/PreMiD/websites/P/Panzoid/assets/0.png',
  Gen4 = 'https://cdn.rcd.gg/PreMiD/websites/P/Panzoid/assets/1.png',
}

export enum Details {
  Gen4Menu = 'In Gen4 menu',
  Gen4Loading = 'Loading project...',
  Gen4Editor = 'Editing: {0}',
  CM3 = 'Editing in Clipmaker 3',
  CM2 = 'Editing in Clipmaker 2',
  CM1 = 'Editing in Clipmaker 1',
  Backgrounder = 'Editing in Backgrounder',
  VideoEditor = 'Editing in Video Editor',
  Community = 'Chatting with the community',
  Website = 'Lurking around the website',
}

export enum States {
  Gen4Menu = '{0} projects',
  Gen4Editor = '{0} tracks | {1} clips',
  // eslint-disable-next-line ts/no-duplicate-enum-values
  CM3 = '{0} tracks | {1} clips',
  CM2 = '{0} objects | {1} effects',
  Rendering = 'Rendering {0}%',
}

export enum ImageTexts {
  Gen4 = 'Gen4',
  Legacy = 'Legacy',
}

/**
 * Replaces placeholders in a string with corresponding values from the arguments.
 *
 * @param text The string with placeholders to be formatted.
 * @param args The values to replace the placeholders with.
 * @return The formatted string with placeholders replaced.
 */
export function format(text: string, ...args: string[] | number[]): string {
  return text.replace(/\{(\d+)\}/g, (match, number) =>
    typeof args[number] !== 'undefined' ? String(args[number]) : match)
}

export function getRenderingState(): string | null {
  const element = document.querySelector<HTMLSpanElement>(
    'div.pz-progress > span',
  )
  // Get the width percentage and trim the % symbol
  // Or if the element was not found, return null
  if (element) {
    return format(
      States.Rendering,
      Number(element.style.width.slice(0, -1)).toFixed(2),
    )
  }
  return null
}

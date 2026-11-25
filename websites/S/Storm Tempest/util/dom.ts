/** Collapses whitespace and trims `value`, returning `undefined` for an empty result. */
export function clean(value: string | null | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim()

  return normalized || undefined
}

/** Returns the cleaned text content of `element`, if any. */
export function textOf(element: Element | null): string | undefined {
  return clean(element?.textContent)
}

/** Converts Arabic-Indic and Persian digits in `value` to Latin digits so numbers can be parsed in any site language. */
export function latinDigits(value: string): string {
  return value
    .replace(/[\u0660-\u0669]/g, digit => String(digit.charCodeAt(0) - 0x660))
    .replace(/[\u06F0-\u06F9]/g, digit => String(digit.charCodeAt(0) - 0x6F0))
    .replace(/\u066B/g, '.')
}

/** Returns the cleaned value of `attribute` on `element`, if any. */
export function attrOf(
  element: Element | null,
  attribute: string,
): string | undefined {
  return clean(element?.getAttribute(attribute))
}

/** Returns the text of the first element matching any of `selectors`. */
export function queryText(selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const value = textOf(document.querySelector(selector))

    if (value) {
      return value
    }
  }

  return undefined
}

/** Returns `attribute` from the first element matching any of `selectors`. */
export function queryAttr(
  selectors: string[],
  attribute: string,
): string | undefined {
  for (const selector of selectors) {
    const value = attrOf(document.querySelector(selector), attribute)

    if (value) {
      return value
    }
  }

  return undefined
}

/** Whether `element` is rendered with a non-empty box. */
export function isVisible(element: Element): boolean {
  const node = element as HTMLElement
  const style = window.getComputedStyle(node)
  const rect = node.getBoundingClientRect()

  return (
    style.display !== 'none'
    && style.visibility !== 'hidden'
    && rect.width > 0
    && rect.height > 0
  )
}

/** Decodes a URL path segment, returning it unchanged when it is malformed. */
export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

/** Turns a slug such as "kaoru-hana-wa-rin-to-saku" into "Kaoru Hana Wa Rin To Saku". */
export function prettify(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\p{L}/gu, letter => letter.toUpperCase())
    .trim()
}

/** Runs `read` and returns undefined instead of throwing, so one broken page reader cannot stop the whole activity. */
export function safely<T>(read: () => T): T | undefined {
  try {
    return read()
  }
  catch {
    return undefined
  }
}

/** Reads the name from the page title, such as "Name · Subject · storm", before the page has drawn its heading. */
export function titleName(): string | undefined {
  const name = clean(
    document.title.replace(/\s*[·|-]\s*storm\s*$/i, '').split(' · ')[0],
  )

  return name && !/^(?:storm|studysto|loading…?|editor)$/i.test(name)
    ? name
    : undefined
}

/** Returns the page's main heading, or `fallback` when it has none or it is too long to be a name. */
export function headingOr(fallback: string): string {
  const heading = textOf(document.querySelector('main h1'))

  return heading && heading.length <= 60 ? heading : fallback
}

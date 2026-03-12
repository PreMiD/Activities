export function getDropDownSelected(name: string): string | undefined {
  const dropDown = document.querySelector<HTMLSelectElement>(
    `[name="${name}"]`,
  )
  return dropDown?.children[Number(dropDown.selectedIndex)]?.textContent ?? undefined
}
export function getInp(name: string): string | undefined {
  return document.querySelector<HTMLInputElement>(`[name="${name}"]`)?.value
}
export function toDate(inp: string): string | null {
  if (!inp)
    return null

  const dateSplit = inp.split('.').map(Number)
  // switch day and month to convert to US time
  const d = new Date(dateSplit[2]!, dateSplit[0]!, dateSplit[1]!)

  return `${d.getDate() + 1}/${d.getMonth() + 1}/${d.getFullYear()}`
}

export function tDiffInMS(time1: string, time2 = '00:00'): number {
  const toTotalSeconds = (time: string) => {
    const parts = time.split(':').map(Number)
    let seconds = 0
    if (parts.length === 3) {
      // HH:MM:SS format
      seconds = parts[0]! * 3600 + parts[1]! * 60 + parts[2]!
    }
    else if (parts.length === 2) {
      // MM:SS format
      seconds = parts[0]! * 60 + parts[1]!
    }
    return seconds
  }
  // Convert time to total seconds
  const totalSeconds1 = toTotalSeconds(time1)
  const totalSeconds2 = toTotalSeconds(time2)
  // difference in seconds
  const differenceInSeconds = Math.abs(totalSeconds1 - totalSeconds2)

  // difference in milliseconds
  return differenceInSeconds * 1000
}

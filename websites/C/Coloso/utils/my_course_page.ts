export function getNumOwnedCourses(): string | undefined {
  return document.querySelector('[class="classroom-menu__container"]')?.querySelector('[class="grid-container grid-column"')?.querySelectorAll('li').length.toString()
}

export function getWatchingCourseTitle(): string | undefined {
  return document.querySelector('[class="grow truncate whitespace-nowrap break-keep text-[1.4rem] font-normal text-gray-600 xl:block xl:text-[1.6rem] xl:font-bold xl:text-gray-400"')
    ?.textContent
}

export function getWatchingChapter(): string | undefined {
  return document.querySelector('[class="relative mt-4 flex items-center rounded-4 fill-black-500 px-6 py-8 transition-colors duration-200 ease-in [&>svg]:mr-8 [&>svg]:flex-shrink-0 bg-red-500 stroke-none"')
    ?.querySelector('[class="flex-1"]')
    ?.textContent
}

export function sanitazeFolderName(name: string): string {
  return name
    //* Remove specific invalid file system characters
    .replaceAll(/[<>:"/\\|?*!]/g, ' ')
    //* Replace multiple spaces with single space
    .replaceAll(/\s+/g, ' ')
    //* Remove leading/trailing spaces
    .trim()
}

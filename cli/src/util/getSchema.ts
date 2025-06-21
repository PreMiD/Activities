export async function getSchema() {
  return (await fetch('https://schemas.premid.app/metadata/1.14')).json()
}

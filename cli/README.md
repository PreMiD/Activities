# CLI

The CLI is used to build the services, and when in dev mode, it will watch for changes and rebuild the services.

## API Versionizing

Default (api version specified in metadata.json):
`/websites/<letter>/<service>/metadata.json`

If there is support for multiple api versions, the api version is specified in the metadata.json file and folder
`/websites/<letter>/<service>/v1/metadata.json`
`/websites/<letter>/<service>/v2/metadata.json`

## Building steps

- install dependencies
- typecheck
- compile the presence.ts file to dist
- compile the iframe.ts file to dist (if it exists)
- copy the metadata.json file to dist
- copy the <service>.json file to dist (if it exists)

## Dev mode

- <see build steps>
- watch for changes and rebuild the services
- connect to extension

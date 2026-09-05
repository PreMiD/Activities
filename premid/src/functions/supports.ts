/**
 * Checks whether the running PreMiD extension supports a given `Presence` /
 * `iFrame` capability.
 *
 * Activities run across every extension version, so APIs added in newer
 * versions (e.g. `execInPage`, `onRequest`) may be missing on older installs,
 * where calling them directly would throw. This helper is bundled into the
 * activity, so it works regardless of the extension version — feature-detect
 * before calling:
 *
 * @example
 * if (supports(presence, 'onRequest')) {
 *   presence.onRequest({ url: '/api/now-playing' }, handleRequest)
 * }
 *
 * @param target The `Presence` or `iFrame` instance to check
 * @param feature Name of the method to check for
 * @returns `true` when the capability is available on this extension version
 */
export function supports<T extends object, K extends keyof T>(
  target: T,
  feature: K,
): boolean {
  return typeof target[feature] === 'function'
}

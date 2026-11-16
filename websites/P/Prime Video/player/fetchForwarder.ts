import { REQUEST_EVENT, TRACKED_REQUEST_REGEX } from '../config/constants.js'

/**
 * Fallback for extensions without `onRequest`: the content script cannot see the player `fetch`, so a script
 * executed in the page relays the tracked requests as a DOM event. Raw JS: it is injected as text,
 * so it is independent of the bundler.
 */
const FORWARDER_SOURCE = String.raw`(config => {
  if (window.__premidPrimeForwarder)
    return;
  window.__premidPrimeForwarder = true;

  const pattern = new RegExp(config.pattern);
  const originalFetch = window.fetch;

  window.fetch = function (input, init) {
    const request = originalFetch.apply(this, arguments);
    try {
      const url = String(input?.url ?? input);
      if (pattern.test(url)) {
        const requestBody = typeof init?.body === 'string' ? init.body : null;
        request
          .then(response => response.clone().text())
          .then(responseBody => document.dispatchEvent(new CustomEvent(config.event, { detail: JSON.stringify({ url, requestBody, responseBody }) })))
          .catch(() => {});
      }
    }
    catch (error) {
      // Never interfere with the player
    }
    return request;
  };
})(__CONFIG__)`

export function injectFetchForwarder(): void {
  const config = {
    pattern: TRACKED_REQUEST_REGEX.source,
    event: REQUEST_EVENT,
  }

  try {
    const script = document.createElement('script')
    script.textContent = FORWARDER_SOURCE.replace('__CONFIG__', () => JSON.stringify(config))
    ;(document.head ?? document.documentElement).appendChild(script)
    script.remove()
  }
  catch {
    // Injection impossible (CSP...): no correction
  }
}

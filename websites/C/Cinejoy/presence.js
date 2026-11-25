/* MPL-2.0 | https://mozilla.org/MPL/2.0/ | Source included in the inline source map. */
(() => {
  // .build/premid/functions/getTimestamps.ts
  function getTimestamps(elementTime, elementDuration) {
    const startTime = Date.now() / 1e3 - elementTime;
    const endTime = startTime + elementDuration;
    return [Math.floor(startTime), Math.floor(endTime)];
  }

  // .build/premid/functions/getTimestampsFromMedia.ts
  function getTimestampsFromMedia(media) {
    if (media.readyState === 0 || !Number.isFinite(media.duration))
      return [0, 0];
    return getTimestamps(media.currentTime, media.duration);
  }

  // Cinejoy/presence.ts
  var presence = new Presence({
    clientId: "1534742028368347156"
  });
  var TMDB_KEY = "8476a7ab80ad76f0936744df0430e67c";
  var TMDB_IMG = "https://image.tmdb.org/t/p/w500";
  function parseMediaPath() {
    const path = document.location.pathname;
    const parts = path.split("/").filter(Boolean);
    const type = parts.find((p) => p === "tv" || p === "movie");
    if (!type)
      return null;
    const typeIndex = parts.indexOf(type);
    const idPart = parts[typeIndex + 1];
    const idMatch = idPart?.match(/^\d+/);
    const tmdbId = idMatch?.[0];
    if (!tmdbId)
      return null;
    const seasonPart = parts[typeIndex + 2];
    const episodePart = parts[typeIndex + 3];
    const season = seasonPart?.match(/\d+/)?.[0];
    const episode = episodePart?.match(/\d+/)?.[0];
    return { type, tmdbId, season, episode };
  }
  function getStaticPageInfo() {
    const parts = document.location.pathname.split("/").filter(Boolean);
    if (parts.length === 0)
      return { details: "Browsing Cinejoy", state: "On the home page" };
    switch (parts[0]) {
      case "movies":
        return { details: "Browsing Cinejoy", state: "Browsing Movies" };
      case "series":
        return { details: "Browsing Cinejoy", state: "Browsing TV Shows" };
      case "lists":
        return { details: "Browsing Cinejoy", state: "Viewing My List" };
      case "continue-watching":
        return { details: "Browsing Cinejoy", state: "Viewing Continue Watching" };
      case "shorts":
        return { details: "Browsing Cinejoy", state: "Watching Shorts" };
      case "settings":
        return { details: "Browsing Cinejoy", state: "In Settings" };
      case "search":
        return { details: "Browsing Cinejoy", state: "Searching" };
      default:
        return { details: "Browsing Cinejoy" };
    }
  }
  var cache;
  function getTmdbDetails(type, tmdbId) {
    const key = `${type}-${tmdbId}`;
    if (cache?.key === key)
      return cache.request;
    const request = fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_KEY}&language=en-US`,
      { signal: AbortSignal.timeout(5e3) }
    ).then((response) => {
      if (!response.ok)
        throw new Error(`TMDB returned ${response.status}`);
      return response.json();
    });
    cache = { key, request };
    void request.catch(() => {
      setTimeout(() => {
        if (cache?.request === request)
          cache = void 0;
      }, 15e3);
    });
    return request;
  }
  function formatTime(seconds) {
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total / 60) % 60;
    const remainder = String(total % 60).padStart(2, "0");
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${remainder}` : `${minutes}:${remainder}`;
  }
  var latestUpdate = 0;
  presence.on("UpdateData", async () => {
    const update = ++latestUpdate;
    const path = document.location.pathname;
    const media = parseMediaPath();
    const activity = {
      largeImageKey: "https://cdn.rcd.gg/PreMiD/websites/C/Cinejoy/assets/logo.png" /* Logo */,
      ...getStaticPageInfo()
    };
    if (media) {
      const data = await getTmdbDetails(media.type, media.tmdbId).catch(() => void 0);
      if (update !== latestUpdate || path !== document.location.pathname)
        return;
      const title = data?.title || data?.name;
      const video = document.querySelector("video");
      const ready = video && video.readyState > 0;
      activity.details = title?.slice(0, 128) ?? "Watching Cinejoy";
      if (title) {
        activity.type = 3 /* Watching */;
        activity.statusDisplayType = 2 /* Details */;
        activity.largeImageText = activity.details;
      }
      if (data?.poster_path)
        activity.largeImageKey = `${TMDB_IMG}${data.poster_path}`;
      const info = [];
      if (media.type === "tv" && media.season && media.episode) {
        info.push(`S${media.season}:E${media.episode}`);
        if (title)
          activity.largeImageText = `Season ${media.season}, Episode ${media.episode}`;
      } else if (media.type === "movie" && data?.release_date) {
        info.push(data.release_date.split("-")[0]);
      }
      if (ready) {
        const stopped = video.paused || video.ended;
        activity.smallImageKey = stopped ? "https://cdn.rcd.gg/PreMiD/resources/pause.png" /* Pause */ : "https://cdn.rcd.gg/PreMiD/resources/play.png" /* Play */;
        activity.smallImageText = video.ended ? "Ended" : stopped ? "Paused" : "Playing";
        if (!stopped && !video.seeking && video.playbackRate === 1 && Number.isFinite(video.duration) && video.duration > 0 && Number.isFinite(video.currentTime) && video.currentTime < video.duration) {
          [activity.startTimestamp, activity.endTimestamp] = getTimestampsFromMedia(video);
        }
        if (stopped)
          info.push(activity.smallImageText);
      }
      if (!(ready && Number.isFinite(video.duration) && video.duration > 0) && data?.runtime && data.runtime > 0)
        info.push(`${formatTime(data.runtime * 60)} runtime`);
      activity.state = info.join(" \xB7 ") || void 0;
    }
    presence.setActivity(activity);
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicHJlbWlkL2Z1bmN0aW9ucy9nZXRUaW1lc3RhbXBzLnRzIiwgInByZW1pZC9mdW5jdGlvbnMvZ2V0VGltZXN0YW1wc0Zyb21NZWRpYS50cyIsICIuLi9DaW5lam95L3ByZXNlbmNlLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIENvbnZlcnRzIGN1cnJlbnQgbWVkaWEgdGltZSBhbmQgZHVyYXRpb24gaW50byBVbml4IHRpbWVzdGFtcHNcbiAqIEBwYXJhbSB7bnVtYmVyfSBlbGVtZW50VGltZSBDdXJyZW50IHBsYXliYWNrIHBvc2l0aW9uIGluIHNlY29uZHNcbiAqIEBwYXJhbSB7bnVtYmVyfSBlbGVtZW50RHVyYXRpb24gVG90YWwgZHVyYXRpb24gb2YgdGhlIG1lZGlhIGluIHNlY29uZHNcbiAqIEByZXR1cm5zIHtbbnVtYmVyLCBudW1iZXJdfSBBcnJheSBjb250YWluaW5nIFtzdGFydFRpbWVzdGFtcCwgZW5kVGltZXN0YW1wXSBhcyBVbml4IHRpbWVzdGFtcHMgaW4gc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGltZXN0YW1wcyhcbiAgZWxlbWVudFRpbWU6IG51bWJlcixcbiAgZWxlbWVudER1cmF0aW9uOiBudW1iZXIsXG4pOiBbc3RhcnRUaW1lc3RhbXA6IG51bWJlciwgZW5kVGltZXN0YW1wOiBudW1iZXJdIHtcbiAgY29uc3Qgc3RhcnRUaW1lID0gKERhdGUubm93KCkgLyAxMDAwKSAtIGVsZW1lbnRUaW1lXG4gIGNvbnN0IGVuZFRpbWUgPSBzdGFydFRpbWUgKyBlbGVtZW50RHVyYXRpb25cbiAgcmV0dXJuIFtNYXRoLmZsb29yKHN0YXJ0VGltZSksIE1hdGguZmxvb3IoZW5kVGltZSldXG59XG4iLCAiaW1wb3J0IHsgZ2V0VGltZXN0YW1wcyB9IGZyb20gJy4vZ2V0VGltZXN0YW1wcy5qcydcblxuLyoqXG4gKiBHZXRzIHRpbWVzdGFtcHMgZnJvbSBhbiBIVE1MIG1lZGlhIGVsZW1lbnQgKGF1ZGlvIG9yIHZpZGVvKVxuICogQHBhcmFtIHtIVE1MTWVkaWFFbGVtZW50fSBtZWRpYSBUaGUgbWVkaWEgZWxlbWVudCB0byBnZXQgdGltZXN0YW1wcyBmcm9tICh3b3JrcyB3aXRoIGJvdGggPGF1ZGlvPiBhbmQgPHZpZGVvPiBlbGVtZW50cylcbiAqIEByZXR1cm5zIHtbbnVtYmVyLCBudW1iZXJdfSBBcnJheSBjb250YWluaW5nIFtzdGFydFRpbWVzdGFtcCwgZW5kVGltZXN0YW1wXSBhcyBVbml4IHRpbWVzdGFtcHMgaW4gc2Vjb25kc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGltZXN0YW1wc0Zyb21NZWRpYShcbiAgbWVkaWE6IEhUTUxNZWRpYUVsZW1lbnQsXG4pOiBbc3RhcnRUaW1lc3RhbXA6IG51bWJlciwgZW5kVGltZXN0YW1wOiBudW1iZXJdIHtcbiAgLy8qIFJldHVybiBlYXJseSBpZiBtZWRpYSBpcyBub3QgbG9hZGVkIG9yIGhhcyBubyBkdXJhdGlvblxuICBpZiAobWVkaWEucmVhZHlTdGF0ZSA9PT0gMCB8fCAhTnVtYmVyLmlzRmluaXRlKG1lZGlhLmR1cmF0aW9uKSlcbiAgICByZXR1cm4gWzAsIDBdXG5cbiAgcmV0dXJuIGdldFRpbWVzdGFtcHMobWVkaWEuY3VycmVudFRpbWUsIG1lZGlhLmR1cmF0aW9uKVxufVxuIiwgIi8vIE1vZGlmaWVkIGZyb20gUHJlTWlEIEFjdGl2aXRpZXMgKENpbmVqb3kpLCBsaWNlbnNlZCB1bmRlciBNUEwtMi4wLlxuaW1wb3J0IHsgQWN0aXZpdHlUeXBlLCBBc3NldHMsIGdldFRpbWVzdGFtcHNGcm9tTWVkaWEsIFN0YXR1c0Rpc3BsYXlUeXBlIH0gZnJvbSAncHJlbWlkJ1xuXG5jb25zdCBwcmVzZW5jZSA9IG5ldyBQcmVzZW5jZSh7XG4gIGNsaWVudElkOiAnMTUzNDc0MjAyODM2ODM0NzE1NicsXG59KVxuXG5jb25zdCBUTURCX0tFWSA9ICc4NDc2YTdhYjgwYWQ3NmYwOTM2NzQ0ZGYwNDMwZTY3YydcbmNvbnN0IFRNREJfSU1HID0gJ2h0dHBzOi8vaW1hZ2UudG1kYi5vcmcvdC9wL3c1MDAnXG5cbmVudW0gQWN0aXZpdHlBc3NldHMge1xuICBMb2dvID0gJ2h0dHBzOi8vY2RuLnJjZC5nZy9QcmVNaUQvd2Vic2l0ZXMvQy9DaW5lam95L2Fzc2V0cy9sb2dvLnBuZycsXG59XG5cbmZ1bmN0aW9uIHBhcnNlTWVkaWFQYXRoKCkge1xuICBjb25zdCBwYXRoID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWVcbiAgY29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pXG5cbiAgY29uc3QgdHlwZSA9IHBhcnRzLmZpbmQocCA9PiBwID09PSAndHYnIHx8IHAgPT09ICdtb3ZpZScpXG4gIGlmICghdHlwZSlcbiAgICByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IHR5cGVJbmRleCA9IHBhcnRzLmluZGV4T2YodHlwZSlcbiAgY29uc3QgaWRQYXJ0ID0gcGFydHNbdHlwZUluZGV4ICsgMV1cbiAgY29uc3QgaWRNYXRjaCA9IGlkUGFydD8ubWF0Y2goL15cXGQrLylcbiAgY29uc3QgdG1kYklkID0gaWRNYXRjaD8uWzBdXG4gIGlmICghdG1kYklkKVxuICAgIHJldHVybiBudWxsXG5cbiAgY29uc3Qgc2Vhc29uUGFydCA9IHBhcnRzW3R5cGVJbmRleCArIDJdXG4gIGNvbnN0IGVwaXNvZGVQYXJ0ID0gcGFydHNbdHlwZUluZGV4ICsgM11cbiAgY29uc3Qgc2Vhc29uID0gc2Vhc29uUGFydD8ubWF0Y2goL1xcZCsvKT8uWzBdXG4gIGNvbnN0IGVwaXNvZGUgPSBlcGlzb2RlUGFydD8ubWF0Y2goL1xcZCsvKT8uWzBdXG5cbiAgcmV0dXJuIHsgdHlwZSwgdG1kYklkLCBzZWFzb24sIGVwaXNvZGUgfVxufVxuXG5mdW5jdGlvbiBnZXRTdGF0aWNQYWdlSW5mbygpOiB7IGRldGFpbHM6IHN0cmluZywgc3RhdGU/OiBzdHJpbmcgfSB7XG4gIGNvbnN0IHBhcnRzID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbilcblxuICBpZiAocGFydHMubGVuZ3RoID09PSAwKVxuICAgIHJldHVybiB7IGRldGFpbHM6ICdCcm93c2luZyBDaW5lam95Jywgc3RhdGU6ICdPbiB0aGUgaG9tZSBwYWdlJyB9XG5cbiAgc3dpdGNoIChwYXJ0c1swXSkge1xuICAgIGNhc2UgJ21vdmllcyc6XG4gICAgICByZXR1cm4geyBkZXRhaWxzOiAnQnJvd3NpbmcgQ2luZWpveScsIHN0YXRlOiAnQnJvd3NpbmcgTW92aWVzJyB9XG4gICAgY2FzZSAnc2VyaWVzJzpcbiAgICAgIHJldHVybiB7IGRldGFpbHM6ICdCcm93c2luZyBDaW5lam95Jywgc3RhdGU6ICdCcm93c2luZyBUViBTaG93cycgfVxuICAgIGNhc2UgJ2xpc3RzJzpcbiAgICAgIHJldHVybiB7IGRldGFpbHM6ICdCcm93c2luZyBDaW5lam95Jywgc3RhdGU6ICdWaWV3aW5nIE15IExpc3QnIH1cbiAgICBjYXNlICdjb250aW51ZS13YXRjaGluZyc6XG4gICAgICByZXR1cm4geyBkZXRhaWxzOiAnQnJvd3NpbmcgQ2luZWpveScsIHN0YXRlOiAnVmlld2luZyBDb250aW51ZSBXYXRjaGluZycgfVxuICAgIGNhc2UgJ3Nob3J0cyc6XG4gICAgICByZXR1cm4geyBkZXRhaWxzOiAnQnJvd3NpbmcgQ2luZWpveScsIHN0YXRlOiAnV2F0Y2hpbmcgU2hvcnRzJyB9XG4gICAgY2FzZSAnc2V0dGluZ3MnOlxuICAgICAgcmV0dXJuIHsgZGV0YWlsczogJ0Jyb3dzaW5nIENpbmVqb3knLCBzdGF0ZTogJ0luIFNldHRpbmdzJyB9XG4gICAgY2FzZSAnc2VhcmNoJzpcbiAgICAgIHJldHVybiB7IGRldGFpbHM6ICdCcm93c2luZyBDaW5lam95Jywgc3RhdGU6ICdTZWFyY2hpbmcnIH1cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHsgZGV0YWlsczogJ0Jyb3dzaW5nIENpbmVqb3knIH1cbiAgfVxufVxuXG5pbnRlcmZhY2UgTWVkaWFEZXRhaWxzIHtcbiAgdGl0bGU/OiBzdHJpbmdcbiAgbmFtZT86IHN0cmluZ1xuICBwb3N0ZXJfcGF0aD86IHN0cmluZyB8IG51bGxcbiAgcmVsZWFzZV9kYXRlPzogc3RyaW5nXG4gIHJ1bnRpbWU/OiBudW1iZXJcbn1cblxubGV0IGNhY2hlOiB7IGtleTogc3RyaW5nLCByZXF1ZXN0OiBQcm9taXNlPE1lZGlhRGV0YWlscz4gfSB8IHVuZGVmaW5lZFxuXG5mdW5jdGlvbiBnZXRUbWRiRGV0YWlscyh0eXBlOiBzdHJpbmcsIHRtZGJJZDogc3RyaW5nKSB7XG4gIGNvbnN0IGtleSA9IGAke3R5cGV9LSR7dG1kYklkfWBcbiAgaWYgKGNhY2hlPy5rZXkgPT09IGtleSlcbiAgICByZXR1cm4gY2FjaGUucmVxdWVzdFxuXG4gIGNvbnN0IHJlcXVlc3QgPSBmZXRjaChcbiAgICBgaHR0cHM6Ly9hcGkudGhlbW92aWVkYi5vcmcvMy8ke3R5cGV9LyR7dG1kYklkfT9hcGlfa2V5PSR7VE1EQl9LRVl9Jmxhbmd1YWdlPWVuLVVTYCxcbiAgICB7IHNpZ25hbDogQWJvcnRTaWduYWwudGltZW91dCg1MDAwKSB9LFxuICApLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgaWYgKCFyZXNwb25zZS5vaylcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVE1EQiByZXR1cm5lZCAke3Jlc3BvbnNlLnN0YXR1c31gKVxuICAgIHJldHVybiByZXNwb25zZS5qc29uKCkgYXMgUHJvbWlzZTxNZWRpYURldGFpbHM+XG4gIH0pXG4gIGNhY2hlID0geyBrZXksIHJlcXVlc3QgfVxuICB2b2lkIHJlcXVlc3QuY2F0Y2goKCkgPT4ge1xuICAgIC8vIEtlZXAgZmFpbGVkIHJlcXVlc3RzIGNhY2hlZCBicmllZmx5IHNvIGEgbmV0d29yayBlcnJvciBkb2Vzbid0IHRyaWdnZXIgYSBmZXRjaCBldmVyeSB0aWNrLlxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKGNhY2hlPy5yZXF1ZXN0ID09PSByZXF1ZXN0KVxuICAgICAgICBjYWNoZSA9IHVuZGVmaW5lZFxuICAgIH0sIDE1MDAwKVxuICB9KVxuICByZXR1cm4gcmVxdWVzdFxufVxuXG5mdW5jdGlvbiBmb3JtYXRUaW1lKHNlY29uZHM6IG51bWJlcikge1xuICBjb25zdCB0b3RhbCA9IE1hdGguZmxvb3Ioc2Vjb25kcylcbiAgY29uc3QgaG91cnMgPSBNYXRoLmZsb29yKHRvdGFsIC8gMzYwMClcbiAgY29uc3QgbWludXRlcyA9IE1hdGguZmxvb3IodG90YWwgLyA2MCkgJSA2MFxuICBjb25zdCByZW1haW5kZXIgPSBTdHJpbmcodG90YWwgJSA2MCkucGFkU3RhcnQoMiwgJzAnKVxuICByZXR1cm4gaG91cnNcbiAgICA/IGAke2hvdXJzfToke1N0cmluZyhtaW51dGVzKS5wYWRTdGFydCgyLCAnMCcpfToke3JlbWFpbmRlcn1gXG4gICAgOiBgJHttaW51dGVzfToke3JlbWFpbmRlcn1gXG59XG5cbmxldCBsYXRlc3RVcGRhdGUgPSAwXG5cbnByZXNlbmNlLm9uKCdVcGRhdGVEYXRhJywgYXN5bmMgKCkgPT4ge1xuICBjb25zdCB1cGRhdGUgPSArK2xhdGVzdFVwZGF0ZVxuICBjb25zdCBwYXRoID0gZG9jdW1lbnQubG9jYXRpb24ucGF0aG5hbWVcbiAgY29uc3QgbWVkaWEgPSBwYXJzZU1lZGlhUGF0aCgpXG4gIGNvbnN0IGFjdGl2aXR5OiBQcmVzZW5jZURhdGEgPSB7XG4gICAgbGFyZ2VJbWFnZUtleTogQWN0aXZpdHlBc3NldHMuTG9nbyxcbiAgICAuLi5nZXRTdGF0aWNQYWdlSW5mbygpLFxuICB9XG5cbiAgaWYgKG1lZGlhKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IGdldFRtZGJEZXRhaWxzKG1lZGlhLnR5cGUsIG1lZGlhLnRtZGJJZCkuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKVxuICAgIGlmICh1cGRhdGUgIT09IGxhdGVzdFVwZGF0ZSB8fCBwYXRoICE9PSBkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSlcbiAgICAgIHJldHVyblxuXG4gICAgY29uc3QgdGl0bGUgPSBkYXRhPy50aXRsZSB8fCBkYXRhPy5uYW1lXG4gICAgY29uc3QgdmlkZW8gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd2aWRlbycpXG4gICAgY29uc3QgcmVhZHkgPSB2aWRlbyAmJiB2aWRlby5yZWFkeVN0YXRlID4gMFxuXG4gICAgYWN0aXZpdHkuZGV0YWlscyA9IHRpdGxlPy5zbGljZSgwLCAxMjgpID8/ICdXYXRjaGluZyBDaW5lam95J1xuICAgIGlmICh0aXRsZSkge1xuICAgICAgYWN0aXZpdHkudHlwZSA9IEFjdGl2aXR5VHlwZS5XYXRjaGluZ1xuICAgICAgYWN0aXZpdHkuc3RhdHVzRGlzcGxheVR5cGUgPSBTdGF0dXNEaXNwbGF5VHlwZS5EZXRhaWxzXG4gICAgICBhY3Rpdml0eS5sYXJnZUltYWdlVGV4dCA9IGFjdGl2aXR5LmRldGFpbHNcbiAgICB9XG5cbiAgICBpZiAoZGF0YT8ucG9zdGVyX3BhdGgpXG4gICAgICBhY3Rpdml0eS5sYXJnZUltYWdlS2V5ID0gYCR7VE1EQl9JTUd9JHtkYXRhLnBvc3Rlcl9wYXRofWBcblxuICAgIGNvbnN0IGluZm86IHN0cmluZ1tdID0gW11cbiAgICBpZiAobWVkaWEudHlwZSA9PT0gJ3R2JyAmJiBtZWRpYS5zZWFzb24gJiYgbWVkaWEuZXBpc29kZSkge1xuICAgICAgaW5mby5wdXNoKGBTJHttZWRpYS5zZWFzb259OkUke21lZGlhLmVwaXNvZGV9YClcbiAgICAgIGlmICh0aXRsZSlcbiAgICAgICAgYWN0aXZpdHkubGFyZ2VJbWFnZVRleHQgPSBgU2Vhc29uICR7bWVkaWEuc2Vhc29ufSwgRXBpc29kZSAke21lZGlhLmVwaXNvZGV9YFxuICAgIH1cbiAgICBlbHNlIGlmIChtZWRpYS50eXBlID09PSAnbW92aWUnICYmIGRhdGE/LnJlbGVhc2VfZGF0ZSkge1xuICAgICAgaW5mby5wdXNoKGRhdGEucmVsZWFzZV9kYXRlLnNwbGl0KCctJylbMF0hKVxuICAgIH1cblxuICAgIGlmIChyZWFkeSkge1xuICAgICAgY29uc3Qgc3RvcHBlZCA9IHZpZGVvLnBhdXNlZCB8fCB2aWRlby5lbmRlZFxuICAgICAgYWN0aXZpdHkuc21hbGxJbWFnZUtleSA9IHN0b3BwZWQgPyBBc3NldHMuUGF1c2UgOiBBc3NldHMuUGxheVxuICAgICAgYWN0aXZpdHkuc21hbGxJbWFnZVRleHQgPSB2aWRlby5lbmRlZCA/ICdFbmRlZCcgOiBzdG9wcGVkID8gJ1BhdXNlZCcgOiAnUGxheWluZydcbiAgICAgIGlmICghc3RvcHBlZCAmJiAhdmlkZW8uc2Vla2luZyAmJiB2aWRlby5wbGF5YmFja1JhdGUgPT09IDFcbiAgICAgICAgJiYgTnVtYmVyLmlzRmluaXRlKHZpZGVvLmR1cmF0aW9uKSAmJiB2aWRlby5kdXJhdGlvbiA+IDBcbiAgICAgICAgJiYgTnVtYmVyLmlzRmluaXRlKHZpZGVvLmN1cnJlbnRUaW1lKSAmJiB2aWRlby5jdXJyZW50VGltZSA8IHZpZGVvLmR1cmF0aW9uKSB7XG4gICAgICAgIFthY3Rpdml0eS5zdGFydFRpbWVzdGFtcCwgYWN0aXZpdHkuZW5kVGltZXN0YW1wXSA9IGdldFRpbWVzdGFtcHNGcm9tTWVkaWEodmlkZW8pXG4gICAgICB9XG4gICAgICBpZiAoc3RvcHBlZClcbiAgICAgICAgaW5mby5wdXNoKGFjdGl2aXR5LnNtYWxsSW1hZ2VUZXh0KVxuICAgIH1cblxuICAgIGlmICghKHJlYWR5ICYmIE51bWJlci5pc0Zpbml0ZSh2aWRlby5kdXJhdGlvbikgJiYgdmlkZW8uZHVyYXRpb24gPiAwKSAmJiBkYXRhPy5ydW50aW1lICYmIGRhdGEucnVudGltZSA+IDApXG4gICAgICBpbmZvLnB1c2goYCR7Zm9ybWF0VGltZShkYXRhLnJ1bnRpbWUgKiA2MCl9IHJ1bnRpbWVgKVxuXG4gICAgYWN0aXZpdHkuc3RhdGUgPSBpbmZvLmpvaW4oJyBcdTAwQjcgJykgfHwgdW5kZWZpbmVkXG4gIH1cblxuICBwcmVzZW5jZS5zZXRBY3Rpdml0eShhY3Rpdml0eSlcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFNTyxXQUFTLGNBQ2QsYUFDQSxp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

# MCC + Island

Supports Minecraft Championship, MCC Island, their forums, and
event browsing on MCC Live, the MCC Island Wiki, Lighthouse (including its
lighthouse.gay mirror), MCCI Hub, MCC Island Stats, ReafyStats, and Radar.
No bot, personal application, account identifier,
or user-specific setup is required.

## Privacy

- Bug-report forms, lists, and individual reports never publish titles, authors,
  report content, identifiers, or buttons. Only a generic action and category icon
  are shown, regardless of Privacy Mode.
- The public reporting guide (thread 1150) is the only exception: it behaves like
  a public article, respecting Privacy Mode and the button setting. Inaccessible
  error pages use a stable generic browsing status without titles or buttons.
- Privacy Mode hides public thread titles, profile names, author avatars,
  category names, MCC Live selections, and all buttons.
- Conversations and account pages expose only their generic action. They never
  expose messages, people, email addresses, reactions, notifications, or bookmarks,
  and never include buttons, regardless of Privacy Mode.
- MCC Live reads event/game selectors and the leaderboard view.
  Live-marked views currently use a generic status.
- Wiki editing reads only the page identity and editor mode, never drafts,
  edit summaries, or form values. Preferences expose only the selected section.
- Wiki Privacy Mode hides page titles and search terms. Personal special pages
  never include names, settings values, notification content, or buttons.
- Buttons contain only the current public page path. The only retained URL
  context is the wiki index.php title and a verified public forum category anchor;
  tokens, user inputs and personal fragments are removed. MCC Live and the
  MCC/wiki homepages have no buttons.

## Implementation

The Discord client ID identifies this shared activity. The author ID in metadata
is attribution only; neither is compared against a visitor's Discord account.

The initial release uses English, the websites' primary language. It deliberately
has no development-only language override or empty native language selector.

Static logos are hosted 512-by-512 PNGs, passed directly as image URLs. They are
not embedded as base64, fetched into Blobs, or uploaded during runtime. PreMiD's
asset pipeline can publish them ahead of runtime. Dynamic category icons,
profile avatars, and game icons come from the supported websites. A letter-based default
avatar is rendered off-DOM using the website's initial and inline colors.

Account pages use hosted, padded 512x512 PNG badges: the original website
heart for reactions and the communities icon for privacy settings. Conversation,
alert, account-settings, and bookmark glyphs are rendered from Material Design
Icons 6.9.96, the same font/version referenced by the website's CSS. They work
even when the account menu is closed and require no font download at runtime.
Original glyph source: https://github.com/Templarian/MaterialDesign-Webfont/tree/v6.9.96
The font's Apache 2.0 license is preserved in the source and compiled activity.

Original authors are selected only from thread-starter/article elements, never
from an arbitrary reply or sidebar. Patch-note labels are restricted to the
official MCC Island announcements node; other threads cannot opt in by title.

Missing category icons may be resolved from a cached same-origin forum index.
No private report page is fetched to obtain an icon. Updates are serialized while
PreMiD processes images, and navigation/selection checks discard stale results.

The extension-card logo and banner use the author's approved Imgur images.
No private browsing fixture is included.

## MCC Island Wiki

Articles, categories, file pages, discussions, profiles, templates, modules,
help pages, searches, revision history, revision comparisons, and common special
pages have contextual statuses. Visual and source editing are distinguished.
Preference sections are identified from their stable MediaWiki panel IDs,
independently of the wiki interface language.

Two hosted wiki logos are selectable. Small icons prefer the infobox title
icon over a large banner, then the article's infobox image or an exact matching
card in the public wiki indexes. Responsive image sources are supported. Nested
pages can resolve icons through real, title-related hub links with a depth limit
and a bounded cache; unrelated cards and sidebar images are never substituted.
Only same-origin
wiki images are accepted; missing or failed icons fall back to the static
eyes image with the tooltip Watching the MCCI Wiki. Editing uses this fallback
until a matching pencil icon is supplied. No HTML fixtures or account data ship
with the activity.

Hidden and prerendered wiki documents do not publish updates. Visibility and
navigation are checked again after asynchronous image handling, so a background
tab cannot publish its pending result. Page headings must match the current URL
before being used; homepage section headings never become the activity title.

Unsupported pages, including direct image and attachment views, use a generic
Browsing the website status with fixed MCC Red and MCC Initials logos and no
page title, URL button, or content. Iframe/navigation guards remain active.

## Community Sites

Player identity is matched against the route before showing the page's Minecraft
head and crown. The head tooltip is the player's name; the crown tooltip is
`Crown level: N`. Homepages do not use example players or saved favorites as the
viewed player. Privacy Mode hides player identity, crown level and profile links.
Stats homepages never show a small icon. Activity names use `MCC Island Stats`
followed by Lighthouse or MCCI Hub; the generically named stats service uses
Niklas & Ally. Radar uses `MCC Island Fishing Radar`.
Lighthouse categories are read from the current route, including `/hunting`
and nested routes, even before the profile DOM finishes loading. Stale profile
images are not reused during that transition.
MCCI Hub reads the selected game dropdown trigger on each update, including
same-URL changes. Friend sorting, date ranges, ratio settings and unselected
menu options do not become the selected category. Lighthouse crown lookup skips
placeholder images and reads the adjacent numeric level, not a descriptive
label or the next crown's progress. The tooltip remains `Crown level: N`.
On Lighthouse profile loads, a bounded two-second DOM observer waits for the
matching head and crown. The last verified profile is retained only in memory,
for the same host and player, for at most 30 seconds while the header is replaced.
Changing player, leaving the profile or enabling Privacy Mode clears it. There
is no persistent storage and no whole-document readyState gate.
If browser fetching of the public head fails, PreMiD receives its image URL
instead of replacing it with the site logo. MCHeads URLs use its documented
512px size parameter, preserving the website's UUID rather than resolving a new
player through another API: https://mc-heads.net/

When Show Buttons is enabled, large icons reuse existing public button targets:
forum threads and profiles, categories, event/Island pages, rules, public wiki
pages and stats profiles. Thread-author badges link only to the original author's
same-origin forum member URL. Concrete forum category and wiki article icons
link to their own public page; generic badges do not invent new destinations.
Queries and personal fragments are removed. There are no homepage, crown,
private-report or Privacy Mode image links. This uses the native largeImageUrl
and smallImageUrl fields; no extra buttons or DOM modifications are introduced.
The link audit tests 80 view types (320 combinations) in all four Privacy Mode / Show Buttons
combinations. It checks the actual ZIP's output fields, not Discord client clicks.
Dynamic player heads fetched for fitting use a transparent 512px square with
nearest-neighbor scaling and a safety margin. Known context-selected crowns,
island icons and ReafyStats game icons are passed directly as original website
URLs, avoiding site-side cross-origin fetch failures. Player data is not fetched
from an additional API.

Radar reads its selected island heading and selection control, not fishing-spot
coordinates or filters. It never adds a button or image link: the selected island
is not encoded in a shareable URL. The reviewer's clarification supplied by the
author does not grant a homepage-link exception. Background and stale SPA updates
are discarded. Lighthouse and lighthouse.gay use the same adapter and logo.

Fixed service logos use verified hosted 512px PNGs and are passed directly to
PreMiD without runtime fetching or uploading. All 39 context-selected crown,
island and game icons retain the original website URLs. No local embedded-image
substitution ships in the public build. Existing static assets retain the
PreMiD CDN URLs assigned after the initial release. Dynamic image hosts are
the actual head/crown sources, islandcdn.themysterys.com and reafystats.com.

## ReafyStats

ReafyStats covers MC Championship player and event statistics, not MCC Island
statistics. Its activity name is `MCC Stats · ReafyStats`. The homepage shows
player selection or the selected game projection, never an example player's
identity. It has no small icon, button or clickable image.

Profiles read the active game and season controls. The declared profile heading,
avatar label and route-specific document title must agree before identity is
published. Route aliases may differ from the current Minecraft name. The large
head uses the website's own UUID with MCHeads' native 512px avatar URL, without
an additional player lookup API or runtime image fetch. Selected games use one
of nineteen original website game icons; aggregate profiles and events use the ReafyStats
badge. Tooltips identify the player, game or service.

The events list and individual event pages have distinct statuses. Event pages
identify the active Team/Individual leaderboard, not an arbitrary played-game
thumbnail. Public profile/event buttons and large-image links use the exact
sanitized page path. Game/season filters are not encoded in those URLs, so links
do not claim to restore them; small game badges have no invented target.

Privacy Mode publishes only generic statistics browsing with the site logo,
without reading profile/filter fields. Hidden documents and navigation/selection
changes discard stale updates. Show Buttons gates both buttons and image links.

# MCC + Island

Supports Minecraft Championship, MCC Island, their forums, and
event browsing on MCC Live, and the MCC Island Wiki.
No bot, personal application, account identifier,
or user-specific setup is required.

## Privacy

- Bug-report forms, lists, and individual reports never publish titles, authors,
  report content, identifiers, or buttons. Only a generic action and category icon
  are shown, regardless of Privacy Mode.
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
- Buttons contain only the current public page path, without query parameters
  or fragment identifiers. The main MCC homepage has no promotional button.
  The wiki homepage has an optional Open MCCI Wiki button, hidden in Privacy Mode.

## Implementation

The Discord client ID identifies this shared activity. The author ID in metadata
is attribution only; neither is compared against a visitor's Discord account.

The initial release uses English, the websites' primary language. It deliberately
has no development-only language override or empty native language selector.

Static logos are embedded as 512-by-512 PNG Blobs. Dynamic category icons,
profile avatars, and game icons come from the supported websites. PreMiD's
native image handling publishes these assets to Discord. A letter-based default
avatar is rendered off-DOM using the website's initial and inline colors.

Account pages use embedded, padded 512x512 PNG badges: the original website
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

Two embedded wiki logos are selectable. Small icons prefer the infobox title
icon over a large banner, then the article's infobox image or an exact matching
card in the public wiki indexes. Responsive image sources are supported. Nested
pages can resolve icons through real, title-related hub links with a depth limit
and a bounded cache; unrelated cards and sidebar images are never substituted.
Only same-origin
wiki images are accepted; missing or failed icons fall back to the embedded
eyes image with the tooltip Watching the MCCI Wiki. Editing uses this fallback
until a matching pencil icon is supplied. No HTML fixtures or account data ship
with the activity.

Hidden and prerendered wiki documents do not publish updates. Visibility and
navigation are checked again after asynchronous image handling, so a background
tab cannot publish its pending result. Page headings must match the current URL
before being used; homepage section headings never become the activity title.

Unsupported pages, including direct image and attachment views, use a generic
Browsing the website status with fixed MCC Red and MCC Initials logos and no
page title, URL button, or content. Loading/iframe/navigation guards remain active.

# Not Slop

A badge that says a human stands behind this page, and a button that lets any reader say otherwise.

Free, MIT licensed, no account, no backend required.
Landing page: https://soulcraftagency.com/notslop/

## Install

```html
<script src="https://soulcraftagency.com/notslop/v1.js"
        data-notslop
        data-to="you@yoursite.com"></script>
```

The badge renders where the script tag sits. Reports open a prefilled email to you.

## Options

| Attribute | Default | Purpose |
|---|---|---|
| `data-to` | none | Email that receives reports (mailto) |
| `data-endpoint` | none | URL receiving a JSON POST. Takes priority over `data-to` |
| `data-label` | `Not Slop` | The claim shown on the badge |
| `data-trigger-label` | `Seems like slop?` | The challenge link text |
| `data-theme` | `auto` | `auto`, `light`, `dark` |
| `data-position` | `inline` | `inline` or `corner` (fixed bottom-right) |
| `data-accent` | terracotta | Any CSS color |

Add `data-notslop-mount` to any element to render the badge inside it instead.

## Payload

```json
{
  "url": "https://yoursite.com/blog/the-page",
  "title": "The Page Title",
  "reason": "All padding, no substance",
  "comment": "Six paragraphs before the actual answer.",
  "email": "reader@example.com",
  "ts": "2026-07-31T18:04:11.204Z",
  "v": "1.0.0"
}
```

Sent via `navigator.sendBeacon`, falling back to `fetch` with `keepalive`.

## Programmatic use

```js
const w = NotSlop.mount({ to: 'you@site.com', theme: 'dark' });
document.querySelector('#footer').appendChild(w.host);
w.open();   // open the report dialog
w.close();
```

Useful in single-page apps where the script tag position means nothing.

## Design notes

- **Shadow DOM.** Host CSS cannot reach in, widget CSS cannot leak out. Verified against a page running `* { font-family: Comic Sans MS !important }`.
- **No network by default.** Zero requests unless `data-endpoint` is set.
- **No cookies.** One `localStorage` key for rate limiting.
- **Abuse resistance.** One report per page per 24h, hidden honeypot field, and submissions faster than 1.2s are discarded.
- **Accessible.** Real dialog semantics, focus management, Escape to close, visible focus rings, honors `prefers-reduced-motion` and `prefers-color-scheme`.
- **About 6KB gzipped.** Ships unminified so you can read it before you trust it.

## Attribution

The report dialog carries one visible line: *Not Slop is a free tool from Soulcraft*, linking to the project page. That is the whole ask, and the MIT license lets you remove it.

What the widget will never do is touch your page. It injects no anchors, no markup, no JSON-LD, and no `<link>` tags into your document, and the test suite asserts all four. Hidden widget links are a documented link scheme that search engines discount, and a tool about content accountability has no business shipping one.

If you want to credit it on purpose:

```html
<p>Slop reporting by
  <a href="https://soulcraftagency.com/notslop/">Not Slop</a>,
  a free tool from <a href="https://soulcraftagency.com/">Soulcraft</a>.</p>
```

## Self-hosting

Copy `v1.js` anywhere and point the `src` at your own copy. That is the intended use, not a loophole.

## License

MIT. Built by [Soulcraft](https://soulcraftagency.com).

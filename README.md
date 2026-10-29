# Bookshelf Tracker

Your books on visual shelves: search, scan or add your own, then rate and review.

- Search Open Library by title, author or ISBN (free, no key)
- Scan the barcode with your camera (browsers with the native BarcodeDetector, e.g. Chrome on Android)
- Add any book yourself with a photo of the cover (shrunk to fit browser storage)
- Custom shelves with coloured spines; hover or focus pulls a book out and shows its cover, rating and review
- Star rating and review per book, move between shelves
- Data stays in the browser (localStorage). Download a backup file and restore it on any device.

Two ways this repo ships, from the same `src/`:

| Target | How |
|---|---|
| **GitHub Pages** (`madelinben.github.io/bookshelf-tracker/`) | `pnpm build:demo` builds `demo/` into `docs/` (Pages source: `main` / `/docs`) |
| **get-out-there** (Cloudflare) | imported as workspace package `@get-out-there/bookshelf` (`BookshelfApp`) |

```bash
pnpm install
pnpm dev          # demo at http://localhost:3105/bookshelf-tracker/
pnpm test         # logic unit tests
pnpm build:demo   # static site -> docs/
```

Package rules: no router/auth/app imports; Tailwind default palette only (no custom tokens); host must `@source` this folder. Peer deps: react, react-dom, lucide-react.

Host hook: `<BookshelfApp beforeExport={gate} />` runs `gate(label)` before a backup download or restore (e.g. an ad gate); reject to cancel.

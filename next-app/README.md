## Vangogh – Next.js port

This directory contains the Next.js version of Vangogh. The UI mirrors the original Flask templates and all colour extraction logic now runs inside the Node API routes.

### Prerequisites

- Node 18+ (Next.js 16 requires it)
- Access to the Google Custom Search JSON API
- Access to a Vercel Blob store (read/write token)

The server requires explicit Google credentials; expose them via `.env.local` (or your deployment environment):

```
GOOGLE_API_KEY=your_google_custom_search_key
GOOGLE_CSE_ID=your_custom_search_engine_id
BLOB_READ_WRITE_TOKEN=your_vercel_blob_rw_token
```

### Available scripts

```bash
npm run dev     # start the dev server with hot reload
npm run build   # create a production build
npm run start   # serve the production build
npm run lint    # run Next.js/ESLint rules
```

### Behaviour parity

- `/api/search` downloads Google Custom Search image results, clusters them, and returns the same data shape the Flask backend exposed.
- `/api/img` accepts uploaded images or bundled samples to generate palettes for sizes 3–7.
- Legacy JavaScript (`static/main.js` and `static/mobile.js`) is reused to keep the UI behaviour identical.

Cached downloads are stored under `public/static/desk/<search_term>`; the archive page lists whatever is available there. Use the “refresh” button in the UI to clear the cache for a query.

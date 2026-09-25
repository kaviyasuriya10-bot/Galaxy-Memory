# GalaxyMemory

A galaxy-themed memory journal — memories are stars, albums group them
together, and a timeline lays everything out chronologically.

This build now has a real Node/Express backend instead of `localStorage`,
so your data lives on disk in the `data/` folder (and on a real server,
would be shared across devices/browsers instead of stuck in one browser).

## Project structure

```
galaxy-memory/
├── server.js          Express server: REST API + serves the frontend
├── package.json
├── public/             the frontend (previously your 3 uploaded files)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── data/                auto-created: memories.json, albums.json
└── uploads/              auto-created: uploaded photos land here
```

## Running it

You need [Node.js](https://nodejs.org) (v18+) installed.

```bash
cd galaxy-memory
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

That's it — one process serves both the API and the frontend, so there's
no CORS setup to worry about. Data persists in `data/*.json` between
restarts, and uploaded photos are saved as real files in `uploads/`
instead of being base64-encoded into every request forever.

## API

| Method | Route              | Description                          |
|--------|---------------------|---------------------------------------|
| GET    | `/api/memories`     | List all memories                     |
| POST   | `/api/memories`     | Create a memory (JSON body)           |
| DELETE | `/api/memories/:id` | Delete a memory (and its image file)  |
| GET    | `/api/albums`       | List all albums                       |
| POST   | `/api/albums`       | Create an album                       |
| PUT    | `/api/albums/:id`   | Update an album (name/description/memoryIds) |
| DELETE | `/api/albums/:id`   | Delete an album (memories are kept)   |

A memory looks like:

```json
{
  "id": 1735689600000,
  "title": "Trip to the Mountains",
  "date": "2026-05-01",
  "description": "...",
  "tags": ["travel", "friends"],
  "color": "#b493ff",
  "x": 42.1,
  "y": 55.3,
  "image": "/uploads/1735689600000-1735689600123.jpg",
  "createdAt": "2026-05-01T12:00:00.000Z"
}
```

When creating a memory, send `image` as a base64 data URL
(`data:image/png;base64,...`) if there's a photo — the server decodes it,
writes a real file into `uploads/`, and stores the resulting URL instead.

## Notes / what changed from the original

- All the visual/interactive behavior (galaxy view, timeline, albums,
  constellation lines, search, zoom) is untouched — same `index.html`
  and `style.css`.
- `app.js` no longer reads/writes `localStorage`. It now calls the
  `/api/*` endpoints above (see the "API CLIENT" section near the top
  of the file) and renders whatever the server returns.
- Storage is plain JSON files on disk (`data/memories.json`,
  `data/albums.json`) rather than a database — that keeps the project
  dependency-free (just Express) and easy to inspect/back up. If you
  outgrow it, swapping `readJSON`/`writeJSON` in `server.js` for a real
  database (SQLite, Postgres, etc.) is the natural next step.
- The "AI Companion" nav item and the share/edit (↗ / ✎) buttons in the
  memory panel are still present in the markup but aren't wired up to
  anything — same as in the file you uploaded.

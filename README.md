# JPMC Projects Timeline — React + Vite

An editable **Arabic / RTL** timeline of Jordan Phosphate Mines Company's companies, partnerships, factories, investments, infrastructure, and historic facilities. Contains **53 entries** from the existing timeline.

## Run locally

Requires Node.js **20.19+** (or a current LTS release) and npm.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (normally <http://localhost:5173/>).

For a production build:

```bash
npm run build
npm run preview
```

Deploy the generated `dist/` directory to a static web host. A React build is **not** a standalone HTML file you open using `file://`; use the Vite server or deploy `dist/`.

## Project structure

```text
jpmc-react-timeline/
├── projects.json                    # All project information; edit this file!
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx                     # React entry point
│   ├── App.jsx                      # Page layout, filters and state
│   ├── config.js                    # Status colors, categories, date range
│   ├── styles.css                   # All styling / responsive rules
│   ├── components/
│   │   ├── Filters.jsx              # Search, category/status pills
│   │   ├── Timeline.jsx             # Horizontal timeline, zoom, bar rendering
│   │   └── ProjectDetails.jsx       # Click-to-open details panel
│   └── utils/
│       └── timeline.js              # Sorting, filtering, timeline helpers
└── README.md
```

## Edit the data

Open **`projects.json` at the repository root**. Each object is a company or project:

```json
{
  "id": "new-project",
  "name": "مثال: مشروع جديد",
  "group": "factories",
  "status": "building",
  "start": 2026.5,
  "end": 2029,
  "startText": "منتصف 2026",
  "endText": "مستهدف: 2029",
  "detail": "وصف المشروع يظهر عند الضغط على المسطرة.",
  "share": "30%",
  "partner": "شريك المشروع",
  "exactness": "التاريخ تقريبي"
}
```

- **`id`**: unique identifier for each timeline row.
- **`name`**: title displayed next to the timeline and in the details panel.
- **`group`**: `companies`, `factories`, `infrastructure`, `water`, `environment`, or `historic`.
- **`status`**: `operating`, `building`, `planned`, `completed`, `stopped`, `ended`, or `unknown`.
- **`start` / `end`**: numeric timeline positions. A whole year (`2026`) is placed at January 1; fractional years (`2026.5`) are an **approximation** for later in the year. `end` can be `null` if no confirmed end is known.
- **`startText` / `endText`**: human-readable dates in Arabic. Use them to preserve exact months/days rather than inferring them from the numeric positions. `endText` may be `null`.
- **`detail`**: description in the click-to-open side panel.
- **`share` / `partner` / `exactness`**: optional detail text. Use empty strings if unavailable.

For a currently operating or actively being built project without an end date, the bar runs to the fixed **data-as-of** line (23 October 2026). Planned announcements with no end appear as milestones, not artificial date ranges. The static reference date is in `src/config.js`; update it when refreshing the dataset. A future `end` is an **estimated target**, not proof of completion.

## Interaction

- Scroll the timeline horizontally to navigate years, and vertically to see more entries.
- Zoom in/out with `+` and `−`, or jump to earliest/latest years.
- Search in Arabic, filter by category or status.
- Click a project name or bar for the details drawer; press **Escape** to close.
- Categories are stacked; projects that overlap in time appear on distinct aligned rows rather than hiding each other.

## Data provenance / important note

The entries were transcribed from the earlier research/list in this conversation. Some start years are an agreement date, incorporation date, first documented operation, or planned date—not the same event. Some companies and their associated facilities are **separate rows for visualization**, not separate legal entities. This dataset is illustrative and may contain errors or omissions; verify with official JPMC disclosures before drawing investment conclusions. It is not a recommendation to buy or sell shares.

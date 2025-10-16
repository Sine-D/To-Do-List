# Listify — To-Do List Web App

Organize your day with style. A simple, dependency-free front-end To-Do list app built with HTML, CSS and JavaScript.

## Project overview

Listify is a lightweight client-side To-Do application that helps you capture tasks, categorize them, set due dates, and track progress. It's a static web project intended to be run locally or hosted as static files.

Key goals:
- Minimal, accessible UI.
- No backend required — state is stored in the browser.
- Easy to customize styles and behavior.

## Features

- Add tasks with optional category and due date
- Task statistics (total, completed, remaining)
- Progress bar and simple streak tracking
- Responsive layout (works in modern desktop and mobile browsers)

## Demo / Live

If this repo includes a hosted demo, see `Link to live.txt` for the deployment URL. Otherwise you can run the app locally (instructions below).

## Files

- `index.html` — App entry page and UI markup.
- `css/style.css` — Styles for the app.
- `js/script.js` — Client-side behavior and task logic.
- `Link to live.txt` — (If present) quick link to a live demo or deployment.

## Getting started (run locally)

Prerequisites: a modern web browser. Optionally, Python or Node.js if you want to serve files over a local HTTP server.

Option 1 — Open directly

1. Open the project folder in your file explorer.
2. Double-click `index.html` to open it in your browser.

Note: Some browsers restrict certain features when opening files directly (file://). If you see issues, use a local server below.

Option 2 — Serve with Python (recommended for testing)

Open a command prompt at the project root (`index.html` location) and run:

```bat
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

Option 3 — Serve with Node (http-server)

If you have Node.js installed you can run:

```bat
npx http-server . -p 8000
```

## Development notes

- Edit layout/structure in `index.html`.
- Styling is in `css/style.css` — follow existing class names to extend or override styles.
- Behavior and persistence (likely `localStorage`) are implemented in `js/script.js`. Look for task CRUD functions and event listeners tied to `#addBtn`, `#taskList`, etc.
- Images/icons: the HTML currently references an external image for the app icon — consider replacing it with a local asset in `assets/` if you want offline reliability.

## Testing & quick checklist

- Add a task and confirm it appears in the task list.
- Mark a task completed and verify stats and progress bar update.
- Reload the page and confirm tasks persist (if `localStorage` is used).



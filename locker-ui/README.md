# Smart Locker UI

Frontend application for the Smart Locker system, built with React + TypeScript.

## Solution Notes

### Approach

- Built the app as one simple screen that shows lockers and lets users store or retrieve a package.
- Kept the locker information the same across the app so the screen and API work together properly.
- Let users pick a locker first, then use that locker when storing a package.
- Added simple checks for email and phone before sending the form.

### Tradeoffs

- Chose local component state instead of a larger state library because the application is small and the main shared state is limited to locker data, loading, errors, and the selected locker.
- Refreshed locker data after store and retrieve actions. Keeps the UI simple and consistent with backend state.
- Kept validation lightweight in the browser.
- The UI is coupled to the current API shape and local development ports for simplicity.

### Assumptions

- The API runs at http://localhost:5000 and sends the locker data needed by the app.
- The app reloads locker data after each action so it shows the latest locker status.
- Users choose a locker before storing a package, and full lockers cannot be used.
- Login, saved browser data, and live updates are not included.

## Services and Ports

- UI (React): http://localhost:3000
- API (Express): http://localhost:5000

## Prerequisites

- Node.js 14.3.21
- npm 9+

## Installation

Install dependencies for both services from the project root:

```bash
cd locker-ui
npm install

cd ../locker-api
npm install
```

## Run the Project

Run API and UI in two terminals.

### 1. Start API

```bash
cd locker-api
npm run dev
```

API will run on http://localhost:5000.

### 2. Start UI

```bash
cd locker-ui
npm start
```

UI will run on http://localhost:3000.

### UI

```bash
cd locker-ui
npm run build
npm test
```

### API

```bash
cd locker-api
npm run build
npm test
```

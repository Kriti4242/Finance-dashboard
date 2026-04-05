# Finance Dashboard UI (React + Tailwind)

A clean and interactive finance dashboard built for frontend evaluation.

## Tech Stack

- React (Vite)
- Tailwind CSS
- Recharts (for charts)
- Local state with React hooks (`useState`, `useMemo`, `useEffect`)

## Features

### 1) Dashboard Overview
- Summary cards: **Total Balance**, **Income**, **Expenses**
- Time-based visualization: **Balance trend** line chart
- Categorical visualization: **Spending breakdown** pie chart

### 2) Transactions Section
- Transactions table includes:
  - Date
  - Description
  - Amount
  - Category
  - Type (income/expense)
- Includes:
  - Search by description/category/amount
  - Type filter (all/income/expense)
  - Sorting by date, description, category, type, amount

### 3) Basic Role-Based UI (Frontend Simulation)
- **Viewer**: can view data only
- **Admin**: can add and edit transactions
- Role switcher available in header dropdown

### 4) Insights Section
- Highest spending category
- Monthly expense comparison (latest month vs previous)
- Savings rate insight

### 5) State Management
- Managed with React hooks for:
  - Transactions
  - Filters/search/sort
  - Selected role
  - Theme
- Transactions persist in `localStorage`

### 6) UI/UX Details
- Attractive modern layout with gradient cards, glass panels, and an interactive sidebar navigation
- Responsive layout for mobile/tablet/desktop
- Dark mode toggle
- Graceful empty states in charts/table

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install
```bash
npm install
```

### Run
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Project Structure

```text
.
├── src
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## Notes
- This project uses mock/static data and does not require a backend.
- Admin actions are intentionally frontend-only for demonstration.


## Extra Help
- See `RUN_AND_SAVE_GUIDE.md` for troubleshooting npm registry issues and creating a full zip archive of the project for submission.
- Use `bash save-project.sh` to generate a timestamped zip file of the complete codebase.


## Troubleshooting
- If `npm run dev` says **Missing script: dev**, you are likely in the wrong folder. Run `npm run` and confirm scripts are listed from this project.
- Use `npm start` as an alternative dev command (same as `npm run dev`).
- For audit warnings, run `npm audit` and then `npm audit fix`.

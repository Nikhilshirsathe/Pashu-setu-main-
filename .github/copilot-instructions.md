# Copilot Instructions for Pashu Setu

## Project Overview
Pashu Setu is a modern React 18 application for animal healthcare management, featuring role-based access for farmers, veterinarians, volunteers, and lab employees. The app is structured for modularity, scalability, and rapid UI development using Vite and Tailwind CSS.

## Architecture & Key Patterns
- **Component Structure**: UI is organized into `src/components` (shared UI like `Header.jsx`, `Sidebar.jsx`) and `src/pages` (feature pages like `Dashboard.jsx`, `Consultation.jsx`, etc.).
- **Role-Based Access**: Each user type (farmer, doctor, volunteer, lab employee) has a dedicated dashboard and permissions. See `src/pages/Auth.jsx` for authentication logic.
- **Feature Pages**: Major features (Consultation, Lab, Emergency, Education, Alerts, Pharmacy, Records) are implemented as separate pages in `src/pages/`.
- **Subfeatures**: Cross-cutting or embedded features (Analytics, ChatSupport, FarmOverview, QuickActions, VideoCalls) are in `src/pages/subfeatures/`.
- **Styling**: Uses Tailwind CSS via `index.css` and `tailwind.config.js`. Prefer utility classes for layout and design.
- **Routing**: (If present) Routing logic is typically in `App.jsx` or `main.jsx`.

## Developer Workflows
- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Add new features**: Place new pages in `src/pages/`, shared UI in `src/components/`, and subfeatures in `src/pages/subfeatures/`.
- **Styling**: Use Tailwind utility classes. Update `tailwind.config.js` for customizations.

## Conventions & Practices
- **React Hooks**: Use functional components and hooks throughout.
- **File Naming**: Use PascalCase for components/pages (e.g., `FarmOverview.jsx`).
- **Separation of Concerns**: Keep business logic in pages, UI logic in components.
- **No backend code**: This repo is frontend-only; all integrations are via API calls (if present).
- **Testing**: (Add details if test setup exists.)

## Integration Points
- **External APIs**: (Document endpoints if present.)
- **Icons**: Use Lucide React for icons.

## Examples
- To add a new alert type, create a component in `src/pages/Alerts.jsx` and update the dashboard as needed.
- For a new user role, extend logic in `src/pages/Auth.jsx` and add a dashboard page.

## References
- Main entry: `src/main.jsx`, `src/App.jsx`
- Shared UI: `src/components/`
- Feature pages: `src/pages/`
- Subfeatures: `src/pages/subfeatures/`
- Styles: `src/index.css`, `tailwind.config.js`

---
For questions, see `README.md` or ask a maintainer.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

@frontend 
frontend/
├── src/
│   ├── superadmin/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   └── SuperAdminDashboard.jsx
│   │   │   └── Profile/
│   │   │       └── Profile.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── companyadmin/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   └── CompanyAdminDashboard.jsx
│   │   │   └── CompanyDetails/
│   │   │       └── CompanyDetails.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── employee/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   └── EmployeeDashboard.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   └── Navbar.jsx
│   │   │   ├── Home/
│   │   │   │   └── LandingPage.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── Unauthorized.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── styles/
│   ├── App.jsx
│   ├── Context/
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── main.jsx
│   └── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
can you arange this folder code files into this folder structure move file from the @Dashboard  to there specific folders 
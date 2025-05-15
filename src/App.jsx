import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import { NotificationProvider } from "./Context/NotificationContext";
import Navbar from "./components/Layout/Navbar";
import LandingPage from "./components/Home/LandingPage";
import Login from "./components/Auth/Login";
// import Register from './components/Auth/Register';
import Unauthorized from "./components/Auth/Unauthorized";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Container,
  Alert,
  AlertTitle,
} from "@mui/material";
import SuperAdminDashboard from "./components/superadmin/SuperAdminDashboard";
import CompanyDetails from "./components/superadmin/CompanyDetails";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import CompanyAdminDashboard from "./components/companyadmin/CompanyAdminDashboard";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import { ErrorBoundary } from "react-error-boundary";
import Profile from "./components/Profile/Profile";
import TaskTimeline from "./components/employee/TaskTimeline";
import MyTasks from "./components/employee/MyTasks";

import Pricing from "./pages/PricingPage";
import Contact from "./pages/ContactUs";
import About from "./pages/AboutPage";

import AssignedTasks from "./components/employee/AssignedTasks";
import ChatApp from "./components/chat/WhatsAppClone";

import { useEffect } from "react";
// import VideoConference from "./components/video/VideoConference";
// import CreateMeeting from "./components/video/CreateMeeting";
// import JoinMeeting from "./components/video/JoinMeeting";
// import MeetingRoom from "./components/video/MeetingRoom";

// Enhanced theme with chat-related styles
const theme = createTheme({
  palette: {
    primary: {
      main: "#0E2954",
      light: "#1F6E8C", // Used for chat bubbles
    },
    secondary: {
      main: "#1F6E8C",
    },
    background: {
      default: "#2E8A99",
      paper: "#ffffff",
      chat: "#f5f5f5", // New color for chat background
    },
    accent: {
      main: "#84A7A1",
    },
    text: {
      primary: "#000000",
      secondary: "#666666",
      white: "#ffffff", // For text on dark backgrounds
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    // Add chat-specific typography variants
    chat: {
      message: {
        fontSize: "0.875rem",
        lineHeight: 1.43,
      },
      timestamp: {
        fontSize: "0.75rem",
        opacity: 0.7,
      },
    },
  },
  components: {
    // Add custom styles for MUI components used in chat
    MuiDialog: {
      styleOverrides: {
        paper: {
          height: "80vh",
          maxHeight: "80vh",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          "&.chat-message": {
            padding: "8px 12px",
            maxWidth: "70%",
            borderRadius: 12,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&.chat-action": {
            padding: 8,
          },
        },
      },
    },
  },
});

function ErrorFallback({ error }) {
  return (
    <Container>
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Something went wrong</AlertTitle>
        {error.message}
      </Alert>
    </Container>
  );
}

function NotificationErrorFallback({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong with notifications:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

function App() {
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                {/* <Route path="/register" element={<Register />} /> */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route
                  path="/super_admin_dashboard"
                  element={
                    <ProtectedRoute roles={["super_admin"]}>
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/companies/:id"
                  element={
                    <ProtectedRoute roles={["super_admin"]}>
                      <CompanyDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company_admin_dashboard"
                  element={
                    <ProtectedRoute roles={["company_admin"]}>
                      <CompanyAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/employee_dashboard"
                  element={
                    <ProtectedRoute roles={["employee"]}>
                      <EmployeeDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/task_timeline"
                  element={
                    <ProtectedRoute roles={["employee"]}>
                      <TaskTimeline />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-tasks"
                  element={
                    <ProtectedRoute roles={["employee"]}>
                      <MyTasks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assigned-tasks"
                  element={
                    <ProtectedRoute roles={["employee"]}>
                      <AssignedTasks />
                    </ProtectedRoute>
                  }
                />

                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />

                <Route path="/chat" element={<ChatApp />} />

                {/* Video Meeting Routes
                <Route
                  path="/video-conference"
                  element={
                    <ProtectedRoute>
                      <VideoConference />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-meeting"
                  element={
                    <ProtectedRoute>
                      <CreateMeeting />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/join-meeting"
                  element={
                    <ProtectedRoute>
                      <JoinMeeting />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meeting-room/:meetingCode"
                  element={
                    <ProtectedRoute>
                      <MeetingRoom />
                    </ProtectedRoute>
                  }
                /> */}
              </Routes>
            </Router>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

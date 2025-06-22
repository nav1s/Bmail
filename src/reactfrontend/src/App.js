import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import InboxPage from "./pages/inboxPage";
import ProtectedRoute from "./components/routes/protectedRoute";
import { getToken } from "./utils/tokenUtils";
import { UserProvider } from "./contexts/UserContext";

/**
 * App
 * Entry point for the application.
 * Routes are wrapped in React Router and global user context.
 */
function App() {
  // Determine if a token is present (user is authenticated)
  const isAuthenticated = !!getToken();

  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/mails" element={<Navigate to="/mails/inbox" replace />} />
            <Route path="/mails/:label" element={<InboxPage />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/mails/inbox" : "/login"} />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;

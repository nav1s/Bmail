import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import InboxPage from "./pages/inboxPage";
import ProtectedRoute from "./components/routes/protectedRoute";
import { getTokenFromCookie } from "./utils/tokenUtils";

function App() {
  // checking for auth-cookie
  const isAuthenticated = !!getTokenFromCookie();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Route */}
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/inbox" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;

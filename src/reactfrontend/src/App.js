import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/registerPage";
import InboxPage from "./pages/inboxPage";
import ProtectedRoute from "./components/routes/protectedRoute";
import { getToken } from "./utils/tokenUtils";

function App() {
  // checking for auth-cookie
  const isAuthenticated = !!getToken();

  return (
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
      );
}

export default App;

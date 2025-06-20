import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { saveTokenToCookie } from "../utils/tokenUtils";
import { getUserByUsername } from "../services/userService";
import { saveUser } from "../utils/userUtils";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form.username, form.password);
      saveTokenToCookie(data.token);

      // Fetch full user info
      const userInfo = await getUserByUsername(form.username);
      saveUser(userInfo);

      navigate("/mails/inbox");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
      <Link to="/register">Don't have an account? Register</Link>
    </div>
  );
}

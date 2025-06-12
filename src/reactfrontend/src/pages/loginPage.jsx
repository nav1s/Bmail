import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import { saveTokenToCookie } from "../utils/tokenUtils";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // real time updating form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // talking to backend, displaying error
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const data = await login(form.username, form.password);
    saveTokenToCookie(data.token);
    navigate("/inbox");
  } catch (err) {
    setError(err.message);
  }
};


  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
      <Link to="/register">Don't have an account? Register</Link>
    </div>
  );
}

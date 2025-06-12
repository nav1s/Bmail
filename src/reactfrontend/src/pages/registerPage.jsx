import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/login");
        } catch (err) {
    setError(err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required />
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required />
        <input disabled placeholder="Profile Picture (coming soon)" />
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Link to="/login">Already have an account? Login</Link>
    </div>
  );
}

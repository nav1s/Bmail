import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
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

    // validation for password confirmation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...registerData } = form;

    try {
      await register(registerData);
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
        <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
        <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required />
        <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required />
        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Link to="/login">Already have an account? Login</Link>
    </div>
  );
}


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  }

  function validate() {
    const next = {};

    if (form.name.trim().length < 2) {
      next.name = "Enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      next.password = "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) ||
        !/[0-9]/.test(form.password)) {
      next.password = "Use uppercase, lowercase, and numeric characters.";
    }

    if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create account.");
      }

      navigate("/login", { replace: true });
    } catch (error) {
      setServerError(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create admin account"
      subtitle="Set up your credentials to manage your store."
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="auth-form register-form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="auth-alert" role="alert">
            {serverError}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            value={form.name}
            onChange={updateField}
            className={errors.name ? "input-error" : ""}
            required
          />
          {errors.name && (
            <span className="field-error">{errors.name}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="admin@yourstore.com"
            autoComplete="email"
            value={form.email}
            onChange={updateField}
            className={errors.email ? "input-error" : ""}
            required
          />
          {errors.email && (
            <span className="field-error">{errors.email}</span>
          )}
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword}
        />

        <p className="password-hint">
          Use at least 8 characters with uppercase, lowercase, and a number.
        </p>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Creating account...
            </>
          ) : (
            <>
              Create admin account
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="auth-security-note">
          Admin access must be authorized by your store administrator.
        </p>
      </form>
    </AuthLayout>
  );
}

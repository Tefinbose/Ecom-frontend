
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  }

  function validate() {
    const next = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email address.";
    }

    if (!form.password) {
      next.password = "Password is required.";
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
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();
      console.log(data);
      

      if (!response.ok) {
        throw new Error(data.message || "Unable to sign in.");
      }

      // Prefer a secure HttpOnly cookie set by the backend.
      // If your API returns a bearer token instead, adapt this
      // section to your backend's documented authentication contract.
      if (data.token) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("adminToken", data.token);
      }
    console.log("Login successfully completed")
      navigate("/dashboard/*", { replace: true });
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
      title="Welcome back"
      subtitle="Enter your admin credentials to access your store."
      footer={
        <p>
          Don't have an admin account?{" "}
          <Link to="/register" className="auth-link">
            Create account
          </Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="auth-alert" role="alert">
            {serverError}
          </div>
        )}

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
          error={errors.password}
        />

        <div className="auth-options">
          <label className="remember-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoaderCircle className="spin" size={18} />
              Signing in...
            </>
          ) : (
            <>
              Sign in to dashboard
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="auth-security-note">
          Your account is protected by secure authentication.
        </p>
      </form>
    </AuthLayout>
  );
}

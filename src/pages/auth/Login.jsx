import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "admin@shopify.com", password: "admin@123" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

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
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.token) {
        throw new Error(data?.message || "Invalid credentials. Please verify your email and password.");
      }

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("adminToken", data.token);
      storage.setItem(
        "adminUser",
        JSON.stringify(data.adminData || { email: form.email, name: "Store Administrator" })
      );

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setForm({ email: "admin@shopify.com", password: "admin@123" });
    setErrors({});
    setServerError("");
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your admin credentials to access your store workspace."
      footer={
        <p>
          Don't have an admin account?{" "}
          <Link to="/admin/register" className="auth-link">
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
            placeholder="admin@empirestore.com"
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

          <button
            type="button"
            onClick={fillDemo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <Sparkles size={13} /> Fill demo login
          </button>
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
          Your account is secured with local administrator session protection.
        </p>
      </form>
    </AuthLayout>
  );
}

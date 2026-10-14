
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  id,
  label = "Password",
  value,
  onChange,
  placeholder = "Enter your password",
  autoComplete = "current-password",
  error,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>

      <div className={`password-input ${error ? "input-error" : ""}`}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

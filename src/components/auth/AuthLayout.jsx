
import { Package, ShieldCheck, ChartNoAxesCombined, ShoppingBag } from "lucide-react";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Package size={25} />
          </div>
          <span>Store<span>Admin</span></span>
        </div>

        <div className="auth-brand-content">
          <span className="auth-eyebrow">
            <ShieldCheck size={15} /> YOUR STORE, YOUR CONTROL
          </span>

          <h1>
            Manage your store.
            <br />
            <span>Grow your business.</span>
          </h1>

          <p>
            Your central workspace for products, orders, customers,
            inventory, and everything that powers your store.
          </p>

          <div className="auth-feature-list">
            <div>
              <ChartNoAxesCombined size={19} />
              <span>Real-time business insights</span>
            </div>
            <div>
              <ShoppingBag size={19} />
              <span>Everything in one workspace</span>
            </div>
            <div>
              <ShieldCheck size={19} />
              <span>Secure administration</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          © {new Date().getFullYear()} StoreAdmin. All rights reserved.
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <div className="auth-brand-icon">
              <Package size={22} />
            </div>
            <strong>Store<span>Admin</span></strong>
          </div>

          <div className="auth-heading">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          {children}

          <div className="auth-form-footer">{footer}</div>
        </div>
      </section>
    </main>
  );
}

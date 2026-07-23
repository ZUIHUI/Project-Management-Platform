import { useEffect } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  formatProductDocumentTitle,
  PRODUCT_MARK,
  PRODUCT_NAME,
  PRODUCT_SHORT_NAME,
} from "../../shared/productPresentation.js";

const benefits = ["專案、Issue 與交付節奏集中管理", "清楚的角色與專案範圍", "適合桌面與行動裝置的工作流程"];

export default function AuthLayout({ eyebrow, title, description, children, footer }) {
  useEffect(() => {
    document.title = formatProductDocumentTitle(title);
  }, [title]);

  return (
    <main className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,0.7fr)]">
      <section className="relative hidden overflow-hidden bg-surface-dark px-12 py-10 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between xl:px-16">
        <Link to="/login" className="inline-flex min-h-11 w-fit items-center gap-3 rounded-control font-display text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-semibold">{PRODUCT_MARK}</span>
          {PRODUCT_NAME}
        </Link>

        <div className="max-w-xl py-16">
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--color-muted-soft)]">專案交付平台</p>
          <h2 className="mt-5 font-display text-5xl font-normal leading-[1.05] tracking-[-0.04em] xl:text-6xl">穩定協作，<br />清楚交付。</h2>
          <p className="mt-6 max-w-lg text-base leading-7 text-[var(--color-muted-soft)]">把複雜工作拆成團隊能理解、能追蹤、能完成的下一步。</p>
          <ul className="mt-10 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-sm text-white">
                <CheckCircle2 size={19} className="text-brand" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[var(--color-muted-soft)]">{PRODUCT_NAME} · 2026</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-10 inline-flex min-h-11 items-center gap-2 rounded-control text-sm font-semibold text-body hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden">
            <ArrowLeft size={17} aria-hidden="true" />
            {PRODUCT_SHORT_NAME}
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl font-normal tracking-[-0.04em] text-ink">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-body">{description}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-7 border-t border-line-soft pt-6 text-sm text-body">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}

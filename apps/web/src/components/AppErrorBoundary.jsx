import { Component } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import { buttonClass } from "./ui/styles";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? "未知錯誤" };
  }

  componentDidCatch(error) {
    console.error("App crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-surface p-5 sm:p-8">
          <section className="w-full max-w-xl rounded-card border border-line bg-canvas p-6 shadow-soft sm:p-8" aria-labelledby="app-error-title">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger"><CircleAlert size={22} aria-hidden="true" /></span>
            <p className="mt-6 text-xs font-semibold tracking-[0.12em] text-danger">系統錯誤</p>
            <h1 id="app-error-title" className="mt-2 font-display text-3xl font-normal tracking-tight text-ink">頁面暫時無法顯示</h1>
            <p className="mt-3 text-sm leading-6 text-body">應用程式已攔截錯誤，資料不會因這個畫面而被修改。重新整理後若仍發生，請將下方訊息提供給維護人員。</p>
            <details className="mt-6 rounded-control bg-surface p-4"><summary className="cursor-pointer text-sm font-semibold text-ink">查看錯誤訊息</summary><pre className="mt-3 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-body">{this.state.message}</pre></details>
            <div className="mt-6 flex flex-wrap gap-2"><button type="button" className={buttonClass()} onClick={() => window.location.reload()}><RotateCcw size={17} aria-hidden="true" />重新整理</button><a className={buttonClass({ variant: "secondary" })} href="#/home">回到總覽</a></div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

import { Component } from "react";

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
        <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
          <div className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow">
            <h1 className="text-xl font-bold text-red-700">應用程式發生錯誤</h1>
            <p className="mt-2 text-sm text-slate-600">已攔截錯誤避免白畫面，請重新整理或回報訊息。</p>
            <pre className="mt-4 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-700">{this.state.message}</pre>
            <button
              type="button"
              className="mt-4 rounded bg-blue-600 px-3 py-2 text-sm text-white"
              onClick={() => window.location.reload()}
            >
              重新整理
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

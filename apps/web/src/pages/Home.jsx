import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Workspace Home</h1>
        <p className="text-sm text-gray-600">My Tasks / Inbox / 快速建立入口。</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">My Tasks</h2>
          <p className="mt-2 text-sm text-gray-600">檢視指派給我的進行中任務。</p>
          <Link to="/projects" className="mt-3 inline-block text-sm font-medium text-blue-700">
            進入 Projects →
          </Link>
        </article>
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Inbox</h2>
          <p className="mt-2 text-sm text-gray-600">快速查看提及、指派、狀態更新通知。</p>
          <Link to="/notifications" className="mt-3 inline-block text-sm font-medium text-blue-700">
            進入 Notifications →
          </Link>
        </article>
        <article className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Quick Create</h2>
          <p className="mt-2 text-sm text-gray-600">建立新專案、里程碑與 backlog issue。</p>
          <Link to="/projects" className="mt-3 inline-block text-sm font-medium text-blue-700">
            快速建立 →
          </Link>
        </article>
      </section>
    </div>
  );
}

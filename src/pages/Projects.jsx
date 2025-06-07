import { useState } from "react"
import ProjectCard from "../components/ProjectCard"
import Modal from "../components/Modal"
import StagementEditor from "../components/StagementEditor"

const initialProjects = [
  {
    id: "1",
    name: "AI 專案平台",
    description: "建立完整任務追蹤系統",
    status: "進行中",
    createdAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2025-06-03T12:00:00.000Z",
    stagements: [
      { name: "階段1", tasks: [] },
      { name: "階段2", tasks: [] },
    ],
  },
  {
    id: "2",
    name: "UI 設計更新",
    description: "重構元件與設計系統",
    status: "已完成",
    createdAt: "2025-05-15T00:00:00.000Z",
    updatedAt: "2025-05-20T00:00:00.000Z",
    stagements: [
      { name: "階段1", tasks: [] },
    ],
  },
]

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [newStagements, setNewStagements] = useState(1)
  const [selectedProject, setSelectedProject] = useState(null)

  const handleAddProject = () => {
    if (!newProjectName.trim()) return
    const now = new Date().toISOString()
    const stagementsArr = Array.from({ length: newStagements }, (_, i) => ({
      name: `階段${i + 1}`,
      tasks: [],
    }))
    const newProject = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription || "尚未填寫描述",
      status: "進行中",
      createdAt: now,
      updatedAt: now,
      stagements: stagementsArr,
    }
    setProjects([newProject, ...projects])
    setNewProjectName("")
    setNewProjectDescription("")
    setShowModal(false)
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen py-10 px-4">
      {/* 頁面標題 */}
      <header className="mb-10">
        <h1 className="text-2xl font-extrabold text-blue-900 tracking-tight flex items-center gap-4 drop-shadow-sm">
          <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-8 py-4 shadow border border-blue-200">
            專案管理
          </span>
        </h1>
        <div className="h-1 w-24 bg-blue-300 rounded mt-4" />
      </header>
      <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto bg-white rounded-2xl shadow-sm p-10 border border-blue-100">
        {/* 專案列表 */}
        <aside className="w-full md:w-[500px] flex-shrink-0">
          <section className="bg-white rounded-2xl shadow-md p-8 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-blue-800 tracking-wide">專案列表</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="搜尋專案..."
                  className="border border-blue-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition text-base"
                  text="新增專案"
                >
                  新增專案
                </button>
              </div>
            </div>
            <div className="grid gap-4">
              {filteredProjects.length === 0 && (
                <p className="text-gray-400 text-center py-8">找不到符合的專案</p>
              )}
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>
          </section>
        </aside>
        {/* 階段與任務設定 */}
        <main className="flex-1 w-full max-w-3xl">
          <section className=" min-h-[420px]">
            {selectedProject ? (
              <StagementEditor
                project={selectedProject}
                onUpdate={updatedProject => {
                  setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
                }}
              />
            ) : (
              <div className="text-gray-400 text-center mt-24 text-lg">
                請選擇一個專案進行階段與任務設定
              </div>
            )}
          </section>
        </main>
      </div>
      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-lg mx-auto border border-blue-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-700">新增專案</h2>
          </div>
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">專案名稱</label>
              <input
                type="text"
                placeholder="請輸入專案名稱"
                className="w-full border border-blue-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 px-4 py-2 rounded-lg outline-none transition"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">專案描述</label>
              <textarea
                placeholder="請輸入專案描述"
                className="w-full border border-blue-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 px-4 py-2 rounded-lg outline-none transition resize-none"
                rows="3"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">專案階段數量</label>
              <input
                type="number"
                min={1}
                placeholder="請輸入階段數量"
                className="w-full border border-blue-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 px-4 py-2 rounded-lg outline-none transition"
                value={newStagements}
                onChange={(e) => setNewStagements(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleAddProject}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                儲存專案
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}

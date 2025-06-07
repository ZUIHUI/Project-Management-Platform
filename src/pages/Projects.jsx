// import { useEffect, useState } from "react"
// import { getProjects } from "../services/projects"

// export default function Projects() {
//   const [projects, setProjects] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")
//   const [search, setSearch] = useState("")

//   useEffect(() => {
//     getProjects()
//       .then((data) => setProjects(data))
//       .catch((err) => {
//         console.error("載入專案失敗：", err)
//         setError("無法取得專案列表")
//       })
//       .finally(() => setLoading(false))
//   }, [])

//   return (
//     <div className="p-4" style={{ maxWidth: "100%", margin: "0 auto" }}>
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-2xl font-bold">專案列表</h1>
//         <input
//           type="text"
//           placeholder="搜尋專案..."
//           className="border px-2 py-1 rounded"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {loading && <p>載入中...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       <div className="grid gap-3">
//         {projects
//           .filter((p) =>
//             p.name.toLowerCase().includes(search.toLowerCase())
//           )
//           .map((project) => (
//             <div
//               key={project.id}
//               className="p-4 border rounded bg-white shadow"
//             >
//               <h2 className="text-lg font-semibold">{project.name}</h2>
//               <p className="text-sm text-gray-600">狀態：{project.status}</p>
//             </div>
//           ))}
//       </div>
//     </div>
//   )
// }


import { useState } from "react"
import ProjectCard from "../components/ProjectCard"
import Modal from "../components/Modal"

// 模擬初始專案資料
const initialProjects = [
  {
    id: "1",
    name: "AI 專案平台",
    description: "建立完整任務追蹤系統",
    status: "進行中",
    createdAt: "2025-06-01T00:00:00.000Z",
    updatedAt: "2025-06-03T12:00:00.000Z",
  },
  {
    id: "2",
    name: "UI 設計更新",
    description: "重構元件與設計系統",
    status: "已完成",
    createdAt: "2025-05-15T00:00:00.000Z",
    updatedAt: "2025-05-20T00:00:00.000Z",
  },
]

export default function Projects() {
  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDescription, setNewProjectDescription] = useState("")
  const [newStagements, setNewStagements] = useState(1)

  const handleAddProject = () => {
    if (!newProjectName.trim()) return
    const now = new Date().toISOString()
    const newProject = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDescription || "尚未填寫描述",
      status: "進行中",
      createdAt: now,
      updatedAt: now,
      stagements: newStagements,
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
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">專案列表</h1>
        <div className="flex gap-2 px-4">
          <input
            type="text"
            placeholder="搜尋專案..."
            className="border px-2 py-1 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          </div>
          <div className="flex gap-2 px-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-2 py-1 rounded"
            text="新增專案"
          >
            新增專案
          </button>
        </div>
      </div>

      <modal open={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-xl font-semibold mb-4">新增專案</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="專案名稱"
            className="border px-2 py-1 rounded w-full"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <textarea
            placeholder="專案描述"
            className="border px-2 py-1 rounded w-full"
            rows="3"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="專案階段數量"
            className="border px-2 py-1 rounded w-full"
            value={newStagements}
            onChange={(e) => setNewStagements(Number(e.target.value))}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              取消
            </button>
            <button
              onClick={handleAddProject}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              儲存專案
            </button>
          </div>
        </div>
      </modal>

      <div className="grid gap-3">
        {filteredProjects.length === 0 && (
          <p className="text-gray-500">找不到符合的專案</p>
        )}
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />  
        ))}
      </div>
    </div>
  )
}

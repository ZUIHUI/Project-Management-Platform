
export default function ProjectCard({ project }) {
  return (
    <div className="p-4 border round bg-white shadow-sm w-full hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold">{project.name}</h2>
        <span className={`text-xs px-2 py-1 rounded ${project.status === "進行中"
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800"
          }`}>{project.status}</span>
      </div>
      <p className="text-sm text-gray-700 mb-1 ">{project.description}</p>
      <p className="text-xs text-gray-400">建立時間:{new Date(project.createdAt).toLocaleDateString()}</p>
    </div>
  );
}

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { projectService } from "../features/project";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!projectId) return;
      const response = await projectService.fetchProjectById(projectId);
      setProject(response.data?.data ?? null);
    };
    load();
  }, [projectId]);

  if (!project) return <p className="text-sm text-gray-500">載入中或查無專案。</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{project.key} - {project.name}</h1>
      <p className="text-sm text-gray-600">{project.description}</p>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">Milestones: {project.milestones?.length ?? 0}</div>
        <div className="rounded-lg border bg-white p-4">Sprints: {project.sprints?.length ?? 0}</div>
        <div className="rounded-lg border bg-white p-4">Members: {project.members?.length ?? 0}</div>
      </section>
      <div className="flex gap-3">
        <Link to={`/projects/${project.id}/issues`} className="rounded bg-blue-600 px-3 py-2 text-sm text-white">
          Issue List
        </Link>
        <Link to={`/projects/${project.id}/board`} className="rounded border px-3 py-2 text-sm">
          Board View
        </Link>
        <Link to={`/projects/${project.id}/timeline`} className="rounded border px-3 py-2 text-sm">
          Timeline
        </Link>
      </div>
    </div>
  );
}

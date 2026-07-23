import { useParams } from "react-router-dom";
import ProjectPlanningWorkspace from "../features/project/components/ProjectPlanningWorkspace";

export default function SprintManagement() {
  const { projectId = "" } = useParams();
  return <ProjectPlanningWorkspace projectId={projectId} kind="sprint" />;
}

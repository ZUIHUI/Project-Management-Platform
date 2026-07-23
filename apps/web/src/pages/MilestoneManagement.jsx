import { useParams } from "react-router-dom";
import ProjectPlanningWorkspace from "../features/project/components/ProjectPlanningWorkspace";

export default function MilestoneManagement() {
  const { projectId = "" } = useParams();
  return <ProjectPlanningWorkspace projectId={projectId} kind="milestone" />;
}

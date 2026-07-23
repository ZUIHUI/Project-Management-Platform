import { CalendarDays, Columns3, GanttChartSquare, List } from "lucide-react";

export const projectViewOptions = [
  { value: "board", label: "看板", icon: Columns3 },
  { value: "list", label: "清單", icon: List },
  { value: "calendar", label: "行事曆", icon: CalendarDays },
  { value: "timeline", label: "時間軸", icon: GanttChartSquare },
];

export const projectViewPanelId = "project-workspace-panel";

export const projectViewTabId = (view) => `project-tab-${view}`;

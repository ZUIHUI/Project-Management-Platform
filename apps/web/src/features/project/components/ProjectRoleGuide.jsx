import { ShieldCheck } from "lucide-react";
import { Card, CardHeader } from "../../../components/ui";
import { PROJECT_ROLES } from "./teamRoles";

export default function ProjectRoleGuide() {
  return (
    <Card className="overflow-hidden">
      <CardHeader title="角色說明" description="權限由檢視、協作到管理逐級增加。" />
      <div className="grid divide-y divide-line-soft md:grid-cols-3 md:divide-x md:divide-y-0">
        {PROJECT_ROLES.map((role) => (
          <div key={role.value} className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand" aria-hidden="true" />
              <h3 className="font-semibold text-ink">{role.label}</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-body">{role.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

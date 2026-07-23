import { ShieldCheck } from "lucide-react";
import { Badge, Card } from "../../../components/ui";
import { getPlatformRoleDescription, getPlatformRoleLabel } from "../../../shared/productPresentation.js";

export default function RoleSummaryCard({ role }) {
  return (
    <Card className="h-fit p-5 sm:p-6 xl:sticky xl:top-6">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand-active"><ShieldCheck size={20} aria-hidden="true" /></span>
      <h2 className="mt-5 text-lg font-semibold text-ink">目前平台角色</h2>
      <div className="mt-3"><Badge tone="brand">{getPlatformRoleLabel(role)}</Badge></div>
      <p className="mt-4 text-sm leading-6 text-body">{getPlatformRoleDescription(role)}</p>
      <div className="mt-6 border-t border-line-soft pt-5">
        <h3 className="text-sm font-semibold text-ink">權限如何組合</h3>
        <p className="mt-2 text-xs leading-5 text-muted">平台角色決定可使用的功能；專案成員角色則決定你在各專案內可以查看、協作或管理的範圍。</p>
      </div>
    </Card>
  );
}

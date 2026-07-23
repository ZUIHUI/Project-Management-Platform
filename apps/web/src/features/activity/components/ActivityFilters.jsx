import { RotateCcw } from "lucide-react";
import { Button, Card, CardHeader, FormField } from "../../../components/ui";
import { inputClass } from "../../../components/ui/styles";
import { activityActionLabels } from "../activityPresentation";

export default function ActivityFilters({ actionTypes, actors, filterAction, filterActor, sortOrder, filtersActive, disabled, onActionChange, onActorChange, onSortChange, onReset }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="篩選活動"
        description="縮小到特定操作或參與者，排序只影響目前清單。"
        action={filtersActive ? <Button variant="ghost" size="sm" onClick={onReset}><RotateCcw size={16} aria-hidden="true" />重設</Button> : null}
      />
      <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
        <FormField label="操作類型" htmlFor="activity-action-filter">
          <select id="activity-action-filter" className={`${inputClass} min-h-11 py-0 text-sm`} value={filterAction} onChange={(event) => onActionChange(event.target.value)} disabled={disabled}>
            <option value="all">全部操作</option>
            {actionTypes.map((action) => <option key={action} value={action}>{activityActionLabels[action] ?? action}</option>)}
          </select>
        </FormField>
        <FormField label="參與者" htmlFor="activity-actor-filter">
          <select id="activity-actor-filter" className={`${inputClass} min-h-11 py-0 text-sm`} value={filterActor} onChange={(event) => onActorChange(event.target.value)} disabled={disabled}>
            <option value="all">全部參與者</option>
            {actors.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.label}{actor.detail ? ` · ${actor.detail}` : ""}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="排序" htmlFor="activity-sort-order">
          <select id="activity-sort-order" className={`${inputClass} min-h-11 py-0 text-sm`} value={sortOrder} onChange={(event) => onSortChange(event.target.value)} disabled={disabled}>
            <option value="desc">最新在上</option>
            <option value="asc">最舊在上</option>
          </select>
        </FormField>
      </div>
    </Card>
  );
}

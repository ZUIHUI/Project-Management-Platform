import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import Modal from "./Modal";
import { Alert, Button, Card, CardHeader, EmptyState, FormField, PageHeader, StatCard } from "./ui";
import { cn, inputClass } from "./ui/styles";

const COLORS = ["#cf202f", "#f59e0b", "#84cc16", "#05b169", "#14b8a6", "#0ea5e9", "#0052ff", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#64748b"];
const emptyForm = { name: "", color: "#0052ff" };

const textColorFor = (hexColor = "#dee1e6") => {
  const hex = hexColor.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return "var(--color-ink)";
  const channels = [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance > 0.179 ? "var(--color-ink)" : "var(--color-canvas)";
};

function TagChip({ tag, onEdit, onDelete }) {
  return (
    <div className="inline-flex min-h-11 items-center gap-2 rounded-pill px-4 font-semibold" style={{ backgroundColor: tag.color || "#dee1e6", color: textColorFor(tag.color) }}>
      <span>{tag.name}</span>
      {onEdit ? <button type="button" aria-label={`編輯 ${tag.name}`} title={`編輯 ${tag.name}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" onClick={() => onEdit(tag)}><Pencil size={14} aria-hidden="true" /></button> : null}
      {onDelete ? <button type="button" aria-label={`刪除 ${tag.name}`} title={`刪除 ${tag.name}`} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" onClick={() => onDelete(tag)}><Trash2 size={14} aria-hidden="true" /></button> : null}
    </div>
  );
}

export default function TagsManagement({ organizationId, tags = [], onSave, onDelete } = {}) {
  const { organizationId: paramOrgId } = useParams();
  const effectiveOrgId = organizationId || paramOrgId || "org-default";
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [tagFilter, setTagFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const canEdit = Boolean(onSave);
  const canDelete = Boolean(onDelete);

  const filteredTags = useMemo(() => {
    const query = tagFilter.trim().toLowerCase();
    return query ? tags.filter((tag) => tag.name.toLowerCase().includes(query)) : tags;
  }, [tagFilter, tags]);

  const openForm = (tag = null) => {
    if (!canEdit) return;
    setEditingTag(tag);
    setFormData(tag ? { name: tag.name, color: tag.color || "#0052ff" } : emptyForm);
    setShowModal(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !onSave) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await onSave({ id: editingTag?.id, organizationId: effectiveOrgId, name: formData.name.trim(), color: formData.color });
      setShowModal(false);
      setNotice(editingTag ? "標籤已更新。" : "標籤已建立。");
    } catch (saveError) {
      setError(saveError?.message || "標籤儲存失敗。");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !onDelete) return;
    setSaving(true);
    setError("");
    try {
      await onDelete(pendingDelete.id);
      setPendingDelete(null);
      setNotice("標籤已刪除。");
    } catch (deleteError) {
      setError(deleteError?.message || "標籤刪除失敗。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="分類治理" title="標籤管理" description="以少量、一致的標籤協助團隊分類與搜尋工作。" actions={canEdit ? <Button onClick={() => openForm()}><Plus size={18} aria-hidden="true" />新增標籤</Button> : null} />
      {!canEdit && !canDelete ? <Alert tone="info" title="目前為瀏覽模式">專案尚未提供標籤寫入 API，因此隱藏無法持久化的新增、編輯與刪除操作。</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {tags.length ? <div className="grid gap-4 sm:grid-cols-3"><StatCard label="標籤總數" value={tags.length} helper="目前組織中的分類" icon={Tags} /><StatCard label="使用中" value={tags.filter((tag) => (tag.taskCount || 0) > 0).length} helper="至少關聯一筆工作" icon={Tags} /><StatCard label="關聯次數" value={tags.reduce((sum, tag) => sum + (tag.taskCount || 0), 0)} helper="所有標籤使用總和" icon={Tags} /></div> : null}

      <Card>
        <CardHeader title="所有標籤" description={tags.length ? `${filteredTags.length} / ${tags.length} 個標籤` : "目前沒有可顯示的標籤"} />
        {tags.length ? <div className="border-b border-line-soft p-5 sm:p-6"><FormField label="搜尋標籤" htmlFor="tag-search"><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" /><input id="tag-search" type="search" className={cn(inputClass, "pl-11")} value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} placeholder="輸入標籤名稱" /></div></FormField></div> : null}
        {filteredTags.length ? <div className="flex flex-wrap gap-3 p-5 sm:p-6">{filteredTags.map((tag) => <TagChip key={tag.id} tag={tag} onEdit={canEdit ? openForm : undefined} onDelete={canDelete ? setPendingDelete : undefined} />)}</div> : <EmptyState icon={tagFilter ? Search : Tags} title={tagFilter ? "找不到符合的標籤" : "尚未建立標籤"} description={tagFilter ? "調整搜尋關鍵字後再試一次。" : canEdit ? "建立第一個標籤，開始整理團隊工作。" : "標籤資料接通後會顯示在這裡。"} action={canEdit && !tagFilter ? <Button onClick={() => openForm()}>新增標籤</Button> : null} />}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTag ? "編輯標籤" : "新增標籤"}>
        <form className="space-y-5" onSubmit={handleSave}><FormField label="標籤名稱" htmlFor="tag-name" required hint={`${formData.name.length} / 30`}><input id="tag-name" className={inputClass} value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} placeholder="例如：Bug、Feature" maxLength={30} required autoFocus /></FormField><fieldset><legend className="mb-3 text-sm font-semibold text-ink">顏色</legend><div className="grid grid-cols-6 gap-3">{COLORS.map((color) => <button key={color} type="button" aria-label={`選擇顏色 ${color}`} aria-pressed={formData.color === color} className={cn("h-11 w-11 rounded-full border-2 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2", formData.color === color ? "border-ink" : "border-transparent")} style={{ backgroundColor: color }} onClick={() => setFormData((current) => ({ ...current, color }))} />)}</div></fieldset><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">預覽</p><TagChip tag={formData} /></div><div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => setShowModal(false)}>取消</Button><Button type="submit" disabled={saving || !formData.name.trim()}>{saving ? "儲存中…" : editingTag ? "儲存變更" : "建立標籤"}</Button></div></form>
      </Modal>

      <Modal isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} title="刪除標籤" description={`確定要刪除「${pendingDelete?.name || ""}」嗎？這可能影響既有工作分類。`}><div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => setPendingDelete(null)}>取消</Button><Button variant="danger" onClick={confirmDelete} disabled={saving}>{saving ? "刪除中…" : "確認刪除"}</Button></div></Modal>
    </div>
  );
}

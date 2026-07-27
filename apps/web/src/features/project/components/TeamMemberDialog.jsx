import { useEffect, useRef, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import Modal from "../../../components/Modal";
import { Alert, Button, FormField, MutationForm } from "../../../components/ui";
import { inputClass } from "../../../components/ui/styles";
import { PROJECT_ROLES } from "./teamRoles";

const emptyDraft = { userId: "", role: "member" };

export default function TeamMemberDialog({
  isOpen,
  projectName,
  onClose,
  onAdd,
  saving,
  error,
  errorField,
  onClearError,
  candidates = [],
  candidateLoading = false,
  candidateError = "",
  onSearchCandidates,
  onClearCandidates,
}) {
  const [draft, setDraft] = useState(emptyDraft);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(emptyDraft);
    setSearchQuery("");
    onClearError?.();
  }, [isOpen, onClearError]);

  useEffect(() => {
    if (!isOpen || saving) return undefined;
    const timeoutId = window.setTimeout(() => {
      onSearchCandidates?.(searchQuery);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, onSearchCandidates, saving, searchQuery]);

  useEffect(() => {
    if (isOpen && errorField === "userId") searchRef.current?.focus();
  }, [errorField, isOpen]);

  const closeDialog = () => {
    if (saving) return;
    setDraft(emptyDraft);
    setSearchQuery("");
    onClearError?.();
    onClearCandidates?.();
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!draft.userId || saving) return;
    const added = await onAdd(draft.userId, draft.role);
    if (added) {
      setDraft(emptyDraft);
      setSearchQuery("");
      onClearCandidates?.();
      onClose?.();
    }
  };

  const selectCandidate = (candidate) => {
    if (errorField === "userId") onClearError?.();
    setDraft((current) => ({ ...current, userId: candidate.id }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeDialog}
      closeDisabled={saving}
      title="新增專案成員"
      description={`搜尋既有帳號，將成員加入「${projectName}」並設定專案內角色。`}
    >
      <MutationForm busy={saving} className="space-y-5" onSubmit={handleSubmit}>
        {error && !errorField ? <Alert tone="error" title="無法新增成員">{error}</Alert> : null}

        <FormField
          label="搜尋帳號"
          htmlFor="team-member-search"
          hint="輸入姓名或 Email；已加入目前專案的帳號不會出現在結果中。"
          error={errorField === "userId" ? error : ""}
          required
        >
          {({ describedBy, invalid }) => (
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                size={18}
              />
              <input
                ref={searchRef}
                id="team-member-search"
                type="search"
                className={`${inputClass} pl-11`}
                value={searchQuery}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                onChange={(event) => {
                  if (errorField === "userId") onClearError?.();
                  setSearchQuery(event.target.value);
                  setDraft((current) => ({ ...current, userId: "" }));
                }}
                placeholder="例如：王小明或 user@company.com"
                autoComplete="off"
                autoFocus
              />
            </div>
          )}
        </FormField>

        <section aria-labelledby="team-candidate-heading" aria-live="polite" aria-busy={candidateLoading}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 id="team-candidate-heading" className="text-sm font-semibold text-ink">可加入的帳號</h3>
            {candidateLoading ? <span className="text-xs text-muted">搜尋中…</span> : null}
          </div>

          {candidateError ? (
            <Alert tone="error" title="帳號搜尋失敗">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{candidateError}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={candidateLoading}
                  onClick={() => onSearchCandidates?.(searchQuery)}
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  重試
                </Button>
              </div>
            </Alert>
          ) : null}

          {!candidateError && !candidateLoading && candidates.length === 0 ? (
            <p className="rounded-control border border-dashed border-line bg-surface px-4 py-5 text-sm leading-6 text-muted">
              {searchQuery.trim() ? "找不到符合的帳號，請調整姓名或 Email。" : "目前沒有其他可加入的帳號。"}
            </p>
          ) : null}

          {!candidateError && candidates.length > 0 ? (
            <ul className="max-h-64 space-y-2 overflow-y-auto pr-1" aria-label="可加入的帳號">
              {candidates.map((candidate) => {
                const selected = draft.userId === candidate.id;
                return (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      disabled={candidateLoading}
                      className={`min-h-16 w-full rounded-control border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
                        selected
                          ? "border-brand bg-brand-soft"
                          : "border-line bg-canvas hover:border-brand-soft hover:bg-surface"
                      }`}
                      onClick={() => selectCandidate(candidate)}
                    >
                      <span className="block truncate text-sm font-semibold text-ink">{candidate.name}</span>
                      <span className="mt-1 block truncate text-xs text-muted">{candidate.email}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>

        <FormField
          label="專案角色"
          htmlFor="team-role"
          hint={PROJECT_ROLES.find((role) => role.value === draft.role)?.description}
        >
          <select
            id="team-role"
            className={inputClass}
            value={draft.role}
            onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))}
          >
            {PROJECT_ROLES.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </FormField>

        <div className="flex flex-col-reverse gap-2 border-t border-line-soft pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={closeDialog}>取消</Button>
          <Button type="submit" disabled={!draft.userId}>
            {saving ? "加入中…" : "加入專案"}
          </Button>
        </div>
      </MutationForm>
    </Modal>
  );
}

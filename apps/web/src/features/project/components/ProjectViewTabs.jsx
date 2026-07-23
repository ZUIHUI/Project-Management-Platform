import { useRef } from "react";
import { cn } from "../../../components/ui/styles";
import { projectViewOptions, projectViewPanelId, projectViewTabId } from "./projectViewConfig";

export default function ProjectViewTabs({ value, onChange }) {
  const tabRefs = useRef([]);

  const activateTab = (index) => {
    const option = projectViewOptions[index];
    if (!option) return;
    onChange(option.value);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event, index) => {
    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % projectViewOptions.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + projectViewOptions.length) % projectViewOptions.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = projectViewOptions.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    activateTab(nextIndex);
  };

  return (
    <div
      className="flex w-full overflow-x-auto rounded-pill bg-surface-strong p-1 sm:w-fit"
      role="tablist"
      aria-label="專案檢視模式"
      aria-orientation="horizontal"
    >
      {projectViewOptions.map((item, index) => {
        const Icon = item.icon;
        const selected = value === item.value;
        return (
          <button
            key={item.value}
            ref={(element) => { tabRefs.current[index] = element; }}
            id={projectViewTabId(item.value)}
            type="button"
            role="tab"
            tabIndex={selected ? 0 : -1}
            aria-selected={selected}
            aria-controls={projectViewPanelId}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "inline-flex min-h-11 flex-1 shrink-0 items-center justify-center gap-2 rounded-pill px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:flex-none",
              selected ? "bg-canvas text-ink shadow-soft" : "text-body hover:text-ink",
            )}
          >
            <Icon size={17} aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

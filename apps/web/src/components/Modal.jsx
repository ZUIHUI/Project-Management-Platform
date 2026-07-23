import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { IconButton } from "./ui";

export default function Modal({
  isOpen,
  onClose,
  title = "對話框",
  description,
  children,
  maxWidth = "max-w-xl",
  closeDisabled = false,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  const requestClose = () => {
    if (!closeDisabled) onClose?.();
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={closeDisabled || undefined}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) requestClose();
      }}
      className={`m-auto max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] ${maxWidth} overflow-hidden rounded-card border border-line bg-canvas p-0 text-left text-ink shadow-soft`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4 sm:px-6">
        <div>
          <h2 id={titleId} className="text-lg font-semibold text-ink">{title}</h2>
          {description ? <p id={descriptionId} className="mt-1 text-sm text-body">{description}</p> : null}
        </div>
        <IconButton
          label={closeDisabled ? "處理中，暫時無法關閉對話框" : "關閉對話框"}
          className="-mr-2 -mt-2"
          disabled={closeDisabled}
          onClick={requestClose}
        >
          <X size={20} aria-hidden="true" />
        </IconButton>
      </div>
      <div className="max-h-[calc(100vh-7rem)] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
    </dialog>
  );
}

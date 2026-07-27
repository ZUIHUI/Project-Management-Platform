import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { IconButton } from "../../../components/ui";
import { cn, inputClass } from "../../../components/ui/styles";

const PasswordInput = forwardRef(function PasswordInput(
  { className, disabled = false, id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const visibilityLabel = visible ? "隱藏密碼" : "顯示密碼";

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type={visible ? "text" : "password"}
        className={cn(inputClass, "pr-14", className)}
        disabled={disabled}
        {...props}
      />
      <IconButton
        label={visibilityLabel}
        aria-controls={id}
        aria-pressed={visible}
        className="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted hover:bg-transparent hover:text-ink"
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </IconButton>
    </div>
  );
});

export default PasswordInput;

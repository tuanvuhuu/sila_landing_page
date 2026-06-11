"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ButtonHTMLAttributes,
} from "react";

/* ───────────────────────── Button ───────────────────────── */

type BtnVariant = "default" | "primary" | "del" | "add";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
}

const variantClass: Record<BtnVariant, string> = {
  default: "abtn",
  primary: "abtn abtn-primary",
  del: "abtn abtn-del",
  add: "abtn abtn-add",
};

export function Btn({ variant = "default", className = "", children, ...rest }: BtnProps) {
  return (
    <button className={`${variantClass[variant]} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}

/** Shortcut delete button */
export function BtnDel({ children, ...rest }: Omit<BtnProps, "variant">) {
  return (
    <Btn variant="del" {...rest}>
      🗑 {children ?? "Xóa"}
    </Btn>
  );
}

/** Shortcut add button */
export function BtnAdd({ children, ...rest }: Omit<BtnProps, "variant">) {
  return (
    <Btn variant="add" {...rest}>
      ＋ {children ?? "Thêm mới"}
    </Btn>
  );
}

/* ───────────────────────── Field wrapper ───────────────────────── */

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Field({ label, hint, children, style, className = "" }: FieldProps) {
  return (
    <div className={`afield ${className}`} style={style}>
      <label>{label}</label>
      {children}
      {hint && <small style={{ color: "#6b6480", fontSize: "0.8rem" }}>{hint}</small>}
    </div>
  );
}

/* ───────────────────────── TextInput ───────────────────────── */

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
  fieldStyle?: React.CSSProperties;
  fieldClassName?: string;
}

export function TextInput({ label, hint, fieldStyle, fieldClassName, ...rest }: TextInputProps) {
  return (
    <Field label={label} hint={hint} style={fieldStyle} className={fieldClassName}>
      <input type="text" {...rest} />
    </Field>
  );
}

/* ───────────────────────── TextArea ───────────────────────── */

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  fieldStyle?: React.CSSProperties;
}

export function TextArea({ label, hint, fieldStyle, ...rest }: TextAreaProps) {
  return (
    <Field label={label} hint={hint} style={fieldStyle}>
      <textarea {...rest} />
    </Field>
  );
}

/* ───────────────────────── SelectInput ───────────────────────── */

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectInputProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string;
  options: SelectOption[];
  hint?: string;
  fieldStyle?: React.CSSProperties;
}

export function SelectInput({ label, options, hint, fieldStyle, ...rest }: SelectInputProps) {
  return (
    <Field label={label} hint={hint} style={fieldStyle}>
      <select {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/* ───────────────────────── DateInput ───────────────────────── */

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  hint?: string;
  fieldStyle?: React.CSSProperties;
}

export function DateInput({ label, hint, fieldStyle, ...rest }: DateInputProps) {
  return (
    <Field label={label} hint={hint} style={fieldStyle}>
      <input type="date" {...rest} />
    </Field>
  );
}

/* ───────────────────────── FileUpload ───────────────────────── */

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  preview?: string;          // URL of current file for preview
  onFile: (files: FileList) => void;
  onRemove?: () => void;     // callback to remove current file
  disabled?: boolean;
  hint?: string;
  fieldStyle?: React.CSSProperties;
}

export function FileUpload({
  label,
  accept = "image/*",
  multiple = false,
  preview,
  onFile,
  onRemove,
  disabled,
  hint,
  fieldStyle,
}: FileUploadProps) {
  return (
    <Field label={label} hint={hint} style={fieldStyle}>
      <div className="thumbs">
        {preview && <img className="thumb" src={preview} alt="preview" />}
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files?.length) onFile(e.target.files);
            e.target.value = "";
          }}
        />
        {preview && onRemove && (
          <BtnDel onClick={onRemove}>Xóa</BtnDel>
        )}
      </div>
    </Field>
  );
}

/* ───────────────────────── Toast ───────────────────────── */

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setItems((prev) => [...prev, { id, message, type }]);
  }, []);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {items.map((t) => (
          <ToastBubble key={t.id} item={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastBubble({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const icon = item.type === "success" ? "✓" : item.type === "error" ? "✕" : "ℹ";
  const bg = item.type === "success" ? "#5F8F2E" : item.type === "error" ? "#dc3545" : "#6b6480";

  return (
    <div className="toast-bubble" style={{ background: bg }} onClick={onDone}>
      <span className="toast-icon">{icon}</span>
      <span>{item.message}</span>
    </div>
  );
}

"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FiChevronDown } from "react-icons/fi";

type SelectOption = {
  value?: string;
  disabled?: boolean;
  children?: ReactNode;
};

export function CustomSelect({
  children,
  value,
  onChange,
  className = "",
  "aria-label": ariaLabel,
  disabled = false,
  required = false,
  id,
  placement = "bottom",
}: {
  children: ReactNode;
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  placement?: "top" | "bottom";
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedValue = String(value);
  const listboxId = `${id ?? ariaLabel ?? "select"}-listbox`;
  const options = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<SelectOption>(child)) return [];
    const optionValue = child.props.value ?? String(child.props.children ?? "");
    return [
      {
        value: optionValue,
        label: child.props.children,
        disabled: child.props.disabled ?? false,
      },
    ];
  });
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  function chooseOption(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
  }

  return (
    <div className="relative min-w-0" ref={containerRef}>
      <button
        id={id}
        type="button"
        className={`border-line text-ink focus-visible:ring-forest/30 hover:border-forest flex min-h-9 w-full min-w-0 items-center justify-between gap-2 rounded-xl border bg-white px-3 text-left text-xs shadow-sm transition outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (
            event.key === "ArrowDown" ||
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label ?? selectedValue}
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={`text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={listboxId}
          className={`border-line bg-panel absolute left-0 z-[90] max-h-64 w-full overflow-y-auto rounded-xl border p-1.5 shadow-xl ${placement === "top" ? "bottom-[calc(100%+0.35rem)]" : "top-[calc(100%+0.35rem)]"}`}
          role="listbox"
          aria-label={ariaLabel}
          aria-activedescendant={
            selectedOption
              ? `${id ?? ariaLabel}-option-${selectedOption.value}`
              : undefined
          }
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            }
          }}
        >
          {options.map((option) => (
            <button
              id={`${id ?? ariaLabel}-option-${option.value}`}
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === selectedValue}
              disabled={option.disabled}
              className={`text-ink hover:bg-paper focus-visible:bg-paper w-full truncate rounded-lg px-3 py-2.5 text-left text-xs transition focus-visible:outline-none disabled:opacity-50 ${option.value === selectedValue ? "bg-leaf/30 font-semibold" : ""}`}
              onClick={() => chooseOption(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

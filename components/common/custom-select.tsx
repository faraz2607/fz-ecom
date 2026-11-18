"use client";

import { useState, type SelectHTMLAttributes } from "react";
import { FiChevronDown } from "react-icons/fi";

export function CustomSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative block">
      <select
        {...props}
        className={`${props.className ?? ""} appearance-none pr-9`}
        onFocus={(event) => {
          setOpen(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setOpen(false);
          props.onBlur?.(event);
        }}
      />
      <FiChevronDown
        aria-hidden="true"
        className={`text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </span>
  );
}

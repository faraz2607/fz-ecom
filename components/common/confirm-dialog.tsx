"use client";

import { FiAlertTriangle } from "react-icons/fi";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-ink/55 fixed inset-0 z-[80] grid place-items-center p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="bg-panel w-full max-w-sm rounded-2xl p-5 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
        <FiAlertTriangle className="text-forest mb-3 text-xl" aria-hidden="true" />
        <h2 id="confirm-dialog-title" className="text-base font-semibold">{title}</h2>
        <p id="confirm-dialog-description" className="text-muted mt-2 text-sm leading-6">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="border-line text-ink rounded-full border px-4 py-2 text-xs font-semibold" onClick={onCancel}>Cancel</button>
          <button type="button" className="rounded-full bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

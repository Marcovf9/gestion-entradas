import React, { useEffect } from "react";

/** Diálogo de confirmación (reemplaza a window.confirm, con mejor aspecto y accesible). */
export default function ConfirmDialog({
  title,
  children,
  confirmLabel = "Confirmar",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-titulo">
        <div className="modal__head">
          <h2 className="modal__title" id="confirm-titulo">
            {title}
          </h2>
        </div>
        <div className="confirm__body">{children}</div>
        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className={`btn ${danger ? "btn--primary" : "btn--whatsapp"}`}
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {busy ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import api from "../../services/api.js";
import { mensajeDeError } from "../../utils/format.js";

export default function CuentaTab({ requiereCambio, onPasswordCambiada }) {
  const [form, setForm] = useState({ passwordActual: "", passwordNueva: "", repetir: "" });
  const [estado, setEstado] = useState({ tipo: "", mensaje: "" });
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    if (form.passwordNueva.length < 8) {
      setEstado({ tipo: "error", mensaje: "La contraseña nueva debe tener al menos 8 caracteres." });
      return;
    }
    if (form.passwordNueva !== form.repetir) {
      setEstado({ tipo: "error", mensaje: "Las contraseñas nuevas no coinciden." });
      return;
    }
    setGuardando(true);
    setEstado({ tipo: "", mensaje: "" });
    try {
      await api.post("/auth/cambiar-password", {
        passwordActual: form.passwordActual,
        passwordNueva: form.passwordNueva,
      });
      setForm({ passwordActual: "", passwordNueva: "", repetir: "" });
      setEstado({ tipo: "ok", mensaje: "Contraseña actualizada." });
      onPasswordCambiada();
    } catch (err) {
      setEstado({ tipo: "error", mensaje: mensajeDeError(err, "No se pudo cambiar la contraseña.") });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={guardar}>
      {requiereCambio && (
        <p className="notice notice--warn">
          Tu cuenta todavía usa la contraseña inicial. Cambiala ahora por una propia.
        </p>
      )}
      <div className="form-grid">
        <label className="field">
          <span>Contraseña actual</span>
          <input
            type="password"
            autoComplete="current-password"
            value={form.passwordActual}
            onChange={(e) => setForm({ ...form, passwordActual: e.target.value })}
            required
          />
        </label>
        <label className="field">
          <span>Contraseña nueva</span>
          <input
            type="password"
            autoComplete="new-password"
            value={form.passwordNueva}
            onChange={(e) => setForm({ ...form, passwordNueva: e.target.value })}
            required
          />
          <small className="field__hint">Mínimo 8 caracteres.</small>
        </label>
        <label className="field">
          <span>Repetir contraseña nueva</span>
          <input
            type="password"
            autoComplete="new-password"
            value={form.repetir}
            onChange={(e) => setForm({ ...form, repetir: e.target.value })}
            required
          />
        </label>
      </div>

      {estado.mensaje && (
        <p className={`notice ${estado.tipo === "ok" ? "notice--ok" : "notice--error"}`} role="status">
          {estado.mensaje}
        </p>
      )}

      <button type="submit" className="btn btn--primary" disabled={guardando}>
        {guardando ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}

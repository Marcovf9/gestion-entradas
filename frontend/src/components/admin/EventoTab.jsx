import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { formatHora, mensajeDeError } from "../../utils/format.js";

export default function EventoTab({ evento, onCambio }) {
  const [form, setForm] = useState({ nombre: "", fecha: "", hora: "", lugar: "" });
  const [estado, setEstado] = useState({ tipo: "", mensaje: "" });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setForm({
      nombre: evento.nombre ?? "",
      fecha: evento.fecha ?? "",
      hora: formatHora(evento.hora),
      lugar: evento.lugar ?? "",
    });
  }, [evento]);

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setEstado({ tipo: "", mensaje: "" });
    try {
      await api.put(`/admin/eventos/${evento.id}`, {
        nombre: form.nombre.trim(),
        fecha: form.fecha,
        hora: form.hora || null,
        lugar: form.lugar.trim() || null,
        activo: true,
      });
      setEstado({ tipo: "ok", mensaje: "Datos del evento guardados." });
      await onCambio();
    } catch (err) {
      setEstado({ tipo: "error", mensaje: mensajeDeError(err, "No se pudieron guardar los datos.") });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={guardar}>
      <p className="admin-help">Estos datos se muestran en el sitio público y en los mensajes de reserva.</p>
      <div className="form-grid">
        <label className="field">
          <span>Nombre del show</span>
          <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </label>
        <div className="form-row">
          <label className="field">
            <span>Fecha</span>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
          </label>
          <label className="field">
            <span>Hora</span>
            <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
          </label>
        </div>
        <label className="field">
          <span>Lugar</span>
          <input value={form.lugar} onChange={(e) => setForm({ ...form, lugar: e.target.value })} />
        </label>
      </div>

      {estado.mensaje && (
        <p className={`notice ${estado.tipo === "ok" ? "notice--ok" : "notice--error"}`} role="status">
          {estado.mensaje}
        </p>
      )}

      <button type="submit" className="btn btn--primary" disabled={guardando}>
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

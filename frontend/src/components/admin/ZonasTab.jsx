import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import { mensajeDeError } from "../../utils/format.js";

function FilaZona({ zona, eventoId, onGuardado }) {
  const [form, setForm] = useState({ nombre: zona.nombre, precio: zona.precio, color: zona.color });
  const [estado, setEstado] = useState(""); // "" | "guardando" | "ok" | mensaje de error

  useEffect(() => {
    setForm({ nombre: zona.nombre, precio: zona.precio, color: zona.color });
  }, [zona]);

  const sinCambios = form.nombre === zona.nombre && Number(form.precio) === zona.precio && form.color === zona.color;

  const guardar = async () => {
    setEstado("guardando");
    try {
      await api.put(`/admin/zonas/${zona.id}`, {
        eventoId,
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        color: form.color,
        displayOrder: zona.displayOrder,
      });
      setEstado("ok");
      await onGuardado();
    } catch (err) {
      setEstado(mensajeDeError(err, "No se pudo guardar."));
    }
  };

  const noSeVende = zona.precio === 0;

  return (
    <li className="zona-row">
      <label className="field zona-row__nombre">
        <span>Categoría</span>
        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
      </label>
      <label className="field zona-row__precio">
        <span>Precio ($)</span>
        <input
          type="number"
          min="0"
          step="500"
          value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
          disabled={noSeVende}
        />
      </label>
      <label className="field zona-row__color">
        <span>Color</span>
        <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
      </label>
      <div className="zona-row__actions">
        <button type="button" className="btn btn--primary btn--sm" onClick={guardar} disabled={sinCambios || estado === "guardando"}>
          {estado === "guardando" ? "Guardando…" : "Guardar"}
        </button>
        {estado === "ok" && sinCambios && <small className="zona-row__ok">Guardado ✓</small>}
        {estado && estado !== "ok" && estado !== "guardando" && <small className="field__error">{estado}</small>}
      </div>
      {noSeVende && <p className="field__hint zona-row__nota">Estas butacas no se venden (no figuran como disponibles en el sitio).</p>}
    </li>
  );
}

export default function ZonasTab({ evento, zonas, onCambio }) {
  const ordenadas = [...zonas].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div>
      <p className="admin-help">
        Editá el nombre, el precio y el color de cada categoría de butacas. El precio nuevo rige para las reservas que
        se hagan a partir de ahora; también se refleja en los totales de este panel.
      </p>
      <ul className="zona-list">
        {ordenadas.map((z) => (
          <FilaZona key={z.id} zona={z} eventoId={evento.id} onGuardado={onCambio} />
        ))}
      </ul>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import api from "../../services/api.js";
import { HOLD_MINUTES } from "../../config.js";
import { formatPrice, mensajeDeError } from "../../utils/format.js";

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function validar({ nombre, dni, email }) {
  const errores = {};
  if (!nombre.trim()) errores.nombre = "Ingresá tu nombre y apellido.";
  if (!dni.trim()) errores.dni = "Ingresá tu DNI.";
  else if (!/^[0-9.\sA-Za-z-]{6,20}$/.test(dni.trim())) errores.dni = "Revisá el DNI: debería tener entre 6 y 20 caracteres.";
  if (!email.trim()) errores.email = "Ingresá tu email.";
  else if (!EMAIL_RE.test(email.trim())) errores.email = "El email no tiene un formato válido.";
  return errores;
}

export default function BookingModal({ seats, total, onClose, onReserved, onConflict }) {
  const [form, setForm] = useState({ nombre: "", dni: "", email: "" });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const primerCampo = useRef(null);

  useEffect(() => {
    primerCampo.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape" && !enviando) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, enviando]);

  const cambiar = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const nuevos = validar(form);
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setEnviando(true);
    setError("");
    try {
      const res = await api.post("/reservas", {
        seatIds: seats.map((s) => s.id),
        nombre: form.nombre.trim(),
        dni: form.dni.trim(),
        email: form.email.trim(),
      });
      onReserved({
        seats: res.data.seats,
        segundosRestantes: res.data.segundosRestantes,
        cliente: { nombre: form.nombre.trim(), dni: form.dni.trim(), email: form.email.trim() },
      });
    } catch (err) {
      if (err.response?.status === 409) {
        onConflict(err.response.data.conflictSeatIds ?? [], mensajeDeError(err));
      } else if (err.response?.status === 429) {
        setError("Hiciste demasiados intentos seguidos. Esperá un minuto y probá de nuevo.");
      } else {
        setError(mensajeDeError(err, "No pudimos registrar la reserva. Probá de nuevo en un momento."));
      }
      setEnviando(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !enviando) onClose();
      }}
    >
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="reserva-titulo" onSubmit={enviar} noValidate>
        <div className="modal__head">
          <h2 className="modal__title" id="reserva-titulo">
            Tus datos para la reserva
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} disabled={enviando} aria-label="Cerrar">
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <div className="booking-recap">
          <span>
            {seats.length} {seats.length === 1 ? "butaca" : "butacas"}:{" "}
            {seats.map((s) => `F${s.fila}·${s.columna}`).join("  ")}
          </span>
          <strong>{formatPrice(total)}</strong>
        </div>

        <div className="form-grid">
          <label className={`field ${errores.nombre ? "field--error" : ""}`}>
            <span>Nombre y apellido</span>
            <input
              ref={primerCampo}
              type="text"
              autoComplete="name"
              value={form.nombre}
              onChange={cambiar("nombre")}
              maxLength={120}
              placeholder="Como figura en tu DNI"
            />
            {errores.nombre && <small className="field__error">{errores.nombre}</small>}
          </label>

          <label className={`field ${errores.dni ? "field--error" : ""}`}>
            <span>DNI</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={form.dni}
              onChange={cambiar("dni")}
              maxLength={20}
              placeholder="Sin puntos"
            />
            {errores.dni && <small className="field__error">{errores.dni}</small>}
          </label>

          <label className={`field ${errores.email ? "field--error" : ""}`}>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={cambiar("email")}
              maxLength={150}
              placeholder="tucorreo@ejemplo.com"
            />
            {errores.email && <small className="field__error">{errores.email}</small>}
            <small className="field__hint">Te enviamos ahí la confirmación de tu reserva.</small>
          </label>
        </div>

        {error && (
          <p className="notice notice--error" role="alert" style={{ marginTop: 16 }}>
            {error}
          </p>
        )}

        <p className="notice notice--info" style={{ marginTop: 16 }}>
          Al reservar, tus butacas quedan guardadas {HOLD_MINUTES} minutos. En el siguiente paso te llevamos a WhatsApp
          para coordinar el pago.
        </p>

        <div className="modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={enviando}>
            Volver al plano
          </button>
          <button type="submit" className="btn btn--primary" disabled={enviando}>
            {enviando ? "Reservando…" : "Reservar butacas"}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { FaCheck, FaRegClock, FaTimes } from "react-icons/fa";
import api from "../../services/api.js";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";
import { formatPrice, mensajeDeError } from "../../utils/format.js";
import { agruparPorComprador, etiquetaButaca, idsDe } from "./agrupar.js";

function textoVence(segundos) {
  if (segundos == null) return "";
  if (segundos <= 0) return "venciendo";
  const min = Math.ceil(segundos / 60);
  return `vence en ${min} min`;
}

export default function ReservasTab({ reservas, onCambio }) {
  const grupos = useMemo(() => agruparPorComprador(reservas, { porVencimiento: true }), [reservas]);
  const [accion, setAccion] = useState(null); // { tipo: 'confirmar' | 'liberar', grupo }
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const ejecutar = async () => {
    setProcesando(true);
    setError("");
    try {
      const url = accion.tipo === "confirmar" ? "/reservas/confirmar" : "/reservas/liberar";
      await api.post(url, { seatIds: idsDe(accion.grupo) });
      setAccion(null);
      await onCambio();
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo completar la acción."));
      setAccion(null);
      await onCambio().catch(() => {});
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div>
      <p className="admin-help">
        Reservas en curso que todavía esperan el pago. Cuando recibas el comprobante, tocá{" "}
        <strong>Confirmar pago</strong> para dejar las butacas vendidas. Si vencen sin pago, se liberan solas.
      </p>

      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}

      {grupos.length === 0 ? (
        <p className="admin-empty">No hay reservas pendientes de pago en este momento.</p>
      ) : (
        <ul className="res-list">
          {grupos.map((g) => (
            <li key={g.clave} className="res-card">
              <div className="res-card__head">
                <div>
                  <h3>{g.nombre}</h3>
                  <p>
                    DNI {g.dni} · <a href={`mailto:${g.email}`}>{g.email}</a>
                  </p>
                </div>
                <span className="res-card__timer">
                  <FaRegClock aria-hidden="true" /> {textoVence(g.segundosRestantes)}
                </span>
              </div>

              <ul className="chips">
                {g.butacas.map((b) => (
                  <li key={b.id} className="chip" title={b.zonaNombre}>
                    {etiquetaButaca(b)} <small>{formatPrice(b.precio)}</small>
                  </li>
                ))}
              </ul>

              <div className="res-card__foot">
                <strong>
                  Total {formatPrice(g.total)} <small>({g.butacas.length} butacas)</small>
                </strong>
                <div className="res-card__actions">
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => setAccion({ tipo: "liberar", grupo: g })}>
                    <FaTimes aria-hidden="true" /> Liberar
                  </button>
                  <button type="button" className="btn btn--whatsapp btn--sm" onClick={() => setAccion({ tipo: "confirmar", grupo: g })}>
                    <FaCheck aria-hidden="true" /> Confirmar pago
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {accion && (
        <ConfirmDialog
          title={accion.tipo === "confirmar" ? "Confirmar pago" : "Liberar butacas"}
          confirmLabel={accion.tipo === "confirmar" ? "Sí, confirmar pago" : "Sí, liberar"}
          danger={accion.tipo === "liberar"}
          busy={procesando}
          onConfirm={ejecutar}
          onCancel={() => setAccion(null)}
        >
          {accion.tipo === "confirmar" ? (
            <p>
              ¿Confirmás que <strong>{accion.grupo.nombre}</strong> pagó{" "}
              <strong>{formatPrice(accion.grupo.total)}</strong> por {accion.grupo.butacas.length}{" "}
              {accion.grupo.butacas.length === 1 ? "butaca" : "butacas"} (
              {accion.grupo.butacas.map(etiquetaButaca).join(", ")})? Van a quedar como vendidas.
            </p>
          ) : (
            <p>
              Se van a liberar las {accion.grupo.butacas.length} butacas de <strong>{accion.grupo.nombre}</strong> (
              {accion.grupo.butacas.map(etiquetaButaca).join(", ")}) y cualquiera podrá reservarlas de nuevo.
            </p>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}

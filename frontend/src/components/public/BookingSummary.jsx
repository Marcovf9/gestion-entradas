import React from "react";
import { FaTimes, FaTicketAlt } from "react-icons/fa";
import { MAX_SEATS } from "../../config.js";
import { formatPrice } from "../../utils/format.js";

/** Panel lateral (en escritorio) con el detalle de la selección y el total. */
export default function BookingSummary({ seats, total, onRemove, onClear, onContinue }) {
  const vacio = seats.length === 0;

  return (
    <aside className={`summary ${vacio ? "summary--vacio" : ""}`} aria-live="polite">
      <h3 className="summary__title">
        <FaTicketAlt aria-hidden="true" /> Tu selección
      </h3>

      {vacio ? (
        <p className="summary__empty">Todavía no elegiste butacas. Tocá las libres en el plano para empezar.</p>
      ) : (
        <>
          <ul className="summary__list">
            {seats.map((s) => (
              <li key={s.id} className="summary__item">
                <div>
                  <strong>
                    Fila {s.fila} · Butaca {s.columna}
                  </strong>
                  <small>{s.zona?.nombre}</small>
                </div>
                <div className="summary__item-right">
                  <span>{formatPrice(s.zona?.precio ?? 0)}</span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => onRemove(s.id)}
                    aria-label={`Quitar fila ${s.fila}, butaca ${s.columna}`}
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="summary__total">
            <span>
              Total ({seats.length} {seats.length === 1 ? "butaca" : "butacas"})
            </span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </>
      )}

      <button type="button" className="btn btn--primary btn--block btn--lg" disabled={vacio} onClick={onContinue}>
        Continuar con la reserva
      </button>
      {!vacio && (
        <button type="button" className="btn btn--ghost btn--block btn--sm" onClick={onClear}>
          Vaciar selección
        </button>
      )}
      <p className="summary__note">Hasta {MAX_SEATS} butacas por reserva. El pago se coordina por WhatsApp.</p>
    </aside>
  );
}

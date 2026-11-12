import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaWhatsapp, FaRegClock, FaExclamationTriangle } from "react-icons/fa";
import { formatCuentaRegresiva, formatPrice } from "../../utils/format.js";
import { mensajeReserva, urlWhatsApp } from "../../utils/whatsapp.js";

/**
 * Pantalla posterior a reservar: el comprador todavía tiene que enviar el
 * mensaje de WhatsApp y pagar antes de que venza la reserva.
 */
export default function ReservationSuccess({ reserva, evento, estado = "pendiente", onNueva }) {
  const [restante, setRestante] = useState(() => (reserva.expiraEn - Date.now()) / 1000);

  useEffect(() => {
    const id = setInterval(() => setRestante((reserva.expiraEn - Date.now()) / 1000), 1000);
    return () => clearInterval(id);
  }, [reserva.expiraEn]);

  const vencida = restante <= 0 || estado === "liberada";
  const total = reserva.seats.reduce((acc, s) => acc + s.precio, 0);
  const mensaje = mensajeReserva({ evento, cliente: reserva.cliente, seats: reserva.seats });

  const abrirWhatsApp = () => {
    window.open(urlWhatsApp(mensaje), "_blank", "noopener");
  };

  if (estado === "confirmada") {
    return (
      <section className="success container" aria-live="polite">
        <div className="success__card">
          <FaCheckCircle className="success__icon" aria-hidden="true" />
          <h2 className="success__title">¡Pago confirmado!</h2>
          <p className="success__lead">
            Tus butacas quedaron <strong>vendidas a tu nombre</strong>. El día del show presentá tu DNI para ingresar.
            ¡Te esperamos!
          </p>

          <div className="success__detail">
            <h3>Tus entradas</h3>
            <p className="success__who">
              {reserva.cliente.nombre} · DNI {reserva.cliente.dni}
            </p>
            <ul>
              {reserva.seats.map((s) => (
                <li key={s.id}>
                  <span>
                    Fila {s.fila} · Butaca {s.columna} <small>{s.zonaNombre}</small>
                  </span>
                  <span>{formatPrice(s.precio)}</span>
                </li>
              ))}
            </ul>
            <div className="success__total">
              <span>Total pagado</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>

          <button type="button" className="btn btn--ghost" onClick={onNueva}>
            Comprar más entradas
          </button>
        </div>
      </section>
    );
  }

  if (vencida) {
    return (
      <section className="success container" aria-live="polite">
        <div className="success__card">
          <FaExclamationTriangle className="success__icon success__icon--warn" aria-hidden="true" />
          <h2 className="success__title">Tu reserva ya no está activa</h2>
          <p className="success__lead">
            Pasó el tiempo de reserva sin que se registre el pago (o la reserva fue liberada), así que las butacas
            volvieron a estar disponibles. Si todavía las querés, podés reservarlas de nuevo.
          </p>
          <button type="button" className="btn btn--primary btn--lg" onClick={onNueva}>
            Elegir butacas otra vez
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="success container" aria-live="polite">
      <div className="success__card">
        <FaCheckCircle className="success__icon" aria-hidden="true" />
        <h2 className="success__title">¡Butacas reservadas!</h2>
        <p className="success__lead">
          Falta un paso: <strong>enviá el mensaje por WhatsApp</strong> para coordinar el pago. Hasta que no se
          registre, tus butacas se guardan solo por unos minutos.
        </p>

        <div className="success__timer" role="timer">
          <FaRegClock aria-hidden="true" />
          <span>Tiempo para completar el pago</span>
          <strong>{formatCuentaRegresiva(restante)}</strong>
        </div>

        <button type="button" className="btn btn--whatsapp btn--lg btn--block" onClick={abrirWhatsApp}>
          <FaWhatsapp aria-hidden="true" /> Enviar mensaje por WhatsApp
        </button>
        <p className="success__hint">
          Se abre WhatsApp con tu reserva ya escrita. Solo tenés que tocar “Enviar”.
        </p>

        <div className="success__detail">
          <h3>Resumen de tu reserva</h3>
          <p className="success__who">
            {reserva.cliente.nombre} · DNI {reserva.cliente.dni} · {reserva.cliente.email}
          </p>
          <ul>
            {reserva.seats.map((s) => (
              <li key={s.id}>
                <span>
                  Fila {s.fila} · Butaca {s.columna} <small>{s.zonaNombre}</small>
                </span>
                <span>{formatPrice(s.precio)}</span>
              </li>
            ))}
          </ul>
          <div className="success__total">
            <span>Total a pagar</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </div>

        <button type="button" className="btn btn--ghost" onClick={onNueva}>
          Hacer otra reserva
        </button>
      </div>
    </section>
  );
}

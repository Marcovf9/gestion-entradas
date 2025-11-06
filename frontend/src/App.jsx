import React from "react";
import SeatMap from "./components/SeatMap.jsx";

export default function App() {
  return (
    <div className="page">
      <header className="header">
        <h1>Latidos de la Historia</h1>
        <p>Seleccioná tus butacas para el show de fin de año.</p>
      </header>

      <main className="layout">
        <section className="theatre-card">
          <SeatMap />
        </section>

        <aside className="summary-card">
          <h2>Resumen de Reserva</h2>
          <p className="summary-counter">
            Butacas seleccionadas: <span id="selected-count">0</span>
          </p>
          <p className="summary-total">
            Total: <span id="selected-total">$0</span>
          </p>
          <div className="summary-contact">
            <label>
              Nombre y Apellido
              <input type="text" placeholder="Tu nombre" />
            </label>
            <label>
              Email
              <input type="email" placeholder="tucorreo@ejemplo.com" />
            </label>
          </div>
          <button className="btn-primary" disabled>
            Reservar y pagar por WhatsApp
          </button>
          <p className="summary-note">
            (En este proyecto de ejemplo el botón está deshabilitado: el enfoque
            es sólo el mapa de butacas).
          </p>
        </aside>
      </main>
    </div>
  );
}

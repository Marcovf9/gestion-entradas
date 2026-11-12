import React from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowDown } from "react-icons/fa";
import { capitalizar, formatFechaLarga, formatHora, formatPrice } from "../../utils/format.js";

export default function Hero({ evento, zonas }) {
  const nombre = evento?.nombre ?? "El Deseo de Existir";
  const cuando = evento
    ? `${capitalizar(formatFechaLarga(evento.fecha))}${evento.hora ? ` · ${formatHora(evento.hora)} hs` : ""}`
    : "Fecha a confirmar";

  const precios = (zonas ?? [])
    .filter((z) => z.precio > 0)
    .sort((a, b) => b.precio - a.precio);
  const preciosUnicos = [...new Set(precios.map((z) => z.precio))];

  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__inner">
        <p className="hero__kicker">Epifanía Dance presenta</p>
        <h1 className="hero__title">{nombre}</h1>
        <p className="hero__sub">Show 2026</p>

        <ul className="hero__facts">
          <li>
            <FaCalendarAlt aria-hidden="true" />
            <span>{cuando}</span>
          </li>
          <li>
            <FaMapMarkerAlt aria-hidden="true" />
            <span>{evento?.lugar ?? "Sala Mayor · Facultad de Derecho (UNC), Córdoba"}</span>
          </li>
        </ul>

        {preciosUnicos.length > 0 && (
          <p className="hero__prices">
            Entradas desde <strong>{formatPrice(Math.min(...preciosUnicos))}</strong>
          </p>
        )}

        <div className="hero__cta">
          <a href="#butacas" className="btn btn--primary btn--lg">
            Elegir mis butacas <FaArrowDown aria-hidden="true" />
          </a>
          <a href="#como-comprar" className="btn btn--light btn--lg">
            Cómo comprar
          </a>
        </div>
      </div>
    </section>
  );
}

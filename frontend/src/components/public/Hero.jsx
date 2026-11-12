import React from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaArrowDown } from "react-icons/fa";
import { capitalizar, formatFechaLarga, formatHora, formatPrice, parseFecha } from "../../utils/format.js";
import afiche from "../../assets/afiche.webp";

/** Días que faltan para el show (null si ya pasó). */
function diasRestantes(fechaISO) {
  const f = parseFecha(fechaISO);
  if (!f) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const dias = Math.round((f - hoy) / 86400000);
  return dias >= 0 ? dias : null;
}

/** "Platea preferencial (filas 1 a 5)" -> ["Platea preferencial", "filas 1 a 5"] */
function partirNombre(nombre) {
  const m = nombre.match(/^(.*?)\s*\((.*)\)\s*$/);
  return m ? [m[1], m[2]] : [nombre, ""];
}

export default function Hero({ evento, zonas }) {
  const nombre = evento?.nombre ?? "El Deseo de Existir";
  const dias = evento ? diasRestantes(evento.fecha) : null;

  const categorias = (zonas ?? [])
    .filter((z) => z.precio > 0)
    .sort((a, b) => b.precio - a.precio);

  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true" />

      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="hero__kicker">Epifanía Dance presenta</p>
          <h1 className="hero__title">{nombre}</h1>
          <p className="hero__sub">Show 2026</p>

          {dias !== null && (
            <p className="hero__countdown">
              {dias === 0 ? "¡Es hoy!" : dias === 1 ? "¡Es mañana!" : `Faltan ${dias} días`}
            </p>
          )}

          <ul className="hero__facts">
            <li>
              <FaCalendarAlt aria-hidden="true" />
              <span>
                {evento ? capitalizar(formatFechaLarga(evento.fecha)) : "Domingo 6 de diciembre"}
                {" · "}
                {evento?.hora ? `${formatHora(evento.hora)} hs` : "19:30 hs"}
              </span>
            </li>
            <li>
              <FaMapMarkerAlt aria-hidden="true" />
              <span>{evento?.lugar ?? "Sala Mayor · Facultad de Derecho (UNC), Córdoba"}</span>
            </li>
          </ul>

          {categorias.length > 0 && (
            <ul className="hero__tiers" aria-label="Precios de las entradas">
              {categorias.map((z) => {
                const [titulo, detalle] = partirNombre(z.nombre);
                return (
                  <li key={z.id} className="tier">
                    <strong>{formatPrice(z.precio)}</strong>
                    <span>
                      {titulo}
                      {detalle && <small>{detalle}</small>}
                    </span>
                  </li>
                );
              })}
            </ul>
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

        <figure className="hero__poster">
          <img
            src={afiche}
            width="900"
            height="1350"
            alt="Afiche de El Deseo de Existir, show 2026 de Epifanía Dance: bailarines de distintos estilos alrededor de una pareja de sol y luna. Domingo 6 de diciembre, 19:30 hs."
            fetchpriority="high"
          />
        </figure>
      </div>
    </section>
  );
}

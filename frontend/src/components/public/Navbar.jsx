import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt } from "react-icons/fa";
import { capitalizar, formatFechaLarga, formatHora } from "../../utils/format.js";
import logo from "../../assets/logo-epifania.png";

/** Barra superior con los datos del show + navegación fija. */
export default function Navbar({ evento }) {
  const [conSombra, setConSombra] = useState(false);

  useEffect(() => {
    const alScrollear = () => setConSombra(window.scrollY > 6);
    alScrollear();
    window.addEventListener("scroll", alScrollear, { passive: true });
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  const cuando = evento
    ? `${capitalizar(formatFechaLarga(evento.fecha))}${evento.hora ? ` · ${formatHora(evento.hora)} hs` : ""}`
    : "Domingo 6 de diciembre · 19:30 hs";
  const lugar = evento?.lugar ?? "Sala Mayor · Facultad de Derecho (UNC), Córdoba";

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <span>
            <FaCalendarAlt aria-hidden="true" /> {cuando}
          </span>
          <span className="topbar__lugar">
            <FaMapMarkerAlt aria-hidden="true" /> {lugar}
          </span>
        </div>
      </div>

      <header className={`navbar ${conSombra ? "navbar--sombra" : ""}`}>
        <div className="container navbar__inner">
          <a href="#/" className="navbar__brand" aria-label="Epifanía Dance — inicio">
            <img src={logo} alt="Epifanía Dance" />
          </a>

          <nav className="navbar__links" aria-label="Secciones">
            <a href="#como-comprar">Cómo comprar</a>
            <a href="#butacas">Butacas</a>
            <a href="#instagram">Instagram</a>
          </nav>

          <a href="#butacas" className="btn btn--primary btn--sm navbar__cta">
            <FaTicketAlt aria-hidden="true" /> Comprar entradas
          </a>
        </div>
      </header>
    </>
  );
}

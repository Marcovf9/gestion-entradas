import React from "react";
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaCalendarAlt, FaClock } from "react-icons/fa";
import { INSTAGRAM_URL, INSTAGRAM_USER, WHATSAPP_PHONE } from "../../config.js";
import { capitalizar, formatFechaLarga, formatHora } from "../../utils/format.js";
import logo from "../../assets/logo-epifania.png";

const LUGAR_POR_DEFECTO = "Sala Mayor · Facultad de Derecho (UNC), Córdoba";

export default function Footer({ evento }) {
  const lugar = evento?.lugar ?? LUGAR_POR_DEFECTO;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    "Sala Mayor Facultad de Derecho UNC Córdoba Argentina"
  )}`;

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <img className="footer__logo" src={logo} alt="Epifanía Dance" />
          <p>Academia de danza · Córdoba, Argentina.</p>
          <a className="footer__social" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            <FaInstagram aria-hidden="true" /> @{INSTAGRAM_USER}
          </a>
        </div>

        <div className="footer__col">
          <h3>El show</h3>
          <ul>
            <li>El Deseo de Existir · 2026</li>
            <li>
              <FaCalendarAlt aria-hidden="true" />{" "}
              {evento ? capitalizar(formatFechaLarga(evento.fecha)) : "Domingo 6 de diciembre"}
            </li>
            <li>
              <FaClock aria-hidden="true" /> {evento?.hora ? `${formatHora(evento.hora)} hs` : "19:30 hs"}
            </li>
            <li>
              <FaMapMarkerAlt aria-hidden="true" /> {lugar}
            </li>
            <li>
              <a href={mapa} target="_blank" rel="noopener noreferrer">
                Cómo llegar
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__col">
          <h3>Entradas</h3>
          <ul>
            <li>
              <a href="#butacas">Elegir butacas</a>
            </li>
            <li>
              <a href="#como-comprar">Cómo comprar</a>
            </li>
            <li>
              <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp aria-hidden="true" /> Consultas por WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} Epifanía Dance. Todos los derechos reservados.</p>
          <a href="#/admin" className="footer__admin">
            Administración
          </a>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import { FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
import { WHATSAPP_PHONE } from "../../config.js";
import logo from "../../assets/logo-epifania.png";

export default function Footer({ evento }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <img className="footer__logo" src={logo} alt="Epifanía Dance" />
        <div className="footer__info">
          <p>
            <FaMapMarkerAlt aria-hidden="true" /> {evento?.lugar ?? "Sala Mayor · Facultad de Derecho (UNC), Córdoba"}
          </p>
          <p>
            <a href={`https://wa.me/${WHATSAPP_PHONE}`} target="_blank" rel="noreferrer">
              <FaWhatsapp aria-hidden="true" /> Consultas por WhatsApp
            </a>
          </p>
        </div>
        <p className="footer__legal">
          © {new Date().getFullYear()} Epifanía Dance ·{" "}
          <a href="#/admin" className="footer__admin">
            Administración
          </a>
        </p>
      </div>
    </footer>
  );
}

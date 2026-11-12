import React from "react";
import { FaTicketAlt } from "react-icons/fa";
import logo from "../../assets/logo-epifania.png";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <a href="#/" className="navbar__brand" aria-label="Epifanía Dance — inicio">
          <img src={logo} alt="Epifanía Dance" />
        </a>
        <a href="#butacas" className="btn btn--primary btn--sm">
          <FaTicketAlt aria-hidden="true" /> Comprar entradas
        </a>
      </div>
    </header>
  );
}

import React from "react";
import { FaInstagram } from "react-icons/fa";
import { INSTAGRAM_URL, INSTAGRAM_USER } from "../../config.js";

/** Invitación a seguir a Epifanía Dance en Instagram, antes del footer. */
export default function InstagramSection() {
  return (
    <section id="instagram" className="insta">
      <div className="container insta__inner">
        <div className="insta__copy">
          <p className="insta__kicker">Seguinos</p>
          <h2 className="insta__title">Viví el show antes de que empiece</h2>
          <p className="insta__text">
            Novedades del espectáculo, avisos y todo lo que se viene en Epifanía Dance, en nuestro Instagram.
          </p>
          <a className="btn btn--insta btn--lg" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            <FaInstagram aria-hidden="true" /> Seguir a @{INSTAGRAM_USER}
          </a>
        </div>

        <a className="insta__card" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={`Abrir el Instagram de Epifanía Dance (@${INSTAGRAM_USER})`}>
          <span className="insta__ring">
            <img src="/apple-touch-icon.png" alt="" width="72" height="72" />
          </span>
          <span className="insta__handle">@{INSTAGRAM_USER}</span>
          <span className="insta__name">Epifanía Dance</span>
          <span className="insta__follow">Ver perfil</span>
        </a>
      </div>
    </section>
  );
}

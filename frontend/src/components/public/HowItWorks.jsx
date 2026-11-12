import React from "react";
import { FaHandPointer, FaUser, FaWhatsapp, FaCheckCircle } from "react-icons/fa";
import { HOLD_MINUTES, MAX_SEATS } from "../../config.js";

const PASOS = [
  {
    icon: FaHandPointer,
    titulo: "Elegí tus butacas",
    texto: `Tocá las butacas libres del plano. Podés elegir hasta ${MAX_SEATS} por reserva.`,
  },
  {
    icon: FaUser,
    titulo: "Dejá tus datos",
    texto: "Nombre, DNI y email para registrar la reserva a tu nombre.",
  },
  {
    icon: FaWhatsapp,
    titulo: "Avisanos por WhatsApp",
    texto: "Se abre un mensaje ya armado con tu reserva. Enviáselo a Epifanía y te pasamos los datos de pago.",
  },
  {
    icon: FaCheckCircle,
    titulo: "Pagá y listo",
    texto: "Cuando confirmamos tu pago, tus butacas quedan vendidas a tu nombre.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-comprar" className="section section--paper">
      <div className="container">
        <h2 className="section__title">Cómo comprar tus entradas</h2>
        <ol className="steps">
          {PASOS.map(({ icon: Icono, titulo, texto }, i) => (
            <li key={titulo} className="step">
              <span className="step__num" aria-hidden="true">
                {i + 1}
              </span>
              <Icono className="step__icon" aria-hidden="true" />
              <h3 className="step__title">{titulo}</h3>
              <p className="step__text">{texto}</p>
            </li>
          ))}
        </ol>
        <p className="notice notice--warn steps__note">
          <strong>Importante:</strong> tus butacas quedan reservadas {HOLD_MINUTES} minutos. Si en ese tiempo no
          enviás el mensaje y se registra el pago, vuelven a estar disponibles para otras personas.
        </p>
      </div>
    </section>
  );
}

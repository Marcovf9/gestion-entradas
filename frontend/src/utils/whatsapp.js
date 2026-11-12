import { WHATSAPP_PHONE } from "../config.js";
import { formatFechaCorta, formatHora, formatPrice } from "./format.js";

/** Texto del mensaje de reserva que el comprador le envía a Epifanía por WhatsApp. */
export function mensajeReserva({ evento, cliente, seats }) {
  const total = seats.reduce((acc, s) => acc + s.precio, 0);
  const cuando = evento?.fecha
    ? ` (${formatFechaCorta(evento.fecha)}${evento.hora ? ` · ${formatHora(evento.hora)} hs` : ""})`
    : "";

  return [
    `Hola! Reservé butacas para *${evento?.nombre ?? "el show"}*${cuando} y quiero coordinar el pago.`,
    "",
    `Nombre: ${cliente.nombre}`,
    `DNI: ${cliente.dni}`,
    `Email: ${cliente.email}`,
    "",
    "Butacas:",
    ...seats.map((s) => `- Fila ${s.fila}, butaca ${s.columna} — ${formatPrice(s.precio)}`),
    "",
    `*Total: ${formatPrice(total)}*`,
    "",
    "¿Me pasás los datos para hacer el pago?",
  ].join("\n");
}

export function urlWhatsApp(texto) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(texto)}`;
}

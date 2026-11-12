// Número de WhatsApp (formato internacional, sin + ni espacios) que recibe las reservas.
export const WHATSAPP_PHONE = import.meta.env.VITE_WHATSAPP_PHONE || "5493515073081";

// Tiene que coincidir con el máximo que valida el backend por reserva.
export const MAX_SEATS = 10;

// Minutos que se sostienen las butacas reservadas hasta que se registre el pago.
export const HOLD_MINUTES = 30;

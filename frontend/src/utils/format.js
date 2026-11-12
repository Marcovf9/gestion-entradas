const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const formatPrice = (n) => `$${Number(n).toLocaleString("es-AR")}`;

/** "2026-12-06" -> Date local (sin corrimiento por zona horaria). */
export function parseFecha(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "2026-12-06" -> "domingo 6 de diciembre" */
export function formatFechaLarga(iso) {
  const f = parseFecha(iso);
  if (!f) return "";
  return `${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`;
}

/** "2026-12-06" -> "6/12" */
export function formatFechaCorta(iso) {
  const f = parseFecha(iso);
  return f ? `${f.getDate()}/${f.getMonth() + 1}` : "";
}

/** "19:30:00" -> "19:30" */
export const formatHora = (hora) => (hora ? hora.slice(0, 5) : "");

export const capitalizar = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/** Segundos -> "mm:ss" */
export function formatCuentaRegresiva(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** Mensaje de error legible a partir de un error de axios. */
export function mensajeDeError(err, porDefecto = "Ocurrió un error. Probá de nuevo.") {
  const data = err?.response?.data;
  if (data?.campos) return Object.values(data.campos).join(" ");
  if (data?.error) return data.error;
  if (!err?.response) return "No hay conexión con el servidor. Revisá tu internet y probá de nuevo.";
  return porDefecto;
}

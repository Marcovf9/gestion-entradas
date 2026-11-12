/**
 * Agrupa butacas (una fila por butaca en el backend) por comprador.
 * - Reservas: se agrupa también por vencimiento, así cada reserva hecha
 *   en un solo paso queda como una tarjeta (aunque la misma persona
 *   haya hecho dos reservas distintas).
 * - Ventas: se agrupa solo por persona (DNI + email).
 */
export function agruparPorComprador(items, { porVencimiento = false } = {}) {
  const grupos = new Map();

  items.forEach((item) => {
    const clave = [item.clienteDni, item.clienteEmail, porVencimiento ? item.reservaHasta : ""].join("|");
    if (!grupos.has(clave)) {
      grupos.set(clave, {
        clave,
        nombre: item.clienteNombre,
        dni: item.clienteDni,
        email: item.clienteEmail,
        reservaHasta: item.reservaHasta,
        segundosRestantes: item.segundosRestantes,
        butacas: [],
        total: 0,
      });
    }
    const grupo = grupos.get(clave);
    grupo.butacas.push(item);
    grupo.total += item.precio ?? 0;
  });

  const lista = [...grupos.values()];
  lista.forEach((g) => g.butacas.sort((a, b) => a.fila - b.fila || a.columna - b.columna));
  return lista;
}

export const idsDe = (grupo) => grupo.butacas.map((b) => b.id);

export const etiquetaButaca = (b) => `F${b.fila}·${b.columna}`;

/** CSV (separado por ;, con BOM) listo para abrir en Excel con acentos. */
export function ventasACsv(ventas) {
  const celda = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const filas = [["Nombre", "DNI", "Email", "Fila", "Butaca", "Categoría", "Precio"]];
  ventas.forEach((v) =>
    filas.push([v.clienteNombre, v.clienteDni, v.clienteEmail, v.fila, v.columna, v.zonaNombre, v.precio])
  );
  return "﻿" + filas.map((f) => f.map(celda).join(";")).join("\r\n");
}

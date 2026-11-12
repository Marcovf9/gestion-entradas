import React, { useMemo } from "react";
import { formatPrice } from "../../utils/format.js";

/** Categorías de precio (con cuántas butacas quedan) y significado de cada color del plano. */
export default function Legend({ zonas, butacas }) {
  const categorias = useMemo(() => {
    const libres = new Map();
    butacas.forEach((b) => {
      if (b.estado === "DISPONIBLE") libres.set(b.zonaId, (libres.get(b.zonaId) ?? 0) + 1);
    });
    return zonas
      .filter((z) => z.precio > 0)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((z) => ({ ...z, libres: libres.get(z.id) ?? 0 }));
  }, [zonas, butacas]);

  return (
    <div className="legend">
      <div className="legend__group">
        <h3 className="legend__title">Precios</h3>
        <ul className="legend__list">
          {categorias.map((z) => (
            <li key={z.id} className="legend__item">
              <span
                className="legend__swatch legend__swatch--zone"
                style={{ "--zc": z.color }}
                aria-hidden="true"
              />
              <span>
                <strong>{formatPrice(z.precio)}</strong> · {z.nombre}
                <span className="legend__count">
                  {z.libres > 0 ? ` — quedan ${z.libres}` : " — agotadas"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="legend__group">
        <h3 className="legend__title">Referencias</h3>
        <ul className="legend__list legend__list--inline">
          <li className="legend__item">
            <span className="legend__swatch seat--available" style={{ "--zc": "#4f6fa8" }} aria-hidden="true" />
            Disponible
          </li>
          <li className="legend__item">
            <span className="legend__swatch seat--selected" aria-hidden="true" />
            Seleccionada
          </li>
          <li className="legend__item">
            <span className="legend__swatch seat--reserved" aria-hidden="true" />
            Reservada
          </li>
          <li className="legend__item">
            <span className="legend__swatch seat--sold" aria-hidden="true" />
            Vendida
          </li>
          <li className="legend__item">
            <span className="legend__swatch seat--blocked" aria-hidden="true" />
            No disponible
          </li>
        </ul>
      </div>
    </div>
  );
}

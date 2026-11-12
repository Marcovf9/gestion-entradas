import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { formatPrice } from "../../utils/format.js";

const MIN_H = 6; // alto mínimo de media columna, en px
const MAX_H = 30;
const MAX_H_AJUSTADO = 18; // en pantallas grandes no hace falta que las butacas crezcan más
const H_OBJETIVO = 13; // en celulares, tamaño cómodo para tocar (se desliza el plano)
const ZOOM_STEP = 1.25;

const ETIQUETA_ESTADO = {
  DISPONIBLE: "disponible",
  RESERVADA: "reservada, en proceso de pago",
  VENDIDA: "vendida",
  BLOQUEADA: "no disponible",
};

const pad = (n) => String(n).padStart(2, "0");
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/**
 * Una butaca. Se posiciona en la grilla de la fila con `posX` (en medios
 * asientos: cada butaca ocupa 2 columnas), así la fila 15 puede quedar
 * desplazada medio asiento y las de las filas 16 y 17 respetan el plano.
 */
const Seat = memo(function Seat({ seat, zona, selected, onToggle }) {
  const estado = seat.estado;
  const libre = estado === "DISPONIBLE";
  const clase = selected
    ? "seat--selected"
    : { DISPONIBLE: "seat--available", RESERVADA: "seat--reserved", VENDIDA: "seat--sold", BLOQUEADA: "seat--blocked" }[
        estado
      ];

  const precio = zona && zona.precio > 0 ? ` — ${formatPrice(zona.precio)}` : "";
  const descripcion = `Fila ${seat.fila}, butaca ${seat.columna}${precio} (${
    selected ? "seleccionada" : ETIQUETA_ESTADO[estado]
  })`;

  return (
    <button
      type="button"
      className={`seat ${clase}`}
      style={{ gridColumn: `${seat.posX + 1} / span 2`, "--zc": zona?.color ?? "#4f6fa8" }}
      disabled={!libre && !selected}
      aria-pressed={libre || selected ? selected : undefined}
      aria-label={descripcion}
      title={descripcion}
      onClick={() => onToggle(seat)}
    >
      {seat.columna}
    </button>
  );
});

export default function SeatMap({ butacas, zonas, elementos, selectedIds, onToggle }) {
  const wrapRef = useRef(null);
  const [ancho, setAncho] = useState(960);
  const [zoom, setZoom] = useState(1); // factor sobre el tamaño automático

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const medir = () => setAncho(el.clientWidth);
    medir();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const zonasPorId = useMemo(() => new Map(zonas.map((z) => [z.id, z])), [zonas]);
  const seleccion = useMemo(() => new Set(selectedIds), [selectedIds]);

  const { filas, columnas } = useMemo(() => {
    const porFila = new Map();
    butacas.forEach((b) => {
      if (!porFila.has(b.fila)) porFila.set(b.fila, []);
      porFila.get(b.fila).push(b);
    });
    const filasOrdenadas = [...porFila.keys()].sort((a, b) => a - b);

    let max = 0;
    butacas.forEach((b) => {
      max = Math.max(max, b.posX + 2);
    });
    elementos.forEach((e) => {
      max = Math.max(max, e.posX + e.ancho);
    });

    return {
      columnas: max,
      filas: filasOrdenadas.map((fila) => ({
        fila,
        butacas: porFila.get(fila).sort((a, b) => a.posX - b.posX),
        elementos: elementos.filter((e) => e.fila === fila),
      })),
    };
  }, [butacas, elementos]);

  const anchoEtiqueta = ancho < 640 ? 52 : 74;
  const hQueEntra = (ancho - anchoEtiqueta - 6) / Math.max(columnas, 1);
  // Si el plano entero entra en pantalla con butacas cómodas, se ajusta al ancho.
  // Si no (celulares), se usa un tamaño cómodo para tocar y el plano se desliza.
  const hAuto = hQueEntra >= H_OBJETIVO ? Math.min(hQueEntra, MAX_H_AJUSTADO) : H_OBJETIVO;
  const h = clamp(hAuto * zoom, MIN_H, MAX_H);
  const puedeAchicar = h > MIN_H + 0.01;
  const puedeAgrandar = h < MAX_H - 0.01;
  const hayScroll = anchoEtiqueta + columnas * h + 6 > ancho + 1;

  const cambiarZoom = (factor) => setZoom((z) => clamp(z * factor, 0.2, 6));

  return (
    <div className="seatmap">
      <div className="seatmap__toolbar">
        <p className="seatmap__hint">Tocá las butacas libres para seleccionarlas.</p>
        <div className="seatmap__zoom" role="group" aria-label="Zoom del plano">
          <button type="button" className="icon-btn" onClick={() => cambiarZoom(1 / ZOOM_STEP)} disabled={!puedeAchicar} aria-label="Alejar">
            <FaMinus aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn" onClick={() => cambiarZoom(ZOOM_STEP)} disabled={!puedeAgrandar} aria-label="Acercar">
            <FaPlus aria-hidden="true" />
          </button>
          {zoom !== 1 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setZoom(1)}>
              Ajustar
            </button>
          )}
        </div>
      </div>

      <div className="seatmap__scroll" ref={wrapRef}>
        <div
          className="seatmap__content"
          style={{
            "--h": `${h}px`,
            "--label-w": `${anchoEtiqueta}px`,
            minWidth: `${anchoEtiqueta + columnas * h + 6}px`,
          }}
        >
          <div className="seatmap__row">
            <div className="seatmap__label" />
            <div className="seatmap__stage">ESCENARIO</div>
          </div>

          {filas.map(({ fila, butacas: butacasFila, elementos: elementosFila }) => (
            <div className="seatmap__row" key={fila}>
              <div className="seatmap__label">FILA {pad(fila)}</div>
              <div className="seatmap__grid" style={{ gridTemplateColumns: `repeat(${columnas}, var(--h))` }}>
                {butacasFila.map((b) => (
                  <Seat
                    key={b.id}
                    seat={b}
                    zona={zonasPorId.get(b.zonaId)}
                    selected={seleccion.has(b.id)}
                    onToggle={onToggle}
                  />
                ))}
                {elementosFila.map((e) => (
                  <div
                    key={e.id}
                    className="seatmap__element"
                    style={{ gridColumn: `${e.posX + 1} / span ${e.ancho}` }}
                  >
                    {e.etiqueta}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hayScroll && <p className="seatmap__swipe">Deslizá el plano para ver todas las butacas.</p>}
    </div>
  );
}

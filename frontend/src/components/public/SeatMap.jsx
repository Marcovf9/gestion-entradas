import React, { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FaMinus, FaPlus, FaExpand } from "react-icons/fa";
import { formatPrice } from "../../utils/format.js";

const MIN_H = 4; // alto mínimo de media columna (px): plano completo en pantallas muy angostas
const MAX_H = 30;
const MAX_H_AJUSTADO = 18; // en pantallas grandes no hace falta que las butacas crezcan más
const H_CLARO = 12; // desde acá las butacas se pueden tocar con comodidad
const H_OBJETIVO = 15; // tamaño al acercar en celulares
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
      data-seat={seat.id}
      style={{ gridColumn: `${seat.posX + 1} / span 2`, "--zc": zona?.color ?? "#4f6fa8" }}
      // No se usa `disabled`: en la vista completa de un celular, tocar cualquier butaca
      // (incluso una vendida) acerca el plano (ver alTocarButaca).
      aria-disabled={!libre && !selected ? true : undefined}
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
  const centrarEn = useRef(null);
  const [ancho, setAncho] = useState(960);
  const [zoom, setZoom] = useState(1); // 1 = plano completo ajustado al ancho

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

  const anchoEtiqueta = ancho < 640 ? 30 : 74;
  // Tamaño con el que el plano entero entra en el ancho disponible.
  const hCompleto = clamp((ancho - anchoEtiqueta - 6) / Math.max(columnas, 1), MIN_H, MAX_H_AJUSTADO);
  const h = clamp(hCompleto * zoom, MIN_H, MAX_H);
  const claro = h >= H_CLARO; // ¿las butacas son lo bastante grandes para tocarlas?
  const compacto = h < 9; // números ilegibles: se ocultan
  const puedeAchicar = zoom > 1.001;
  const puedeAgrandar = h < MAX_H - 0.01;
  const hayScroll = anchoEtiqueta + columnas * h + 6 > ancho + 1;
  const hAcercado = Math.max(H_OBJETIVO, hCompleto);

  // Tras acercar con un toque, deja la butaca tocada en el centro de la pantalla.
  useLayoutEffect(() => {
    const id = centrarEn.current;
    if (!id) return;
    centrarEn.current = null;
    const cont = wrapRef.current;
    const el = cont?.querySelector(`[data-seat="${id}"]`);
    if (!cont || !el) return;
    const r = el.getBoundingClientRect();
    const c = cont.getBoundingClientRect();
    cont.scrollLeft += r.left - c.left - cont.clientWidth / 2 + r.width / 2;
    el.scrollIntoView({ block: "center", inline: "nearest" });
  }, [h]);

  const acercar = () => {
    // Desde la vista completa, salta directo a un tamaño cómodo para tocar.
    setZoom((z) => (hCompleto * z < hAcercado - 0.01 ? hAcercado / hCompleto : z * ZOOM_STEP));
  };
  const alejar = () => setZoom((z) => Math.max(1, z / ZOOM_STEP));

  const alTocarButaca = (seat) => {
    if (claro) {
      if (seat.estado === "DISPONIBLE" || seleccion.has(seat.id)) onToggle(seat);
    } else {
      centrarEn.current = seat.id;
      setZoom(hAcercado / hCompleto);
    }
  };

  return (
    <div className="seatmap">
      <div className="seatmap__toolbar">
        <p className="seatmap__hint">
          {claro ? "Tocá las butacas libres para seleccionarlas." : "Tocá una zona del plano para acercarla."}
        </p>
        <div className="seatmap__zoom" role="group" aria-label="Zoom del plano">
          {puedeAchicar && (
            <button type="button" className="btn btn--ghost btn--sm seatmap__todo" onClick={() => setZoom(1)}>
              <FaExpand aria-hidden="true" /> Plano completo
            </button>
          )}
          <button type="button" className="icon-btn" onClick={alejar} disabled={!puedeAchicar} aria-label="Alejar">
            <FaMinus aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn" onClick={acercar} disabled={!puedeAgrandar} aria-label="Acercar">
            <FaPlus aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="seatmap__scroll" ref={wrapRef}>
        <div
          className={`seatmap__content ${compacto ? "seatmap__content--compacto" : ""} ${claro ? "" : "seatmap__content--resumen"}`}
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
              <div className="seatmap__label">
                <span className="seatmap__fila-txt">FILA </span>
                {pad(fila)}
              </div>
              <div className="seatmap__grid" style={{ gridTemplateColumns: `repeat(${columnas}, var(--h))` }}>
                {butacasFila.map((b) => (
                  <Seat
                    key={b.id}
                    seat={b}
                    zona={zonasPorId.get(b.zonaId)}
                    selected={seleccion.has(b.id)}
                    onToggle={alTocarButaca}
                  />
                ))}
                {elementosFila.map((e) => (
                  <div
                    key={e.id}
                    className="seatmap__element"
                    style={{ gridColumn: `${e.posX + 1} / span ${e.ancho}` }}
                  >
                    {compacto ? "" : e.etiqueta}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hayScroll && claro && <p className="seatmap__swipe">Deslizá el plano para ver todas las butacas.</p>}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";

/** --- Componente de butaca individual --- */
function Seat({ seat, onClick, isSelected }) {
  const { estado } = seat;

  let className = "seat";

  if (estado === "DISPONIBLE") className += " seat--available";
  if (estado === "RESERVADA") className += " seat--reserved";
  if (estado === "VENDIDA") className += " seat--sold";

  if (isSelected) className += " seat--selected";

  const disabled = estado === "VENDIDA" || estado === "RESERVADA";

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={`Fila ${seat.fila}, Asiento ${seat.columna}`}
    >
      {seat.columna}
    </button>
  );
}

/** --- Bloque de zona (ej: Platea baja, Palco VIP, etc.) --- */
function ZoneBlock({ label, price, seats, skew = 0 }) {
  const rows = useMemo(() => {
    const map = new Map();
    seats.forEach((b) => {
      const key = b.fila;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(b);
    });
    const ordered = Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([fila, list]) => ({
        fila,
        seats: list.sort((a, b) => a.columna - b.columna),
      }));
    return ordered;
  }, [seats]);

  return (
    <div
      className="zone-block bg-white shadow-md p-4 rounded-2xl"
      style={{ transform: `skewY(${skew}deg)` }}
    >
      <div className="zone-header mb-2">
        <h3 className="font-bold text-purple-700">{label}</h3>
        {price != null && (
          <span className="zone-price text-sm text-gray-500">
            ${price.toLocaleString("es-AR")} c/u
          </span>
        )}
      </div>
      <div className="zone-grid">
        {rows.map((row) => (
          <div key={row.fila} className="seat-row flex items-center gap-1">
            <span className="seat-row-label text-xs text-gray-400 w-3">
              {row.fila}
            </span>
            <div className="seat-row-seats flex gap-1">
              {row.seats.map((seat) => (
                <Seat
                  key={seat.id}
                  seat={seat}
                  onClick={seat.onClick}
                  isSelected={seat.isSelected}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const COLUMNAS = ["IZQUIERDA", "CENTRO", "DERECHA"];

/** --- Mapa completo del teatro --- */
export default function SeatMap({ eventoId, onSelectionChange, reloadKey }) {
  const [zones, setZones] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  useEffect(() => {
    if (!eventoId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const [zonesRes, seatsRes] = await Promise.all([
          api.get(`/eventos/${eventoId}/zonas`),
          api.get(`/eventos/${eventoId}/butacas`),
        ]);

        setZones(zonesRes.data);
        setSeats(seatsRes.data);
        setSelectedSeatIds([]);
        setError("");
        onSelectionChange?.({ seats: [], total: 0 });
      } catch (err) {
        console.error(err);
        setError(
          "No se pudieron cargar las butacas. ¿Está el backend corriendo?"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [eventoId, reloadKey, onSelectionChange]);

  const zonesById = useMemo(() => {
    const map = new Map();
    zones.forEach((z) => map.set(z.id, z));
    return map;
  }, [zones]);

  const seatsByZone = useMemo(() => {
    const map = new Map();
    seats.forEach((b) => {
      if (!map.has(b.zonaId)) map.set(b.zonaId, []);
      map.get(b.zonaId).push(b);
    });
    return map;
  }, [seats]);

  const handleSeatClick = (seat) => {
    if (seat.estado !== "DISPONIBLE") return;

    setSelectedSeatIds((prev) => {
      const exists = prev.includes(seat.id);
      const next = exists
        ? prev.filter((id) => id !== seat.id)
        : [...prev, seat.id];

      if (onSelectionChange) {
        const selectedSeats = seats
          .filter((s) => next.includes(s.id))
          .map((s) => {
            const zona = zonesById.get(s.zonaId);
            return {
              id: s.id,
              fila: s.fila,
              columna: s.columna,
              zonaId: s.zonaId,
              zonaNombre: zona?.nombre ?? "",
              precio: zona?.precio ?? 0,
            };
          });

        const total = selectedSeats.reduce((acc, s) => acc + s.precio, 0);
        onSelectionChange({ seats: selectedSeats, total });
      }

      return next;
    });
  };

  const columnas = useMemo(() => {
    const grouped = { IZQUIERDA: [], CENTRO: [], DERECHA: [] };
    zones
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .forEach((zona) => {
        const baseSeats = seatsByZone.get(zona.id) || [];
        const seatsConHandler = baseSeats.map((seat) => ({
          ...seat,
          onClick: () => handleSeatClick(seat),
          isSelected: selectedSeatIds.includes(seat.id),
        }));
        if (grouped[zona.gridColumn]) {
          grouped[zona.gridColumn].push({ zona, seats: seatsConHandler });
        }
      });
    return grouped;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones, seatsByZone, selectedSeatIds]);

  if (!eventoId) return null;
  if (loading) return <p>Cargando mapa de butacas...</p>;
  if (error) return <p className="error-box text-red-600">{error}</p>;

  return (
    <div className="theatre-wrapper bg-slate-100 min-h-screen py-6">
      <p className="text-center text-gray-600 mb-4">
        Seleccioná tus butacas para el show de fin de año.
      </p>

      <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg shadow-sm mb-6 text-center max-w-3xl mx-auto">
        ⚠️ <strong>Recordá:</strong> las butacas reservadas duran{" "}
        <strong>30 minutos</strong>. Luego vuelven a estar disponibles si no se
        registra el pago.
      </div>

      <div className="stage bg-slate-800 text-white text-center py-2 rounded-full font-semibold mb-6">
        ESCENARIO
      </div>

      <div className="theatre-layout grid grid-cols-3 gap-6 px-10 max-w-[1600px] mx-auto">
        {COLUMNAS.map((columna) => (
          <div key={columna} className="flex flex-col gap-4">
            {columnas[columna].map(({ zona, seats: zoneSeats }) => (
              <ZoneBlock
                key={zona.id}
                label={zona.nombre}
                price={zona.precio}
                seats={zoneSeats}
                skew={zona.skewDeg}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="legend-container">
        <div className="legend-item">
          <span className="legend-box legend-available"></span> Disponible
        </div>
        <div className="legend-item">
          <span className="legend-box legend-selected"></span> Seleccionada
        </div>
        <div className="legend-item">
          <span className="legend-box legend-reserved"></span> Reservada
        </div>
        <div className="legend-item">
          <span className="legend-box legend-sold"></span> Vendida
        </div>
      </div>
    </div>
  );
}

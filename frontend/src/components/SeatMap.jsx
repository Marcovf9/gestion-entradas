// src/SeatMap.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:4000";

/**
 * Devuelve las filas ordenadas de una zona:
 * [
 *   { fila: 1, seats: [butaca, butaca, ...] },
 *   { fila: 2, seats: [...] },
 * ]
 */
function buildSeatGrid(seats = []) {
  const byFila = new Map();

  seats.forEach((s) => {
    const filaNum = Number(s.fila);
    if (!byFila.has(filaNum)) byFila.set(filaNum, []);
    byFila.get(filaNum).push(s);
  });

  return Array.from(byFila.entries())
    .sort(([a], [b]) => a - b)
    .map(([fila, filaSeats]) => ({
      fila,
      seats: filaSeats.sort((a, b) => a.columna - b.columna),
    }));
}

function ZoneBlock({ title, price, zone, className = "", onSeatClick, selectedSeats }) {
  if (!zone) return null;

  const rows = buildSeatGrid(zone.seats);

  return (
    <div className={`zone-block ${className}`}>
      <div className="zone-label">
        <span className="font-semibold">{title}</span>{" "}
        <span className="text-[11px] text-gray-600">(${price.toLocaleString("es-AR")} c/u)</span>
      </div>
      <div className="zone-grid">
        {rows.map((row) => (
          <div className="seat-row" key={row.fila}>
            {row.seats.map((seat) => {
              const isSelected = selectedSeats.some((s) => s.id === seat.id);
              const isAvailable = seat.disponible;

              let seatClass = "seat seat--available";
              if (!isAvailable) seatClass = "seat seat--occupied";
              if (isSelected) seatClass = "seat seat--selected";

              return (
                <div
                  key={seat.id}
                  className={seatClass}
                  onClick={() => {
                    if (isAvailable) onSeatClick(seat);
                  }}
                  title={`${title} - Fila ${seat.fila}, Butaca ${seat.columna}`}
                >
                  {seat.columna}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SeatMap({ onSelectionChange }) {
  const [zones, setZones] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const [zonesRes, seatsRes] = await Promise.all([
          fetch(`${API_BASE}/api/zones`),
          fetch(`${API_BASE}/api/seats`),
        ]);

        if (!zonesRes.ok || !seatsRes.ok) {
          throw new Error("Error al cargar datos del servidor");
        }

        const zonesJson = await zonesRes.json();
        const seatsJson = await seatsRes.json();

        // Mapeo zonas por id con sus butacas
        const map = new Map();
        zonesJson.forEach((z) => {
          map.set(z.id, { ...z, seats: [] });
        });
        seatsJson.forEach((seat) => {
          const zona = map.get(seat.zonaId);
          if (zona) zona.seats.push(seat);
        });

        setZones(Array.from(map.values()));
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el mapa de butacas.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function handleSeatClick(seat) {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      let next;
      if (exists) {
        next = prev.filter((s) => s.id !== seat.id);
      } else {
        next = [...prev, seat];
      }
      if (onSelectionChange) {
        onSelectionChange(next);
      }
      return next;
    });
  }

  // Mapa por nombre para usar posiciones específicas
  const byName = zones.reduce((acc, z) => {
    acc[z.nombre] = z;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-gray-600 text-sm">Cargando mapa de butacas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="theatre-wrapper">
      {/* Banner de ESCENARIO */}
      <div className="stage-banner">ESCENARIO</div>

      <div className="theatre-layout">
        {/* PLATEA BAJA */}
        <ZoneBlock
          title="Platea baja"
          price={byName["Platea baja"]?.precio ?? 25000}
          zone={byName["Platea baja"]}
          className="zone-platea-baja"
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
        />

        {/* PLATEA SUPERIOR CENTRAL */}
        <ZoneBlock
          title="Platea superior central"
          price={byName["Platea superior central"]?.precio ?? 20000}
          zone={byName["Platea superior central"]}
          className="zone-platea-superior"
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
        />

        {/* PALCO SUPERIOR CENTRAL */}
        <ZoneBlock
          title="Palco superior central"
          price={byName["Palco superior central"]?.precio ?? 20000}
          zone={byName["Palco superior central"]}
          className="zone-palco-superior-central"
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
        />

        {/* PALCOS INFERIORES */}
        <ZoneBlock
          title="Palcos inferiores A"
          price={byName["Palcos inferiores A"]?.precio ?? 25000}
          zone={byName["Palcos inferiores A"]}
          className="zone-palcos-inf-left"
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
        />

        <ZoneBlock
          title="Palcos inferiores B"
          price={byName["Palcos inferiores B"]?.precio ?? 25000}
          zone={byName["Palcos inferiores B"]}
          className="zone-palcos-inf-right"
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
        />

        {/* PALCOS VIP */}
        <ZoneBlock
          title="Palcos VIP A"
          price={byName["Palcos VIP A"]?.precio ?? 20000}
          zone={byName["Palcos VIP A"]}
          className="zone-vip-left"
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
        />

        <ZoneBlock
          title="Palcos VIP B"
          price={byName["Palcos VIP B"]?.precio ?? 20000}
          zone={byName["Palcos VIP B"]}
          className="zone-vip-right"
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
        />

        {/* PALCOS SUPERIORES */}
        <ZoneBlock
          title="Palcos superiores A"
          price={byName["Palcos superiores A"]?.precio ?? 20000}
          zone={byName["Palcos superiores A"]}
          className="zone-palcos-sup-left"
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
        />

        <ZoneBlock
          title="Palcos superiores B"
          price={byName["Palcos superiores B"]?.precio ?? 20000}
          zone={byName["Palcos superiores B"]}
          className="zone-palcos-sup-right"
          onSeatClick={handleSeatClick}
          selectedSeats={selectedSeats}
        />
      </div>
    </div>
  );
}

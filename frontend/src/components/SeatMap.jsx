import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:4000/api";

/** --- Componente de butaca individual --- */
function Seat({ seat, onClick }) {
  const { estado } = seat;

  let className = "seat";
  if (estado === "DISPONIBLE") className += " seat--available";
  if (estado === "RESERVADA") className += " seat--selected";
  if (estado === "VENDIDA") className += " seat--sold";

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={estado === "VENDIDA"}
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
                <Seat key={seat.id} seat={seat} onClick={seat.onClick} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** --- Mapa completo del teatro --- */
export default function SeatMap() {
  const [zones, setZones] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [zonesRes, seatsRes] = await Promise.all([
          fetch(`${API_BASE}/zones`),
          fetch(`${API_BASE}/seats`),
        ]);

        if (!zonesRes.ok || !seatsRes.ok)
          throw new Error("Error cargando datos del servidor");

        const zonesJson = await zonesRes.json();
        const seatsJson = await seatsRes.json();

        setZones(zonesJson);
        setSeats(seatsJson);
        setError("");
      } catch (err) {
        console.error(err);
        setError(
          "No se pudieron cargar las butacas. ¿Está el backend corriendo en el puerto 4000?"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const zoneById = useMemo(() => {
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

  const withClickHandler = (zoneSeats) =>
    zoneSeats.map((seat) => ({
      ...seat,
      onClick: async () => {
        try {
          const res = await fetch(`${API_BASE}/seats/${seat.id}/toggle`, {
            method: "POST",
          });
          if (!res.ok) throw new Error("Error al actualizar butaca");
          const updated = await res.json();
          setSeats((prev) =>
            prev.map((s) =>
              s.id === updated.id ? { ...s, estado: updated.estado } : s
            )
          );
        } catch (err) {
          console.error(err);
          alert("No se pudo actualizar la butaca en el servidor.");
        }
      },
    }));

  if (loading) return <p>Cargando mapa de butacas...</p>;
  if (error) return <p className="error-box text-red-600">{error}</p>;

  const getZoneSeats = (name) => {
    const zona = zones.find((z) => z.nombre === name);
    if (!zona) return [];
    const baseSeats = seatsByZone.get(zona.id) || [];
    return withClickHandler(baseSeats);
  };

  const price = (name) => zones.find((z) => z.nombre === name)?.precio ?? null;

  // Zonas
  const plateaBaja = getZoneSeats("Platea baja");
  const plateaSuperiorCentral = getZoneSeats("Platea superior central");
  const palcosInfA = getZoneSeats("Palcos inferiores A");
  const palcosInfB = getZoneSeats("Palcos inferiores B");
  const palcosVipA = getZoneSeats("Palcos VIP A");
  const palcosVipB = getZoneSeats("Palcos VIP B");
  const palcosSupA = getZoneSeats("Palcos superiores A");
  const palcosSupB = getZoneSeats("Palcos superiores B");
  const palcoSupCentral = getZoneSeats("Palco superior central");

  return (
    <div className="theatre-wrapper bg-slate-100 min-h-screen py-6">
      
      <p className="text-center text-gray-600 mb-4">
        Seleccioná tus butacas para el show de fin de año.
      </p>

      {/* 🔔 Aviso reserva */}
      <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg shadow-sm mb-6 text-center max-w-3xl mx-auto">
        ⚠️ <strong>Proceso Manual:</strong> tus butacas se reservan
        temporalmente por <strong>30 minutos</strong>. Completá el pago por
        WhatsApp para confirmar la reserva.
      </div>

      <div className="stage bg-slate-800 text-white text-center py-2 rounded-full font-semibold mb-6">
        ESCENARIO
      </div>

      <div className="theatre-layout grid grid-cols-3 gap-6 px-10 max-w-[1600px] mx-auto">
        {/* Izquierda */}
        <div className="flex flex-col gap-4">
          <ZoneBlock
            label="Palcos superiores"
            price={price("Palcos superiores A")}
            seats={palcosSupA}
          />
          <ZoneBlock
            label="Palcos inferiores"
            price={price("Palcos inferiores A")}
            seats={palcosInfA}
          />
          <ZoneBlock
            label="Palcos VIP"
            price={price("Palcos VIP A")}
            seats={palcosVipA}
            skew={-6}
          />
        </div>

        {/* Centro */}
        <div className="flex flex-col gap-4">
          <ZoneBlock
            label="Platea baja"
            price={price("Platea baja")}
            seats={plateaBaja}
          />
          <ZoneBlock
            label="Platea superior central"
            price={price("Platea superior central")}
            seats={plateaSuperiorCentral}
          />
          <ZoneBlock
            label="Palco superior central"
            price={price("Palco superior central")}
            seats={palcoSupCentral}
          />
        </div>

        {/* Derecha */}
        <div className="flex flex-col gap-4">
          <ZoneBlock
            label="Palcos superiores"
            price={price("Palcos superiores B")}
            seats={palcosSupB}
          />
          <ZoneBlock
            label="Palcos inferiores"
            price={price("Palcos inferiores B")}
            seats={palcosInfB}
          />
          <ZoneBlock
            label="Palcos VIP"
            price={price("Palcos VIP B")}
            seats={palcosVipB}
            skew={6}
          />
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";

// Mapeo de IDs de zona a nombres de clase CSS para el posicionamiento
const ZONE_POSITION_MAP = {
  // Nivel Superior
  8: "zone-top-left",       // Palco Superior Izquierdo
  3: "zone-top-center",     // Palco Superior Central
  9: "zone-top-right",      // Palco Superior Derecho
  // Nivel Medio (VIP / Platea Superior)
  4: "zone-middle-left",    // Palco VIP Izquierdo
  2: "zone-middle-center",  // Platea Superior Central
  5: "zone-middle-right",   // Palco VIP Derecho
  // Nivel Inferior (Palcos Inferiores / Platea Baja)
  6: "zone-bottom-left",    // Palco Inferior Izquierdo
  1: "zone-bottom-center",  // Platea Baja (Cubre todo el ancho)
  7: "zone-bottom-right",   // Palco Inferior Derecho
};

// Función de ayuda para generar las filas y butacas de una zona
function renderSeats(zone) {
  const isGrid = zone.layout.type === "grid";
  const seatColor = zone.color || "#CCCCCC"; // Usa el color del JSON

  // Lógica para Platea Baja (type: 'grid')
  if (isGrid) {
    const { filas, columnas, ultimaFilaColumnas } = zone.layout;
    return [...Array(filas)].map((_, filaIndex) => {
      // La última fila tiene un número diferente de butacas
      const cols = filaIndex === filas - 1 ? ultimaFilaColumnas : columnas;
      const key = `${zone.nombre}-row-${filaIndex}`;

      return (
        <div key={key} className="flex justify-center gap-[2px]">
          {[...Array(cols)].map((_, colIndex) => (
            <div
              key={`${key}-col-${colIndex}`}
              className="w-4 h-4 rounded-sm transition"
              style={{ backgroundColor: seatColor }}
            ></div>
          ))}
        </div>
      );
    });
  }

  // Lógica para Palcos y Platea Superior Central (type: 'perRow')
  const rowsData = zone.layout.rows;
  return rowsData.map((rowConfig, rowIndex) => {
    // Maneja si la fila es un número simple (Palcos Inferiores) o un objeto
    const butacaCount = typeof rowConfig === 'number' ? rowConfig : rowConfig.count;
    // El pasillo se pone DESPUÉS de la butaca en la posición gapAfter[0]. Usamos -1 si no hay pasillo.
    const gapAfterIndex = typeof rowConfig === 'object' && rowConfig.gapAfter ? rowConfig.gapAfter[0] : -1;
    const key = `${zone.nombre}-row-${rowIndex}`;

    const seatsInRow = [];
    
    for (let i = 0; i < butacaCount; i++) {
        // Asiento normal
        seatsInRow.push(
            <div
                key={`${key}-seat-${i}`}
                className="w-4 h-4 rounded-sm transition hover:scale-110"
                style={{ backgroundColor: seatColor }}
            ></div>
        );

        // Insertar pasillo después de la butaca actual si corresponde
        // El asiento que acabamos de pintar es el número i + 1.
        if (gapAfterIndex !== -1 && i + 1 === gapAfterIndex) {
            // Pasillo (un espacio invisible más ancho)
            seatsInRow.push(
                <div key={`${key}-gap`} className="w-6 h-4"></div>
            );
        }
    }

    return (
      <div key={key} className="flex justify-center gap-[2px]">
        {seatsInRow}
      </div>
    );
  });
}

export default function SeatMap() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/zones")
      .then((res) => res.json())
      .then((data) => {
        // CRÍTICO: Asignar IDs para que coincidan con el mapa de posiciones
        const zonesWithId = data.map((zone, index) => ({
            ...zone,
            // Asume que el backend devuelve las zonas en el mismo orden que están en el JSON (id 1 a 9)
            id: index + 1
        }));
        setZones(zonesWithId);
      })
      .catch((err) => console.error("Error cargando zonas:", err));
  }, []);

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Mapa de Butacas 🎭
      </h1>

      <div className="relative bg-gray-200 p-8 rounded-lg shadow-lg w-full max-w-6xl min-h-[80vh]">
        
        {/* ESCENARIO */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-8 py-2 rounded-md z-10 font-bold">
          ESCENARIO
        </div>
        
        {/* CONTENEDOR PRINCIPAL: Usa la clase CSS Grid para el posicionamiento espacial */}
        <div className="seat-zones-grid mt-16">
          {/* Renderizar todas las zonas dinámicamente */}
          {zones.map((zone) => (
            <div 
              key={zone.id} 
              // CRÍTICO: Aquí se aplica la clase de posición CSS
              className={`seat-zone-container ${ZONE_POSITION_MAP[zone.id]}`}
            >
              <div className="flex flex-col items-center p-2 rounded-lg shadow-md bg-opacity-70"
                   // Usamos el color real de la zona
                   style={{ backgroundColor: zone.color || "#CCCCCC" }}> 
                <h3 className="font-semibold text-gray-800 text-xs text-center mb-1">
                  {zone.nombre} (${zone.precio / 1000}k)
                </h3>
                <div className="flex flex-col space-y-1 text-center">
                  {renderSeats(zone)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-600 text-center">
        {/* Leyenda de colores */}
        <p>
          <span className="font-semibold" style={{ color: "#FFC000" }}>Platea Baja</span> ·
          <span className="font-semibold" style={{ color: "#00AEEF" }}> Platea Sup. Central</span> ·
          <span className="font-semibold" style={{ color: "#999999" }}> Palco Sup. Central</span> ·
          <span className="font-semibold" style={{ color: "#9400D3" }}> Palcos VIP</span> ·
          <span className="font-semibold" style={{ color: "#DC143C" }}> Palcos Inferiores</span> ·
          <span className="font-semibold" style={{ color: "#008080" }}> Palcos Superiores</span> 
        </p>
      </div>
    </div>
  );
}
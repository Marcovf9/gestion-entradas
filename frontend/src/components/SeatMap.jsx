import React, { useEffect, useState } from "react";

export default function SeatMap() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/zones")
      .then((res) => res.json())
      .then((data) => setZones(data))
      .catch((err) => console.error("Error cargando zonas:", err));
  }, []);

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Mapa de Butacas 🎭
      </h1>

      <div className="relative bg-gray-200 p-8 rounded-lg shadow-lg w-full max-w-6xl">
        {/* ESCENARIO */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-700 text-white px-8 py-2 rounded-md">
          ESCENARIO
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="grid grid-cols-3 gap-4 mt-16">
          {/* Palcos Superiores Izquierda */}
          <div className="flex flex-col items-center justify-center rotate-[-5deg] space-y-1">
            <h3 className="font-semibold text-gray-700 text-sm mb-1">
              Palcos Superiores
            </h3>
            {[...Array(3)].map((_, row) => (
              <div key={row} className="flex justify-center gap-1">
                {Array(row === 2 ? 4 : 7)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 bg-blue-400 rounded-sm hover:bg-blue-300 transition"
                    ></div>
                  ))}
              </div>
            ))}
          </div>

          {/* ZONA CENTRAL */}
          <div className="flex flex-col items-center space-y-6">
            {/* Platea Baja */}
            <div className="text-center">
              <h3 className="font-semibold text-amber-600 text-sm mb-1">
                Platea Baja
              </h3>
              {[...Array(13)].map((_, fila) => (
                <div key={fila} className="flex justify-center gap-1">
                  {Array(fila === 12 ? 12 : 14)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 bg-yellow-400 rounded-sm hover:bg-yellow-300 transition"
                      ></div>
                    ))}
                </div>
              ))}
            </div>

            {/* Platea Superior Central */}
            <div className="text-center">
              <h3 className="font-semibold text-blue-600 text-sm mb-1">
                Platea Superior Central
              </h3>
              {[26, 28, 31, 25, 28, 30].map((cols, i) => (
                <div key={i} className="flex justify-center gap-1">
                  {Array(cols)
                    .fill(0)
                    .map((_, c) => (
                      <div
                        key={c}
                        className="w-5 h-5 bg-blue-300 rounded-sm hover:bg-blue-200 transition"
                      ></div>
                    ))}
                </div>
              ))}
            </div>

            {/* Palco Superior Central */}
            <div className="text-center">
              <h3 className="font-semibold text-gray-700 text-sm mb-1">
                Palco Superior Central
              </h3>
              <div className="flex justify-center gap-1">
                {Array(30)
                  .fill(0)
                  .map((_, c) => (
                    <div
                      key={c}
                      className="w-5 h-5 bg-gray-400 rounded-sm hover:bg-gray-300 transition"
                    ></div>
                  ))}
              </div>
            </div>
          </div>

          {/* Palcos Superiores Derecha */}
          <div className="flex flex-col items-center justify-center rotate-[5deg] space-y-1">
            <h3 className="font-semibold text-gray-700 text-sm mb-1">
              Palcos Superiores
            </h3>
            {[...Array(3)].map((_, row) => (
              <div key={row} className="flex justify-center gap-1">
                {Array(row === 2 ? 4 : 7)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 bg-blue-400 rounded-sm hover:bg-blue-300 transition"
                    ></div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-600 text-center">
        <p>
          <span className="font-semibold text-yellow-600">Platea Baja</span> $25.000 ·{" "}
          <span className="font-semibold text-blue-600">Platea Superior Central</span> $20.000 ·{" "}
          <span className="font-semibold text-purple-600">Palcos VIP</span> $20.000
        </p>
      </div>
    </div>
  );
}

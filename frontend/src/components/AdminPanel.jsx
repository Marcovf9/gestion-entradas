import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export default function AdminPanel() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/reservas/activas`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando reservas");
      setReservas(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // refresca cada 30s
    return () => clearInterval(id);
  }, []);

  const confirmarPago = async (seatId) => {
    if (!window.confirm("¿Confirmar pago de esta reserva?")) return;
    try {
      const res = await fetch(
        `${API_BASE}/reservas/${seatId}/confirmar`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al confirmar pago");
      await load();
    } catch (err) {
      console.error(err);
      alert(err.message || "No se pudo confirmar el pago");
    }
  };

  if (loading) return <p>Cargando reservas...</p>;
  if (error) return <p className="error-box text-red-600">{error}</p>;

  if (reservas.length === 0) {
    return <p>No hay reservas activas en este momento.</p>;
  }

  return (
    <div>
      <h2>Reservas activas</h2>
      <p>
        Aquí podés marcar manualmente cuando un pago fue realizado. Las
        reservas vencidas se liberan automáticamente.
      </p>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Zona</th>
              <th>Fila</th>
              <th>Asiento</th>
              <th>Cliente</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Vence</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.zona?.nombre}</td>
                <td>{r.fila}</td>
                <td>{r.columna}</td>
                <td>{r.clienteNombre}</td>
                <td>{r.clienteDni}</td>
                <td>{r.clienteEmail}</td>
                <td>
                  {r.reservaHasta
                    ? new Date(r.reservaHasta).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                <td>
                  <button
                    className="btn-primary btn-small"
                    onClick={() => confirmarPago(r.id)}
                  >
                    Confirmar pago
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

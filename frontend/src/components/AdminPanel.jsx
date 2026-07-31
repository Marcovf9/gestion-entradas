import React, { useEffect, useState } from "react";
import api from "../services/api.js";

const GRID_COLUMNS = ["IZQUIERDA", "CENTRO", "DERECHA"];

function ReservasActivas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/reservas/activas");
      setReservas(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error cargando reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const confirmarPago = async (seatId) => {
    if (!window.confirm("¿Confirmar pago de esta reserva?")) return;
    try {
      await api.post(`/reservas/${seatId}/confirmar`);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "No se pudo confirmar el pago");
    }
  };

  if (loading) return <p>Cargando reservas...</p>;
  if (error) return <p className="error-box text-red-600">{error}</p>;

  if (reservas.length === 0) {
    return <p>No hay reservas activas en este momento.</p>;
  }

  return (
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
              <td>{r.zonaNombre}</td>
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
                <button className="btn-primary btn-small" onClick={() => confirmarPago(r.id)}>
                  Confirmar pago
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ZONA_VACIA = {
  nombre: "",
  precio: "",
  color: "#42a5f5",
  displayOrder: 1,
  gridColumn: "CENTRO",
  skewDeg: 0,
};

function GestionZonas({ eventoId }) {
  const [zonas, setZonas] = useState([]);
  const [ediciones, setEdiciones] = useState({});
  const [nuevaZona, setNuevaZona] = useState(ZONA_VACIA);
  const [error, setError] = useState("");

  const load = async () => {
    if (!eventoId) return;
    try {
      const res = await api.get(`/eventos/${eventoId}/zonas`);
      setZonas(res.data);
      setEdiciones({});
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error cargando zonas");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventoId]);

  const campoEditado = (zona, campo) =>
    ediciones[zona.id]?.[campo] ?? zona[campo];

  const editarCampo = (zonaId, campo, valor) =>
    setEdiciones((prev) => ({ ...prev, [zonaId]: { ...prev[zonaId], [campo]: valor } }));

  const guardarZona = async (zona) => {
    try {
      const payload = {
        eventoId,
        nombre: campoEditado(zona, "nombre"),
        precio: Number(campoEditado(zona, "precio")),
        color: campoEditado(zona, "color"),
        displayOrder: Number(campoEditado(zona, "displayOrder")),
        gridColumn: campoEditado(zona, "gridColumn"),
        skewDeg: Number(campoEditado(zona, "skewDeg")),
      };
      await api.put(`/admin/zonas/${zona.id}`, payload);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "No se pudo guardar la zona");
    }
  };

  const eliminarZona = async (zona) => {
    if (!window.confirm(`¿Eliminar la zona "${zona.nombre}" y todas sus butacas?`)) return;
    try {
      await api.delete(`/admin/zonas/${zona.id}`);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "No se pudo eliminar la zona");
    }
  };

  const crearZona = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/zonas", {
        ...nuevaZona,
        eventoId,
        precio: Number(nuevaZona.precio),
        displayOrder: Number(nuevaZona.displayOrder),
        skewDeg: Number(nuevaZona.skewDeg),
      });
      setNuevaZona(ZONA_VACIA);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "No se pudo crear la zona");
    }
  };

  if (error) return <p className="error-box text-red-600">{error}</p>;

  return (
    <div className="admin-zonas">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Color</th>
              <th>Orden</th>
              <th>Columna</th>
              <th>Skew</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {zonas.map((zona) => (
              <tr key={zona.id}>
                <td>
                  <input
                    value={campoEditado(zona, "nombre")}
                    onChange={(e) => editarCampo(zona.id, "nombre", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={campoEditado(zona, "precio")}
                    onChange={(e) => editarCampo(zona.id, "precio", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="color"
                    value={campoEditado(zona, "color")}
                    onChange={(e) => editarCampo(zona.id, "color", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={campoEditado(zona, "displayOrder")}
                    onChange={(e) => editarCampo(zona.id, "displayOrder", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    value={campoEditado(zona, "gridColumn")}
                    onChange={(e) => editarCampo(zona.id, "gridColumn", e.target.value)}
                  >
                    {GRID_COLUMNS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={campoEditado(zona, "skewDeg")}
                    onChange={(e) => editarCampo(zona.id, "skewDeg", e.target.value)}
                  />
                </td>
                <td className="admin-zona-actions">
                  <button className="btn-primary btn-small" onClick={() => guardarZona(zona)}>
                    Guardar
                  </button>
                  <button className="btn-danger btn-small" onClick={() => eliminarZona(zona)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="admin-nueva-zona" onSubmit={crearZona}>
        <h3>Agregar zona</h3>
        <input
          placeholder="Nombre"
          value={nuevaZona.nombre}
          onChange={(e) => setNuevaZona((prev) => ({ ...prev, nombre: e.target.value }))}
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={nuevaZona.precio}
          onChange={(e) => setNuevaZona((prev) => ({ ...prev, precio: e.target.value }))}
          required
        />
        <input
          type="color"
          value={nuevaZona.color}
          onChange={(e) => setNuevaZona((prev) => ({ ...prev, color: e.target.value }))}
        />
        <input
          type="number"
          placeholder="Orden"
          value={nuevaZona.displayOrder}
          onChange={(e) => setNuevaZona((prev) => ({ ...prev, displayOrder: e.target.value }))}
        />
        <select
          value={nuevaZona.gridColumn}
          onChange={(e) => setNuevaZona((prev) => ({ ...prev, gridColumn: e.target.value }))}
        >
          {GRID_COLUMNS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary btn-small">
          Crear zona
        </button>
      </form>
    </div>
  );
}

export default function AdminPanel({ eventoId }) {
  const [tab, setTab] = useState("reservas");

  return (
    <div>
      <div className="admin-tabs">
        <button
          className={tab === "reservas" ? "admin-tab admin-tab--active" : "admin-tab"}
          onClick={() => setTab("reservas")}
        >
          Reservas activas
        </button>
        <button
          className={tab === "zonas" ? "admin-tab admin-tab--active" : "admin-tab"}
          onClick={() => setTab("zonas")}
        >
          Zonas y precios
        </button>
      </div>

      {tab === "reservas" ? (
        <>
          <p>
            Aquí podés marcar manualmente cuando un pago fue realizado. Las
            reservas vencidas se liberan automáticamente.
          </p>
          <ReservasActivas />
        </>
      ) : (
        <GestionZonas eventoId={eventoId} />
      )}
    </div>
  );
}

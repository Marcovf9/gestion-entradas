import React, { useMemo, useState } from "react";
import { FaDownload } from "react-icons/fa";
import api from "../../services/api.js";
import ConfirmDialog from "../ui/ConfirmDialog.jsx";
import { formatPrice, mensajeDeError } from "../../utils/format.js";
import { agruparPorComprador, etiquetaButaca, idsDe, ventasACsv } from "./agrupar.js";

export default function VentasTab({ ventas, evento, onCambio }) {
  const [busqueda, setBusqueda] = useState("");
  const [anular, setAnular] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const grupos = useMemo(() => agruparPorComprador(ventas), [ventas]);
  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return grupos;
    return grupos.filter((g) => [g.nombre, g.dni, g.email].some((v) => (v ?? "").toLowerCase().includes(q)));
  }, [grupos, busqueda]);

  const totalGeneral = ventas.reduce((acc, v) => acc + (v.precio ?? 0), 0);

  const descargar = () => {
    const blob = new Blob([ventasACsv(ventas)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ventas-${(evento?.nombre ?? "evento").toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmarAnulacion = async () => {
    setProcesando(true);
    setError("");
    try {
      await api.post("/reservas/liberar", { seatIds: idsDe(anular) });
      setAnular(null);
      await onCambio();
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo anular la venta."));
      setAnular(null);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <input
          type="search"
          className="admin-search"
          placeholder="Buscar por nombre, DNI o email"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar ventas"
        />
        <button type="button" className="btn btn--ghost btn--sm" onClick={descargar} disabled={ventas.length === 0}>
          <FaDownload aria-hidden="true" /> Descargar lista (CSV)
        </button>
      </div>

      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}

      {filtrados.length === 0 ? (
        <p className="admin-empty">{ventas.length === 0 ? "Todavía no hay ventas confirmadas." : "No hay resultados para esa búsqueda."}</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Comprador</th>
                <th>DNI</th>
                <th>Email</th>
                <th>Butacas</th>
                <th className="num">Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((g) => (
                <tr key={g.clave}>
                  <td data-label="Comprador">
                    <strong>{g.nombre}</strong>
                  </td>
                  <td data-label="DNI">{g.dni}</td>
                  <td data-label="Email">{g.email}</td>
                  <td data-label="Butacas">
                    <ul className="chips">
                      {g.butacas.map((b) => (
                        <li key={b.id} className="chip" title={b.zonaNombre}>
                          {etiquetaButaca(b)}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td data-label="Total" className="num">
                    {formatPrice(g.total)}
                  </td>
                  <td>
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => setAnular(g)}>
                      Anular
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="admin-total">
        {ventas.length} {ventas.length === 1 ? "butaca vendida" : "butacas vendidas"} · Total recaudado{" "}
        <strong>{formatPrice(totalGeneral)}</strong>
      </p>

      {anular && (
        <ConfirmDialog
          title="Anular venta"
          confirmLabel="Sí, anular venta"
          danger
          busy={procesando}
          onConfirm={confirmarAnulacion}
          onCancel={() => setAnular(null)}
        >
          <p>
            Se van a anular las {anular.butacas.length} butacas de <strong>{anular.nombre}</strong> (
            {anular.butacas.map(etiquetaButaca).join(", ")}). Vuelven a estar disponibles y se borran los datos del
            comprador. Esta acción no se puede deshacer.
          </p>
        </ConfirmDialog>
      )}
    </div>
  );
}

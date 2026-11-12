import { useCallback, useEffect, useRef, useState } from "react";
import api from "../services/api.js";

/**
 * Carga el evento activo con sus zonas, butacas y elementos del plano.
 * Las butacas se refrescan solas cada `refreshMs` para que la disponibilidad
 * que ve cada persona no quede vieja mientras otra gente reserva.
 */
export default function useEventoData({ refreshMs = 20000 } = {}) {
  const [data, setData] = useState({ evento: null, zonas: [], butacas: [], elementos: [], actualizadoEn: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const eventoIdRef = useRef(null);

  const cargarCompleto = useCallback(async () => {
    const inicio = Date.now(); // los datos reflejan el estado al ENVIAR el pedido, no al recibirlo
    const eventos = await api.get("/eventos");
    const evento = eventos.data[0] ?? null;
    eventoIdRef.current = evento?.id ?? null;
    if (!evento) {
      setData({ evento: null, zonas: [], butacas: [], elementos: [], actualizadoEn: inicio });
      return;
    }
    const [zonas, butacas, elementos] = await Promise.all([
      api.get(`/eventos/${evento.id}/zonas`),
      api.get(`/eventos/${evento.id}/butacas`),
      api.get(`/eventos/${evento.id}/elementos`),
    ]);
    setData({ evento, zonas: zonas.data, butacas: butacas.data, elementos: elementos.data, actualizadoEn: inicio });
  }, []);

  const recargarButacas = useCallback(async () => {
    const id = eventoIdRef.current;
    if (!id) return;
    const inicio = Date.now();
    const res = await api.get(`/eventos/${id}/butacas`);
    setData((prev) => ({ ...prev, butacas: res.data, actualizadoEn: inicio }));
  }, []);

  // Carga inicial
  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    cargarCompleto()
      .then(() => !cancelado && setError(""))
      .catch(() => !cancelado && setError("No pudimos cargar el plano de butacas."))
      .finally(() => !cancelado && setLoading(false));
    return () => {
      cancelado = true;
    };
  }, [cargarCompleto]);

  // Refresco periódico (solo si la pestaña está visible)
  useEffect(() => {
    if (!refreshMs) return undefined;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        recargarButacas().catch(() => {});
      }
    }, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs, recargarButacas]);

  const reintentar = useCallback(() => {
    setLoading(true);
    setError("");
    cargarCompleto()
      .catch(() => setError("No pudimos cargar el plano de butacas."))
      .finally(() => setLoading(false));
  }, [cargarCompleto]);

  return { ...data, loading, error, recargarButacas, recargarTodo: cargarCompleto, reintentar };
}

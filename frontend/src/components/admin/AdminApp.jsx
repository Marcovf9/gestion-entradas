import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api.js";
import useEventoData from "../../hooks/useEventoData.js";
import { formatPrice } from "../../utils/format.js";
import AdminLogin from "./AdminLogin.jsx";
import ReservasTab from "./ReservasTab.jsx";
import VentasTab from "./VentasTab.jsx";
import ZonasTab from "./ZonasTab.jsx";
import EventoTab from "./EventoTab.jsx";
import CuentaTab from "./CuentaTab.jsx";

const REFRESCO_MS = 15000;

function Stat({ label, value, tono }) {
  return (
    <div className={`stat ${tono ? `stat--${tono}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ requiereCambioInicial, onLogout }) {
  const { evento, zonas, butacas, loading, error, recargarButacas, recargarTodo, reintentar } = useEventoData({
    refreshMs: REFRESCO_MS,
  });
  const [reservas, setReservas] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [errorListas, setErrorListas] = useState("");
  const [requiereCambio, setRequiereCambio] = useState(requiereCambioInicial);
  const [tab, setTab] = useState(requiereCambioInicial ? "cuenta" : "reservas");

  const eventoId = evento?.id;

  const cargarListas = useCallback(async () => {
    if (!eventoId) return;
    try {
      const params = { eventoId };
      const [a, v] = await Promise.all([
        api.get("/reservas/activas", { params }),
        api.get("/reservas/vendidas", { params }),
      ]);
      setReservas(a.data);
      setVentas(v.data);
      setErrorListas("");
    } catch (err) {
      // 403 => el interceptor ya cerró la sesión; cualquier otro error se muestra.
      if (err.response?.status !== 403 && err.response?.status !== 401) {
        setErrorListas("No pudimos actualizar las reservas y ventas. Reintentando…");
      }
    }
  }, [eventoId]);

  useEffect(() => {
    cargarListas();
    const id = setInterval(cargarListas, REFRESCO_MS);
    return () => clearInterval(id);
  }, [cargarListas]);

  const refrescar = useCallback(async () => {
    await Promise.all([cargarListas(), recargarButacas()]);
  }, [cargarListas, recargarButacas]);

  const stats = useMemo(() => {
    const precio = new Map(zonas.map((z) => [z.id, z.precio]));
    const s = { vendidas: 0, reservadas: 0, disponibles: 0, bloqueadas: 0, cobrado: 0, porCobrar: 0 };
    butacas.forEach((b) => {
      if (b.estado === "VENDIDA") {
        s.vendidas += 1;
        s.cobrado += precio.get(b.zonaId) ?? 0;
      } else if (b.estado === "RESERVADA") {
        s.reservadas += 1;
        s.porCobrar += precio.get(b.zonaId) ?? 0;
      } else if (b.estado === "DISPONIBLE") {
        s.disponibles += 1;
      } else {
        s.bloqueadas += 1;
      }
    });
    return s;
  }, [butacas, zonas]);

  const cantidadReservas = useMemo(
    () => new Set(reservas.map((r) => `${r.clienteDni}|${r.clienteEmail}|${r.reservaHasta}`)).size,
    [reservas]
  );

  const tabs = [
    { id: "reservas", label: "Reservas", badge: cantidadReservas || null },
    { id: "ventas", label: "Ventas", badge: null },
    { id: "zonas", label: "Precios" },
    { id: "evento", label: "Evento" },
    { id: "cuenta", label: "Cuenta", alerta: requiereCambio },
  ];

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="admin__container admin__bar-inner">
          <div>
            <p className="admin__eyebrow">Panel de administración</p>
            <h1>{evento?.nombre ?? "Entradas"}</h1>
          </div>
          <div className="admin__bar-actions">
            <span className="admin__user">{localStorage.getItem("admin-email")}</span>
            <a href="#/" className="btn btn--ghost btn--sm">
              Ver sitio
            </a>
            <button type="button" className="btn btn--ghost btn--sm" onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="admin__container admin__main">
        {loading && (
          <div className="state-box" role="status">
            <div className="spinner" aria-hidden="true" />
          </div>
        )}
        {!loading && error && (
          <div className="state-box" role="alert">
            <p className="notice notice--error">{error}</p>
            <button type="button" className="btn btn--primary" onClick={reintentar}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && !evento && (
          <p className="notice notice--warn">No hay ningún evento activo. Cargá uno en la base de datos.</p>
        )}

        {!loading && !error && evento && (
          <>
            <section className="stats" aria-label="Resumen de ventas">
              <Stat label="Vendidas" value={stats.vendidas} tono="ok" />
              <Stat label="Reservadas" value={stats.reservadas} tono="warn" />
              <Stat label="Disponibles" value={stats.disponibles} />
              <Stat label="Cobrado" value={formatPrice(stats.cobrado)} tono="ok" />
              <Stat label="Por cobrar" value={formatPrice(stats.porCobrar)} tono="warn" />
            </section>

            {errorListas && <p className="notice notice--warn">{errorListas}</p>}

            <nav className="tabs" role="tablist" aria-label="Secciones del panel">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`tab ${tab === t.id ? "tab--active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                  {t.badge ? <span className="tab__badge">{t.badge}</span> : null}
                  {t.alerta ? <span className="tab__dot" aria-label="requiere atención" /> : null}
                </button>
              ))}
            </nav>

            <section className="admin__card" role="tabpanel">
              {tab === "reservas" && <ReservasTab reservas={reservas} onCambio={refrescar} />}
              {tab === "ventas" && <VentasTab ventas={ventas} evento={evento} onCambio={refrescar} />}
              {tab === "zonas" && <ZonasTab evento={evento} zonas={zonas} onCambio={recargarTodo} />}
              {tab === "evento" && <EventoTab evento={evento} onCambio={recargarTodo} />}
              {tab === "cuenta" && (
                <CuentaTab
                  requiereCambio={requiereCambio}
                  onPasswordCambiada={() => {
                    localStorage.removeItem("admin-requiere-cambio");
                    setRequiereCambio(false);
                  }}
                />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminApp() {
  const [logueado, setLogueado] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    document.title = "Administración · Epifanía Dance";
    const alCerrarSesion = () => setLogueado(false);
    window.addEventListener("auth:logout", alCerrarSesion);
    return () => {
      window.removeEventListener("auth:logout", alCerrarSesion);
      document.title = "El Deseo de Existir · Entradas — Epifanía Dance";
    };
  }, []);

  const salir = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin-email");
    localStorage.removeItem("admin-requiere-cambio");
    setLogueado(false);
  };

  if (!logueado) {
    return (
      <AdminLogin onLogin={() => setLogueado(true)} />
    );
  }

  // Se lee al renderizar el panel (justo después de loguearse), no al montar la app.
  const requiereCambio = localStorage.getItem("admin-requiere-cambio") === "1";
  return <Panel requiereCambioInicial={requiereCambio} onLogout={salir} />;
}

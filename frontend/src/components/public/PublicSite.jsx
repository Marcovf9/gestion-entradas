import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEventoData from "../../hooks/useEventoData.js";
import { MAX_SEATS } from "../../config.js";
import { formatPrice } from "../../utils/format.js";
import Navbar from "./Navbar.jsx";
import Hero from "./Hero.jsx";
import HowItWorks from "./HowItWorks.jsx";
import SeatMap from "./SeatMap.jsx";
import Legend from "./Legend.jsx";
import BookingSummary from "./BookingSummary.jsx";
import BookingModal from "./BookingModal.jsx";
import ReservationSuccess from "./ReservationSuccess.jsx";
import InstagramSection from "./InstagramSection.jsx";
import Footer from "./Footer.jsx";

const CLAVE_RESERVA = "reserva-en-curso";

function leerReservaGuardada() {
  try {
    const raw = localStorage.getItem(CLAVE_RESERVA);
    if (!raw) return null;
    const reserva = JSON.parse(raw);
    // Si ya venció hace rato no tiene sentido mostrarla de nuevo.
    if (!reserva?.expiraEn || reserva.expiraEn < Date.now() - 5 * 60 * 1000) {
      localStorage.removeItem(CLAVE_RESERVA);
      return null;
    }
    return reserva;
  } catch {
    return null;
  }
}

function guardarReserva(reserva) {
  try {
    if (reserva) localStorage.setItem(CLAVE_RESERVA, JSON.stringify(reserva));
    else localStorage.removeItem(CLAVE_RESERVA);
  } catch {
    /* sin localStorage, la pantalla funciona igual */
  }
}

export default function PublicSite() {
  const { evento, zonas, butacas, elementos, actualizadoEn, loading, error, recargarButacas, reintentar } = useEventoData();
  const [selectedIds, setSelectedIds] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [reserva, setReserva] = useState(leerReservaGuardada);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const mostrarToast = useCallback((mensaje, tipo = "info") => {
    setToast({ mensaje, tipo });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const zonasPorId = useMemo(() => new Map(zonas.map((z) => [z.id, z])), [zonas]);

  const seleccionadas = useMemo(
    () =>
      butacas
        .filter((b) => selectedIds.includes(b.id))
        .sort((a, b) => a.fila - b.fila || a.columna - b.columna)
        .map((b) => ({ ...b, zona: zonasPorId.get(b.zonaId) })),
    [butacas, selectedIds, zonasPorId]
  );
  const total = seleccionadas.reduce((acc, s) => acc + (s.zona?.precio ?? 0), 0);

  // Estado real de la reserva en curso según el servidor (se actualiza con el refresco de butacas):
  // pendiente de pago, confirmada por el admin, o liberada/vencida.
  const estadoReserva = useMemo(() => {
    // Mientras las butacas cargadas sean anteriores a la reserva, todavía figuran libres: no es "liberada".
    if (!reserva || butacas.length === 0 || actualizadoEn < (reserva.creadaEn ?? 0)) return "pendiente";
    const estados = reserva.seats.map((s) => butacas.find((b) => b.id === s.id)?.estado);
    if (estados.every((e) => e === "VENDIDA")) return "confirmada";
    if (estados.some((e) => e === "RESERVADA")) return "pendiente";
    return "liberada";
  }, [reserva, butacas, actualizadoEn]);

  // Si alguien más ocupa una butaca que yo había elegido, la saco de mi selección.
  useEffect(() => {
    if (selectedIds.length === 0) return;
    const libres = new Set(butacas.filter((b) => b.estado === "DISPONIBLE").map((b) => b.id));
    const perdidas = selectedIds.filter((id) => !libres.has(id));
    if (perdidas.length > 0) {
      setSelectedIds((ids) => ids.filter((id) => libres.has(id)));
      mostrarToast("Alguna de tus butacas se ocupó y la quitamos de tu selección.", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [butacas]);

  const alternarButaca = (seat) => {
    if (selectedIds.includes(seat.id)) {
      setSelectedIds(selectedIds.filter((id) => id !== seat.id));
    } else if (selectedIds.length >= MAX_SEATS) {
      mostrarToast(`Podés reservar hasta ${MAX_SEATS} butacas por vez.`, "error");
    } else {
      setSelectedIds([...selectedIds, seat.id]);
    }
  };

  const reservaExitosa = ({ seats, segundosRestantes, cliente }) => {
    const ahora = Date.now();
    const nueva = { seats, cliente, creadaEn: ahora, expiraEn: ahora + segundosRestantes * 1000 };
    guardarReserva(nueva);
    setReserva(nueva);
    setSelectedIds([]);
    setMostrarForm(false);
    recargarButacas().catch(() => {});
    window.scrollTo({ top: 0 });
  };

  const conflicto = (idsEnConflicto, mensaje) => {
    setMostrarForm(false);
    setSelectedIds((ids) => ids.filter((id) => !idsEnConflicto.includes(id)));
    recargarButacas().catch(() => {});
    mostrarToast(mensaje || "Alguna butaca ya no está disponible.", "error");
  };

  const nuevaReserva = () => {
    guardarReserva(null);
    setReserva(null);
    recargarButacas().catch(() => {});
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="site">
      <Navbar evento={evento} />

      {reserva ? (
        <main>
          <ReservationSuccess reserva={reserva} evento={evento} estado={estadoReserva} onNueva={nuevaReserva} />
        </main>
      ) : (
        <main>
          <Hero evento={evento} zonas={zonas} />
          <HowItWorks />

          <section id="butacas" className="section">
            <div className="container">
              <h2 className="section__title">Elegí tus butacas</h2>
              <p className="section__lead">
                Plano de la Sala Mayor visto desde la platea. La numeración va de izquierda a derecha.
              </p>

              {loading && (
                <div className="state-box" role="status">
                  <div className="spinner" aria-hidden="true" />
                  <p>Cargando el plano de butacas…</p>
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
                <p className="notice notice--info">Por el momento no hay entradas a la venta. ¡Volvé pronto!</p>
              )}

              {!loading && !error && evento && (
                <div className="booking">
                  <div className="booking__map">
                    <SeatMap
                      butacas={butacas}
                      zonas={zonas}
                      elementos={elementos}
                      selectedIds={selectedIds}
                      onToggle={alternarButaca}
                    />
                  </div>
                  <div className="booking__side">
                    <BookingSummary
                      seats={seleccionadas}
                      total={total}
                      onRemove={(id) => setSelectedIds(selectedIds.filter((x) => x !== id))}
                      onClear={() => setSelectedIds([])}
                      onContinue={() => setMostrarForm(true)}
                    />
                  </div>
                  <div className="booking__legend">
                    <Legend zonas={zonas} butacas={butacas} />
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      <InstagramSection />

      <Footer evento={evento} />

      {!reserva && seleccionadas.length > 0 && !mostrarForm && (
        <div className="mobilebar" role="region" aria-label="Resumen de tu selección">
          <div>
            <strong>
              {seleccionadas.length} {seleccionadas.length === 1 ? "butaca" : "butacas"}
            </strong>
            <span>{formatPrice(total)}</span>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setMostrarForm(true)}>
            Continuar
          </button>
        </div>
      )}

      {mostrarForm && (
        <BookingModal
          seats={seleccionadas}
          total={total}
          onClose={() => setMostrarForm(false)}
          onReserved={reservaExitosa}
          onConflict={conflicto}
        />
      )}

      {toast && (
        <div className={`toast ${toast.tipo === "error" ? "toast--error" : ""}`} role="status">
          {toast.mensaje}
        </div>
      )}
    </div>
  );
}

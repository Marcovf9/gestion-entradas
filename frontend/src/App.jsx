import React, { useState } from "react";
import SeatMap from "./components/SeatMap.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import { FaCog, FaWhatsapp } from "react-icons/fa";

const API_BASE = "http://localhost:4000/api";
const WHATSAPP_PHONE = "5493515073081"; // <-- número de contacto

export default function App() {
  const [selection, setSelection] = useState({ seats: [], total: 0 });
  const [form, setForm] = useState({ nombre: "", dni: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [mode, setMode] = useState("publico"); // "publico" | "admin"
  const [adminLogged, setAdminLogged] = useState(false);
  const [adminPass, setAdminPass] = useState("");

  const canSubmit =
    selection.seats.length > 0 &&
    form.nombre.trim() &&
    form.dni.trim() &&
    form.email.trim() &&
    !submitting;

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  /** --- Generar reserva y abrir WhatsApp --- */
  const handleReserve = async () => {
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const payload = {
        seatIds: selection.seats.map((s) => s.id),
        nombre: form.nombre.trim(),
        dni: form.dni.trim(),
        email: form.email.trim(),
      };

      const res = await fetch(`${API_BASE}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar la reserva");

      const lineas = [];
      lineas.push("Hola 👋, quiero pagar mi reserva para *Latidos de la Historia*.");
      lineas.push("");
      lineas.push(`Nombre: ${form.nombre}`);
      lineas.push(`DNI: ${form.dni}`);
      lineas.push(`Email: ${form.email}`);
      lineas.push("");
      lineas.push("Butacas:");
      selection.seats.forEach((s) =>
        lineas.push(`- Zona: ${s.zonaNombre} | Fila ${s.fila}, Asiento ${s.columna} ($${s.precio})`)
      );
      lineas.push("");
      lineas.push(`*Total:* $${selection.total.toLocaleString("es-AR")}`);
      lineas.push("");
      lineas.push("¿Podrías pasarme los datos para realizar el pago? 🙏");

      const text = encodeURIComponent(lineas.join("\n"));
      window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${text}`, "_blank");

      setSelection({ seats: [], total: 0 });
      setReloadKey((k) => k + 1);
    } catch (err) {
      alert(err.message || "No se pudo generar la reserva.");
    } finally {
      setSubmitting(false);
    }
  };

  /** --- Validar login de administrador --- */
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const CLAVE = "latidos3260"; 
    if (adminPass === CLAVE) {
      setAdminLogged(true);
      setAdminPass("");
    } else {
      alert("Contraseña incorrecta");
    }
  };

  /** --- Cerrar sesión de administrador --- */
  const handleLogout = () => {
    setAdminLogged(false);
    setMode("publico");
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="text-3xl font-bold text-red-600 tracking-wide text-center">
            Latidos de la Historia
          </h1>
        </div>

      </header>
      
        {/* Botón flotante administrador */}
      {mode === "publico" && (
        <button
          className="fixed bottom-5 right-5 bg-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center opacity-70 hover:opacity-100 shadow-lg hover:scale-110 transition-all duration-200"
          title="Modo administrador"
          onClick={() => setMode("admin")}
        >
          <FaCog className="text-xl" />
        </button>
      )}

      {mode === "publico" ? (
        <main className="layout">
          <section className="theatre-card">
            <SeatMap onSelectionChange={setSelection} reloadKey={reloadKey} />
          </section>

          <aside className="summary-card">
            <h2>Resumen de Reserva</h2>
            <p className="summary-counter">
              Butacas seleccionadas: {selection.seats.length}
            </p>
            <p className="summary-total">
              Total: ${selection.total.toLocaleString("es-AR")}
            </p>

            <div className="summary-contact">
              <label>
                Nombre y Apellido
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={form.nombre}
                  onChange={handleChange("nombre")}
                />
              </label>
              <label>
                DNI
                <input
                  type="text"
                  placeholder="Tu DNI"
                  value={form.dni}
                  onChange={handleChange("dni")}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </label>
            </div>

            <button
              className="btn-primary"
              disabled={!canSubmit}
              onClick={handleReserve}
            >
              {submitting ? "Generando reserva..." : "Reservar y pagar por WhatsApp"}
            </button>
            <p className="summary-note">
              Las butacas se reservan por 30 minutos. Si no se registra el pago,
              vuelven a estar disponibles automáticamente.
            </p>
          </aside>
        </main>
      ) : (
        <main className="layout">
          <section className="theatre-card" style={{ width: "100%" }}>
            {!adminLogged ? (
              <form
                onSubmit={handleAdminLogin}
                className="admin-login bg-white shadow-md rounded-xl p-6 max-w-sm mx-auto text-center"
              >
                <h2 className="text-xl font-semibold mb-3 text-gray-700">
                  Acceso Administrador
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Ingresá la contraseña para confirmar pagos.
                </p>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full border rounded-lg px-3 py-2 mb-4 text-center"
                />
                <button
                  type="submit"
                  className="btn-primary w-full py-2 font-semibold"
                >
                  Ingresar
                </button>
              </form>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Panel de Administración
                  </h2>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 underline"
                  >
                    Cerrar sesión
                  </button>
                </div>
                <AdminPanel />
              </>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

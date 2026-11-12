import React, { useEffect, useState } from "react";
import PublicSite from "./components/public/PublicSite.jsx";
import AdminApp from "./components/admin/AdminApp.jsx";

const esRutaAdmin = () => window.location.hash.startsWith("#/admin");

/**
 * Dos "páginas" con ruteo por hash (no necesita configuración especial del
 * hosting): el sitio público de venta y el panel de administración (#/admin).
 * Los links internos del sitio (#butacas, #como-comprar) no cambian de página.
 */
export default function App() {
  const [admin, setAdmin] = useState(esRutaAdmin());

  useEffect(() => {
    const onHash = () => setAdmin(esRutaAdmin());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return admin ? <AdminApp /> : <PublicSite />;
}

import React, { useState } from "react";
import { FaLock } from "react-icons/fa";
import api from "../../services/api.js";
import { mensajeDeError } from "../../utils/format.js";

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email: form.email.trim(), password: form.password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin-email", res.data.email);
      if (res.data.requiereCambioPassword) localStorage.setItem("admin-requiere-cambio", "1");
      else localStorage.removeItem("admin-requiere-cambio");
      onLogin({ requiereCambioPassword: !!res.data.requiereCambioPassword });
    } catch (err) {
      setError(
        err.response?.status === 401 ? "Email o contraseña incorrectos." : mensajeDeError(err, "No pudimos iniciar sesión.")
      );
      setEnviando(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={enviar}>
        <span className="admin-login__icon" aria-hidden="true">
          <FaLock />
        </span>
        <h1>Administración</h1>
        <p>Ingresá con tu cuenta para gestionar reservas y ventas.</p>

        <div className="form-grid">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>
        </div>

        {error && (
          <p className="notice notice--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn--primary btn--block" disabled={enviando}>
          {enviando ? "Ingresando…" : "Ingresar"}
        </button>
        <a href="#/" className="admin-login__back">
          ← Volver al sitio
        </a>
      </form>
    </div>
  );
}

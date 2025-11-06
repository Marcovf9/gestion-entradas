/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Asegura que escanea todos tus archivos de componentes
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  safelist: [
    // Clases CSS de Layout (index.css) - CRÍTICAS para el diseño 3x3
    "seat-zones-grid",
    "seat-zone-container",

    // Clases de Posicionamiento (index.css) - CRÍTICAS para el diseño 3x3
    "zone-top-left",
    "zone-top-center",
    "zone-top-right",
    "zone-middle-left",
    "zone-middle-center",
    "zone-middle-right",
    "zone-bottom-left",
    "zone-bottom-center",
    "zone-bottom-right",

    // Clases de Rotación (útiles para la perspectiva de los palcos)
    "rotate-[-5deg]",
    "rotate-[5deg]",
    "rotate-[-10deg]",
    "rotate-[10deg]",
    "rotate-[-15deg]",
    "rotate-[15deg]",
  ],
  plugins: [],
};
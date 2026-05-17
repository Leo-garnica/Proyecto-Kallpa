/**
 * calculos.js
 * Motor de cálculo de KPIs financieros para FundacionKallpa.
 */

export const COLORS = {
  emerald: { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7", chart: "#10b981" },
  amber:   { bg: "#fffbeb", text: "#78350f", border: "#fcd34d", chart: "#f59e0b" },
  red:     { bg: "#fef2f2", text: "#7f1d1d", border: "#fca5a5", chart: "#ef4444" },
  blue:    { bg: "#eff6ff", text: "#1e3a5f", border: "#93c5fd", chart: "#3b82f6" },
  violet:  { bg: "#f5f3ff", text: "#3b0764", border: "#c4b5fd", chart: "#8b5cf6" },
  slate:   { bg: "#f8fafc", text: "#0f172a", border: "#cbd5e1", chart: "#64748b" },
};

export const CATEGORIES_NEGOCIO = ["Alimentos", "Artesanías", "Servicios", "Tecnología", "Moda", "Salud", "Educación", "Otro"];
export const CATEGORIES_COSTO   = ["Infraestructura", "Servicios", "Personal", "Equipos", "Materia Prima", "Marketing", "Logística", "Otro"];

export const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const formatBs = (n) => {
  if (isNaN(n) || n === null) return "Bs. 0.00";
  return "Bs. " + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const fmt = (valor) =>
  Number(valor).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const crearProducto = (name = "") => ({
  id: genId(),
  name: name || "Nuevo Producto",
  descripcion: "",
  categoria: "Otro",
  produccion: 100,
  ventas: 80,
  precioActual: 0,
  unidad: "unidades",
  margen: 30,
  costosF: [],
  costosV: [],
});

export const crearCostoFijo = () => ({
  id: genId(),
  nombre: "",
  descripcion: "",
  monto: 0,
  categoria: "Otro",
});

export const crearCostoVariable = () => ({
  id: genId(),
  nombre: "",
  descripcion: "",
  monto: 0,
  categoria: "Otro",
  cantUnidad: 1,
});

export const calcular = (producto) => {
  const cf  = (producto.costosF || []).reduce((s, c) => s + (parseFloat(c.monto) || 0), 0);
  const cv  = (producto.costosV || []).reduce((s, c) => s + (parseFloat(c.monto) || 0) * (parseFloat(c.cantUnidad) || 1), 0);
  const ct  = cf + cv;
  const prod = parseFloat(producto.produccion) || 1;
  const cu  = ct / prod;
  const margen     = parseFloat(producto.margen) || 0;
  const pSugerido  = cu * (1 + margen / 100);
  const pActual    = parseFloat(producto.precioActual) || 0;
  const ganancia   = pActual > 0 ? pActual - cu : pSugerido - cu;
  const margenReal = pActual > 0 ? ((pActual - cu) / pActual) * 100 : margen;
  const cvUnitario = cv / prod;
  const pv = pActual > 0 ? pActual : pSugerido;
  const pe = (pv > cvUnitario) ? cf / (pv - cvUnitario) : 0;
  return {
    cf, cv, ct, cu, pSugerido, ganancia, margenReal, pe,
    cvUnitario, cvu: cvUnitario, ctu: cu,
    q: pe > 0 ? pe : null, pv, volumen: prod,
  };
};

export const calcularKPIs = (producto) => calcular(producto);

export const salud = (metrics) => {
  if (metrics.margenReal >= 25) return { color: "emerald", icon: "check", msg: "¡Tu producto parece rentable! Vas por buen camino." };
  if (metrics.margenReal >= 10) return { color: "amber",   icon: "warn",  msg: "Margen ajustado. Considera reducir costos o subir precio." };
  return { color: "red", icon: "alert", msg: "Margen muy bajo o negativo. Revisa tus costos urgente." };
};

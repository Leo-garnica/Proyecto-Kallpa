# Plan de Negocios y Costos — empleaemprende.bo

Módulo web para que emprendedores ingresen datos financieros, calculen KPIs automáticamente y exporten reportes en Excel y PDF.

---

## Tecnologías

| Herramienta     | Versión  | Uso                          |
|-----------------|----------|------------------------------|
| React           | 18       | Framework UI                 |
| Vite            | 5        | Bundler / Dev server         |
| Tailwind CSS    | 3        | Estilos                      |
| SheetJS (xlsx)  | 0.18.5   | Exportación a Excel          |
| jsPDF           | 2.5.1    | Exportación a PDF            |

---

## Instalación y ejecución

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173`

### 3. Generar build de producción

```bash
npm run build
npm run preview
```

---

## Estructura del proyecto

```
plan-negocios/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx              # Punto de entrada
    ├── App.jsx               # Componente raíz
    ├── index.css             # Estilos globales + Tailwind
    ├── hooks/
    │   └── useEmpresa.js     # Estado global con useReducer
    ├── components/
    │   ├── FilaCosto.jsx       # Fila dinámica de costo (fijo o variable)
    │   ├── TarjetaProducto.jsx # Card completa de un producto
    │   ├── PanelKPIs.jsx       # Indicadores calculados en tiempo real
    │   └── PanelExportacion.jsx# Botones de exportación
    └── utils/
        ├── calculos.js         # Motor de KPIs y utilidades
        ├── exportarExcel.js    # Lógica de exportación xlsx
        └── exportarPDF.js      # Lógica de exportación PDF
```

---

## Fórmulas aplicadas

| KPI                        | Fórmula                              |
|----------------------------|--------------------------------------|
| Costo Fijo Total (CF)      | Σ montos de costos fijos             |
| Costo Variable Unitario    | Σ costos unitarios variables         |
| Costo Total Unitario (CTU) | (CF ÷ volumen) + CVU                 |
| Margen de Ganancia         | PV − CTU                             |
| Punto de Equilibrio (Q)    | CF ÷ (PV − CVU)  *si PV > CVU*      |

> Si `PV ≤ CVU`, el punto de equilibrio es inalcanzable y se muestra una advertencia.

---

## Funcionalidades

- ✅ Empresa con nombre y representante
- ✅ Múltiples productos por empresa
- ✅ Costos fijos dinámicos (agregar / eliminar filas)
- ✅ Costos variables dinámicos
- ✅ Cálculo de KPIs en tiempo real
- ✅ Advertencia de punto de equilibrio inalcanzable
- ✅ Exportación a Excel (.xlsx) — una hoja por producto
- ✅ Exportación a PDF (ficha técnica con paginación automática)
- ✅ Diseño Mobile-First con Tailwind CSS
- ✅ Estado gestionado con `useReducer`

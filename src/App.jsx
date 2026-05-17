/**
 * App.jsx
 * Componente raíz de FinanzasClara.
 * Arquitectura del ZIP + diseño/funcionalidad completa del JSX.
 *
 * Estructura:
 *  1. Header con logo + datos del negocio (colapsable)
 *  2. Selector de productos
 *  3. TarjetaProducto activa (tabs: Producto / Costos / Métricas)
 *  4. Panel de comparación (si hay ≥2 productos)
 *  5. Panel de exportación
 *  6. ChatAssistant flotante (IA + TTS)
 */
import React, { useState, useEffect } from 'react'
import { PlusCircle, X, BarChart3 } from 'lucide-react'
import { useEmpresa } from './hooks/useEmpresa.js'
import { CATEGORIES_NEGOCIO, COLORS, calcular, salud } from './utils/calculos.js'
import TarjetaProducto  from './components/TarjetaProducto.jsx'
import PanelComparar    from './components/PanelComparar.jsx'
import PanelExportacion from './components/PanelExportacion.jsx'
import ChatAssistant    from './components/ChatAssistant.jsx'

const App = () => {
  const { empresa, acciones } = useEmpresa()
  const [activeIdx, setActiveIdx]           = useState(0)
  const [negocioExpanded, setNegocioExpanded] = useState(false)
  const [showComparar, setShowComparar]       = useState(false)
  const [chartLoaded, setChartLoaded]         = useState(false)

  // Cargar Chart.js desde CDN
  useEffect(() => {
    if (window.Chart) { setChartLoaded(true); return }
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    s.onload = () => setChartLoaded(true)
    document.head.appendChild(s)
    if (window.speechSynthesis) window.speechSynthesis.getVoices()
  }, [])

  const productos  = empresa.productos
  const prod       = productos[activeIdx] || productos[0]
  const metrics    = prod ? calcular(prod) : null

  const addProducto = () => {
    acciones.agregarProducto()
    setActiveIdx(productos.length)
  }

  const delProducto = (id, i) => {
    if (productos.length <= 1) return
    acciones.eliminarProducto(id)
    setActiveIdx(Math.max(0, activeIdx - (i <= activeIdx ? 1 : 0)))
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', fontSize: 14, padding: '9px 12px',
    border: '1px solid #e2e8f0', borderRadius: 8,
    background: 'transparent', color: 'inherit', outline: 'none', fontFamily: 'inherit',
  }

  const updNegocio = (campo, valor) => {
    if (campo === 'nombre')        acciones.setNombre(valor)
    else if (campo === 'representante') acciones.setRepresentante(valor)
  }

  return (
    <div style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4ff 100%)', paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', padding: '20px 16px 0', color: 'white' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            {/* Logo + título */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, flexShrink: 0 }}>
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <rect width="48" height="48" rx="12" fill="url(#logoGrad)" />
                  <path d="M12 34 L18 22 L24 28 L30 18 L36 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="36" cy="14" r="3" fill="#fbbf24" />
                  <rect x="12" y="36" width="6" height="6" rx="2" fill="#a5b4fc" opacity="0.7"/>
                  <rect x="21" y="30" width="6" height="12" rx="2" fill="#a5b4fc" opacity="0.85"/>
                  <rect x="30" y="24" width="6" height="18" rx="2" fill="#a5b4fc"/>
                  <defs>
                    <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
                      <stop offset="0%"   stopColor="#6d28d9"/>
                      <stop offset="100%" stopColor="#1e1b4b"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>FinanzasClara</h1>
                <p style={{ margin: 0, fontSize: 12, color: '#c4b5fd', lineHeight: 1.3 }}>Comprende tus costos · Define tu precio · Conoce tu ganancia</p>
              </div>
            </div>

            {/* Toggle datos del negocio */}
            <button
              onClick={() => setNegocioExpanded((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#ffffff15', border: '1px solid #ffffff25', borderRadius: 10, padding: '7px 14px', color: '#e0e7ff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span style={{ fontSize: 16 }}>🏪</span>
              {empresa.nombre || 'Mi Negocio'}
              <span style={{ fontSize: 10, transform: negocioExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
            </button>
          </div>

          {/* Datos del negocio colapsables */}
          {negocioExpanded && (
            <div className="grid-negocio" style={{ marginBottom: 16, alignItems: 'end', paddingBottom: 16, borderTop: '1px solid #ffffff15', paddingTop: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#a5b4fc', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nombre del negocio</label>
                <input style={{ ...inputStyle, background: '#ffffff18', border: '1px solid #ffffff30', color: 'white' }}
                  value={empresa.nombre} onChange={(e) => updNegocio('nombre', e.target.value)} placeholder="ej. Panadería La Esperanza" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#a5b4fc', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Representante</label>
                <input style={{ ...inputStyle, background: '#ffffff18', border: '1px solid #ffffff30', color: 'white' }}
                  value={empresa.representante} onChange={(e) => updNegocio('representante', e.target.value)} placeholder="ej. María Quispe" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 12px' }}>

        {/* Selector de productos */}
        <div style={{ marginTop: 20, background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '14px 16px', boxShadow: '0 1px 6px #0000000a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Productos</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {productos.length >= 2 && (
                <button
                  onClick={() => setShowComparar((v) => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#3b82f6', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
                >
                  <BarChart3 size={13} /> {showComparar ? 'Ocultar' : 'Comparar'}
                </button>
              )}
              <button
                onClick={addProducto}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#8b5cf6', background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
              >
                <PlusCircle size={13} /> Agregar producto
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {productos.map((p, i) => {
              const m = calcular(p)
              const h = salud(m)
              const isActive = i === activeIdx
              return (
                <div
                  key={p.id}
                  onClick={() => { setActiveIdx(i); setShowComparar(false) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, cursor: 'pointer', border: isActive ? '2px solid #8b5cf6' : '1px solid #e2e8f0', background: isActive ? '#f5f3ff' : '#f8fafc', transition: 'all 0.15s' }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[h.color].chart, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#5b21b6' : '#334155', whiteSpace: 'nowrap' }}>
                    {p.name || 'Producto'}
                  </span>
                  {productos.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); delProducto(p.id, i) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, marginLeft: 2, borderRadius: 4, display: 'flex' }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel de comparación */}
        {showComparar && (
          <div style={{ marginTop: 16 }}>
            <PanelComparar
              productos={productos}
              activeIdx={activeIdx}
              setActiveIdx={(i) => { setActiveIdx(i); setShowComparar(false) }}
              chartLoaded={chartLoaded}
            />
          </div>
        )}

        {/* Tarjeta del producto activo */}
        {prod && !showComparar && (
          <div style={{ marginTop: 16 }}>
            <TarjetaProducto
              producto={prod}
              acciones={acciones}
              chartLoaded={chartLoaded}
            />
          </div>
        )}

        {/* Panel de exportación */}
        {productos.length > 0 && (
          <PanelExportacion empresa={empresa} />
        )}

        {/* Resetear */}
        {productos.length > 0 && (
          <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 24 }}>
            <button
              style={{ fontSize: 11, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
              onClick={() => { if (window.confirm('¿Borrar todos los datos?')) { acciones.resetear(); setActiveIdx(0) } }}
            >
              Reiniciar formulario
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 8, paddingBottom: 16 }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>💾 Datos guardados automáticamente · FinanzasClara</span>
        </div>
      </div>

      {/* Asistente IA flotante */}
      {prod && metrics && (
        <ChatAssistant producto={prod} metrics={metrics} negocio={empresa} />
      )}
    </div>
  )
}

export default App

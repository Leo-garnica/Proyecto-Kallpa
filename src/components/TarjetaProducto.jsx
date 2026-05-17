/**
 * TarjetaProducto.jsx
 * Tarjeta de producto con tabs: Producto / Costos / Métricas
 * Diseño responsive (móvil + laptop)
 */
import React, { useState, useEffect } from 'react'
import { Package, Layers, TrendingUp } from 'lucide-react'
import { CATEGORIES_NEGOCIO, calcular } from '../utils/calculos.js'
import TablaCostos from './TablaCostos.jsx'
import PanelKPIs   from './PanelKPIs.jsx'

const TABS = [
  { id: 'info',     label: 'Producto', icon: Package    },
  { id: 'costos',   label: 'Costos',   icon: Layers     },
  { id: 'metricas', label: 'Métricas', icon: TrendingUp },
]

const TarjetaProducto = ({ producto, acciones, chartLoaded }) => {
  const [tab, setTab] = useState('info')
  const metrics = calcular(producto)
  const pid = producto.id

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', fontSize: 14, padding: '9px 12px',
    border: '1px solid #e2e8f0', borderRadius: 8, background: 'transparent',
    color: 'inherit', outline: 'none', fontFamily: 'inherit',
  }
  const labelStyle = {
    fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4,
    display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em',
  }

  const upd = (campo, valor) => acciones.actualizarProducto(pid, campo, valor)

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px #0000000d', overflow: 'hidden', marginBottom: 16 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', padding: '0 16px', overflowX: 'auto' }}>
        {TABS.map((t) => {
          const Icon = t.icon
          const isA = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="tab-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '14px 16px', fontSize: 13,
                fontWeight: isA ? 700 : 500,
                color: isA ? '#8b5cf6' : '#94a3b8',
                background: 'none', border: 'none',
                borderBottom: isA ? '2px solid #8b5cf6' : '2px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
                fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          )
        })}
      </div>

      <div className="card-pad">

        {/* TAB: INFO */}
        {tab === 'info' && (
          <div>
            <div className="grid-2col" style={{ marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Nombre del producto</label>
                <input style={inputStyle} value={producto.name} onChange={(e) => upd('name', e.target.value)} placeholder="ej. Empanadas de queso" />
              </div>
              <div>
                <label style={labelStyle}>Descripción</label>
                <input style={inputStyle} value={producto.descripcion} onChange={(e) => upd('descripcion', e.target.value)} placeholder="Descripción breve" />
              </div>
              <div>
                <label style={labelStyle}>Categoría</label>
                <select style={inputStyle} value={producto.categoria} onChange={(e) => upd('categoria', e.target.value)}>
                  {CATEGORIES_NEGOCIO.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Unidad de medida</label>
                <select style={inputStyle} value={producto.unidad} onChange={(e) => upd('unidad', e.target.value)}>
                  {['unidades', 'kilos', 'docenas', 'paquetes', 'litros', 'porciones'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Producción estimada ({producto.unidad})</label>
                <input style={inputStyle} type="number" min="1" value={producto.produccion} onChange={(e) => upd('produccion', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Ventas estimadas ({producto.unidad})</label>
                <input style={inputStyle} type="number" min="0" value={producto.ventas} onChange={(e) => upd('ventas', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Precio actual de venta (Bs.)</label>
                <input style={inputStyle} type="number" min="0" step="0.01" value={producto.precioActual || ''} onChange={(e) => upd('precioActual', e.target.value)} placeholder="0.00 — dejar en 0 para usar precio sugerido" />
              </div>
              <div>
                <label style={labelStyle}>Margen deseado (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="range" min="0" max="200" step="1" value={producto.margen} onChange={(e) => upd('margen', e.target.value)} style={{ flex: 1 }} />
                  <input style={{ ...inputStyle, width: 70, flexShrink: 0 }} type="number" min="0" max="200" value={producto.margen} onChange={(e) => upd('margen', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Resumen rápido */}
            <div className="resumen-rapido" style={{ marginTop: 8, padding: '14px 16px', background: '#f5f3ff', borderRadius: 12, border: '1px solid #ddd6fe' }}>
              {[
                ['Costo Unitario',    `Bs. ${metrics.cu.toFixed(2)}`],
                ['Precio Sugerido',   `Bs. ${metrics.pSugerido.toFixed(2)}`],
                ['Margen Real',       `${metrics.margenReal.toFixed(1)}%`],
                ['Punto de Equilibrio', `${Math.ceil(metrics.pe)} ${producto.unidad}`],
              ].map(([label, val]) => (
                <div key={label} style={{ textAlign: 'center', minWidth: 100 }}>
                  <div style={{ fontSize: 10, color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#3b0764' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: COSTOS */}
        {tab === 'costos' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={16} color="#8b5cf6" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Costos Fijos</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Gastos que existen aunque no produzcas nada (alquiler, internet, salarios…)</p>
                </div>
              </div>
              <TablaCostos costos={producto.costosF || []} tipo="F" productoId={pid} acciones={acciones} />
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Layers size={16} color="#3b82f6" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Costos Variables</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Dependen de cuánto produces (harina, empaques, materia prima…)</p>
                </div>
              </div>
              <TablaCostos costos={producto.costosV || []} tipo="V" productoId={pid} acciones={acciones} />
            </div>
          </div>
        )}

        {/* TAB: MÉTRICAS */}
        {tab === 'metricas' && (
          <PanelKPIs metrics={metrics} producto={producto} chartLoaded={chartLoaded} />
        )}
      </div>
    </div>
  )
}

export default TarjetaProducto

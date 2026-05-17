/**
 * PanelComparar.jsx
 * Tabla comparativa de todos los productos — del JSX original.
 */
import React from 'react'
import { BarChart3 } from 'lucide-react'
import { COLORS, calcular, salud, formatBs } from '../utils/calculos.js'
import { BarChart } from './PanelKPIs.jsx'

const PanelComparar = ({ productos, activeIdx, setActiveIdx, chartLoaded }) => {
  if (productos.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
        <BarChart3 size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#64748b' }}>
          Agrega al menos 2 productos para comparar
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px #0000000d', padding: '24px', marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Comparación de productos</h3>
      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Producto', 'C. Fijos', 'C. Variables', 'Costo Unit.', 'Precio Sug.', 'Margen', 'P. Equilibrio', 'Salud'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productos.map((p, i) => {
              const m = calcular(p)
              const h = salud(m)
              return (
                <tr
                  key={p.id}
                  style={{ borderBottom: '1px solid #f1f5f9', background: i === activeIdx ? '#faf5ff' : 'transparent', cursor: 'pointer' }}
                  onClick={() => setActiveIdx(i)}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>{p.name}</td>
                  <td style={{ padding: '10px 12px', color: '#8b5cf6', fontWeight: 600 }}>{formatBs(m.cf)}</td>
                  <td style={{ padding: '10px 12px', color: '#3b82f6', fontWeight: 600 }}>{formatBs(m.cv)}</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{formatBs(m.cu)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#065f46' }}>{formatBs(m.pSugerido)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: m.margenReal >= 20 ? '#065f46' : m.margenReal >= 8 ? '#78350f' : '#7f1d1d' }}>
                    {m.margenReal.toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{Math.ceil(m.pe)} {p.unidad}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: COLORS[h.color].bg, color: COLORS[h.color].text, border: `1px solid ${COLORS[h.color].border}` }}>
                      {h.color === 'emerald' ? 'Rentable' : h.color === 'amber' ? 'Ajustado' : 'Riesgo'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {chartLoaded && (
        <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            {[['#8b5cf6', 'Costo Total'], ['#10b981', 'Ingresos Proy.']].map(([c, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
              </span>
            ))}
          </div>
          <div style={{ height: 240, position: 'relative' }}>
            <BarChart productos={productos} calcular={calcular} />
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelComparar

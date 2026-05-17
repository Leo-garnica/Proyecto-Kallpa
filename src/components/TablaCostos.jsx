/**
 * TablaCostos.jsx
 * Tabla dinámica de costos (fijos o variables) — diseño del JSX original.
 */
import React from 'react'
import { PlusCircle, Trash2 } from 'lucide-react'
import { CATEGORIES_COSTO, formatBs } from '../utils/calculos.js'

const TablaCostos = ({ costos, tipo, productoId, acciones }) => {
  const esFijo = tipo === 'F'

  const addRow = () =>
    esFijo ? acciones.agregarCostoFijo(productoId) : acciones.agregarCostoVar(productoId)

  const del = (id) =>
    esFijo ? acciones.eliminarCostoFijo(productoId, id) : acciones.eliminarCostoVar(productoId, id)

  const upd = (id, campo, valor) =>
    esFijo
      ? acciones.actualizarCostoFijo(productoId, id, campo, valor)
      : acciones.actualizarCostoVar(productoId, id, campo, valor)

  const subtotal = esFijo
    ? costos.reduce((s, c) => s + (parseFloat(c.monto) || 0), 0)
    : costos.reduce((s, c) => s + (parseFloat(c.monto) || 0) * (parseFloat(c.cantUnidad) || 1), 0)

  const thStyle = {
    fontSize: 11, color: '#64748b', fontWeight: 600,
    padding: '6px 8px', textAlign: 'left',
    borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
  }
  const tdStyle = { padding: '6px 8px', verticalAlign: 'middle' }
  const inputStyle = {
    width: '100%', fontSize: 13, padding: '5px 8px',
    border: '1px solid #e2e8f0', borderRadius: 6,
    background: 'transparent', color: 'inherit', outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: esFijo ? '#f5f3ff' : '#eff6ff' }}>
              <th style={thStyle}>Nombre</th>
              {esFijo  && <th style={thStyle}>Monto (Bs.)</th>}
              {!esFijo && <th style={thStyle}>Costo Unit.</th>}
              {!esFijo && <th style={thStyle}>Cantidad</th>}
              {!esFijo && <th style={thStyle}>Subtotal</th>}
              <th style={thStyle}>Categoría</th>
              <th style={{ ...thStyle, width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {costos.length === 0 && (
              <tr>
                <td colSpan={esFijo ? 4 : 6} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: '18px 8px', fontSize: 12 }}>
                  Sin costos aún. Agrega uno abajo.
                </td>
              </tr>
            )}
            {costos.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>
                  <input
                    style={inputStyle}
                    value={c.nombre}
                    onChange={(e) => upd(c.id, 'nombre', e.target.value)}
                    placeholder={esFijo ? 'ej. Alquiler' : 'ej. Harina'}
                  />
                </td>
                {esFijo && (
                  <td style={tdStyle}>
                    <input
                      style={{ ...inputStyle, width: 90 }}
                      type="number" min="0"
                      value={c.monto || ''}
                      onChange={(e) => upd(c.id, 'monto', e.target.value)}
                      placeholder="0"
                    />
                  </td>
                )}
                {!esFijo && (
                  <>
                    <td style={tdStyle}>
                      <input
                        style={{ ...inputStyle, width: 80 }}
                        type="number" min="0"
                        value={c.monto || ''}
                        onChange={(e) => upd(c.id, 'monto', e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        style={{ ...inputStyle, width: 70 }}
                        type="number" min="0"
                        value={c.cantUnidad || ''}
                        onChange={(e) => upd(c.id, 'cantUnidad', e.target.value)}
                        placeholder="1"
                      />
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#3b82f6', whiteSpace: 'nowrap' }}>
                      Bs. {((parseFloat(c.monto) || 0) * (parseFloat(c.cantUnidad) || 1)).toFixed(2)}
                    </td>
                  </>
                )}
                <td style={tdStyle}>
                  <select
                    style={{ ...inputStyle, width: 110 }}
                    value={c.categoria}
                    onChange={(e) => upd(c.id, 'categoria', e.target.value)}
                  >
                    {CATEGORIES_COSTO.map((cat) => <option key={cat}>{cat}</option>)}
                  </select>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => del(c.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, borderRadius: 4 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <button
          onClick={addRow}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
            color: esFijo ? '#8b5cf6' : '#3b82f6',
            background: 'none',
            border: `1px dashed ${esFijo ? '#c4b5fd' : '#93c5fd'}`,
            borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 500,
            fontFamily: 'inherit',
          }}
        >
          <PlusCircle size={14} /> Agregar fila
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
          Total:{' '}
          <span style={{ color: esFijo ? '#8b5cf6' : '#3b82f6' }}>{formatBs(subtotal)}</span>
        </span>
      </div>
    </div>
  )
}

export default TablaCostos

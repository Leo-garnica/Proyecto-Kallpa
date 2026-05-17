/**
 * CalculadoraInsumos.jsx
 * Calculadora de Costo Variable Unitario por insumo.
 *
 * Flujo:
 *  1. Usuario define la producción obtenida (cantidad + unidad)
 *  2. Agrega insumos con: nombre, presentación, unidad, cant. presentación,
 *     cant. usada y precio de la presentación
 *  3. El CVU de cada insumo se calcula automáticamente:
 *     CVU = (precio / cantPresentación × cantUsada) / producción
 *  4. Botón "Agregar CVU a costos variables" inyecta los insumos
 *     directamente en la tabla de costos variables del producto activo.
 */
import React, { useState } from 'react'
import {
  PlusCircle, Trash2, FlaskConical, ChevronDown, ChevronUp,
  ArrowDownToLine, CheckCircle,
} from 'lucide-react'
import { formatBs } from '../utils/calculos.js'

const UNIDADES_INSUMO = [
  'unidades', 'kg', 'g', 'lb', 'oz',
  'litros', 'ml', 'metros', 'cm',
  'docenas', 'paquetes', 'cajas', 'bolsas', 'porciones',
]

const newInsumo = () => ({
  id: Date.now() + Math.random(),
  nombre: '',
  presentacion: '',
  unidad: 'unidades',
  cantidadPresentacion: 1,
  cantidadUsada: 1,
  precio: 0,
})

const CalculadoraInsumos = ({ productoId, produccionUnidad, acciones }) => {
  const [open, setOpen] = useState(false)
  const [produccion, setProduccion] = useState({
    cantidad: 1,
    unidad: produccionUnidad || 'unidades',
  })
  const [insumos, setInsumos] = useState([newInsumo()])
  const [importado, setImportado] = useState(false)

  const updInsumo = (id, field, val) =>
    setInsumos(prev => prev.map(ins => ins.id === id ? { ...ins, [field]: val } : ins))
  const delInsumo = (id) => setInsumos(prev => prev.filter(ins => ins.id !== id))
  const addInsumo = () => setInsumos(prev => [...prev, newInsumo()])

  // CVU = (precio / cantPresentación × cantUsada) / producción
  const calcCVU = (ins) => {
    const cantPres  = parseFloat(ins.cantidadPresentacion) || 1
    const cantUsada = parseFloat(ins.cantidadUsada) || 0
    const precio    = parseFloat(ins.precio) || 0
    const prod      = parseFloat(produccion.cantidad) || 1
    return (precio / cantPres * cantUsada) / prod
  }

  const totalCVU = insumos.reduce((s, ins) => s + calcCVU(ins), 0)

  const handleImportar = () => {
    const costosGenerados = insumos
      .filter(ins => ins.nombre.trim() !== '' && calcCVU(ins) > 0)
      .map(ins => ({
        id: Date.now() + Math.random(),
        nombre: ins.nombre,
        descripcion: ins.presentacion
          ? `${ins.presentacion} — calculado desde insumos`
          : 'Calculado desde insumos',
        monto: parseFloat(calcCVU(ins).toFixed(4)),
        categoria: 'Materia Prima',
        cantUnidad: 1,
      }))
    if (costosGenerados.length === 0) return
    acciones.agregarCostosVarBulk(productoId, costosGenerados)
    setImportado(true)
    setTimeout(() => setImportado(false), 2500)
  }

  // ── Estilos compartidos ────────────────────────────────────────────────────
  const thS = {
    fontSize: 10, color: '#64748b', fontWeight: 700,
    padding: '7px 8px', textAlign: 'left',
    borderBottom: '1px solid #e2e8f0',
    textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
  }
  const tdS = { padding: '6px 6px', verticalAlign: 'middle' }
  const inpS = {
    width: '100%', fontSize: 12, padding: '5px 7px',
    border: '1px solid #e2e8f0', borderRadius: 6,
    background: 'transparent', color: 'inherit',
    outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{
      marginBottom: 20, borderRadius: 12,
      border: '1.5px dashed #93c5fd', background: '#f0f9ff', overflow: 'hidden',
    }}>
      {/* ── Toggle header ───────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '13px 16px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FlaskConical size={16} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>
              Calculadora de insumos
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              Calcula el CVU de cada insumo automáticamente y agrégalo a tus costos variables
            </div>
          </div>
        </div>
        <div style={{ color: '#3b82f6', flexShrink: 0, marginLeft: 8 }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* ── Contenido expandible ────────────────────────────────────────── */}
      {open && (
        <div style={{ padding: '0 16px 18px' }}>

          {/* Producción obtenida */}
          <div style={{
            background: 'white', borderRadius: 10,
            border: '1px solid #bfdbfe', padding: '12px 14px', marginBottom: 16,
          }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: '#2563eb',
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10,
            }}>
              📦 Producción obtenida con estos insumos
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                  Cantidad producida
                </label>
                <input
                  style={{ ...inpS, fontSize: 14, fontWeight: 700 }}
                  type="number" min="0.01" step="any"
                  value={produccion.cantidad}
                  onChange={e => setProduccion(p => ({ ...p, cantidad: e.target.value }))}
                  placeholder="ej. 50"
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                  Unidad
                </label>
                <select
                  style={inpS}
                  value={produccion.unidad}
                  onChange={e => setProduccion(p => ({ ...p, unidad: e.target.value }))}
                >
                  {UNIDADES_INSUMO.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de insumos */}
          <div style={{
            background: 'white', borderRadius: 10,
            border: '1px solid #bfdbfe', overflow: 'hidden', marginBottom: 14,
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#eff6ff' }}>
                    <th style={thS}>Insumo</th>
                    <th style={thS}>Presentación</th>
                    <th style={thS}>Unidad</th>
                    <th style={{ ...thS, minWidth: 80 }}>Cant. presentación</th>
                    <th style={{ ...thS, minWidth: 80 }}>Cant. usada</th>
                    <th style={{ ...thS, minWidth: 90 }}>Precio pres. (Bs.)</th>
                    <th style={{ ...thS, minWidth: 100, color: '#2563eb' }}>CVU calculado</th>
                    <th style={{ ...thS, width: 32 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ ...tdS, textAlign: 'center', color: '#94a3b8', padding: '18px 8px', fontSize: 12 }}>
                        Agrega un insumo abajo.
                      </td>
                    </tr>
                  )}
                  {insumos.map(ins => {
                    const cvu = calcCVU(ins)
                    return (
                      <tr key={ins.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={tdS}>
                          <input
                            style={inpS}
                            value={ins.nombre}
                            onChange={e => updInsumo(ins.id, 'nombre', e.target.value)}
                            placeholder="ej. Harina"
                          />
                        </td>
                        <td style={tdS}>
                          <input
                            style={inpS}
                            value={ins.presentacion}
                            onChange={e => updInsumo(ins.id, 'presentacion', e.target.value)}
                            placeholder="ej. Bolsa 1kg"
                          />
                        </td>
                        <td style={tdS}>
                          <select
                            style={{ ...inpS, minWidth: 80 }}
                            value={ins.unidad}
                            onChange={e => updInsumo(ins.id, 'unidad', e.target.value)}
                          >
                            {UNIDADES_INSUMO.map(u => <option key={u}>{u}</option>)}
                          </select>
                        </td>
                        <td style={tdS}>
                          <input
                            style={{ ...inpS, width: 80 }}
                            type="number" min="0.001" step="any"
                            value={ins.cantidadPresentacion || ''}
                            onChange={e => updInsumo(ins.id, 'cantidadPresentacion', e.target.value)}
                            placeholder="1"
                          />
                        </td>
                        <td style={tdS}>
                          <input
                            style={{ ...inpS, width: 80 }}
                            type="number" min="0" step="any"
                            value={ins.cantidadUsada || ''}
                            onChange={e => updInsumo(ins.id, 'cantidadUsada', e.target.value)}
                            placeholder="1"
                          />
                        </td>
                        <td style={tdS}>
                          <input
                            style={{ ...inpS, width: 90 }}
                            type="number" min="0" step="0.01"
                            value={ins.precio || ''}
                            onChange={e => updInsumo(ins.id, 'precio', e.target.value)}
                            placeholder="0.00"
                          />
                        </td>
                        <td style={{ ...tdS, fontWeight: 700, color: cvu > 0 ? '#1d4ed8' : '#94a3b8', whiteSpace: 'nowrap' }}>
                          {cvu > 0 ? (
                            <div>
                              <div>{formatBs(cvu)}</div>
                              <div style={{ fontSize: 10, fontWeight: 500, color: '#64748b' }}>
                                por {(produccion.unidad || 'unidad').replace(/s$/, '')}
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                        <td style={tdS}>
                          <button
                            onClick={() => delInsumo(ins.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, borderRadius: 4 }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Total CVU */}
            {insumos.length > 0 && totalCVU > 0 && (
              <div style={{
                padding: '10px 14px', background: '#dbeafe',
                borderTop: '1px solid #bfdbfe',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1e3a5f' }}>
                  CVU total de insumos
                </span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>
                  {formatBs(totalCVU)}{' '}
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#3b82f6' }}>
                    / {(produccion.unidad || 'unidad').replace(/s$/, '')}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={addInsumo}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: '#2563eb', background: 'none',
                border: '1px dashed #93c5fd', borderRadius: 8,
                padding: '6px 14px', cursor: 'pointer', fontWeight: 500,
                fontFamily: 'inherit',
              }}
            >
              <PlusCircle size={13} /> Agregar insumo
            </button>

            <button
              onClick={handleImportar}
              disabled={totalCVU === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 13, fontWeight: 700, color: 'white',
                background: totalCVU > 0
                  ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                  : '#cbd5e1',
                border: 'none', borderRadius: 10, padding: '9px 18px',
                cursor: totalCVU > 0 ? 'pointer' : 'default',
                boxShadow: totalCVU > 0 ? '0 2px 10px #2563eb44' : 'none',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}
            >
              {importado
                ? <><CheckCircle size={15} /> ¡Costos añadidos!</>
                : <><ArrowDownToLine size={15} /> Agregar CVU a costos variables</>
              }
            </button>
          </div>

          {/* Nota explicativa */}
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: '#fff7ed', borderRadius: 8,
            border: '1px solid #fed7aa', fontSize: 11, color: '#7c2d12', lineHeight: 1.6,
          }}>
            <strong>¿Cómo se calcula?</strong>{' '}
            CVU = (Precio presentación ÷ Cant. presentación × Cant. usada) ÷ Producción obtenida.{' '}
            Ejemplo: bolsa de harina de 50 kg a Bs. 120, usas 10 kg para hacer 20 unidades →
            CVU harina = (120÷50×10)÷20 = <strong>Bs. 1.20 por unidad</strong>.
          </div>
        </div>
      )}
    </div>
  )
}

export default CalculadoraInsumos

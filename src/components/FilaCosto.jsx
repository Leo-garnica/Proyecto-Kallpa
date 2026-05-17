/**
 * FilaCosto.jsx
 * Componente reutilizable para una fila de costo (fijo o variable).
 * Renderiza: campo descripción + campo monto/costo unitario + botón eliminar.
 */

import React from 'react'

/**
 * @param {Object} props
 * @param {Object}   props.item       - Ítem de costo { id, desc, monto | costoUnitario }
 * @param {'fijo'|'variable'} props.tipo - Tipo de costo
 * @param {Function} props.onCampo    - Callback cuando cambia descripción o valor
 * @param {Function} props.onEliminar - Callback para eliminar la fila
 */
const FilaCosto = ({ item, tipo, onCampo, onEliminar }) => {
  const esFijo = tipo === 'fijo'
  const valorActual = esFijo ? item.monto : item.costoUnitario
  const campovalor  = esFijo ? 'monto' : 'costoUnitario'

  return (
    <div className="grid grid-cols-[1fr_140px_36px] gap-2 items-center mb-2">
      {/* Campo descripción */}
      <input
        type="text"
        className="input-base"
        placeholder="Descripción del ítem"
        value={item.desc}
        onChange={(e) => onCampo('desc', e.target.value)}
      />

      {/* Campo monto o costo unitario */}
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
          Bs.
        </span>
        <input
          type="number"
          className="input-base pl-8"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={valorActual}
          onChange={(e) => onCampo(campovalor, e.target.value)}
        />
      </div>

      {/* Botón eliminar */}
      <button
        className="btn-base btn-danger h-9 w-9 flex items-center justify-center p-0 text-base"
        onClick={onEliminar}
        title="Eliminar fila"
        aria-label="Eliminar este ítem de costo"
      >
        ✕
      </button>
    </div>
  )
}

export default FilaCosto

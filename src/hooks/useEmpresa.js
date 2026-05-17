/**
 * useEmpresa.js
 * Hook personalizado que gestiona el estado de la empresa.
 * Usa useReducer (arquitectura ZIP) + localStorage (funcionalidad JSX).
 */
import { useReducer, useEffect } from 'react'
import { genId, crearProducto, crearCostoFijo, crearCostoVariable } from '../utils/calculos.js'

const STORAGE_KEY = 'finanzas_clara_state'

const estadoInicial = {
  nombre: '',
  representante: '',
  productos: [crearProducto('Mi Primer Producto')],
}

const cargarEstado = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v ? JSON.parse(v) : estadoInicial
  } catch { return estadoInicial }
}

export const ACCIONES = {
  SET_EMPRESA:          'SET_EMPRESA',
  AGREGAR_PRODUCTO:     'AGREGAR_PRODUCTO',
  ACTUALIZAR_PRODUCTO:  'ACTUALIZAR_PRODUCTO',
  ELIMINAR_PRODUCTO:    'ELIMINAR_PRODUCTO',
  AGREGAR_COSTO_FIJO:   'AGREGAR_COSTO_FIJO',
  ACTUALIZAR_COSTO_FIJO:'ACTUALIZAR_COSTO_FIJO',
  ELIMINAR_COSTO_FIJO:  'ELIMINAR_COSTO_FIJO',
  AGREGAR_COSTO_VAR:    'AGREGAR_COSTO_VAR',
  ACTUALIZAR_COSTO_VAR: 'ACTUALIZAR_COSTO_VAR',
  ELIMINAR_COSTO_VAR:   'ELIMINAR_COSTO_VAR',
  RESETEAR:             'RESETEAR',
}

const reducer = (estado, accion) => {
  switch (accion.type) {
    case ACCIONES.SET_EMPRESA:
      return { ...estado, [accion.campo]: accion.valor }

    case ACCIONES.AGREGAR_PRODUCTO:
      return { ...estado, productos: [...estado.productos, crearProducto(`Producto ${estado.productos.length + 1}`)] }

    case ACCIONES.ACTUALIZAR_PRODUCTO:
      return {
        ...estado,
        productos: estado.productos.map((p) =>
          p.id === accion.productoId ? { ...p, [accion.campo]: accion.valor } : p
        ),
      }

    case ACCIONES.ELIMINAR_PRODUCTO:
      return { ...estado, productos: estado.productos.filter((p) => p.id !== accion.productoId) }

    case ACCIONES.AGREGAR_COSTO_FIJO:
      return {
        ...estado,
        productos: estado.productos.map((p) =>
          p.id === accion.productoId
            ? { ...p, costosF: [...(p.costosF || []), crearCostoFijo()] }
            : p
        ),
      }

    case ACCIONES.ACTUALIZAR_COSTO_FIJO:
      return {
        ...estado,
        productos: estado.productos.map((p) =>
          p.id === accion.productoId
            ? { ...p, costosF: (p.costosF || []).map((c) => c.id === accion.costoId ? { ...c, [accion.campo]: accion.valor } : c) }
            : p
        ),
      }

    case ACCIONES.ELIMINAR_COSTO_FIJO:
      return {
        ...estado,
        productos: estado.productos.map((p) =>
          p.id === accion.productoId
            ? { ...p, costosF: (p.costosF || []).filter((c) => c.id !== accion.costoId) }
            : p
        ),
      }

    case ACCIONES.AGREGAR_COSTO_VAR:
      return {
        ...estado,
        productos: estado.productos.map((p) =>
          p.id === accion.productoId
            ? { ...p, costosV: [...(p.costosV || []), crearCostoVariable()] }
            : p
        ),
      }

    case ACCIONES.ACTUALIZAR_COSTO_VAR:
      return {
        ...estado,
        productos: estado.productos.map((p) =>
          p.id === accion.productoId
            ? { ...p, costosV: (p.costosV || []).map((c) => c.id === accion.costoId ? { ...c, [accion.campo]: accion.valor } : c) }
            : p
        ),
      }

    case ACCIONES.ELIMINAR_COSTO_VAR:
      return {
        ...estado,
        productos: estado.productos.map((p) =>
          p.id === accion.productoId
            ? { ...p, costosV: (p.costosV || []).filter((c) => c.id !== accion.costoId) }
            : p
        ),
      }

    case ACCIONES.RESETEAR:
      return estadoInicial

    default:
      return estado
  }
}

export const useEmpresa = () => {
  const [empresa, dispatch] = useReducer(reducer, undefined, cargarEstado)

  // Persistencia automática en localStorage (funcionalidad del JSX)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(empresa)) } catch {}
  }, [empresa])

  const acciones = {
    setNombre:        (valor)                          => dispatch({ type: ACCIONES.SET_EMPRESA, campo: 'nombre', valor }),
    setRepresentante: (valor)                          => dispatch({ type: ACCIONES.SET_EMPRESA, campo: 'representante', valor }),
    agregarProducto:  ()                               => dispatch({ type: ACCIONES.AGREGAR_PRODUCTO }),
    actualizarProducto: (productoId, campo, valor)     => dispatch({ type: ACCIONES.ACTUALIZAR_PRODUCTO, productoId, campo, valor }),
    eliminarProducto: (productoId)                     => dispatch({ type: ACCIONES.ELIMINAR_PRODUCTO, productoId }),
    agregarCostoFijo: (productoId)                     => dispatch({ type: ACCIONES.AGREGAR_COSTO_FIJO, productoId }),
    actualizarCostoFijo: (productoId, costoId, campo, valor) => dispatch({ type: ACCIONES.ACTUALIZAR_COSTO_FIJO, productoId, costoId, campo, valor }),
    eliminarCostoFijo: (productoId, costoId)           => dispatch({ type: ACCIONES.ELIMINAR_COSTO_FIJO, productoId, costoId }),
    agregarCostoVar:  (productoId)                     => dispatch({ type: ACCIONES.AGREGAR_COSTO_VAR, productoId }),
    actualizarCostoVar: (productoId, costoId, campo, valor) => dispatch({ type: ACCIONES.ACTUALIZAR_COSTO_VAR, productoId, costoId, campo, valor }),
    eliminarCostoVar: (productoId, costoId)            => dispatch({ type: ACCIONES.ELIMINAR_COSTO_VAR, productoId, costoId }),
    resetear:         ()                               => dispatch({ type: ACCIONES.RESETEAR }),
  }

  return { empresa, acciones }
}

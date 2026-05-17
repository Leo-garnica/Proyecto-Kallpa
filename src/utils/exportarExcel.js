/**
 * exportarExcel.js
 * Genera un archivo .xlsx — compatible con el modelo de datos del JSX.
 */
import * as XLSX from 'xlsx'
import { calcular, fmt } from './calculos.js'

export const exportarExcel = (empresa) => {
  const wb = XLSX.utils.book_new()

  empresa.productos.forEach((producto, indice) => {
    const kpi = calcular(producto)
    const nombre = producto.name || producto.nombre || `Producto${indice + 1}`
    const nombreHoja = nombre.substring(0, 28).replace(/[:\\/?*[\]]/g, '')

    const filas = [
      ['FinanzasClara — Plan de Negocios y Costos'],
      [],
      ['Negocio:', empresa.nombre || '—'],
      ['Representante:', empresa.representante || '—'],
      ['Producto:', nombre],
      [],
    ]

    filas.push(['COSTOS FIJOS', ''])
    filas.push(['Nombre', 'Monto (Bs.)'])
    const cf = producto.costosF || []
    if (cf.length === 0) {
      filas.push(['(Sin costos fijos registrados)', ''])
    } else {
      cf.forEach((c) => filas.push([c.nombre || '(sin descripción)', parseFloat(c.monto) || 0]))
    }
    filas.push(['TOTAL COSTOS FIJOS', kpi.cf])
    filas.push([])

    filas.push(['COSTOS VARIABLES', ''])
    filas.push(['Nombre', 'Costo Unit.', 'Cantidad', 'Subtotal'])
    const cv = producto.costosV || []
    if (cv.length === 0) {
      filas.push(['(Sin costos variables registrados)', '', '', ''])
    } else {
      cv.forEach((c) => {
        const cu = parseFloat(c.monto) || 0
        const cant = parseFloat(c.cantUnidad) || 1
        filas.push([c.nombre || '(sin descripción)', cu, cant, cu * cant])
      })
    }
    filas.push(['TOTAL COSTOS VARIABLES', kpi.cv])
    filas.push([])

    filas.push(['INDICADORES CALCULADOS', ''])
    filas.push(['Producción estimada (unidades)', kpi.volumen])
    filas.push(['Precio de venta (Bs.)', kpi.pv])
    filas.push(['Costo Fijo Total — CF (Bs.)', kpi.cf])
    filas.push(['Costo Variable Total — CV (Bs.)', kpi.cv])
    filas.push(['Costo Total (Bs.)', parseFloat(kpi.ct.toFixed(2))])
    filas.push(['Costo Unitario — CU (Bs.)', parseFloat(kpi.cu.toFixed(2))])
    filas.push(['Precio Sugerido (Bs.)', parseFloat(kpi.pSugerido.toFixed(2))])
    filas.push(['Ganancia Unitaria (Bs.)', parseFloat(kpi.ganancia.toFixed(2))])
    filas.push(['Margen Real (%)', parseFloat(kpi.margenReal.toFixed(2))])
    filas.push([
      'Punto de Equilibrio (unidades)',
      kpi.pe <= 0 ? 'INALCANZABLE' : Math.ceil(kpi.pe),
    ])

    const ws = XLSX.utils.aoa_to_sheet(filas)
    ws['!cols'] = [{ wch: 38 }, { wch: 16 }, { wch: 12 }, { wch: 14 }]
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja)
  })

  const nombreArchivo = `FinanzasClara_${(empresa.nombre || 'negocio').replace(/\s+/g, '_')}.xlsx`
  XLSX.writeFile(wb, nombreArchivo)
}

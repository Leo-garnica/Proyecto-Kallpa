/**
 * exportarPDF.js
 * Genera la ficha técnica en PDF — compatible con modelo de datos JSX.
 */
import { jsPDF } from 'jspdf'
import { calcular, fmt } from './calculos.js'

const COLOR_PRIMARIO    = [28, 27, 75]
const COLOR_ACENTO      = [76, 29, 149]
const COLOR_GRIS_CLARO  = [245, 244, 240]
const COLOR_TEXTO       = [30, 30, 30]
const COLOR_TEXTO_SUAVE = [100, 100, 100]
const COLOR_BLANCO      = [255, 255, 255]
const COLOR_PELIGRO     = [252, 235, 235]

const verificarPagina = (doc, y, necesario = 20) => {
  if (y + necesario > 278) { doc.addPage(); return 18; }
  return y
}

const dibujarEncabezado = (doc, W) => {
  doc.setFillColor(...COLOR_PRIMARIO)
  doc.rect(0, 0, W, 28, 'F')
  doc.setFillColor(...COLOR_ACENTO)
  doc.rect(0, 22, W, 6, 'F')

  doc.setTextColor(...COLOR_BLANCO)
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text('FinanzasClara', W / 2, 12, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')
  doc.text('Comprende tus costos · Define tu precio · Conoce tu ganancia', W / 2, 19, { align: 'center' })
  return 36
}

const dibujarDatosEmpresa = (doc, empresa, y, W) => {
  doc.setFillColor(...COLOR_GRIS_CLARO)
  doc.roundedRect(12, y - 4, W - 24, 18, 2, 2, 'F')
  doc.setTextColor(...COLOR_PRIMARIO)
  doc.setFontSize(10)
  doc.setFont(undefined, 'bold')
  doc.text('DATOS DEL NEGOCIO', 16, y + 2)
  doc.setTextColor(...COLOR_TEXTO)
  doc.setFont(undefined, 'normal')
  doc.setFontSize(9.5)
  doc.text(`Negocio: ${empresa.nombre || '—'}`, 16, y + 8)
  doc.text(`Representante: ${empresa.representante || '—'}`, W / 2, y + 8)
  return y + 22
}

const dibujarTablaCostos = (doc, titulo, items, total, y, W, esFijo) => {
  y = verificarPagina(doc, y, 20)
  doc.setFillColor(...COLOR_ACENTO)
  doc.rect(14, y - 3, W - 28, 7, 'F')
  doc.setTextColor(...COLOR_BLANCO)
  doc.setFontSize(8.5)
  doc.setFont(undefined, 'bold')
  doc.text(titulo, 16, y + 1.5)
  if (!esFijo) {
    doc.text('C.Unit.', W - 60, y + 1.5, { align: 'right' })
    doc.text('Cant.', W - 42, y + 1.5, { align: 'right' })
    doc.text('Subtotal', W - 14, y + 1.5, { align: 'right' })
  } else {
    doc.text('Monto (Bs.)', W - 14, y + 1.5, { align: 'right' })
  }
  y += 8

  doc.setFont(undefined, 'normal')
  doc.setTextColor(...COLOR_TEXTO)

  if (items.length === 0) {
    doc.setTextColor(...COLOR_TEXTO_SUAVE)
    doc.setFontSize(8)
    doc.text('(Sin ítems registrados)', 16, y + 2)
    y += 7
  } else {
    items.forEach((item, i) => {
      y = verificarPagina(doc, y, 7)
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 248)
        doc.rect(14, y - 3, W - 28, 6, 'F')
      }
      doc.setFontSize(8.5)
      doc.setTextColor(...COLOR_TEXTO)
      doc.text(item.nombre || '(sin descripción)', 16, y + 1)
      if (esFijo) {
        doc.text(`Bs. ${fmt(parseFloat(item.monto) || 0)}`, W - 14, y + 1, { align: 'right' })
      } else {
        const monto = parseFloat(item.monto) || 0
        const cant  = parseFloat(item.cantUnidad) || 1
        doc.text(`Bs. ${fmt(monto)}`, W - 60, y + 1, { align: 'right' })
        doc.text(`${cant}`, W - 42, y + 1, { align: 'right' })
        doc.text(`Bs. ${fmt(monto * cant)}`, W - 14, y + 1, { align: 'right' })
      }
      y += 6
    })
  }

  y = verificarPagina(doc, y, 8)
  doc.setFillColor(220, 215, 252)
  doc.rect(14, y - 2, W - 28, 7, 'F')
  doc.setFont(undefined, 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...COLOR_PRIMARIO)
  doc.text('TOTAL', 16, y + 2.5)
  doc.text(`Bs. ${fmt(total)}`, W - 14, y + 2.5, { align: 'right' })
  return y + 10
}

const dibujarKPIs = (doc, kpi, producto, y, W) => {
  y = verificarPagina(doc, y, 48)
  doc.setFillColor(...COLOR_GRIS_CLARO)
  doc.roundedRect(14, y - 2, W - 28, kpi.pe <= 0 ? 50 : 44, 2, 2, 'F')
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(...COLOR_ACENTO)
  doc.text('INDICADORES CALCULADOS (tiempo real)', 18, y + 4)
  y += 10

  const filas = [
    ['Producción estimada',    `${kpi.volumen} ${producto.unidad}`],
    ['Precio de venta actual', `Bs. ${fmt(kpi.pv)}`],
    ['Costo Total',            `Bs. ${fmt(kpi.ct)}`],
    ['Costo Unitario (CU)',    `Bs. ${fmt(kpi.cu)}`],
    ['Precio Sugerido',        `Bs. ${fmt(kpi.pSugerido)}`],
    ['Ganancia Unitaria',      `Bs. ${fmt(kpi.ganancia)}`],
    ['Margen Real',            `${kpi.margenReal.toFixed(1)}%`],
    ['Punto de Equilibrio',    kpi.pe <= 0 ? '⚠ INALCANZABLE' : `${Math.ceil(kpi.pe)} ${producto.unidad}`],
  ]

  filas.forEach(([etiqueta, valor]) => {
    doc.setFont(undefined, 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLOR_TEXTO)
    doc.text(etiqueta, 18, y)
    const isPeligro = valor.includes('INALCANZABLE')
    const isPositivo = etiqueta === 'Ganancia Unitaria' && kpi.ganancia > 0
    const isNegativo = etiqueta === 'Ganancia Unitaria' && kpi.ganancia < 0
    if (isPeligro || isNegativo) doc.setTextColor(163, 45, 45)
    else if (isPositivo)         doc.setTextColor(59, 109, 17)
    else                         doc.setTextColor(...COLOR_TEXTO)
    doc.setFont(undefined, 'bold')
    doc.text(valor, W - 18, y, { align: 'right' })
    y += 5.5
  })

  if (kpi.pe <= 0) {
    y += 2
    doc.setFillColor(...COLOR_PELIGRO)
    doc.roundedRect(16, y - 3, W - 32, 10, 2, 2, 'F')
    doc.setFont(undefined, 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(163, 45, 45)
    doc.text(`El precio (Bs. ${fmt(kpi.pv)}) es ≤ al costo variable unitario. Aumente el precio.`, 18, y + 3)
    y += 12
  }
  return y + 8
}

export const exportarPDF = (empresa) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  let y = dibujarEncabezado(doc, W)
  y = dibujarDatosEmpresa(doc, empresa, y, W)

  empresa.productos.forEach((producto, indice) => {
    const kpi = calcular(producto)
    const nombre = producto.name || producto.nombre || `Producto ${indice + 1}`
    y = verificarPagina(doc, y, 52)

    doc.setFillColor(...COLOR_PRIMARIO)
    doc.roundedRect(12, y - 3, W - 24, 10, 2, 2, 'F')
    doc.setTextColor(...COLOR_BLANCO)
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text(`Producto ${indice + 1}: ${nombre}`, 16, y + 3.5)
    doc.setFontSize(8.5)
    doc.setFont(undefined, 'normal')
    doc.text(`Precio de venta: Bs. ${fmt(kpi.pv)}`, W - 14, y + 3.5, { align: 'right' })
    y += 14

    y = dibujarTablaCostos(doc, 'COSTOS FIJOS', producto.costosF || [], kpi.cf, y, W, true)
    y = dibujarTablaCostos(doc, 'COSTOS VARIABLES', producto.costosV || [], kpi.cv, y, W, false)
    y = dibujarKPIs(doc, kpi, producto, y, W)
  })

  const totalPaginas = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p)
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_TEXTO_SUAVE)
    doc.text(
      `FinanzasClara  |  Generado el ${new Date().toLocaleDateString('es-BO')}  |  Página ${p} de ${totalPaginas}`,
      W / 2, 291, { align: 'center' }
    )
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(12, 287, W - 12, 287)
  }

  const nombreArchivo = `FinanzasClara_${(empresa.nombre || 'negocio').replace(/\s+/g, '_')}.pdf`
  doc.save(nombreArchivo)
}

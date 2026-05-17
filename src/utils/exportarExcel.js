/**
 * exportarExcel.js
 * Genera un archivo .xlsx con diseño profesional y estilizado — FundacionKallpa.
 * Usa ExcelJS para soporte completo de estilos, bordes y colores.
 */
import ExcelJS from 'exceljs'
import { calcular, fmt } from './calculos.js'

// ──────────────────────────────────────────────
// Paleta de colores FundacionKallpa
// ──────────────────────────────────────────────
const C = {
  navy:       'FF1C1B4B',
  purple:     'FF4C1D95',
  purpleLight:'FFE9D5FF',
  gold:       'FFFBBF24',
  goldLight:  'FFFEF9C3',
  green:      'FF065F46',
  greenLight: 'FFD1FAE5',
  red:        'FF7F1D1D',
  redLight:   'FFFEE2E2',
  gray:       'FF374151',
  grayLight:  'FFF3F4F6',
  grayMid:    'FFD1D5DB',
  white:      'FFFFFFFF',
  amber:      'FFDC2626',
}

const font = (opts = {}) => ({
  name: 'Calibri',
  size: opts.size || 11,
  bold: opts.bold || false,
  italic: opts.italic || false,
  color: { argb: opts.color || C.gray },
})

const fill = (argb) => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb },
})

const border = (style = 'thin', color = C.grayMid) => ({
  top:    { style, color: { argb: color } },
  left:   { style, color: { argb: color } },
  bottom: { style, color: { argb: color } },
  right:  { style, color: { argb: color } },
})

const align = (h = 'left', v = 'middle', wrap = false) => ({
  horizontal: h,
  vertical: v,
  wrapText: wrap,
})

function writeCell(ws, row, col, value, styles = {}, mergeEnd = null) {
  const cell = ws.getCell(row, col)
  cell.value = value
  if (styles.font)      cell.font      = styles.font
  if (styles.fill)      cell.fill      = styles.fill
  if (styles.border)    cell.border    = styles.border
  if (styles.alignment) cell.alignment = styles.alignment
  if (styles.numFmt)    cell.numFmt    = styles.numFmt
  if (mergeEnd) ws.mergeCells(row, col, mergeEnd[0], mergeEnd[1])
  return cell
}

export const exportarExcel = async (empresa) => {
  const wb = new ExcelJS.Workbook()
  wb.creator  = 'FundacionKallpa'
  wb.company  = empresa.nombre || 'FundacionKallpa'
  wb.created  = new Date()
  wb.modified = new Date()

  // ── HOJA RESUMEN ──────────────────────────────
  const wsResumen = wb.addWorksheet('Resumen', {
    pageSetup: { orientation: 'portrait', fitToPage: true },
    properties: { tabColor: { argb: C.navy } },
  })
  wsResumen.columns = [
    { width: 5 }, { width: 30 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 5 },
  ]

  let r = 1

  // Banda nav top
  for (let c = 1; c <= 6; c++) wsResumen.getCell(r, c).fill = fill(C.navy)
  wsResumen.getRow(r).height = 8; r++

  // Titulo
  wsResumen.getRow(r).height = 40
  writeCell(wsResumen, r, 2, 'FundacionKallpa', {
    font: font({ size: 22, bold: true, color: C.white }),
    fill: fill(C.navy),
    alignment: align('left', 'middle'),
  }, [r, 5])
  wsResumen.getCell(r, 1).fill = fill(C.navy)
  wsResumen.getCell(r, 6).fill = fill(C.navy)
  r++

  wsResumen.getRow(r).height = 22
  writeCell(wsResumen, r, 2, 'Comprende tus costos  ·  Define tu precio  ·  Conoce tu ganancia', {
    font: font({ size: 10, italic: true, color: C.purpleLight }),
    fill: fill(C.purple),
    alignment: align('left', 'middle'),
  }, [r, 5])
  wsResumen.getCell(r, 1).fill = fill(C.purple)
  wsResumen.getCell(r, 6).fill = fill(C.purple)
  r++

  for (let c = 1; c <= 6; c++) wsResumen.getCell(r, c).fill = fill(C.navy)
  wsResumen.getRow(r).height = 6; r++

  r++ // espacio

  // Datos del negocio
  wsResumen.getRow(r).height = 20
  writeCell(wsResumen, r, 2, 'DATOS DEL NEGOCIO', {
    font: font({ size: 11, bold: true, color: C.white }),
    fill: fill(C.purple),
    border: border('thin', C.purple),
    alignment: align('left', 'middle'),
  }, [r, 5])
  wsResumen.getCell(r, 1).fill = fill(C.purple)
  wsResumen.getCell(r, 6).fill = fill(C.purple)
  r++

  const datosNegocio = [
    ['Negocio',           empresa.nombre        || '—'],
    ['Representante',     empresa.representante || '—'],
    ['Fecha del reporte', new Date().toLocaleDateString('es-BO')],
  ]
  datosNegocio.forEach(([label, val]) => {
    wsResumen.getRow(r).height = 18
    writeCell(wsResumen, r, 2, label, {
      font: font({ bold: true, color: C.navy }),
      fill: fill(C.grayLight),
      border: border(),
      alignment: align('left', 'middle'),
    })
    writeCell(wsResumen, r, 3, val, {
      font: font({ color: C.gray }),
      fill: fill(C.white),
      border: border(),
      alignment: align('left', 'middle'),
    }, [r, 5])
    wsResumen.getCell(r, 1).fill = fill(C.grayLight)
    wsResumen.getCell(r, 6).fill = fill(C.grayLight)
    r++
  })

  r++ // espacio

  // Tabla resumen de productos
  if (empresa.productos && empresa.productos.length > 0) {
    wsResumen.getRow(r).height = 22
    writeCell(wsResumen, r, 2, 'RESUMEN DE PRODUCTOS', {
      font: font({ size: 11, bold: true, color: C.white }),
      fill: fill(C.navy),
      border: border('thin', C.navy),
      alignment: align('center', 'middle'),
    }, [r, 5])
    wsResumen.getCell(r, 1).fill = fill(C.navy)
    wsResumen.getCell(r, 6).fill = fill(C.navy)
    r++

    wsResumen.getRow(r).height = 20
    ;['Producto', 'Costo Total (Bs.)', 'Precio Venta (Bs.)', 'Margen (%)'].forEach((h, i) => {
      writeCell(wsResumen, r, i + 2, h, {
        font: font({ bold: true, color: C.white, size: 10 }),
        fill: fill(C.purple),
        border: border('thin', C.purple),
        alignment: align('center', 'middle'),
      })
    })
    r++

    empresa.productos.forEach((prod, idx) => {
      const kpi = calcular(prod)
      const nombre = prod.name || prod.nombre || `Producto ${idx + 1}`
      const isAlt = idx % 2 === 1
      const bgFill = isAlt ? fill(C.purpleLight) : fill(C.white)
      wsResumen.getRow(r).height = 17

      writeCell(wsResumen, r, 2, nombre, { font: font({ bold: true, color: C.navy }), fill: bgFill, border: border(), alignment: align('left', 'middle') })
      writeCell(wsResumen, r, 3, kpi.ct, { font: font({ color: C.gray }), fill: bgFill, border: border(), alignment: align('right', 'middle'), numFmt: '#,##0.00' })
      writeCell(wsResumen, r, 4, kpi.pv, { font: font({ color: C.gray }), fill: bgFill, border: border(), alignment: align('right', 'middle'), numFmt: '#,##0.00' })

      const margen = parseFloat(kpi.margenReal.toFixed(2))
      const margenColor = margen >= 25 ? C.green : margen >= 10 ? C.amber : C.red
      const margenBg    = margen >= 25 ? C.greenLight : margen >= 10 ? C.goldLight : C.redLight
      writeCell(wsResumen, r, 5, margen, {
        font: font({ bold: true, color: margenColor }),
        fill: fill(margenBg),
        border: border(),
        alignment: align('center', 'middle'),
        numFmt: '0.00"%"',
      })
      r++
    })
  }

  r += 2
  wsResumen.getRow(r).height = 14
  writeCell(wsResumen, r, 2, `Generado por FundacionKallpa  |  ${new Date().toLocaleString('es-BO')}`, {
    font: font({ size: 8, italic: true, color: 'FF9CA3AF' }),
    alignment: align('left', 'middle'),
  }, [r, 5])

  // ── HOJAS POR PRODUCTO ─────────────────────────
  empresa.productos.forEach((producto, indice) => {
    const kpi    = calcular(producto)
    const nombre = producto.name || producto.nombre || `Producto${indice + 1}`
    const tabNm  = nombre.substring(0, 28).replace(/[:\\/?\*\[\]]/g, '')

    const ws = wb.addWorksheet(tabNm, {
      properties: { tabColor: { argb: C.purple } },
    })
    ws.columns = [
      { width: 4 }, { width: 36 }, { width: 16 }, { width: 14 }, { width: 16 }, { width: 4 },
    ]

    let row = 1

    for (let c = 1; c <= 6; c++) ws.getCell(row, c).fill = fill(C.navy)
    ws.getRow(row).height = 8; row++

    ws.getRow(row).height = 36
    writeCell(ws, row, 2, nombre, {
      font: font({ size: 18, bold: true, color: C.white }),
      fill: fill(C.navy),
      alignment: align('left', 'middle'),
    }, [row, 5])
    ws.getCell(row, 1).fill = fill(C.navy)
    ws.getCell(row, 6).fill = fill(C.navy)
    row++

    ws.getRow(row).height = 20
    writeCell(ws, row, 2, `Precio de venta: Bs. ${fmt(kpi.pv)}`, {
      font: font({ size: 10, color: C.purpleLight }),
      fill: fill(C.purple),
      alignment: align('left', 'middle'),
    }, [row, 5])
    ws.getCell(row, 1).fill = fill(C.purple)
    ws.getCell(row, 6).fill = fill(C.purple)
    row++

    for (let c = 1; c <= 6; c++) ws.getCell(row, c).fill = fill(C.navy)
    ws.getRow(row).height = 6; row++
    row++

    // Helper: sección de costos
    const dibujarSeccion = (titulo, columnas, items, totalLabel, totalVal) => {
      ws.getRow(row).height = 22
      writeCell(ws, row, 2, titulo, {
        font: font({ size: 11, bold: true, color: C.white }),
        fill: fill(C.purple),
        border: border('thin', C.purple),
        alignment: align('left', 'middle'),
      }, [row, 5])
      ws.getCell(row, 1).fill = fill(C.purple)
      ws.getCell(row, 6).fill = fill(C.purple)
      row++

      ws.getRow(row).height = 18
      columnas.forEach((col, i) => {
        writeCell(ws, row, i + 2, col, {
          font: font({ bold: true, color: C.white, size: 9.5 }),
          fill: fill(C.navy),
          border: border('thin', C.navy),
          alignment: align(i === 0 ? 'left' : 'center', 'middle'),
        })
      })
      row++

      if (items.length === 0) {
        ws.getRow(row).height = 16
        writeCell(ws, row, 2, '(Sin ítems registrados)', {
          font: font({ italic: true, color: 'FF9CA3AF' }),
          fill: fill(C.grayLight),
          border: border(),
          alignment: align('left', 'middle'),
        }, [row, 5])
        ws.getCell(row, 1).fill = fill(C.grayLight)
        ws.getCell(row, 6).fill = fill(C.grayLight)
        row++
      } else {
        items.forEach((item, idx) => {
          ws.getRow(row).height = 17
          const bgRow = idx % 2 === 1 ? fill(C.purpleLight) : fill(C.white)
          writeCell(ws, row, 2, item[0], {
            font: font({ color: C.gray }),
            fill: bgRow, border: border(), alignment: align('left', 'middle'),
          })
          item.slice(1).forEach((val, ci) => {
            writeCell(ws, row, ci + 3, val, {
              font: font({ color: C.gray }),
              fill: bgRow, border: border(), alignment: align('right', 'middle'), numFmt: '#,##0.00',
            })
          })
          for (let c = item.length + 2; c <= 5; c++) {
            ws.getCell(row, c).fill = bgRow
            ws.getCell(row, c).border = border()
          }
          ws.getCell(row, 1).fill = bgRow
          ws.getCell(row, 6).fill = bgRow
          row++
        })
      }

      ws.getRow(row).height = 20
      writeCell(ws, row, 2, totalLabel, {
        font: font({ bold: true, size: 10.5, color: C.navy }),
        fill: fill(C.goldLight),
        border: border('medium', C.gold),
        alignment: align('left', 'middle'),
      }, [row, 4])
      writeCell(ws, row, 5, totalVal, {
        font: font({ bold: true, size: 10.5, color: C.navy }),
        fill: fill(C.gold),
        border: border('medium', C.gold),
        alignment: align('right', 'middle'),
        numFmt: '"Bs. "#,##0.00',
      })
      ws.getCell(row, 1).fill = fill(C.goldLight)
      ws.getCell(row, 6).fill = fill(C.goldLight)
      row++
      row++
    }

    const cfItems = (producto.costosF || []).map(c => [c.nombre || '(sin descripción)', parseFloat(c.monto) || 0])
    dibujarSeccion('COSTOS FIJOS', ['Descripción', 'Monto (Bs.)'], cfItems, 'TOTAL COSTOS FIJOS', kpi.cf)

    const cvItems = (producto.costosV || []).map(c => {
      const cu = parseFloat(c.monto) || 0
      const cant = parseFloat(c.cantUnidad) || 1
      return [c.nombre || '(sin descripción)', cu, cant, cu * cant]
    })
    dibujarSeccion('COSTOS VARIABLES', ['Descripción', 'C. Unit. (Bs.)', 'Cantidad', 'Subtotal (Bs.)'], cvItems, 'TOTAL COSTOS VARIABLES', kpi.cv)

    // KPIs
    ws.getRow(row).height = 22
    writeCell(ws, row, 2, 'INDICADORES FINANCIEROS', {
      font: font({ size: 11, bold: true, color: C.white }),
      fill: fill(C.navy),
      border: border('thin', C.navy),
      alignment: align('left', 'middle'),
    }, [row, 5])
    ws.getCell(row, 1).fill = fill(C.navy)
    ws.getCell(row, 6).fill = fill(C.navy)
    row++

    const kpiRows = [
      ['Produccion estimada',  kpi.volumen,                          'unidades',  C.grayLight,  false],
      ['Precio de Venta',      kpi.pv,                               'Bs.',        C.white,      true ],
      ['Costo Fijo Total',     kpi.cf,                               'Bs.',        C.grayLight,  true ],
      ['Costo Variable Total', kpi.cv,                               'Bs.',        C.white,      true ],
      ['Costo Total',          parseFloat(kpi.ct.toFixed(2)),        'Bs.',        C.grayLight,  true ],
      ['Costo Unitario',       parseFloat(kpi.cu.toFixed(2)),        'Bs.',        C.white,      true ],
      ['Precio Sugerido',      parseFloat(kpi.pSugerido.toFixed(2)), 'Bs.',        C.greenLight, true ],
      ['Ganancia Unitaria',    parseFloat(kpi.ganancia.toFixed(2)),  'Bs.',        C.white,      true ],
      ['Margen Real',          parseFloat(kpi.margenReal.toFixed(2)),'%',          kpi.margenReal >= 25 ? C.greenLight : kpi.margenReal >= 10 ? C.goldLight : C.redLight, false],
      ['Punto de Equilibrio',  kpi.pe <= 0 ? 'INALCANZABLE' : Math.ceil(kpi.pe), 'unidades', C.grayLight, false],
    ]

    kpiRows.forEach(([label, val, unit, bg, isMoney]) => {
      ws.getRow(row).height = 18
      writeCell(ws, row, 2, label, {
        font: font({ bold: true, color: C.navy }),
        fill: fill(bg),
        border: border(),
        alignment: align('left', 'middle'),
      }, [row, 3])
      const isText = typeof val === 'string'
      writeCell(ws, row, 4, val, {
        font: font({ bold: true, size: 11, color: C.purple }),
        fill: fill(bg),
        border: border(),
        alignment: align('right', 'middle'),
        numFmt: isText ? undefined : (isMoney ? '"Bs. "#,##0.00' : '#,##0.00'),
      })
      writeCell(ws, row, 5, unit, {
        font: font({ italic: true, color: C.gray }),
        fill: fill(bg),
        border: border(),
        alignment: align('left', 'middle'),
      })
      ws.getCell(row, 1).fill = fill(bg)
      ws.getCell(row, 6).fill = fill(bg)
      row++
    })

    row += 2
    ws.getRow(row).height = 14
    writeCell(ws, row, 2, `FundacionKallpa  ·  Generado el ${new Date().toLocaleString('es-BO')}`, {
      font: font({ size: 8, italic: true, color: 'FF9CA3AF' }),
      alignment: align('left', 'middle'),
    }, [row, 5])
  })

  // Generar y descargar
  const buffer = await wb.xlsx.writeBuffer()
  const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `FundacionKallpa_${(empresa.nombre || 'negocio').replace(/\s+/g, '_')}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

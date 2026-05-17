/**
 * PanelExportacion.jsx
 * Panel de exportación a Excel y PDF — arquitectura del ZIP, datos del JSX.
 */
import React, { useState } from 'react'
import { exportarExcel } from '../utils/exportarExcel.js'
import { exportarPDF }   from '../utils/exportarPDF.js'

const PanelExportacion = ({ empresa }) => {
  const [cargandoExcel, setCargandoExcel] = useState(false)
  const [cargandoPDF,   setCargandoPDF]   = useState(false)

  const handleExcel = async () => {
    setCargandoExcel(true)
    try { await exportarExcel(empresa) }
    catch (err) { console.error(err); alert('Error al generar Excel. Revisa la consola.') }
    finally { setCargandoExcel(false) }
  }

  const handlePDF = async () => {
    setCargandoPDF(true)
    try { exportarPDF(empresa) }
    catch (err) { console.error(err); alert('Error al generar PDF. Revisa la consola.') }
    finally { setCargandoPDF(false) }
  }

  const btnStyle = (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 600,
    border: 'none', borderRadius: 10, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'opacity 0.15s',
    background: color, color: 'white',
  })

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px #0000000d', padding: '20px 24px', marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Exportar reportes</h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#94a3b8' }}>
        Descarga toda la información en formato Excel o PDF.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button style={btnStyle('linear-gradient(135deg, #059669, #047857)')} onClick={handleExcel} disabled={cargandoExcel}>
          {cargandoExcel ? '⏳ Generando...' : '📊 Descargar Excel (.xlsx)'}
        </button>
        <button style={btnStyle('linear-gradient(135deg, #7c3aed, #4c1d95)')} onClick={handlePDF} disabled={cargandoPDF}>
          {cargandoPDF ? '⏳ Generando...' : '📄 Descargar PDF (Ficha técnica)'}
        </button>
      </div>
      <p style={{ margin: '12px 0 0', fontSize: 11, color: '#94a3b8' }}>
        <strong>Excel:</strong> una hoja por producto con costos e indicadores. &nbsp;|&nbsp;
        <strong>PDF:</strong> ficha técnica completa con todos los productos.
      </p>
    </div>
  )
}

export default PanelExportacion

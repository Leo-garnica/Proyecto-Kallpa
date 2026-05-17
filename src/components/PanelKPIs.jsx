/**
 * PanelKPIs.jsx
 * Panel de métricas financieras — responsive (móvil + laptop)
 */
import React, { useRef, useEffect } from 'react'
import { DollarSign, Package, TrendingUp, Target, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { COLORS, formatBs, salud } from '../utils/calculos.js'

const MetricCard = ({ icon: Icon, label, value, sub, color = 'slate' }) => {
  const c = COLORS[color]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 12, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: c.chart + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={c.chart} />
        </div>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: c.text, lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</span>}
    </div>
  )
}

export const PieChart = ({ cf, cv, ganancia }) => {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    const total = cf + cv + Math.max(0, ganancia)
    if (total <= 0) return
    const Chart = window.Chart
    if (!Chart) return
    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Costos Fijos', 'Costos Variables', 'Ganancia'],
        datasets: [{
          data: [cf, cv, Math.max(0, ganancia)],
          backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981'],
          borderWidth: 2, borderColor: '#ffffff',
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => ' Bs. ' + ctx.parsed.toFixed(2) } },
        },
      },
    })
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null } }
  }, [cf, cv, ganancia])
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

export const BarChart = ({ productos, calcular }) => {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  useEffect(() => {
    if (!canvasRef.current || !productos.length) return
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    const Chart = window.Chart
    if (!Chart) return
    const labels = productos.map((p) => (p.name || p.nombre || '').slice(0, 12))
    const datos  = productos.map((p) => calcular(p))
    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Costo Total',       data: datos.map((d) => +d.ct.toFixed(2)), backgroundColor: '#8b5cf6dd', borderRadius: 4 },
          { label: 'Precio Sug.×Prod',  data: datos.map((d, i) => +(d.pSugerido * (parseFloat(productos[i].produccion) || 1)).toFixed(2)), backgroundColor: '#10b981dd', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ' Bs. ' + ctx.parsed.toFixed(2) } } },
        scales: { y: { ticks: { callback: (v) => 'Bs.' + v } } },
      },
    })
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null } }
  }, [productos])
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
}

const PanelKPIs = ({ metrics, producto, chartLoaded }) => {
  const healthInfo = salud(metrics)
  const prod = producto

  return (
    <div>
      {/* Alerta de salud financiera */}
      <div style={{
        padding: '14px 16px', borderRadius: 12,
        border: `1px solid ${COLORS[healthInfo.color].border}`,
        background: COLORS[healthInfo.color].bg,
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
      }}>
        {healthInfo.icon === 'check'
          ? <CheckCircle   size={20} color={COLORS[healthInfo.color].chart} />
          : healthInfo.icon === 'warn'
          ? <AlertTriangle size={20} color={COLORS[healthInfo.color].chart} />
          : <AlertCircle   size={20} color={COLORS[healthInfo.color].chart} />}
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS[healthInfo.color].text }}>
          {healthInfo.msg}
        </span>
      </div>

      {/* Tarjetas de métricas — auto-fit responsive */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <MetricCard icon={DollarSign} label="Costo Total"     value={formatBs(metrics.ct)}  sub={`Fijos: ${formatBs(metrics.cf)} + Var: ${formatBs(metrics.cv)}`} color="violet" />
        <MetricCard icon={Package}    label="Costo Unitario"  value={formatBs(metrics.cu)}  sub={`Por ${(prod.unidad || 'unidad').slice(0, -1) || 'unidad'}`} color="blue" />
        <MetricCard icon={TrendingUp} label="Precio Sugerido" value={formatBs(metrics.pSugerido)} sub={`Con ${prod.margen}% de margen`} color="emerald" />
        <MetricCard icon={DollarSign} label="Ganancia Unit."  value={formatBs(metrics.ganancia)} sub={prod.precioActual > 0 ? 'Con precio actual' : 'Con precio sugerido'} color={metrics.ganancia >= 0 ? 'emerald' : 'red'} />
        <MetricCard icon={TrendingUp} label="Margen Real"     value={`${metrics.margenReal.toFixed(1)}%`} sub="Sobre precio de venta" color={metrics.margenReal >= 20 ? 'emerald' : metrics.margenReal >= 8 ? 'amber' : 'red'} />
        <MetricCard icon={Target}     label="Punto Equilibrio" value={`${Math.ceil(metrics.pe)} ${prod.unidad}`} sub={`Ventas estimadas: ${prod.ventas}`} color="amber" />
      </div>

      {/* Cómo se calcularon */}
      <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 18px', marginBottom: 24 }}>
        <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Cómo se calcularon
        </h4>
        <div className="grid-2col-sm">
          {[
            ['Costo Fijo Total',    `Σ costos fijos = ${formatBs(metrics.cf)}`],
            ['Costo Variable Total',`Σ (cant × c.unit) = ${formatBs(metrics.cv)}`],
            ['Costo Total',         `CF + CV = ${formatBs(metrics.ct)}`],
            ['Costo Unitario',      `CT / ${prod.produccion} = ${formatBs(metrics.cu)}`],
            ['Precio Sugerido',     `CU × (1 + ${prod.margen}%) = ${formatBs(metrics.pSugerido)}`],
            ['Punto de Equilibrio', `CF / (PV - CVU) = ${Math.ceil(metrics.pe)} ${prod.unidad}`],
          ].map(([k, v]) => (
            <div key={k} style={{ background: 'white', borderRadius: 8, padding: '8px 12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 13, color: '#334155', fontWeight: 500, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos — apilados en móvil, lado a lado en laptop */}
      {chartLoaded && (
        <div className="grid-2col-sm">
          {/* Dona */}
          <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
            <h4 style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Distribución de costos</h4>
            <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              {[['#8b5cf6', 'Fijos'], ['#3b82f6', 'Variables'], ['#10b981', 'Ganancia']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block', flexShrink: 0 }} />{l}
                </span>
              ))}
            </div>
            <div style={{ height: 180, position: 'relative' }}>
              <PieChart cf={metrics.cf} cv={metrics.cv} ganancia={metrics.ganancia} />
            </div>
          </div>
          {/* Resumen financiero */}
          <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Resumen financiero</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Costo total producción', val: metrics.ct, max: metrics.pSugerido * parseFloat(prod.produccion || 1), color: '#8b5cf6' },
                { label: 'Ingresos proyectados',   val: metrics.pSugerido * parseFloat(prod.ventas || 0), max: metrics.pSugerido * parseFloat(prod.produccion || 1), color: '#10b981' },
                { label: 'Ganancia total estimada', val: metrics.ganancia * parseFloat(prod.ventas || 0),  max: metrics.pSugerido * parseFloat(prod.produccion || 1), color: '#3b82f6' },
              ].map((r) => {
                const pct = Math.max(0, Math.min(100, r.max > 0 ? (r.val / r.max) * 100 : 0))
                return (
                  <div key={r.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{r.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', flexShrink: 0 }}>{formatBs(r.val)}</span>
                    </div>
                    <div style={{ background: '#e2e8f0', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: r.color, borderRadius: 4, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PanelKPIs

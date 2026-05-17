/**
 * ChatAssistant.jsx
 * Asistente financiero IA flotante con TTS — powered by Gemini.
 * Voz: es-MX-JorgeNeural (Azure TTS via edge-tts API)
 */
import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Volume2, VolumeX, Send } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { salud, formatBs } from '../utils/calculos.js'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const MODELO_GEMINI  = 'gemini-3.1-flash-lite-preview'

const VOZ           = 'es-MX-JorgeNeural'
const VELOCIDAD_VOZ = '+20%'

let _audioCtx   = null
let _sourceNode = null

function getAudioCtx() {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return _audioCtx
}

function detenerAudio() {
  try { _sourceNode?.stop() } catch (_) {}
  _sourceNode = null
}

async function hablarJorge(texto, onEnd) {
  detenerAudio()

  const ssml = `<speak version='1.0' xml:lang='es-MX'><voice name='${VOZ}'><prosody rate='${VELOCIDAD_VOZ}'>${texto.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</prosody></voice></speak>`

  try {
    const res = await fetch('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'FinanzasClara/2.0',
      },
      body: ssml,
    })
    if (res.ok) {
      const buf     = await res.arrayBuffer()
      const ctx     = getAudioCtx()
      const decoded = await ctx.decodeAudioData(buf)
      _sourceNode   = ctx.createBufferSource()
      _sourceNode.buffer  = decoded
      _sourceNode.connect(ctx.destination)
      _sourceNode.onended = () => { _sourceNode = null; onEnd && onEnd() }
      _sourceNode.start()
      return
    }
  } catch (_) { /* fallback */ }

  if (!window.speechSynthesis) { onEnd && onEnd(); return }
  window.speechSynthesis.cancel()
  const utt   = new SpeechSynthesisUtterance(texto)
  utt.lang    = 'es-MX'
  utt.rate    = 1.05
  utt.pitch   = 0.85
  const voces = window.speechSynthesis.getVoices()
  const voz   =
    voces.find((v) => v.name.toLowerCase().includes('jorge')) ||
    voces.find((v) => v.lang === 'es-MX' && !v.name.toLowerCase().match(/dalia|female|woman/)) ||
    voces.find((v) => v.lang.startsWith('es-MX')) ||
    voces.find((v) => v.lang.startsWith('es')) ||
    null
  if (voz) utt.voice = voz
  utt.onend = () => onEnd && onEnd()
  window.speechSynthesis.speak(utt)
}

// ── ChatAssistant ─────────────────────────────────────────────────────────────
const ChatAssistant = ({ producto, metrics, negocio }) => {
  const [open, setOpen]           = useState(false)
  const [msgs, setMsgs]           = useState([
    { role: 'assistant', text: `Hola 👋 Soy tu asesor financiero. Pregúntame sobre costos, precios o rentabilidad de "${producto?.name || 'tu producto'}".` },
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [vozActiva, setVozActiva] = useState(true)
  const [hablando, setHablando]   = useState(false)
  const [isMobile, setIsMobile]   = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  useEffect(() => {
    setMsgs([{ role: 'assistant', text: `Hola 👋 Estoy analizando "${producto?.name || 'tu producto'}". ¿En qué te ayudo?` }])
  }, [producto?.id])

  const buildContext = () => {
    if (!producto || !metrics) return ''
    const h       = salud(metrics)
    const cfItems = (producto.costosF || []).map((c) => `  - ${c.nombre || 'sin nombre'} (${c.categoria}): Bs. ${parseFloat(c.monto || 0).toFixed(2)}`).join('\n') || '  (ninguno)'
    const cvItems = (producto.costosV || []).map((c) => `  - ${c.nombre || 'sin nombre'} (${c.categoria}): Bs. ${parseFloat(c.monto || 0).toFixed(2)} × ${c.cantUnidad || 1} = Bs. ${((parseFloat(c.monto) || 0) * (parseFloat(c.cantUnidad) || 1)).toFixed(2)}`).join('\n') || '  (ninguno)'
    return `
Eres un asesor financiero amigable para emprendedores bolivianos. Respondes en español, de forma directa y cálida. Máximo 3 oraciones. Sin bullets ni markdown. Hablas como si fueras un consultor de confianza.

CONTEXTO DEL NEGOCIO:
- Negocio: ${negocio?.nombre || 'Sin nombre'} (${negocio?.representante || 'sin representante'})

PRODUCTO ACTIVO: "${producto.name}"
- Categoría: ${producto.categoria}
- Unidad: ${producto.unidad}
- Producción estimada: ${producto.produccion} ${producto.unidad}
- Ventas estimadas: ${producto.ventas} ${producto.unidad}
- Precio actual: ${producto.precioActual > 0 ? formatBs(producto.precioActual) : 'no definido'}
- Margen deseado: ${producto.margen}%

COSTOS FIJOS:
${cfItems}
→ Total fijos: ${formatBs(metrics.cf)}

COSTOS VARIABLES:
${cvItems}
→ Total variables: ${formatBs(metrics.cv)}

MÉTRICAS CALCULADAS:
- Costo total: ${formatBs(metrics.ct)}
- Costo unitario: ${formatBs(metrics.cu)}
- Precio sugerido: ${formatBs(metrics.pSugerido)}
- Ganancia unitaria: ${formatBs(metrics.ganancia)}
- Margen real: ${metrics.margenReal.toFixed(1)}%
- Punto de equilibrio: ${Math.ceil(metrics.pe)} ${producto.unidad}
- Salud financiera: ${h.color === 'emerald' ? 'Rentable' : h.color === 'amber' ? 'Ajustado' : 'En riesgo'} — ${h.msg}
`.trim()
  }

  const enviar = async () => {
    const texto = input.trim()
    if (!texto || loading) return
    const newMsgs = [...msgs, { role: 'user', text: texto }]
    setMsgs(newMsgs)
    setInput('')
    setLoading(true)
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: MODELO_GEMINI, systemInstruction: buildContext() })
      const historialPrevio = newMsgs.slice(1, -1).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }))
      const chat   = model.startChat({ history: historialPrevio })
      const result = await chat.sendMessage(texto)
      const respText = result.response.text().trim() || 'No pude procesar tu consulta. Intenta de nuevo.'
      setMsgs((prev) => [...prev, { role: 'assistant', text: respText }])
      if (vozActiva) { setHablando(true); hablarJorge(respText, () => setHablando(false)) }
    } catch (err) {
      console.error('Gemini error:', err)
      setMsgs((prev) => [...prev, { role: 'assistant', text: 'Hubo un problema conectando con el asistente. Verifica tu clave API o tu conexión.' }])
    } finally {
      setLoading(false)
    }
  }

  const toggleVoz = () => {
    if (hablando) { detenerAudio(); window.speechSynthesis?.cancel(); setHablando(false) }
    setVozActiva((v) => !v)
  }

  // ── Responsive dimensions ─────────────────────────────────────────────────
  const btnRight   = isMobile ? 16 : 28
  const btnBottom  = isMobile ? 20 : 28
  const chatRight  = isMobile ? 12 : 28
  const chatBottom = isMobile ? 88 : 96
  const chatWidth  = isMobile ? 'calc(100vw - 24px)' : 360
  const chatMaxH   = isMobile ? 'calc(100svh - 120px)' : 520

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Abrir asesor financiero"
        style={{
          position: 'fixed', bottom: btnBottom, right: btnRight,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? '#4c1d95' : 'linear-gradient(135deg, #7c3aed, #4c1d95)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px #7c3aed55', zIndex: 1000,
          transition: 'all 0.2s ease',
          transform: open ? 'rotate(45deg) scale(0.95)' : 'scale(1)',
        }}
      >
        {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
      </button>

      {/* Ventana del chat */}
      {open && (
        <div style={{
          position: 'fixed', bottom: chatBottom, right: chatRight,
          width: chatWidth, maxHeight: chatMaxH,
          background: 'white', borderRadius: 18, border: '1px solid #e2e8f0',
          boxShadow: '0 8px 40px #0000001a', display: 'flex', flexDirection: 'column',
          zIndex: 999, overflow: 'hidden', fontFamily: "'Poppins', sans-serif",
        }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>🤖</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Asesor Financiero</div>
              <div style={{ fontSize: 11, color: '#c4b5fd', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {producto?.name || 'Analizando...'} · Jorge (es-MX)
              </div>
            </div>
            <button onClick={toggleVoz} title={vozActiva ? 'Silenciar' : 'Activar voz'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: hablando ? '#fbbf24' : '#c4b5fd', padding: 4, display: 'flex', flexShrink: 0 }}>
              {vozActiva ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>

          {/* Indicador de voz */}
          {hablando && (
            <div style={{ background: '#fef3c7', borderBottom: '1px solid #fcd34d', padding: '6px 14px', fontSize: 11, color: '#78350f', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1s infinite' }} />
              Jorge hablando…
            </div>
          )}

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '9px 13px',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : '#f1f5f9',
                  color: m.role === 'user' ? 'white' : '#1e293b',
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '9px 14px', borderRadius: '14px 14px 14px 4px', background: '#f1f5f9' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map((d) => (
                      <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6', animation: `bounce 1.2s ${d * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
              placeholder="¿Cómo bajo mi costo unitario?"
              disabled={loading}
              style={{ flex: 1, fontSize: 13, padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', fontFamily: 'inherit', background: '#f8fafc', color: '#1e293b' }}
            />
            <button
              onClick={enviar}
              disabled={loading || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: loading || !input.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}
            >
              <Send size={15} color={loading || !input.trim() ? '#94a3b8' : 'white'} />
            </button>
          </div>

          <style>{`
            @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
            @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
          `}</style>
        </div>
      )}
    </>
  )
}

export default ChatAssistant

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import type { SimState } from '../sim/engine'

// Floating window that embeds the 115VU / 22VU ignition & starting diagram (public/diagram-115vu)
// and keeps it in sync with the 3D cockpit: ENG MASTER 1/2 and ENG MODE are sent to the diagram
// whenever they change.
const DIAGRAM_URL = `${import.meta.env.BASE_URL}diagram-115vu/index.html?embed=1`

type EngMessage = { source: 'flight-sim'; type: 'eng-state'; engineMaster: [boolean, boolean]; ignition: string; engineN2: [number, number] }

export function Diagram115VUPanel({ state, close }: { state: SimState; close: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [maximized, setMaximized] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const send = useCallback(() => {
    const s = stateRef.current
    const msg: EngMessage = {
      source: 'flight-sim', type: 'eng-state',
      engineMaster: [s.engineMaster[0], s.engineMaster[1]],
      ignition: s.ignition,
      engineN2: [s.engineN2[0], s.engineN2[1]],
    }
    frame.current?.contentWindow?.postMessage(msg, window.location.origin)
  }, [])

  // Send when the 115VU controls change, and N2 roughly every whole percent so the readout stays current.
  const n2Key = state.engineN2.map(n => Math.round(n)).join(',')
  useEffect(() => { send() }, [state.engineMaster[0], state.engineMaster[1], state.ignition, n2Key, send])

  // The diagram announces when its script is ready; answer with the current cockpit state.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return
      if (e.data?.source === 'diagram-115vu' && e.data?.type === 'ready') send()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [send])

  const closeRef = useRef(close)
  closeRef.current = close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Drag by the title bar.
  function startDrag(e: ReactPointerEvent<HTMLDivElement>) {
    if (maximized || (e.target as HTMLElement).closest('button') || !panel.current) return
    const rect = panel.current.getBoundingClientRect()
    const dx = e.clientX - rect.left, dy = e.clientY - rect.top
    const cover = document.createElement('div') // keeps pointer events away from the iframe while dragging
    cover.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:grabbing'
    document.body.appendChild(cover)
    const move = (ev: PointerEvent) => {
      const x = Math.min(Math.max(ev.clientX - dx, 0), window.innerWidth - 120)
      const y = Math.min(Math.max(ev.clientY - dy, 0), window.innerHeight - 48)
      setPos({ x, y })
    }
    const up = () => { cover.remove(); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const style = maximized || !pos ? undefined : { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' }
  return <div ref={panel} className={`diagram-panel ${maximized ? 'maximized' : ''}`} style={style} role="dialog" aria-label="Diagrama ENG 115VU">
    <div className="diagram-panel-bar" onPointerDown={startDrag} onDoubleClick={() => setMaximized(v => !v)}>
      <span className="diagram-panel-title"><span className="status-dot" />ENG 115VU · Ignition &amp; Starting</span>
      <span>
        <button className="icon-button" aria-label={maximized ? 'Restaurar tamaño' : 'Maximizar'} title={maximized ? 'Restaurar' : 'Maximizar'} onClick={() => setMaximized(v => !v)}>{maximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
        <button className="icon-button" aria-label="Cerrar diagrama" title="Cerrar (Esc)" onClick={close}><X size={16} /></button>
      </span>
    </div>
    <iframe ref={frame} src={DIAGRAM_URL} title="Diagrama del sistema de ignición y arranque, paneles 115VU y 22VU" onLoad={send} />
  </div>
}

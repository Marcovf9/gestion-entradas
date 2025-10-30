import React, { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const ZONE_STYLES = {
  'Platea Baja':             { color: '#f6c453', x: 210, y: 150, rotate: 0,  seatSize: 18, gapX: 6, gapY: 6 },
  'Platea VIP Central':      { color: '#b67ad2', x: 140, y: 300, rotate: 0,  seatSize: 16, gapX: 6, gapY: 6,
                               gaps: { 4: [13], 5: [14], 6: [15] } },
  'Palco Superior Central':  { color: '#7aa7ff', x: 160, y: 510, rotate: 0,  seatSize: 16, gapX: 6, gapY: 6 },
  'Palco VIP A':             { color: '#9a7ff5', x: 60,  y: 340, rotate: -25, seatSize: 14, gapX: 6, gapY: 6 },
  'Palco VIP B':             { color: '#9a7ff5', x: 560, y: 340, rotate:  25, seatSize: 14, gapX: 6, gapY: 6 },
  'Palco Gold A':            { color: '#7ed087', x: 150, y: 210, rotate: -45, seatSize: 14, gapX: 6, gapY: 6 },
  'Palco Gold B':            { color: '#7ed087', x: 480, y: 210, rotate:  45, seatSize: 14, gapX: 6, gapY: 6 },
  'Palco Superior A':        { color: '#a3b4ff', x: 60,  y: 220, rotate: 0,  seatSize: 12, gapX: 6, gapY: 6 },
  'Palco Superior B':        { color: '#a3b4ff', x: 580, y: 220, rotate: 0,  seatSize: 12, gapX: 6, gapY: 6 },
};

const LEGEND = [
  { label: 'Disponible', color: '#ffffff', border: '#ccc' },
  { label: 'Seleccionado', color: '#ffe08a', border: '#b28a00' },
  { label: 'Ocupado', color: '#bbbbbb', border: '#888' },
];

export default function App() {
  const [seats, setSeats] = useState([]);
  const [zones, setZones] = useState([]);
  const [selected, setSelected] = useState([]);
  const [buyer, setBuyer] = useState({ nombre: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API}/api/seats`).then(r=>r.json()).then(setSeats);
    fetch(`${API}/api/zones`).then(r=>r.json()).then(setZones);
  }, []);

  const zonesById = useMemo(() => Object.fromEntries(zones.map(z=>[z.id,z])), [zones]);

  const grouped = useMemo(() => {
    const res = new Map();
    for (const s of seats) {
      const zname = zonesById[s.zonaId]?.nombre || 'Zona';
      if (!res.has(zname)) res.set(zname, {});
      if (!res.get(zname)[s.fila]) res.get(zname)[s.fila] = [];
      res.get(zname)[s.fila].push(s);
    }
    for (const zname of res.keys()) {
      const rows = res.get(zname);
      Object.keys(rows).forEach(r => rows[r].sort((a,b)=>a.columna-b.columna));
    }
    return res;
  }, [seats, zonesById]);

  const total = useMemo(() => selected.reduce((acc, id) => {
    const s = seats.find(x=>x.id===id);
    const p = zonesById[s?.zonaId]?.precio || 0;
    return acc + p;
  }, 0), [selected, seats, zonesById]);

  function toggleSeat(seat) {
    if (!seat.disponible) return;
    setSelected(prev => prev.includes(seat.id) ? prev.filter(i=>i!==seat.id) : [...prev, seat.id]);
  }

  async function purchase() {
    setMessage('');
    const res = await fetch(`${API}/api/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compradorNombre: buyer.nombre, compradorEmail: buyer.email, butacaIds: selected })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ Compra confirmada. Venta #${data.ventaId} - Total $${data.total}`);
      const newSeats = await (await fetch(`${API}/api/seats`)).json();
      setSeats(newSeats);
      setSelected([]);
    } else {
      setMessage(`❌ Error: ${data.error || 'No se pudo procesar'}`);
    }
  }

  function ZoneBlock({ zoneName, rowsMap }) {
    const styleDef = ZONE_STYLES[zoneName] || { x:0, y:0, rotate:0, seatSize:16, color:'#ddd', gapX:6, gapY:6 };
    const price = zones.find(z=>z.nombre===zoneName)?.precio || 0;
    const rows = Object.keys(rowsMap).map(k => parseInt(k,10)).sort((a,b)=>a-b);

    return (
      <div
        style={{ position: 'absolute', left: styleDef.x, top: styleDef.y, transform: `rotate(${styleDef.rotate}deg)` }}
      >
        <div style={{ marginBottom: 6, background: styleDef.color, padding: '4px 8px', color: '#fff', borderRadius: 6, display: 'inline-block' }}>
          <b>{zoneName}</b> <span style={{ opacity: 0.85 }}> (${price})</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: styleDef.gapY }}>
          {rows.map(fila => {
            const rowSeats = rowsMap[fila];
            const gapAfter = (ZONE_STYLES[zoneName]?.gaps?.[fila]) || [];
            return (
              <div key={fila} style={{ display: 'flex', gap: styleDef.gapX, alignItems: 'center' }}>
                {rowSeats.map((seat, idx) => {
                  const isSelected = selected.includes(seat.id);
                  const seatStyle = {
                    width: styleDef.seatSize, height: styleDef.seatSize,
                    borderRadius: 4, border: '1px solid #ccc',
                    background: seat.disponible ? (isSelected ? '#ffe08a' : '#fff') : '#bbb',
                    cursor: seat.disponible ? 'pointer' : 'not-allowed'
                  };
                  const cell = (
                    <div key={seat.id} title={`Fila ${seat.fila} - Asiento ${seat.columna}`}
                         onClick={() => toggleSeat(seat)} style={seatStyle} />
                  );
                  const shouldGap = gapAfter.includes(idx+1);
                  return (
                    <React.Fragment key={seat.id}>
                      {cell}
                      {shouldGap && <div style={{ width: styleDef.seatSize*1.2 }} />}
                    </React.Fragment>
                  );
                })}
              </div>
            )
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <h1>Mapa de Butacas — Teatro</h1>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', width: 720, height: 620, background: '#eef1f7', borderRadius: 12, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.08)' }}>
          <div style={{ position: 'absolute', left: 200, top: 40, width: 320, height: 60, background: '#888', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color:'#fff', fontWeight: 700 }}>
            ESCENARIO
          </div>
          {[...grouped.keys()].map(zoneName => (
            <ZoneBlock key={zoneName} zoneName={zoneName} rowsMap={grouped.get(zoneName)} />
          ))}
        </div>

        <div style={{ minWidth: 280 }}>
          <h3>Resumen</h3>
          <p>Seleccionadas: {selected.length} — Total: <b>${total}</b></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input placeholder="Nombre" value={buyer.nombre} onChange={e=>setBuyer(v=>({...v, nombre: e.target.value}))} />
            <input placeholder="Email" value={buyer.email} onChange={e=>setBuyer(v=>({...v, email: e.target.value}))} />
            <button onClick={purchase} disabled={!buyer.nombre || !buyer.email || selected.length===0}>Confirmar compra</button>
          </div>
          {message && <p style={{ marginTop: 8 }}>{message}</p>}

          <h3 style={{ marginTop: 20 }}>Precios por zona</h3>
          <ul>
            {zones.sort((a,b)=>a.nombre.localeCompare(b.nombre)).map(z => (
              <li key={z.id}><span style={{ display: 'inline-block', width: 12, height: 12, background: (ZONE_STYLES[z.nombre]?.color || '#ddd'), borderRadius: 3, marginRight: 6 }} /> {z.nombre}: <b>${z.precio}</b></li>
            ))}
          </ul>

          <h3>Leyenda</h3>
          <ul>
            {LEGEND.map(i => (
              <li key={i.label}><span style={{ display: 'inline-block', width: 12, height: 12, background: i.color, border: `1px solid ${i.border}`, borderRadius: 3, marginRight: 6 }} /> {i.label}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// URL base de tu backend
const API_BASE_URL = 'http://localhost:4000/api'; 
// Número de WhatsApp (debe incluir el código de país sin el + ni 00)
const WHATSAPP_NUMBER = "5493512345678"; 
const RESERVATION_DURATION_MINUTES = 30;

function App() {
  const [seats, setSeats] = useState([]);
  const [zones, setZones] = useState([]);
  const [selected, setSelected] = useState([]);
  const [buyer, setBuyer] = useState({ nombre: '', email: '' });
  const [message, setMessage] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar el re-fetch

  // --- 1. Fetch de datos y limpieza periódica ---
  const fetchSeats = useCallback(async () => {
    try {
      // 1. Ejecutar limpieza de reservas expiradas (endpoint GET)
      await fetch(`${API_BASE_URL}/cleanup-reservations`, { method: 'GET' });
      
      // 2. Cargar datos actualizados
      const seatsRes = await fetch(`${API_BASE_URL}/seats`);
      const seatsData = await seatsRes.json();
      setSeats(seatsData);
      
      const zonesRes = await fetch(`${API_BASE_URL}/zones`);
      const zonesData = await zonesRes.json();
      setZones(zonesData);
      
      // Filtramos las butacas seleccionadas que ya no están disponibles/reservadas
      setSelected(prev => prev.filter(id => {
        const seat = seatsData.find(s => s.id === id);
        return seat && seat.disponible && seat.estadoReserva !== 'RESERVED';
      }));

    } catch (err) {
      console.error("Error al cargar datos:", err);
      // Solo mostramos un mensaje de error si no estamos ya en un proceso
      if (!isReserving) {
         setMessage('❌ Error al conectar con el servidor. Asegúrese que el backend está corriendo.');
      }
    }
  }, [isReserving]);

  useEffect(() => {
    fetchSeats();
    // Refresco periódico para actualizar el estado de las butacas
    const refreshInterval = setInterval(fetchSeats, 60000); // Cada 60 segundos
    return () => clearInterval(refreshInterval);
  }, [fetchSeats, refreshKey]);

  // --- 2. Cálculos y Mapeo de Datos ---
  const zonesById = useMemo(() => zones.reduce((map, zone) => {
    map[zone.id] = { ...zone, color: zone.color || '#cccccc' };
    return map;
  }, {}), [zones]);

  // Agrupa butacas por zona y luego por fila
  const grouped = useMemo(() => {
    const map = new Map();
    const sortedSeats = [...seats].sort((a, b) => {
      // Ordenar por fila (ascendente) y luego por columna (ascendente)
      if (a.fila < b.fila) return -1;
      if (a.fila > b.fila) return 1;
      return a.columna - b.columna;
    });

    for (const seat of sortedSeats) {
      const zoneName = zonesById[seat.zonaId]?.nombre || 'Zona Desconocida';
      if (!map.has(zoneName)) {
        map.set(zoneName, new Map());
      }
      const zoneMap = map.get(zoneName);
      if (!zoneMap.has(seat.fila)) {
        zoneMap.set(seat.fila, []);
      }
      zoneMap.get(seat.fila).push(seat);
    }
    return map;
  }, [seats, zonesById]);

  const total = useMemo(() => selected.reduce((acc, id) => {
    const s = seats.find(x => x.id === id);
    const p = zonesById[s?.zonaId]?.precio || 0;
    return acc + p;
  }, 0), [selected, seats, zonesById]);

  const selectedDetails = useMemo(() => {
    return selected.map(id => {
      const seat = seats.find(x => x.id === id);
      const zoneName = zonesById[seat?.zonaId]?.nombre;
      const price = zonesById[seat?.zonaId]?.precio;
      return { id: seat?.id, fila: seat?.fila, columna: seat?.columna, zoneName, price };
    });
  }, [selected, seats, zonesById]);
  
  // --- 3. Lógica de Interfaz y Estados ---
  function getSeatColorClass(seat) {
    const zoneColor = zonesById[seat.zonaId]?.color || '#a0a0a0'; 

    // Vendida (Ocupada)
    if (!seat.disponible) return 'bg-gray-800 text-white cursor-not-allowed opacity-75'; 
    
    // Reservada por otro cliente (Amarillo)
    if (seat.estadoReserva === 'RESERVED') {
      const expires = new Date(seat.reservaHasta).getTime();
      if (expires > Date.now()) {
        return `bg-yellow-400 text-gray-800 cursor-not-allowed animate-pulse`; 
      }
      // Si expiró, se verá disponible localmente hasta el siguiente fetch
    }
    
    // Seleccionada por el usuario actual (Azul)
    if (selected.includes(seat.id)) return 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-300'; 
    
    // Disponible (Usamos el color de la zona como color de borde, con fondo blanco)
    return `bg-white text-gray-700 border-2 border-[${zoneColor}] hover:bg-gray-100 cursor-pointer`; 
  }

  function toggleSeat(seat) {
    if (!seat.disponible || seat.estadoReserva === 'RESERVED') return;
    
    setSelected(prev => {
      const isSelected = prev.includes(seat.id);
      return isSelected ? prev.filter(i => i !== seat.id) : [...prev, seat.id];
    });
  }

  // --- 4. Función de Reserva por WhatsApp ---
  async function handleWhatsAppReservation() {
    setMessage('');
    const { nombre, email } = buyer;
    
    if (!nombre || !email || selected.length === 0) {
      setMessage('❌ Por favor, ingrese su nombre, email y seleccione al menos una butaca.');
      return;
    }

    setIsReserving(true);

    try {
        // Petición al backend para crear la reserva temporal
        const response = await fetch(`${API_BASE_URL}/reserve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ butacaIds: selected, compradorNombre: nombre, compradorEmail: email }),
        });

        const data = await response.json();
        
        if (response.status !== 200) {
          setMessage(`❌ Error al reservar: ${data.message || data.error || 'Butaca(s) no disponible(s)'}.`);
          setRefreshKey(prev => prev + 1);
          return;
        }

        // Reserva exitosa: armar el mensaje de WhatsApp
        const expiryDate = new Date(data.reservaHasta);
        const expiresAtText = expiryDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        
        let messageText = `¡Hola! Me gustaría confirmar la reserva de entradas para el show "Latidos de la Historia".\n\n`;
        messageText += `*ID de Reserva*: ${data.reservaId}\n`;
        messageText += `*Reservado hasta*: ${expiresAtText} (Tienes ${RESERVATION_DURATION_MINUTES} minutos para pagar).\n\n`;
        messageText += `*Comprador*: ${nombre}\n`;
        messageText += `*Email*: ${email}\n`;
        messageText += `*Total a Pagar*: $${total.toLocaleString('es-AR')}\n\n`;
        
        messageText += `*Butacas Seleccionadas*:\n`;
        selectedDetails.forEach(detail => {
          messageText += `- ${detail.zoneName} - Fila ${detail.fila} - Asiento ${detail.columna}\n`;
        });
        
        messageText += `\n*Paso a Seguir*: Por favor, realiza la transferencia/pago y envíanos el comprobante de $${total.toLocaleString('es-AR')} a este chat mencionando tu ID de Reserva: ${data.reservaId}.`;

        const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageText)}`;

        // Abrir WhatsApp y actualizar la interfaz
        window.open(whatsappLink, '_blank');
        
        // Limpiamos la selección actual y forzamos el re-fetch para actualizar el mapa
        setSelected([]);
        setBuyer({ nombre: '', email: '' });
        fetchSeats(); 
        
        setMessage(`✅ ¡Reserva Exitosa! Tu ID de Reserva es *${data.reservaId}*. Por favor, envía tu comprobante antes de las ${expiresAtText} para asegurar tus butacas.`);

    } catch (error) {
        console.error('Error en la reserva:', error);
        setMessage('❌ Error de conexión con el servidor. Por favor, inténtelo de nuevo.');
    } finally {
        setIsReserving(false);
    }
  }
  
  // Componente para la Butaca con estilos mejorados
  const SeatComponent = ({ seat }) => {
    const isReserved = seat.estadoReserva === 'RESERVED' && new Date(seat.reservaHasta).getTime() > Date.now();
    const isSold = !seat.disponible;
    const isSelected = selected.includes(seat.id);

    const seatColorClass = getSeatColorClass(seat);
    const seatId = `seat-${seat.id}`;
    const zoneName = zonesById[seat.zonaId]?.nombre || 'N/A';
    const price = zonesById[seat.zonaId]?.precio || 0;

    let titleText = isSold ? 'Vendida' : 
                    isReserved ? `Reservada temporalmente (${zoneName})` : 
                    `Disponible: $${price} (${zoneName})`;

    // Solo se permite click si está disponible y no reservada
    const handleClick = () => {
        if (!isSold && !isReserved) {
            toggleSeat(seat);
        }
    };
    
    // Lógica para mostrar la columna o un ícono
    const content = isSold ? 'X' : seat.columna;

    return (
      <div 
        id={seatId}
        key={seat.id} 
        className={`w-7 h-7 m-[1px] lg:m-[2px] inline-flex items-center justify-center text-xs font-bold rounded-md transition duration-150 ease-in-out select-none shadow-sm
          ${seatColorClass}
          ${isSold || isReserved ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        `}
        onClick={handleClick}
        title={titleText}
      >
        {content}
      </div>
    );
  };
  
  // Componente para renderizar una zona y sus filas de asientos
  const ZoneBlock = ({ zoneName, rowsMap }) => {
    const rows = Array.from(rowsMap.keys());
    
    const firstSeat = rowsMap.get(rows[0])?.[0];
    const zonePrice = zonesById[firstSeat?.zonaId]?.precio || 'N/A';
    const zoneColor = zonesById[firstSeat?.zonaId]?.color || '#a0a0a0';
    
    // Renderizamos las filas de asientos
    return (
      <div className="my-4 border rounded-lg bg-white shadow-inner p-3">
        <h3 className="text-sm font-bold mb-1" style={{ color: zoneColor }}>
          {zoneName} <span className="font-normal text-gray-500">($ {zonePrice.toLocaleString('es-AR')} c/u)</span>
        </h3>
        <div className="flex flex-col gap-1">
          {rows.map(row => (
            <div key={row} className="flex items-center justify-center">
              {/* Número de fila en un pequeño marcador */}
              <span className="w-5 text-right font-mono text-xs mr-1 text-gray-500">{row}</span>
              <div className="flex flex-wrap items-center justify-center border-t border-b border-gray-200">
                {rowsMap.get(row).map(seat => (
                  <SeatComponent key={seat.id} seat={seat} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Leyenda estilizada
  const Legend = () => (
    <div className="mt-6 pt-4 border-t border-gray-200 bg-white rounded-xl p-4 shadow-md">
      <h4 className="text-lg font-bold text-gray-700 mb-3">Leyenda de Colores</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md border-2 border-green-500 bg-white"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-600 rounded-md"></div>
          <span>Seleccionada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-md animate-pulse"></div>
          <span>Reservada (Temp)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800 rounded-md"></div>
          <span>Ocupada/Vendida</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        El color del borde en los asientos disponibles indica la Zona (VIP, Platea, etc.).
      </p>
    </div>
  );


  // --- Renderización Principal ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 text-center bg-white p-6 rounded-xl shadow-lg">
          <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">Latidos de la Historia</h1>
          <p className="text-lg text-gray-600 mt-2">Seleccione sus butacas para el show de fin de año.</p>
          <p className="text-sm font-medium text-orange-600 mt-3 p-2 bg-yellow-50 rounded-lg inline-block shadow-inner">
            🚨 **Proceso Manual:** Sus butacas se reservan temporalmente por {RESERVATION_DURATION_MINUTES} minutos. Complete el pago por WhatsApp para confirmar.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Columna 1 & 2: Mapa de Butacas */}
          <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="relative w-full mx-auto bg-gray-200 rounded-xl shadow-2xl p-4 lg:p-6 mb-6">
                
                {/* Escenario */}
                <div className="mb-8 bg-gray-800 text-white rounded-lg shadow-xl text-center py-3 font-semibold tracking-wider text-sm lg:text-lg">
                  ESCENARIO
                </div>
                
                {/* Contenedor de Zonas/Asientos */}
                <div className="overflow-x-auto p-2">
                  <div className="min-w-[700px] mx-auto flex flex-col items-center">
                      {[...grouped.keys()].map(zoneName => (
                        <ZoneBlock key={zoneName} zoneName={zoneName} rowsMap={grouped.get(zoneName)} />
                      ))}
                  </div>
                </div>
              </div>
              
              <Legend />
          </div>

          {/* Columna 3: Resumen y Formulario */}
          <div className="lg:col-span-1 order-1 lg:order-2 sticky top-4 p-6 bg-white rounded-xl shadow-2xl">
            
            <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-indigo-600">Resumen de Reserva</h2>
            
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-700">Butacas seleccionadas: <span className="font-extrabold text-indigo-600">{selected.length}</span></p>
              <p className="text-4xl font-extrabold text-green-700 mt-1">Total: <span className="text-green-600">${total.toLocaleString('es-AR')}</span></p>
            </div>
            
            <h3 className="text-xl font-bold mb-2 border-t pt-4">Datos de Contacto</h3>
            <div className="flex flex-col gap-3 mb-6">
              <input 
                className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                placeholder="Nombre y Apellido" 
                value={buyer.nombre} 
                onChange={e => setBuyer(v => ({ ...v, nombre: e.target.value }))}
                required
              />
              <input 
                className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150" 
                placeholder="Email" 
                type="email"
                value={buyer.email} 
                onChange={e => setBuyer(v => ({ ...v, email: e.target.value }))}
                required
              />
            </div>

            <div className="p-4 border rounded-lg bg-gray-50 mb-6 max-h-40 overflow-y-auto shadow-inner">
               <p className="font-bold text-gray-700 mb-2 border-b pb-1">Detalle por Butaca:</p>
               <ul className="space-y-1 text-sm text-gray-700">
                  {selectedDetails.map(detail => (
                      <li key={detail.id} className="flex justify-between">
                          <span className="font-medium text-gray-600">{detail.zoneName} - Fila {detail.fila}, Asiento {detail.columna}</span>
                          <span className="font-bold text-gray-800">${detail.price.toLocaleString('es-AR')}</span>
                      </li>
                  ))}
                  {selected.length === 0 && <li className="text-center text-gray-500 italic py-2">Seleccione butacas en el mapa.</li>}
               </ul>
            </div>

            <button 
              onClick={handleWhatsAppReservation} 
              disabled={!buyer.nombre || !buyer.email || selected.length === 0 || isReserving}
              className="w-full py-4 bg-green-600 text-white font-extrabold rounded-xl hover:bg-green-700 transition duration-150 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.01] active:scale-100"
            >
              {isReserving ? 'Procesando Reserva...' : 'Reservar y Pagar por WhatsApp'}
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM19 4a4 4 0 00-4-4H5a4 4 0 00-4 4v12a4 4 0 004 4h10a4 4 0 004-4V4zM5 18a2 2 0 01-2-2V4a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H5zM8 17a1 1 0 100-2 1 1 0 000 2z"/>
             </svg>
          </button>
          
          {message && <p className={`mt-4 p-3 rounded-lg text-sm font-medium ${message.startsWith('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</p>}
        </div>
      </div>
    </div>
    </div>
  );
}
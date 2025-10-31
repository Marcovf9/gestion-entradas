import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';

// Importación de rutas
import seatsRouter from './routes/seats.js';
import zonesRouter from './routes/zones.js';
// ¡CORREGIDO! Importamos el router por defecto
import reservationsRouter from './routes/reservations.js'; 

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json()); // Permite parsear JSON en el cuerpo de las peticiones

// Rutas
app.get('/', (req, res) => {
  res.send('Tickets App Backend Running');
});

// Registrar routers
app.use('/api', seatsRouter);
app.use('/api', zonesRouter);

// Usamos el router de reservas
app.use('/api', reservationsRouter); 


// Inicialización del servidor
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection} = require('./config/databaseconfig');
const clienteRoutes = require('./routes/clienteRoutes');

const app = express();
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors());
app.use(express.json());

//Rutas
app.use('/api/clientes', clienteRoutes);

//Ruta de bienvenida a la app
app.get('/', (req, res) => {
    res.json({
        message: 'API de Barbería',
        version: '1.0.0',
        endpoints: {
            clientes: {
                crear: 'POST /api/clientes',
                listar: 'GET /api/clientes',
                obtener: 'GET /api/clientes/:id',
                actualizar: 'PUT /api/clientes/:id',
                eliminar: 'DELETE /api/clientes/:id'               
            }
        }
    });
});


// Manejador de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

async function startServer() {
    const dbConnected = await testConnection();

    if (!dbConnected) {
        console.error('❌ No se pudo conectar a la base de datos. Saliendo...');
        process.exit(1);
    }

    app.listen(PORT, ()=>{
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

startServer();
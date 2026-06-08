require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const shipmentRoutes = require('./routes/shipmentRoutes');

const app = express();

// Menggunakan PORT_DISTRIBUSI dari .env tunggal
const PORT = process.env.PORT_DISTRIBUSI || 3005;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API MBG Barokah - Service Distribusi',
            version: '1.0.0',
            description: 'Dokumentasi API Monitoring Pengiriman (Microservices Aggregator)',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
    },
    apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/distribusi', shipmentRoutes);

sequelize.sync({ alter: true }) 
    .then(() => {
        console.log(`✅ Database [${process.env.DB_NAME || 'mbg'}] Terkoneksi`);
        console.log(`📖 Swagger: http://localhost:${PORT}/api-docs`);
        app.listen(PORT, () => console.log(`🚀 Server on port: ${PORT}`));
    })
    .catch(err => console.error('❌ Gagal:', err.message));
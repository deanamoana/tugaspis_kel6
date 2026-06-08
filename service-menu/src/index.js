require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const menuRoutes = require('./routes/menuRoutes');

const app = express();

// Menggunakan PORT_MENU dari .env tunggal
const PORT = process.env.PORT_MENU || 3002;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API MBG Barokah - Service Menu',
            version: '1.0.0',
            description: 'Dokumentasi API untuk Manajemen Paket Menu Makanan',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
    },
    apis: ['./src/routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/menu', menuRoutes);

app.get('/', (req, res) => {
    res.send(`🚀 Service Menu sedang berjalan di port ${PORT}`);
});

sequelize.sync({ alter: true })
    .then(() => {
        console.log('--------------------------------------------------');
        console.log(`✅ Database [${process.env.DB_NAME || 'mbg'}] Terhubung & Sinkron`);
        console.log(`📖 Dokumentasi API: http://localhost:${PORT}/api-docs`);
        console.log('--------------------------------------------------');
        app.listen(PORT, () => {
            console.log(`🚀 Service Menu: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Gagal sinkronisasi database Menu:', err.message);
    });
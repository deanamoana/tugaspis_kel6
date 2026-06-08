require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const dapurRoutes = require('./routes/dapurRoutes');

const app = express();

// Menggunakan PORT_DAPUR dari .env tunggal
const PORT = process.env.PORT_DAPUR || 3001; 

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API MBG Barokah - Service Dapur',
            version: '1.0.0',
            description: 'Dokumentasi API untuk Manajemen Operasional Dapur',
        },
        servers: [{ url: `http://localhost:${PORT}` }],
    },
    apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/dapur', dapurRoutes);

app.get('/', (req, res) => {
    res.send(`🚀 Service Dapur berjalan di port ${PORT}`);
});

sequelize.sync({ alter: true }) 
    .then(() => {
        console.log(`✅ Database [${process.env.DB_NAME || 'mbg'}] Terkoneksi`);
        console.log(`📖 Swagger: http://localhost:${PORT}/api-docs`);
        app.listen(PORT, () => console.log(`🚀 Server on port: ${PORT}`));
    })
    .catch(err => console.error('❌ Gagal:', err.message));
const express = require('express');
const router = express.Router();
const shipmentsController = require('../controllers/shipmentsController');

/**
 * @openapi
 * /api/distribusi:
 *   get:
 *     summary: Ambil semua data pengiriman (Data agregat dari Dapur, Menu, & Sekolah)
 *     tags: [Distribusi]
 *   post:
 *     summary: Buat jadwal pengiriman baru
 *     tags: [Distribusi]
 */
router.get('/', shipmentsController.getAllShipments);
router.post('/', shipmentsController.createShipment);

/**
 * @openapi
 * /api/distribusi/{id}:
 *   get:
 *     summary: Ambil detail pengiriman berdasarkan ID
 *     tags: [Distribusi]
 *   put:
 *     summary: Update status pengiriman & waktu sampai otomatis
 *     tags: [Distribusi]
 *   delete:
 *     summary: Hapus riwayat pengiriman
 *     tags: [Distribusi]
 */
router.get('/:id', shipmentsController.getShipmentById);
router.put('/:id', shipmentsController.updateShipment);
router.delete('/:id', shipmentsController.deleteShipment);

module.exports = router;
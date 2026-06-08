const Dapur = require('../models/dapur');

exports.getAllDapur = async (req, res) => {
    try {
        const data = await Dapur.findAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDapurById = async (req, res) => {
    try {
        const data = await Dapur.findByPk(req.params.id);
        if (data) res.json(data);
        else res.status(404).json({ message: 'Dapur tidak ditemukan' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createDapur = async (req, res) => {
    try {
        const data = await Dapur.create(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateDapur = async (req, res) => {
    try {
        const [updated] = await Dapur.update(req.body, { where: { id_dapur: req.params.id } });
        if (updated) res.json({ message: 'Dapur berhasil diupdate' });
        else res.status(404).json({ message: 'Dapur tidak ditemukan' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteDapur = async (req, res) => {
    try {
        const deleted = await Dapur.destroy({ where: { id_dapur: req.params.id } });
        if (deleted) res.json({ message: 'Dapur berhasil dihapus' });
        else res.status(404).json({ message: 'Dapur tidak ditemukan' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
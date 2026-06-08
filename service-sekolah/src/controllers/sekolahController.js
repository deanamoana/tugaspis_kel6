const Sekolah = require('../models/sekolah');

exports.getAllSekolah = async (req, res) => {
    try { res.json(await Sekolah.findAll()); } 
    catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSekolahById = async (req, res) => {
    try {
        const sekolah = await Sekolah.findByPk(req.params.id);
        if (!sekolah) return res.status(404).json({ message: "Sekolah tidak ditemukan" });
        res.json(sekolah);
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createSekolah = async (req, res) => {
    try { res.status(201).json(await Sekolah.create(req.body)); } 
    catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateSekolah = async (req, res) => {
    try {
        const [updated] = await Sekolah.update(req.body, { where: { id_sekolah: req.params.id } });
        if (updated) res.json({ message: "Data sekolah diupdate" });
        else res.status(404).json({ message: "Sekolah tidak ditemukan" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteSekolah = async (req, res) => {
    try {
        await Sekolah.destroy({ where: { id_sekolah: req.params.id } });
        res.json({ message: "Sekolah dihapus" });
    } catch (err) { res.status(500).json({ message: err.message }); }
};
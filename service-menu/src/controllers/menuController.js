const { Menu, MenuRecipe } = require('../models/menu');
const axios = require('axios');


exports.getAllMenu = async (req, res) => {
    try {
        const data = await Menu.findAll({
            include: [{ model: MenuRecipe }]
        });

        const invRes = await axios.get('http://localhost:3004/api/inventory');
        const inventoryList = invRes.data;

        const result = data.map(menu => {
            const menuJson = menu.toJSON();
            menuJson.MenuRecipes = menuJson.MenuRecipes.map(recipe => {
                const bahan = inventoryList.find(i => i.id_inventory === recipe.id_inventory);
                return {
                    ...recipe,
                    nama_bahan: bahan ? bahan.nama_bahan : 'Unknown',
                    satuan: bahan ? bahan.satuan : ''
                };
            });
            return menuJson;
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.getMenuById = async (req, res) => {
    try {
        const menu = await Menu.findByPk(req.params.id, {
            include: [{ model: MenuRecipe }]
        });
        if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });

        const invRes = await axios.get('http://localhost:3004/api/inventory');
        const inventoryList = invRes.data;

        const menuJson = menu.toJSON();
        menuJson.MenuRecipes = menuJson.MenuRecipes.map(recipe => {
            const bahan = inventoryList.find(i => i.id_inventory === recipe.id_inventory);
            return {
                ...recipe,
                nama_bahan: bahan ? bahan.nama_bahan : 'Unknown',
                satuan: bahan ? bahan.satuan : ''
            };
        });

        res.json(menuJson);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createMenu = async (req, res) => {
    try {
        // 1. Simpan Menu & Resep baru ke database db_menu
        const newMenu = await Menu.create(req.body, { 
            include: [{ model: MenuRecipe }] 
        });

        // 2. Ambil data resep dari req.body (form frontend) agar strukturnya murni sesuai input user
        const resepInput = req.body.MenuRecipes || req.body.menu_recipes || newMenu.MenuRecipes;

        if (resepInput && resepInput.length > 0) {
            // Mapping ulang payload agar namanya 100% klop dengan reduce-bulk milik Service Inventory
            const kebutuhanBahan = resepInput.map(r => {
                return {
                    // Antisipasi jika frontend mengirim id_inventory, id_bahan, atau id_bahan_baku
                    id_inventory: r.id_inventory || r.id_bahan || r.id_barang,
                    
                    // Sesuai dengan rumus reduce-bulk di processProduction: r.jumlah_kebutuhan * jumlah_porsi
                    // Karena ini pendaftaran menu awal, kita kurangi senilai base resepnya saja (porsi = 1)
                    total_kurangi: Number(r.jumlah_kebutuhan || r.jumlah || r.jml) * 1
                };
            });

            // Log untuk debugging di terminal console backend menu kamu, biar kelihatan datanya sehat/tidak
            console.log("PAYLOAD KE INVENTORY:", kebutuhanBahan);

            // 3. Tembak ke Service Inventory di Port 3004
            await axios.post('http://localhost:3004/api/inventory/reduce-bulk', {
                id_dapur: req.body.id_dapur || 1, // Mengambil id_dapur dari form (Dapur Pusat Pelita)
                items: kebutuhanBahan
            });
        }

        res.status(201).json({
            message: "Menu & Resep berhasil dibuat, serta stok di Inventory otomatis berkurang!",
            data: newMenu
        });
    } catch (err) {
        console.error("EROR SYSTEM:", err); // Biar eror detailnya kelihatan di terminal VS Code-mu
        res.status(400).json({ 
            message: "Gagal membuat menu atau sinkronisasi stok gagal: " + (err.response?.data?.message || err.message) 
        });
    }
};
exports.getMenuKebutuhan = async (req, res) => {
    try {
        const { id, id_sekolah } = req.params;

        const menu = await Menu.findByPk(id);
        if (!menu) return res.status(404).json({ message: "Menu tidak ditemukan" });

        const sekolahRes = await axios.get(`http://localhost:3003/api/sekolah/${id_sekolah}`);
        const jumlahSiswa = sekolahRes.data.jumlah_siswa;

        res.json({
            id_menu: menu.id_menu,
            nama_menu: menu.nama_paket,
            sekolah: sekolahRes.data.nama_sekolah,
            total_porsi_target: jumlahSiswa,
            status: "Data sinkron dengan Service Sekolah"
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Gagal sinkronisasi data sekolah. Pastikan Service Sekolah (Port 3003) jalan.",
            error: err.message 
        });
    }
};

exports.processProduction = async (req, res) => {
    try {
        const { id_menu, id_dapur, jumlah_porsi } = req.body;

        const menu = await Menu.findByPk(id_menu, { include: [MenuRecipe] });
        if (!menu) return res.status(404).json({ message: "Menu tidak ditemukan" });

        const kebutuhanBahan = menu.MenuRecipes.map(r => ({
            id_inventory: r.id_inventory,
            total_kurangi: r.jumlah_kebutuhan * jumlah_porsi
        }));

        const invRes = await axios.post(`http://localhost:3004/api/inventory/reduce-bulk`, {
            id_dapur: id_dapur,
            items: kebutuhanBahan
        });

        res.json({
            message: "Produksi berhasil! Stok di Inventory telah terupdate.",
            log: invRes.data
        });
    } catch (err) {
        res.status(500).json({ 
            message: "Proses produksi gagal. Periksa stok bahan baku atau Service Inventory.",
            error: err.response?.data?.message || err.message 
        });
    }
};


exports.updateMenu = async (req, res) => {
    try {
        const id = req.params.id;
        await Menu.update(req.body, { where: { id_menu: id } });
        res.json({ message: "Update menu berhasil" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        const id = req.params.id;
        await Menu.destroy({ where: { id_menu: id } });
        res.json({ message: "Menu dan Resep terkait berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
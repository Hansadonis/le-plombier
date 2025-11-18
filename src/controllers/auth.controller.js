const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const clean = (v) => {
    if (typeof v !== "string") return v;
    return v.trim().replace(/^"|"$/g, "").replace(/,$/, "");
};

module.exports = {
    register: (req, res) => {
        // nettoyage des entrées
        const name = clean(req.body.name);
        const phone = clean(req.body.phone);
        const city = clean(req.body.city);
        const district = clean(req.body.district);
        const password = clean(req.body.password);
        const role = clean(req.body.role);
        const cni_number = clean(req.body.cni_number);

        if (!["client", "plombier"].includes(role)) {
            return res.status(400).json({ message: "Role invalide. Doit être 'client' ou 'plombier'." });
        }

        const id = uuidv4();

        // Gestion des fichiers (plombier) — accepte objet ou tableau
        let profile_picture = null;
        let cni_image = null;

        if (req.files) {
            const pp = req.files.profile_picture;
            const ci = req.files.cni_image;

            if (pp) profile_picture = Array.isArray(pp) ? pp[0].filename : pp.filename;
            if (ci) cni_image = Array.isArray(ci) ? ci[0].filename : ci.filename;
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ message: "Erreur de hash du mot de passe" });

            const sql = `
                INSERT INTO users 
                (id, name, phone, city, district, password, role, profile_picture, cni_number, cni_image)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sql,
                [
                    id, name, phone, city, district, hash, role,
                    profile_picture, cni_number, cni_image
                ],
                (error) => {
                    if (error) return res.status(500).json(error);

                    res.json({ message: "Utilisateur créé", id });
                }
            );
        });
    },

    login: (req, res) => {
        const phone = clean(req.body.phone);
        const password = clean(req.body.password);

        db.query("SELECT * FROM users WHERE phone = ?", [phone], (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0)
                return res.status(401).json({ message: "Téléphone incorrect" });

            const user = results[0];

            bcrypt.compare(password, user.password, (err, match) => {
                if (!match)
                    return res.status(401).json({ message: "Mot de passe incorrect" });

                const token = jwt.sign({ id: user.id }, "secretKey", {
                    expiresIn: "7d",
                });

                const { password: _, ...safeUser } = user;
                res.json({ token, user: safeUser });
            });
        });
    }
};

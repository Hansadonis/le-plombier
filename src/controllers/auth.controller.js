const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

module.exports = {
    register: (req, res) => {
        const {
            name,
            phone,
            city,
            district,
            password,
            role,
            cni_number
        } = req.body;

        const id = uuidv4();

        // Gestion des fichiers (plombier)
        let profile_picture = null;
        let cni_image = null;

        if (req.files) {
            if (req.files.profile_picture) {
                profile_picture = req.files.profile_picture[0].filename;
            }
            if (req.files.cni_image) {
                cni_image = req.files.cni_image[0].filename;
            }
        }

        bcrypt.hash(password, 10, (err, hash) => {

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
        const { phone, password } = req.body;

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

                res.json({ token, user });
            });
        });
    }
};

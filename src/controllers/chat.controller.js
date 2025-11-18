const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

module.exports = {
    sendMessage: (req, res) => {
        const { message } = req.body;
        const id = uuidv4();
        const userId = req.userId;

        db.query(
            "INSERT INTO messages (id, user_id, message) VALUES (?, ?, ?)",
            [id, userId, message],
            (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Message envoyé", id });
            }
        );
    },

    getMessages: (req, res) => {
        const sql = `
            SELECT messages.*, users.name, users.role 
            FROM messages 
            INNER JOIN users ON users.id = messages.user_id 
            ORDER BY messages.created_at ASC
        `;

        db.query(sql, (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        });
    }
};

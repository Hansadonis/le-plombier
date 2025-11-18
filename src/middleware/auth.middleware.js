const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) return res.status(403).json({ message: "Token manquant" });

    jwt.verify(token, "secretKey", (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token invalide" });

        req.userId = decoded.id;
        next();
    });
};

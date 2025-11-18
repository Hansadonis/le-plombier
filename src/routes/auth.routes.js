const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const multer = require("multer");

// Dossier où stocker les fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Pour plombier : 2 fichiers possibles
router.post("/register", 
    upload.fields([
        { name: "profile_picture", maxCount: 1 },
        { name: "cni_image", maxCount: 1 }
    ]),
    authController.register
);

router.post("/login", authController.login);

module.exports = router;

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Importer les routes
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.listen(3000, () => {
    console.log("API démarrée sur http://localhost:3000");
});

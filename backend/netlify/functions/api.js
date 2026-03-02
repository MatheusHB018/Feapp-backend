const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.use(express.json());

// Rotas exemplo (troque pelas suas)
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// IMPORTANTE: exportar como handler
module.exports.handler = serverless(app);
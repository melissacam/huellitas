const express = require('express');
const cors = require('cors');
const mascotasRouter = require('./routes/mascotas');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  })
);

app.use(express.json());

app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok' });
});

app.use('/api/mascotas', mascotasRouter);

app.use((req, res) => {
  res.status(404).json({
    mensaje: 'Ruta no encontrada.',
  });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      mensaje: 'El cuerpo de la petición no es un JSON válido.',
    });
  }

  console.error(err);

  res.status(500).json({
    mensaje: 'Ocurrió un error interno. Intenta nuevamente.',
  });
});

module.exports = app;
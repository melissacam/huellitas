require('dotenv').config();
if (process.env.DNS_SERVERS) {
  const servidores = process.env.DNS_SERVERS
    .split(',')
    .map((servidor) => servidor.trim())
    .filter(Boolean);

  require('node:dns').setServers(servidores);
}
const mongoose = require('mongoose');
const app = require('./app');

const PUERTO = process.env.PORT || 3000;

async function iniciar() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Falta la variable MONGODB_URI en backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Conectado a MongoDB Atlas');

    app.listen(PUERTO, () => {
      console.log(`🐾 API Huellitas en http://localhost:${PUERTO}`);
    });
  } catch (error) {
    console.error('❌ No se pudo conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

iniciar();
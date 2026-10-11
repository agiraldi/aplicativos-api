const mongoose = require('mongoose');

/**
 * Cache global para conexões Mongoose em ambientes serverless (Vercel).
 * Evita a criação excessiva de conexões a cada nova invocação da função.
 */
let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * Conecta ao MongoDB Atlas utilizando cache de conexão singleton.
 * @returns {Promise<mongoose.Connection>}
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('A variável de ambiente MONGODB_URI não foi definida.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(' Conectado com sucesso ao MongoDB Atlas');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(' Erro ao conectar ao MongoDB Atlas:', error.message);
    throw error;
  }

  return cached.conn;
}

module.exports = connectDB;

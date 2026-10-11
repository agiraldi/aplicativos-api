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
  let uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('A variável de ambiente MONGODB_URI não foi definida para o ambiente de produção.');
    }

    // Inicialização amigável de instância MongoDB para desenvolvimento local sem travar o desenvolvedor
    if (!global.localDevMongoInstance) {
      console.log('⚡ MONGODB_URI não definida. Inicializando instância MongoDB para desenvolvimento local...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      global.localDevMongoInstance = await MongoMemoryServer.create();
    }
    uri = global.localDevMongoInstance.getUri();
    process.env.MONGODB_URI = uri;
    console.log(`💡 Conectado a instância MongoDB de desenvolvimento. Para produção Atlas, configure MONGODB_URI no .env`);
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

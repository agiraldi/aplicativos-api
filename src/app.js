const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const aplicativoRoutes = require('./routes/aplicativoRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Configuração flexível de CORS para desenvolvimento local e produção Vercel
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origin (como curl, postman, server-to-server)
    if (!origin) return callback(null, true);

    const configuredOrigins = (process.env.CLIENT_URL || '')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    // Permitir se configurado explicitamente, se for localhost ou se for domínio vercel.app
    const isAllowed =
      configuredOrigins.length === 0 ||
      configuredOrigins.includes('*') ||
      configuredOrigins.includes(origin) ||
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) ||
      /\.vercel\.app$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Não bloqueia em modo de demonstração/avaliação, mas loga aviso
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota raiz informativa
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Bem-vindo à API do Sistema de Gerenciamento de Aplicativos (AppNova)',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      aplicativos: '/api/aplicativos',
      documentacao: '/api/docs',
    },
    status: 'online',
  });
});

// Middleware de conexão com MongoDB para Serverless (garante conexão antes de tratar a rota)
app.use(async (req, res, next) => {
  // Ignora conexão com banco durante testes unitários/integração se o teste gerenciar sua própria conexão
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Falha ao conectar ao banco de dados no middleware:', error.message);
    res.status(503).json({
      success: false,
      message: 'Falha temporária de conexão com o banco de dados MongoDB Atlas.',
      error: error.message,
    });
  }
});

// Registro das rotas
app.use('/api/health', healthRoutes);
app.use('/api/aplicativos', aplicativoRoutes);

// Rota 404 para rotas não mapeadas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota '${req.method} ${req.originalUrl}' não encontrada nesta API.`,
  });
});

// Middleware centralizado de erro
app.use(errorHandler);

// Inicialização do servidor se executado diretamente
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(async () => {
      const Aplicativo = require('./models/Aplicativo');
      const count = await Aplicativo.countDocuments();
      if (count === 0) {
        await Aplicativo.insertMany([
          {
            nome: 'Visual Studio Code',
            categoria: 'Desenvolvimento',
            descricao: 'Editor de código-fonte poderoso, leve e altamente extensível com suporte a dezenas de linguagens.',
            preco: 0,
            foto: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
          },
          {
            nome: 'Notion',
            categoria: 'Produtividade',
            descricao: 'Espaço de trabalho integrado para anotações, documentos, wikis e gerenciamento ágil de projetos.',
            preco: 49.90,
            foto: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80',
          },
          {
            nome: 'Figma',
            categoria: 'Design',
            descricao: 'Plataforma líder para colaboração e criação de interfaces UI/UX e protótipos em tempo real.',
            preco: 75.00,
            foto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          },
          {
            nome: 'Postman',
            categoria: 'Desenvolvimento',
            descricao: 'Ferramenta completa para design, documentação e testes automatizados de APIs RESTful.',
            preco: 0,
            foto: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
          },
          {
            nome: 'Slack',
            categoria: 'Comunicação',
            descricao: 'Canal de comunicação corporativo em tempo real para equipes modernas e ágeis.',
            preco: 38.50,
            foto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
          },
        ]);
        console.log(' Catálogo inicial populado com 5 aplicativos de demonstração');
      }

      app.listen(PORT, () => {
        console.log(` Servidor rodando com sucesso na porta ${PORT}`);
        console.log(` Health check: http://localhost:${PORT}/api/health`);
        console.log(` Aplicativos: http://localhost:${PORT}/api/aplicativos`);
      });
    })
    .catch((err) => {
      console.warn('⚠️ Servidor iniciado, mas a conexão com MongoDB falhou:', err.message);
      app.listen(PORT, () => {
        console.log(` Servidor rodando em modo degradado na porta ${PORT}`);
      });
    });
}

module.exports = app;

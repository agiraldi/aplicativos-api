const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let Aplicativo;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';

  // Inicializa servidor MongoDB em memória para testes isolados
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);

  app = require('../src/app');
  Aplicativo = require('../src/models/Aplicativo');
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await Aplicativo.deleteMany({});
  }
});

describe('--- SUÍTE COMPLETA DE TESTES DA API (aplicativos-api) ---', () => {
  // 1. Conexão e Health Check
  describe('GET /api/health - Conexão e Verificação de Saúde', () => {
    it('deve retornar status 200 e informações de integridade da API', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('service', 'aplicativos-api');
      expect(res.body).toHaveProperty('uptimeSeconds');
      expect(res.body).toHaveProperty('database');
    });

    it('deve retornar 200 e informações gerais na rota raiz GET /', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('endpoints');
    });
  });

  // 2. Cadastro de Aplicativo (POST /api/aplicativos)
  describe('POST /api/aplicativos - Cadastro', () => {
    it('deve cadastrar um aplicativo com dados válidos e retornar 201', async () => {
      const novoApp = {
        nome: 'Visual Studio Code',
        categoria: 'Desenvolvimento',
        descricao: 'Editor de código-fonte poderoso, leve e altamente extensível.',
        preco: 0,
        foto: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
      };

      const res = await request(app).post('/api/aplicativos').send(novoApp);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.nome).toBe(novoApp.nome);
      expect(res.body.data.categoria).toBe(novoApp.categoria);
      expect(res.body.data.preco).toBe(0);
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('deve permitir cadastro com preço zero (aplicativo gratuito)', async () => {
      const appGratuito = {
        nome: 'GIMP',
        categoria: 'Design',
        descricao: 'Programa de manipulação de imagens e fotos de código aberto.',
        preco: 0,
        foto: '',
      };

      const res = await request(app).post('/api/aplicativos').send(appGratuito);

      expect(res.status).toBe(201);
      expect(res.body.data.preco).toBe(0);
    });

    it('deve falhar com status 400 se campos obrigatórios estiverem ausentes', async () => {
      const appInvalido = {
        // sem nome, categoria e descricao
        preco: 29.9,
      };

      const res = await request(app).post('/api/aplicativos').send(appInvalido);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveProperty('nome');
      expect(res.body.errors).toHaveProperty('categoria');
      expect(res.body.errors).toHaveProperty('descricao');
    });

    it('deve rejeitar cadastro com preço negativo', async () => {
      const appPrecoNegativo = {
        nome: 'App Inválido',
        categoria: 'Utilitários',
        descricao: 'Descrição de teste para preço inválido.',
        preco: -15.5,
      };

      const res = await request(app).post('/api/aplicativos').send(appPrecoNegativo);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toHaveProperty('preco');
    });

    it('deve rejeitar cadastro com URL de foto inválida', async () => {
      const appFotoInvalida = {
        nome: 'App Foto Ruim',
        categoria: 'Produtividade',
        descricao: 'Teste de URL mal formatada de foto.',
        preco: 10,
        foto: 'not-a-valid-url',
      };

      const res = await request(app).post('/api/aplicativos').send(appFotoInvalida);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toHaveProperty('foto');
    });
  });

  // 3. Listagem, Pesquisa e Filtros (GET /api/aplicativos)
  describe('GET /api/aplicativos - Listagem, Pesquisa e Filtros', () => {
    beforeEach(async () => {
      await Aplicativo.create([
        {
          nome: 'Notion',
          categoria: 'Produtividade',
          descricao: 'Espaço de trabalho integrado para notas, docs e tarefas.',
          preco: 45.0,
          foto: 'https://exemplo.com/notion.png',
        },
        {
          nome: 'Figma',
          categoria: 'Design',
          descricao: 'Ferramenta colaborativa de design de interfaces e protótipos.',
          preco: 75.0,
          foto: 'https://exemplo.com/figma.png',
        },
        {
          nome: 'Postman',
          categoria: 'Desenvolvimento',
          descricao: 'Plataforma para construir, testar e documentar APIs REST.',
          preco: 0,
          foto: 'https://exemplo.com/postman.png',
        },
      ]);
    });

    it('deve listar todos os aplicativos cadastrados', async () => {
      const res = await request(app).get('/api/aplicativos');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(3);
    });

    it('deve filtrar aplicativos por categoria', async () => {
      const res = await request(app).get('/api/aplicativos?categoria=Design');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].nome).toBe('Figma');
      expect(res.body.data[0].categoria).toBe('Design');
    });

    it('deve buscar aplicativos por nome via parâmetro busca', async () => {
      const res = await request(app).get('/api/aplicativos?busca=notion');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].nome).toBe('Notion');
    });

    it('deve buscar aplicativos por palavra-chave na descrição', async () => {
      const res = await request(app).get('/api/aplicativos?busca=protótipos');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].nome).toBe('Figma');
    });

    it('deve retornar lista vazia se nenhum aplicativo corresponder à busca', async () => {
      const res = await request(app).get('/api/aplicativos?busca=Inexistente123456');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  // 4. Busca por ID (GET /api/aplicativos/:id)
  describe('GET /api/aplicativos/:id - Busca por ID', () => {
    it('deve retornar o aplicativo correto quando fornecido um ID válido', async () => {
      const appCriado = await Aplicativo.create({
        nome: 'Spotify',
        categoria: 'Utilitários',
        descricao: 'Serviço de streaming de música digital e podcasts.',
        preco: 21.9,
      });

      const res = await request(app).get(`/api/aplicativos/${appCriado._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(appCriado._id.toString());
      expect(res.body.data.nome).toBe('Spotify');
    });

    it('deve retornar 400 se o ID fornecido tiver formato inválido', async () => {
      const res = await request(app).get('/api/aplicativos/id-invalido-123');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('inválido');
    });

    it('deve retornar 404 se o ID for válido mas o registro não existir', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/aplicativos/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('não encontrado');
    });
  });

  // 5. Atualização (PUT /api/aplicativos/:id)
  describe('PUT /api/aplicativos/:id - Atualização', () => {
    it('deve atualizar os dados de um aplicativo com sucesso', async () => {
      const appOriginal = await Aplicativo.create({
        nome: 'Trello Original',
        categoria: 'Produtividade',
        descricao: 'Quadro Kanban para organizar projetos.',
        preco: 15.0,
      });

      const res = await request(app)
        .put(`/api/aplicativos/${appOriginal._id}`)
        .send({
          nome: 'Trello Enterprise',
          preco: 29.9,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nome).toBe('Trello Enterprise');
      expect(res.body.data.preco).toBe(29.9);
      expect(res.body.data.categoria).toBe('Produtividade'); // manteve a categoria
    });

    it('deve retornar 400 se tentar atualizar com preço negativo', async () => {
      const appOriginal = await Aplicativo.create({
        nome: 'App Valido',
        categoria: 'Negócios',
        descricao: 'Descrição válida aqui.',
        preco: 10.0,
      });

      const res = await request(app)
        .put(`/api/aplicativos/${appOriginal._id}`)
        .send({ preco: -5 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('deve retornar 404 ao tentar atualizar aplicativo inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/aplicativos/${fakeId}`)
        .send({ nome: 'Nome Novo' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // 6. Exclusão (DELETE /api/aplicativos/:id)
  describe('DELETE /api/aplicativos/:id - Exclusão', () => {
    it('deve excluir um aplicativo existente com sucesso', async () => {
      const appParaDeletar = await Aplicativo.create({
        nome: 'App Temporario',
        categoria: 'Outros',
        descricao: 'Aplicativo que será removido.',
        preco: 0,
      });

      const res = await request(app).delete(`/api/aplicativos/${appParaDeletar._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('excluído com sucesso');

      // Verifica se o registro realmente saiu do banco
      const buscado = await Aplicativo.findById(appParaDeletar._id);
      expect(buscado).toBeNull();
    });

    it('deve retornar 404 ao tentar excluir aplicativo que não existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/aplicativos/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('deve retornar 400 ao fornecer ID mal formatado para exclusão', async () => {
      const res = await request(app).delete('/api/aplicativos/123-bad-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // 7. CORS, Cabeçalhos e Rotas Inexistentes
  describe('CORS, Segurança e Rotas Não Encontradas (404)', () => {
    it('deve incluir cabeçalhos CORS adequados nas respostas', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('deve responder 404 com mensagem padronizada para rota inexistente', async () => {
      const res = await request(app).get('/api/rota-que-nao-existe');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('não encontrada');
    });
  });

  // 8. Compatibilidade Serverless Vercel (api/index.js)
  describe('Compatibilidade com Vercel (api/index.js)', () => {
    it('o módulo api/index.js deve exportar a mesma aplicação Express', () => {
      const vercelHandler = require('../api/index');
      expect(typeof vercelHandler).toBe('function');
      expect(vercelHandler).toBe(app);
    });
  });
});

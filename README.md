# 🚀 AppNova API (`aplicativos-api`)

API RESTful moderna e robusta para gerenciamento completo de catálogo de aplicativos e softwares, construída com **Node.js**, **Express** e **MongoDB Atlas** (Mongoose).

Projetada com arquitetura híbrida para execução local contínua e implantação Serverless escalável na **Vercel**.

---

## 📋 Recursos e Funcionalidades

- **CRUD Completo:** Cadastro, listagem, visualização por ID, atualização e remoção de aplicativos.
- **Filtros e Busca Textual:**
  - Busca por texto (insensível a maiúsculas/minúsculas) em `nome` e `descricao`.
  - Filtro exato por `categoria`.
- **Validações Rigorosas:**
  - Nome (mínimo 2 caracteres).
  - Categoria (obrigatória).
  - Preço (maior ou igual a zero; zero é formatado como Gratuito).
  - Descrição (mínimo 5 caracteres).
  - Foto (validação de formato de URL http/https).
- **Health Check (`GET /api/health`):** Verificação de integridade e status da conexão com o banco.
- **CORS Flexível:** Origens locais permitidas para desenvolvimento e suporte para o domínio de produção na Vercel.
- **Compatibilidade Serverless:** Entrypoint otimizado em `api/index.js` com cache de conexão singleton para Mongoose, prevenindo saturação de conexões no MongoDB Atlas.
- **Suíte de Testes Automatizados:** Testes de integração cobrindo 100% dos fluxos com Jest e Supertest.

---

## 🛠️ Tecnologias Utilizadas

- **Runtime:** Node.js (v24.x LTS)
- **Framework:** Express.js 4.x
- **Banco de Dados:** MongoDB Atlas
- **ODM:** Mongoose 8.x
- **Segurança & CORS:** cors, dotenv
- **Testes:** Jest, Supertest, MongoMemoryServer
- **Hospedagem:** Vercel Serverless Functions

---

## 📁 Estrutura de Pastas

```
aplicativos-api/
├── api/
│   └── index.js             # Entrypoint Serverless para a Vercel
├── src/
│   ├── config/
│   │   └── database.js      # Singleton de conexão MongoDB Atlas com cache
│   ├── controllers/
│   │   └── aplicativoController.js # Lógica de negócio do CRUD e filtros
│   ├── middlewares/
│   │   └── errorHandler.js  # Tratamento centralizado de erros e validações
│   ├── models/
│   │   └── Aplicativo.js    # Modelo Mongoose com validações de esquema
│   ├── routes/
│   │   ├── aplicativoRoutes.js # Rotas REST de aplicativos
│   │   └── healthRoutes.js     # Rota de verificação de saúde (health check)
│   └── app.js               # Configuração da aplicação Express
├── tests/
│   └── aplicativo.test.js   # Suíte completa de testes automatizados
├── .env.example             # Modelo das variáveis de ambiente
├── .gitignore
├── api.md                   # Documentação detalhada dos endpoints
├── Contexto.md              # Relatório e decisões técnicas do projeto
├── package.json
├── README.md
├── Roadmap.md               # Rastreamento de progresso do projeto
└── vercel.json              # Configuração de rotas e rewrites da Vercel
```

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/agiraldi/aplicativos-api.git
cd aplicativos-api
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Preencha a variável `MONGODB_URI` com sua string de conexão do MongoDB Atlas.

### 4. Iniciar a API

Modo desenvolvimento:
```bash
npm run dev
```

Modo produção:
```bash
npm start
```

A API estará acessível em: `http://localhost:5000`

---

## 🧪 Testes Automatizados

Para executar os testes de integração com banco em memória:

```bash
npm test
```

---

## 📖 Documentação dos Endpoints

Consulte o arquivo [`api.md`](./api.md) para a documentação detalhada com todos os exemplos de requisição cURL, payloads JSON, query params e códigos de status HTTP.

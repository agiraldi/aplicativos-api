# Documentação da API REST — AppNova (aplicativos-api)

Esta documentação detalha a arquitetura, endpoints, modelos de requisição e resposta, parâmetros, configurações e instruções de execução da API REST do **AppNova**.

---

## 1. Visão Geral

A API foi desenvolvida em **Node.js** com **Express** e **MongoDB Atlas** (via **Mongoose**), com arquitetura serverless compatível com a **Vercel** e suporte para execução tradicional em servidores locais.

- **URL Base Local:** `http://localhost:5000/api`
- **URL Base Produção:** `https://aplicativos-api.vercel.app/api`
- **Formato dos Dados:** JSON (`application/json`)
- **Autenticação:** Aberta para demonstração (sem necessidade de bearer token)
- **CORS:** Habilitado para origens locais (`localhost:3000`, `127.0.0.1:5500`) e domínios Vercel (`*.vercel.app`)

---

## 2. Pré-requisitos e Instalação

- **Node.js:** Versão 18.x, 20.x ou superior (testado com Node.js v24.x LTS)
- **npm:** Versão 9.x ou superior
- **Cluster MongoDB Atlas:** Conta gratuita no MongoDB Atlas ou instância MongoDB local

### Instalação das Dependências

No diretório `aplicativos-api/`:

```bash
npm install
```

---

## 3. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório `aplicativos-api/` tomando como base o arquivo `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<seu-cluster>.mongodb.net/aplicativos_db?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000,http://127.0.0.1:5500,https://aplicativos-frontend.vercel.app
NODE_ENV=development
```

### Configuração no MongoDB Atlas

1. Crie uma conta gratuita em [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Crie um cluster compartilhado M0 gratuito.
3. Em **Database Access**, crie um usuário com usuário e senha seguros e permissão de *Read and write to any database*.
4. Em **Network Access**, adicione o IP `0.0.0.0/0` (permitir acesso de qualquer local, obrigatório para a Vercel serverless).
5. Em **Database** > clique em **Connect** > selecione **Drivers (Node.js)** e copie a string de conexão para a variável `MONGODB_URI` no `.env` e nas variáveis de ambiente do projeto na Vercel.

---

## 4. Execução da API

### Modo Desenvolvimento (com recarregamento automático)

```bash
npm run dev
```

### Modo Produção / Padrão

```bash
npm start
```

### Executar Suíte de Testes Automatizados

```bash
npm test
```

---

## 5. Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Health check da API e status do banco de dados |
| `GET` | `/api/aplicativos` | Listagem com filtros opcionais de busca e categoria |
| `GET` | `/api/aplicativos/:id` | Detalhes de um aplicativo por ID |
| `POST` | `/api/aplicativos` | Cadastro de novo aplicativo |
| `PUT` | `/api/aplicativos/:id` | Atualização total ou parcial de um aplicativo |
| `DELETE` | `/api/aplicativos/:id` | Remoção de um aplicativo por ID |

---

## 6. Detalhamento dos Endpoints

### 6.1. Health Check

Verifica se a aplicação está online e o estado da conexão com o MongoDB Atlas.

- **Método:** `GET`
- **Rota:** `/api/health`
- **Códigos de Resposta:** `200 OK` ou `503 Service Unavailable`

#### Exemplo de Resposta (200 OK)

```json
{
  "status": "ok",
  "service": "aplicativos-api",
  "uptimeSeconds": 42,
  "timestamp": "2026-10-11T18:00:00.000Z",
  "database": {
    "status": "connected",
    "readyState": 1
  }
}
```

#### Exemplo com cURL

```bash
curl -X GET http://localhost:5000/api/health
```

---

### 6.2. Listar Aplicativos

Retorna a lista de aplicativos cadastrados ordenados decrescentemente pela data de criação.

- **Método:** `GET`
- **Rota:** `/api/aplicativos`
- **Parâmetros Opcionais de Query:**
  - `busca` (string): Termo para busca insensível a maiúsculas/minúsculas no nome ou na descrição.
  - `categoria` (string): Filtra por categoria exata (ex: `Produtividade`, `Design`, `Desenvolvimento`). Use `Todas` para não filtrar.

#### Exemplos de Requisições com Query Params

- Todos: `GET /api/aplicativos`
- Por busca: `GET /api/aplicativos?busca=editor`
- Por categoria: `GET /api/aplicativos?categoria=Produtividade`
- Combinado: `GET /api/aplicativos?busca=código&categoria=Desenvolvimento`

#### Exemplo de Resposta (200 OK)

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "67096e21019a86b1f2010101",
      "nome": "Visual Studio Code",
      "categoria": "Desenvolvimento",
      "descricao": "Editor de código-fonte poderoso, leve e altamente extensível.",
      "preco": 0,
      "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e",
      "createdAt": "2026-10-11T17:45:00.000Z",
      "updatedAt": "2026-10-11T17:45:00.000Z"
    },
    {
      "_id": "67096e21019a86b1f2010102",
      "nome": "Figma",
      "categoria": "Design",
      "descricao": "Ferramenta colaborativa de design de interfaces e protótipos digitais.",
      "preco": 75.00,
      "foto": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      "createdAt": "2026-10-11T17:30:00.000Z",
      "updatedAt": "2026-10-11T17:30:00.000Z"
    }
  ]
}
```

#### Exemplo com cURL

```bash
curl -X GET "http://localhost:5000/api/aplicativos?categoria=Produtividade"
```

---

### 6.3. Obter Aplicativo por ID

- **Método:** `GET`
- **Rota:** `/api/aplicativos/:id`
- **Parâmetros de Rota:** `id` (ObjectId válido do MongoDB)

#### Resposta de Sucesso (200 OK)

```json
{
  "success": true,
  "data": {
    "_id": "67096e21019a86b1f2010101",
    "nome": "Visual Studio Code",
    "categoria": "Desenvolvimento",
    "descricao": "Editor de código-fonte poderoso, leve e altamente extensível.",
    "preco": 0,
    "foto": "https://images.unsplash.com/photo-1542838132-92c53300491e",
    "createdAt": "2026-10-11T17:45:00.000Z",
    "updatedAt": "2026-10-11T17:45:00.000Z"
  }
}
```

#### Respostas de Erro

- **400 Bad Request:** Se o ID não for um ObjectId válido:
  ```json
  {
    "success": false,
    "message": "O ID fornecido é inválido."
  }
  ```
- **404 Not Found:** Se o ID for válido porém inexistente:
  ```json
  {
    "success": false,
    "message": "Aplicativo não encontrado."
  }
  ```

---

### 6.4. Cadastrar Novo Aplicativo

- **Método:** `POST`
- **Rota:** `/api/aplicativos`
- **Headers:** `Content-Type: application/json`

#### Corpo da Requisição (Body JSON)

| Campo | Tipo | Obrigatório? | Descrição / Regra |
|---|---|---|---|
| `nome` | String | Sim | Mínimo 2 caracteres, máximo 100 caracteres. |
| `categoria` | String | Sim | Categoria do software (mínimo 2 caracteres). |
| `descricao` | String | Sim | Mínimo 5 caracteres, máximo 1000 caracteres. |
| `preco` | Number | Sim | Maior ou igual a zero (`>= 0`). Use `0` para Gratuito. |
| `foto` | String | Não | URL HTTP/HTTPS válida ou Data URI. |

#### Exemplo de Envio

```json
{
  "nome": "Notion",
  "categoria": "Produtividade",
  "descricao": "Espaço de trabalho para notas, documentos, wikis e gerenciamento de projetos.",
  "preco": 48.90,
  "foto": "https://images.unsplash.com/photo-1517842645767-c639042777db"
}
```

#### Resposta de Sucesso (201 Created)

```json
{
  "success": true,
  "message": "Aplicativo cadastrado com sucesso!",
  "data": {
    "_id": "67096e21019a86b1f2010103",
    "nome": "Notion",
    "categoria": "Produtividade",
    "descricao": "Espaço de trabalho para notas, documentos, wikis e gerenciamento de projetos.",
    "preco": 48.9,
    "foto": "https://images.unsplash.com/photo-1517842645767-c639042777db",
    "createdAt": "2026-10-11T18:05:00.000Z",
    "updatedAt": "2026-10-11T18:05:00.000Z"
  }
}
```

#### Resposta de Validação Inválida (400 Bad Request)

```json
{
  "success": false,
  "message": "Erro de validação nos campos informados.",
  "errors": {
    "nome": "O nome do aplicativo é obrigatório.",
    "preco": "O preço deve ser maior ou igual a zero."
  }
}
```

#### Exemplo com cURL

```bash
curl -X POST http://localhost:5000/api/aplicativos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Postman",
    "categoria": "Desenvolvimento",
    "descricao": "Plataforma para construção e testes de APIs RESTful.",
    "preco": 0,
    "foto": "https://images.unsplash.com/photo-1555066931-4365d14bab8c"
  }'
```

---

### 6.5. Atualizar Aplicativo

- **Método:** `PUT`
- **Rota:** `/api/aplicativos/:id`
- **Headers:** `Content-Type: application/json`

#### Exemplo de Envio

```json
{
  "nome": "Notion Plus",
  "preco": 59.90
}
```

#### Resposta de Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Aplicativo atualizado com sucesso!",
  "data": {
    "_id": "67096e21019a86b1f2010103",
    "nome": "Notion Plus",
    "categoria": "Produtividade",
    "descricao": "Espaço de trabalho para notas, documentos, wikis e gerenciamento de projetos.",
    "preco": 59.9,
    "foto": "https://images.unsplash.com/photo-1517842645767-c639042777db",
    "createdAt": "2026-10-11T18:05:00.000Z",
    "updatedAt": "2026-10-11T18:10:00.000Z"
  }
}
```

#### Exemplo com cURL

```bash
curl -X PUT http://localhost:5000/api/aplicativos/67096e21019a86b1f2010103 \
  -H "Content-Type: application/json" \
  -d '{"preco": 59.90}'
```

---

### 6.6. Excluir Aplicativo

- **Método:** `DELETE`
- **Rota:** `/api/aplicativos/:id`

#### Resposta de Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Aplicativo excluído com sucesso!",
  "data": {
    "id": "67096e21019a86b1f2010103",
    "nome": "Notion Plus"
  }
}
```

#### Exemplo com cURL

```bash
curl -X DELETE http://localhost:5000/api/aplicativos/67096e21019a86b1f2010103
```

---

## 7. Testes com Postman / Insomnia

1. Importe a URL base como variável de ambiente de coleção: `baseUrl = http://localhost:5000/api`
2. Crie requisições para cada um dos 6 endpoints listados acima.
3. Teste os cenários de sucesso (200 e 201) e cenários de erro (preço negativo, IDs inexistentes e rotas não mapeadas).

---

## 8. Integração com o Frontend

No arquivo `aplicativos-frontend/js/api.js`, o cliente HTTP consome automaticamente estes endpoints. Caso deseje apontar o Frontend para uma URL específica durante testes, utilize o modal de configurações da interface clicando no ícone de engrenagem no cabeçalho ou configure a variável:

```javascript
window.__API_URL__ = "https://sua-api.vercel.app/api";
```

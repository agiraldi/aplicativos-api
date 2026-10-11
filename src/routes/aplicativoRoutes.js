const express = require('express');
const router = express.Router();
const aplicativoController = require('../controllers/aplicativoController');

// GET /api/aplicativos — listar os aplicativos (com ?busca= e ?categoria=)
router.get('/', aplicativoController.listarAplicativos);

// GET /api/aplicativos/:id — buscar um aplicativo por ID
router.get('/:id', aplicativoController.obterAplicativoPorId);

// POST /api/aplicativos — cadastrar um novo aplicativo
router.post('/', aplicativoController.criarAplicativo);

// PUT /api/aplicativos/:id — atualizar um aplicativo existente
router.put('/:id', aplicativoController.atualizarAplicativo);

// DELETE /api/aplicativos/:id — excluir um aplicativo
router.delete('/:id', aplicativoController.excluirAplicativo);

module.exports = router;

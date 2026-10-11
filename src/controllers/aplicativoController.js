const mongoose = require('mongoose');
const Aplicativo = require('../models/Aplicativo');

/**
 * Listar aplicativos com suporte a busca textual e filtro por categoria.
 * GET /api/aplicativos?busca=editor&categoria=Produtividade
 */
exports.listarAplicativos = async (req, res, next) => {
  try {
    const { busca, categoria } = req.query;
    const filtro = {};

    if (categoria && categoria.trim() !== '' && categoria.toLowerCase() !== 'todas') {
      filtro.categoria = { $regex: new RegExp(`^${categoria.trim()}$`, 'i') };
    }

    if (busca && busca.trim() !== '') {
      const termo = busca.trim();
      filtro.$or = [
        { nome: { $regex: termo, $options: 'i' } },
        { descricao: { $regex: termo, $options: 'i' } },
      ];
    }

    const aplicativos = await Aplicativo.find(filtro).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: aplicativos.length,
      data: aplicativos,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Obter um aplicativo por ID.
 * GET /api/aplicativos/:id
 */
exports.obterAplicativoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'O ID fornecido é inválido.',
      });
    }

    const aplicativo = await Aplicativo.findById(id);

    if (!aplicativo) {
      return res.status(404).json({
        success: false,
        message: 'Aplicativo não encontrado.',
      });
    }

    return res.status(200).json({
      success: true,
      data: aplicativo,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Cadastrar um novo aplicativo.
 * POST /api/aplicativos
 */
exports.criarAplicativo = async (req, res, next) => {
  try {
    let { nome, categoria, descricao, preco, foto } = req.body;

    // Normalização inicial de preço
    if (preco !== undefined && preco !== null && preco !== '') {
      preco = Number(preco);
    }

    const novoAplicativo = new Aplicativo({
      nome,
      categoria,
      descricao,
      preco,
      foto: foto ? foto.trim() : '',
    });

    const salvo = await novoAplicativo.save();

    return res.status(201).json({
      success: true,
      message: 'Aplicativo cadastrado com sucesso!',
      data: salvo,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Atualizar um aplicativo existente.
 * PUT /api/aplicativos/:id
 */
exports.atualizarAplicativo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'O ID fornecido é inválido.',
      });
    }

    let dados = { ...req.body };

    if (dados.preco !== undefined && dados.preco !== null && dados.preco !== '') {
      dados.preco = Number(dados.preco);
    }

    const aplicativoAtualizado = await Aplicativo.findByIdAndUpdate(
      id,
      dados,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!aplicativoAtualizado) {
      return res.status(404).json({
        success: false,
        message: 'Aplicativo não encontrado para atualização.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Aplicativo atualizado com sucesso!',
      data: aplicativoAtualizado,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Excluir um aplicativo por ID.
 * DELETE /api/aplicativos/:id
 */
exports.excluirAplicativo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'O ID fornecido é inválido.',
      });
    }

    const aplicativoRemovido = await Aplicativo.findByIdAndDelete(id);

    if (!aplicativoRemovido) {
      return res.status(404).json({
        success: false,
        message: 'Aplicativo não encontrado para exclusão.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Aplicativo excluído com sucesso!',
      data: { id: aplicativoRemovido._id, nome: aplicativoRemovido.nome },
    });
  } catch (error) {
    return next(error);
  }
};

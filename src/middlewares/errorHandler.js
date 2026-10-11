/**
 * Middleware centralizado de tratamento de erros da API.
 */
function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const errors = {};
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }

    return res.status(400).json({
      success: false,
      message: 'Erro de validação nos campos informados.',
      errors,
    });
  }

  // Erro de casting do Mongoose (ex: ObjectId inválido ou tipo incorreto)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Formato inválido para o campo '${err.path}': valor informado não pôde ser convertido.`,
    });
  }

  // Erro de chave duplicada no MongoDB (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(409).json({
      success: false,
      message: `Já existe um registro com o mesmo valor para '${field}'.`,
    });
  }

  // Erro de sintaxe de JSON no corpo da requisição
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'O corpo da requisição possui formato JSON inválido.',
    });
  }

  // Erro genérico do servidor
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Erro interno no servidor.',
  });
}

module.exports = errorHandler;

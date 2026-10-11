const mongoose = require('mongoose');

const aplicativoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome do aplicativo é obrigatório.'],
      trim: true,
      minlength: [2, 'O nome deve ter pelo menos 2 caracteres.'],
      maxlength: [100, 'O nome deve ter no máximo 100 caracteres.'],
    },
    categoria: {
      type: String,
      required: [true, 'A categoria do aplicativo é obrigatória.'],
      trim: true,
      minlength: [2, 'A categoria deve ter pelo menos 2 caracteres.'],
      maxlength: [50, 'A categoria deve ter no máximo 50 caracteres.'],
    },
    descricao: {
      type: String,
      required: [true, 'A descrição do aplicativo é obrigatória.'],
      trim: true,
      minlength: [5, 'A descrição deve ter pelo menos 5 caracteres.'],
      maxlength: [1000, 'A descrição deve ter no máximo 1000 caracteres.'],
    },
    preco: {
      type: Number,
      required: [true, 'O preço do aplicativo é obrigatório.'],
      min: [0, 'O preço deve ser maior ou igual a zero.'],
    },
    foto: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v || v.trim() === '') return true; // campo opcional
          // Validação de URL HTTP/HTTPS ou Data URI
          return /^(https?:\/\/[^\s$.?#].[^\s]*|data:image\/[a-zA-Z]+;base64,[^\s]+)$/i.test(v);
        },
        message: 'A foto deve ser uma URL válida (http/https) ou data URI.',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índice de busca textual para otimizar pesquisas por nome e descrição
aplicativoSchema.index({ nome: 'text', descricao: 'text' });

module.exports = mongoose.model('Aplicativo', aplicativoSchema);

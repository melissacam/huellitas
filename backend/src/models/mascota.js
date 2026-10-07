const { Schema, model } = require('mongoose');
const { ESPECIES, ESTADOS } = require('../utils/constantes');

const mascotaSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 40,
    },
    especie: {
      type: String,
      required: true,
      enum: ESPECIES,
    },
    edad: {
      type: Number,
      required: true,
      min: 0,
      max: 30,
    },
    estado: {
      type: String,
      required: true,
      enum: ESTADOS,
      default: 'disponible',
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model('Mascota', mascotaSchema);
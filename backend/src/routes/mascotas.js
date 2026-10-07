const express = require('express');
const mongoose = require('mongoose');
const Mascota = require('../models/mascota');
const { validarMascota } = require('../utils/validarMascota');
const { validarFiltros } = require('../utils/validarFiltros');
const { contarPorEstado } = require('../utils/contarPorEstado');

const router = express.Router();

const NO_ENCONTRADA = {
  mensaje: 'Mascota no encontrada.',
};

// Listar mascotas y aplicar filtros.
router.get('/', async (req, res, next) => {
  try {
    const { valido, errores, filtros } = validarFiltros(req.query);

    if (!valido) {
      return res.status(400).json({
        mensaje: 'Filtros no válidos.',
        errores,
      });
    }

    const mascotas = await Mascota.find(filtros).sort({
      createdAt: -1,
    });

    res.json(mascotas);
  } catch (error) {
    next(error);
  }
});

// Contar mascotas disponibles y adoptadas.
router.get('/resumen', async (req, res, next) => {
  try {
    const mascotas = await Mascota.find({}, 'estado');
    res.json(contarPorEstado(mascotas));
  } catch (error) {
    next(error);
  }
});

// Consultar una mascota por su ID.
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json(NO_ENCONTRADA);
    }

    const mascota = await Mascota.findById(req.params.id);

    if (!mascota) {
      return res.status(404).json(NO_ENCONTRADA);
    }

    res.json(mascota);
  } catch (error) {
    next(error);
  }
});

// Crear una mascota.
router.post('/', async (req, res, next) => {
  try {
    const { valido, errores, datos } = validarMascota(req.body);

    if (!valido) {
      return res.status(400).json({
        mensaje: 'Datos no válidos.',
        errores,
      });
    }

    const mascota = await Mascota.create(datos);
    res.status(201).json(mascota);
  } catch (error) {
    next(error);
  }
});

// Actualizar una mascota.
router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json(NO_ENCONTRADA);
    }

    const { valido, errores, datos } = validarMascota(req.body);

    if (!valido) {
      return res.status(400).json({
        mensaje: 'Datos no válidos.',
        errores,
      });
    }

    const mascota = await Mascota.findByIdAndUpdate(
      req.params.id,
      datos,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!mascota) {
      return res.status(404).json(NO_ENCONTRADA);
    }

    res.json(mascota);
  } catch (error) {
    next(error);
  }
});

// Eliminar una mascota.
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json(NO_ENCONTRADA);
    }

    const mascota = await Mascota.findByIdAndDelete(req.params.id);

    if (!mascota) {
      return res.status(404).json(NO_ENCONTRADA);
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
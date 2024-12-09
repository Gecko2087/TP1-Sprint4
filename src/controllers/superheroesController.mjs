import mongoose from 'mongoose';
import {
  obtenerTodosLosSuperHeroes,
  insertarSuperHeroes,
  actualizarSuperHeroes,
  borrarSuperHeroePorId,
} from '../services/SuperHeroService.mjs';
import superHeroRepository from '../repositories/SuperHeroRepository.mjs';
import { validationResult } from 'express-validator';
import SuperHero from '../models/SuperHero.mjs';

const { ObjectId } = mongoose.Types;

// JSON
export async function obtenerTodosLosSuperHeroesController(req, res) {
  try {
    const superheroes = await obtenerTodosLosSuperHeroes();
    res.json(superheroes);
  } catch (error) {
    console.error('Error al obtener superhéroes:', error);
    res.status(500).send('Error interno del servidor');
  }
}

// Dashboard
export async function obtenerTodosLosSuperHeroesDashboardController(req, res) {
  try {
    const superheroes = await obtenerTodosLosSuperHeroes();
    res.render('dashboard', { superheroes, success_msg: req.flash('success_msg') });
  } catch (error) {
    console.error('Error al obtener superhéroes:', error);
    res.status(500).send('Error interno del servidor');
  }
}

// Insertar héroes
export async function insertarSuperHeroesController(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).render('addSuperhero', {
      errores: errores.array(),
      superheroe: req.body,
    });
  }

  const superheroData = {
    nombreSuperHeroe: req.body.nombreSuperHeroe,
    nombreReal: req.body.nombreReal,
    edad: req.body.edad,
    planetaOrigen: req.body.planetaOrigen,
    debilidad: req.body.debilidad,
    poderes: req.body.poderes.split(',').map(poder => poder.trim()),
    aliados: req.body.aliados.split(',').map(aliado => aliado.trim()),
    enemigos: req.body.enemigos.split(',').map(enemigo => enemigo.trim()),
  };

  try {
    await insertarSuperHeroes(superheroData);
    req.flash('success_msg', 'Superhéroe creado exitosamente');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al insertar superhéroe:', error);
    res.status(500).json({ error: 'Error al insertar el superhéroe' });
  }
}

// Editar héroes
export async function editarSuperHeroesController(req, res) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).render('editSuperhero', {
      errores: errores.array(),
      superheroe: req.body,
    });
  }

  const { id } = req.params;
  const superheroeData = {
    ...req.body,
    poderes: req.body.poderes.split(',').map(poder => poder.trim()),
    aliados: req.body.aliados.split(',').map(aliado => aliado.trim()),
    enemigos: req.body.enemigos.split(',').map(enemigo => enemigo.trim()),
  };

  try {
    const superheroe = await actualizarSuperHeroes(id, superheroeData);
    if (!superheroe) {
      return res.status(404).send({ error: 'Superhéroe no encontrado' });
    }
    req.flash('success_msg', 'Superhéroe actualizado exitosamente');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al actualizar superhéroe:', error);
    res.status(500).send({ error: 'Error al actualizar el superhéroe' });
  }
}

// Borrar héroes
export async function borrarSuperHeroePorIdController(req, res) {
  try {
    const { id } = req.params;
    const superheroe = await superHeroRepository.borrarPorId(id);

    if (!superheroe) {
      return res.status(404).json({ error: 'Superhéroe no encontrado' });
    }
    req.flash('success_msg', 'Superhéroe eliminado exitosamente');
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al borrar superhéroe:', error);
    res.status(500).json({ error: 'Error al borrar el superhéroe' });
  }
}

// Obtener superhéroe por ID
export const obtenerSuperHeroePorIdController = async (req, res) => {
  const superheroeId = req.params.id;

  if (!ObjectId.isValid(superheroeId)) {
    return res.status(400).send('ID no válido');
  }

  try {
    const superheroe = await SuperHero.findById(new ObjectId(superheroeId));
    if (!superheroe) {
      return res.status(404).send('Superhéroe no encontrado');
    }
    res.render('editSuperhero', { superheroe });
  } catch (error) {
    console.error('Error al obtener superhéroe:', error);
    res.status(500).send('Error al obtener el superhéroe');
  }
};

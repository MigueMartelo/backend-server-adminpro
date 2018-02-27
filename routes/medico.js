var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

// ================================
// Obtener todos los medicos
// ================================
app.get('/', (req, res, next) => {
	
	Medico.find({})
			.exec
			(
				(err, medicos) => {

					if(err){
						return res.status(500).json({
							ok: false,
							mensaje: 'Error cargando medicos',
							errors: err
						});
					}

					res.status(200).json({
						ok: true,
						medicos: medicos
					});
				}
			);
});

// ================================
// Actualizar Medicos
// ================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

	var body = req.body;
	var id = req.params.id;

	Medico.findById(id, (err, medico) => {
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar medico',
				errors: err
			});
		}

		if(!medico){
			return res.status(400).json({
				ok:false,
				mensaje: 'El medico buscado no existe',
				errors: { message: 'No existe un medico con ese ID'}
			})
		}

		medico.nombre = body.nombre;
		medico.usuario = req.usuario._id;
		medico.hospital = body.hospital;

		medico.save( (err, medicoGuardado) => {
			if(err){
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar médico',
					errors: err
				});
			}			

			res.status(200).json({
				ok: true,
				medico: medicoGuardado
			});
		});
	});
});

// ================================
// Crear nuevo medico
// ================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

	var body = req.body;

	var medico = new Medico({
		nombre: body.nombre,
		usuario: req.usuario._id,
		hospital: body.hospital
	});

	medico.save( (err, medicoGuardado) => {
		
		if(err){
			return res.status(400).json({
				ok: false,
				mensaje: 'Error al crear medico',
				errors: err
			});
		}

		res.status(201).json({
			ok: true,
			medico: medicoGuardado
		});
	});
});

// ================================
// Eliminar medico
// ================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

	var id = req.params.id;

	Medico.findByIdAndRemove(id, (err, medicoBorrado) =>{
		if(err){
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al borrar el medico',
				errors: err
			});
		}

		if(!medicoBorrado){
			return res.status(400).json({
				ok:false,
				mensaje: 'El medico buscado no existe',
				errors: { message: 'No existe un medico con ese ID'}
			})
		}

		res.status(200).json({
			ok: true,
			medico: medicoBorrado
		});
	});
});

module.exports = app;